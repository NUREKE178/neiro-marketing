package com.sanasuzgisi.mindfilter.ui.screens.research

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
import com.sanasuzgisi.mindfilter.data.model.ResearchData
import com.sanasuzgisi.mindfilter.ui.components.WarningBanner

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResearchScreen(navController: NavController) {
    val context = LocalContext.current
    val vm: ResearchViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                @Suppress("UNCHECKED_CAST")
                return ResearchViewModel(context) as T
            }
        }
    )
    val results by vm.allResults.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Ғылыми зерттеу") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Артқа")
                    }
                },
                actions = {
                    TextButton(onClick = { showAddDialog = true }) { Text("Нәтиже қосу") }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("🔬 Ғылыми жоба", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("«Нейромаркетинг және цифрлық алгоритмдер: әлеуметтік желілер адам таңдауын қалай басқарады?»", style = MaterialTheme.typography.titleSmall)
                    }
                }
            }

            items(ResearchData.sections) { section ->
                Card(shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(section.title, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(section.content, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }

            item {
                Text("Эксперимент нәтижелері кестесі", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                WarningBanner("Нақты дерек жоқ болса, ойдан статистика қоспаңыз. Үлгі деректерді міндетті түрде «ҮЛГІ ДЕРЕК» деп белгілеңіз.")
                Spacer(modifier = Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Button(onClick = { showAddDialog = true }, shape = RoundedCornerShape(12.dp)) { Text("＋ Қатысушы қосу") }
                    OutlinedButton(onClick = { vm.addSampleData() }, shape = RoundedCornerShape(12.dp)) { Text("Үлгі дерек қосу") }
                }
            }

            if (results.isEmpty()) {
                item {
                    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp)) {
                        Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("📋", fontSize = 48.sp)
                            Text("Кесте бос", fontWeight = FontWeight.Bold)
                            Text("Жоғарыдағы батырмамен нәтиже қосыңыз", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            } else {
                items(results) { r ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = if (r.isSampleData) MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.surface)
                    ) {
                        Row(modifier = Modifier.padding(12.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Column(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(r.participantCode, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    if (r.isSampleData) {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary)) {
                                            Text("ҮЛГІ ДЕРЕК", modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp), fontSize = 9.sp, color = MaterialTheme.colorScheme.onPrimary)
                                        }
                                    }
                                }
                                Text("Топ: ${r.groupName}", fontSize = 12.sp)
                                Text("Экран: ${r.screenTimeBefore} → ${r.screenTimeAfter} мин", fontSize = 12.sp)
                                Text("Импульс: ${r.impulseBuyingScore}/10, Сауат: ${r.awarenessScore}/10", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            IconButton(onClick = { vm.delete(r) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Жою", tint = MaterialTheme.colorScheme.error)
                            }
                        }
                    }
                }
            }

            item {
                OutlinedButton(onClick = { vm.clearAll() }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                    Text("Кестені тазалау")
                }
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }

    if (showAddDialog) {
        AddExperimentDialog(onDismiss = { showAddDialog = false }, onAdd = { code, group, before, after, impulse, awareness ->
            vm.addResult(code, group, before, after, impulse, awareness, false)
            showAddDialog = false
        })
    }
}

@Composable
fun AddExperimentDialog(onDismiss: () -> Unit, onAdd: (String, String, Int, Int, Int, Int) -> Unit) {
    var code by remember { mutableStateOf("") }
    var group by remember { mutableStateOf("Эксперимент") }
    var before by remember { mutableStateOf("") }
    var after by remember { mutableStateOf("") }
    var impulse by remember { mutableStateOf("") }
    var awareness by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Эксперимент нәтижесі") },
        text = {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    OutlinedTextField(value = code, onValueChange = { code = it }, label = { Text("Қатысушы коды (P01)") }, singleLine = true)
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(selected = group == "Бақылау", onClick = { group = "Бақылау" }, label = { Text("Бақылау") })
                        FilterChip(selected = group == "Эксперимент", onClick = { group = "Эксперимент" }, label = { Text("Эксперимент") })
                    }
                    OutlinedTextField(value = before, onValueChange = { before = it }, label = { Text("Экран уақыты бұрын (мин)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true)
                    OutlinedTextField(value = after, onValueChange = { after = it }, label = { Text("Экран уақыты кейін (мин)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true)
                    OutlinedTextField(value = impulse, onValueChange = { impulse = it }, label = { Text("Импульсивті сатып алу 1-10") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true)
                    OutlinedTextField(value = awareness, onValueChange = { awareness = it }, label = { Text("Сауаттылық 1-10") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true)
                    if (error != null) Text(error!!, color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                }
            }
        },
        confirmButton = {
            Button(onClick = {
                val b = before.toIntOrNull()
                val a = after.toIntOrNull()
                val imp = impulse.toIntOrNull()
                val aw = awareness.toIntOrNull()
                if (code.isBlank()) error = "Код енгізіңіз"
                else if (b == null || a == null) error = "Уақыт сан болу керек"
                else if (imp == null || imp !in 1..10) error = "Импульс 1-10"
                else if (aw == null || aw !in 1..10) error = "Сауат 1-10"
                else onAdd(code, group, b, a, imp, aw)
            }) { Text("Сақтау") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Болдырмау") } }
    )
}
