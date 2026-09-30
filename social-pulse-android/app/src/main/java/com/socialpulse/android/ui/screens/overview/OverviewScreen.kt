package com.socialpulse.android.ui.screens.overview

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
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
        containerColor = Background,
        topBar = {}
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                // Hero - Improved
                Box {
                    Box(modifier = Modifier.matchParentSize().offset(8.dp, 8.dp).background(Black).border(3.dp, Black))
                    Card(modifier = Modifier.fillMaxWidth().border(4.dp, Black), shape = androidx.compose.foundation.shape.RoundedCornerShape(0.dp), colors = CardDefaults.cardColors(containerColor = PrimaryYellow)) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Box(modifier = Modifier.background(Black).border(3.dp, Black).padding(12.dp)) {
                                    Icon(Icons.Filled.Bolt, contentDescription = null, tint = PrimaryYellow, modifier = Modifier.size(28.dp))
                                }
                                Column {
                                    Text("SOCIAL PULSE", fontWeight = FontWeight.Black, fontSize = 24.sp, letterSpacing = (-1).sp, lineHeight = 24.sp)
                                    Text("ANALYTICS SAAS", fontWeight = FontWeight.Black, fontSize = 12.sp, letterSpacing = 2.sp, color = Black.copy(0.6f))
                                }
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Text("Find Trends. Analyze Content.", fontWeight = FontWeight.Black, fontSize = 16.sp)
                            Text("Make Smarter Moves.", fontWeight = FontWeight.Black, fontSize = 16.sp, color = Black.copy(0.7f))
                            Spacer(modifier = Modifier.height(12.dp))
                            Box(modifier = Modifier.background(Black).padding(horizontal = 10.dp, vertical = 6.dp)) {
                                Text("DEMO DATA — нақты аккаунт статистикасы емес", color = PrimaryYellow, fontSize = 11.sp, fontWeight = FontWeight.Black)
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Instagram және TikTok рұқсат етілген деректер негізінде. 1,247 аккаунт, 12.4K видео талданды.", fontSize = 12.sp, fontWeight = FontWeight.Bold, lineHeight = 16.sp)
                        }
                    }
                }
            }

            item {
                // KPI Grid - Improved with icons
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        KpiCard("Жалпы талданған", "1,247", "+12% соңғы ай", PrimaryYellow, modifier = Modifier.weight(1f), icon = "👥")
                        KpiCard("Видео саны", "12.4K", "342 жаңа", Purple, modifier = Modifier.weight(1f), icon = "🎬")
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        KpiCard("Сақталған", "23", "5 аккаунт", Pink, modifier = Modifier.weight(1f), icon = "🔖")
                        KpiCard("Есептер", "8", "2 PDF", Blue, modifier = Modifier.weight(1f), icon = "📄")
                    }
                }
            }

            item {
                // Search CTA - Brutal
                Box {
                    Box(modifier = Modifier.matchParentSize().offset(6.dp, 6.dp).background(Black).border(3.dp, Black))
                    Card(modifier = Modifier.fillMaxWidth().border(3.dp, Black), shape = androidx.compose.foundation.shape.RoundedCornerShape(0.dp), colors = CardDefaults.cardColors(containerColor = White)) {
                        Row(modifier = Modifier.padding(16.dp).fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("WHAT'S TRENDING?", fontWeight = FontWeight.Black, fontSize = 14.sp)
                                Text("Іздеу: ойыншық, coffee, @username", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Black.copy(0.6f))
                            }
                            Box(modifier = Modifier.background(Black).border(3.dp, Black).padding(horizontal = 16.dp, vertical = 10.dp)) {
                                Text("ANALYZE →", color = PrimaryYellow, fontWeight = FontWeight.Black, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }

            item {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Box(modifier = Modifier.background(Black).padding(horizontal = 8.dp, vertical = 4.dp)) {
                        Text("СОҢҒЫ ТАЛДАУЛАР", color = White, fontWeight = FontWeight.Black, fontSize = 12.sp, letterSpacing = 0.5.sp)
                    }
                    DemoBadge()
                }
            }

            items(MockData.accounts.take(3)) { acc ->
                Box {
                    Box(modifier = Modifier.matchParentSize().offset(5.dp, 5.dp).background(Black).border(3.dp, Black))
                    Card(modifier = Modifier.fillMaxWidth().border(3.dp, Black), shape = androidx.compose.foundation.shape.RoundedCornerShape(0.dp), colors = CardDefaults.cardColors(containerColor = White)) {
                        Row(modifier = Modifier.padding(14.dp).fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                            // Avatar with brutal border
                            Box(modifier = Modifier.border(3.dp, Black).background(Color.LightGray).size(48.dp), contentAlignment = Alignment.Center) {
                                Text(acc.username.first().uppercase(), fontWeight = FontWeight.Black, fontSize = 20.sp)
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("@${acc.username}", fontWeight = FontWeight.Black, fontSize = 14.sp)
                                    Box(modifier = Modifier.background(if (acc.platform.name == "INSTAGRAM") Purple else Pink).border(2.dp, Black).padding(horizontal = 6.dp, vertical = 2.dp)) {
                                        Text(acc.platform.display.uppercase(), fontSize = 9.sp, fontWeight = FontWeight.Black)
                                    }
                                }
                                Text(acc.displayName, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Text("👥 ${formatNumber(acc.followers)}", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    Text("👁️ ${formatNumber(acc.avgViews)}", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    Text("⚡ ${acc.engagementRate}%", fontSize = 11.sp, fontWeight = FontWeight.Black)
                                }
                                Text("Instagram • ${acc.lastPostDate} • ${acc.source}", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Black.copy(0.5f))
                            }
                            Box(modifier = Modifier.background(Black).border(2.dp, PrimaryYellow).padding(horizontal = 6.dp, vertical = 4.dp)) {
                                Text("DEMO", color = PrimaryYellow, fontSize = 9.sp, fontWeight = FontWeight.Black)
                            }
                        }
                    }
                }
            }

            item {
                // PRO Card - Improved
                Box {
                    Box(modifier = Modifier.matchParentSize().offset(6.dp, 6.dp).background(Black).border(3.dp, Black))
                    Card(modifier = Modifier.fillMaxWidth().border(3.dp, Black), shape = androidx.compose.foundation.shape.RoundedCornerShape(0.dp), colors = CardDefaults.cardColors(containerColor = Black)) {
                        Row(modifier = Modifier.padding(18.dp).fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.background(PrimaryYellow).border(3.dp, White).padding(10.dp)) {
                                    Icon(Icons.Filled.RocketLaunch, contentDescription = null, tint = Black, modifier = Modifier.size(24.dp))
                                }
                                Column {
                                    Text("SOCIAL PULSE PRO", color = White, fontWeight = FontWeight.Black, fontSize = 14.sp, letterSpacing = 0.5.sp)
                                    Text("Толық API, экспорт, AI, команда", color = White.copy(0.7f), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                            Box(modifier = Modifier.background(PrimaryYellow).border(3.dp, White).padding(horizontal = 14.dp, vertical = 8.dp)) {
                                Text("PRO →", color = Black, fontWeight = FontWeight.Black, fontSize = 11.sp)
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(100.dp))
            }
        }
    }
}
