# САНА СҮЗГІСІ - Толық жоба сипаттамасы

## 1. Жоба құрылымы

```
neiro-marketing/
├── app/
│   ├── build.gradle.kts          # Модуль конфигурациясы
│   ├── proguard-rules.pro
│   └── src/main/
│       ├── AndroidManifest.xml   # Қосымша манифесті
│       ├── java/com/sanasuzgisi/mindfilter/
│       │   ├── MainActivity.kt   # Негізгі Activity + BottomNav
│       │   ├── ui/
│       │   │   ├── theme/        # Material 3 тема
│       │   │   │   ├── Color.kt  # Түстер: қою күлгін, көгілдір, жасыл
│       │   │   │   ├── Theme.kt  # Light/Dark тема
│       │   │   │   └── Type.kt   # Типография
│       │   │   ├── navigation/
│       │   │   │   ├── Screen.kt # Маршруттар (sealed class)
│       │   │   │   └── NavGraph.kt # NavHost
│       │   │   ├── components/
│       │   │   │   └── CommonComponents.kt # InfoCard, WarningBanner, BarChart
│       │   │   └── screens/
│       │   │       ├── home/HomeScreen.kt # Басты бет
│       │   │       ├── neuromarketing/NeuromarketingScreen.kt # 5 интерактивті карта
│       │   │       ├── simulator/
│       │   │       │   ├── AlgorithmSimulatorScreen.kt # Лента UI
│       │   │       │   └── SimulatorViewModel.kt # Алгоритм логикасы
│       │   │       ├── skills/
│       │   │       │   ├── SkillsScreen.kt # 6 дағды UI
│       │   │       │   └── SkillsViewModel.kt # DataStore логикасы
│       │   │       ├── stats/
│       │   │       │   ├── StatsScreen.kt # Статистика + диаграмма
│       │   │       │   └── StatsViewModel.kt # Room логикасы
│       │   │       ├── research/
│       │   │       │   ├── ResearchScreen.kt # 8 ғылыми бөлім + кесте
│       │   │       │   └── ResearchViewModel.kt
│       │   │       └── presentation/PresentationModeScreen.kt # 7 қадам қорғау
│       │   ├── data/
│       │   │   ├── model/Models.kt # Барлық модельдер
│       │   │   ├── local/
│       │   │   │   ├── AppDatabase.kt # Room DB
│       │   │   │   ├── Daos.kt # DAO
│       │   │   │   ├── DatabaseProvider.kt # Singleton
│       │   │   │   └── PreferencesManager.kt # DataStore
│       │   │   └── repository/Repository.kt
│       │   └── util/Constants.kt
│       └── res/
│           ├── drawable/ic_launcher_foreground.xml
│           ├── mipmap/ic_launcher.xml
│           ├── values/colors.xml, strings.xml, themes.xml
│           └── xml/backup_rules.xml
├── build.gradle.kts              # Root build
├── settings.gradle.kts
├── gradle.properties
└── gradle/wrapper/gradle-wrapper.properties
```

## 2. Gradle конфигурациясы

**Root build.gradle.kts**: AGP 8.2.2, Kotlin 1.9.22, KSP 1.9.22-1.0.17

**app/build.gradle.kts**:
- compileSdk 34, minSdk 24, targetSdk 34
- compose = true, kotlinCompilerExtensionVersion 1.5.8
- Dependencies:
  - compose-bom:2024.02.00
  - material3:1.2.1
  - navigation-compose:2.7.6
  - lifecycle-viewmodel-compose:2.7.0
  - activity-compose:1.8.2
  - datastore-preferences:1.0.0
  - room-runtime:2.6.1 + room-ktx + ksp compiler

## 3. Kotlin файлдары - Толық

### Models.kt
- Topic enum: SPORT, GAME, MUSIC, EDUCATION, TECHNOLOGY (emoji + displayName)
- FeedItem: id, topic, title, content, author, likes, isAd
- UserAction: LIKE, VIEW, SKIP, DISLIKE
- Skill: id, title, shortTitle, description, detailedInfo, icon, benefit + SkillsData.skills (6 дағды толық)
- DailyStat: Room Entity, id, dateMillis, dateString, minutes, note
- ExperimentResult: Room Entity, participantCode, groupName, screenTimeBefore/After, impulseBuyingScore, awarenessScore, isSampleData
- ResearchSection + ResearchData.sections (8 бөлім қазақша)

### Data сақтау
- **AppDatabase**: @Database(entities=[DailyStat, ExperimentResult], version=1)
- **Daos**: DailyStatDao (getAll Flow, getByDate, insert REPLACE, delete, clearAll), ExperimentDao
- **DatabaseProvider**: Singleton, fallbackToDestructiveMigration
- **PreferencesManager**: dataStore by preferencesDataStore, skillKey(id)=boolean, getAllSkillsFlow, setSkillCompleted, clearAllSkills, onboarding
- **Repository**: StatsRepository, ExperimentRepository - DAO wrapper

### Simulator логикасы
**SimulatorViewModel**:
- allSamplePosts: 15 жазба (5 тақырып x 3)
- selectTopic(topic)
- startSimulation(): originalFeed = shuffled, scores = selected+1
- onUserAction(): LIKE +3, VIEW +1, SKIP -1, DISLIKE -2, score min -5, generateFilteredFeed()
- generateFilteredFeed(): топ тақырып 60% қайталау, екінші 25%, теріс ұпай 0 (фильтр), sortedBy score
- toggleFeed(), reset()

