package com.example.muse.ui.screens

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
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Architecture
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.QueueMusic
import androidx.compose.material.icons.filled.Repeat
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.material.icons.filled.SpatialTracking
import androidx.compose.material.icons.filled.SurroundSound
import androidx.compose.material.icons.filled.VolumeDown
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.muse.model.AudioSpatialConfig
import com.example.muse.model.BgmStem
import com.example.muse.model.Song
import com.example.muse.model.StemCategory
import com.example.muse.model.ToneExportType
import com.example.muse.ui.components.BgmStemCarousel
import com.example.muse.ui.components.FrequencySpectrumVisualizer
import com.example.muse.ui.components.MuseLogo
import com.example.muse.ui.theme.MuseColors
import java.util.Locale
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun MainPlayerScreen(
    currentSong: Song,
    isPlaying: Boolean,
    currentPositionMs: Long,
    volume: Int,
    isMuted: Boolean,
    frequencyBands: List<Float>,
    spatialConfig: AudioSpatialConfig,
    stemMuteStates: Map<StemCategory, Boolean>,
    stemSoloStates: Map<StemCategory, Boolean>,
    isFavorite: Boolean,
    onTogglePlayPause: () -> Unit,
    onNextSong: () -> Unit,
    onPreviousSong: () -> Unit,
    onSeekTo: (Long) -> Unit,
    onVolumeChange: (Int) -> Unit,
    onToggleMute: () -> Unit,
    onToggleFavorite: () -> Unit,
    onToggleStemMute: (StemCategory) -> Unit,
    onToggleStemSolo: (StemCategory) -> Unit,
    onDownloadStem: (BgmStem) -> Unit,
    onSetRingtone: (BgmStem, ToneExportType) -> Unit,
    onOpenTrimmerForStem: (BgmStem?) -> Unit,
    onOpenSpatialDialog: () -> Unit,
    onOpenVoiceAssistant: () -> Unit,
    onOpenLyricsChat: () -> Unit,
    onOpenPrdSheet: () -> Unit,
    onNavigateToLibrary: () -> Unit,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "ArtworkSpin")
    val orbitAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(12000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "Orbit"
    )

    fun formatTime(ms: Long): String {
        val sec = ms / 1000
        val m = sec / 60
        val s = sec % 60
        return String.format(Locale.ROOT, "%d:%02d", m, s)
    }

    // Active lyric snippet
    val activeLyric = currentSong.lyrics.lastOrNull { it.timestampMs <= currentPositionMs }?.text
        ?: currentSong.lyrics.firstOrNull()?.text ?: "Hold the frequency, don't let it slip away"

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MuseColors.Background)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 80.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // TOP APP BAR
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                MuseLogo(size = 32.dp, showWordmark = true, showTagline = false)

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Spatial Audio & Dolby Status Badge
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(MuseColors.CardSurface)
                            .border(
                                1.dp,
                                if (spatialConfig.isSpatialEnabled) MuseColors.PrimaryAccent.copy(alpha = 0.6f) else MuseColors.CardBorder,
                                RoundedCornerShape(20.dp)
                            )
                            .clickable { onOpenSpatialDialog() }
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .background(
                                        if (spatialConfig.isSpatialEnabled) MuseColors.PrimaryAccent else MuseColors.TextMuted,
                                        CircleShape
                                    )
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (spatialConfig.isDolbyAtmosEnabled) "DOLBY ATMOS" else "SPATIAL 3D",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp,
                                color = if (spatialConfig.isSpatialEnabled) MuseColors.TextPrimary else MuseColors.TextSecondary
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // PRD & Architecture Blueprint Inspector
                    IconButton(
                        onClick = onOpenPrdSheet,
                        modifier = Modifier
                            .size(34.dp)
                            .background(MuseColors.CardSurface, CircleShape)
                            .border(1.dp, MuseColors.CardBorder, CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Architecture,
                            contentDescription = "PRD Blueprint",
                            tint = MuseColors.PrimaryAccent,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(4.dp))

                    // Library Switcher
                    IconButton(
                        onClick = onNavigateToLibrary,
                        modifier = Modifier
                            .size(34.dp)
                            .background(MuseColors.CardSurface, CircleShape)
                            .border(1.dp, MuseColors.CardBorder, CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.QueueMusic,
                            contentDescription = "Library",
                            tint = MuseColors.TextPrimary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }

        // 3D HIFI ARTWORK & ROTATING SOUNDSTAGE DISC
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(230.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                Color(0xFF3A1510).copy(alpha = 0.75f),
                                MuseColors.CardSurface,
                                MuseColors.Background
                            )
                        )
                    )
                    .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(24.dp)),
                contentAlignment = Alignment.Center
            ) {
                // Interactive Soundstage Canvas
                Canvas(modifier = Modifier.size(190.dp)) {
                    val center = Offset(size.width / 2f, size.height / 2f)
                    val discRadius = size.width / 2f * 0.75f

                    // Glowing backdrop aura
                    drawCircle(
                        brush = Brush.radialGradient(
                            listOf(
                                MuseColors.PrimaryAccent.copy(alpha = 0.35f),
                                MuseColors.SecondaryAccent.copy(alpha = 0.15f),
                                Color.Transparent
                            )
                        ),
                        radius = discRadius * 1.3f,
                        center = center
                    )

                    // Vinyl / Holographic Disc Surface
                    drawCircle(
                        brush = Brush.sweepGradient(
                            listOf(
                                MuseColors.PrimaryAccent,
                                MuseColors.SecondaryAccent,
                                MuseColors.AccentLight,
                                MuseColors.PrimaryAccent
                            )
                        ),
                        radius = discRadius,
                        center = center
                    )

                    // Concentric Groove Rings
                    for (step in 1..4) {
                        drawCircle(
                            color = Color.Black.copy(alpha = 0.45f),
                            radius = discRadius * (0.35f + step * 0.14f),
                            center = center,
                            style = Stroke(width = 1.dp.toPx())
                        )
                    }

                    // Center Hub with Muse Emblem
                    drawCircle(
                        color = MuseColors.SurfaceDark,
                        radius = discRadius * 0.32f,
                        center = center
                    )

                    // Orbiting 3D Spatial Audio Object
                    if (isPlaying) {
                        val rad = orbitAngle * PI / 180f
                        val orbitX = center.x + (discRadius * 1.15f * cos(rad)).toFloat()
                        val orbitY = center.y + (discRadius * 1.15f * sin(rad)).toFloat()

                        drawCircle(
                            color = MuseColors.PrimaryAccent.copy(alpha = 0.4f),
                            radius = 10.dp.toPx(),
                            center = Offset(orbitX, orbitY)
                        )
                        drawCircle(
                            color = MuseColors.PrimaryAccent,
                            radius = 4.dp.toPx(),
                            center = Offset(orbitX, orbitY)
                        )
                    }
                }

                // Hi-Res Lossless & Atmos Badges
                Row(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .background(MuseColors.SurfaceDark.copy(alpha = 0.9f), RoundedCornerShape(20.dp))
                            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(20.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "HI-RES LOSSLESS ${currentSong.bitDepth}b/${currentSong.sampleRateKhz}kHz",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = MuseColors.TextWarmIvory
                        )
                    }

                    Box(
                        modifier = Modifier
                            .background(Color.Black.copy(alpha = 0.7f), RoundedCornerShape(20.dp))
                            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(20.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(5.dp)
                                    .background(MuseColors.PrimaryAccent, CircleShape)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "DOLBY ATMOS",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }

                // Musical Key & BPM Badge
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(12.dp)
                        .background(MuseColors.SurfaceDark.copy(alpha = 0.9f), RoundedCornerShape(20.dp))
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(20.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "${currentSong.bpm} BPM • ${currentSong.key}",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = MuseColors.TextWarmIvory
                    )
                }
            }
        }

        // REAL-TIME FREQUENCY SPECTRUM ANALYZER
        item {
            FrequencySpectrumVisualizer(
                frequencyBands = frequencyBands,
                height = 36.dp,
                isPlaying = isPlaying
            )
        }

        // TRACK METADATA & FAVORITE
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = currentSong.title,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black,
                        color = MuseColors.TextPrimary,
                        maxLines = 1
                    )
                    Text(
                        text = "${currentSong.artist} — ${currentSong.album}",
                        fontSize = 12.sp,
                        color = MuseColors.TextSecondary,
                        maxLines = 1
                    )
                }

                IconButton(
                    onClick = onToggleFavorite,
                    modifier = Modifier
                        .size(40.dp)
                        .background(MuseColors.CardSurface, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Favorite,
                        contentDescription = "Favorite",
                        tint = if (isFavorite) MuseColors.RosePink else MuseColors.TextMuted,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }

        // SYNCED LYRICS INTELLIGENCE BANNER
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(MuseColors.CardSurface)
                    .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(14.dp))
                    .clickable { onOpenLyricsChat() }
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.MenuBook,
                    contentDescription = null,
                    tint = MuseColors.PrimaryAccent,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "♪ \"$activeLyric\"",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = MuseColors.TextWarmIvory,
                    maxLines = 1,
                    modifier = Modifier.weight(1f)
                )
                Box(
                    modifier = Modifier
                        .background(MuseColors.PrimaryAccent.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 7.dp, vertical = 3.dp)
                ) {
                    Text("AI NOTES", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MuseColors.PrimaryAccent)
                }
            }
        }

        // SCRUBBER & TIMELINE
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                Slider(
                    value = currentPositionMs.toFloat(),
                    onValueChange = { onSeekTo(it.toLong()) },
                    valueRange = 0f..(currentSong.durationMs.toFloat()),
                    colors = SliderDefaults.colors(
                        thumbColor = MuseColors.PrimaryAccent,
                        activeTrackColor = MuseColors.PrimaryAccent,
                        inactiveTrackColor = MuseColors.CardBorder
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = formatTime(currentPositionMs),
                        fontSize = 11.sp,
                        color = MuseColors.TextSecondary,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = "-${formatTime((currentSong.durationMs - currentPositionMs).coerceAtLeast(0L))}",
                        fontSize = 11.sp,
                        color = MuseColors.TextSecondary,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }

        // MASTER PLAYBACK CONTROLS
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = { /* Shuffle */ }) {
                    Icon(Icons.Default.Shuffle, contentDescription = "Shuffle", tint = MuseColors.TextSecondary, modifier = Modifier.size(20.dp))
                }

                IconButton(
                    onClick = onPreviousSong,
                    modifier = Modifier
                        .size(48.dp)
                        .background(MuseColors.CardSurface, CircleShape)
                        .border(1.dp, MuseColors.CardBorder, CircleShape)
                ) {
                    Icon(Icons.Default.SkipPrevious, contentDescription = "Previous", tint = MuseColors.TextPrimary, modifier = Modifier.size(26.dp))
                }

                // Main Play/Pause Button (High Contrast White / Radiant Ember matching design)
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .clip(CircleShape)
                        .background(
                            brush = Brush.radialGradient(
                                listOf(Color.White, Color(0xFFE0D8D0))
                            )
                        )
                        .clickable { onTogglePlayPause() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = if (isPlaying) "Pause" else "Play",
                        tint = Color.Black,
                        modifier = Modifier.size(38.dp)
                    )
                }

                IconButton(
                    onClick = onNextSong,
                    modifier = Modifier
                        .size(48.dp)
                        .background(MuseColors.CardSurface, CircleShape)
                        .border(1.dp, MuseColors.CardBorder, CircleShape)
                ) {
                    Icon(Icons.Default.SkipNext, contentDescription = "Next", tint = MuseColors.TextPrimary, modifier = Modifier.size(26.dp))
                }

                IconButton(onClick = { /* Repeat */ }) {
                    Icon(Icons.Default.Repeat, contentDescription = "Repeat", tint = MuseColors.TextSecondary, modifier = Modifier.size(20.dp))
                }
            }
        }

        // BGM / MULTI-STEM EXTRACTOR SEGMENT EXPLORER (4-5 Stems surfaced directly in player)
        item {
            BgmStemCarousel(
                song = currentSong,
                stemMuteStates = stemMuteStates,
                stemSoloStates = stemSoloStates,
                onToggleMute = onToggleStemMute,
                onToggleSolo = onToggleStemSolo,
                onDownloadStem = onDownloadStem,
                onSetRingtone = onSetRingtone,
                onOpenTrimmerForStem = onOpenTrimmerForStem
            )
        }

        // QUICK BOTTOM UTILITY DOCK (Voice AI, Trimmer, Spatial, Lyrics, Volume)
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(MuseColors.CardSurface)
                    .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(20.dp))
                    .padding(14.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    // Quick Action Buttons Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // "Hey Muse" Voice AI Launcher Button
                        Button(
                            onClick = onOpenVoiceAssistant,
                            colors = ButtonDefaults.buttonColors(containerColor = MuseColors.PrimaryAccent),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Icon(Icons.Default.Mic, contentDescription = null, tint = Color.Black, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Hey Muse AI", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }

                        // Audio Trimmer Studio Launcher
                        IconButton(
                            onClick = { onOpenTrimmerForStem(null) },
                            modifier = Modifier
                                .size(38.dp)
                                .background(MuseColors.SurfaceDark, CircleShape)
                                .border(1.dp, MuseColors.CardBorder, CircleShape)
                        ) {
                            Icon(Icons.Default.ContentCut, contentDescription = "Audio Trimmer", tint = MuseColors.PrimaryAccent, modifier = Modifier.size(18.dp))
                        }

                        // 3D Spatial Audio Radar
                        IconButton(
                            onClick = onOpenSpatialDialog,
                            modifier = Modifier
                                .size(38.dp)
                                .background(MuseColors.SurfaceDark, CircleShape)
                                .border(1.dp, MuseColors.CardBorder, CircleShape)
                        ) {
                            Icon(Icons.Default.SpatialTracking, contentDescription = "Spatial Audio", tint = MuseColors.PrimaryAccent, modifier = Modifier.size(18.dp))
                        }

                        // Lyrics AI Chatbot
                        IconButton(
                            onClick = onOpenLyricsChat,
                            modifier = Modifier
                                .size(38.dp)
                                .background(MuseColors.SurfaceDark, CircleShape)
                                .border(1.dp, MuseColors.CardBorder, CircleShape)
                        ) {
                            Icon(Icons.Default.AutoAwesome, contentDescription = "Lyrics AI", tint = MuseColors.PrimaryAccent, modifier = Modifier.size(18.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Precise Volume Slider & Mute Control
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(
                            onClick = onToggleMute,
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(
                                imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeDown,
                                contentDescription = "Mute",
                                tint = if (isMuted) MuseColors.RosePink else MuseColors.TextSecondary,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Slider(
                            value = volume.toFloat(),
                            onValueChange = { onVolumeChange(it.toInt()) },
                            valueRange = 0f..100f,
                            colors = SliderDefaults.colors(
                                thumbColor = if (isMuted) MuseColors.RosePink else MuseColors.PrimaryAccent,
                                activeTrackColor = if (isMuted) MuseColors.RosePink else MuseColors.PrimaryAccent,
                                inactiveTrackColor = MuseColors.CardBorder
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .padding(horizontal = 6.dp)
                        )

                        Text(
                            text = if (isMuted) "MUTED" else "$volume%",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isMuted) MuseColors.RosePink else MuseColors.PrimaryAccent,
                            modifier = Modifier.width(42.dp)
                        )
                    }
                }
            }
        }
    }
}

