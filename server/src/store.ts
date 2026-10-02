import { randomUUID } from "node:crypto";
import { db, ensureSchema } from "./db.js";

export interface TestRecord {
  id: string;
  owner_id: string;
  title: string;
  goal: string;
  status: "draft" | "active" | "closed";
  last_analysis_json: string | null;
  last_analyzed_at: string | null;
  created_at: string;
}

export interface CreativeRecord {
  id: string;
  test_id: string;
  label: string;
  image_url: string;
  caption: string;
  display_order: number;
  created_at: string;
}

export interface ViewerSessionRecord {
  id: string;
  test_id: string;
  started_at: string;
  completed_at: string | null;
  user_agent: string;
}

// --- tests ---------------------------------------------------------------

export async function createTest(ownerId: string, title: string, goal: string): Promise<TestRecord> {
  await ensureSchema();
  const id = randomUUID();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO tests (id, owner_id, title, goal, status, created_at) VALUES (?, ?, ?, ?, 'draft', ?)`,
    args: [id, ownerId, title, goal, now],
  });
  return (await getTest(id))!;
}

export async function listTestsForOwner(ownerId: string): Promise<TestRecord[]> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `SELECT * FROM tests WHERE owner_id = ? ORDER BY created_at DESC`,
    args: [ownerId],
  });
  return rs.rows as unknown as TestRecord[];
}

export async function getTest(id: string): Promise<TestRecord | undefined> {
  await ensureSchema();
  const rs = await db.execute({ sql: `SELECT * FROM tests WHERE id = ?`, args: [id] });
  return rs.rows[0] as unknown as TestRecord | undefined;
}

export interface UpdateTestInput {
  title?: string;
  goal?: string;
  status?: TestRecord["status"];
}

export async function updateTest(
  id: string,
  ownerId: string,
  patch: UpdateTestInput,
): Promise<TestRecord | undefined> {
  await ensureSchema();
  const sets: string[] = [];
  const args: string[] = [];
  if (patch.title !== undefined) {
    sets.push("title = ?");
    args.push(patch.title);
  }
  if (patch.goal !== undefined) {
    sets.push("goal = ?");
    args.push(patch.goal);
  }
  if (patch.status !== undefined) {
    sets.push("status = ?");
    args.push(patch.status);
  }
  if (sets.length === 0) return getTest(id);

  await db.execute({
    sql: `UPDATE tests SET ${sets.join(", ")} WHERE id = ? AND owner_id = ?`,
    args: [...args, id, ownerId],
  });
  return getTest(id);
}

export async function deleteTest(id: string, ownerId: string): Promise<void> {
  await ensureSchema();
  await db.execute({ sql: `DELETE FROM tests WHERE id = ? AND owner_id = ?`, args: [id, ownerId] });
}

/** Caches the AI verdict on the test row so results don't re-call the AI provider on every page view. */
export async function saveTestAnalysis(id: string, analysisJson: string): Promise<void> {
  await ensureSchema();
  await db.execute({
    sql: `UPDATE tests SET last_analysis_json = ?, last_analyzed_at = ? WHERE id = ?`,
    args: [analysisJson, new Date().toISOString(), id],
  });
}

// --- creatives -------------------------------------------------------------

export async function addCreative(
  testId: string,
  label: string,
  imageUrl: string,
  caption: string,
): Promise<CreativeRecord> {
  await ensureSchema();
  const id = randomUUID();
  const now = new Date().toISOString();
  const countRs = await db.execute({
    sql: `SELECT COUNT(*) as c FROM creatives WHERE test_id = ?`,
    args: [testId],
  });
  const order = Number((countRs.rows[0] as unknown as { c: number }).c);
  await db.execute({
    sql: `INSERT INTO creatives (id, test_id, label, image_url, caption, display_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, testId, label, imageUrl, caption, order, now],
  });
  return (await getCreative(id))!;
}

export async function getCreative(id: string): Promise<CreativeRecord | undefined> {
  await ensureSchema();
  const rs = await db.execute({ sql: `SELECT * FROM creatives WHERE id = ?`, args: [id] });
  return rs.rows[0] as unknown as CreativeRecord | undefined;
}

export async function listCreativesForTest(testId: string): Promise<CreativeRecord[]> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `SELECT * FROM creatives WHERE test_id = ? ORDER BY display_order ASC`,
    args: [testId],
  });
  return rs.rows as unknown as CreativeRecord[];
}

