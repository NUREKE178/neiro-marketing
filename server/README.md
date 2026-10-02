# NEIRO — server

Express + TypeScript + SQLite backend (via `@libsql/client` — see [Database](#database)) for **NEIRO Neuromarketing Lab**: a marketer creates a `test` with 2+ ad `creatives`, shares a `/watch/:id` link, and real viewers' in-browser facial-reaction signals get aggregated into an actual engagement comparison — never a guess, never fabricated.

## Dev

```bash
npm install
cp .env.example .env   # fill in SESSION_SECRET (required) and ANTHROPIC_API_KEY (optional) — see below
npm run dev             # http://localhost:8093
npm test                 # node:test, see "Tests" below
```

## How the data flows — read this first

1. A marketer creates a **test** (title + optional goal) and adds 2+ **creatives** (an image URL + optional caption each). This needs `SESSION_SECRET` set — it signs a stateless "owner" cookie that scopes "my tests" to that browser, no login system.
2. The marketer shares the public `/watch/:id` link. **Nothing here needs any configuration** — a viewer opens it, consents to camera access, and the client (never the server) runs [MediaPipe FaceLandmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) on their own webcam feed in-browser.
3. For each creative shown (~8s), the browser samples a handful of **FACS-grounded blendshape scores** (smile, brow-furrow, surprise, eyes-open/attention) every ~400ms and buffers them locally. **Raw video/images never leave the viewer's device** — only these small numeric samples are POSTed to `/api/tests/:id/sessions/:sessionId/reactions`.
4. The marketer's results page (`GET /api/tests/:id/results`) aggregates all viewers' samples per creative (averages + a time-bucketed curve) and renders a chart. `POST /api/tests/:id/analyze` hands that aggregate to `services/NeuroAnalysisService.ts`, which calls the official Anthropic Messages API for a written verdict — which creative performed better, why, and a concrete suggestion for the weaker one.

### On "neuromarketing" and honesty

`smile` / `brow_furrow` / `surprise` are standard Facial Action Coding System (FACS) blendshape proxies — **not a clinical emotion diagnosis**. The UI and the AI prompt both treat them as engagement/attention signals, and results below 3 completed viewer sessions are shown with an explicit "preliminary, more viewers needed" banner rather than a confident-looking number. No test, result, or AI verdict is ever shown without at least one real viewer session behind it.

## Required configuration

| Var | Required for | What happens if unset |
|---|---|---|
| `SESSION_SECRET` | Everything on the marketer side (create/list/edit tests) | `503 SESSION_NOT_CONFIGURED` on those routes; `/watch` still works |
| `ANTHROPIC_API_KEY` | The AI-written verdict (`POST /api/tests/:id/analyze`) | Results still show raw numbers + chart; the AI section shows a clean "not configured" state |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | Persistence on Vercel (serverless = no disk) | Falls back to `os.tmpdir()`, wiped every cold start |

## Database

Local dev needs no setup — defaults to an embedded SQLite file at `server/data/neiro-marketing.sqlite`. In production on Vercel, point it at a free [Turso](https://turso.tech) database (same SQL dialect, `@libsql/client` talks to both transparently):

```bash
turso auth login
turso db create neiro-marketing
turso db show neiro-marketing --url            # -> TURSO_DATABASE_URL
turso db tokens create neiro-marketing          # -> TURSO_AUTH_TOKEN
```

Schema runs automatically on first request (`ensureSchema()` in `db.ts`).

## Data model

- **`tests`** — one row per ad test. `owner_id` scopes it to the marketer's session cookie (no accounts system). `last_analysis_json`/`last_analyzed_at` cache the most recent AI verdict so the results page doesn't re-call the AI provider on every view.
- **`creatives`** — one row per ad variant within a test (`label`, `image_url`, `caption`, `display_order`).
- **`viewer_sessions`** — one row per real person's single pass through a test's creatives. No login — a viewer needs no account, just a server-issued id their browser's batched reaction POSTs reference.
- **`reactions`** — time-bucketed (not per-frame) samples: `t_ms` (milliseconds into that creative's viewing window), `smile`/`brow_furrow`/`surprise`/`attention` (all `0..1 | null` — `null` means the detector didn't see a usable face that sample, never coerced to 0).

## API

| Route | Auth | Description |
|---|---|---|
| `POST /api/tests` | owner | `{ title, goal }` → create a test |
| `GET /api/tests` | owner | list this browser's tests |
| `GET /api/tests/:id` | public | test + creatives (used by both the marketer's page and `/watch`) |
| `PATCH /api/tests/:id` | owner | update title/goal/status |
| `DELETE /api/tests/:id` | owner | delete a test |
| `POST /api/tests/:id/creatives` | owner | `{ label, imageUrl, caption }` |
| `DELETE /api/tests/:id/creatives/:creativeId` | owner | remove a creative |
| `POST /api/tests/:id/sessions` | public | a viewer starts a pass through the test |
| `POST /api/tests/:id/sessions/:sessionId/reactions` | public | `{ creativeId, samples: [...] }` — batched client-side samples |
| `POST /api/tests/:id/sessions/:sessionId/complete` | public | marks the viewer's pass done |
| `GET /api/tests/:id/results` | owner | per-creative aggregates + time-bucketed curves |
| `POST /api/tests/:id/analyze` | owner | calls `NeuroAnalysisService`, caches + returns the AI verdict |
| `GET /api/config/status` | — | `{ aiConfigured }` — honest UI setup state |

## Tests

```bash
npm test
```
`node:test` coverage for `services/NeuroAnalysisService` (tool-use response mapping, missing-key/non-2xx/malformed-response error classification — mirrors `services/aiErrors.ts`'s typed error classes). Pure-function/mocked-fetch unit tests only — no synthetic data touches the real DB.
