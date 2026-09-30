# SOCIAL PULSE — Android App

**Tagline:** “Find Trends. Analyze Content. Make Smarter Moves.”

Neo-Brutalism UI/UX • Android • Kotlin + Jetpack Compose • MVVM • Room • DataStore

> **DEMO DATA — нақты аккаунт статистикасы емес**

## Технология

- Kotlin, Jetpack Compose, Material3, Navigation Compose, MVVM, Room, DataStore, ViewModel
- Neo-Brutalism: #D9FF3F Primary, #111111 Black, border 3px, hard shadow, bold typography
- Mock data: 5 аккаунт (almaty_toys, toy_world_kz, balalar_alemi, coffee_almaty, beauty_kz), 5 видео

## Бөлімдер (Web-пен бірдей)

- **Overview:** KPI (Жалпы талданған, Видео, Сақталған, Есептер), соңғы талдаулар, трендтер, PRO карта
- **Search:** Smart Search (niche/account/link), Platform (All/Instagram/TikTok), Region (Алматы...), Top 5, өңірі расталмаған белгісі
- **Analytics:** Account Overview, KPI (Followers, Total Views/Likes/Comments, Videos, Avg Views) + салыстыру, Video Performance Table (thumbnail, title, views/likes/comments/ER, formula tooltip), AI Analyst (Нақты дерек / Есептелген / Интерпретация)
- **Trends:** Хэштегтер, жиі сөздер, posting frequency, контент форматтары, график ескертуі
- **Competitors:** Multi-select аккаунт, кесте (Followers, Avg Views, ER), салыстыру, “Дерек қолжетімсіз” handling, формула
- **Saved:** Сақталған аккаунттар
- **Reports:** PDF/CSV/Excel mock, disclaimer: “Бұл есеп тек қолжетімді жария деректер...”
- **Settings:** API кілттері backend-та ғана, қауіпсіздік шектеулер, тіл (kk/ru/en)

## Этика

- Тек рұқсат етілген дерек, жеке/құпия аккаунтқа тыйым, scraping жоқ, API кілттері backend-та, rate limit, дереккөз әр карточкада, DEMO DATA белгісі

## Құрастыру

```bash
# Android Studio-да ашу
File → Open → social-pulse-android
# Sync → Run
# APK
./gradlew assembleDebug
# app/build/outputs/apk/debug/app-debug.apk
```

## Дизайн

- Primary #D9FF3F, Black #111111, White #FFFFFF, Purple #A78BFA, Pink #FF75B5, Blue #76D7FF, Background #F5F4EF
- BrutalCard: border 3px black, shadow, hover move
- BottomNav: Overview, Search, Analytics, Trends, Competitors, Settings
- Responsive, Kazakh interface

© 2026 SOCIAL PULSE Android • DEMO MODE
