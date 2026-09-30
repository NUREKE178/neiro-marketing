package com.socialpulse.android.ui.screens.settings

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.socialpulse.android.ui.components.BrutalCard
import com.socialpulse.android.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("SETTINGS", fontWeight = FontWeight.Black) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = White)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                BrutalCard(background = PrimaryYellow) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("API Кілттері • Backend-та ғана", fontWeight = FontWeight.Black)
                        Spacer(modifier = Modifier.height(8.dp))
                        Column(modifier = Modifier.border(2.dp, Black).padding(8.dp)) {
                            Text("Instagram Access Token", fontSize = 10.sp, fontWeight = FontWeight.Black)
                            Text("••••••••••••••••", fontWeight = FontWeight.Bold)
                            Text("Тек backend-та сақталады", fontSize = 9.sp)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Column(modifier = Modifier.border(2.dp, Black).padding(8.dp)) {
                            Text("TikTok Client Key", fontSize = 10.sp, fontWeight = FontWeight.Black)
                            Text("••••••••••••••••", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            item {
                BrutalCard {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Қауіпсіздік және Шектеулер", fontWeight = FontWeight.Black)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("• Жеке/құпия аккаунтқа рұқсатсыз кірмеу\n• Scraping, CAPTCHA айналып өтуге тыйым\n• Rate limit, кештеу, қате өңдеу\n• OAuth арқылы өз аккаунтын байланыстыру\n• Дереккөз әр карточкада", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            item {
                BrutalCard(background = Black) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Тіл • Language", color = White, fontWeight = FontWeight.Black)
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = {}, colors = ButtonDefaults.buttonColors(containerColor = PrimaryYellow)) { Text("Қазақша", color = Black, fontWeight = FontWeight.Black, fontSize = 11.sp) }
                            Button(onClick = {}, colors = ButtonDefaults.buttonColors(containerColor = White)) { Text("Русский", color = Black, fontWeight = FontWeight.Black, fontSize = 11.sp) }
                            Button(onClick = {}, colors = ButtonDefaults.buttonColors(containerColor = White)) { Text("English", color = Black, fontWeight = FontWeight.Black, fontSize = 11.sp) }
                        }
                    }
                }
            }

            item {
                BrutalCard(background = White) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("SOCIAL PULSE v1.0", fontWeight = FontWeight.Black)
                        Text("DEMO DATA — нақты аккаунт статистикасы емес\n© 2026 Social Pulse • Neo-Brutalism SaaS", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}
