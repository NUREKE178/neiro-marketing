import crypto from "node:crypto";
import type { Request, Response } from "express";

// A stateless, HMAC-signed cookie identifying "this browser" — not a full
// user-accounts system. There's no login/password; the OAuth "connect your
// own account" flow attaches to whichever browser completed it. No server
// session store is needed (works the same in a single Vercel invocation or
// across many), which matters because Vercel functions don't share memory.
const COOKIE_NAME = "neiro_sid";
const SECRET = process.env.SESSION_SECRET;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365;

export function isSessionConfigured(): boolean {
  return Boolean(SECRET);
}

/** Generic HMAC sign/verify over SESSION_SECRET — also used for OAuth CSRF state tokens (see oauthState.ts). */
export function sign(value: string): string {
  const sig = crypto.createHmac("sha256", SECRET!).update(value).digest("base64url");
  return `${value}.${sig}`;
}

export function verify(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET!).update(value).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return null;
  return crypto.timingSafeEqual(sigBuf, expectedBuf) ? value : null;
}

/**
 * Returns the current browser's owner id, creating + setting the cookie if
 * this is a new visitor. Returns null if SESSION_SECRET isn't configured —
 * callers treat that as "authorized-import isn't available", matching how
 * a missing RAPIDAPI_KEY is handled, never a crash.
 */
export function getOrCreateOwnerId(req: Request, res: Response): string | null {
  if (!SECRET) return null;

  const raw = (req as Request & { cookies?: Record<string, string> }).cookies?.[COOKIE_NAME];
  const verified = raw ? verify(raw) : null;
  if (verified) return verified;

  const ownerId = crypto.randomUUID();
  res.cookie(COOKIE_NAME, sign(ownerId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_MS,
  });
  return ownerId;
}
