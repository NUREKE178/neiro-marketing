import { test, afterEach, before, after } from "node:test";
import assert from "node:assert/strict";
import { AccountNotFoundError, ProviderNotConfiguredError, SchemaMappingError } from "../errors.js";

const originalFetch = globalThis.fetch;
const originalKey = process.env.RAPIDAPI_KEY;

before(() => {
  process.env.RAPIDAPI_KEY = "test-key";
});
after(() => {
  if (originalKey === undefined) delete process.env.RAPIDAPI_KEY;
  else process.env.RAPIDAPI_KEY = originalKey;
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockSequence(responses: { status: number; body: unknown }[]) {
  let i = 0;
  globalThis.fetch = (async () => {
    const r = responses[Math.min(i, responses.length - 1)];
    i += 1;
    return new Response(JSON.stringify(r.body), { status: r.status });
  }) as typeof fetch;
}

test("maps a well-formed profile+reels response into NormalizedProfile, no silent zeros", async () => {
  mockSequence([
    { status: 200, body: { data: { username: "nasa", full_name: "NASA", follower_count: 1000 } } },
    {
      status: 200,
      body: {
        data: [
          {
            media: {
              id: "123",
              code: "abc",
              caption: { text: "hello" },
              play_count: 5000,
              like_count: 300,
              // comment_count intentionally absent — must map to null, not 0
              taken_at: 1700000000,
            },
          },
        ],
      },
    },
  ]);

  const { rapidapiInstagramProvider } = await import("./rapidapi.js?t=" + Date.now());
  const profile = await rapidapiInstagramProvider.fetchProfile("nasa");

  assert.equal(profile.username, "nasa");
  assert.equal(profile.followers, 1000);
  assert.equal(profile.source, "rapidapi_instagram");
  assert.equal(profile.videos.length, 1);
  assert.equal(profile.videos[0].views, 5000);
  assert.equal(profile.videos[0].likes, 300);
  assert.equal(profile.videos[0].comments, null, "missing comment_count must stay null, not become 0");
});

test("throws SchemaMappingError when the profile response has no recognizable username field", async () => {
  mockSequence([
    { status: 200, body: { data: { something_unexpected: true } } },
    { status: 200, body: { data: [] } },
  ]);

  const { rapidapiInstagramProvider } = await import("./rapidapi.js?t=" + Date.now());
  await assert.rejects(() => rapidapiInstagramProvider.fetchProfile("ghost"), SchemaMappingError);
});

test("throws AccountNotFoundError when the response explicitly signals not-found", async () => {
  mockSequence([
    { status: 200, body: { error: "User not found" } },
    { status: 200, body: { data: [] } },
  ]);

  const { rapidapiInstagramProvider } = await import("./rapidapi.js?t=" + Date.now());
  await assert.rejects(() => rapidapiInstagramProvider.fetchProfile("doesnotexist"), AccountNotFoundError);
});

test("throws ProviderNotConfiguredError when RAPIDAPI_KEY is missing, not a crash", async () => {
  const saved = process.env.RAPIDAPI_KEY;
  delete process.env.RAPIDAPI_KEY;
  try {
    const { rapidapiInstagramProvider } = await import("./rapidapi.js?t=" + Date.now());
    await assert.rejects(() => rapidapiInstagramProvider.fetchProfile("nasa"), ProviderNotConfiguredError);
  } finally {
    process.env.RAPIDAPI_KEY = saved;
  }
});
