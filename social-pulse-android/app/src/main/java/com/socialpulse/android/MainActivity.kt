package com.socialpulse.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.socialpulse.android.ui.navigation.AppNavGraph
import com.socialpulse.android.ui.navigation.Screen
import com.socialpulse.android.ui.theme.Black
import com.socialpulse.android.ui.theme.PrimaryYellow
import com.socialpulse.android.ui.theme.SocialPulseTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SocialPulseTheme {
                val navController = rememberNavController()
                val drawerState = rememberDrawerState(DrawerValue.Closed)
                val scope = rememberCoroutineScope()
                
                // 5 primary bottom items (Material guideline max 5)
                val bottomItems = listOf(
                    Screen.Overview,
                    Screen.Search,
                    Screen.Analytics,
                    Screen.Trends,
                    Screen.Settings
                )
                
                // All items for drawer
                val allItems = listOf(
                    Screen.Overview,
                    Screen.Search,
                    Screen.Analytics,
                    Screen.Trends,
                    Screen.Competitors,
                    Screen.Saved,
                    Screen.Reports,
                    Screen.Settings
                )

                ModalNavigationDrawer(
                    drawerState = drawerState,
                    drawerContent = {
                        ModalDrawerSheet(drawerContainerColor = Color.White, drawerContentColor = Black) {
                            // Drawer header - Brutal
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(PrimaryYellow)
                                    .border(0.dp, Black, shape = androidx.compose.foundation.shape.RoundedCornerShape(0.dp))
                            ) {
                                Column(modifier = Modifier.padding(24.dp)) {
                                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Box(modifier = Modifier.background(Black).border(3.dp, Black).padding(10.dp)) {
                                            Text("⚡", fontSize = 24.sp, color = PrimaryYellow)
                                        }
                                        Column {
                                            Text("SOCIAL PULSE", fontWeight = FontWeight.Black, fontSize = 20.sp, letterSpacing = (-0.5).sp)
                                            Text("Find Trends. Analyze Content.", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Box(modifier = Modifier.background(Black).padding(horizontal = 8.dp, vertical = 4.dp)) {
                                        Text("DEMO DATA — нақты статистика емес", color = PrimaryYellow, fontSize = 10.sp, fontWeight = FontWeight.Black)
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            allItems.forEach { screen ->
                                val navBackStackEntry by navController.currentBackStackEntryAsState()
                                val currentRoute = navBackStackEntry?.destination?.route
                                val isSelected = currentRoute == screen.route
                                
                                NavigationDrawerItem(
                                    label = { 
                                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                            Icon(screen.icon, contentDescription = null, modifier = Modifier.size(20.dp))
                                            Text(screen.title, fontWeight = FontWeight.Black, fontSize = 13.sp)
                                        }
                                    },
                                    selected = isSelected,
                                    onClick = {
                                        scope.launch { drawerState.close() }
                                        if (currentRoute != screen.route) {
                                            navController.navigate(screen.route) {
                                                popUpTo(Screen.Overview.route) { saveState = true }
                                                launchSingleTop = true
                                                restoreState = true
                                            }
                                        }
                                    },
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 2.dp).border(if (isSelected) 3.dp else 0.dp, Black),
                                    colors = NavigationDrawerItemDefaults.colors(
                                        selectedContainerColor = screen.color,
                                        unselectedContainerColor = Color.White
                                    )
                                )
                            }
                            Spacer(modifier = Modifier.height(16.dp))
                            Box(modifier = Modifier.padding(16.dp).border(3.dp, Black).background(Black).fillMaxWidth().padding(12.dp)) {
                                Column {
                                    Text("PRO-ға жаңарту →", color = PrimaryYellow, fontWeight = FontWeight.Black, fontSize = 12.sp)
                                    Text("Толық API, экспорт, AI", color = Color.White, fontSize = 10.sp)
                                }
                            }
                        }
                    }
                ) {
                    Scaffold(
                        topBar = {
                            // Brutal TopBar
                            Box {
                                Box(modifier = Modifier.matchParentSize().offset(0.dp, 4.dp).background(Black))
                                CenterAlignedTopAppBar(
                                    title = {
                                        val navBackStackEntry by navController.currentBackStackEntryAsState()
                                        val current = allItems.find { it.route == navBackStackEntry?.destination?.route } ?: Screen.Overview
                                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                            Icon(current.icon, contentDescription = null, modifier = Modifier.size(20.dp))
                                            Text(current.title.uppercase(), fontWeight = FontWeight.Black, fontSize = 14.sp, letterSpacing = 0.5.sp)
                                        }
                                    },
                                    navigationIcon = {
                                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                            Icon(Icons.Filled.Menu, contentDescription = "Menu", modifier = Modifier.border(2.dp, Black).padding(4.dp))
                                        }
                                    },
                                    colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = PrimaryYellow),
                                    modifier = Modifier.border(0.dp, Black).border(3.dp, Black)
                                )
                            }
                        },
                        bottomBar = {
                            Box {
                                Box(modifier = Modifier.matchParentSize().offset(0.dp, (-4).dp).background(Black))
                                NavigationBar(
                                    containerColor = Color.White,
                                    contentColor = Black,
                                    tonalElevation = 0.dp,
                                    modifier = Modifier.border(3.dp, Black)
                                ) {
                                    val navBackStackEntry by navController.currentBackStackEntryAsState()
                                    val currentRoute = navBackStackEntry?.destination?.route
                                    bottomItems.forEach { screen ->
                                        val isSelected = currentRoute == screen.route
                                        NavigationBarItem(
                                            selected = isSelected,
                                            onClick = {
                                                if (currentRoute != screen.route) {
                                                    navController.navigate(screen.route) {
                                                        popUpTo(Screen.Overview.route) { saveState = true }
                                                        launchSingleTop = true
                                                        restoreState = true
                                                    }
                                                }
                                            },
                                            icon = {
                                                Box(
                                                    modifier = Modifier
                                                        .background(if (isSelected) screen.color else Color.Transparent)
                                                        .border(if (isSelected) 2.dp else 0.dp, Black)
                                                        .padding(6.dp)
                                                ) {
                                                    Icon(screen.icon, contentDescription = screen.title, modifier = Modifier.size(22.dp))
                                                }
                                            },
                                            label = {
                                                Text(
                                                    screen.shortTitle,
                                                    fontWeight = FontWeight.Black,
                                                    fontSize = 10.sp,
                                                    letterSpacing = 0.3.sp,
                                                    maxLines = 1
                                                )
                                            },
                                            colors = NavigationBarItemDefaults.colors(
                                                selectedIconColor = Black,
                                                unselectedIconColor = Black,
                                                selectedTextColor = Black,
                                                unselectedTextColor = Black,
                                                indicatorColor = Color.Transparent
                                            )
                                        )
                                    }
                                }
                            }
                        }
                    ) { innerPadding ->
                        Surface(modifier = Modifier.padding(innerPadding), color = Color(0xFFF5F4EF)) {
                            AppNavGraph(navController = navController)
                        }
                    }
                }
            }
        }
    }
}
