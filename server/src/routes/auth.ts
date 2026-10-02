import { Router } from "express";
import { NormalizedProfile, Platform } from "../providers/types.js";
import * as instagramOAuth from "../providers/instagram/oauth.js";
import * as tiktokOAuth from "../providers/tiktok/oauth.js";
import { getOrCreateOwnerId, isSessionConfigured } from "../services/sessionCookie.js";
import { createOauthState, verifyOauthState } from "../services/oauthState.js";
import {
  disconnectAccount,
  getConnectionStatus,
  getDecryptedConnection,
  recordImportResult,
  saveAuthorizedConnection,
} from "../services/AuthorizedDataImport.js";
import { upsertCreatorFromProfile } from "../store.js";

export const authRouter = Router();

const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL;

function isPlatform(value: unknown): value is Platform {
  return value === "instagram" || value === "tiktok";
}

function isOAuthReady(platform: Platform): boolean {
  if (!isSessionConfigured() || !PUBLIC_APP_URL) return false;
  return platform === "instagram" ? instagramOAuth.isInstagramOAuthConfigured() : tiktokOAuth.isTiktokOAuthConfigured();
}

function redirectUriFor(platform: Platform): string {
  return `${PUBLIC_APP_URL}/api/auth/${platform}/callback`;
}

function settingsUrl(query: Record<string, string>): string {
  const qs = new URLSearchParams(query).toString();
  return `${PUBLIC_APP_URL}/settings?${qs}`;
}

authRouter.get("/:platform/status", async (req, res, next) => {
  try {
    const { platform } = req.params;
    if (!isPlatform(platform)) return res.status(400).json({ error: "invalid platform" });

    if (!isSessionConfigured()) {
      return res.json({ configured: false, reason: "SESSION_SECRET теңшелмеген" });
    }
    const ownerId = getOrCreateOwnerId(req, res);
    if (!ownerId) return res.json({ configured: false });

    const oauthReady = isOAuthReady(platform);
    const status = await getConnectionStatus(ownerId, platform);
    res.json({ configured: oauthReady, ...status });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/:platform/start", async (req, res) => {
  const { platform } = req.params;
  if (!isPlatform(platform)) return res.status(400).json({ error: "invalid platform" });

  if (!isOAuthReady(platform)) {
    return res.status(503).json({
      error: `${platform} OAuth теңшелмеген — INSTAGRAM_CLIENT_ID/TIKTOK_CLIENT_KEY, тиісті SECRET, SESSION_SECRET және PUBLIC_APP_URL env vars қажет.`,
      code: "OAUTH_NOT_CONFIGURED",
    });
  }

  const ownerId = getOrCreateOwnerId(req, res);
  if (!ownerId) return res.status(503).json({ error: "session теңшелмеген", code: "SESSION_NOT_CONFIGURED" });

  const state = createOauthState(platform);
  const redirectUri = redirectUriFor(platform);
  const authUrl =
    platform === "instagram"
      ? instagramOAuth.getAuthorizationUrl(redirectUri, state)
      : tiktokOAuth.getAuthorizationUrl(redirectUri, state);

  res.redirect(authUrl);
});

authRouter.get("/:platform/callback", async (req, res) => {
  const { platform } = req.params;
  const { code, state, error: providerError } = req.query as Record<string, string | undefined>;

  if (!isPlatform(platform)) return res.status(400).send("invalid platform");
  if (!PUBLIC_APP_URL) return res.status(503).send("PUBLIC_APP_URL теңшелмеген");

  if (providerError) {
    return res.redirect(settingsUrl({ error: "access_denied", platform }));
  }
  if (!code || !state || !verifyOauthState(platform, state)) {
    return res.redirect(settingsUrl({ error: "invalid_state", platform }));
  }

  const ownerId = getOrCreateOwnerId(req, res);
  if (!ownerId) return res.redirect(settingsUrl({ error: "session_not_configured", platform }));

  try {
    const redirectUri = redirectUriFor(platform);
    let profile: NormalizedProfile;

    if (platform === "instagram") {
      const token = await instagramOAuth.exchangeCodeForToken(code, redirectUri);
      profile = await instagramOAuth.fetchOwnProfile(token.accessToken);
      await saveAuthorizedConnection({
        ownerId,
        platform,
        externalAccountId: token.userId,
        username: profile.username,
        accessToken: token.accessToken,
        refreshToken: null,
        expiresAt: token.expiresAt,
        scopes: ["instagram_business_basic"],
      });
    } else {
      const token = await tiktokOAuth.exchangeCodeForToken(code, redirectUri);
      profile = await tiktokOAuth.fetchOwnProfile(token.accessToken);
      await saveAuthorizedConnection({
        ownerId,
        platform,
        externalAccountId: token.openId,
        username: profile.username,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresAt: token.expiresAt,
        scopes: ["user.info.basic", "video.list"],
      });
    }

    await upsertCreatorFromProfile(profile);
    await recordImportResult(ownerId, platform, "ok", null);
    res.redirect(settingsUrl({ connected: platform }));
  } catch (err) {
    await recordImportResult(ownerId, platform, "failed", err instanceof Error ? err.message : String(err)).catch(
      () => {},
    );
    console.error(err);
    res.redirect(settingsUrl({ error: "connect_failed", platform }));
  }
});

authRouter.post("/:platform/resync", async (req, res, next) => {
  try {
    const { platform } = req.params;
    if (!isPlatform(platform)) return res.status(400).json({ error: "invalid platform" });
    if (!isSessionConfigured()) return res.status(503).json({ error: "session теңшелмеген" });

    const ownerId = getOrCreateOwnerId(req, res);
    if (!ownerId) return res.status(503).json({ error: "session теңшелмеген" });

    const connection = await getDecryptedConnection(ownerId, platform);
    if (!connection) return res.status(404).json({ error: "байланыс табылмады", code: "NOT_CONNECTED" });

    try {
      const profile =
        platform === "instagram"
          ? await instagramOAuth.fetchOwnProfile(connection.accessToken)
          : await tiktokOAuth.fetchOwnProfile(connection.accessToken);
      const creator = await upsertCreatorFromProfile(profile);
      await recordImportResult(ownerId, platform, "ok", null);
      res.json({ creator });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await recordImportResult(ownerId, platform, "failed", message);
      res.status(502).json({ error: message, code: "SYNC_FAILED" });
    }
  } catch (err) {
    next(err);
  }
});

authRouter.post("/:platform/disconnect", async (req, res, next) => {
  try {
    const { platform } = req.params;
    if (!isPlatform(platform)) return res.status(400).json({ error: "invalid platform" });
    if (!isSessionConfigured()) return res.status(503).json({ error: "session теңшелмеген" });

    const ownerId = getOrCreateOwnerId(req, res);
    if (!ownerId) return res.status(503).json({ error: "session теңшелмеген" });

    await disconnectAccount(ownerId, platform);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
