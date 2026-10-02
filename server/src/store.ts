import { randomUUID } from "node:crypto";
import { db, ensureSchema } from "./db.js";
import { DataSource, NormalizedProfile, VerificationStatus, verificationStatusForSource } from "./providers/types.js";
import { buildSearchBlob, deriveNicheTags } from "./niche.js";
import { inferRegionFromText } from "./regions.js";

export interface CreatorRecord {
  id: string;
  platform: "instagram" | "tiktok";
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  /** null = provider didn't report a follower count, never coerced to 0. */
  followers: number | null;
  region: string | null;
  region_source: "unset" | "inferred" | "manual";
  niche_tags: string;
  source: DataSource;
  verification_status: VerificationStatus;
  created_at: string;
  last_synced_at: string;
  last_sync_status: "ok" | "failed";
  last_error: string | null;
}

export interface VideoRecord {
  id: string;
  creator_id: string;
  external_id: string;
  url: string | null;
  thumbnail_url: string | null;
  caption: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
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
  const verificationStatus = verificationStatusForSource(profile.source);

  await db.execute({
    sql: `INSERT INTO creators (id, platform, username, display_name, avatar_url, bio, followers, region, region_source, niche_tags, search_blob, source, verification_status, created_at, last_synced_at, last_sync_status, last_error)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ok', NULL)
          ON CONFLICT(platform, username) DO UPDATE SET
            display_name = excluded.display_name,
            avatar_url = excluded.avatar_url,
            bio = excluded.bio,
            followers = excluded.followers,
            region = excluded.region,
            region_source = excluded.region_source,
            niche_tags = excluded.niche_tags,
            search_blob = excluded.search_blob,
            source = excluded.source,
            verification_status = excluded.verification_status,
            last_synced_at = excluded.last_synced_at,
            last_sync_status = 'ok',
            last_error = NULL`,
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
      profile.source,
      verificationStatus,
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

/**
 * Records that a resync attempt failed, WITHOUT touching the creator's
 * existing (still-displayable) data — so the UI can show "last synced 3
 * days ago, last attempt failed" instead of either silently serving stale
 * data as fresh, or wiping it because of a transient failure.
 */
export async function recordSyncFailure(
  platform: string,
  username: string,
  errorMessage: string,
): Promise<void> {
  await ensureSchema();
  await db.execute({
    sql: `UPDATE creators SET last_sync_status = 'failed', last_error = ? WHERE platform = ? AND username = ?`,
    args: [errorMessage.slice(0, 500), platform, username],
  });
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

export interface ConnectionRecord {
  id: string;
  owner_id: string;
  platform: "instagram" | "tiktok";
  external_account_id: string;
  username: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  scopes: string;
  connected_at: string;
  last_sync_at: string | null;
  last_sync_status: "never_synced" | "ok" | "failed";
  last_error: string | null;
}

export interface SaveConnectionInput {
  ownerId: string;
  platform: "instagram" | "tiktok";
  externalAccountId: string;
  username: string;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: string | null;
  scopes: string[];
}

export async function saveConnection(input: SaveConnectionInput): Promise<ConnectionRecord> {
  await ensureSchema();
  const now = new Date().toISOString();
  const existing = await getConnection(input.ownerId, input.platform);
  const id = existing?.id ?? randomUUID();

  await db.execute({
    sql: `INSERT INTO connections (id, owner_id, platform, external_account_id, username, access_token, refresh_token, token_expires_at, scopes, connected_at, last_sync_at, last_sync_status, last_error)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'never_synced', NULL)
          ON CONFLICT(owner_id, platform) DO UPDATE SET
            external_account_id = excluded.external_account_id,
            username = excluded.username,
            access_token = excluded.access_token,
            refresh_token = excluded.refresh_token,
            token_expires_at = excluded.token_expires_at,
            scopes = excluded.scopes,
            connected_at = excluded.connected_at,
            last_sync_status = 'never_synced',
            last_error = NULL`,
    args: [
      id,
      input.ownerId,
      input.platform,
      input.externalAccountId,
      input.username,
      input.accessToken,
      input.refreshToken,
      input.tokenExpiresAt,
      JSON.stringify(input.scopes),
      now,
    ],
  });

  return (await getConnection(input.ownerId, input.platform))!;
}

export async function getConnection(
  ownerId: string,
  platform: string,
): Promise<ConnectionRecord | undefined> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `SELECT * FROM connections WHERE owner_id = ? AND platform = ?`,
    args: [ownerId, platform],
  });
  return rs.rows[0] as unknown as ConnectionRecord | undefined;
}

export async function deleteConnection(ownerId: string, platform: string): Promise<void> {
  await ensureSchema();
  await db.execute({
    sql: `DELETE FROM connections WHERE owner_id = ? AND platform = ?`,
    args: [ownerId, platform],
  });
}

export async function recordConnectionSync(
  ownerId: string,
  platform: string,
  status: "ok" | "failed",
  error: string | null,
): Promise<void> {
  await ensureSchema();
  await db.execute({
    sql: `UPDATE connections SET last_sync_at = ?, last_sync_status = ?, last_error = ? WHERE owner_id = ? AND platform = ?`,
    args: [new Date().toISOString(), status, error?.slice(0, 500) ?? null, ownerId, platform],
  });
}

export async function distinctRegions(): Promise<string[]> {
  await ensureSchema();
  const rs = await db.execute(
    `SELECT DISTINCT region FROM creators WHERE region IS NOT NULL ORDER BY region`,
  );
  return (rs.rows as unknown as { region: string }[]).map((r) => r.region);
}
