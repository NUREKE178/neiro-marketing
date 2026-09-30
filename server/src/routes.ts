import { Router } from "express";
import { rapidapiInstagramProvider } from "./providers/rapidapiInstagram.js";
import { rapidapiTiktokProvider } from "./providers/rapidapiTiktok.js";
import { extractUsername, Platform, ProviderNotConfiguredError, ProviderRequestError } from "./providers/types.js";
import {
  distinctRegions,
  getCreator,
  getVideosForCreator,
  leaderboard,
  searchCreators,
  setCreatorRegion,
  upsertCreatorFromProfile,
} from "./store.js";
import { findCityByIdOrName, KZ_CITIES, nearestCity } from "./regions.js";

export const router = Router();

const providers = {
  instagram: rapidapiInstagramProvider,
  tiktok: rapidapiTiktokProvider,
} as const;

function isPlatform(value: unknown): value is Platform {
  return value === "instagram" || value === "tiktok";
}

router.get("/config/status", (_req, res) => {
  res.json({
    instagramConfigured: Boolean(process.env.RAPIDAPI_KEY),
    tiktokConfigured: Boolean(process.env.RAPIDAPI_KEY),
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
    const profile = await providers[platform].fetchProfile(username);
    const creator = await upsertCreatorFromProfile(profile);
    const videos = await getVideosForCreator(creator.id);
    res.json({ creator, videos });
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) {
      return res.status(503).json({ error: err.message, code: "PROVIDER_NOT_CONFIGURED" });
    }
    if (err instanceof ProviderRequestError) {
      return res.status(502).json({ error: err.message, code: "PROVIDER_REQUEST_FAILED" });
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
