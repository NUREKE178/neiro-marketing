# NEIRO — server

Express + TypeScript + SQLite (better-sqlite3) backend. No mock data: every number shown in the app comes from a live RapidAPI call, normalized and cached in `server/data/neiro-marketing.sqlite`.

## Dev

```bash
npm install
cp .env.example .env   # then fill in RAPIDAPI_KEY
npm run dev
```

Runs on `http://localhost:8093`.

## Getting a RapidAPI key (required — there is no demo mode)

Instagram and TikTok don't publish an official API for reading an arbitrary public account's view/like stats. This app uses third‑party scraper APIs listed on [RapidAPI](https://rapidapi.com):

1. Create a RapidAPI account.
2. Subscribe to an Instagram scraper API (search "Instagram Scraper" — there's a free tier on most of them) and a TikTok scraper API (search "TikTok Scraper").
3. Copy your `X-RapidAPI-Key` (it's the same key across every API you subscribe to on your account) into `server/.env` as `RAPIDAPI_KEY`.
4. Each product has its own **host** (e.g. `some-api.p.rapidapi.com`). If it differs from the defaults in `.env.example`, set `RAPIDAPI_INSTAGRAM_HOST` / `RAPIDAPI_TIKTOK_HOST`.

## ⚠️ Verify the response mapping before trusting the numbers

`src/providers/rapidapiInstagram.ts` and `src/providers/rapidapiTiktok.ts` each have a clearly marked **"Response mapping"** section (`mapProfile` / `mapVideos`). They're written against the response shape that's most common across RapidAPI Instagram/TikTok scraper products (`v1/info` + `v1/reels` for Instagram; `user/info` + `user/posts` for TikTok), but this sandbox's network egress blocks `rapidapi.com`, so **the mapping was never checked against a live response**.

Before relying on this in production:

1. Subscribe to your chosen API and open its **Playground** tab on RapidAPI.
2. Call it once with a real username and look at the actual JSON.
3. Compare field names against `mapProfile`/`mapVideos` in the relevant `rapidapiXxx.ts` file and adjust (they're deliberately isolated from the rest of the app so this is a small, local edit).

If a call fails, the API responds with a clear `PROVIDER_REQUEST_FAILED` error (surfaced in the UI) rather than silently showing wrong numbers.

## Data model

- `creators` — one row per (platform, username), with inferred/manual `region` (matched against a static Kazakhstan city list in `src/regions.ts` — IG/TikTok don't expose structured location for arbitrary accounts, so this is inferred from the bio text or set manually in the UI) and `niche_tags` (derived from video captions/hashtags).
- `videos` — one row per video/reel, with views/likes/comments/posted_at.

## API

| Route | Description |
|---|---|
| `POST /api/creators/analyze` | `{ platform, handle }` → fetches live from RapidAPI, upserts into DB, returns creator+videos |
| `GET /api/creators/:platform/:username` | cached read, no live call |
| `PATCH /api/creators/:id/region` | manually set a creator's region |
| `GET /api/search` | `?keyword=&region=&platform=` — search the local DB |
| `GET /api/leaderboard` | `?metric=views\|likes&days=7&region=&platform=` (or `from`/`to`) — top 5 |
| `GET /api/regions` | Kazakhstan city list + distinct regions already in use |
| `POST /api/geolocate` | `{ lat, lng }` → nearest known city (haversine, no external geocoding call) |