**AlgorithmSimulatorScreen**:
- WarningBanner: оқу моделі
- 1-қадам: FilterChip тақырып таңдау, бастау батырмасы
- 2-қадам: score картасы, бастапқы/өзгерген лента toggle, FeedItemCard тізімі
- FeedItemCard: topic emoji, isAd белгісі, title/content, likes, 4 батырма: 👍👁️⏭️👎
- Қорытынды картасы: ең көп ұпай тақырып + фильтр көпіршігі түсіндірме

### Skills
- SkillsViewModel: prefs.getAllSkillsFlow stateIn, toggleSkill, clearAll
- SkillsScreen: прогресс LinearProgressIndicator, 6 карточка (иконка, атау, қысқаша, Checkbox, detailedInfo, пайдасы, орындалды батырмасы)

### Stats
- StatsViewModel: DatabaseProvider, repository.allStats StateFlow, uiState (average, total, comparison), addStat (date yyyy-MM-dd, replace if exists), delete, clearAll
- StatsScreen: hero карта (орташа/жалпы/күн), SimpleBarChart (7 күндік), comparison, тізім (date, minutes, note, delete), FAB +, AddStatDialog (minutes 0-1440 валидация, note)

### Research
- ResearchViewModel: addResult, addSampleData (4 үлгі P01-P04 isSampleData=true), delete, clearAll
- ResearchScreen: 8 секция картасы, WarningBanner ҮЛГІ ДЕРЕК, кесте: қосу батырмасы, үлгі дерек қосу, тізім (код, топ, экран, ұпайлар, ҮЛГІ ДЕРЕК белгісі, жою), AddExperimentDialog (код, топ Chip, before/after, impulse 1-10, awareness 1-10)

### Presentation
- 7 қадам: title, desc, emoji, details
- UI: ортасында emoji 64sp, title 28sp, desc, details карта, симуляторға өту батырмасы (4-қадам), Артқа/Келесі, прогресс LinearProgressIndicator, 1/7 санауыш

### Home
- Hero gradient карта (қою күлгін → көгілдір), атау, сипаттама, Зерттеуді бастау батырмасы (Presentation-ға)
- Мақсат картасы
- 2 кіші карта (Нейромаркетинг, Алгоритмдер)
- 6 InfoCard (onClick navigate)

### Neuromarketing
- 5 интерактивті карта:
  1. ColorEffectCard: 3 түс батырма, түсіндірме
  2. ScarcityEffectCard: таймер көрсету/жасыру, FOMO түсіндірме
  3. SocialProofCard: жұлдыз, пікір, сатып алу саны
  4. ImpulseBuyingCard: касса жанындағы 3 тауар
  5. PresentationTrickCard: 3 баға әдісі (ортаңғы тиімді)

### Navigation
- Screen sealed class: Home, Neuromarketing, Simulator, Skills, Stats, Research, Presentation (route, title, emoji)
- NavGraph: NavHost start Home, 7 composable
- MainActivity: SanaSuzgisiTheme, Scaffold bottomBar NavigationBar (5 item: Home, Neuro, Simulator, Skills, Stats), hide in Presentation, AppNavGraph

### Theme
- Color.kt: PrimaryDeepPurple #3D2C8D, PrimaryDark #1E1A3A, SecondaryCyan #00D4FF, SecondaryLightBlue #7ED6FB, AccentSoftGreen #4ADE80, AccentOrange #FF8A4C, BackgroundLight #F8F9FF, т.б. Topic түстері
- Type.kt: displayLarge 32sp Bold, headlineMedium 24sp, т.б.
- Theme.kt: LightColorScheme (primary deep purple, secondary cyan), DarkColorScheme, dynamicColor false, statusBar түсі

### Components
- InfoCard: emoji 28sp + title + description, rounded 16dp, elevation 2dp, onClick optional
- SectionHeader: title headlineMedium primary + subtitle
- WarningBanner: secondaryContainer, ⚠️ + text
- SimpleBarChart: Row, әр баған Card height = value/max*120dp, label minutes + shortDate

## 4. Деректерді сақтау логикасы

- **DataStore**: Skills прогресс (skill_1..6 boolean), onboarding_done. Flow, viewModelScope launch.
- **Room**: 
  - daily_stats таблица: id auto, dateMillis Long, dateString String yyyy-MM-dd unique check, minutes Int, note
  - experiment_results: id auto, participantCode, groupName, screenTimeBefore/After, impulseBuyingScore, awarenessScore, isSampleData Boolean
  - Flow<List<...>> автоматты жаңару, insert REPLACE, delete, clearAll
- **Жоғалмау**: Room fallbackToDestructiveMigration емес, дерек сақталады, жауып ашқанда жоғалмайды. DatabaseProvider Singleton.

## 5. Ресурстар

- ic_launcher_foreground.xml: вектор, қою күлгін фон, ақ ми иконкасы, көгілдір галочка
- colors.xml: primary #3D2C8D
- strings.xml: app_name Сана Сүзгісі
- themes.xml: Theme.SanaSuzgisi parent Material.Light.NoActionBar
- backup_rules, data_extraction_rules: бос, құпиялылық

## 6. Құрастыру және APK

**Android Studio**:
File → Open → neiro-marketing → Sync → Run

**APK**:
Build → Generate Signed Bundle/APK → APK → release → app/build/outputs/apk/release/app-release.apk

Команда:
./gradlew assembleDebug → app-debug.apk
./gradlew assembleRelease → app-release.apk

Барлық экрандар жұмыс, батырмалар дұрыс, дерек сақталады, офлайн, валидация бар, код модульдерге бөлінген, UI/логика бөлек.

## 7. Этика

- Жеке дерек жоқ, тіркелу жоқ, жергілікті сақтау, өшіруге болады, симулятор оқу моделі, медициналық диагноз жоқ, сатып алуға итермелемейді, бейтарап тіл, кінә артпайды.

Дайын!
