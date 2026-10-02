# SOCIAL PULSE — Production Release

**Tagline:** “Find Trends. Analyze Content. Make Smarter Moves.”  
**Design:** Neo-Brutalism preserved — lime #DFFF00 thick borders 3px offset shadows 6px, minimal scientific, kk default  
**Stack:** Next.js 14 App Router, Prisma + Postgres, AES-256-GCM token encryption, Official APIs only (no scraping)

> **Production:** Real data via Meta Graph API v19.0 + TikTok Login Kit + Display API. No mock numbers. Demo mode disabled in prod (build fails if NEXT_PUBLIC_DEMO_MODE=true in production).

---

## 1. HARD CONSTRAINTS — Official APIs only

- **Instagram:** Meta Graph API via Facebook Login scopes `instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement`. Competitor ONLY via Business Discovery API public fields (followers, media_count, public profile). No private.
- **TikTok:** Login Kit + Display API scopes `user.info.basic, video.list` — own profile/videos only. **NO Research API**, **NO competitor tracking via TikTok**.
- **No scraping.** Rate limits exponential backoff, queue per-account locks, idempotent upsert `(platform, external_id)`.
- **Tokens:** Encrypted at rest AES-256-GCM, key from `ENCRYPTION_KEY` env (base64 32 bytes), IV 12 bytes + authTag 16 bytes, format `iv:authTag:ciphertext`. Never sent to client. Server-only calls.
- **Security:** Zod validation, RLS per-user (`userId`), TS strict, feature flag `DEMO_MODE` default false impossible in prod.

---

## 2. DATA MODEL (Prisma)

```
User id email locale kk|ru|en plan FREE|PRO
ConnectedAccount id userId platform INSTAGRAM|TIKTOK externalId username tokenEncrypted @db.Text tokenExpiresAt status ACTIVE|EXPIRED|ERROR lastSyncedAt
TrackedAccount id userId platform username externalId? (Business Discovery)
Media id accountRef accountType CONNECTED|TRACKED platform externalId @@unique([platform,externalId]) type IMAGE|VIDEO|CAROUSEL caption postedAt permalink thumbnailUrl @@index([accountRef,postedAt])
MediaMetricsSnapshot mediaId capturedAt views likes comments shares saves reach @@index([mediaId,capturedAt])
AccountMetricsSnapshot accountRef capturedAt followers following mediaCount engagementRate @@index([accountRef,capturedAt])
SavedItem userId itemType ACCOUNT|MEDIA itemRef platform
Search, Report, SyncJob id userId accountRef type INITIAL|ACCOUNT_METRICS|MEDIA_METRICS|FULL startedAt finishedAt itemsSynced status RUNNING|SUCCESS|FAILED error @@index([accountRef])
```

Migrations: `npx prisma db push` + `npx prisma generate`

---

## 3. SYNC PIPELINE

- **Initial sync:** Right after OAuth, last 90 days, `enqueueJob('INITIAL')` background.
- **Scheduled:** Every 6h account metrics, daily snapshot 00:00 Asia/Almaty (UTC+5) via `/api/cron/sync` + Vercel Cron `0 */6 * * *`.
- **Idempotent:** `upsert` where `platform_externalId` unique.
- **Locks:** In-memory Map dev, prod Redis SET NX EX 3600.
- **Rate limit:** `checkRateLimit` + `fetchWithBackoff` exponential Retry-After.
- **Logs:** `sync_jobs` table.
- **Token refresh:** IG long-lived 60 days `refreshLongLivedToken`, TikTok `refreshTikTokToken`, expired → status EXPIRED + Reconnect CTA.

Endpoints:
- `POST /api/sync` { userId?, accountId?, type } — trigger
- `GET /api/sync` — last 20 jobs
- `GET /api/cron/sync` — cron, needs `Authorization: Bearer CRON_SECRET`

---

## 4. OVERVIEW API — Single call

`GET /api/overview?userId=xxx`

