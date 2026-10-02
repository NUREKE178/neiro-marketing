import crypto from "node:crypto";

// AES-256-GCM encryption for OAuth access/refresh tokens at rest. The key is
// derived from SESSION_SECRET (scrypt) so there's one secret to configure,
// not two. Without it, OAuth connect simply isn't available — same pattern
// as RAPIDAPI_KEY: a missing secret is a clean "not configured" state, not
// a crash (see callers in AuthorizedDataImport.ts).
const SECRET = process.env.SESSION_SECRET;

function deriveKey(): Buffer {
  if (!SECRET) throw new Error("SESSION_SECRET is not set");
  return crypto.scryptSync(SECRET, "neiro-token-crypto", 32);
}

export function isTokenCryptoConfigured(): boolean {
  return Boolean(SECRET);
}

export function encryptToken(plaintext: string): string {
  const key = deriveKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64url"), authTag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptToken(stored: string): string {
  const key = deriveKey();
  const [ivB64, tagB64, dataB64] = stored.split(".");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("malformed encrypted token");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64url")), decipher.final()]).toString("utf8");
}
