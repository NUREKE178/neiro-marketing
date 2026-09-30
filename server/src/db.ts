import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "neiro-marketing.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  username TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT NOT NULL DEFAULT '',
  followers INTEGER NOT NULL DEFAULT 0,
  region TEXT,
  region_source TEXT NOT NULL DEFAULT 'unset',
  niche_tags TEXT NOT NULL DEFAULT '[]',
  search_blob TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  last_synced_at TEXT NOT NULL,
  UNIQUE(platform, username)
);

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  url TEXT,
  thumbnail_url TEXT,
  caption TEXT NOT NULL DEFAULT '',
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  posted_at TEXT,
  fetched_at TEXT NOT NULL,
  UNIQUE(creator_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_videos_creator ON videos(creator_id);
CREATE INDEX IF NOT EXISTS idx_videos_posted_at ON videos(posted_at);
CREATE INDEX IF NOT EXISTS idx_creators_region ON creators(region);
CREATE INDEX IF NOT EXISTS idx_creators_search ON creators(search_blob);
`);
