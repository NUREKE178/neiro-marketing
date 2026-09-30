# SOCIAL PULSE — Windows нұсқасын орнату

## 3 тәсіл бар — бәрі бірдей функционал

### ТӘСІЛ 1: PWA ретінде орнату (Ең оңай, 10 секунд, ұсынылады)

1. Chrome / Edge браузерінде аш: `http://localhost:3000` немесе Vercel сілтемең
2. Адрес жолағында оң жақта **Install** иконкасы шығады (компьютер иконкасы) → бас
3. Немесе Chrome меню → `Save and Share → Install Social Pulse`
4. Windows-та жеке қосымша болып орнатылады, Пуск менюінде, рабочий столда иконка пайда болады
5. Офлайн да жұмыс істейді (PWA cache)

**Артықшылығы:** 1 клик, автоматты жаңарту, жеңіл, Windows, Mac, Linux бәрінде жұмыс істейді

---

### ТӘСІЛ 2: Electron EXE орнату (Нағыз Windows қосымшасы)

**Дайын EXE жасау:**

```bash
cd social-pulse
npm install
npm run build
npm run electron:build:win
```

Нәтиже:
- `dist/Social Pulse Setup 1.0.0.exe` — орнатушы (NSIS)
- `dist/Social-Pulse-Portable-1.0.0.exe` — portable, орнатусыз іске қосылады

**Орнату:**
1. `Social Pulse Setup 1.0.0.exe` екі рет бас
2. Next → Орнату орнын таңда → Install
3. Рабочий столда және Пуск-та иконка пайда болады
4. Іске қос

**Portable:**
- `Social-Pulse-Portable-1.0.0.exe` кез келген жерге көшіріп, екі рет бас — болды, орнату керек емес

**Талап:** Windows 10/11 x64, 200MB бос орын

---

### ТӘСІЛ 3: Android APK-ны Windows-та іске қосу

Windows 11-де Android қолдауы бар:

1. Windows-та `Amazon Appstore` немесе `WSA (Windows Subsystem for Android)` қос
2. `social-pulse-android/app/build/outputs/apk/debug/app-debug.apk` файлын жүкте
3. `adb install app-debug.apk` арқылы орнату

**Немесе эмулятор:**
- BlueStacks, LDPlayer, Nox → APK-ны сүйреп апарып таста

---

## Барлық платформада бірдей функционал

| Функция | Web | Windows (PWA) | Windows (Electron) | Android |
|---------|-----|---------------|-------------------|---------|
| Smart Search (niche/account/link) | ✅ | ✅ | ✅ | ✅ |
| Platform selector (All/IG/TikTok) | ✅ | ✅ | ✅ | ✅ |
| Region (Алматы, Астана...) | ✅ | ✅ | ✅ | ✅ |
| Top 5 аккаунт, өңірі расталмаған | ✅ | ✅ | ✅ | ✅ |
| Account Analytics KPI + comparison | ✅ | ✅ | ✅ | ✅ |
| Video Performance Table sort/filter | ✅ | ✅ | ✅ | ✅ |
| Date Filter Today...Custom | ✅ | ✅ | ✅ | ✅ |
| Trend Discovery hashtags/words | ✅ | ✅ | ✅ | ✅ |
| Charts (Views, Posting frequency) | ✅ | ✅ | ✅ | ✅ (Canvas) |
| AI Analyst Real/Calculated/Interpretation | ✅ | ✅ | ✅ | ✅ |
| Engagement Calculator формула | ✅ | ✅ | ✅ | ✅ |
| Competitor Comparison | ✅ | ✅ | ✅ | ✅ |
| Export PDF/CSV/Excel | ✅ | ✅ | ✅ | ✅ |
| DEMO DATA белгісі | ✅ | ✅ | ✅ | ✅ |
| Offline | PWA cache | ✅ | ✅ | ✅ Room |

**Дизайн:** Барлығында бірдей Neo-Brutalism — #D9FF3F, #111111, border 3px, shadow 6px, bold typography

---

## Жиі сұрақ

**Windows-та қайсысын таңдау керек?**
- Тез керек болса → PWA (10 сек)
- Нағыз қосымша керек болса → Electron EXE (орнатушы)

**Дерек қайдан алынады?**
Қазір DEMO DATA — нақты аккаунт статистикасы емес. Рұқсат етілген ресми API қосылғанда нақты дерек шығады. Кодта `src/lib/mockData.ts` және `src/app/api/` дайын архитектура бар.

**Интернет керек пе?**
- Web/PWA: алғашқы жүктеуде иә, кейін cache-пен офлайн
- Electron: офлайн жұмыс істейді, бірақ жаңа талдау үшін интернет керек
- Android: Room + DataStore офлайн

© 2026 SOCIAL PULSE • Windows + Android + Web • Бірдей функционал
