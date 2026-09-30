import { randomUUID } from "node:crypto";
import { db } from "./db.js";
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

/** Upserts a freshly-fetched provider profile (+videos) into the local DB. */
export function upsertCreatorFromProfile(profile: NormalizedProfile): CreatorRecord {
  const now = new Date().toISOString();
  const existing = db
    .prepare<[string, string], CreatorRecord>(
      `SELECT * FROM creators WHERE platform = ? AND username = ?`,
    )
    .get(profile.platform, profile.username);

  const nicheTags = deriveNicheTags(profile.videos.map((v) => v.caption));
  const inferredCity = existing?.region_source === "manual" ? null : inferRegionFromText(profile.bio);

  const id = existing?.id ?? randomUUID();
  const region = existing?.region_source === "manual" ? existing.region : (inferredCity?.name ?? existing?.region ?? null);
  const regionSource: CreatorRecord["region_source"] =
    existing?.region_source === "manual" ? "manual" : inferredCity ? "inferred" : "unset";

  db.prepare(
    `INSERT INTO creators (id, platform, username, display_name, avatar_url, bio, followers, region, region_source, niche_tags, search_blob, created_at, last_synced_at)
     VALUES (@id, @platform, @username, @displayName, @avatarUrl, @bio, @followers, @region, @regionSource, @nicheTags, @searchBlob, @createdAt, @lastSyncedAt)
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
  ).run({
    id,
    platform: profile.platform,
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    followers: profile.followers,
    region,
    regionSource,
    nicheTags: JSON.stringify(nicheTags),
    searchBlob: buildSearchBlob({
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      nicheTags,
      captions: profile.videos.map((v) => v.caption),
    }),
    createdAt: existing?.created_at ?? now,
    lastSyncedAt: now,
  });

  const insertVideo = db.prepare(
    `INSERT INTO videos (id, creator_id, external_id, url, thumbnail_url, caption, views, likes, comments, posted_at, fetched_at)
     VALUES (@id, @creatorId, @externalId, @url, @thumbnailUrl, @caption, @views, @likes, @comments, @postedAt, @fetchedAt)
     ON CONFLICT(creator_id, external_id) DO UPDATE SET
       url = excluded.url,
       thumbnail_url = excluded.thumbnail_url,
       caption = excluded.caption,
       views = excluded.views,
       likes = excluded.likes,
       comments = excluded.comments,
       posted_at = excluded.posted_at,
       fetched_at = excluded.fetched_at`,
  );

  const insertMany = db.transaction((videos: NormalizedProfile["videos"]) => {
    for (const v of videos) {
      insertVideo.run({
        id: randomUUID(),
        creatorId: id,
        externalId: v.externalId,
        url: v.url,
        thumbnailUrl: v.thumbnailUrl,
        caption: v.caption,
        views: v.views,
        likes: v.likes,
        comments: v.comments,
        postedAt: v.postedAt,
        fetchedAt: now,
      });
    }
  });
  insertMany(profile.videos);

  return db
    .prepare<[string], CreatorRecord>(`SELECT * FROM creators WHERE id = ?`)
    .get(id)!;
}

export function getCreator(platform: string, username: string): CreatorRecord | undefined {
  return db
    .prepare<[string, string], CreatorRecord>(
      `SELECT * FROM creators WHERE platform = ? AND username = ?`,
    )
    .get(platform, username);
}

export function getVideosForCreator(creatorId: string): VideoRecord[] {
  return db
    .prepare<[string], VideoRecord>(
      `SELECT * FROM videos WHERE creator_id = ? ORDER BY views DESC`,
    )
    .all(creatorId);
}

export function setCreatorRegion(creatorId: string, region: string): CreatorRecord | undefined {
  db.prepare(
    `UPDATE creators SET region = ?, region_source = 'manual' WHERE id = ?`,
  ).run(region, creatorId);
  return db.prepare<[string], CreatorRecord>(`SELECT * FROM creators WHERE id = ?`).get(creatorId);
}

export interface SearchParams {
  keyword?: string;
  region?: string;
  platform?: string;
}

export function searchCreators(params: SearchParams): (CreatorRecord & { total_views: number; total_likes: number })[] {
  const clauses: string[] = [];
  const args: Record<string, unknown> = {};

  if (params.keyword) {
    clauses.push(`c.search_blob LIKE @keyword`);
    args.keyword = `%${params.keyword.trim().toLocaleLowerCase("ru")}%`;
  }
  if (params.region) {
    clauses.push(`c.region = @region`);
    args.region = params.region;
  }
  if (params.platform) {
    clauses.push(`c.platform = @platform`);
    args.platform = params.platform;
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  return db
    .prepare(
      `SELECT c.*, COALESCE(SUM(v.views), 0) AS total_views, COALESCE(SUM(v.likes), 0) AS total_likes
       FROM creators c
       LEFT JOIN videos v ON v.creator_id = c.id
       ${where}
       GROUP BY c.id
       ORDER BY total_views DESC`,
    )
    .all(args) as (CreatorRecord & { total_views: number; total_likes: number })[];
}

export interface LeaderboardParams {
  platform?: string;
  region?: string;
  metric: "views" | "likes";
  fromIso: string;
  toIso: string;
  limit?: number;
}

export function leaderboard(params: LeaderboardParams) {
  const clauses: string[] = ["v.posted_at IS NOT NULL", "v.posted_at BETWEEN @from AND @to"];
  const args: Record<string, unknown> = { from: params.fromIso, to: params.toIso, limit: params.limit ?? 5 };

  if (params.platform) {
    clauses.push(`c.platform = @platform`);
    args.platform = params.platform;
  }
  if (params.region) {
    clauses.push(`c.region = @region`);
    args.region = params.region;
  }

  const metricCol = params.metric === "likes" ? "v.likes" : "v.views";

  return db
    .prepare(
      `SELECT c.*,
              COALESCE(SUM(v.views), 0) AS period_views,
              COALESCE(SUM(v.likes), 0) AS period_likes,
              COALESCE(SUM(v.comments), 0) AS period_comments,
              COUNT(v.id) AS period_video_count,
              MAX(${metricCol}) AS top_video_metric
       FROM creators c
       JOIN videos v ON v.creator_id = c.id
       WHERE ${clauses.join(" AND ")}
       GROUP BY c.id
       ORDER BY ${params.metric === "likes" ? "period_likes" : "period_views"} DESC
       LIMIT @limit`,
    )
    .all(args);
}

export function distinctRegions(): string[] {
  const rows = db
    .prepare<[], { region: string }>(`SELECT DISTINCT region FROM creators WHERE region IS NOT NULL ORDER BY region`)
    .all();
  return rows.map((r) => r.region);
}
