package com.socialpulse.android.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.socialpulse.android.ui.theme.Black
import com.socialpulse.android.ui.theme.PrimaryYellow
import com.socialpulse.android.ui.theme.Purple

@Composable
fun BrutalBarChart(
    data: List<Pair<String, Int>>,
    modifier: Modifier = Modifier,
    barColor: Color = PrimaryYellow
) {
    if (data.isEmpty()) {
        Box(modifier = modifier.height(120.dp), contentAlignment = Alignment.Center) {
            Text("Дерек жоқ", fontWeight = FontWeight.Bold)
        }
        return
    }
    val maxValue = data.maxOf { it.second }.coerceAtLeast(1)
    
    Column(modifier = modifier.fillMaxWidth().border(3.dp, Black).padding(12.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().height(140.dp),
            verticalAlignment = Alignment.Bottom,
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            data.forEach { (label, value) ->
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                    Canvas(
                        modifier = Modifier
                            .width(28.dp)
                            .height(((value.toFloat() / maxValue) * 100).dp.coerceAtLeast(8.dp))
                            .border(2.dp, Black)
                    ) {
                        drawRect(color = barColor)
                        drawRect(color = Black, style = androidx.compose.ui.graphics.drawscope.Stroke(width = 3f))
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("${value / 1000}K", fontSize = 9.sp, fontWeight = FontWeight.Black)
                    Text(label.take(6), fontSize = 8.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text("DEMO DATA — нақты статистика емес", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
    }
}

@Composable
fun BrutalLineChart(
    data: List<Pair<String, Int>>,
    modifier: Modifier = Modifier
) {
    if (data.isEmpty()) return
    
    val maxValue = data.maxOf { it.second }.coerceAtLeast(1)
    
    Column(modifier = modifier.fillMaxWidth().border(3.dp, Black).padding(12.dp)) {
        Canvas(modifier = Modifier.fillMaxWidth().height(120.dp)) {
            val width = size.width
            val height = size.height
            val stepX = width / (data.size - 1).coerceAtLeast(1)
            
            // Draw grid
            for (i in 0..4) {
                val y = height * i / 4
                drawLine(Color.LightGray, Offset(0f, y), Offset(width, y), strokeWidth = 1f)
            }
            
            // Draw line
            for (i in 0 until data.size - 1) {
                val x1 = i * stepX
                val y1 = height - (data[i].second.toFloat() / maxValue * height)
                val x2 = (i + 1) * stepX
                val y2 = height - (data[i + 1].second.toFloat() / maxValue * height)
                drawLine(Black, Offset(x1, y1), Offset(x2, y2), strokeWidth = 6f)
                drawLine(Purple, Offset(x1, y1), Offset(x2, y2), strokeWidth = 4f)
            }
            
            // Draw points
            data.forEachIndexed { index, (_, value) ->
                val x = index * stepX
                val y = height - (value.toFloat() / maxValue * height)
                drawCircle(Black, radius = 10f, center = Offset(x, y))
                drawCircle(Purple, radius = 6f, center = Offset(x, y))
            }
        }
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            data.forEach { (label, _) ->
                Text(label, fontSize = 9.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
