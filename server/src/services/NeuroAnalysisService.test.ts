import { test, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import { AiNotConfiguredError, AiRequestError, AiResponseError } from "./aiErrors.js";

const originalFetch = globalThis.fetch;
const originalKey = process.env.ANTHROPIC_API_KEY;

before(() => {
  process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
});
after(() => {
  if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY;
  else process.env.ANTHROPIC_API_KEY = originalKey;
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});

function freshModule() {
  return import("./NeuroAnalysisService.js?t=" + Date.now());
}

function mockFetchJson(status: number, body: unknown) {
  globalThis.fetch = (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;
}

const SAMPLE_PARAMS = {
  testTitle: "Банк жарнамасы",
  testGoal: "қай баннер көбірек басу тудырады",
  creatives: [
    {
      label: "A",
      caption: "Жылдам несие",
      sessionCount: 5,
      avgSmile: 0.6,
      avgBrowFurrow: 0.1,
      avgSurprise: 0.2,
      avgAttention: 0.8,
      peakMoments: ["ең жоғары smile 3-ші секундта"],
    },
    {
      label: "B",
      caption: "0% комиссия",
      sessionCount: 5,
      avgSmile: 0.2,
      avgBrowFurrow: 0.5,
      avgSurprise: 0.1,
      avgAttention: 0.5,
      peakMoments: [],
    },
  ],
};

const WELL_FORMED_VERDICT = {
  winnerLabel: "A",
  summary: "A креативі жақсырақ жұмыс істеді.",
  perCreativeNotes: [
    { label: "A", note: "Көрермендер көбірек күлді." },
    { label: "B", note: "Шатасу белгілері көп." },
  ],
  suggestion: "B креативінің мәтінін қысқартыңыз.",
};

test("throws AiNotConfiguredError when ANTHROPIC_API_KEY is missing, not a crash", async () => {
  const saved = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const { analyzeReactions } = await freshModule();
    await assert.rejects(() => analyzeReactions(SAMPLE_PARAMS), AiNotConfiguredError);
  } finally {
    process.env.ANTHROPIC_API_KEY = saved;
  }
});

test("maps a well-formed tool_use response into a NeuroVerdict", async () => {
  mockFetchJson(200, {
    content: [{ type: "tool_use", name: "submit_neuro_verdict", input: WELL_FORMED_VERDICT }],
  });

  const { analyzeReactions } = await freshModule();
  const { verdict, model } = await analyzeReactions(SAMPLE_PARAMS);

  assert.equal(verdict.winnerLabel, "A");
  assert.equal(verdict.perCreativeNotes.length, 2);
  assert.equal(verdict.perCreativeNotes[0].label, "A");
  assert.equal(typeof model, "string");
});

test("a null winnerLabel (not enough data yet) survives mapping, not coerced to a guess", async () => {
  mockFetchJson(200, {
    content: [{ type: "tool_use", input: { ...WELL_FORMED_VERDICT, winnerLabel: null } }],
  });
  const { analyzeReactions } = await freshModule();
  const { verdict } = await analyzeReactions(SAMPLE_PARAMS);
  assert.equal(verdict.winnerLabel, null);
});

test("throws AiRequestError on a non-2xx HTTP status", async () => {
  mockFetchJson(500, { error: "overloaded" });
  const { analyzeReactions } = await freshModule();
  await assert.rejects(() => analyzeReactions(SAMPLE_PARAMS), AiRequestError);
});

test("throws AiResponseError when the response has no tool_use block", async () => {
  mockFetchJson(200, { content: [{ type: "text", text: "no tool use" }] });
  const { analyzeReactions } = await freshModule();
  await assert.rejects(() => analyzeReactions(SAMPLE_PARAMS), AiResponseError);
});

test("throws AiResponseError when a perCreativeNotes entry is missing a required field", async () => {
  mockFetchJson(200, {
    content: [{ type: "tool_use", input: { ...WELL_FORMED_VERDICT, perCreativeNotes: [{ label: "A" }] } }],
  });
  const { analyzeReactions } = await freshModule();
  await assert.rejects(() => analyzeReactions(SAMPLE_PARAMS), AiResponseError);
});

test("the aggregated scores get folded into the outgoing prompt", async () => {
  const calls: { body: string }[] = [];
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    calls.push({ body: init.body as string });
    return new Response(JSON.stringify({ content: [{ type: "tool_use", input: WELL_FORMED_VERDICT }] }), {
      status: 200,
    });
  }) as typeof fetch;

  const { analyzeReactions } = await freshModule();
  await analyzeReactions(SAMPLE_PARAMS);

  assert.equal(calls.length, 1);
  const payload = JSON.parse(calls[0].body);
  const promptText = payload.messages[0].content as string;
  assert.match(promptText, /Жылдам несие/);
  assert.match(promptText, /0\.60/);
});
