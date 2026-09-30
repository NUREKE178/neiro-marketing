package com.socialpulse.android.ui.screens.search

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
import com.socialpulse.android.data.model.Platform
import com.socialpulse.android.data.model.Region
import com.socialpulse.android.data.model.formatNumber
import com.socialpulse.android.ui.components.BrutalCard
import com.socialpulse.android.ui.components.BrutalBadge
import com.socialpulse.android.ui.components.DemoBadge
import com.socialpulse.android.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(navController: NavController) {
    var query by remember { mutableStateOf("ойыншық") }
    var selectedPlatform by remember { mutableStateOf(Platform.ALL) }
    var selectedRegion by remember { mutableStateOf(Region.ALMATY) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("SMART SEARCH", fontWeight = FontWeight.Black) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = PrimaryYellow)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                BrutalCard(background = White) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("What's trending in your market?", fontWeight = FontWeight.Black, fontSize = 22.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = query,
                            onValueChange = { query = it },
                            placeholder = { Text("Search a niche, account, product or paste a link...") },
                            modifier = Modifier.fillMaxWidth().border(3.dp, Black),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Platform.values().forEach { p ->
                                val isSelected = selectedPlatform == p
                                Button(
                                    onClick = { selectedPlatform = p },
                                    colors = ButtonDefaults.buttonColors(containerColor = if (isSelected) Black else White, contentColor = if (isSelected) White else Black),
                                    modifier = Modifier.border(3.dp, Black)
                                ) {
                                    Text(p.display, fontWeight = FontWeight.Black, fontSize = 11.sp)
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Region.values().take(5).forEach { r ->
                                val isSel = selectedRegion == r
                                FilterChip(
                                    selected = isSel,
                                    onClick = { selectedRegion = r },
                                    label = { Text(r.display, fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                                    colors = FilterChipDefaults.filterChipColors(selectedContainerColor = PrimaryYellow)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("⚠️ Геолокация қате болуы мүмкін. Қолмен өзгерт. Нақты мекенжай жиналмайды.", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = {},
                            modifier = Modifier.fillMaxWidth().border(3.dp, Black),
                            colors = ButtonDefaults.buttonColors(containerColor = Black)
                        ) {
                            Text("ANALYZE →", color = White, fontWeight = FontWeight.Black)
                        }
                    }
                }
            }

            item {
                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    Text("TOP 5 • ${query} • ${selectedRegion.display}", fontWeight = FontWeight.Black)
                    DemoBadge()
                }
            }

            items(MockData.accounts.take(5)) { acc ->
                BrutalCard(background = PrimaryYellow) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("@${acc.username} ${acc.platform.emoji}", fontWeight = FontWeight.Black)
                            BrutalBadge(if (acc.regionVerified) "✓ ${acc.region.display}" else "өңірі расталмаған", background = if (acc.regionVerified) Black else White)
                        }
                        Text(acc.displayName, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text(acc.bio, fontSize = 11.sp, maxLines = 2)
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Column(modifier = Modifier.border(2.dp, Black).padding(6.dp).weight(1f)) {
                                Text("FOLLOWERS", fontSize = 9.sp, fontWeight = FontWeight.Black)
                                Text(formatNumber(acc.followers), fontWeight = FontWeight.Black)
                            }
                            Column(modifier = Modifier.border(2.dp, Black).padding(6.dp).weight(1f)) {
                                Text("AVG VIEWS", fontSize = 9.sp, fontWeight = FontWeight.Black)
                                Text(formatNumber(acc.avgViews), fontWeight = FontWeight.Black)
                            }
                            Column(modifier = Modifier.border(2.dp, Black).padding(6.dp).weight(1f)) {
                                Text("ER", fontSize = 9.sp, fontWeight = FontWeight.Black)
                                Text("${acc.engagementRate}%", fontWeight = FontWeight.Black)
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Дереккөз: ${acc.source} • ${acc.lastPostDate} • DEMO DATA", fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(80.dp)) }
        }
    }
}
