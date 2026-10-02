# NEIRO — server

Express + TypeScript + SQLite backend (via `@libsql/client` — see [Database](#database) below). No mock data: every number shown in the app comes from a live call to one of the two data sources below, normalized and cached in the DB — never fabricated, never silently defaulted to 0.

## Dev

```bash
npm install
cp .env.example .env   # fill in at least RAPIDAPI_KEY — see below
npm run dev             # http://localhost:8093
npm test                 # node:test — 29 tests, see "Tests" below
```

## Two data sources — read this first

There are two fundamentally different ways this app gets Instagram/TikTok data, and they are **not interchangeable**:

| | RapidAPI (`providers/*/rapidapi.ts`) | Official OAuth (`providers/*/oauth.ts`) |
|---|---|---|
| Can look up | **any public account** | **only the account that explicitly authorized it** |
| How | unauthenticated third-party scraper, reading public pages | the account owner's own OAuth grant |
| UI badge | "Partially verified · 3rd-party" | "✓ Verified" |
| Requires from you | a RapidAPI key (§ below) | registering a Meta app + a TikTok app (§ below) |

**This is a platform restriction, not a design choice.** Instagram/TikTok's official APIs will never return a third party's statistics — if you need to look up *other people's* accounts (e.g. for creator discovery), RapidAPI is the only path, and its numbers can only ever be "partially verified" because there's no cryptographic guarantee they're current — a scraper is reading a public page, not an authenticated endpoint. If an account owner connects their own account via Settings → Connect, *that* account's data is "verified" and a routine RapidAPI re-analyze will never silently downgrade it back (see the guard in `routes.ts`).

## Data source 1: RapidAPI (required — there is no demo mode)

1. Create a RapidAPI account.
2. Subscribe to an Instagram scraper API (search "Instagram Scraper") and a TikTok scraper API (search "TikTok Scraper") — free tiers exist on most.
3. Copy your `X-RapidAPI-Key` (same key across every API you subscribe to) into `server/.env` as `RAPIDAPI_KEY`.
4. Each product has its own host/paths/param names. If they differ from the defaults in `.env.example`, override `RAPIDAPI_{INSTAGRAM,TIKTOK}_{HOST,PROFILE_PATH,POSTS_PATH,USERNAME_PARAM}` — no code change needed.

### ⚠️ Verify the response mapping before trusting the numbers

`src/providers/instagram/rapidapi.ts` and `src/providers/tiktok/rapidapi.ts` each have a clearly marked **"Response mapping"** section. They try several candidate field paths (the common ones across RapidAPI vendors), but this sandbox's network egress blocks `rapidapi.com`, so **the mapping was never checked against a live response**. Field validation is strict on purpose: a response missing every candidate for a required field (like `username`) throws `SchemaMappingError` rather than silently mapping to `""`/`0` — so a bad mapping fails loudly instead of showing wrong numbers.

Before relying on this in production:
1. Subscribe to your chosen API, open its **Playground** tab, call it once with a real username.
2. Compare the actual JSON against the candidate field paths in `rapidapi.ts` and adjust if needed (or set the path/param env overrides above).

## Data source 2: official OAuth ("AuthorizedDataImport")

This lets a visitor connect their **own** Instagram/TikTok account from the `/settings` page. It needs three things configured, or it stays cleanly in a "not configured" state (never shown as connected without a real token):

1. **`SESSION_SECRET`** — any random string (`openssl rand -base64 32`). Signs the session cookie and encrypts stored tokens (AES-256-GCM) — see `services/sessionCookie.ts` / `services/tokenCrypto.ts`.
2. **`PUBLIC_APP_URL`** — the exact public URL this server is reachable at (must match what you register below byte-for-byte, including scheme).
3. Platform app credentials (one or both):

### Instagram — "Instagram API with Instagram Login"

The old "Instagram Basic Display API" is deprecated; this is the current path. **Only works for Instagram Business/Creator accounts**, not plain personal accounts — a Meta restriction.

1. Create an app at [developers.facebook.com](https://developers.facebook.com/apps) → add the "Instagram" product.
2. Add an OAuth redirect URI: `${PUBLIC_APP_URL}/api/auth/instagram/callback`.
3. Copy the app's Client ID / Secret into `INSTAGRAM_CLIENT_ID` / `INSTAGRAM_CLIENT_SECRET`.
4. For anyone other than your own registered test users, Meta requires **App Review** of the `instagram_business_basic` scope before it works in production.
5. ⚠️ Not verified against a live response in this sandbox (same caveat as RapidAPI) — Meta's exact scope names and field availability have changed before. Cross-check `providers/instagram/oauth.ts` against [the current docs](https://developers.facebook.com/docs/instagram) before relying on it. Notably: the official `/me/media` endpoint does **not** expose view/play counts for all media types without the additional `instagram_manage_insights` permission — this integration leaves `views: null` for OAuth-sourced Instagram videos rather than guessing.

### TikTok — Login Kit + Display API

1. Create an app at [developers.tiktok.com](https://developers.tiktok.com/apps) → add "Login Kit".
2. Add redirect URI: `${PUBLIC_APP_URL}/api/auth/tiktok/callback`.
3. Request the `user.info.basic` and `video.list` scopes.
4. Copy Client Key / Secret into `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET`.
5. Same live-verification caveat as above — cross-check `providers/tiktok/oauth.ts` against [the current docs](https://developers.tiktok.com/doc/login-kit-web) before relying on it. `video.list` does return view/like/comment/share counts for the user's own videos directly, unlike Instagram.

### What isn't built

Token refresh (TikTok's short-lived access token + its refresh_token, Instagram's 60-day long-lived token renewal) is **not implemented** — a connection works until its token expires, then Settings shows "Connection expired → Reauthorize" rather than silently failing. Building full refresh logic without being able to test it against live APIs would just be more unverified code; this is the honest stopping point for this pass.

## AI Content Studio (`/studio`)

A third, independent piece: `services/AIGenerationService.ts` calls the official **Anthropic Messages API** (first-party, not a scraper — `ANTHROPIC_API_KEY`, optional `AI_MODEL` override, defaults to `claude-sonnet-5-5`) to generate 3 short-video content ideas (hook/script/caption/hashtags) for a niche, via forced tool-use so the response is always structured JSON, never free text that has to be guessed at. If a creator has connected their own account (§ above), generation is grounded in that creator's actual captions + view/like counts — passed as context, not training data — so ideas reflect what has actually worked for them instead of generic advice. Like the two data sources, missing `ANTHROPIC_API_KEY` means `/studio`'s Generate tab shows a clean "not configured" state, never a fake idea.

Generated ideas aren't persisted until the user explicitly saves one — saved ideas become rows in `content_drafts` (see [Data model](#data-model)), which the Studio's planning board reads/writes via `routes/studio.ts` (`/api/studio/*`), scoped to the same session cookie as OAuth connections. A draft can be linked to one of the owner's own (OAuth-verified) videos once posted, so the UI can show the generated plan next to that video's real views/likes — again, only ever real numbers already in the DB, nothing invented for the comparison.

## Database

Local dev needs no setup — defaults to an embedded SQLite file at `server/data/neiro-marketing.sqlite`. In production on Vercel, serverless functions have no persistent disk, so point it at a free [Turso](https://turso.tech) database (same SQL dialect, `@libsql/client` talks to both transparently):

```bash
turso auth login
turso db create neiro-marketing
turso db show neiro-marketing --url            # -> TURSO_DATABASE_URL
turso db tokens create neiro-marketing          # -> TURSO_AUTH_TOKEN
```

Schema migrations run automatically on first request (`ensureSchema()` in `db.ts`), including `ALTER TABLE` for columns added after the first release.

## Data model

- **`creators`** — one row per (platform, username). `source` (`rapidapi_instagram`/`rapidapi_tiktok`/`oauth_instagram`/`oauth_tiktok`) and the derived `verification_status` (`verified` only for an `oauth_*` source) drive the UI badge directly — trust isn't inferred from whether a number happens to be nonzero. `last_sync_status`/`last_error` let a failed resync keep showing the last-known-good row instead of either hiding the failure or wiping good data. `region`/`region_source` come from a static Kazakhstan city list in `src/regions.ts` (IG/TikTok don't expose structured location, so this is inferred from bio text or set manually) — never upgraded past what the text actually says.
- **`videos`** — one row per video/reel. `views`/`likes`/`comments` are nullable: `null` means the data source didn't report that field at all, `0` means it explicitly reported zero. Never conflated — see `services/AnalyticsService.ts` and its tests.
- **`connections`** — one row per (owner browser, platform) for OAuth. Tokens are stored AES-256-GCM encrypted; only `services/AuthorizedDataImport.ts` ever decrypts them. No user-accounts system was added — a connection is scoped to a signed, stateless session cookie identifying "this browser," which is the right amount of auth for "let someone link their own account" without a full login system.
- **`content_drafts`** — one row per AI Content Studio idea/draft, scoped to the same owner_id session cookie as `connections` (no accounts system here either). `status` (`idea → draft → scheduled → posted → archived`) drives the planning board's columns; `creator_id` is the own-account creator generation was grounded on, if any; `linked_video_id` points at a real video once posted, so planned-vs-actual never needs an invented metric.

Deliberately **not** a fully normalized EAV metrics table (one row per metric with `source`/`retrieved_at`/`verification_status` each) even though that's the textbook shape for "track provenance per number" — the denormalized `videos` table keeps the existing search/leaderboard SQL simple, and `source`/`verification_status` live at the creator level since in practice an entire sync is one source, not a per-field mix.

## API

| Route | Description |
|---|---|
| `POST /api/creators/analyze` | `{ platform, handle }` → RapidAPI unless a verified OAuth record already exists for that username, upserts, returns `{ creator, videos, stats }` |
| `GET /api/creators/:platform/:username` | cached read, no live call |
| `PATCH /api/creators/:id/region` | manually set a creator's region |
| `GET /api/search` | `?keyword=&region=&platform=` — search the local DB |
| `GET /api/leaderboard` | `?metric=views\|likes&days=7&region=&platform=` (or `from`/`to`) — top 5 |
| `GET /api/regions` | Kazakhstan city list + distinct regions already in use |
| `POST /api/geolocate` | `{ lat, lng }` → nearest known city (haversine, no external geocoding call) |
| `GET /api/config/status` | which data sources are configured (used by the UI to show honest setup states) |
| `GET /api/auth/:platform/status` | this browser's connection status for Settings |
| `GET /api/auth/:platform/start` → `/callback` | OAuth authorization-code flow |
| `POST /api/auth/:platform/resync` | re-fetch the connected account's own data |
| `POST /api/auth/:platform/disconnect` | removes the stored connection |
| `POST /api/studio/generate` | `{ platform, topic, useOwnData }` → 3 AI-generated ideas (hook/script/caption/hashtags), not yet saved |
| `GET /api/studio/drafts` | this browser's saved drafts |
| `POST /api/studio/drafts` | save a generated (or blank) idea as a draft |
| `PATCH /api/studio/drafts/:id` | edit a draft / change its status / schedule it / link it to a real video |
| `DELETE /api/studio/drafts/:id` | removes a draft |

## Tests

```bash
npm test
```
37 `node:test` tests across `providers/httpClient`, `providers/instagram/rapidapi`, `services/AnalyticsService`, `services/AIGenerationService`, `niche`, `regions` — status-code classification, null-vs-zero handling, schema-mismatch detection, the AI tool-use response mapping, and the region/niche matching logic. Excluded from the production build (`tsconfig.json`'s `exclude`). No synthetic data touches the real DB or UI — these are pure-function/mocked-fetch unit tests only.
