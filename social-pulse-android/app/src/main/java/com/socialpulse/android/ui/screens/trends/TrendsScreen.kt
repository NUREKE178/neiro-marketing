package com.socialpulse.android.ui.screens.trends

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.socialpulse.android.data.model.MockData
import com.socialpulse.android.ui.components.BrutalCard
import com.socialpulse.android.ui.components.DemoBadge
import com.socialpulse.android.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TrendsScreen(navController: NavController) {
    var niche by remember { mutableStateOf("ойыншық") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("TREND DISCOVERY", fontWeight = FontWeight.Black) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Pink)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                BrutalCard {
                    Column(modifier = Modifier.padding(12.dp)) {
                        OutlinedTextField(
                            value = niche,
                            onValueChange = { niche = it },
                            placeholder = { Text("Тақырып: ойыншық, кофе, косметика...") },
                            modifier = Modifier.fillMaxWidth().border(3.dp, Black)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = {}, modifier = Modifier.fillMaxWidth().border(3.dp, Black), colors = ButtonDefaults.buttonColors(containerColor = Black)) {
                            Text("ТРЕНД ІЗДЕУ →", color = White, fontWeight = FontWeight.Black)
                        }
                    }
                }
            }

            item {
                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    Text("Тренд: $niche", fontWeight = FontWeight.Black, fontSize = 18.sp)
                    DemoBadge()
                }
            }

            item {
                BrutalCard(background = PrimaryYellow) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("🔥 Жиі хэштегтер", fontWeight = FontWeight.Black)
                        Spacer(modifier = Modifier.height(8.dp))
                        MockData.hashtags.forEach { (tag, count) ->
                            Row(modifier = Modifier.fillMaxWidth().border(2.dp, Black).padding(8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("#$tag", fontWeight = FontWeight.Black)
                                Text("$count", fontWeight = FontWeight.Black, modifier = Modifier.border(2.dp, Black).padding(horizontal = 6.dp))
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                        }
                    }
                }
            }

            item {
                BrutalCard(background = Blue) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("📅 Жарияланым белсенділігі", fontWeight = FontWeight.Black)
                        Spacer(modifier = Modifier.height(8.dp))
                        MockData.postingFrequency.forEach { (date, count) ->
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(date, fontWeight = FontWeight.Bold)
                                Text("$count пост", fontWeight = FontWeight.Black)
                            }
                        }
                    }
                }
            }

            item {
                BrutalCard(background = Purple) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Контент форматтары", fontWeight = FontWeight.Black)
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Column(modifier = Modifier.border(2.dp, Black).padding(8.dp).weight(1f)) {
                                Text("Showcase", fontSize = 10.sp, fontWeight = FontWeight.Black)
                                Text("45%", fontSize = 18.sp, fontWeight = FontWeight.Black)
                            }
                            Column(modifier = Modifier.border(2.dp, Black).padding(8.dp).weight(1f)) {
                                Text("Unboxing", fontSize = 10.sp, fontWeight = FontWeight.Black)
                                Text("23%", fontSize = 18.sp, fontWeight = FontWeight.Black)
                            }
                            Column(modifier = Modifier.border(2.dp, Black).padding(8.dp).weight(1f)) {
                                Text("Review", fontSize = 10.sp, fontWeight = FontWeight.Black)
                                Text("18%", fontSize = 18.sp, fontWeight = FontWeight.Black)
                            }
                        }
                    }
                }
            }

            item {
                BrutalCard(background = Black) {
                    Text("Графиктер тек қолда бар және нақты алынған деректерге негізделген. Болжамды көрсеткіштер нақты статистикадан ерекшеленеді.", color = White, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(12.dp))
                }
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}
