# NEIRO — client

Vite + React 19 + TypeScript frontend. Neo-brutalism design system lives in `src/styles/tokens.css`.

## Dev

```bash
npm install
npm run dev
```

Talks to the backend (`../server`) via `/api`, proxied to `http://localhost:8093` in dev (see `vite.config.ts`). Start the server first (see `../server/README.md`), otherwise API calls 404/fail to connect.

## Structure

- `src/components/` — design-system primitives (Button, Card, Badge, Input, SegmentedControl, CreatorCard, VideoCard, ViewsChart, …)
- `src/pages/` — route pages: Home, Discover, Analyze, Leaderboard, NotFound
- `src/lib/api.ts` — typed fetch client for the backend
- `src/hooks/useGeolocation.ts` — browser geolocation → nearest-city resolution
