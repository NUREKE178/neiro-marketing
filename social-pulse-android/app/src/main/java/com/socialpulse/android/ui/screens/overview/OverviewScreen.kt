package com.socialpulse.android.ui.screens.overview

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.socialpulse.android.data.model.MockData
import com.socialpulse.android.data.model.formatNumber
import com.socialpulse.android.ui.components.BrutalCard
import com.socialpulse.android.ui.components.DemoBadge
import com.socialpulse.android.ui.components.KpiCard
import com.socialpulse.android.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OverviewScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("SOCIAL PULSE • OVERVIEW", fontWeight = FontWeight.Black) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = PrimaryYellow)
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
                        Row {
                            Text("⚡", fontSize = 24.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text("SOCIAL PULSE", fontWeight = FontWeight.Black, fontSize = 20.sp)
                                Text("Find Trends. Analyze Content. Make Smarter Moves.", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("DEMO DATA — нақты аккаунт статистикасы емес. Instagram және TikTok рұқсат етілген деректер негізінде.", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    KpiCard("Жалпы талданған", "1,247", "+12% соңғы ай", PrimaryYellow, modifier = Modifier.weight(1f))
                    KpiCard("Видео саны", "12.4K", "342 жаңа", Purple, modifier = Modifier.weight(1f))
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    KpiCard("Сақталған", "23", "5 аккаунт", Pink, modifier = Modifier.weight(1f))
                    KpiCard("Есептер", "8", "2 PDF", Blue, modifier = Modifier.weight(1f))
                }
            }

            item {
                Text("Соңғы талдаулар • DEMO DATA", fontWeight = FontWeight.Black, fontSize = 16.sp)
            }

            items(MockData.accounts.take(3)) { acc ->
                BrutalCard {
                    Row(modifier = Modifier.padding(12.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("@${acc.username} ${acc.platform.emoji}", fontWeight = FontWeight.Black, fontSize = 14.sp)
                            Text(acc.displayName, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            Text("${acc.platform.display} • ${acc.lastPostDate} • ${acc.source}", fontSize = 10.sp)
                        }
                        DemoBadge()
                    }
                }
            }

            item {
                BrutalCard(background = Black) {
                    Row(modifier = Modifier.padding(16.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("SOCIAL PULSE PRO", color = White, fontWeight = FontWeight.Black)
                            Text("Толық API, экспорт, AI талдау", color = White.copy(0.7f), fontSize = 11.sp)
                        }
                        Button(onClick = {}, colors = ButtonDefaults.buttonColors(containerColor = PrimaryYellow)) {
                            Text("PRO →", color = Black, fontWeight = FontWeight.Black)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}
