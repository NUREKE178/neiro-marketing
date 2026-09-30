# SOCIAL PULSE — Instagram & TikTok Analytics SaaS

**Tagline:** “Find Trends. Analyze Content. Make Smarter Moves.”

Neo-Brutalism UI/UX • Premium SaaS • Responsive Web App • Next.js 14 • TypeScript • Tailwind • Prisma • AI

> **DEMO DATA — нақты аккаунт статистикасы емес.** Барлық көрсетілген аккаунт, видео, метрика — демо, оқу мақсатында.

---

## 🚀 Толық стек

**Frontend:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, TanStack Query, Zustand

**Backend:** Next.js API Routes (NestJS-ке дайын), TypeScript, PostgreSQL + Prisma ORM, Redis (кештеу), Background Jobs (BullMQ дайын)

**Auth:** NextAuth.js (Google + Email), рөлдер

**AI:** LLM контент қорытындылаушы, тақырып классификация, тренд түсіндірме — нақты дерек / есептелген / AI интерпретациясы бөлек

**Deploy:** Vercel, PostgreSQL (Neon/Supabase), Docker, .env

---

## 🎨 Дизайн — Neo-Brutalism

- Түстер: Primary #D9FF3F, Black #111111, White #FFFFFF, Purple #A78BFA, Pink #FF75B5, Blue #76D7FF, Background #F5F4EF
- Қалың қара border (3-4px), қатты көлеңке 6px, bold typography (Syne + Space Grotesk), геометриялық блоктар, hover-де қозғалу
- Responsive desktop/tablet/mobile, sidebar, skeleton, empty, error, toast, tooltip, modal, dropdown, date picker, table sort/filter, dark mode дайын, i18n құрылымы (kk/ru/en)

---

## 🔍 Басты бет — Smart Search

- Үлкен тақырып: “What’s trending in your market?”
- Іздеу жолағы: `Search a niche, account, product or paste a link...`
- Қабылдайды: @username, profile URL, video URL, өнім атауы, ниша
- Мысал: @example_creator, https://instagram.com/..., ойыншық, coffee shop
- Батырма: ANALYZE →
- Платформа таңдау: All, Instagram, TikTok
- Геолокация міндетті емес, браузер рұқсаты + қолмен қала таңдау, нақты мекенжай жиналмайды

**Search by Niche:** ойыншық → тақырып анықта → рұқсат етілген дереккөз → қала сүзгі → салыстыру → Top 5 аккаунт (профиль суреті, username, bio, followers, соңғы жарияланым, видео саны, avg views/likes, engagement, белсенділік, анализ батырмасы). Сұрыптау: жарияланым, қаралым, лайк, ER, күн. Tooltip-пен формула, дерек жоқ болса “дерек жеткіліксіз”.

---

## 📊 Account Analytics

- Overview: avatar, username, displayName, платформа белгісі, сыртқы сілтеме, талдау кезеңі, соңғы жаңарту
- KPI: Followers, Total views, Total likes, Total comments, Videos published, Average views — әрқайсысында алдыңғы кезеңмен салыстыру, өсу %, түсіндірме. Қолжетімсіз → “API арқылы қолжетімсіз”
- Video Performance Table: thumbnail, title/caption, date, views, likes, comments, shares, ER, URL. Sort, search, platform filter, date filter. Атауы жоқ болса caption қысқаша
- Video Detail: thumbnail, caption, date, views/likes/comments/shares, ER, тақырып, AI қорытындысы (тек caption + метрика, видеоны көргендей талдамау)

**Date Filter:** Today, Yesterday, Last 7/14/30/90 days, Custom range. Күнтізбе. Кезең өзгерсе кесте/KPI/график жаңарады. Snapshot жоқ болса “тарихи динамика қолжетімсіз” ескерту.

---

## 📈 Trend Analytics

- Тақырып енгізу: ойыншық, косметика, киім, кофе...
- Көрсетеді: аккаунттар, соңғы жарияланымдар, топ қаралым/лайк, белсенділік, хэштегтер, жиі сөздер, форматтар
- Charts: Views by video, Likes by video, Posts by date, Engagement by account, Posting frequency — тек нақты дерек, болжам ерекше стиль

---

## 🤖 AI Content Analyst

- Қорытынды: қандай тақырып, формат жиі, қай видео топ, қай күндері жиі, caption тақырыптары, стратегия идеялары
- 3 топ: 1) Нақты дерек (API), 2) Есептелген (формула), 3) AI интерпретация (ұсыныс). Жалған дәлдік, кепілдік жоқ

## 🧮 Engagement Rate Calculator

- Video: (Likes+Comments+Shares)/Views*100
- Account: (Likes+Comments)/Followers*100
- Формула көрсетіледі, әртүрлі формула ескерту, нөлге бөлу өңделген

## ⚔️ Competitor Comparison

- Бірнеше аккаунт қосу, кесте + график: атау, followers, жарияланым, avg views/likes, ER, жиілік, топ видео. Дерек жоқ → “Дерек қолжетімсіз”, нөлге ауыстырмау