export async function deleteCreative(id: string, testId: string): Promise<void> {
  await ensureSchema();
  await db.execute({ sql: `DELETE FROM creatives WHERE id = ? AND test_id = ?`, args: [id, testId] });
}

// --- viewer sessions ---------------------------------------------------------

export async function createViewerSession(testId: string, userAgent: string): Promise<ViewerSessionRecord> {
  await ensureSchema();
  const id = randomUUID();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO viewer_sessions (id, test_id, started_at, completed_at, user_agent) VALUES (?, ?, ?, NULL, ?)`,
    args: [id, testId, now, userAgent.slice(0, 300)],
  });
  return (await getViewerSession(id))!;
}

export async function getViewerSession(id: string): Promise<ViewerSessionRecord | undefined> {
  await ensureSchema();
  const rs = await db.execute({ sql: `SELECT * FROM viewer_sessions WHERE id = ?`, args: [id] });
  return rs.rows[0] as unknown as ViewerSessionRecord | undefined;
}

export async function completeViewerSession(id: string): Promise<void> {
  await ensureSchema();
  await db.execute({
    sql: `UPDATE viewer_sessions SET completed_at = ? WHERE id = ?`,
    args: [new Date().toISOString(), id],
  });
}

export async function countCompletedSessions(testId: string): Promise<number> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `SELECT COUNT(*) as c FROM viewer_sessions WHERE test_id = ? AND completed_at IS NOT NULL`,
    args: [testId],
  });
  return Number((rs.rows[0] as unknown as { c: number }).c);
}

// --- reactions ---------------------------------------------------------------

export interface ReactionSampleInput {
  tMs: number;
  smile: number | null;
  browFurrow: number | null;
  surprise: number | null;
  attention: number | null;
}

/** Batched insert — the client buffers samples client-side and POSTs once per creative, never per-frame. */
export async function addReactionSamples(
  viewerSessionId: string,
  creativeId: string,
  samples: ReactionSampleInput[],
): Promise<void> {
  if (samples.length === 0) return;
  await ensureSchema();
  const now = new Date().toISOString();
  const statements = samples.map((s) => ({
    sql: `INSERT INTO reactions (id, viewer_session_id, creative_id, t_ms, smile, brow_furrow, surprise, attention, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [randomUUID(), viewerSessionId, creativeId, s.tMs, s.smile, s.browFurrow, s.surprise, s.attention, now],
  }));
  await db.batch(statements, "write");
}

export interface CreativeAggregate {
  creative_id: string;
  session_count: number;
  sample_count: number;
  avg_smile: number | null;
  avg_brow_furrow: number | null;
  avg_surprise: number | null;
  avg_attention: number | null;
}

/** One row per creative (even one with zero reactions yet) — never drops a creative just because nobody's reacted to it. */
export async function aggregateReactionsForTest(testId: string): Promise<CreativeAggregate[]> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `SELECT
            c.id as creative_id,
            COUNT(DISTINCT r.viewer_session_id) as session_count,
            COUNT(r.id) as sample_count,
            AVG(r.smile) as avg_smile,
            AVG(r.brow_furrow) as avg_brow_furrow,
            AVG(r.surprise) as avg_surprise,
            AVG(r.attention) as avg_attention
          FROM creatives c
          LEFT JOIN reactions r ON r.creative_id = c.id
          WHERE c.test_id = ?
          GROUP BY c.id
          ORDER BY c.display_order ASC`,
    args: [testId],
  });
  return rs.rows as unknown as CreativeAggregate[];
}

export interface TimeBucket {
  creative_id: string;
  bucket_ms: number;
  avg_smile: number | null;
  avg_brow_furrow: number | null;
  avg_attention: number | null;
}

/** Buckets reactions into fixed-width time windows (default 1s) for an "engagement over time" curve per creative. */
export async function timeBucketedReactions(testId: string, bucketMs = 1000): Promise<TimeBucket[]> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `SELECT
            r.creative_id as creative_id,
            CAST(r.t_ms / ? AS INTEGER) * ? as bucket_ms,
            AVG(r.smile) as avg_smile,
            AVG(r.brow_furrow) as avg_brow_furrow,
            AVG(r.attention) as avg_attention
          FROM reactions r
          JOIN creatives c ON c.id = r.creative_id
          WHERE c.test_id = ?
          GROUP BY r.creative_id, bucket_ms
          ORDER BY r.creative_id ASC, bucket_ms ASC`,
    args: [bucketMs, bucketMs, testId],
  });
  return rs.rows as unknown as TimeBucket[];
}
