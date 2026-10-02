import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { fetchProviderJson, numOrNull, readPath } from "./httpClient.js";
import { ProviderAuthError, ProviderRateLimitError, ProviderRequestError, ProviderServerError } from "./errors.js";

const originalFetch = globalThis.fetch;

function mockFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), { status, headers })) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("fetchProviderJson: 200 returns the parsed body", async () => {
  mockFetch(200, { hello: "world" });
  const body = await fetchProviderJson("instagram", "https://example.test/x", {});
  assert.deepEqual(body, { hello: "world" });
});

test("fetchProviderJson: 401 throws ProviderAuthError, never silently returns {}", async () => {
  mockFetch(401, { message: "bad key" });
  await assert.rejects(
    () => fetchProviderJson("instagram", "https://example.test/x", {}),
    ProviderAuthError,
  );
});

test("fetchProviderJson: 403 also throws ProviderAuthError", async () => {
  mockFetch(403, {});
  await assert.rejects(
    () => fetchProviderJson("tiktok", "https://example.test/x", {}),
    ProviderAuthError,
  );
});

test("fetchProviderJson: 429 throws ProviderRateLimitError, distinct from a generic failure", async () => {
  mockFetch(429, {}, { "retry-after": "30" });
  await assert.rejects(
    () => fetchProviderJson("instagram", "https://example.test/x", {}),
    ProviderRateLimitError,
  );
});

test("fetchProviderJson: 503 throws ProviderServerError (their server, not ours)", async () => {
  mockFetch(503, {});
  await assert.rejects(
    () => fetchProviderJson("instagram", "https://example.test/x", {}),
    ProviderServerError,
  );
});

test("fetchProviderJson: other 4xx throws the generic ProviderRequestError", async () => {
  mockFetch(418, {});
  await assert.rejects(
    () => fetchProviderJson("instagram", "https://example.test/x", {}),
    ProviderRequestError,
  );
});

test("numOrNull: undefined/null become null, never 0", () => {
  assert.equal(numOrNull(undefined), null);
  assert.equal(numOrNull(null), null);
});

test("numOrNull: an actual 0 stays 0", () => {
  assert.equal(numOrNull(0), 0);
});

test("numOrNull: numeric strings coerce, non-numeric stay null", () => {
  assert.equal(numOrNull("42"), 42);
  assert.equal(numOrNull("not a number"), null);
});

test("readPath: reads nested dotted paths without throwing on a missing branch", () => {
  assert.equal(readPath({ a: { b: { c: 7 } } }, "a.b.c"), 7);
  assert.equal(readPath({ a: {} }, "a.b.c"), undefined);
  assert.equal(readPath(undefined, "a.b.c"), undefined);
});
