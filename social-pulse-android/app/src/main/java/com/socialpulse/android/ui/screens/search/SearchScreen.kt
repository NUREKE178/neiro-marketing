package com.socialpulse.android.ui.screens.search

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.socialpulse.android.data.model.MockData
import com.socialpulse.android.data.model.Platform
import com.socialpulse.android.data.model.Region
import com.socialpulse.android.data.model.formatNumber
import com.socialpulse.android.ui.components.BrutalBadge
import com.socialpulse.android.ui.components.BrutalCard
import com.socialpulse.android.ui.components.DemoBadge
import com.socialpulse.android.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(navController: NavController) {
    var query by remember { mutableStateOf("ойыншық") }
    var selectedPlatform by remember { mutableStateOf(Platform.ALL) }
    var selectedRegion by remember { mutableStateOf(Region.ALMATY) }

    Scaffold(
        containerColor = Background,
        topBar = {}
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                // Hero Search - Brutal
                Box {
                    Box(modifier = Modifier.matchParentSize().offset(8.dp, 8.dp).background(Black).border(4.dp, Black))
                    Card(modifier = Modifier.fillMaxWidth().border(4.dp, Black), shape = androidx.compose.foundation.shape.RoundedCornerShape(0.dp), colors = CardDefaults.cardColors(containerColor = White)) {
                        Column(modifier = Modifier.padding(18.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Icon(Icons.Filled.TravelExplore, contentDescription = null, modifier = Modifier.size(24.dp))
                                Text("WHAT'S TRENDING IN YOUR MARKET?", fontWeight = FontWeight.Black, fontSize = 18.sp, lineHeight = 20.sp, letterSpacing = (-0.5).sp)
                            }
                            Spacer(modifier = Modifier.height(14.dp))
                            // Search input brutal
                            Box(modifier = Modifier.fillMaxWidth().border(3.dp, Black).background(Background).padding(4.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                                    Box(modifier = Modifier.background(White).border(3.dp, Black).padding(12.dp)) {
                                        Icon(Icons.Filled.Search, contentDescription = null, modifier = Modifier.size(20.dp))
                                    }
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(query, fontWeight = FontWeight.Black, fontSize = 15.sp)
                                        Text("Search a niche, account, product or paste a link...", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Black.copy(0.5f))
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(14.dp))
                            // Platform selector
                            Text("PLATFORM:", fontWeight = FontWeight.Black, fontSize = 11.sp, letterSpacing = 1.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Platform.values().forEach { p ->
                                    val isSelected = selectedPlatform == p
                                    Box(
                                        modifier = Modifier
                                            .border(3.dp, Black)
                                            .background(if (isSelected) Black else White)
                                            .padding(horizontal = 14.dp, vertical = 8.dp)
                                    ) {
                                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                                            Icon(
                                                when(p) {
                                                    Platform.INSTAGRAM -> Icons.Filled.CameraAlt
                                                    Platform.TIKTOK -> Icons.Filled.MusicNote
                                                    else -> Icons.Filled.Public
                                                },
                                                contentDescription = null,
                                                modifier = Modifier.size(14.dp),
                                                tint = if (isSelected) White else Black
                                            )
                                            Text(p.display.uppercase(), fontWeight = FontWeight.Black, fontSize = 11.sp, color = if (isSelected) White else Black)
                                        }
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Text("ӨҢІР:", fontWeight = FontWeight.Black, fontSize = 11.sp, letterSpacing = 1.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Filled.LocationOn, contentDescription = null, modifier = Modifier.size(18.dp))
                                Region.values().take(5).forEach { r ->
                                    val isSel = selectedRegion == r
                                    FilterChip(
                                        selected = isSel,
                                        onClick = { selectedRegion = r },
                                        label = { Text(r.display, fontSize = 10.sp, fontWeight = FontWeight.Black) },
                                        colors = FilterChipDefaults.filterChipColors(selectedContainerColor = PrimaryYellow, selectedLabelColor = Black),
                                        border = FilterChipDefaults.filterChipBorder(borderColor = Black, borderWidth = 2.dp, selectedBorderColor = Black, selectedBorderWidth = 3.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text("⚠️ Геолокация қате болуы мүмкін. Қолмен өзгерт. Нақты мекенжай жиналмайды. Контентте гео белгі болмаса «өңірі расталмаған»", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Black.copy(0.6f))
                            Spacer(modifier = Modifier.height(14.dp))
                            Box(modifier = Modifier.fillMaxWidth().background(Black).border(3.dp, Black).padding(vertical = 14.dp), contentAlignment = Alignment.Center) {
                                Text("ANALYZE →", color = PrimaryYellow, fontWeight = FontWeight.Black, fontSize = 14.sp, letterSpacing = 1.sp)
                            }
                        }
                    }
                }
            }

            item {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    Box(modifier = Modifier.background(Black).padding(horizontal = 10.dp, vertical = 6.dp)) {
                        Text("TOP 5", color = White, fontWeight = FontWeight.Black, fontSize = 14.sp)
                    }
                    Text("${query.uppercase()} • ${selectedRegion.display}", fontWeight = FontWeight.Black, fontSize = 14.sp)
                    Spacer(modifier = Modifier.weight(1f))
                    DemoBadge()
                }
            }

            items(MockData.accounts.take(5)) { acc ->
                Box {
                    Box(modifier = Modifier.matchParentSize().offset(6.dp, 6.dp).background(Black).border(3.dp, Black))
                    Card(modifier = Modifier.fillMaxWidth().border(3.dp, Black), shape = androidx.compose.foundation.shape.RoundedCornerShape(0.dp), colors = CardDefaults.cardColors(containerColor = PrimaryYellow)) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                                    Box(modifier = Modifier.size(44.dp).border(3.dp, Black).background(White), contentAlignment = Alignment.Center) {
                                        Text(acc.username.first().uppercase(), fontWeight = FontWeight.Black, fontSize = 18.sp)
                                    }
                                    Column {
                                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                                            Text("@${acc.username}", fontWeight = FontWeight.Black, fontSize = 14.sp)
                                            Icon(
                                                when(acc.platform) {
                                                    Platform.INSTAGRAM -> Icons.Filled.CameraAlt
                                                    Platform.TIKTOK -> Icons.Filled.MusicNote
                                                    else -> Icons.Filled.Public
                                                },
                                                contentDescription = null,
                                                modifier = Modifier.size(14.dp).border(2.dp, Black).background(White).padding(2.dp)
                                            )
                                        }
                                        Text(acc.displayName, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    }
                                }
                                BrutalBadge(if (acc.regionVerified) "✓ ${acc.region.display}" else "өңірі расталмаған", background = if (acc.regionVerified) Black else White, textColor = if (acc.regionVerified) White else Black)
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(acc.bio, fontSize = 11.sp, fontWeight = FontWeight.Bold, lineHeight = 14.sp)
                            Spacer(modifier = Modifier.height(10.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Box(modifier = Modifier.weight(1f).border(3.dp, Black).background(White).padding(8.dp)) {
                                    Column {
                                        Text("FOLLOWERS", fontSize = 9.sp, fontWeight = FontWeight.Black, color = Black.copy(0.6f))
                                        Text(formatNumber(acc.followers), fontWeight = FontWeight.Black, fontSize = 14.sp)
                                    }
                                }
                                Box(modifier = Modifier.weight(1f).border(3.dp, Black).background(White).padding(8.dp)) {
                                    Column {
                                        Text("AVG VIEWS", fontSize = 9.sp, fontWeight = FontWeight.Black, color = Black.copy(0.6f))
                                        Text(formatNumber(acc.avgViews), fontWeight = FontWeight.Black, fontSize = 14.sp)
                                    }
                                }
                                Box(modifier = Modifier.weight(1f).border(3.dp, Black).background(Black).padding(8.dp)) {
                                    Column {
                                        Text("ER", fontSize = 9.sp, fontWeight = FontWeight.Black, color = White.copy(0.7f))
                                        Text("${acc.engagementRate}%", fontWeight = FontWeight.Black, fontSize = 14.sp, color = PrimaryYellow)
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(10.dp))
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Text("📅 ${acc.lastPostDate} • 🎬 ${acc.totalVideos} видео • ${acc.source}", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Black.copy(0.6f))
                                Box(modifier = Modifier.background(Black).border(2.dp, Black).padding(horizontal = 12.dp, vertical = 6.dp)) {
                                    Text("АНАЛИЗ →", color = White, fontWeight = FontWeight.Black, fontSize = 10.sp)
                                }
                            }
                        }
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(100.dp)) }
        }
    }
}
