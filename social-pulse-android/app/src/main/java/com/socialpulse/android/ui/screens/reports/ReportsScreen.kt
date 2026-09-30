package com.socialpulse.android.ui.screens.reports

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
import com.socialpulse.android.ui.components.DemoBadge
import com.socialpulse.android.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportsScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("EXPORT REPORTS", fontWeight = FontWeight.Black) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = PrimaryYellow)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { DemoBadge() }

            item {
                BrutalCard(background = PrimaryYellow) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("PDF Export", fontWeight = FontWeight.Black, fontSize = 18.sp)
                        Text("Платформа атауы, аккаунт, кезең, дереккөздер, KPI, графиктер, топ видеолар, AI қорытындысы, қолжетімділік ескертуі", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(onClick = {}, modifier = Modifier.fillMaxWidth().border(3.dp, Black), colors = ButtonDefaults.buttonColors(containerColor = Black)) {
                            Text("PDF ЖҮКТЕУ", color = White, fontWeight = FontWeight.Black)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Ескерту: Бұл есеп тек қолжетімді жария деректер мен рұқсат етілген API нәтижелеріне негізделген. Деректер толық болмауы мүмкін", fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            item {
                BrutalCard(background = Blue) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("CSV Export", fontWeight = FontWeight.Black)
                        Text("Видео кестесін CSV ретінде", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = {}, modifier = Modifier.fillMaxWidth().border(3.dp, Black), colors = ButtonDefaults.buttonColors(containerColor = Black)) {
                            Text("CSV ЖҮКТЕУ", color = White, fontWeight = FontWeight.Black)
                        }
                    }
                }
            }

            item {
                BrutalCard(background = Purple) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Excel Export", fontWeight = FontWeight.Black)
                        Text("Толық аналитика Excel", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = {}, modifier = Modifier.fillMaxWidth().border(3.dp, Black), colors = ButtonDefaults.buttonColors(containerColor = Black)) {
                            Text("EXCEL ЖҮКТЕУ", color = White, fontWeight = FontWeight.Black)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}
