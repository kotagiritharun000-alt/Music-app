package com.example.muse.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.example.muse.ui.theme.MuseColors

@Composable
fun FrequencySpectrumVisualizer(
    frequencyBands: List<Float>,
    modifier: Modifier = Modifier,
    height: Dp = 48.dp,
    isPlaying: Boolean = true
) {
    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(height)
    ) {
        val count = frequencyBands.size.coerceAtLeast(1)
        val barSpacing = size.width * 0.02f
        val totalSpacing = barSpacing * (count - 1)
        val barWidth = (size.width - totalSpacing) / count

        val barBrush = Brush.verticalGradient(
            colors = listOf(
                MuseColors.PrimaryAccent,
                MuseColors.SecondaryAccent,
                MuseColors.CardBorder
            )
        )

        frequencyBands.forEachIndexed { index, rawMagnitude ->
            val magnitude = if (isPlaying) rawMagnitude.coerceIn(0.08f, 1.0f) else 0.05f
            val barHeight = size.height * magnitude
            val x = index * (barWidth + barSpacing)
            val y = size.height - barHeight

            drawRoundRect(
                brush = barBrush,
                topLeft = Offset(x, y),
                size = Size(barWidth, barHeight),
                cornerRadius = CornerRadius(barWidth / 2, barWidth / 2)
            )

            // Glowing top cap
            if (isPlaying && magnitude > 0.3f) {
                drawCircle(
                    color = MuseColors.PrimaryAccent,
                    radius = barWidth * 0.45f,
                    center = Offset(x + barWidth / 2, y)
                )
            }
        }
    }
}
