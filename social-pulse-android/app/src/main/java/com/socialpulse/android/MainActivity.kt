package com.socialpulse.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.socialpulse.android.ui.navigation.AppNavGraph
import com.socialpulse.android.ui.navigation.Screen
import com.socialpulse.android.ui.theme.SocialPulseTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SocialPulseTheme {
                val navController = rememberNavController()
                val bottomItems = listOf(
                    Screen.Overview,
                    Screen.Search,
                    Screen.Analytics,
                    Screen.Trends,
                    Screen.Competitors,
                    Screen.Settings
                )

                Scaffold(
                    bottomBar = {
                        NavigationBar(containerColor = androidx.compose.ui.graphics.Color.White) {
                            val navBackStackEntry by navController.currentBackStackEntryAsState()
                            val currentRoute = navBackStackEntry?.destination?.route
                            bottomItems.forEach { screen ->
                                NavigationBarItem(
                                    selected = currentRoute == screen.route,
                                    onClick = {
                                        if (currentRoute != screen.route) {
                                            navController.navigate(screen.route) {
                                                popUpTo(Screen.Overview.route) { saveState = true }
                                                launchSingleTop = true
                                                restoreState = true
                                            }
                                        }
                                    },
                                    icon = { Text(screen.emoji) },
                                    label = { Text(screen.title, fontWeight = FontWeight.Black, style = MaterialTheme.typography.labelSmall) }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    Surface(modifier = Modifier.padding(innerPadding)) {
                        AppNavGraph(navController = navController)
                    }
                }
            }
        }
    }
}