Returns:
```json
{
  "isDemo": false,
  "isEmpty": false,
  "connectedAccount": { "username", "platform", "avatarUrl", "lastSyncedAt" },
  "stats": {
    "trackedAccounts": { "count": 5, "connected": 2, "tracked": 3, "delta": 12.5, "deltaTooltip": "30 күн бұрын..." },
    "videosAnalyzed": { "count": 127, "last7Days": 4 },
    "saved": { "count": 23, "accounts": 5 },
    "reports": { "count": 8, "ready": 2 }
  },
  "lastSynced": "2026-10-02T...",
  "lastSyncedMinutesAgo": 5,
  "tokenStatus": "active|expired|error|no_account",
  "syncing": false
}
```

Delta % vs 30 days from `account_metrics_snapshots` else `null` → tooltip "Not enough data yet" never fake %.

Number formatting: `Intl.NumberFormat` locale kk space thousands, compact 1,2 мың / 12,4K above 10000 via `formatNumberLocale`.

---

## 5. OVERVIEW UI — Rebuilt Production

- **Compact header:** avatar + username + platform badge + Last synced X min ago + manual refresh 44x44 tap target
- **Remove DEMO banner** (only show if isDemo local dev)
- **Stat cards:** keep lime/violet/pink/cyan, tappable Link to /search /analytics /saved /reports, real counts, delta % with tooltip
- **Required states:**
  - Loading: skeleton matching card shapes, no full-screen spinner
  - Empty onboarding: Connect Instagram or TikTok 2 CTA, never zeros
  - Error: inline + retry
  - Token expired: warning banner Reconnect CTA
  - Syncing: progress dot + spinner
  - Pull-to-refresh: enabled, safe-area insets, WCAG AA contrast (olive-on-lime fixed to black-on-lime)
- **UI/UX:** i18n kk default ru en secondary no mixed EN/KZ, bottom nav Home Search Stats Trends More (max 5), remove duplicate hamburger, tap target 44x44, safe-area.

---

## 6. i18n

- `src/lib/i18n/kk.json` kk default 70+ keys
- `ru.json`, `en.json` parity
- `t(key, locale, params)` with `{{param}}` replace fallback kk
- `formatNumberLocale(num, locale)` compact
- `useLocale()` reads localStorage `locale` else kk
- No hardcoded strings in Overview.

---

## 7. OAUTH FLOWS + DATA DELETION

**Instagram:**
- Start: `GET /api/oauth/instagram` → generates state crypto random 16 hex, httpOnly cookie `ig_oauth_state` 600s, redirect `https://www.facebook.com/v19.0/dialog/oauth?client_id=META_APP_ID&redirect_uri=META_REDIRECT_URI&scope=instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement&state=...`
- Callback: `GET /api/oauth/instagram/callback?code&state` → CSRF check, exchange code→short→long-lived 60d, encrypt, upsert `connectedAccount`, enqueue INITIAL, redirect `/overview?connected=instagram`
- Account-type check: `isPersonalAccount()` → if true, show guide to switch Creator/Business: Settings → Account → Switch to Professional Account.

**TikTok:**
- Start: `GET /api/oauth/tiktok` → state cookie `tiktok_oauth_state`
- Callback: exchange code→token, encrypt access+refresh, upsert with open_id, enqueue INITIAL, redirect `/overview?connected=tiktok`

**Data Deletion (Meta-required):**
- `POST /api/data-deletion` with `signed_request` → verify HMAC SHA256 with `META_APP_SECRET`, parse user_id, delete data, return `{ url, confirmation_code }`
- Set in App Dashboard: Data Deletion Callback URL = `https://yourdomain.com/api/data-deletion`
- Privacy Policy URL = `https://yourdomain.com/privacy`
- Terms URL = `https://yourdomain.com/terms`

---

