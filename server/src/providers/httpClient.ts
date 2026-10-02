import {
  ProviderAuthError,
  ProviderRateLimitError,
  ProviderRequestError,
  ProviderServerError,
} from "./errors.js";
import { Platform } from "./types.js";

/**
 * Fetches JSON and classifies any non-2xx by status code, per the brief:
 * 401/403 -> auth problem, 429 -> rate limit, 5xx -> their server, anything
 * else -> generic request failure. Never swallows the distinction into a
 * single generic error.
 */
export async function fetchProviderJson(
  platform: Platform,
  url: string,
  headers: Record<string, string>,
): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await fetch(url, { headers });
  } catch (err) {
    throw new ProviderRequestError(platform, 0, err instanceof Error ? err.message : "network error");
  }

  if (res.status === 401 || res.status === 403) {
    throw new ProviderAuthError(platform, res.status);
  }
  if (res.status === 429) {
    throw new ProviderRateLimitError(platform, res.headers.get("retry-after") ?? undefined);
  }
  if (res.status >= 500) {
    throw new ProviderServerError(platform, res.status);
  }
  if (!res.ok) {
    let detail: string | undefined;
    try {
      detail = await res.text();
    } catch {
      // ignore — detail is best-effort
    }
    throw new ProviderRequestError(platform, res.status, detail?.slice(0, 300));
  }

  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    throw new ProviderRequestError(platform, res.status, "жауап JSON емес");
  }
}

/** Reads a nested path (e.g. "data.user.username") without throwing on a missing intermediate key. */
export function readPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/** number|null — a genuinely-missing field stays null, never silently becomes 0. */
export function numOrNull(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
