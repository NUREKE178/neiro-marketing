import { Router, Request, Response } from "express";
import { getOrCreateOwnerId, isSessionConfigured } from "../services/sessionCookie.js";
import {
  AiNotConfiguredError,
  AiRequestError,
  AiResponseError,
  analyzeReactions,
  CreativeSummary,
} from "../services/NeuroAnalysisService.js";
import {
  addCreative,
  addReactionSamples,
  aggregateReactionsForTest,
  completeViewerSession,
  createTest,
  createViewerSession,
  deleteCreative,
  deleteTest,
  getCreative,
  getTest,
  getViewerSession,
  listCreativesForTest,
  listTestsForOwner,
  ReactionSampleInput,
  saveTestAnalysis,
  TestRecord,
  timeBucketedReactions,
  updateTest,
} from "../store.js";

export const testsRouter = Router();

/** 503 "session not configured" short-circuit for every marketer-facing (owner-scoped) route below. */
function requireOwnerId(req: Request, res: Response): string | null {
  if (!isSessionConfigured()) {
    res.status(503).json({ error: "session теңшелмеген (SESSION_SECRET жоқ)", code: "SESSION_NOT_CONFIGURED" });
    return null;
  }
  const ownerId = getOrCreateOwnerId(req, res);
  if (!ownerId) {
    res.status(503).json({ error: "session теңшелмеген", code: "SESSION_NOT_CONFIGURED" });
    return null;
  }
  return ownerId;
}

/** Loads the test and checks it belongs to ownerId — 404 if missing, 403 if someone else's. */
async function requireOwnedTest(req: Request, res: Response, ownerId: string): Promise<TestRecord | null> {
  const test = await getTest(req.params.id);
  if (!test) {
    res.status(404).json({ error: "тест табылмады", code: "TEST_NOT_FOUND" });
    return null;
  }
  if (test.owner_id !== ownerId) {
    res.status(403).json({ error: "бұл тест сізге тиесілі емес", code: "FORBIDDEN" });
    return null;
  }
  return test;
}

// --- marketer: tests CRUD ---------------------------------------------------

testsRouter.post("/", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const { title, goal } = req.body as { title?: string; goal?: string };
    if (!title || !title.trim()) return res.status(400).json({ error: "title (тест атауы) керек" });
    const test = await createTest(ownerId, title.trim(), (goal ?? "").trim());
    res.status(201).json({ test });
  } catch (err) {
    next(err);
  }
});

testsRouter.get("/", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const tests = await listTestsForOwner(ownerId);
    res.json({ tests });
  } catch (err) {
    next(err);
  }
});

// Public — the /watch viewer page needs the test + its creatives with no auth at all.
testsRouter.get("/:id", async (req, res, next) => {
  try {
    const test = await getTest(req.params.id);
    if (!test) return res.status(404).json({ error: "тест табылмады", code: "TEST_NOT_FOUND" });
    const creatives = await listCreativesForTest(test.id);
    res.json({ test, creatives });
  } catch (err) {
    next(err);
  }
});

testsRouter.patch("/:id", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    if (!(await requireOwnedTest(req, res, ownerId))) return;

    const { title, goal, status } = req.body as { title?: string; goal?: string; status?: TestRecord["status"] };
    const test = await updateTest(req.params.id, ownerId, { title, goal, status });
    res.json({ test });
  } catch (err) {
    next(err);
  }
});

testsRouter.delete("/:id", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    if (!(await requireOwnedTest(req, res, ownerId))) return;
    await deleteTest(req.params.id, ownerId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --- marketer: creatives -----------------------------------------------------

testsRouter.post("/:id/creatives", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    if (!(await requireOwnedTest(req, res, ownerId))) return;

    const { label, imageUrl, caption } = req.body as { label?: string; imageUrl?: string; caption?: string };
    if (!imageUrl || !imageUrl.trim()) return res.status(400).json({ error: "imageUrl керек" });
    const creative = await addCreative(req.params.id, (label ?? "").trim(), imageUrl.trim(), (caption ?? "").trim());
    res.status(201).json({ creative });
  } catch (err) {
    next(err);
  }
});

