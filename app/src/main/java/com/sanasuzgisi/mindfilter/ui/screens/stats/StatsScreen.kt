package com.sanasuzgisi.mindfilter.ui.screens.stats

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.sanasuzgisi.mindfilter.ui.components.SimpleBarChart
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatsScreen(navController: NavController) {
    val context = LocalContext.current
    val statsViewModel: StatsViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                @Suppress("UNCHECKED_CAST")
                return StatsViewModel(context) as T
            }
        }
    )
    val stats by statsViewModel.allStats.collectAsState()
    val uiState by statsViewModel.uiState.collectAsState()

    var showAddDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Цифрлық әдеттер") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Артқа")
                    }
                },
                actions = {
                    TextButton(onClick = { showAddDialog = true }) { Text("Қосу") }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddDialog = true }, shape = RoundedCornerShape(16.dp)) {
                Text("＋", fontSize = 24.sp)
            }
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
                Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("📊 Экран уақытыңды бақыла", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Бұл жерде сен күн сайын экран уақытыңды өзің енгізесің. Қосымша телефондағы уақытты автоматты оқымайды - құпиялылық үшін. Тек өз бақылауың.",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("${uiState.averageMinutes} мин", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = MaterialTheme.colorScheme.primary)
                                Text("Орташа", fontSize = 12.sp)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("${uiState.totalMinutes} мин", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                                Text("Жалпы", fontSize = 12.sp)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("${stats.size} күн", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                                Text("Жазба", fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            if (stats.isNotEmpty()) {
                item {
                    Card(shape = RoundedCornerShape(16.dp)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Апталық диаграмма", fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(8.dp))
                            val chartData = stats.take(7).reversed().map {
                                val shortDate = it.dateString.takeLast(5) // MM-dd
                                shortDate to it.minutes
                            }
                            SimpleBarChart(data = chartData, modifier = Modifier.fillMaxWidth())
                            Spacer(modifier = Modifier.height(8.dp))
                            if (uiState.comparisonText.isNotEmpty()) {
                                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer), shape = RoundedCornerShape(8.dp)) {
                                    Text(uiState.comparisonText, modifier = Modifier.padding(8.dp), style = MaterialTheme.typography.bodySmall)
                                }
                            }
                        }
                    }
                }
            }

            item {
                Text("Жазбалар", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }

            if (stats.isEmpty()) {
                item {
                    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp)) {
                        Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("📭", fontSize = 48.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Әлі жазба жоқ", fontWeight = FontWeight.Bold)
                            Text("Төмендегі + батырмасымен бүгінгі экран уақытыңды қос", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            } else {
                items(stats) { stat ->
                    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                        Row(modifier = Modifier.padding(16.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(stat.dateString, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text("${stat.minutes} минут", fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                                if (stat.note.isNotEmpty()) {
                                    Text(stat.note, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                            IconButton(onClick = { statsViewModel.delete(stat) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Жою", tint = MaterialTheme.colorScheme.error)
                            }
                        }
                    }
                }
            }

            item {
                OutlinedButton(onClick = { statsViewModel.clearAll() }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                    Text("Барлығын өшіру")
                }
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }

    if (showAddDialog) {
        AddStatDialog(
            onDismiss = { showAddDialog = false },
            onAdd = { minutes, note ->
                statsViewModel.addStat(minutes, note)
                showAddDialog = false
            }
        )
    }
}

@Composable
fun AddStatDialog(onDismiss: () -> Unit, onAdd: (Int, String) -> Unit) {
    var minutesText by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Экран уақытын қосу") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Бүгін қанша минут телефон қарадың? (өзің есепте)", style = MaterialTheme.typography.bodySmall)
                OutlinedTextField(
                    value = minutesText,
                    onValueChange = { minutesText = it; error = null },
                    label = { Text("Минут (мысалы, 120)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    isError = error != null
                )
                if (error != null) {
                    Text(error!!, color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                }
                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    label = { Text("Жазба (міндетті емес)") },
                    placeholder = { Text("Мысалы: TikTok көп көрдім") }
                )
                val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                Text("Күн: ${sdf.format(Date())}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        },
        confirmButton = {
            Button(onClick = {
                val minutes = minutesText.toIntOrNull()
                when {
                    minutes == null -> error = "Сан енгізіңіз"
                    minutes < 0 -> error = "0-ден үлкен болу керек"
                    minutes > 1440 -> error = "1440 минуттан аспау керек (24 сағат)"
                    else -> onAdd(minutes, note)
                }
            }) { Text("Сақтау") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Болдырмау") }
        }
    )
}
