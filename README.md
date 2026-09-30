# NEIRO-MARKETING MONOREPO

Бұл репозиторийде 2 толыққанды жоба бар:

## 1. 🧠 САНА СҮЗГІСІ (MindFilter) — Android қосымшасы

**Ғылыми жоба:** «Нейромаркетинг және цифрлық алгоритмдер: әлеуметтік желілер адам таңдауын қалай басқарады?»

- **Платформа:** Android, Kotlin, Jetpack Compose, Material 3, MVVM, Room, DataStore
- **Бөлімдер:** Басты бет, Нейромаркетинг (5 интерактивті), Алгоритм симуляторы, 6 дағды, Статистика, Зерттеу, Қорғау режимі
- **Орналасқан жері:** `/app` — Android Studio жобасы
- **Құжаттама:** `JOBA_TOLYQ_SIPATTAMASY.md` және `ҚҰРАСТЫРУ_НҰСҚАУЛЫҒЫ.md`

```bash
# Android Studio-да ашу
File → Open → neiro-marketing (root)
# APK
./gradlew assembleDebug
```

---

## 2. 📊 SOCIAL PULSE — Instagram & TikTok Analytics SaaS

**Tagline:** “Find Trends. Analyze Content. Make Smarter Moves.”

Neo-Brutalism UI/UX • Premium SaaS • Responsive Web App

**Стек:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, TanStack Query, Zustand, Prisma, PostgreSQL, NextAuth, AI

**Дизайн:** Neo-Brutalism — #D9FF3F Primary, #111111 Black, қалың border 3-4px, қатты көлеңке 6px, bold typography (Syne + Space Grotesk)

**Орналасқан жері:** `/social-pulse`

### Негізгі мүмкіндіктер

- **Smart Search:** @username, URL, niche (ойыншық, coffee shop), платформа таңдау (All/Instagram/TikTok), өңір (Алматы, Астана...), геолокация опционал
- **Search by Niche:** Top 5 аккаунт карточкасы (avatar, bio, followers, avg views/likes, ER, белсенділік, өңір расталған/расталмаған), сұрыптау
- **Account Analytics:** Overview, KPI (Followers, Total views/likes/comments, Videos, Avg views) + салыстыру, Video Performance Table (thumbnail, title, date, views/likes/comments/ER, sort/filter), Video Detail + AI
- **Date Filter:** Today, Yesterday, Last 7/14/30/90 days, Custom
- **Trend Discovery:** хэштегтер, жиі сөздер, posting frequency, views chart, контент форматтары
- **AI Analyst:** Нақты дерек / Есептелген / AI интерпретациясы бөлек, жалған дәлдік жоқ
- **Engagement Calculator:** Video (Likes+Comments+Shares)/Views*100, Account (Likes+Comments)/Followers*100
- **Competitor Comparison:** көп аккаунт таңдау, кесте + график, дерек жоқ → “Дерек қолжетімсіз”
- **Export:** PDF/CSV/Excel, disclaimer: “Бұл есеп тек қолжетімді жария деректер...”
- **API:** /api/analyze, /api/accounts, /api/trends, /api/export — ресми API ғана, scraping жоқ, rate limit, cache, OAuth, дереккөз әр карточкада
- **SaaS Dashboard:** Sidebar (Overview, Search, Analytics, Trends, Competitors, Saved, Reports, Settings), Header (Search, Platform, Date, Notifications), Overview (KPI, соңғы талдау, трендтер)

### Орнату

```bash
cd social-pulse
npm install
cp .env.example .env
npm run dev
# http://localhost:3000
```

**Build:**
```bash
npm run build
npm start
```

**Docker:**
```bash
docker build -t social-pulse .
docker run -p 3000:3000 social-pulse
```

**Vercel Deploy:** Vercel-ге import → env қою → Deploy

### Демо

Барлық жерде **DEMO DATA — нақты аккаунт статистикасы емес** белгісі бар. Mock: almaty_toys, toy_world_kz, balalar_alemi, coffee_almaty, beauty_kz

---

## 📁 Құрылым

```
neiro-marketing/
├── app/                          # Android - Sana Suzgisi
│   ├── src/main/java/...         # Kotlin + Compose
│   └── build.gradle.kts
├── social-pulse/                 # Web - Social Pulse SaaS
│   ├── src/app/                  # Next.js 14 App Router
│   │   ├── page.tsx              # Smart Search
│   │   ├── (dashboard)/          # Overview, Search, Analytics, Trends, Competitors, Saved, Reports, Settings
│   │   └── api/                  # analyze, accounts, trends, export
│   ├── src/components/ui/        # button, card, input, badge, skeleton
│   ├── src/components/layout/    # Sidebar, Header
│   ├── src/lib/                  # utils, mockData, db, ai
│   ├── prisma/schema.prisma
│   └── package.json
├── README.md
└── ...
```

---

## 🔒 Этика және Қауіпсіздік

- **Sana Suzgisi:** жеке дерек жоқ, офлайн, медициналық диагноз жоқ, бейтарап тіл
- **Social Pulse:** тек ресми API, жеке/құпия аккаунтқа рұқсатсыз кірмеу, scraping/CAPTCHA айналып өтуге тыйым, API кілттері backend-та ғана, rate limit, дереккөз белгісі, OAuth

---

© 2026 NEIRO-MARKETING • Sana Suzgisi + Social Pulse • DEMO MODE
