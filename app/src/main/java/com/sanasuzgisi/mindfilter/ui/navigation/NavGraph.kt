package com.sanasuzgisi.mindfilter.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.sanasuzgisi.mindfilter.ui.screens.home.HomeScreen
import com.sanasuzgisi.mindfilter.ui.screens.neuromarketing.NeuromarketingScreen
import com.sanasuzgisi.mindfilter.ui.screens.presentation.PresentationModeScreen
import com.sanasuzgisi.mindfilter.ui.screens.research.ResearchScreen
import com.sanasuzgisi.mindfilter.ui.screens.simulator.AlgorithmSimulatorScreen
import com.sanasuzgisi.mindfilter.ui.screens.skills.SkillsScreen
import com.sanasuzgisi.mindfilter.ui.screens.stats.StatsScreen

@Composable
fun AppNavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) {
            HomeScreen(navController)
        }
        composable(Screen.Neuromarketing.route) {
            NeuromarketingScreen(navController)
        }
        composable(Screen.Simulator.route) {
            AlgorithmSimulatorScreen(navController)
        }
        composable(Screen.Skills.route) {
            SkillsScreen(navController)
        }
        composable(Screen.Stats.route) {
            StatsScreen(navController)
        }
        composable(Screen.Research.route) {
            ResearchScreen(navController)
        }
        composable(Screen.Presentation.route) {
            PresentationModeScreen(navController)
        }
    }
}
