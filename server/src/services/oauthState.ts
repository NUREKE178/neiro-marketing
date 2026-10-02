import crypto from "node:crypto";
import { sign, verify } from "./sessionCookie.js";

const MAX_AGE_MS = 10 * 60 * 1000; // the user has 10 minutes to complete the provider's consent screen

/** Signed, stateless CSRF token for the OAuth redirect round-trip — no server-side storage needed. */
export function createOauthState(platform: string): string {
  const payload = `${platform}:${Date.now()}:${crypto.randomBytes(8).toString("hex")}`;
  return sign(payload);
}

export function verifyOauthState(platform: string, state: string): boolean {
  const payload = verify(state);
  if (!payload) return false;
  const [statePlatform, tsRaw] = payload.split(":");
  if (statePlatform !== platform) return false;
  const ts = Number(tsRaw);
  return Number.isFinite(ts) && Date.now() - ts < MAX_AGE_MS;
}
