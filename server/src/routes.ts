import { Router } from "express";
import { rapidapiInstagramProvider } from "./providers/instagram/rapidapi.js";
import { rapidapiTiktokProvider } from "./providers/tiktok/rapidapi.js";
import { extractUsername, Platform } from "./providers/types.js";
import {
  AccountNotFoundError,
  ProviderAuthError,
  ProviderNotConfiguredError,
  ProviderRateLimitError,
  ProviderRequestError,
  ProviderServerError,
  SchemaMappingError,
} from "./providers/errors.js";
import {
  distinctRegions,
  getCreator,
  getVideosForCreator,
  leaderboard,
  recordSyncFailure,
  searchCreators,
  setCreatorRegion,
  upsertCreatorFromProfile,
} from "./store.js";
import { computeAccountStats } from "./services/AnalyticsService.js";
import { findCityByIdOrName, KZ_CITIES, nearestCity } from "./regions.js";
import { isInstagramOAuthConfigured } from "./providers/instagram/oauth.js";
import { isTiktokOAuthConfigured } from "./providers/tiktok/oauth.js";
import { isSessionConfigured } from "./services/sessionCookie.js";
import { isAiConfigured } from "./services/AIGenerationService.js";

export const router = Router();

const providers = {
  instagram: rapidapiInstagramProvider,
  tiktok: rapidapiTiktokProvider,
} as const;

function isPlatform(value: unknown): value is Platform {
  return value === "instagram" || value === "tiktok";
}

router.get("/config/status", (_req, res) => {
  const rapidApiReady = Boolean(process.env.RAPIDAPI_KEY);
  res.json({
    instagramConfigured: rapidApiReady,
    tiktokConfigured: rapidApiReady,
    instagramOAuthConfigured: isSessionConfigured() && isInstagramOAuthConfigured(),
    tiktokOAuthConfigured: isSessionConfigured() && isTiktokOAuthConfigured(),
    aiConfigured: isSessionConfigured() && isAiConfigured(),
  });
});

router.get("/regions", async (_req, res, next) => {
  try {
    res.json({ cities: KZ_CITIES, usedRegions: await distinctRegions() });
  } catch (err) {
    next(err);
  }
});

router.post("/geolocate", (req, res) => {
  const { lat, lng } = req.body as { lat?: number; lng?: number };
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "lat/lng сандары қажет" });
  }
  res.json({ city: nearestCity(lat, lng) });
});

/**
 * Every branch here maps to one of the UI's real states (brief section 7):
 * Verified/Partially verified comes from the stored verification_status;
 * Authorization required -> ProviderAuthError; Data unavailable ->
 * AccountNotFoundError; Sync failed -> a provider error with existing
 * cached data to fall back to; Connection expired is handled in the OAuth
 * routes. Nothing here invents a number that wasn't actually returned.
 */
router.post("/creators/analyze", async (req, res) => {
  const { platform, handle } = req.body as { platform?: string; handle?: string };

  if (!isPlatform(platform)) {
    return res.status(400).json({ error: "platform 'instagram' немесе 'tiktok' болуы керек" });
  }
  if (!handle || !handle.trim()) {
    return res.status(400).json({ error: "handle (аккаунт аты немесе сілтеме) бос болмауы керек" });
  }

  const username = extractUsername(platform, handle);

  try {
    // A verified (OAuth-authorized) record is only ever refreshed through
    // Settings -> Resync, by the account owner. A routine RapidAPI
    // re-analyze must never silently downgrade it back to
    // "partially_verified" — that would quietly throw away a stronger
    // guarantee the user already has.
    const existing = await getCreator(platform, username);
    if (existing?.verification_status === "verified") {
      const videos = await getVideosForCreator(existing.id);
      return res.json({ creator: existing, videos, stats: computeAccountStats(videos) });
    }

    const profile = await providers[platform].fetchProfile(username);
    const creator = await upsertCreatorFromProfile(profile);
    const videos = await getVideosForCreator(creator.id);
    res.json({ creator, videos, stats: computeAccountStats(profile.videos) });
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    if (err instanceof AccountNotFoundError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }

    // Everything past this point is a real provider/schema failure. If we
    // have a previously-synced copy of this account, degrade to it with a
    // visible "sync failed" flag instead of either hiding the failure or
    // discarding good cached data over a transient error.
    if (
      err instanceof ProviderAuthError ||
      err instanceof ProviderRateLimitError ||
      err instanceof ProviderServerError ||
      err instanceof ProviderRequestError ||
      err instanceof SchemaMappingError
    ) {
      await recordSyncFailure(platform, username, err.message).catch(() => {});
      const cached = await getCreator(platform, username);
      if (cached) {
        const videos = await getVideosForCreator(cached.id);
        return res.json({
          creator: cached,
          videos,
          stats: computeAccountStats(videos),
          syncError: { code: err.code, message: err.message },
        });
      }
      return res.status(err.status).json({ error: err.message, code: err.code });
    }

    console.error(err);
    res.status(500).json({
      error: "Күтпеген қате орын алды.",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

router.get("/creators/:platform/:username", async (req, res, next) => {
  try {
    const { platform, username } = req.params;
    if (!isPlatform(platform)) return res.status(400).json({ error: "invalid platform" });

    const creator = await getCreator(platform, username.toLowerCase());
    if (!creator) return res.status(404).json({ error: "Бұл аккаунт әлі талданбаған." });

    res.json({ creator, videos: await getVideosForCreator(creator.id) });
  } catch (err) {
    next(err);
  }
});

router.patch("/creators/:id/region", async (req, res, next) => {
  try {
    const { region } = req.body as { region?: string };
    if (!region) return res.status(400).json({ error: "region қажет" });

    const city = findCityByIdOrName(region);
    const updated = await setCreatorRegion(req.params.id, city?.name ?? region);
    if (!updated) return res.status(404).json({ error: "creator табылмады" });
    res.json({ creator: updated });
  } catch (err) {
    next(err);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const { keyword, region, platform } = req.query as Record<string, string | undefined>;
    const results = await searchCreators({ keyword, region, platform });
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

router.get("/leaderboard", async (req, res, next) => {
  try {
    const { platform, region, metric, days, from, to } = req.query as Record<string, string | undefined>;

    const toIso = to ? new Date(to).toISOString() : new Date().toISOString();
    const fromIso = from
      ? new Date(from).toISOString()
      : new Date(Date.now() - Number(days ?? 7) * 24 * 60 * 60 * 1000).toISOString();

    const results = await leaderboard({
      platform,
      region,
      metric: metric === "likes" ? "likes" : "views",
      fromIso,
      toIso,
      limit: 5,
    });

    res.json({ results, range: { from: fromIso, to: toIso } });
  } catch (err) {
    next(err);
  }
});
