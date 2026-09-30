package com.sanasuzgisi.mindfilter.ui.navigation

sealed class Screen(val route: String, val title: String, val emoji: String) {
    object Home : Screen("home", "Басты", "🏠")
    object Neuromarketing : Screen("neuromarketing", "Нейромаркетинг", "🧠")
    object Simulator : Screen("simulator", "Симулятор", "🤖")
    object Skills : Screen("skills", "Дағдылар", "✅")
    object Stats : Screen("stats", "Статистика", "📊")
    object Research : Screen("research", "Зерттеу", "🔬")
    object Presentation : Screen("presentation", "Қорғау", "🎤")
}
