# NEIRO

Instagram/TikTok креатор аналитика платформасы: аккаунтты талдау (views/likes/видео тізімі), геолокация бойынша ниша ізделеу, апталық Топ‑5 рейтинг, **AI Content Studio** (`/studio` — ниша бойынша контент идеясын AI-мен генерациялау, жоспарлау тақтасы, жарияланғаннан кейін нақты нәтижемен салыстыру). Neo-brutalism дизайн. Web + Android + Windows.

## Құрылым

```
client/       Vite + React 19 + TypeScript — веб-интерфейс
  src-tauri/  Windows/desktop қаптамасы (Tauri)
  android/    Android қаптамасы (Capacitor)
server/       Express + TypeScript — API логикасы (Vercel-де де, локальде де қолданылады)
api/          Vercel serverless entry (server/ қолданады)
.github/workflows/  CI: Android APK + Windows .exe автоматты құрастыру
```

## Локальде іске қосу

```bash
# 1) backend
cd server
npm install
cp .env.example .env   # RAPIDAPI_KEY толтыру керек — қараңыз server/README.md
npm run dev             # http://localhost:8093

# 2) frontend (жаңа терминалда)
cd client
npm install
npm run dev             # http://localhost:5173
```

Деректер демо/mock емес — екі нақты дерек көзі бар: **RapidAPI** (кез келген ашық аккаунтты іздеу, "Жартылай расталған" деп белгіленеді) және **ресми OAuth** (`/settings` беті — тек өз аккаунтыңызды қосу, "✓ Расталған" деп белгіленеді). Толық нұсқау, екеуінің айырмашылығы және OAuth app тіркеу қадамдары: [`server/README.md`](server/README.md).

---

## 1. Vercel-ге шығару (веб)

Ең оңай жол — GitHub репозиторийін Vercel dashboard арқылы қосу (CLI/токен керек емес):

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → `NUREKE178/neiro-marketing` таңда.
2. Vercel `vercel.json`-ды автоматты түрде таниды (build command, output, `/api` routing — бәрі дайын, қосымша баптау керек емес).
3. **Environment Variables** бөлімінде қос:
   - `RAPIDAPI_KEY` (міндетті — [server/README.md](server/README.md#data-source-1-rapidapi-required--there-is-no-demo-mode))
   - `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (міндетті — Vercel-де жергілікті файл жүйесі жоқ, [server/README.md](server/README.md#database) қара)
   - (міндетті емес, тек RapidAPI өнімің әдепкіден өзгеше болса) `RAPIDAPI_INSTAGRAM_HOST`/`RAPIDAPI_TIKTOK_HOST` және тиісті `*_PROFILE_PATH`/`*_POSTS_PATH`/`*_USERNAME_PARAM`
   - (міндетті емес, "өз аккаунтын қосу" OAuth мүмкіндігі үшін) `SESSION_SECRET`, `PUBLIC_APP_URL`, `INSTAGRAM_CLIENT_ID`/`SECRET`, `TIKTOK_CLIENT_KEY`/`SECRET` — толық тіркеу қадамдары [server/README.md](server/README.md#data-source-2-official-oauth-authorizeddataimport)
   - (міндетті емес, **AI Content Studio** (`/studio`) үшін) `ANTHROPIC_API_KEY` — толығырақ [server/README.md](server/README.md#ai-content-studio-studio)
4. **Deploy** бас. Бірнеше минуттан кейін `https://<жоба-аты>.vercel.app` дайын.

Кейін әр push (осы бранчқа немесе `main`-ге, Vercel жоба баптауына байланысты) автоматты redeploy жасайды.

⚠️ **OAuth шектеуі:** "Өз аккаунтын қосу" (`/settings`) сессия cookie-іне негізделген, ол тек веб-нұсқада (same-origin) жұмыс істейді. Android/Windows қосымшалары (төменде) `VITE_API_BASE_URL` арқылы сыртқы API-ге сұраныс жібергендіктен, cookie жұмыс істемейді — OAuth байланыстыру қазірше тек веб-браузерде қолжетімді. RapidAPI арқылы кез келген аккаунтты талдау барлық платформада бірдей жұмыс істейді.

## 2. Android (.apk)

Бұл sandbox-тың желі саясаты `dl.google.com`-ды (Android Gradle Plugin осыдан жүктеледі) бұғаттайды, сондықтан .apk осы жерде құрастырылмады. Бірақ:

- `client/android/` — толық Capacitor Android жобасы, git-ке committed, дайын.
- `.github/workflows/android.yml` — `client/`-ке push кезінде GitHub Actions-та (шектеусіз желі) нақты debug .apk құрастырады да, run-нің **Artifacts** бөліміне жүктейді.

Өзіңде локальде құрастырғың келсе (Android Studio орнатылған болса):
```bash
cd client && npm run build && npx cap sync android
cd android && ./gradlew assembleDebug
# нәтиже: android/app/build/outputs/apk/debug/app-debug.apk
```

## 3. Windows (.exe)

Бұл — осы контейнерде нақты құрастырылды (Rust + mingw-w64 арқылы, `x86_64-pc-windows-gnu` target): `NEIRO_0.1.0_x64-setup.exe` (NSIS орнатқышы) және портативті `NEIRO-portable.exe`. Сессия чатында жіберілді.

Қайта құрастыру үшін (осы контейнерде де, өз машинаңда да):
```bash
cd client && npm install
npx tauri build --bundles nsis
# нәтиже: client/src-tauri/target/{release или x86_64-pc-windows-gnu/release}/bundle/nsis/*.exe
```

`.github/workflows/windows.yml` де бар — `windows-latest` runner-де табиғи түрде құрастырады (әр push сайын), сондықтан болашақ өзгерістер үшін локальде қайта жинаудың қажеті жоқ.

## Дизайн

Neo-brutalism: қалың қара жиектер, hard-offset көлеңкелер, қанық түс блоктары (сары/pink/көк/лайм), blocky типографика. Токендер: `client/src/styles/tokens.css` (light + dark).
