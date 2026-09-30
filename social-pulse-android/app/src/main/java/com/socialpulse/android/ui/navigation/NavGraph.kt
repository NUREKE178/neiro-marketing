package com.socialpulse.android.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.socialpulse.android.ui.screens.analytics.AnalyticsScreen
import com.socialpulse.android.ui.screens.competitors.CompetitorsScreen
import com.socialpulse.android.ui.screens.overview.OverviewScreen
import com.socialpulse.android.ui.screens.reports.ReportsScreen
import com.socialpulse.android.ui.screens.saved.SavedScreen
import com.socialpulse.android.ui.screens.search.SearchScreen
import com.socialpulse.android.ui.screens.settings.SettingsScreen
import com.socialpulse.android.ui.screens.trends.TrendsScreen

@Composable
fun AppNavGraph(navController: NavHostController) {
    NavHost(navController = navController, startDestination = Screen.Overview.route) {
        composable(Screen.Overview.route) { OverviewScreen(navController) }
        composable(Screen.Search.route) { SearchScreen(navController) }
        composable(Screen.Analytics.route) { AnalyticsScreen(navController) }
        composable(Screen.Trends.route) { TrendsScreen(navController) }
        composable(Screen.Competitors.route) { CompetitorsScreen(navController) }
        composable(Screen.Saved.route) { SavedScreen(navController) }
        composable(Screen.Reports.route) { ReportsScreen(navController) }
        composable(Screen.Settings.route) { SettingsScreen(navController) }
    }
}
