# NEIRO — Neuromarketing Lab

Жарнама креативтерін (A/B және одан да көп нұсқа) нақты адамдардың бет-экспрессия реакциясымен тексеретін платформа: маркетолог тест жасайды, көрермендер сілтеме арқылы камера алдында креативтерді қарайды (видео құрылғыдан ешқашан шықпайды — тек FACS-негізіндегі smile/confusion/attention сигналдары жіберіледі), ал AI қай нұсқа жақсы жұмыс істегенін және неліктен екенін жазбаша түсіндіреді. Neo-brutalism дизайн. Web + Android + Windows.

## Қалай жұмыс істейді

1. Маркетолог `/` бетінде тест жасайды, 2+ креатив (сурет URL + мәтін) қосады.
2. `/watch/:id` сілтемесін көрермендерге жібереді — ешқандай тіркелу/баптау керек емес.
3. Көрермен камера рұқсатын береді, браузердің өзінде (MediaPipe FaceLandmarker, WASM) бет-экспрессия өлшенеді, нәтиже — тек сандар — серверге жіберіледі.
4. Маркетолог нәтиже бетінде креативтерді салыстырады (графика + AI жазбаша қорытынды).

Толық архитектура, деректер моделі және API: [`server/README.md`](server/README.md).

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
cp .env.example .env   # SESSION_SECRET толтыру керек (міндетті) — қараңыз server/README.md
npm run dev             # http://localhost:8093

# 2) frontend (жаңа терминалда)
cd client
npm install
npm run dev             # http://localhost:5173
```

⚠️ Камера (`getUserMedia`) қауіпсіз контекст талап етеді — `localhost` жұмыс істейді, бірақ prod-та HTTPS міндетті (Vercel автоматты түрде береді).

---

## 1. Vercel-ге шығару (веб)

Ең оңай жол — GitHub репозиторийін Vercel dashboard арқылы қосу (CLI/токен керек емес):

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → `NUREKE178/neiro-marketing` таңда.
2. Vercel `vercel.json`-ды автоматты түрде таниды (build command, output, `/api` routing — бәрі дайын, қосымша баптау керек емес).
3. **Environment Variables** бөлімінде қос:
   - `SESSION_SECRET` (міндетті — маркетолог жағы, [server/README.md](server/README.md#required-configuration))
   - `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (міндетті — Vercel-де жергілікті файл жүйесі жоқ, [server/README.md](server/README.md#database) қара)
   - `ANTHROPIC_API_KEY` (міндетті емес — AI жазбаша қорытынды үшін; жоқ болса нәтиже бетінде сандар/графика бәрібір көрінеді, тек AI бөлімі "теңшелмеген" дейді)
4. **Deploy** бас. Бірнеше минуттан кейін `https://<жоба-аты>.vercel.app` дайын.

Кейін әр push (осы бранчқа немесе `main`-ге, Vercel жоба баптауына байланысты) автоматты redeploy жасайды.

## 2. Android (.apk)

Бұл sandbox-тың желі саясаты `dl.google.com`-ды (Android Gradle Plugin осыдан жүктеледі) бұғаттайды, сондықтан .apk осы жерде құрастырылмады. Бірақ:

- `client/android/` — толық Capacitor Android жобасы, git-ке committed, дайын.
- `.github/workflows/android.yml` — `client/`-ке push кезінде GitHub Actions-та (шектеусіз желі) нақты debug .apk құрастырады да, run-нің **Artifacts** бөліміне жүктейді.
- Камера рұқсаты (`CAMERA` permission) `AndroidManifest.xml`-ге қосылған.

Өзіңде локальде құрастырғың келсе (Android Studio орнатылған болса):
```bash
cd client && npm run build && npx cap sync android
cd android && ./gradlew assembleDebug
# нәтиже: android/app/build/outputs/apk/debug/app-debug.apk
```

## 3. Windows (.exe)

Бұл — осы контейнерде нақты құрастырылды (Rust + mingw-w64 арқылы, `x86_64-pc-windows-gnu` target): алдыңғы нұсқа (`NEIRO_0.1.0_x64-setup.exe`), сессия чатында жіберілген. Камера мүмкіндігі қосылғаннан кейін қайта құрастыру ұсынылады — WebView2 камера рұқсатын әдеттегі браузердей сұрайды, қосымша Tauri баптау қажет емес.

Қайта құрастыру үшін (осы контейнерде де, өз машинаңда да):
```bash
cd client && npm install
npx tauri build --bundles nsis
# нәтиже: client/src-tauri/target/{release или x86_64-pc-windows-gnu/release}/bundle/nsis/*.exe
```

`.github/workflows/windows.yml` де бар — `windows-latest` runner-де табиғи түрде құрастырады (әр push сайын).

## Дизайн

Neo-brutalism: қалың қара жиектер, hard-offset көлеңкелер, қанық түс блоктары (сары/pink/көк/лайм), blocky типографика. Токендер: `client/src/styles/tokens.css` (light + dark). Графика түстері брендтік блок-түстерден бөлек, colorblind-safe валидацияланған палитра қолданады (`--chart-series-*` токендер).
