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

test("maps the confirmed-live 'Basic User + Posts' vendor shape (combined single-call mode)", async () => {
  // Trimmed from an actual response captured 2026-10-02 against a real
  // subscribed RapidAPI product — profile is under user_data, posts under
  // user_posts[].node.media_dict, and this endpoint reports NO engagement
  // numbers at all (confirmed real limitation of this specific endpoint,
  // not a mapping bug): views/likes/comments must all come out null.
  const realShapeBody = {
    user_data: {
      pk: "528817151",
      full_name: "NASA",
      username: "nasa",
      is_verified: true,
      profile_pic_url: "https://example.test/avatar.jpg",
      follower_count: 104287753,
      following_count: 89,
      media_count: 4939,
      is_private: false,
    },
    user_posts: [
      {
        node: {
          media_dict: {
            code: "DdHyaYAifb6",
            image_versions2: { candidates: [{ url: "https://example.test/thumb.jpg" }] },
            id: "3983374110243288826_528817151",
          },
        },
      },
    ],
  };
  mockSequence([{ status: 200, body: realShapeBody }]);

  const saved = { profile: process.env.RAPIDAPI_INSTAGRAM_PROFILE_PATH, posts: process.env.RAPIDAPI_INSTAGRAM_POSTS_PATH };
  process.env.RAPIDAPI_INSTAGRAM_PROFILE_PATH = "/basic-user-posts";
  process.env.RAPIDAPI_INSTAGRAM_POSTS_PATH = "/basic-user-posts";
  try {
    const { rapidapiInstagramProvider } = await import("./rapidapi.js?t=" + Date.now());
    const profile = await rapidapiInstagramProvider.fetchProfile("nasa");

    assert.equal(profile.username, "nasa");
    assert.equal(profile.displayName, "NASA");
    assert.equal(profile.followers, 104287753);
    assert.equal(profile.avatarUrl, "https://example.test/avatar.jpg");
    assert.equal(profile.videos.length, 1);
    assert.equal(profile.videos[0].url, "https://www.instagram.com/reel/DdHyaYAifb6/");
    assert.equal(profile.videos[0].thumbnailUrl, "https://example.test/thumb.jpg");
    assert.equal(profile.videos[0].views, null, "this endpoint genuinely has no view count — must stay null");
    assert.equal(profile.videos[0].likes, null);
  } finally {
    if (saved.profile === undefined) delete process.env.RAPIDAPI_INSTAGRAM_PROFILE_PATH;
    else process.env.RAPIDAPI_INSTAGRAM_PROFILE_PATH = saved.profile;
    if (saved.posts === undefined) delete process.env.RAPIDAPI_INSTAGRAM_POSTS_PATH;
    else process.env.RAPIDAPI_INSTAGRAM_POSTS_PATH = saved.posts;
  }
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
