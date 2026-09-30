# NEIRO

Instagram/TikTok креатор аналитика платформасы: аккаунтты талдау (views/likes/видео тізімі), геолокация бойынша ниша ізделеу, апталық Топ‑5 рейтинг. Neo-brutalism дизайн.

## Құрылым

```
client/   Vite + React 19 + TypeScript — веб-интерфейс
server/   Express + TypeScript + SQLite — API, деректерді кэштеу, RapidAPI интеграциясы
```

## Іске қосу

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

Деректер демо/mock емес — RapidAPI арқылы нақты Instagram/TikTok аккаунттарынан алынады. Кілт қойылмаса, "Талдау" беті провайдер теңшелмегені туралы хабарлайды (бұл дұрыс күй, жалған сан көрсетілмейді). Толық нұсқау: [`server/README.md`](server/README.md).

## Платформалар

- **Web** — дайын, `client/` (осы репо).
- **Android** — жоспарланған: web кодын [Capacitor](https://capacitorjs.com/) арқылы қаптау. Android Studio/SDK осы контейнерде жоқ, сондықтан .apk шығару локальде жасалады.
- **Windows** — жоспарланған: web кодын [Tauri](https://tauri.app/) арқылы desktop-қа қаптау. Rust toolchain осы контейнерде жоқ, сондықтан .exe шығару локальде жасалады.

## Дизайн

Neo-brutalism: қалың қара жиектер, hard-offset көлеңкелер, қанық түс блоктары (сары/пink/көк/лайм), blocky типографика. Токендер: `client/src/styles/tokens.css` (light + dark).
