import {
  ConnectionRecord,
  deleteConnection,
  getConnection,
  recordConnectionSync,
  saveConnection,
} from "../store.js";
import { decryptToken, encryptToken, isTokenCryptoConfigured } from "./tokenCrypto.js";
import { Platform } from "../providers/types.js";

/**
 * The only module that touches OAuth access/refresh tokens in plaintext.
 * Everything else — routes, the Settings UI, store.ts's raw rows — only
 * ever sees encrypted tokens or the safe status view below. This is what
 * the brief calls AuthorizedDataImport: importing data the user explicitly
 * authorized via their own OAuth grant, as opposed to the RapidAPI
 * providers reading public pages without the account owner's involvement.
 */

export interface ConnectInput {
  ownerId: string;
  platform: Platform;
  externalAccountId: string;
  username: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
  scopes: string[];
}

export async function saveAuthorizedConnection(input: ConnectInput): Promise<void> {
  if (!isTokenCryptoConfigured()) {
    throw new Error("SESSION_SECRET теңшелмеген — токенді қауіпсіз сақтау мүмкін емес.");
  }
  await saveConnection({
    ownerId: input.ownerId,
    platform: input.platform,
    externalAccountId: input.externalAccountId,
    username: input.username,
    accessToken: encryptToken(input.accessToken),
    refreshToken: input.refreshToken ? encryptToken(input.refreshToken) : null,
    tokenExpiresAt: input.expiresAt,
    scopes: input.scopes,
  });
}

/** For internal use only (calling the official API on the user's behalf) — never send this object to the client. */
export async function getDecryptedConnection(
  ownerId: string,
  platform: Platform,
): Promise<{ record: ConnectionRecord; accessToken: string; refreshToken: string | null } | null> {
  const record = await getConnection(ownerId, platform);
  if (!record) return null;
  return {
    record,
    accessToken: decryptToken(record.access_token),
    refreshToken: record.refresh_token ? decryptToken(record.refresh_token) : null,
  };
}

export type ConnectionStatus =
  | { connected: false }
  | {
      connected: true;
      username: string;
      scopes: string[];
      connectedAt: string;
      lastSyncAt: string | null;
      lastSyncStatus: "never_synced" | "ok" | "failed";
      lastError: string | null;
      tokenExpired: boolean;
    };

/** Safe for the client — metadata only, never the tokens themselves. */
export async function getConnectionStatus(ownerId: string, platform: Platform): Promise<ConnectionStatus> {
  const record = await getConnection(ownerId, platform);
  if (!record) return { connected: false };

  const tokenExpired = Boolean(record.token_expires_at && new Date(record.token_expires_at) < new Date());

  return {
    connected: true,
    username: record.username,
    scopes: JSON.parse(record.scopes || "[]"),
    connectedAt: record.connected_at,
    lastSyncAt: record.last_sync_at,
    lastSyncStatus: record.last_sync_status,
    lastError: record.last_error,
    tokenExpired,
  };
}

export async function disconnectAccount(ownerId: string, platform: Platform): Promise<void> {
  await deleteConnection(ownerId, platform);
}

export async function recordImportResult(
  ownerId: string,
  platform: Platform,
  status: "ok" | "failed",
  error: string | null,
): Promise<void> {
  await recordConnectionSync(ownerId, platform, status, error);
}