## 8. ENV — .env.example (no secrets in repo)

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="openssl rand -base64 32" # 32 bytes base64
META_APP_ID=""
META_APP_SECRET=""
META_REDIRECT_URI="http://localhost:3000/api/oauth/instagram/callback"
META_DATA_DELETION_CALLBACK_TOKEN=""
TIKTOK_CLIENT_KEY=""
TIKTOK_CLIENT_SECRET=""
TIKTOK_REDIRECT_URI="http://localhost:3000/api/oauth/tiktok/callback"
CRON_SECRET="openssl rand -hex 16"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DEMO_MODE="false" # MUST false in prod, build fails if true
```

Generate:
```bash
openssl rand -base64 32 # ENCRYPTION_KEY, NEXTAUTH_SECRET
openssl rand -hex 16    # CRON_SECRET
```

---

## 9. META APP CREATION CHECKLIST

1. https://developers.facebook.com/apps/ → Create App → Business type
2. Add Products: Facebook Login + Instagram Graph API
3. Facebook Login → Settings → Valid OAuth Redirect URIs: add `META_REDIRECT_URI`
4. Instagram Graph API → Add Instagram Testers or submit for App Review
5. Scopes: `instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement`
6. Business Discovery: ONLY public fields, requires `instagram_basic` + IG User ID. Endpoint: `/{ig-user-id}?fields=business_discovery.username({username}){followers_count,media_count,profile_picture_url}`
7. Data Deletion Callback: set to `https://yourdomain.com/api/data-deletion`
8. Privacy Policy URL: `https://yourdomain.com/privacy`
9. Terms URL: `https://yourdomain.com/terms`
10. App Review: Provide screencast showing Login → Profile → Media → Insights flow, explain why each scope needed
11. Personal account check: If `isPersonalAccount=true`, show guide:
    - kk: "Instagram → Параметрлер → Аккаунт → Кәсіби аккаунтқа ауысу → Creator немесе Business"
    - ru: "Instagram → Настройки → Аккаунт → Переключиться на профессиональный → Автор или Бизнес"
12. Long-lived token: exchange short→long (60 days), refresh via `GET /refresh_access_token?grant_type=fb_exchange_token`

**TIKTOK APP CREATION CHECKLIST:**

1. https://developers.tiktok.com/ → Manage apps → Create
2. Add Products: Login Kit + Display API
3. Login Kit → Set Redirect URI: `TIKTOK_REDIRECT_URI`, set scopes `user.info.basic, video.list`
4. IMPORTANT: Display API does NOT allow competitor tracking. Own profile/videos only. To track competitors, user must have explicit consent or use public Business Discovery via IG only.
5. App Review: Provide demo video + privacy policy URL + description of data usage
6. Webhook: not needed for MVP
7. Refresh: use `refresh_token` grant

---

## 10. ONBOARDING FLOW

```
Sign up → Choose platform (Instagram Business or TikTok) → OAuth → account-type check Personal→guide to switch Creator/Business → initial sync progress (last 90 days, sync_jobs) → Overview with real data
```

---

## 11. SECURITY & COMPLIANCE

- Zod validation all callbacks
- All platform calls server-only, never expose token to client
- Encryption AES-256-GCM, key from env, never commit
- RLS per-user via userId
- Data Deletion Callback verified HMAC
- No secrets in repo, .env.example only
- WCAG AA contrast, tap 44x44, safe-area, pull-to-refresh
- i18n unified kk default, no mixed EN/KZ

---

## 12. BUILD & RUN

```bash
cd social-pulse
npm install --ignore-scripts
cp .env.example .env
# Edit .env with real keys
npx prisma generate
npx prisma db push
npm run dev # http://localhost:3000

# Production build
npm run build
npm start
```

Vercel Cron:
```json
// vercel.json
{
  "crons": [{ "path": "/api/cron/sync", "schedule": "0 */6 * * *" }]
}
```

---

## 13. TESTS (planned)

- Unit: metric calculations growth % engagement rate, `formatNumberLocale`, `encryptToken/decryptToken`, `isTokenExpired`
- Integration: OAuth callback state CSRF, sync job idempotent upsert, /api/overview aggregated

---

## 14. ANDROID — Real Repository (Retrofit)

- `RealRepository` Retrofit + OkHttp + DataStore token encrypted
- `GET /api/overview` → Room cache offline
- `POST /api/sync` manual refresh
- No mock data in prod, show empty onboarding if no account

---

## 15. DELIVERABLES

- [x] Audit+plan
- [x] DB migrations (schema.prisma production)
- [x] OAuth flows + callback + data deletion + privacy/terms
- [x] Sync workers queue + locks + idempotent
- [x] /api/overview aggregated
- [x] Rebuilt Overview UI all states
- [x] i18n kk ru en
- [x] .env.example + README Meta/TikTok app scopes redirect URIs App Review checklist
- [ ] Android RealRepository Retrofit (next)
- [ ] Unit + integration tests (next)

---

© 2026 SOCIAL PULSE • PRODUCTION • Official APIs only • No scraping
