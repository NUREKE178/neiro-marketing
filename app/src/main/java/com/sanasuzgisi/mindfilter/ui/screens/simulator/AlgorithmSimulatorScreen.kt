package com.sanasuzgisi.mindfilter.ui.screens.simulator

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.sanasuzgisi.mindfilter.data.model.Topic
import com.sanasuzgisi.mindfilter.ui.components.WarningBanner
import com.sanasuzgisi.mindfilter.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlgorithmSimulatorScreen(
    navController: NavController,
    viewModel: SimulatorViewModel = viewModel()
) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Алгоритм симуляторы") },
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
                WarningBanner("Бұл - тек оқу мақсатындағы қарапайым модель. Нақты TikTok, Instagram, YouTube алгоритмдері өте күрделі және жабық. Бұл симулятор олардың принципін түсіндіру үшін ғана.")
            }

            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("🤖 Ұсыныстар алгоритмі қалай жұмыс істейді?", fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Қарапайым ереже: Сен бір тақырыпқа 3 рет қызығушылық білдірсең (лайк, қарау), алгоритм сол тақырыпты 2 есе көп көрсетеді. Қызықпасаң, азайтады. Осылай «көпіршік» пайда болады.",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }

            if (!state.isStarted) {
                item {
                    Text("1-қадам: Қызығушылығыңды таңда", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Topic.values().forEach { topic ->
                            val isSelected = state.selectedTopic == topic
                            FilterChip(
                                selected = isSelected,
                                onClick = { viewModel.selectTopic(topic) },
                                label = { Text("${topic.emoji} ${topic.displayName}", fontSize = 12.sp) }
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = { viewModel.startSimulation() },
                        enabled = state.selectedTopic != null,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Симуляцияны бастау")
                    }
                }
            } else {
                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("2-қадам: Лентаны қара", fontWeight = FontWeight.Bold)
                        TextButton(onClick = { viewModel.reset() }) { Text("Қайта бастау") }
                    }
                    // Score display
                    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Алгоритмнің сен туралы ойы:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            state.topicScores.forEach { (topic, score) ->
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("${topic.emoji} ${topic.displayName}", fontSize = 12.sp)
                                    Text("$score ұпай", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (score > 2) MaterialTheme.colorScheme.primary else Color.Gray)
                                }
                            }
                        }
                    }
                }

                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = if (state.showOriginal) PrimaryDeepPurple else Color.LightGray)) {
                            Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Бастапқы лента", color = if (state.showOriginal) Color.White else Color.Black, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                Text("${state.originalFeed.size} жазба", color = if (state.showOriginal) Color.White else Color.Black, fontSize = 10.sp)
                            }
                        }
                        Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = if (!state.showOriginal) SecondaryCyan else Color.LightGray), onClick = { viewModel.toggleFeed() }) {
                            Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Өзгерген лента", color = if (!state.showOriginal) Color.Black else Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                Text("${state.filteredFeed.size} жазба", color = if (!state.showOriginal) Color.Black else Color.White, fontSize = 10.sp)
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(onClick = { viewModel.toggleFeed() }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(8.dp)) {
                        Text(if (state.showOriginal) "Өзгерген лентаны көр →" else "← Бастапқы лентаны көр")
                    }
                }

                val feedToShow = if (state.showOriginal) state.originalFeed else state.filteredFeed
                items(feedToShow) { item ->
                    FeedItemCard(
                        title = item.title,
                        content = item.content,
                        topic = item.topic,
                        author = item.author,
                        likes = item.likes,
                        isAd = item.isAd,
                        onLike = { viewModel.onUserAction(item, com.sanasuzgisi.mindfilter.data.model.UserAction.LIKE) },
                        onView = { viewModel.onUserAction(item, com.sanasuzgisi.mindfilter.data.model.UserAction.VIEW) },
                        onSkip = { viewModel.onUserAction(item, com.sanasuzgisi.mindfilter.data.model.UserAction.SKIP) },
                        onDislike = { viewModel.onUserAction(item, com.sanasuzgisi.mindfilter.data.model.UserAction.DISLIKE) }
                    )
                }

                item {
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = AccentSoftGreen.copy(alpha = 0.2f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("🔍 Қорытынды", fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(8.dp))
                            val topTopic = state.topicScores.maxByOrNull { it.value }?.key
                            Text(
                                if (topTopic != null) {
                                    "Сен ${topTopic.emoji} ${topTopic.displayName} тақырыбына көп қызығушылық білдірдің. Алгоритм енді саған осы тақырыпты 2 есе көп көрсетеді. Міне, «фильтр көпіршігі» осылай пайда болады. Саналы болу үшін: әртүрлі тақырыптарды қара, «қызықтырмайды» деп белгіле."
                                } else {
                                    "Әлі ешқандай әрекет жасамадың. Лайк бас, өткізіп жібер - алгоритм қалай өзгеретінін көр."
                                },
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(80.dp))
                }
            }
        }
    }
}

@Composable
fun FeedItemCard(
    title: String,
    content: String,
    topic: Topic,
    author: String,
    likes: Int,
    isAd: Boolean,
    onLike: () -> Unit,
    onView: () -> Unit,
    onSkip: () -> Unit,
    onDislike: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(topic.emoji, fontSize = 16.sp)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(topic.displayName, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    if (isAd) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Card(colors = CardDefaults.cardColors(containerColor = AccentOrange)) {
                            Text("Жарнама", modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp), fontSize = 10.sp, color = Color.White)
                        }
                    }
                }
                Text("@$author", fontSize = 10.sp, color = Color.Gray)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(title, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(content, style = MaterialTheme.typography.bodySmall)
            Spacer(modifier = Modifier.height(12.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("❤️ $likes", fontSize = 12.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Button(onClick = onLike, shape = RoundedCornerShape(8.dp), contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp), modifier = Modifier.height(32.dp)) {
                        Text("👍", fontSize = 12.sp)
                    }
                    OutlinedButton(onClick = onView, shape = RoundedCornerShape(8.dp), contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp), modifier = Modifier.height(32.dp)) {
                        Text("👁️", fontSize = 12.sp)
                    }
                    OutlinedButton(onClick = onSkip, shape = RoundedCornerShape(8.dp), contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp), modifier = Modifier.height(32.dp)) {
                        Text("⏭️", fontSize = 12.sp)
                    }
                    OutlinedButton(onClick = onDislike, shape = RoundedCornerShape(8.dp), contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp), modifier = Modifier.height(32.dp)) {
                        Text("👎", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
