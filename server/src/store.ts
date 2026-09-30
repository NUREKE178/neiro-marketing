import { randomUUID } from "node:crypto";
import { db, ensureSchema } from "./db.js";
import { NormalizedProfile } from "./providers/types.js";
import { buildSearchBlob, deriveNicheTags } from "./niche.js";
import { inferRegionFromText } from "./regions.js";

export interface CreatorRecord {
  id: string;
  platform: "instagram" | "tiktok";
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  followers: number;
  region: string | null;
  region_source: "unset" | "inferred" | "manual";
  niche_tags: string;
  created_at: string;
  last_synced_at: string;
}

export interface VideoRecord {
  id: string;
  creator_id: string;
  external_id: string;
  url: string | null;
  thumbnail_url: string | null;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  posted_at: string | null;
  fetched_at: string;
}

/** Upserts a freshly-fetched provider profile (+videos) into the DB. */
export async function upsertCreatorFromProfile(profile: NormalizedProfile): Promise<CreatorRecord> {
  await ensureSchema();
  const now = new Date().toISOString();

  const existing = await getCreator(profile.platform, profile.username);

  const nicheTags = deriveNicheTags(profile.videos.map((v) => v.caption));
  const inferredCity = existing?.region_source === "manual" ? null : inferRegionFromText(profile.bio);

  const id = existing?.id ?? randomUUID();
  const region = existing?.region_source === "manual" ? existing.region : (inferredCity?.name ?? existing?.region ?? null);
  const regionSource: CreatorRecord["region_source"] =
    existing?.region_source === "manual" ? "manual" : inferredCity ? "inferred" : "unset";
  const searchBlob = buildSearchBlob({
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    nicheTags,
    captions: profile.videos.map((v) => v.caption),
  });

  await db.execute({
    sql: `INSERT INTO creators (id, platform, username, display_name, avatar_url, bio, followers, region, region_source, niche_tags, search_blob, created_at, last_synced_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(platform, username) DO UPDATE SET
            display_name = excluded.display_name,
            avatar_url = excluded.avatar_url,
            bio = excluded.bio,
            followers = excluded.followers,
            region = excluded.region,
            region_source = excluded.region_source,
            niche_tags = excluded.niche_tags,
            search_blob = excluded.search_blob,
            last_synced_at = excluded.last_synced_at`,
    args: [
      id,
      profile.platform,
      profile.username,
      profile.displayName,
      profile.avatarUrl,
      profile.bio,
      profile.followers,
      region,
      regionSource,
      JSON.stringify(nicheTags),
      searchBlob,
      existing?.created_at ?? now,
      now,
    ],
  });

  const statements = profile.videos.map((v) => ({
    sql: `INSERT INTO videos (id, creator_id, external_id, url, thumbnail_url, caption, views, likes, comments, posted_at, fetched_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(creator_id, external_id) DO UPDATE SET
            url = excluded.url,
            thumbnail_url = excluded.thumbnail_url,
            caption = excluded.caption,
            views = excluded.views,
            likes = excluded.likes,
            comments = excluded.comments,
            posted_at = excluded.posted_at,
            fetched_at = excluded.fetched_at`,
    args: [
      randomUUID(),
      id,
      v.externalId,
      v.url,
      v.thumbnailUrl,
      v.caption,
      v.views,
      v.likes,
      v.comments,
      v.postedAt,
      now,
    ],
  }));

  if (statements.length > 0) {
    await db.batch(statements, "write");
  }

  return (await getCreatorById(id))!;
}

export async function getCreator(platform: string, username: string): Promise<CreatorRecord | undefined> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `SELECT * FROM creators WHERE platform = ? AND username = ?`,
    args: [platform, username],
  });
  return rs.rows[0] as unknown as CreatorRecord | undefined;
}

async function getCreatorById(id: string): Promise<CreatorRecord | undefined> {
  const rs = await db.execute({ sql: `SELECT * FROM creators WHERE id = ?`, args: [id] });
  return rs.rows[0] as unknown as CreatorRecord | undefined;
}

export async function getVideosForCreator(creatorId: string): Promise<VideoRecord[]> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `SELECT * FROM videos WHERE creator_id = ? ORDER BY views DESC`,
    args: [creatorId],
  });
  return rs.rows as unknown as VideoRecord[];
}

export async function setCreatorRegion(creatorId: string, region: string): Promise<CreatorRecord | undefined> {
  await ensureSchema();
  await db.execute({
    sql: `UPDATE creators SET region = ?, region_source = 'manual' WHERE id = ?`,
    args: [region, creatorId],
  });
  return getCreatorById(creatorId);
}

export interface SearchParams {
  keyword?: string;
  region?: string;
  platform?: string;
}

export async function searchCreators(
  params: SearchParams,
): Promise<(CreatorRecord & { total_views: number; total_likes: number })[]> {
  await ensureSchema();
  const clauses: string[] = [];
  const args: (string | number)[] = [];

  if (params.keyword) {
    clauses.push(`c.search_blob LIKE ?`);
    args.push(`%${params.keyword.trim().toLocaleLowerCase("ru")}%`);
  }
  if (params.region) {
    clauses.push(`c.region = ?`);
    args.push(params.region);
  }
  if (params.platform) {
    clauses.push(`c.platform = ?`);
    args.push(params.platform);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const rs = await db.execute({
    sql: `SELECT c.*, COALESCE(SUM(v.views), 0) AS total_views, COALESCE(SUM(v.likes), 0) AS total_likes
          FROM creators c
          LEFT JOIN videos v ON v.creator_id = c.id
          ${where}
          GROUP BY c.id
          ORDER BY total_views DESC`,
    args,
  });
  return rs.rows as unknown as (CreatorRecord & { total_views: number; total_likes: number })[];
}

export interface LeaderboardParams {
  platform?: string;
  region?: string;
  metric: "views" | "likes";
  fromIso: string;
  toIso: string;
  limit?: number;
}

export async function leaderboard(params: LeaderboardParams) {
  await ensureSchema();
  const clauses: string[] = ["v.posted_at IS NOT NULL", "v.posted_at BETWEEN ? AND ?"];
  const args: (string | number)[] = [params.fromIso, params.toIso];

  if (params.platform) {
    clauses.push(`c.platform = ?`);
    args.push(params.platform);
  }
  if (params.region) {
    clauses.push(`c.region = ?`);
    args.push(params.region);
  }

  const orderCol = params.metric === "likes" ? "period_likes" : "period_views";
  args.push(params.limit ?? 5);

  const rs = await db.execute({
    sql: `SELECT c.*,
                 COALESCE(SUM(v.views), 0) AS period_views,
                 COALESCE(SUM(v.likes), 0) AS period_likes,
                 COALESCE(SUM(v.comments), 0) AS period_comments,
                 COUNT(v.id) AS period_video_count
          FROM creators c
          JOIN videos v ON v.creator_id = c.id
          WHERE ${clauses.join(" AND ")}
          GROUP BY c.id
          ORDER BY ${orderCol} DESC
          LIMIT ?`,
    args,
  });
  return rs.rows;
}

export async function distinctRegions(): Promise<string[]> {
  await ensureSchema();
  const rs = await db.execute(
    `SELECT DISTINCT region FROM creators WHERE region IS NOT NULL ORDER BY region`,
  );
  return (rs.rows as unknown as { region: string }[]).map((r) => r.region);
}
