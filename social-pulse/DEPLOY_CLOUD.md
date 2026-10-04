# CLOUD-ҚА ДЕПЛОЙ — SOCIAL PULSE

## 1. Ең оңай жол — Vercel (ұсынылады) — 2 минут

### GitHub арқылы:

1. https://vercel.com → Sign up with GitHub (NUREKE178 аккаунтыңызбен)
2. Add New → Project → Import `NUREKE178/neiro-marketing` репозиторийін таңдаңыз
3. Root Directory: `social-pulse` деп қойыңыз
4. Framework Preset: Next.js
5. Branch: `arena/01a0f1e7-neiro-marketing` (немесе main)
6. Environment Variables қосыңыз:

```
DATABASE_URL=postgresql://... (Neon/Supabase-тан алыңыз, жоқ болса бос қалдырыңыз — онда onboarding режим)
NEXTAUTH_SECRET=openssl rand -base64 32
NEXTAUTH_URL=https://your-domain.vercel.app
ENCRYPTION_KEY=openssl rand -base64 32 (32 bytes base64, міндетті!)
META_APP_ID=...
META_APP_SECRET=...
META_REDIRECT_URI=https://your-domain.vercel.app/api/oauth/instagram/callback
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
TIKTOK_REDIRECT_URI=https://your-domain.vercel.app/api/oauth/tiktok/callback
CRON_SECRET=openssl rand -hex 16
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_DEMO_MODE=false
```

Генерация:
```bash
openssl rand -base64 32 # ENCRYPTION_KEY және NEXTAUTH_SECRET
openssl rand -hex 16    # CRON_SECRET
```

7. Deploy басыңыз — 2-3 минутта дайын
8. Domain: Vercel автоматты түрде `https://social-pulse-xxx.vercel.app` береді

### Vercel CLI арқылы (локальда):

```bash
cd social-pulse
npm i -g vercel
vercel login
vercel --prod
```

## 2. Database — Neon (Free Postgres)

1. https://neon.tech → Create Project
2. Connection string көшіріп алыңыз: `postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require`
3. Vercel Env-да `DATABASE_URL` қойыңыз
4. Локальда:
```bash
cd social-pulse
npx prisma db push
npx prisma generate
```

Supabase балама: https://supabase.com → New Project → Database → Connection string

## 3. Meta App (Instagram) — Production

1. https://developers.facebook.com/apps/ → Create App → Business
2. Add Product: Facebook Login + Instagram Graph API
3. Facebook Login → Settings → Valid OAuth Redirect URIs:
   ```
   https://your-domain.vercel.app/api/oauth/instagram/callback
   http://localhost:3000/api/oauth/instagram/callback
   ```
4. Instagram Graph API → Basic Display емес, Graph API
5. Scopes: `instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement`
6. Settings → Basic → Privacy Policy URL: `https://your-domain.vercel.app/privacy`
7. Terms URL: `https://your-domain.vercel.app/terms`
8. Data Deletion Callback: `https://your-domain.vercel.app/api/data-deletion`
9. App Review үшін screencast дайындаңыз: Login → Profile → Media → Insights

## 4. TikTok App

1. https://developers.tiktok.com/ → Manage Apps → Create
2. Add Products: Login Kit + Display API
3. Redirect URI:
   ```
   https://your-domain.vercel.app/api/oauth/tiktok/callback
   ```
4. Scopes: `user.info.basic, video.list` (own videos only)
5. Privacy Policy URL қойыңыз

## 5. Басқа Cloud нұсқалары

### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway variables set DATABASE_URL=...
```

### Render
1. https://render.com → New Web Service → Connect GitHub
2. Root: `social-pulse`, Build: `npm install --ignore-scripts && npm run build`, Start: `npm start`
3. Env қосыңыз

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
```bash
docker build -t social-pulse .
docker run -p 3000:3000 --env-file .env social-pulse
```

## 6. Тексеру

Deploy-дан кейін:
- https://your-domain.vercel.app/ → басты бет, ANALYZE жұмыс істейді
- /search?query=@instagram → Business Discovery арқылы нақты тексереді (егер токен қосылса)
- /overview → empty onboarding (Connect Instagram/TikTok) — DB жоқ болса да жұмыс істейді
- /api/search?query=nike → JSON қайтарады
- /privacy, /terms — Meta талабы

## 7. Қазіргі күй — Cloud-қа дайын

- ✅ `next build` passes (0 error)
- ✅ `vercel.json` cron бар
- ✅ `.env.example` толық
- ✅ `DATABASE_URL` жоқ болса да жұмыс істейді (onboarding)
- ✅ No DEMO DATA, no mock numbers
- ✅ Hydration error түзетілді
- ✅ ANALYZE → /search?query= жұмыс істейді

Сізге тек Vercel-ге GitHub-ты қосу қалды — 2 минут!
