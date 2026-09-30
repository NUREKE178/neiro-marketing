package com.socialpulse.android.ui.screens.competitors

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
import com.socialpulse.android.ui.components.BrutalCard
import com.socialpulse.android.ui.components.DemoBadge
import com.socialpulse.android.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompetitorsScreen(navController: NavController) {
    var selected by remember { mutableStateOf(setOf("1", "2", "3")) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("COMPETITOR COMPARISON", fontWeight = FontWeight.Black) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Blue)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text("Аккаунттарды таңда:", fontWeight = FontWeight.Black)
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    MockData.accounts.forEach { acc ->
                        val isSel = selected.contains(acc.id)
                        FilterChip(
                            selected = isSel,
                            onClick = {
                                selected = if (isSel) selected - acc.id else selected + acc.id
                            },
                            label = { Text("@${acc.username}", fontSize = 10.sp, fontWeight = FontWeight.Black) }
                        )
                    }
                }
            }

            item {
                DemoBadge()
                Spacer(modifier = Modifier.height(8.dp))
                // Simple table header
                Row(modifier = Modifier.fillMaxWidth().border(3.dp, Black).padding(8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Аккаунт", fontWeight = FontWeight.Black, fontSize = 10.sp, modifier = Modifier.weight(1f))
                    Text("Followers", fontWeight = FontWeight.Black, fontSize = 10.sp, modifier = Modifier.weight(1f))
                    Text("Avg Views", fontWeight = FontWeight.Black, fontSize = 10.sp, modifier = Modifier.weight(1f))
                    Text("ER", fontWeight = FontWeight.Black, fontSize = 10.sp, modifier = Modifier.weight(0.5f))
                }
            }

            items(MockData.accounts.filter { selected.contains(it.id) }) { acc ->
                Row(modifier = Modifier.fillMaxWidth().border(3.dp, Black).padding(8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("@${acc.username}", fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.weight(1f))
                    Text(formatNumber(acc.followers), fontWeight = FontWeight.Black, fontSize = 11.sp, modifier = Modifier.weight(1f))
                    Text(formatNumber(acc.avgViews), fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.weight(1f))
                    Text("${acc.engagementRate}%", fontWeight = FontWeight.Black, fontSize = 11.sp, modifier = Modifier.weight(0.5f))
                }
            }

            item {
                if (selected.isEmpty()) {
                    BrutalCard {
                        Text("Аккаунт таңдалмаған", modifier = Modifier.padding(16.dp), fontWeight = FontWeight.Black)
                    }
                }
            }

            item {
                BrutalCard(background = White) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("⚠️ Егер аккаунт дерегі жетіспесе, бос мәнді нөлге ауыстырмаймыз. «Дерек қолжетімсіз» деп көрсетеміз.", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Формула: Engagement Rate = (Likes+Comments)/Followers*100", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}
