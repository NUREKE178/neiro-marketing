package com.socialpulse.android.ui.navigation

sealed class Screen(val route: String, val title: String, val emoji: String) {
    object Overview : Screen("overview", "Overview", "📊")
    object Search : Screen("search", "Search", "🔍")
    object Analytics : Screen("analytics", "Analytics", "📈")
    object Trends : Screen("trends", "Trends", "🔥")
    object Competitors : Screen("competitors", "Competitors", "⚔️")
    object Saved : Screen("saved", "Saved", "🔖")
    object Reports : Screen("reports", "Reports", "📄")
    object Settings : Screen("settings", "Settings", "⚙️")
}
