package com.sanasuzgisi.mindfilter.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.sanasuzgisi.mindfilter.ui.components.InfoCard
import com.sanasuzgisi.mindfilter.ui.navigation.Screen
import com.sanasuzgisi.mindfilter.ui.theme.AccentSoftGreen
import com.sanasuzgisi.mindfilter.ui.theme.PrimaryDeepPurple
import com.sanasuzgisi.mindfilter.ui.theme.SecondaryCyan

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Сана Сүзгісі", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryDeepPurple,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                // Hero section
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = PrimaryDeepPurple)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.horizontalGradient(
                                    listOf(PrimaryDeepPurple, SecondaryCyan.copy(alpha = 0.6f))
                                )
                            )
                            .padding(24.dp)
                    ) {
                        Column {
                            Text(
                                text = "🧠 САНА СҮЗГІСІ",
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "MindFilter",
                                style = MaterialTheme.typography.titleMedium,
                                color = SecondaryCyan
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "Нейромаркетинг және цифрлық алгоритмдер адам таңдауын қалай басқарады? Оны саналы түрде қалай сүзгіден өткізуге болады?",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f)
                            )
                            Spacer(modifier = Modifier.height(20.dp))
                            Button(
                                onClick = { navController.navigate(Screen.Presentation.route) },
                                colors = ButtonDefaults.buttonColors(containerColor = AccentSoftGreen),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("🚀 Зерттеуді бастау", color = PrimaryDeepPurple, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            item {
                Text(
                    "Ғылыми жобаның мақсаты",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Text(
                        text = "Жастардың цифрлық әдеттерін зерттеп, нейромаркетинг пен алгоритмдердің әсерін түсіндіру және оған қарсы 6 саналы дағдыны ұсыну. Қосымша толық офлайн жұмыс істейді және жеке дерек жинамайды.",
                        modifier = Modifier.padding(16.dp),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }

            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SecondaryCyan.copy(alpha = 0.15f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🧠", fontSize = 32.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Нейромаркетинг", fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                            Text("Ми қалай шешім қабылдайды?", style = MaterialTheme.typography.bodySmall, textAlign = TextAlign.Center)
                        }
                    }
                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = AccentSoftGreen.copy(alpha = 0.2f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("🤖", fontSize = 32.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Алгоритмдер", fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                            Text("Лента қалай өзгереді?", style = MaterialTheme.typography.bodySmall, textAlign = TextAlign.Center)
                        }
                    }
                }
            }

            item {
                Text("Негізгі бөлімдер", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            }

            item {
                InfoCard(
                    title = "Нейромаркетинг",
                    description = "Түстер, шектеулі ұсыныс, әлеуметтік дәлел - миға қалай әсер етеді? Интерактивті мысалдар.",
                    emoji = "🧠",
                    containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                ) {
                    navController.navigate(Screen.Neuromarketing.route)
                }
            }
            item {
                InfoCard(
                    title = "Алгоритм симуляторы",
                    description = "Өз лентаңды өзің басқар. Лайк бас, өткізіп жібер - алгоритм қалай өзгеретінін көр.",
                    emoji = "🤖",
                    containerColor = MaterialTheme.colorScheme.secondaryContainer
                ) {
                    navController.navigate(Screen.Simulator.route)
                }
            }
            item {
                InfoCard(
                    title = "Сана сүзгісі - 6 дағды",
                    description = "Цифрлық әдеттерді саналы басқаруға арналған 6 қарапайым қадам. Прогресс сақталады.",
                    emoji = "✅",
                    containerColor = AccentSoftGreen.copy(alpha = 0.2f)
                ) {
                    navController.navigate(Screen.Skills.route)
                }
            }
            item {
                InfoCard(
                    title = "Цифрлық әдеттер статистикасы",
                    description = "Күнделікті экран уақытыңды енгізіп, диаграммада бақыла. Салыстыру жаса.",
                    emoji = "📊"
                ) {
                    navController.navigate(Screen.Stats.route)
                }
            }
            item {
                InfoCard(
                    title = "Ғылыми зерттеу",
                    description = "Мақсаты, міндеттері, болжамы, әдістері, нәтижелері - толық ғылыми бөлім.",
                    emoji = "🔬"
                ) {
                    navController.navigate(Screen.Research.route)
                }
            }
            item {
                InfoCard(
                    title = "Қорғау режимі",
                    description = "Комиссия алдында көрсетуге арналған арнайы презентация режимі. Келесі батырмасымен.",
                    emoji = "🎤",
                    containerColor = PrimaryDeepPurple.copy(alpha = 0.1f)
                ) {
                    navController.navigate(Screen.Presentation.route)
                }
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    "© 2026 Сана Сүзгісі • Оқу мақсатындағы жоба • Деректер тек құрылғыда сақталады",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }
}
