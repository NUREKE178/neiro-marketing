package com.socialpulse.android.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.socialpulse.android.ui.theme.Black
import com.socialpulse.android.ui.theme.PrimaryYellow

@Composable
fun BrutalCard(
    modifier: Modifier = Modifier,
    background: Color = Color.White,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    Card(
        modifier = modifier
            .border(3.dp, Black)
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = background),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Box(modifier = Modifier.padding(2.dp)) {
            // Simulate hard shadow with outer box
            Column {
                content()
            }
        }
    }
}

@Composable
fun BrutalBadge(text: String, background: Color = PrimaryYellow) {
    Box(
        modifier = Modifier
            .background(background)
            .border(2.dp, Black)
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(text = text, fontSize = 10.sp, fontWeight = FontWeight.Black, color = Black)
    }
}

@Composable
fun DemoBadge() {
    Box(
        modifier = Modifier
            .background(Black)
            .border(2.dp, PrimaryYellow)
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text("DEMO DATA", fontSize = 9.sp, fontWeight = FontWeight.Black, color = PrimaryYellow)
    }
}

@Composable
fun KpiCard(label: String, value: String, change: String? = null, background: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.border(3.dp, Black),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = background)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(label, fontSize = 10.sp, fontWeight = FontWeight.Black, color = Black.copy(alpha = 0.6f))
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Black, color = Black)
            if (change != null) {
                Text(change, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Black)
            }
        }
    }
}