## 📄 Export Report

- PDF, CSV, Excel
- PDF: платформа атауы, аккаунт, кезең, дереккөздер, KPI, графиктер, топ видеолар, AI қорытындысы, қолжетімділік ескертуі
- Соңында: “Бұл есеп тек қолжетімді жария деректер мен рұқсат етілген API нәтижелеріне негізделген. Деректер толық болмауы мүмкін”

---

## 🔒 API, Дереккөздер, Шектеулер

- Тек ресми API, рұқсат етілген интеграция, заңды жария дерек
- Жеке/құпия аккаунтқа рұқсатсыз кірмеу, scraping/CAPTCHA айналып өтуге тыйым
- API қолжетімсіз санды ойдан жасамау
- OAuth арқылы өз аккаунтын байланыстыру сценарийі
- API кілттері тек backend-та, Rate limit, кештеу, қате өңдеу, дереккөз белгісі
- Үшінші тарап аккаунт метрикасы шектеулі болса, шектеуді ашық көрсету, балама: қолмен енгізу, CSV импорт, иесі рұқсатымен қосылу
- Әр карточкада дереккөз + соңғы жаңарту

---

## 🗂️ SaaS Dashboard

**Sidebar:** Overview, Search, Account Analytics, Trend Discovery, Competitor Comparison, Saved Accounts, Reports, Settings

**Header:** Global Search, Platform selector, Date filter, Notifications, User profile

**Overview:** жалпы талданған, видео саны, соңғы талдау, saved, трендтер, соңғы есептер. Free/Pro UI бар, төлем жұмыс істейді деп көрсетілмеген

**UX Flow:** кіру → орталық Search → платформа → қала → Analyze → Loading → нәтиже (аккаунт, видео, метрика, график, AI) → күн сүзгі → сақтау/салыстыру/экспорт. Әр қадамда loading/empty/success/error

---

## 📁 Жоба құрылымы

```
social-pulse/
├── src/
│   ├── app/
│   │   ├── layout.tsx, page.tsx (Smart Search), globals.css
│   │   ├── (dashboard)/ overview, search, analytics, trends, competitors, saved, reports, settings
│   │   └── api/ analyze, accounts, trends, export
│   ├── components/
│   │   ├── ui/ button, card, input, badge
│   │   ├── layout/ Sidebar, Header
│   │   ├── search/, analytics/, trends/
│   ├── lib/ utils, mockData, db, ai
│   ├── store/ useSearchStore (zustand)
│   └── types/ index.ts
├── prisma/ schema.prisma
├── .env.example
├── tailwind.config.ts, next.config.js, tsconfig.json
└── package.json
```

---

## ⚙️ Орнату

```bash
cd social-pulse
npm install
cp .env.example .env
# DATABASE_URL қажет емес, демо mock-пен жұмыс істейді
npm run dev
# http://localhost:3000
```

**Postgres қосу (опционал):**
```bash
# .env-да DATABASE_URL қой
npx prisma db push
npx prisma generate
```

**Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Vercel Deploy:**
- Vercel-ге import → Environment Variables қою → Deploy
- Postgres: Neon.tech немесе Supabase
- Redis: Upstash

---

## 🧪 Тест және Demo

- Барлық бетте DEMO DATA белгісі
- Mock аккаунт: almaty_toys, toy_world_kz, balalar_alemi, coffee_almaty, beauty_kz
- Өңір: Алматы, Астана, Шымкент, Қазақстан, өңірі расталмаған
- Engagement формуласы tooltip-те

---

## 📦 Нәтиже

1. ✅ Frontend - Next.js + Neo-Brutalism
2. ✅ Backend API - /api/analyze, /api/accounts, /api/trends, /api/export
3. ✅ DB Schema - Prisma + PostgreSQL (User, SavedAccount, Search, AccountAnalytics, Video, Report)
4. ✅ API архитектура - ресми API, rate limit, cache, OAuth дайын
5. ✅ Responsive Neo-Brutalism UI - #D9FF3F, #111111, border-3, shadow 6px, hover move
6. ✅ Smart Search - niche/account/video/link, platform selector, region
7. ✅ Account Analytics - KPI, video table sort/filter, detail
8. ✅ Date Filter - Today...Custom, KPI/chart жаңару
9. ✅ Video Performance Table - thumbnail, title, views/likes/comments/ER
10. ✅ Trend Discovery - hashtags, common words, posting frequency, views chart
11. ✅ AI Analysis - real/calculated/interpretation бөлек
12. ✅ Competitor Comparison - multi select, table+chart
13. ✅ Export Report - PDF/CSV/Excel mock, disclaimer
14. ✅ Authentication - NextAuth structure, Google/Email
15. ✅ Setup - README, .env.example
16. ✅ Deploy - Vercel, Docker, env

Сапа: кәсіби SaaS, бірегей визуал, толық жұмыс істейтін компоненттер, әрі қарай дамытуға дайын.

---

© 2026 SOCIAL PULSE • DEMO MODE
