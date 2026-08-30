package com.example.muse.ui.components

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Headset
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.RingVolume
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.muse.model.BgmStem
import com.example.muse.model.Song
import com.example.muse.model.StemCategory
import com.example.muse.model.ToneExportType
import com.example.muse.ui.theme.MuseColors

@Composable
fun BgmStemCarousel(
    song: Song,
    stemMuteStates: Map<StemCategory, Boolean>,
    stemSoloStates: Map<StemCategory, Boolean>,
    onToggleMute: (StemCategory) -> Unit,
    onToggleSolo: (StemCategory) -> Unit,
    onDownloadStem: (BgmStem) -> Unit,
    onSetRingtone: (BgmStem, ToneExportType) -> Unit,
    onOpenTrimmerForStem: (BgmStem) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedStemForTone by remember { mutableStateOf<BgmStem?>(null) }
    var downloadFeedback by remember { mutableStateOf<String?>(null) }

    val context = LocalContext.current

    Column(modifier = modifier.fillMaxWidth()) {
        // Section Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .background(
                            brush = Brush.radialGradient(
                                listOf(MuseColors.PrimaryAccent.copy(alpha = 0.35f), Color.Transparent)
                            ),
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Layers,
                        contentDescription = "Stems",
                        tint = MuseColors.PrimaryAccent,
                        modifier = Modifier.size(16.dp)
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "BGM & Multi-Stem Explorer",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = MuseColors.TextPrimary
                )
            }

            Box(
                modifier = Modifier
                    .background(MuseColors.CardSurface, RoundedCornerShape(12.dp))
                    .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(12.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "${song.stems.size} Isolated BGMs",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = MuseColors.PrimaryAccent
                )
            }
        }

        // Horizontal Stem Carousel
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(song.stems) { stem ->
                val isMuted = stemMuteStates[stem.category] == true
                val isSoloed = stemSoloStates[stem.category] == true
                val anySolo = stemSoloStates.values.any { it }
                val isAudible = if (anySolo) isSoloed else !isMuted

                StemCard(
                    stem = stem,
                    isAudible = isAudible,
                    isMuted = isMuted,
                    isSoloed = isSoloed,
                    onToggleMute = { onToggleMute(stem.category) },
                    onToggleSolo = { onToggleSolo(stem.category) },
                    onDownload = {
                        onDownloadStem(stem)
                        downloadFeedback = "Extracted '${stem.name}' to Offline HQ Vault!"
                    },
                    onToneClick = { selectedStemForTone = stem },
                    onTrimClick = { onOpenTrimmerForStem(stem) }
                )
            }
        }

        // Download Feedback Notification Banner
        AnimatedVisibility(visible = downloadFeedback != null) {
            downloadFeedback?.let { msg ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 4.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(MuseColors.EmeraldGreen.copy(alpha = 0.15f))
                        .border(1.dp, MuseColors.EmeraldGreen, RoundedCornerShape(10.dp))
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Success",
                        tint = MuseColors.EmeraldGreen,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = msg,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = MuseColors.TextPrimary,
                        modifier = Modifier.weight(1f)
                    )
                    Text(
                        text = "Dismiss",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MuseColors.PrimaryAccent,
                        modifier = Modifier.clickable { downloadFeedback = null }
                    )
                }
            }
        }
    }

    // Set Ringtone / Alarm / Notification Tone Dialog
    selectedStemForTone?.let { stem ->
        SetToneDialog(
            stem = stem,
            onDismiss = { selectedStemForTone = null },
            onConfirm = { toneType ->
                onSetRingtone(stem, toneType)
                selectedStemForTone = null
                downloadFeedback = "Assigned '${stem.name}' as ${toneType.label}!"
            }
        )
    }
}

