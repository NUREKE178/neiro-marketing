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

// NEIRO Neuromarketing Lab: a marketer creates a `test` with 2+ `creatives`
// (ad variants), a viewer opens the public /watch link and has their
// in-browser (never-leaves-device) facial-action-unit signal sampled while
// looking at each creative in turn, producing `reactions` rows the marketer
// can aggregate into a real engagement comparison instead of a guess.
const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    goal TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
    last_analysis_json TEXT,
    last_analyzed_at TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS creatives (
    id TEXT PRIMARY KEY,
    test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL,
    caption TEXT NOT NULL DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  // One row per real person's single pass through a test's creatives. No
  // login — a viewer needs no account, just an anonymous id the client
  // generates so its own batched reaction POSTs group together.
  `CREATE TABLE IF NOT EXISTS viewer_sessions (
    id TEXT PRIMARY KEY,
    test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    user_agent TEXT NOT NULL DEFAULT ''
  )`,
  // Time-bucketed (not per-frame) samples of facial-action-unit-derived
  // scores, 0..1, captured client-side from MediaPipe FaceLandmarker
  // blendshapes — never raw video/images, which never leave the viewer's
  // device. `smile`/`brow_furrow`/`surprise` are FACS-grounded engagement
  // proxies (not a clinical "emotion reading"); `attention` is a
  // face-detected-and-eyes-open proxy, not a gaze tracker.
  `CREATE TABLE IF NOT EXISTS reactions (
    id TEXT PRIMARY KEY,
    viewer_session_id TEXT NOT NULL REFERENCES viewer_sessions(id) ON DELETE CASCADE,
    creative_id TEXT NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
    t_ms INTEGER NOT NULL,
    smile REAL,
    brow_furrow REAL,
    surprise REAL,
    attention REAL,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_tests_owner ON tests(owner_id)`,
  `CREATE INDEX IF NOT EXISTS idx_creatives_test ON creatives(test_id)`,
  `CREATE INDEX IF NOT EXISTS idx_viewer_sessions_test ON viewer_sessions(test_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reactions_session ON reactions(viewer_session_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reactions_creative ON reactions(creative_id)`,
];

let migrated: Promise<void> | null = null;

/** Runs schema migrations once per process (serverless: once per cold start). */
export function ensureSchema(): Promise<void> {
  if (!migrated) {
    migrated = (async () => {
      for (const stmt of SCHEMA_STATEMENTS) {
        await db.execute(stmt);
      }
    })();
  }
  return migrated;
}
