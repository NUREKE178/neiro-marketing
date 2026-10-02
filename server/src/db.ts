import { createClient, Client } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Local dev / no-Turso-configured fallback: an embedded SQLite file. In
// production (Vercel), set TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN) to a
// remote Turso database for real persistence — serverless functions have a
// READ-ONLY filesystem except os.tmpdir(), so without Turso configured we
// fall back to /tmp (works, but is wiped on every cold start). This must
// never throw at module load: an uncaught exception here would crash every
// route, not just DB ones, before any try/catch in routes.ts can run.
function resolveLocalUrl(): string {
  try {
    const dataDir = process.env.VERCEL
      ? path.join(os.tmpdir(), "neiro-marketing-data")
      : path.join(__dirname, "..", "data");
    fs.mkdirSync(dataDir, { recursive: true });
    return `file:${path.join(dataDir, "neiro-marketing.sqlite")}`;
  } catch (err) {
    console.error("Local SQLite fallback path is not writable, using in-memory DB:", err);
    return ":memory:";
  }
}

// createClient() itself can throw synchronously (e.g. a malformed
// TURSO_DATABASE_URL) — deferring construction behind this Proxy means that
// only happens on first real use (inside ensureSchema(), called from a
// request handler), never at module import time. store.ts / routes.ts keep
// using `db.execute(...)` etc. unchanged; this is transparent to callers.
let client: Client | null = null;
let initError: unknown = null;

function getClient(): Client {
  if (client) return client;
  if (initError) throw initError;
  try {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || resolveLocalUrl(),
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return client;
  } catch (err) {
    initError = err;
    throw err;
  }
}

export const db: Client = new Proxy({} as Client, {
  get(_target, prop) {
    const c = getClient();
    const value = c[prop as keyof Client];
    return typeof value === "function" ? value.bind(c) : value;
  },
});

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS creators (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
    username TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    bio TEXT NOT NULL DEFAULT '',
    followers INTEGER,
    region TEXT,
    region_source TEXT NOT NULL DEFAULT 'unset',
    niche_tags TEXT NOT NULL DEFAULT '[]',
    search_blob TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT 'rapidapi_instagram',
    verification_status TEXT NOT NULL DEFAULT 'partially_verified',
    created_at TEXT NOT NULL,
    last_synced_at TEXT NOT NULL,
    last_sync_status TEXT NOT NULL DEFAULT 'ok',
    last_error TEXT,
    UNIQUE(platform, username)
  )`,
  `CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    url TEXT,
    thumbnail_url TEXT,
    caption TEXT NOT NULL DEFAULT '',
    views INTEGER,
    likes INTEGER,
    comments INTEGER,
    posted_at TEXT,
    fetched_at TEXT NOT NULL,
    UNIQUE(creator_id, external_id)
  )`,
  `CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
    external_account_id TEXT NOT NULL,
    username TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TEXT,
    scopes TEXT NOT NULL DEFAULT '[]',
    connected_at TEXT NOT NULL,
    last_sync_at TEXT,
    last_sync_status TEXT NOT NULL DEFAULT 'never_synced',
    last_error TEXT,
    UNIQUE(owner_id, platform)
  )`,
  // AI Content Studio: one row per generated/edited content idea. Scoped to
  // the same owner_id session cookie as `connections` (no accounts system).
  // `creator_id` is the own-account creator (via OAuth) this draft was
  // grounded on, if any — nullable because generation also works from a
  // bare topic with no connected account yet. `linked_video_id` lets a
  // "posted" draft point at the real video that followed it, so the UI can
  // show planned-vs-actual without inventing a metric of its own.
  `CREATE TABLE IF NOT EXISTS content_drafts (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
    creator_id TEXT REFERENCES creators(id) ON DELETE SET NULL,
    topic TEXT NOT NULL DEFAULT '',
    hook TEXT NOT NULL DEFAULT '',
    script TEXT NOT NULL DEFAULT '',
    caption TEXT NOT NULL DEFAULT '',
    hashtags TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'draft', 'scheduled', 'posted', 'archived')),
    scheduled_at TEXT,
    linked_video_id TEXT REFERENCES videos(id) ON DELETE SET NULL,
    ai_model TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_videos_creator ON videos(creator_id)`,
  `CREATE INDEX IF NOT EXISTS idx_videos_posted_at ON videos(posted_at)`,
  `CREATE INDEX IF NOT EXISTS idx_creators_region ON creators(region)`,
  `CREATE INDEX IF NOT EXISTS idx_creators_search ON creators(search_blob)`,
  `CREATE INDEX IF NOT EXISTS idx_connections_owner ON connections(owner_id)`,
  `CREATE INDEX IF NOT EXISTS idx_drafts_owner ON content_drafts(owner_id)`,
  `CREATE INDEX IF NOT EXISTS idx_drafts_status ON content_drafts(status)`,
];

// Columns added after the first release — existing local/Turso DBs created
// before this change won't have them. SQLite has no "ADD COLUMN IF NOT
// EXISTS", so this just tries each and swallows the "duplicate column"
// error on a DB that already has it.
const MIGRATION_STATEMENTS = [
  `ALTER TABLE creators ADD COLUMN source TEXT NOT NULL DEFAULT 'rapidapi_instagram'`,
  `ALTER TABLE creators ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'partially_verified'`,
  `ALTER TABLE creators ADD COLUMN last_sync_status TEXT NOT NULL DEFAULT 'ok'`,
  `ALTER TABLE creators ADD COLUMN last_error TEXT`,
];

let migrated: Promise<void> | null = null;

/** Runs schema migrations once per process (serverless: once per cold start). */
export function ensureSchema(): Promise<void> {
  if (!migrated) {
    migrated = (async () => {
      for (const stmt of SCHEMA_STATEMENTS) {
        await db.execute(stmt);
      }
      for (const stmt of MIGRATION_STATEMENTS) {
        try {
          await db.execute(stmt);
        } catch (err) {
          if (!(err instanceof Error) || !/duplicate column/i.test(err.message)) throw err;
        }
      }
    })();
  }
  return migrated;
}