@Composable
fun StemCard(
    stem: BgmStem,
    isAudible: Boolean,
    isMuted: Boolean,
    isSoloed: Boolean,
    onToggleMute: () -> Unit,
    onToggleSolo: () -> Unit,
    onDownload: () -> Unit,
    onToneClick: () -> Unit,
    onTrimClick: () -> Unit
) {
    val borderColor = when {
        isSoloed -> MuseColors.PrimaryAccent
        isAudible -> MuseColors.CardBorder
        else -> MuseColors.CardBorder.copy(alpha = 0.4f)
    }

    val cardBg = if (isAudible) MuseColors.CardSurface else MuseColors.SurfaceDark

    Column(
        modifier = Modifier
            .width(220.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(cardBg)
            .border(1.dp, borderColor, RoundedCornerShape(16.dp))
            .padding(12.dp)
    ) {
        // Category pill & Stem duration
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .background(
                        when (stem.category) {
                            StemCategory.MAIN_MELODY -> MuseColors.PrimaryAccent.copy(alpha = 0.18f)
                            StemCategory.BASSLINE_GROOVE -> MuseColors.SecondaryAccent.copy(alpha = 0.25f)
                            StemCategory.DRUMS_PERCUSSION -> MuseColors.RosePink.copy(alpha = 0.2f)
                            StemCategory.AMBIENT_PAD -> MuseColors.EmeraldGreen.copy(alpha = 0.2f)
                            StemCategory.CLIMAX_SOLO -> MuseColors.AccentLight.copy(alpha = 0.2f)
                        },
                        RoundedCornerShape(6.dp)
                    )
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = when (stem.category) {
                        StemCategory.MAIN_MELODY -> "LEAD THEME"
                        StemCategory.BASSLINE_GROOVE -> "BASS GROOVE"
                        StemCategory.DRUMS_PERCUSSION -> "808 BEAT"
                        StemCategory.AMBIENT_PAD -> "ATMOS PAD"
                        StemCategory.CLIMAX_SOLO -> "CLIMAX SOLO"
                    },
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = when (stem.category) {
                        StemCategory.MAIN_MELODY -> MuseColors.PrimaryAccent
                        StemCategory.BASSLINE_GROOVE -> MuseColors.AccentLight
                        StemCategory.DRUMS_PERCUSSION -> MuseColors.RosePink
                        StemCategory.AMBIENT_PAD -> MuseColors.EmeraldGreen
                        StemCategory.CLIMAX_SOLO -> MuseColors.PrimaryAccent
                    }
                )
            }

            Text(
                text = "${stem.durationMs / 1000}s HQ",
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
                color = MuseColors.TextSecondary
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Stem Name & Description
        Text(
            text = stem.name,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = if (isAudible) MuseColors.TextPrimary else MuseColors.TextSecondary,
            maxLines = 1
        )
        Text(
            text = stem.description,
            fontSize = 10.sp,
            color = MuseColors.TextMuted,
            maxLines = 2,
            lineHeight = 13.sp
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Mini Stem Waveform Preview
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(28.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(MuseColors.SurfaceDark)
                .padding(horizontal = 4.dp, vertical = 2.dp)
        ) {
            val count = stem.waveformPoints.size
            val barW = (size.width / count) * 0.7f
            val spacing = (size.width / count) * 0.3f

            val waveBrush = Brush.verticalGradient(
                listOf(
                    if (isAudible) MuseColors.PrimaryAccent else MuseColors.TextMuted,
                    if (isAudible) MuseColors.SecondaryAccent else MuseColors.CardBorder
                )
            )

            stem.waveformPoints.forEachIndexed { i, pt ->
                val barH = size.height * pt
                val x = i * (barW + spacing)
                val y = (size.height - barH) / 2f
                drawRoundRect(
                    brush = waveBrush,
                    topLeft = Offset(x, y),
                    size = Size(barW, barH),
                    cornerRadius = CornerRadius(barW / 2, barW / 2)
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Stem Controls: Solo & Mute
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            // Solo Button
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (isSoloed) MuseColors.PrimaryAccent else MuseColors.CardHighlight)
                    .clickable { onToggleSolo() }
                    .padding(vertical = 6.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "SOLO",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isSoloed) Color.Black else MuseColors.TextSecondary
                )
            }

            // Mute Button
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (isMuted) MuseColors.RosePink.copy(alpha = 0.2f) else MuseColors.CardHighlight)
                    .border(
                        1.dp,
                        if (isMuted) MuseColors.RosePink else Color.Transparent,
                        RoundedCornerShape(8.dp)
                    )
                    .clickable { onToggleMute() }
                    .padding(vertical = 6.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                        contentDescription = "Mute",
                        tint = if (isMuted) MuseColors.RosePink else MuseColors.TextSecondary,
                        modifier = Modifier.size(12.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (isMuted) "MUTED" else "MUTE",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isMuted) MuseColors.RosePink else MuseColors.TextSecondary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Action Toolbar: Download, Ringtone, Trim
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // 1-Tap HQ Download
            IconButton(
                onClick = onDownload,
                modifier = Modifier
                    .size(30.dp)
                    .background(MuseColors.PrimaryAccent.copy(alpha = 0.15f), CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.Download,
                    contentDescription = "Download HQ Stem",
                    tint = MuseColors.PrimaryAccent,
                    modifier = Modifier.size(15.dp)
                )
            }

            // Direct Ringtone / Alarm Assigner
            IconButton(
                onClick = onToneClick,
                modifier = Modifier
                    .size(30.dp)
                    .background(MuseColors.SurfaceDark, CircleShape)
                    .border(1.dp, MuseColors.CardBorder, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.RingVolume,
                    contentDescription = "Set as Ringtone",
                    tint = MuseColors.PrimaryAccent,
                    modifier = Modifier.size(15.dp)
                )
            }

            // Built-in Waveform Trimmer
            IconButton(
                onClick = onTrimClick,
                modifier = Modifier
                    .size(30.dp)
                    .background(MuseColors.SurfaceDark, CircleShape)
                    .border(1.dp, MuseColors.CardBorder, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.ContentCut,
                    contentDescription = "Trim Stem",
                    tint = MuseColors.PrimaryAccent,
                    modifier = Modifier.size(15.dp)
                )
            }
        }
    }
}

