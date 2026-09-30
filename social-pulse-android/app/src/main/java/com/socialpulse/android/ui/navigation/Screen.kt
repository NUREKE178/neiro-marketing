package com.socialpulse.android.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val shortTitle: String, val emoji: String, val icon: ImageVector, val color: androidx.compose.ui.graphics.Color) {
    object Overview : Screen("overview", "Overview", "Home", "📊", Icons.Filled.Dashboard, androidx.compose.ui.graphics.Color(0xFFD9FF3F))
    object Search : Screen("search", "Search", "Search", "🔍", Icons.Filled.Search, androidx.compose.ui.graphics.Color(0xFFFFFFFF))
    object Analytics : Screen("analytics", "Analytics", "Stats", "📈", Icons.Filled.BarChart, androidx.compose.ui.graphics.Color(0xFFA78BFA))
    object Trends : Screen("trends", "Trend Discovery", "Trends", "🔥", Icons.Filled.Whatshot, androidx.compose.ui.graphics.Color(0xFFFF75B5))
    object Competitors : Screen("competitors", "Competitors", "Vs", "⚔️", Icons.Filled.CompareArrows, androidx.compose.ui.graphics.Color(0xFF76D7FF))
    object Saved : Screen("saved", "Saved", "Saved", "🔖", Icons.Filled.Bookmark, androidx.compose.ui.graphics.Color(0xFFF5F4EF))
    object Reports : Screen("reports", "Reports", "Export", "📄", Icons.Filled.Description, androidx.compose.ui.graphics.Color(0xFFD9FF3F))
    object Settings : Screen("settings", "Settings", "More", "⚙️", Icons.Filled.Settings, androidx.compose.ui.graphics.Color(0xFFFFFFFF))
}
