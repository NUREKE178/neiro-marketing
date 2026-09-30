package com.sanasuzgisi.mindfilter.ui.screens.neuromarketing

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.sanasuzgisi.mindfilter.ui.components.WarningBanner

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NeuromarketingScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Нейромаркетинг") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Артқа")
                    }
                }
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
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("🧠 Нейромаркетинг деген не?", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Бұл мидың қалай шешім қабылдайтынын зерттеп, соған қарай жарнама жасау. Адам 90% шешімді эмоциямен қабылдайды. Бірақ маңызды: нейромаркетинг адамды 100% басқарады деген жалған. Әсер адамға, жасына, көңіл-күйіне қарай өзгереді. Біздің миымызда еркін таңдау әрқашан бар.",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }

            item { WarningBanner("Бұл қосымша мидың белсенділігін өлшемейді және медициналық диагноз қоймайды. Тек оқу мақсатында.") }

            item { Text("Интерактивті мысалдар", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }

            item { ColorEffectCard() }
            item { ScarcityEffectCard() }
            item { SocialProofCard() }
            item { ImpulseBuyingCard() }
            item { PresentationTrickCard() }

            item { Spacer(modifier = Modifier.height(80.dp)) }
        }
    }
}

@Composable
fun ColorEffectCard() {
    var selectedColor by remember { mutableStateOf("Қызыл") }
    Card(shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("🎨 1. Түстердің рөлі", fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Әр түс миға әртүрлі әсер етеді:", style = MaterialTheme.typography.bodySmall)
            Spacer(modifier = Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                ColorButton("Қызыл", Color(0xFFEF4444), selectedColor == "Қызыл") { selectedColor = "Қызыл" }
                ColorButton("Көк", Color(0xFF3B82F6), selectedColor == "Көк") { selectedColor = "Көк" }
                ColorButton("Жасыл", Color(0xFF22C55E), selectedColor == "Жасыл") { selectedColor = "Жасыл" }
            }
            Spacer(modifier = Modifier.height(12.dp))
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                Text(
                    text = when (selectedColor) {
                        "Қызыл" -> "🔴 Қызыл: Асығыстық, акция, «Тек бүгін!». Magnum, Kaspi-дің қызыл бағасы - ми «арзан» деп ойлайды."
                        "Көк" -> "🔵 Көк: Сенім, қауіпсіздік. Банктер (Kaspi, Halyk) көкті қолданады. Ми «сенімді» деп қабылдайды."
                        else -> "🟢 Жасыл: Табиғи, пайдалы, тыныштық. Эко-өнімдер, денсаулық жарнамасында көп."
                    },
                    modifier = Modifier.padding(12.dp),
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}

@Composable
fun ColorButton(name: String, color: Color, selected: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = if (selected) color else color.copy(alpha = 0.3f)),
        shape = RoundedCornerShape(8.dp),
        modifier = Modifier.height(36.dp)
    ) {
        Text(name, fontSize = 12.sp, color = if (selected) Color.White else Color.Black)
    }
}

@Composable
fun ScarcityEffectCard() {
    var showTimer by remember { mutableStateOf(false) }
    Card(shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("⏰ 2. Шектеулі ұсыныс (FOMO)", fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text("«Тек 2 дана қалды!», «Акция 00:14:22-да бітеді!» - ми қорқып, тез шешім қабылдайды. Бұл - жасанды асығыстық.", style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(12.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("📱 iPhone 15 - 10% жеңілдік!", fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.width(8.dp))
                if (showTimer) {
                    Card(colors = CardDefaults.cardColors(containerColor = Color.Red)) {
                        Text("00:02:13 қалды!", modifier = Modifier.padding(6.dp), color = Color.White, fontSize = 12.sp)
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Button(onClick = { showTimer = !showTimer }, shape = RoundedCornerShape(8.dp)) {
                Text(if (showTimer) "Таймерді жасыру" else "Таймерді көрсету")
            }
            if (showTimer) {
                Spacer(modifier = Modifier.height(8.dp))
                Text("👉 Байқадың ба? Таймер шыққанда жүрегің тез соқты ма? Міне, осы - нейромаркетинг.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.error)
            }
        }
    }
}

@Composable
fun SocialProofCard() {
    Card(shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("👥 3. Әлеуметтік дәлел", fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text("«12 543 адам сатып алды», «4.9 ★ (2 341 пікір)» - ми «көп адам алса, жақсы екен» деп ойлайды.", style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(12.dp))
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("🎧 Құлаққап - хит сатылым", fontWeight = FontWeight.Bold)
                    Text("⭐⭐⭐⭐⭐ 4.8 (1 203 пікір)", fontSize = 12.sp)
                    Text("🔥 Соңғы 24 сағатта 89 адам алды", fontSize = 12.sp, color = Color(0xFF16A34A))
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text("Сана сүзгісі: Пікірлерді оқы, бірақ тек жұлдызға емес, нақты не жазғанына қара.", style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun ImpulseBuyingCard() {
    Card(shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("🛒 4. Импульсивті сатып алу", fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Касса жанындағы сағыз, шоколад - арнайы қойылған. Шаршаған ми «алсаңшы» дейді. 70% импульсивті сатып алулар өкіндіреді.", style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7))) {
                    Column(modifier = Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🍫", fontSize = 24.sp)
                        Text("Кассада", fontSize = 10.sp)
                        Text("500 тг", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
                Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = Color(0xFFDBEAFE))) {
                    Column(modifier = Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🧃", fontSize = 24.sp)
                        Text("Сусын", fontSize = 10.sp)
                        Text("700 тг", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
                Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = Color(0xFFFCE7F3))) {
                    Column(modifier = Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🔋", fontSize = 24.sp)
                        Text("Батарея", fontSize = 10.sp)
                        Text("1200 тг", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun PresentationTrickCard() {
    Card(shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("💰 5. Тауарды ұсыну тәсілі", fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Бір тауарды 3 бағамен ұсыну:", style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(12.dp))
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("☕ Кофе:", fontWeight = FontWeight.Bold)
                    Text("• Кіші - 800 тг")
                    Text("• Орта - 1200 тг ← көп адам осыны алады", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    Text("• Үлкен - 1300 тг")
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Ортаңғы баға әдейі тиімді қылып қойылған. Ми «үлкеннен 100 тг ғана арзан, орташасы тиімді» деп ойлайды.", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}