@Composable
fun SetToneDialog(
    stem: BgmStem,
    onDismiss: () -> Unit,
    onConfirm: (ToneExportType) -> Unit
) {
    val context = LocalContext.current
    var selectedType by remember { mutableStateOf(ToneExportType.RINGTONE) }
    var isVibrating by remember { mutableStateOf(false) }

    fun triggerHapticPreview() {
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val timings = longArrayOf(0, 150, 80, 250, 80, 400)
            val amplitudes = intArrayOf(0, 200, 0, 255, 0, 220)
            vibrator?.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
        } else {
            vibrator?.vibrate(500)
        }
        isVibrating = true
    }

    Dialog(onDismissRequest = onDismiss) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(22.dp))
                .background(MuseColors.SurfaceDark)
                .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(22.dp))
                .padding(20.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(MuseColors.PrimaryAccent.copy(alpha = 0.2f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.RingVolume,
                            contentDescription = "Ringtone",
                            tint = MuseColors.PrimaryAccent,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Set BGM as Device Tone",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MuseColors.TextPrimary
                        )
                        Text(
                            text = "Extracted Stem: ${stem.name}",
                            fontSize = 11.sp,
                            color = MuseColors.TextSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Tone Option Cards
                listOf(
                    ToneExportType.RINGTONE to (Icons.Default.PhoneAndroid to "Primary Incoming Call Tone"),
                    ToneExportType.NOTIFICATION to (Icons.Default.NotificationsActive to "Instant Messaging & Alerts"),
                    ToneExportType.ALARM to (Icons.Default.Alarm to "Dynamic Sunrise Wake-up Tone")
                ).forEach { (type, meta) ->
                    val (icon, desc) = meta
                    val isSelected = selectedType == type
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isSelected) MuseColors.CardHighlight else MuseColors.CardSurface)
                            .border(
                                1.dp,
                                if (isSelected) MuseColors.PrimaryAccent else MuseColors.CardBorder,
                                RoundedCornerShape(12.dp)
                            )
                            .clickable { selectedType = type }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = icon,
                            contentDescription = type.label,
                            tint = if (isSelected) MuseColors.PrimaryAccent else MuseColors.TextSecondary,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = type.label,
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) MuseColors.PrimaryAccent else MuseColors.TextPrimary
                            )
                            Text(
                                text = desc,
                                fontSize = 10.sp,
                                color = MuseColors.TextSecondary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Test Haptic Vibration Pattern
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(MuseColors.CardSurface)
                        .clickable { triggerHapticPreview() }
                        .padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.GraphicEq,
                        contentDescription = "Test Haptic",
                        tint = MuseColors.PrimaryAccent,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isVibrating) "Vibration Pattern Triggered" else "Test Tone Vibration Feedback",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MuseColors.PrimaryAccent
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MuseColors.CardHighlight
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Cancel", color = MuseColors.TextSecondary, fontSize = 12.sp)
                    }

                    Button(
                        onClick = { onConfirm(selectedType) },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MuseColors.PrimaryAccent
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Apply Tone", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