testsRouter.delete("/:id/creatives/:creativeId", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    if (!(await requireOwnedTest(req, res, ownerId))) return;
    await deleteCreative(req.params.creativeId, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --- viewer (public, no auth): sessions + reactions ---------------------------

testsRouter.post("/:id/sessions", async (req, res, next) => {
  try {
    const test = await getTest(req.params.id);
    if (!test) return res.status(404).json({ error: "тест табылмады", code: "TEST_NOT_FOUND" });
    const session = await createViewerSession(test.id, req.get("user-agent") ?? "");
    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
});

testsRouter.post("/:id/sessions/:sessionId/reactions", async (req, res, next) => {
  try {
    const session = await getViewerSession(req.params.sessionId);
    if (!session || session.test_id !== req.params.id) {
      return res.status(404).json({ error: "viewer session табылмады", code: "SESSION_NOT_FOUND" });
    }
    const { creativeId, samples } = req.body as { creativeId?: string; samples?: ReactionSampleInput[] };
    if (!creativeId) return res.status(400).json({ error: "creativeId керек" });
    const creative = await getCreative(creativeId);
    if (!creative || creative.test_id !== req.params.id) {
      return res.status(404).json({ error: "creative табылмады", code: "CREATIVE_NOT_FOUND" });
    }
    if (!Array.isArray(samples)) return res.status(400).json({ error: "samples массив болуы керек" });

    await addReactionSamples(session.id, creativeId, samples.slice(0, 500));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

testsRouter.post("/:id/sessions/:sessionId/complete", async (req, res, next) => {
  try {
    const session = await getViewerSession(req.params.sessionId);
    if (!session || session.test_id !== req.params.id) {
      return res.status(404).json({ error: "viewer session табылмады", code: "SESSION_NOT_FOUND" });
    }
    await completeViewerSession(session.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --- marketer: results + AI analysis ------------------------------------------

testsRouter.get("/:id/results", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    if (!(await requireOwnedTest(req, res, ownerId))) return;

    const creatives = await listCreativesForTest(req.params.id);
    const aggregates = await aggregateReactionsForTest(req.params.id);
    const timeBuckets = await timeBucketedReactions(req.params.id);
    res.json({ creatives, aggregates, timeBuckets });
  } catch (err) {
    next(err);
  }
});

/** Finds the bucket with the strongest brow-furrow (confusion) or smile spike, for a human-readable "at second N" note. */
function describePeakMoments(
  creativeId: string,
  buckets: { creative_id: string; bucket_ms: number; avg_smile: number | null; avg_brow_furrow: number | null }[],
): string[] {
  const own = buckets.filter((b) => b.creative_id === creativeId);
  const notes: string[] = [];

  const peakSmile = own.reduce<{ ms: number; v: number } | null>((best, b) => {
    if (b.avg_smile === null) return best;
    return !best || b.avg_smile > best.v ? { ms: b.bucket_ms, v: b.avg_smile } : best;
  }, null);
  if (peakSmile && peakSmile.v > 0.3) {
    notes.push(`ең жоғары smile ${Math.round(peakSmile.ms / 1000)}-ші секундта (${peakSmile.v.toFixed(2)})`);
  }

  const peakFurrow = own.reduce<{ ms: number; v: number } | null>((best, b) => {
    if (b.avg_brow_furrow === null) return best;
    return !best || b.avg_brow_furrow > best.v ? { ms: b.bucket_ms, v: b.avg_brow_furrow } : best;
  }, null);
  if (peakFurrow && peakFurrow.v > 0.3) {
    notes.push(`ең жоғары brow_furrow ${Math.round(peakFurrow.ms / 1000)}-ші секундта (${peakFurrow.v.toFixed(2)})`);
  }

  return notes;
}

testsRouter.post("/:id/analyze", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const test = await requireOwnedTest(req, res, ownerId);
    if (!test) return;

    const creatives = await listCreativesForTest(test.id);
    if (creatives.length < 2) {
      return res.status(400).json({ error: "талдау үшін кемінде 2 creative керек", code: "NOT_ENOUGH_CREATIVES" });
    }
    const aggregates = await aggregateReactionsForTest(test.id);
    const timeBuckets = await timeBucketedReactions(test.id);

    const summaries: CreativeSummary[] = creatives.map((c) => {
      const agg = aggregates.find((a) => a.creative_id === c.id);
      return {
        label: c.label || c.id.slice(0, 6),
        caption: c.caption,
        sessionCount: agg?.session_count ?? 0,
        avgSmile: agg?.avg_smile ?? null,
        avgBrowFurrow: agg?.avg_brow_furrow ?? null,
        avgSurprise: agg?.avg_surprise ?? null,
        avgAttention: agg?.avg_attention ?? null,
        peakMoments: describePeakMoments(c.id, timeBuckets),
      };
    });

    const { verdict, model } = await analyzeReactions({ testTitle: test.title, testGoal: test.goal, creatives: summaries });
    await saveTestAnalysis(test.id, JSON.stringify({ verdict, model, analyzedAt: new Date().toISOString() }));
    res.json({ verdict, model });
  } catch (err) {
    if (err instanceof AiNotConfiguredError || err instanceof AiRequestError || err instanceof AiResponseError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    next(err);
  }
});
