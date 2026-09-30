# SOCIAL PULSE — Барлық платформада бірдей нұсқа

## Платформалар: Web + Windows + Android — 100% бірдей функционал

### 1. Web (Next.js) — Негізгі

**Орны:** `/social-pulse`

**Функционал (барлық платформада бірдей):**
- Smart Search: @username, URL, niche (ойыншық, coffee shop), Platform All/Instagram/TikTok, Region Алматы/Астана/Шымкент/Қазақстан, өңірі расталмаған белгісі
- Top 5 аккаунт: avatar, username, bio, followers, avg views/likes, ER, белсенділік, анализ батырмасы, сұрыптау
- Account Analytics: Overview (avatar, username, displayName, платформа, сыртқы сілтеме, кезең, жаңарту, дереккөз), KPI (Followers, Total views/likes/comments, Videos, Avg views + салыстыру %, tooltip), Video Table (thumbnail, title/caption, date, views/likes/comments/shares/ER, URL, sort/search/platform/date filter), Video Detail, Charts (Views by video, Posting frequency), AI Analyst (Нақты дерек / Есептелген / Интерпретация)
- Date Filter: Today, Yesterday, Last 7/14/30/90 days, Custom
- Trend Discovery: niche енгізу, аккаунттар, топ қаралым/лайк, белсенділік, хэштегтер, жиі сөздер, форматтар, Charts
- AI Content Analyst, Engagement Calculator (формула көрсетіледі), Competitor Comparison (multi-select, table+chart, “Дерек қолжетімсіз”), Export PDF/CSV/Excel (disclaimer)
- API: /api/analyze, /accounts, /trends, /export — ресми API ғана, scraping жоқ, rate limit, cache, OAuth, дереккөз әр карточкада, DEMO DATA белгісі

**Іске қосу:**
```bash
cd social-pulse
npm install
npm run dev
# http://localhost:3000
```

---

### 2. Windows — 3 тәсіл, бәрі бірдей функционал

**Орны:** `/social-pulse` (сол код)

**Тәсіл A — PWA (Ең оңай, 10 сек, ұсынылады):**
1. Chrome/Edge → http://localhost:3000 немесе Vercel URL
2. Адрес жолағында Install иконкасы → Install
3. Windows Пуск және рабочий столда жеке қосымша болып пайда болады
4. Offline жұмыс (PWA cache)

**Файлдар:** `public/manifest.json`, `public/icons/icon-*.png`, `src/app/manifest.ts`, `next-pwa` (опционал)

**Тәсіл B — Electron EXE (Нағыз Windows қосымшасы):**
```bash
cd social-pulse
npm install
npm run build
npm run electron:build:win
# dist/Social Pulse Setup 1.0.0.exe (NSIS орнатушы)
# dist/Social-Pulse-Portable-1.0.0.exe (portable, орнатусыз)
```

**Файлдар:** `electron/main.js`, `electron/preload.js`, `electron-builder.yml`

**Тәсіл C — Android APK-ны Windows-та:**
- Windows 11 WSA немесе BlueStacks → `social-pulse-android/app/build/outputs/apk/debug/app-debug.apk` орнату

**Windows нұсқаулығы:** `social-pulse/WINDOWS_INSTALL.md`

---

### 3. Android — Neo-Brutalism, Web-пен 100% бірдей

**Орны:** `/social-pulse-android`

**Дизайн:** Web-пен бірдей Neo-Brutalism — #D9FF3F Primary, #111111 Black, border 3px, shadow 6px, bold typography, BrutalCard, BrutalBadge, DemoBadge, KpiCard, BrutalBarChart, BrutalLineChart (Canvas)

**8 экран (Web-пен бірдей):**
- Overview, Search, Analytics (KPI + Charts + Video Table + AI 3 топ), Trends (hashtags, posting frequency chart, views chart, formats), Competitors (multi-select, table, formula), Saved, Reports (PDF/CSV/Excel + disclaimer), Settings (API keys backend only, security, i18n kk/ru/en)

**Технология:** Kotlin, Jetpack Compose, Material3, MVVM, Room, DataStore, Navigation Compose, MockData (5 аккаунт, 5 видео, DEMO DATA)

**Іске қосу:**
```bash
# Android Studio
File → Open → social-pulse-android
Sync → Run
# APK
./gradlew assembleDebug
# app/build/outputs/apk/debug/app-debug.apk
```

**Құжаттама:** `social-pulse-android/README.md`

---

### Дизайн жүйесі — Барлық платформада бірдей

- Түстер: Primary #D9FF3F, Black #111111, White #FFFFFF, Purple #A78BFA, Pink #FF75B5, Blue #76D7FF, Background #F5F4EF
- Neo-Brutalism: қалың border 3-4px, қатты көлеңке 6px, hover move -2px, bold uppercase, геометриялық блоктар
- Компоненттер: Brutal Card, Button, Input, Badge, Demo Badge, Chart
- DEMO DATA — нақты аккаунт статистикасы емес — барлық жерде

---

### Этика — Барлық платформада бірдей

- Тек рұқсат етілген ресми API, OAuth, жеке/құпия аккаунтқа тыйым, scraping/CAPTCHA тыйым, API кілттері backend-та ғана, rate limit, cache, дереккөз әр карточкада, өңір расталмаған белгісі, “Дерек қолжетімсіз” handling

---

### Бірдей екенін қалай тексеру

1. Web: http://localhost:3000 → Search → ойыншық → Top 5 → Analytics → Trends → Competitors → Reports
2. Windows PWA: сол URL-ды PWA ретінде орнат → сол қадамдар
3. Windows Electron: EXE іске қос → сол қадамдар
4. Android: APK орнат → BottomNav: Overview, Search, Analytics, Trends, Competitors, Settings → сол қадамдар

Барлығында: бірдей mock аккаунттар (almaty_toys 45.2K, toy_world_kz 128K...), бірдей KPI, бірдей видео (LEGO 12.3K...), бірдей хэштегтер (#ойыншық 342), бірдей AI қорытындысы, бірдей Export disclaimer

---

© 2026 SOCIAL PULSE • Web + Windows + Android • 100% бірдей функционал • DEMO MODE
