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
  return import("./AIGenerationService.js?t=" + Date.now());
}

function mockFetchJson(status: number, body: unknown) {
  globalThis.fetch = (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;
}

function mockFetchCapture(status: number, body: unknown): { calls: { url: string; init: RequestInit }[] } {
  const calls: { url: string; init: RequestInit }[] = [];
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
  return { calls };
}

const WELL_FORMED_IDEA = {
  hook: "Сен мұны білмейсің!",
  script: "1) hook 2) body 3) CTA",
  caption: "Қызық фактілер жинағы",
  hashtags: ["kz", "fact", "viral"],
};

test("throws AiNotConfiguredError when ANTHROPIC_API_KEY is missing, not a crash", async () => {
  const saved = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const { generateContentIdeas } = await freshModule();
    await assert.rejects(
      () => generateContentIdeas({ platform: "instagram", topic: "киім" }),
      AiNotConfiguredError,
    );
  } finally {
    process.env.ANTHROPIC_API_KEY = saved;
  }
});

test("maps a well-formed tool_use response into exactly 3 ideas", async () => {
  mockFetchJson(200, {
    content: [
      { type: "text", text: "ok" },
      {
        type: "tool_use",
        name: "submit_content_ideas",
        input: { ideas: [WELL_FORMED_IDEA, WELL_FORMED_IDEA, WELL_FORMED_IDEA] },
      },
    ],
  });

  const { generateContentIdeas } = await freshModule();
  const { ideas, model } = await generateContentIdeas({ platform: "tiktok", topic: "аспаздық" });

  assert.equal(ideas.length, 3);
  assert.equal(ideas[0].hook, WELL_FORMED_IDEA.hook);
  assert.deepEqual(ideas[0].hashtags, WELL_FORMED_IDEA.hashtags);
  assert.equal(typeof model, "string");
});

test("missing hashtags on an idea become an empty array, never a crash", async () => {
  mockFetchJson(200, {
    content: [
      {
        type: "tool_use",
        input: { ideas: [{ hook: "h", script: "s", caption: "c" }] },
      },
    ],
  });
  const { generateContentIdeas } = await freshModule();
  const { ideas } = await generateContentIdeas({ platform: "instagram", topic: "спорт" });
  assert.deepEqual(ideas[0].hashtags, []);
});

test("throws AiRequestError on a non-2xx HTTP status", async () => {
  mockFetchJson(500, { error: "overloaded" });
  const { generateContentIdeas } = await freshModule();
  await assert.rejects(
    () => generateContentIdeas({ platform: "instagram", topic: "саяхат" }),
    AiRequestError,
  );
});

test("throws AiResponseError when the response has no tool_use block", async () => {
  mockFetchJson(200, { content: [{ type: "text", text: "no tool use here" }] });
  const { generateContentIdeas } = await freshModule();
  await assert.rejects(
    () => generateContentIdeas({ platform: "instagram", topic: "саяхат" }),
    AiResponseError,
  );
});

test("throws AiResponseError when an idea is missing a required field, instead of guessing", async () => {
  mockFetchJson(200, {
    content: [{ type: "tool_use", input: { ideas: [{ hook: "h", caption: "c" }] } }],
  });
  const { generateContentIdeas } = await freshModule();
  await assert.rejects(
    () => generateContentIdeas({ platform: "instagram", topic: "саяхат" }),
    AiResponseError,
  );
});

test("own-account video context gets folded into the outgoing prompt when provided", async () => {
  const { calls } = mockFetchCapture(200, {
    content: [{ type: "tool_use", input: { ideas: [WELL_FORMED_IDEA, WELL_FORMED_IDEA, WELL_FORMED_IDEA] } }],
  });
  const { generateContentIdeas } = await freshModule();
  await generateContentIdeas({
    platform: "instagram",
    topic: "саяхат",
    context: [{ caption: "Алматыдағы ең әдемі жерлер", views: 50000, likes: 3000 }],
  });

  assert.equal(calls.length, 1);
  const payload = JSON.parse(calls[0].init.body as string);
  const promptText = payload.messages[0].content as string;
  assert.match(promptText, /Алматыдағы ең әдемі жерлер/);
  assert.match(promptText, /50000/);
});
