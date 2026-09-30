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

router.get("/regions", (_req, res) => {
  res.json({ cities: KZ_CITIES, usedRegions: distinctRegions() });
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
    const creator = upsertCreatorFromProfile(profile);
    const videos = getVideosForCreator(creator.id);
    res.json({ creator, videos });
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) {
      return res.status(503).json({ error: err.message, code: "PROVIDER_NOT_CONFIGURED" });
    }
    if (err instanceof ProviderRequestError) {
      return res.status(502).json({ error: err.message, code: "PROVIDER_REQUEST_FAILED" });
    }
    console.error(err);
    res.status(500).json({ error: "Күтпеген қате орын алды." });
  }
});

router.get("/creators/:platform/:username", (req, res) => {
  const { platform, username } = req.params;
  if (!isPlatform(platform)) return res.status(400).json({ error: "invalid platform" });

  const creator = getCreator(platform, username.toLowerCase());
  if (!creator) return res.status(404).json({ error: "Бұл аккаунт әлі талданбаған." });

  res.json({ creator, videos: getVideosForCreator(creator.id) });
});

router.patch("/creators/:id/region", (req, res) => {
  const { region } = req.body as { region?: string };
  if (!region) return res.status(400).json({ error: "region қажет" });

  const city = findCityByIdOrName(region);
  const updated = setCreatorRegion(req.params.id, city?.name ?? region);
  if (!updated) return res.status(404).json({ error: "creator табылмады" });
  res.json({ creator: updated });
});

router.get("/search", (req, res) => {
  const { keyword, region, platform } = req.query as Record<string, string | undefined>;
  const results = searchCreators({ keyword, region, platform });
  res.json({ results });
});

router.get("/leaderboard", (req, res) => {
  const { platform, region, metric, days, from, to } = req.query as Record<string, string | undefined>;

  const toIso = to ? new Date(to).toISOString() : new Date().toISOString();
  const fromIso = from
    ? new Date(from).toISOString()
    : new Date(Date.now() - Number(days ?? 7) * 24 * 60 * 60 * 1000).toISOString();

  const results = leaderboard({
    platform,
    region,
    metric: metric === "likes" ? "likes" : "views",
    fromIso,
    toIso,
    limit: 5,
  });

  res.json({ results, range: { from: fromIso, to: toIso } });
});
