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
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Headset
import androidx.compose.material.icons.filled.Sensors
import androidx.compose.material.icons.filled.SpatialAudioOff
import androidx.compose.material.icons.filled.SpatialTracking
import androidx.compose.material.icons.filled.SurroundSound
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.muse.model.AudioSpatialConfig
import com.example.muse.model.RoomPreset
import com.example.muse.ui.theme.MuseColors
import kotlin.math.PI
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

@Composable
fun SpatialAudioDialog(
    config: AudioSpatialConfig,
    onConfigChanged: (AudioSpatialConfig) -> Unit,
    onDismiss: () -> Unit
) {
    val scrollState = rememberScrollState()

    val infiniteTransition = rememberInfiniteTransition(label = "RadarSweep")
    val radarSweepAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "RadarAngle"
    )

    Dialog(onDismissRequest = onDismiss) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(MuseColors.SurfaceDark)
                .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(24.dp))
                .padding(20.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(scrollState)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(
                                    brush = Brush.radialGradient(
                                        listOf(MuseColors.PrimaryAccent.copy(alpha = 0.35f), Color.Transparent)
                                    ),
                                    shape = CircleShape
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.SpatialTracking,
                                contentDescription = "Spatial Audio",
                                tint = MuseColors.PrimaryAccent,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Spatial Audio & Dolby Atmos",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = MuseColors.TextWarmIvory
                            )
                            Text(
                                text = "360° Object-Based Binaural Engine",
                                fontSize = 11.sp,
                                color = MuseColors.PrimaryAccent
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = MuseColors.TextSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Interactive 3D Soundstage Radar Canvas
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(MuseColors.CardSurface)
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Canvas(
                        modifier = Modifier
                            .size(160.dp)
                            .pointerInput(Unit) {
                                detectDragGestures { change, _ ->
                                    change.consume()
                                    val center = Offset(size.width / 2f, size.height / 2f)
                                    val touchPos = change.position
                                    val dx = touchPos.x - center.x
                                    val dy = touchPos.y - center.y
                                    val angleRad = atan2(dy, dx)
                                    val angleDeg = (angleRad * 180.0 / PI).toFloat()
                                    val dist = (sqrt(dx * dx + dy * dy) / (size.width / 2f)).coerceIn(0.2f, 1.8f)
                                    onConfigChanged(
                                        config.copy(
                                            azimuthAngleDegrees = angleDeg,
                                            distanceMeters = dist
                                        )
                                    )
                                }
                            }
                    ) {
                        val center = Offset(size.width / 2f, size.height / 2f)
                        val maxRadius = size.width / 2f * 0.85f

                        // Radar concentric rings
                        drawCircle(
                            color = MuseColors.CardBorder,
                            radius = maxRadius,
                            center = center,
                            style = Stroke(width = 1.dp.toPx())
                        )
                        drawCircle(
                            color = MuseColors.CardBorder.copy(alpha = 0.6f),
                            radius = maxRadius * 0.65f,
                            center = center,
                            style = Stroke(width = 1.dp.toPx())
                        )
                        drawCircle(
                            color = MuseColors.CardBorder.copy(alpha = 0.3f),
                            radius = maxRadius * 0.35f,
                            center = center,
                            style = Stroke(width = 1.dp.toPx())
                        )

                        // Radar sweep beam when spatial is enabled
                        if (config.isSpatialEnabled) {
                            val sweepRad = radarSweepAngle * PI / 180f
                            val sweepEnd = Offset(
                                center.x + (maxRadius * cos(sweepRad)).toFloat(),
                                center.y + (maxRadius * sin(sweepRad)).toFloat()
                            )
                            drawLine(
                                color = MuseColors.PrimaryAccent.copy(alpha = 0.45f),
                                start = center,
                                end = sweepEnd,
                                strokeWidth = 1.5.dp.toPx(),
                                cap = StrokeCap.Round
                            )
                        }

                        // Center Head/Listener Position
                        drawCircle(
                            color = MuseColors.PrimaryAccent,
                            radius = 6.dp.toPx(),
                            center = center
                        )

                        // 3D Audio Source Position
                        val azimuthRad = config.azimuthAngleDegrees * PI / 180f
                        val distNormalized = (config.distanceMeters / 1.5f).coerceIn(0.3f, 1.0f)
                        val sourcePos = Offset(
                            center.x + (maxRadius * distNormalized * cos(azimuthRad)).toFloat(),
                            center.y + (maxRadius * distNormalized * sin(azimuthRad)).toFloat()
                        )

                        // Connection line
                        drawLine(
                            color = MuseColors.SecondaryAccent.copy(alpha = 0.8f),
                            start = center,
                            end = sourcePos,
                            strokeWidth = 1.dp.toPx()
                        )

                        // Glowing source orb
                        drawCircle(
                            color = MuseColors.PrimaryAccent.copy(alpha = 0.35f),
                            radius = 12.dp.toPx(),
                            center = sourcePos
                        )
                        drawCircle(
                            color = MuseColors.PrimaryAccent,
                            radius = 5.dp.toPx(),
                            center = sourcePos
                        )
                    }

                    // Instruction badge
                    Text(
                        text = "Drag orb to position 3D soundstage (${config.azimuthAngleDegrees.toInt()}°)",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = MuseColors.TextSecondary,
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 6.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Primary Toggles: Spatial Audio & Dolby Atmos
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(MuseColors.CardSurface)
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(12.dp))
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Head-Tracking Spatial Audio",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MuseColors.TextPrimary
                            )
                        }
                        Text(
                            text = "Dynamically adjusts soundfield with head movement",
                            fontSize = 11.sp,
                            color = MuseColors.TextSecondary
                        )
                    }
                    Switch(
                        checked = config.isSpatialEnabled,
                        onCheckedChange = { onConfigChanged(config.copy(isSpatialEnabled = it)) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.Black,
                            checkedTrackColor = MuseColors.PrimaryAccent,
                            uncheckedTrackColor = MuseColors.CardBorder
                        )
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(MuseColors.CardSurface)
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(12.dp))
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .background(MuseColors.PrimaryAccent, RoundedCornerShape(3.dp))
                                    .padding(horizontal = 4.dp, vertical = 1.dp)
                            ) {
                                Text(
                                    text = "DOLBY",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.Black
                                )
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Dolby Atmos Enhancement",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MuseColors.TextPrimary
                            )
                        }
                        Text(
                            text = "Multichannel height layers and cinema acoustic rendering",
                            fontSize = 11.sp,
                            color = MuseColors.TextSecondary
                        )
                    }
                    Switch(
                        checked = config.isDolbyAtmosEnabled,
                        onCheckedChange = { onConfigChanged(config.copy(isDolbyAtmosEnabled = it)) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.Black,
                            checkedTrackColor = MuseColors.PrimaryAccent,
                            uncheckedTrackColor = MuseColors.CardBorder
                        )
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Room Preset Picker
                Text(
                    text = "Acoustic Room Profiles",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MuseColors.TextWarmIvory
                )
                Spacer(modifier = Modifier.height(8.dp))

                RoomPreset.values().forEach { preset ->
                    val isSelected = config.roomPreset == preset
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 3.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) MuseColors.CardHighlight else MuseColors.CardSurface)
                            .border(
                                width = 1.dp,
                                color = if (isSelected) MuseColors.PrimaryAccent else MuseColors.CardBorder,
                                shape = RoundedCornerShape(10.dp)
                            )
                            .clickable { onConfigChanged(config.copy(roomPreset = preset)) }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(14.dp)
                                .clip(CircleShape)
                                .background(if (isSelected) MuseColors.PrimaryAccent else Color.Transparent)
                                .border(1.5.dp, if (isSelected) MuseColors.PrimaryAccent else MuseColors.TextMuted, CircleShape)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = preset.label,
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) MuseColors.PrimaryAccent else MuseColors.TextPrimary
                            )
                            Text(
                                text = preset.description,
                                fontSize = 10.sp,
                                color = MuseColors.TextSecondary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Fine-Tuning Sliders: Bass Boost & Vocal Clarity
                Text(
                    text = "Dolby EQ Tuning",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MuseColors.TextWarmIvory
                )
                Spacer(modifier = Modifier.height(8.dp))

                // Bass Boost
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(MuseColors.CardSurface)
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(10.dp))
                        .padding(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Sub-Bass Resonance", fontSize = 12.sp, color = MuseColors.TextPrimary)
                        Text(text = "${(config.bassBoost * 100).toInt()}%", fontSize = 12.sp, color = MuseColors.PrimaryAccent, fontWeight = FontWeight.Bold)
                    }
                    Slider(
                        value = config.bassBoost,
                        onValueChange = { onConfigChanged(config.copy(bassBoost = it)) },
                        colors = SliderDefaults.colors(
                            thumbColor = MuseColors.PrimaryAccent,
                            activeTrackColor = MuseColors.PrimaryAccent,
                            inactiveTrackColor = MuseColors.CardBorder
                        )
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Vocal Clarity
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(MuseColors.CardSurface)
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(10.dp))
                        .padding(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Spatial Vocal Clarity", fontSize = 12.sp, color = MuseColors.TextPrimary)
                        Text(text = "${(config.vocalClarity * 100).toInt()}%", fontSize = 12.sp, color = MuseColors.PrimaryAccent, fontWeight = FontWeight.Bold)
                    }
                    Slider(
                        value = config.vocalClarity,
                        onValueChange = { onConfigChanged(config.copy(vocalClarity = it)) },
                        colors = SliderDefaults.colors(
                            thumbColor = MuseColors.PrimaryAccent,
                            activeTrackColor = MuseColors.PrimaryAccent,
                            inactiveTrackColor = MuseColors.CardBorder
                        )
                    )
                }
            }
        }
    }
}
