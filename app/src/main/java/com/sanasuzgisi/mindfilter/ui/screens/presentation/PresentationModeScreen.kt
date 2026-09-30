package com.sanasuzgisi.mindfilter.ui.screens.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.sanasuzgisi.mindfilter.ui.navigation.Screen

data class PresStep(val title: String, val desc: String, val emoji: String, val details: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PresentationModeScreen(navController: NavController) {
    var currentStep by remember { mutableStateOf(0) }

    val steps = listOf(
        PresStep(
            "Сана Сүзгісі",
            "Нейромаркетинг және цифрлық алгоритмдер: әлеуметтік желілер адам таңдауын қалай басқарады?",
            "🧠",
            "Мақсаты: жастардың цифрлық әдеттерін зерттеп, нейромаркетинг пен алгоритмдердің әсерін түсіндіру және 6 саналы дағды ұсыну.\n\nӨзектілігі: Қазақстанда жастар күніне 4-6 сағат әлеуметтік желіде отырады. Олардың 70%-ы импульсивті сатып алады."
        ),
        PresStep(
            "Нейромаркетинг деген не?",
            "Ми 90% шешімді эмоциямен қабылдайды",
            "🎨",
            "• Түстер: Қызыл - асығыстық, Көк - сенім\n• Шектеулі ұсыныс: «Тек 2 дана қалды!» - FOMO\n• Әлеуметтік дәлел: «12 543 адам алды»\n• Касса жанындағы тауарлар - импульсивті сатып алу\n\nМаңызды: Нейромаркетинг адамды 100% басқармайды. Еркін таңдау әрқашан бар."
        ),
        PresStep(
            "Алгоритм қалай жұмыс істейді?",
            "Сен қараған нәрсені алгоритм көбейтеді",
            "🤖",
            "Қарапайым ереже (оқу моделі):\n1 лайк = +3 ұпай, қарау = +1, өткізіп жіберу = -1\n\nЕгер бір тақырыпқа 3 рет қызықсаң, алгоритм оны 2 есе көп көрсетеді. Осылай «фильтр көпіршігі» пайда болады.\n\nБұл нақты TikTok алгоритмі емес, тек принципін түсіндіретін модель."
        ),
        PresStep(
            "Демо: Симулятор",
            "Қазір симуляторды көрсетемін",
            "🎮",
            "Симуляторда:\n• Қызығушылық таңдаймыз\n• Лентаны қараймыз\n• Лайк/өткізіп жіберу жасаймыз\n• Бастапқы және өзгерген лентаны салыстырамыз\n\nНәтиже: Алгоритм сенің әрекетіңе қарай лентаны өзгертеді."
        ),
        PresStep(
            "Сана Сүзгісі - 6 дағды",
            "Цифрлық гигиена - шешім",
            "✅",
            "1. 🎯 Мақсатпен кіру - не үшін кіргеніңді анықта\n2. ⏱️ Уақыт шектеу - таймер қой\n3. 🔕 Хабарламаларды реттеу - қажетсізін өшір\n4. 🧹 Лентаны саналы баптау - unfollow, «қызықтырмайды»\n5. 🛒 24 сағат үзіліс - импульсивті сатып алу алдында күт\n6. 📊 Апталық шолу - экран уақытыңды қара\n\nБарлығы офлайн, құпия, кінә артпайды."
        ),
        PresStep(
            "Эксперимент нәтижелері",
            "2 топ, 14 күн, 6 дағды",
            "📊",
            "Әдіс: 20 оқушы, 2 топқа бөлу. Эксперимент тобы 14 күн 6 дағдыны қолданды.\n\nҮЛГІ ДЕРЕК (мысал):\n• Бақылау тобы: 210 → 200 мин (өзгеріс аз)\n• Эксперимент тобы: 240 → 150 мин, импульс 7 → 4, сауат 5 → 8\n\nҚорытынды: Дағдылар экран уақытын саналы бақылауға көмектеседі. Медициналық диагноз емес."
        ),
        PresStep(
            "Қорытынды және практикалық маңызы",
            "Алгоритм - құрал, басқару - сенде",
            "🎤",
            "1. Нейромаркетинг пен алгоритмдер әсер етеді, бірақ адамның еркі шешуші.\n2. Алгоритм бейтарап, оны қалай баптайтының маңызды.\n3. 6 дағды - қарапайым цифрлық гигиена.\n4. Практикалық маңызы: мектепте цифрлық сауаттылық сабағында қолдануға болады.\n\nҚосымша: Kotlin, Jetpack Compose, Material 3, Room, DataStore, толық офлайн, жеке дерек жинамайды.\n\nРахмет!"
        )
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Қорғау режимі ${currentStep + 1}/${steps.size}") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Артқа")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
                Text(steps[currentStep].emoji, fontSize = 64.sp)
                Spacer(modifier = Modifier.height(16.dp))
                Text(steps[currentStep].title, fontSize = 28.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, color = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.height(12.dp))
                Text(steps[currentStep].desc, fontSize = 16.sp, fontWeight = FontWeight.Medium, textAlign = TextAlign.Center)
                Spacer(modifier = Modifier.height(24.dp))
                Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                    Text(steps[currentStep].details, modifier = Modifier.padding(16.dp), style = MaterialTheme.typography.bodyMedium)
                }
                if (currentStep == 3) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = { navController.navigate(Screen.Simulator.route) }, shape = RoundedCornerShape(12.dp)) {
                        Text("Симуляторды ашу")
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                OutlinedButton(
                    onClick = { if (currentStep > 0) currentStep-- else navController.popBackStack() },
                    shape = RoundedCornerShape(12.dp)
                ) { Text(if (currentStep == 0) "Шығу" else "Артқа") }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("${currentStep + 1} / ${steps.size}", modifier = Modifier.align(Alignment.CenterVertically))
                    Button(
                        onClick = { if (currentStep < steps.size - 1) currentStep++ else navController.popBackStack() },
                        shape = RoundedCornerShape(12.dp)
                    ) { Text(if (currentStep == steps.size - 1) "Аяқтау" else "Келесі") }
                }
            }

            LinearProgressIndicator(progress = { (currentStep + 1) / steps.size.toFloat() }, modifier = Modifier.fillMaxWidth().padding(top = 16.dp).height(6.dp))
        }
    }
}
