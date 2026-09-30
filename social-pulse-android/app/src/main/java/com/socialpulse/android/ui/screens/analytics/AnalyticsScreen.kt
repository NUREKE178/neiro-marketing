package com.socialpulse.android.ui.screens.analytics

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.socialpulse.android.data.model.MockData
import com.socialpulse.android.data.model.formatNumber
import com.socialpulse.android.ui.components.BrutalBarChart
import com.socialpulse.android.ui.components.BrutalCard
import com.socialpulse.android.ui.components.BrutalLineChart
import com.socialpulse.android.ui.components.DemoBadge
import com.socialpulse.android.ui.components.KpiCard
import com.socialpulse.android.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(navController: NavController) {
    var dateRange by remember { mutableStateOf("Last 7 days") }
    val account = MockData.accounts[0]
    val videos = MockData.videos.filter { it.accountId == account.id }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("ACCOUNT ANALYTICS", fontWeight = FontWeight.Black) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Purple)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                BrutalCard {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                            Column {
                                Text("@${account.username} ${account.platform.emoji}", fontWeight = FontWeight.Black, fontSize = 18.sp)
                                Text(account.displayName, fontWeight = FontWeight.Bold)
                                Text(account.bio, fontSize = 11.sp)
                            }
                            DemoBadge()
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        // Date filter
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("Today", "Last 7 days", "Last 30 days", "Custom").forEach { range ->
                                val isSel = dateRange == range
                                FilterChip(
                                    selected = isSel,
                                    onClick = { dateRange = range },
                                    label = { Text(range, fontSize = 10.sp, fontWeight = FontWeight.Black) },
                                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = PrimaryYellow)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Талдау кезеңі: $dateRange • Соңғы жаңарту: ${account.lastPostDate} • Дереккөз: ${account.source} • DEMO DATA", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    KpiCard("Followers", formatNumber(account.followers), "+12.5% алдыңғы кезең", PrimaryYellow, Modifier.weight(1f))
                    KpiCard("Total Views", formatNumber(account.totalViews), "+8.3%", Blue, Modifier.weight(1f))
                    KpiCard("Total Likes", formatNumber(account.totalLikes), "-2.1%", Purple, Modifier.weight(1f))
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    KpiCard("Comments", formatNumber(account.totalComments), "+5.4%", Pink, Modifier.weight(1f))
                    KpiCard("Videos", account.totalVideos.toString(), "+3", White, Modifier.weight(1f))
                    KpiCard("Avg Views", formatNumber(account.avgViews), "+15.2%", PrimaryYellow, Modifier.weight(1f))
                }
            }

            item {
                Text("📊 Charts • DEMO DATA", fontWeight = FontWeight.Black, fontSize = 16.sp)
                BrutalCard(background = Blue) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Views by Video • Нақты дерек", fontWeight = FontWeight.Black, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        BrutalBarChart(data = videos.map { it.title.take(6) to it.views }, barColor = PrimaryYellow)
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
                BrutalCard(background = Purple) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Posting Frequency • Last 7 days", fontWeight = FontWeight.Black, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        BrutalLineChart(data = MockData.postingFrequency)
                    }
                }
            }

            item {
                Text("Video Performance Table • DEMO DATA", fontWeight = FontWeight.Black)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = {}, modifier = Modifier.border(3.dp, Black), colors = ButtonDefaults.buttonColors(containerColor = Black)) {
                        Text("Views ↕", fontSize = 10.sp, fontWeight = FontWeight.Black, color = White)
                    }
                    Button(onClick = {}, modifier = Modifier.border(3.dp, Black)) {
                        Text("Likes ↕", fontSize = 10.sp, fontWeight = FontWeight.Black)
                    }
                    Button(onClick = {}, modifier = Modifier.border(3.dp, Black)) {
                        Text("Date ↕", fontSize = 10.sp, fontWeight = FontWeight.Black)
                    }
                }
            }

            items(videos) { video ->
                BrutalCard {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(video.title, fontWeight = FontWeight.Black, fontSize = 13.sp)
                        Text(video.caption, fontSize = 11.sp, maxLines = 2)
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("👁️ ${formatNumber(video.views)}", fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.border(2.dp, Black).padding(4.dp))
                            Text("❤️ ${formatNumber(video.likes)}", fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.border(2.dp, Black).padding(4.dp))
                            Text("💬 ${video.comments}", fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.border(2.dp, Black).padding(4.dp))
                            Text("ER ${video.engagementRate}%", fontWeight = FontWeight.Black, fontSize = 11.sp, modifier = Modifier.border(2.dp, Black).padding(4.dp))
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Формула: (Likes+Comments+Shares)/Views*100 = ${video.engagementRate}% • ${video.hashtags.joinToString(" #", prefix = "#")}", fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Text("Дереккөз: ${account.source} • ${video.publishedAt} • ${video.isDemo}", fontSize = 9.sp)
                    }
                }
            }

            item {
                Text("AI Content Analyst", fontWeight = FontWeight.Black, fontSize = 16.sp)
                BrutalCard(background = PrimaryYellow) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("📊 Нақты дерек (API)", fontWeight = FontWeight.Black, fontSize = 12.sp)
                        Text("• Аккаунт 127 видео жариялаған, соңғы 7 күнде 4 видео\n• Ең көп қаралым: 12,300 (LEGO)\n• Орташа ER: 4.2%\n• Дереккөз: Instagram API (demo) • 2024-09-30", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                BrutalCard(background = Blue) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("🧮 Есептелген көрсеткіш", fontWeight = FontWeight.Black, fontSize = 12.sp)
                        Text("• ER = (890+45+12)/12300*100 = 7.7%\n• Орташа қаралым: 892K/127=7,023\n• Жиілік: аптасына 4.2 видео\n• Формула: (Likes+Comments)/Followers*100", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                BrutalCard(background = Purple) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("🤖 AI Интерпретациясы", fontWeight = FontWeight.Black, fontSize = 12.sp)
                        Text("• Негізінен showcase формат\n• Распаковка жоғары ER (7.8%)\n• Ұсыныс: 18:00-20:00 жариялау, #ойыншық хэштег\n• AI болжамы кепілдік емес, тек идея", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            item {
                BrutalCard(background = Black) {
                    Text("⚠️ Бұл есеп тек қолжетімді жария деректер мен рұқсат етілген API нәтижелеріне негізделген. Деректер толық болмауы мүмкін. Snapshot жоқ болса тарихи динамика қолжетімсіз.", color = White, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(12.dp))
                }
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}
