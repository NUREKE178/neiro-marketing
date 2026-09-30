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
import androidx.compose.ui.draw.clip
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
    borderColor: Color = Black,
    shadowColor: Color = Black,
    shadowOffset: Int = 6,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    Box(modifier = modifier) {
        // Hard shadow
        Box(
            modifier = Modifier
                .matchParentSize()
                .offset(x = shadowOffset.dp, y = shadowOffset.dp)
                .background(shadowColor)
                .border(3.dp, borderColor)
        )
        // Main card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(3.dp, borderColor)
                .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier),
            shape = RoundedCornerShape(0.dp),
            colors = CardDefaults.cardColors(containerColor = background),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            content()
        }
    }
}

@Composable
fun BrutalBadge(text: String, background: Color = PrimaryYellow, textColor: Color = Black) {
    Box(
        modifier = Modifier
            .background(background)
            .border(2.dp, Black)
            .padding(horizontal = 10.dp, vertical = 5.dp)
    ) {
        Text(text = text.uppercase(), fontSize = 10.sp, fontWeight = FontWeight.Black, color = textColor, letterSpacing = 0.5.sp)
    }
}

@Composable
fun DemoBadge() {
    Box(
        modifier = Modifier
            .background(Black)
            .border(2.dp, PrimaryYellow)
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text("DEMO DATA", fontSize = 9.sp, fontWeight = FontWeight.Black, color = PrimaryYellow, letterSpacing = 0.5.sp)
    }
}

@Composable
fun KpiCard(label: String, value: String, change: String? = null, background: Color, modifier: Modifier = Modifier, icon: String = "") {
    Box(modifier = modifier) {
        Box(modifier = Modifier.matchParentSize().offset(4.dp, 4.dp).background(Black).border(3.dp, Black))
        Card(
            modifier = Modifier.fillMaxWidth().border(3.dp, Black),
            shape = RoundedCornerShape(0.dp),
            colors = CardDefaults.cardColors(containerColor = background)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    Text(label.uppercase(), fontSize = 10.sp, fontWeight = FontWeight.Black, color = Black.copy(alpha = 0.6f), letterSpacing = 0.5.sp)
                    if (icon.isNotEmpty()) Text(icon, fontSize = 16.sp)
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(value, fontSize = 26.sp, fontWeight = FontWeight.Black, color = Black, lineHeight = 26.sp)
                if (change != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Box(modifier = Modifier.background(Black).padding(horizontal = 6.dp, vertical = 2.dp)) {
                        Text(change, fontSize = 11.sp, fontWeight = FontWeight.Black, color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun BrutalSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    onSearch: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier) {
        Box(modifier = Modifier.matchParentSize().offset(6.dp, 6.dp).background(Black).border(3.dp, Black))
        Card(modifier = Modifier.fillMaxWidth().border(3.dp, Black), shape = RoundedCornerShape(0.dp), colors = CardDefaults.cardColors(containerColor = Color.White)) {
            Column(modifier = Modifier.padding(4.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.weight(1f).background(Color(0xFFF5F4EF)).border(3.dp, Black).padding(12.dp)) {
                        Text("🔍 $query", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(modifier = Modifier.background(Black).border(3.dp, Black).clickable { onSearch() }.padding(horizontal = 20.dp, vertical = 14.dp)) {
                        Text("ANALYZE →", color = PrimaryYellow, fontWeight = FontWeight.Black, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
