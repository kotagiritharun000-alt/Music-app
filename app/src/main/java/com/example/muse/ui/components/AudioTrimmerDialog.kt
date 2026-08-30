package com.example.muse.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
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
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.RingVolume
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material.icons.filled.ZoomOut
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.muse.model.BgmStem
import com.example.muse.model.Song
import com.example.muse.model.ToneExportType
import com.example.muse.ui.theme.MuseColors
import java.util.Locale

@Composable
fun AudioTrimmerDialog(
    song: Song,
    initialStem: BgmStem? = null,
    isPlayingPreview: Boolean,
    onStartLoopPreview: (Long, Long) -> Unit,
    onStopLoopPreview: () -> Unit,
    onExportCrop: (title: String, startMs: Long, endMs: Long, isRingtone: Boolean) -> Unit,
    onDismiss: () -> Unit
) {
    val totalDurationMs = initialStem?.durationMs ?: song.durationMs
    var startMs by remember { mutableLongStateOf(0L) }
    var endMs by remember { mutableLongStateOf(30000L.coerceAtMost(totalDurationMs)) }

    var customTitle by remember {
        mutableStateOf(
            if (initialStem != null) "Muse_${initialStem.name.replace(" ", "_")}" else "Muse_${song.title.replace(" ", "_")}_Trim"
        )
    }

    var isFadeIn by remember { mutableStateOf(true) }
    var isFadeOut by remember { mutableStateOf(true) }
    var zoomLevel by remember { mutableFloatStateOf(1.0f) }

    val scrollState = rememberScrollState()

    fun formatMs(ms: Long): String {
        val totalSec = ms / 1000
        val minutes = totalSec / 60
        val seconds = totalSec % 60
        val millis = ms % 1000
        return String.format(Locale.ROOT, "%02d:%02d.%03d", minutes, seconds, millis)
    }

    Dialog(onDismissRequest = onDismiss) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(MuseColors.SurfaceDark)
                .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(24.dp))
                .padding(18.dp)
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
                                .background(MuseColors.PrimaryAccent.copy(alpha = 0.25f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.ContentCut,
                                contentDescription = "Audio Trimmer",
                                tint = MuseColors.PrimaryAccent,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Audio Studio & Ringtone Trimmer",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = MuseColors.TextWarmIvory
                            )
                            Text(
                                text = if (initialStem != null) "Editing BGM: ${initialStem.name}" else "Editing Song: ${song.title}",
                                fontSize = 11.sp,
                                color = MuseColors.TextSecondary
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

                Spacer(modifier = Modifier.height(14.dp))

                // Time Metrics Cards (Millisecond accurate)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Start Handle Box
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(MuseColors.CardSurface)
                            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(10.dp))
                            .padding(8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "START POINT", fontSize = 9.sp, color = MuseColors.TextMuted, fontWeight = FontWeight.Bold)
                        Text(
                            text = formatMs(startMs),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MuseColors.PrimaryAccent,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    // Duration Box
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(MuseColors.CardSurface)
                            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(10.dp))
                            .padding(8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "CLIP LENGTH", fontSize = 9.sp, color = MuseColors.TextMuted, fontWeight = FontWeight.Bold)
                        Text(
                            text = formatMs(endMs - startMs),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MuseColors.PrimaryAccent,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    // End Handle Box
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(MuseColors.CardSurface)
                            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(10.dp))
                            .padding(8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "END POINT", fontSize = 9.sp, color = MuseColors.TextMuted, fontWeight = FontWeight.Bold)
                        Text(
                            text = formatMs(endMs),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MuseColors.PrimaryAccent,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Interactive Waveform Editor Canvas
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(130.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(MuseColors.CardSurface)
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(14.dp))
                        .padding(8.dp)
                ) {
                    val waveform = initialStem?.waveformPoints ?: song.stems.firstOrNull()?.waveformPoints ?: List(50) { 0.5f }

                    Canvas(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(114.dp)
                            .pointerInput(Unit) {
                                detectDragGestures { change, _ ->
                                    change.consume()
                                    val x = change.position.x.coerceIn(0f, size.width.toFloat())
                                    val touchRatio = (x / size.width).coerceIn(0f, 1f)
                                    val targetMs = (touchRatio * totalDurationMs).toLong()

                                    // Pick closer handle
                                    val distStart = kotlin.math.abs(targetMs - startMs)
                                    val distEnd = kotlin.math.abs(targetMs - endMs)

                                    if (distStart < distEnd) {
                                        startMs = targetMs.coerceIn(0L, endMs - 1000L)
                                    } else {
                                        endMs = targetMs.coerceIn(startMs + 1000L, totalDurationMs)
                                    }
                                }
                            }
                    ) {
                        val w = size.width
                        val h = size.height

                        val startX = (startMs.toFloat() / totalDurationMs) * w
                        val endX = (endMs.toFloat() / totalDurationMs) * w

                        // Background inactive waveform bars
                        val count = waveform.size
                        val barW = (w / count) * 0.7f
                        val spacing = (w / count) * 0.3f

                        waveform.forEachIndexed { i, pt ->
                            val barH = h * pt * 0.8f
                            val x = i * (barW + spacing)
                            val y = (h - barH) / 2f
                            val isInSelection = x in startX..endX

                            drawRoundRect(
                                color = if (isInSelection) MuseColors.PrimaryAccent else MuseColors.CardBorder.copy(alpha = 0.5f),
                                topLeft = Offset(x, y),
                                size = Size(barW, barH),
                                cornerRadius = CornerRadius(barW / 2, barW / 2)
                            )
                        }

                        // Selected Region Highlight Glow
                        drawRect(
                            color = MuseColors.PrimaryAccent.copy(alpha = 0.14f),
                            topLeft = Offset(startX, 0f),
                            size = Size(endX - startX, h)
                        )

                        // Start Scrubber Handle Line & Tag
                        drawLine(
                            color = MuseColors.PrimaryAccent,
                            start = Offset(startX, 0f),
                            end = Offset(startX, h),
                            strokeWidth = 3.dp.toPx()
                        )
                        drawCircle(
                            color = MuseColors.PrimaryAccent,
                            radius = 6.dp.toPx(),
                            center = Offset(startX, h / 2f)
                        )

                        // End Scrubber Handle Line & Tag
                        drawLine(
                            color = MuseColors.PrimaryAccent,
                            start = Offset(endX, 0f),
                            end = Offset(endX, h),
                            strokeWidth = 3.dp.toPx()
                        )
                        drawCircle(
                            color = MuseColors.PrimaryAccent,
                            radius = 6.dp.toPx(),
                            center = Offset(endX, h / 2f)
                        )
                    }

                    // Scrubber drag instructions
                    Text(
                        text = "Touch & drag waveform bounds to crop",
                        fontSize = 9.sp,
                        color = MuseColors.TextSecondary,
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Transport Toolbar: Preview Loop & Zoom
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Loop Playback Preview Button
                    Button(
                        onClick = {
                            if (isPlayingPreview) onStopLoopPreview() else onStartLoopPreview(startMs, endMs)
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isPlayingPreview) MuseColors.RosePink else MuseColors.PrimaryAccent
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(
                            imageVector = if (isPlayingPreview) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = "Preview Crop",
                            tint = Color.Black,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isPlayingPreview) "Stop Preview" else "Play Loop",
                            color = Color.Black,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }

                    // Zoom Controls
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(MuseColors.CardSurface)
                            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(8.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(
                            onClick = { zoomLevel = (zoomLevel - 0.25f).coerceAtLeast(0.5f) },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(imageVector = Icons.Default.ZoomOut, contentDescription = "Zoom Out", tint = MuseColors.TextSecondary, modifier = Modifier.size(16.dp))
                        }
                        Text(text = "${(zoomLevel * 100).toInt()}%", fontSize = 10.sp, color = MuseColors.TextPrimary)
                        IconButton(
                            onClick = { zoomLevel = (zoomLevel + 0.25f).coerceAtMost(2.5f) },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(imageVector = Icons.Default.ZoomIn, contentDescription = "Zoom In", tint = MuseColors.TextSecondary, modifier = Modifier.size(16.dp))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Fade In & Out Toggles
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(MuseColors.CardSurface)
                            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(10.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Fade In (1.5s)", fontSize = 11.sp, color = MuseColors.TextPrimary)
                        Switch(
                            checked = isFadeIn,
                            onCheckedChange = { isFadeIn = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.Black,
                                checkedTrackColor = MuseColors.PrimaryAccent,
                                uncheckedTrackColor = MuseColors.CardBorder
                            ),
                            modifier = Modifier.size(36.dp)
                        )
                    }

                    Row(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(MuseColors.CardSurface)
                            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(10.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Fade Out (1.5s)", fontSize = 11.sp, color = MuseColors.TextPrimary)
                        Switch(
                            checked = isFadeOut,
                            onCheckedChange = { isFadeOut = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.Black,
                                checkedTrackColor = MuseColors.PrimaryAccent,
                                uncheckedTrackColor = MuseColors.CardBorder
                            ),
                            modifier = Modifier.size(36.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Custom Export Title Field
                OutlinedTextField(
                    value = customTitle,
                    onValueChange = { customTitle = it },
                    label = { Text("Export File Name", fontSize = 11.sp) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MuseColors.PrimaryAccent,
                        unfocusedBorderColor = MuseColors.CardBorder,
                        focusedTextColor = MuseColors.TextPrimary,
                        unfocusedTextColor = MuseColors.TextPrimary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Action Buttons: Save to Device Tone & Save to Storage
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = {
                            onExportCrop(customTitle, startMs, endMs, true)
                            onDismiss()
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MuseColors.PrimaryAccent
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(imageVector = Icons.Default.RingVolume, contentDescription = "Ringtone", tint = Color.Black, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Set as Ringtone", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }

                    Button(
                        onClick = {
                            onExportCrop(customTitle, startMs, endMs, false)
                            onDismiss()
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MuseColors.SecondaryAccent
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Download, contentDescription = "Download", tint = Color.White, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Export to Storage", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                }
            }
        }
    }
}
