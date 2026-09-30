package com.socialpulse.android.ui.screens.saved

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
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
fun SavedScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("SAVED ACCOUNTS", fontWeight = FontWeight.Black) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = White)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item { DemoBadge() }
            items(MockData.accounts.take(3)) { acc ->
                BrutalCard {
                    Row(modifier = Modifier.padding(12.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("@${acc.username} ${acc.platform.emoji}", fontWeight = FontWeight.Black)
                            Text(acc.displayName, fontWeight = FontWeight.Bold)
                            Text("Дереккөз: ${acc.source} • DEMO DATA", fontSize = 10.sp)
                        }
                        Button(onClick = {}, colors = ButtonDefaults.buttonColors(containerColor = Black)) {
                            Text("Ашу", color = White, fontWeight = FontWeight.Black)
                        }
                    }
                }
            }
            item { Spacer(modifier = Modifier.height(80.dp)) }
        }
    }
}
