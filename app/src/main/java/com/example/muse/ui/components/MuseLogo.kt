package com.example.muse.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.muse.ui.theme.MuseColors

@Composable
fun MuseLogo(
    modifier: Modifier = Modifier,
    size: Dp = 36.dp,
    showWordmark: Boolean = true,
    showTagline: Boolean = false,
    isAnimated: Boolean = true
) {
    val infiniteTransition = rememberInfiniteTransition(label = "MuseLogoPulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.92f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "LogoPulse"
    )

    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        // Geometric Soundwave 'M' Emblem
        Box(
            modifier = Modifier
                .size(size)
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            MuseColors.PrimaryAccent.copy(alpha = 0.40f),
                            MuseColors.SecondaryAccent.copy(alpha = 0.20f),
                            Color.Transparent
                        )
                    ),
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Canvas(
                modifier = Modifier
                    .size(size * 0.75f)
            ) {
                val w = this.size.width
                val h = this.size.height

                val barBrush = Brush.verticalGradient(
                    colors = listOf(
                        MuseColors.PrimaryAccent,
                        MuseColors.SecondaryAccent
                    )
                )

                val barWidth = w * 0.14f
                val spacing = w * 0.07f
                val corner = CornerRadius(barWidth / 2, barWidth / 2)

                // 5 vertical soundwave bars forming 'M' pattern
                val heights = listOf(
                    0.85f * if (isAnimated) pulseScale else 1.0f,
                    0.55f,
                    0.95f * if (isAnimated) (2f - pulseScale) else 1.0f,
                    0.55f,
                    0.85f * if (isAnimated) pulseScale else 1.0f
                )

                heights.forEachIndexed { index, heightFraction ->
                    val barH = h * heightFraction.coerceIn(0.2f, 1.0f)
                    val x = index * (barWidth + spacing)
                    val y = (h - barH) / 2f
                    drawRoundRect(
                        brush = barBrush,
                        topLeft = Offset(x, y),
                        size = Size(barWidth, barH),
                        cornerRadius = corner
                    )
                }
            }
        }

        if (showWordmark) {
            Spacer(modifier = Modifier.width(10.dp))
            Column(horizontalAlignment = Alignment.Start) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "MUSE",
                        fontSize = (size.value * 0.55f).sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 3.sp,
                        color = MuseColors.TextPrimary,
                        fontFamily = FontFamily.SansSerif
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Box(
                        modifier = Modifier
                            .background(
                                brush = Brush.horizontalGradient(
                                    listOf(MuseColors.PrimaryAccent, MuseColors.SecondaryAccent)
                                ),
                                shape = RoundedCornerShape(4.dp)
                            )
                            .padding(horizontal = 5.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "DOLBY ATMOS",
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }

                if (showTagline) {
                    Text(
                        text = "SPATIAL AUDIO & VOICE AI",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = 1.2.sp,
                        color = MuseColors.TextSecondary
                    )
                }
            }
        }
    }
}
