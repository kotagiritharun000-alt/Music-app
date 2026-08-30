package com.example.muse.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Architecture
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.SpatialTracking
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults.SecondaryIndicator
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.muse.ui.theme.MuseColors

@Composable
fun PrdArchitectureSheet(
    onDismiss: () -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Dialog(onDismissRequest = onDismiss) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(MuseColors.SurfaceDark)
                .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(24.dp))
                .padding(18.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
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
                                imageVector = Icons.Default.Architecture,
                                contentDescription = "Architecture",
                                tint = MuseColors.PrimaryAccent,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Muse — PRD & Tech Architecture",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = MuseColors.TextWarmIvory
                            )
                            Text(
                                text = "Senior PM & Mobile Architect Blueprint",
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

                Spacer(modifier = Modifier.height(12.dp))

                // Tabs: 0 -> PRD & User Stories, 1 -> Tech Stack & DSP Architecture, 2 -> Wireframe Blueprint
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = MuseColors.CardSurface,
                    indicator = { tabPositions ->
                        SecondaryIndicator(
                            Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                            color = MuseColors.PrimaryAccent
                        )
                    },
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(12.dp))
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = { Text("PRD & Stories", fontSize = 11.sp, color = if (selectedTab == 0) MuseColors.PrimaryAccent else MuseColors.TextSecondary, fontWeight = FontWeight.Bold) }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = { Text("Tech Architecture", fontSize = 11.sp, color = if (selectedTab == 1) MuseColors.PrimaryAccent else MuseColors.TextSecondary, fontWeight = FontWeight.Bold) }
                    )
                    Tab(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        text = { Text("UI Wireframes", fontSize = 11.sp, color = if (selectedTab == 2) MuseColors.PrimaryAccent else MuseColors.TextSecondary, fontWeight = FontWeight.Bold) }
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(380.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(MuseColors.CardSurface)
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(14.dp))
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (selectedTab == 0) {
                        // PRD & USER STORIES
                        item {
                            PrdSectionTitle("1. Executive Summary & Product Vision", MuseColors.PrimaryAccent)
                            PrdBodyText("Muse is a premium, completely ad-free audio streaming and production utility that unifies object-based spatial audio, deep stem isolation, and a hands-free multimodal voice assistant ('Hey Muse').")
                        }

                        item {
                            PrdSectionTitle("2. Core Features Breakdown", MuseColors.PrimaryAccent)
                            PrdFeatureItem("Core Playback Engine", "Native Dolby Atmos & 3D Spatial Audio HRTF virtualization, 24-bit 96kHz lossless streaming, and gapless queue.")
                            PrdFeatureItem("Hands-Free Voice AI", "'Hey Muse' wake-word detection, volume control (0-100% precision), contextual search & playback, spatial toggles.")
                            PrdFeatureItem("BGM / Multi-Stem Extractor", "4-5 isolated themes surfaced per track with multi-channel solo/mute, 1-tap FLAC stem download, and direct device ringtone assignment.")
                            PrdFeatureItem("Built-in Audio Studio", "Millisecond-accurate visual waveform trimmer with draggable start/end handles, fade curves, and loop preview.")
                            PrdFeatureItem("Lyrics AI Intelligence", "Real-time scrolling synchronized lyrics with verse breakdown, translation, and downloadable study sheets.")
                        }

                        item {
                            PrdSectionTitle("3. User Stories (Gherkin Format)", MuseColors.PrimaryAccent)
                            PrdStoryCard(
                                title = "US-1: Precise Voice Volume Control",
                                story = "As an active listener\nI want to say 'Hey Muse, decrease volume to 30'\nSo that the audio smoothly adjusts to exactly 30% without taking my phone out."
                            )
                            PrdStoryCard(
                                title = "US-2: Stem Extraction & Ringtone Assignment",
                                story = "As a content creator\nI want to extract the lead guitar or bass groove from 'Neon Horizon'\nSo that I can set it directly as my custom contact ringtone with 1 tap."
                            )
                            PrdStoryCard(
                                title = "US-3: Interactive 3D Spatial Soundstage",
                                story = "As an audiophile\nI want to drag the 3D acoustic source on the radar soundstage\nSo that I can customize binaural positioning and room reverberation in real time."
                            )
                        }
                    } else if (selectedTab == 1) {
                        // TECH ARCHITECTURE & PIPELINE
                        item {
                            PrdSectionTitle("1. Recommended Technology Stack", MuseColors.PrimaryAccent)
                            PrdTechCard("Mobile Frontend", "Kotlin 2.2 + Jetpack Compose + Material3 (Declarative, reactive 60fps UI)")
                            PrdTechCard("Audio & DSP Engine", "Oboe / Android AudioTrack C++ Core + Web Audio Binaural HRTF Panning Node + PCM Stereo Synthesizer")
                            PrdTechCard("Voice AI Processing", "On-device Wake-word Engine (Porcupine/TensorFlow Lite) + Google Gemini API Multimodal Speech Pipeline")
                            PrdTechCard("Stem Extraction Model", "Demucs v4 / Spleeter Deep Neural Net (Separates Vocals, Bass, Drums, Melody, Other)")
                            PrdTechCard("Storage & Caching", "Encrypted Offline Storage (AES-256) + Android MediaStore Provider for system ringtone assignment")
                        }

                        item {
                            PrdSectionTitle("2. Audio DSP & Spatial Pipeline Diagram", MuseColors.PrimaryAccent)
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(MuseColors.SurfaceDark)
                                    .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(10.dp))
                                    .padding(10.dp)
                            ) {
                                Text(
                                    text = """
                                        [Raw Hi-Res Audio Stream]
                                                    │
                                        ┌───────────▼───────────┐
                                        │  Demucs Stem Separator │
                                        └───────────┬───────────┘
                                                    │ (5 Isolated Audio Channels)
                                        ┌───────────▼───────────┐
                                        │ Multi-Stem Gain Matrix│ ◄── Solo / Mute Controls
                                        └───────────┬───────────┘
                                                    │
                                        ┌───────────▼───────────┐
                                        │ Binaural HRTF Spatial │ ◄── 3D Azimuth & Head Tracking
                                        └───────────┬───────────┘
                                                    │
                                        ┌───────────▼───────────┐
                                        │  Dolby Atmos EQ Stage │ ◄── Bass Resonance & Clarity
                                        └───────────┬───────────┘
                                                    │
                                        ┌───────────▼───────────┐
                                        │  Hardware DAC Output  │
                                        └───────────────────────┘
                                    """.trimIndent(),
                                    fontSize = 10.sp,
                                    color = MuseColors.PrimaryAccent,
                                    fontFamily = FontFamily.Monospace,
                                    lineHeight = 13.sp
                                )
                            }
                        }

                        item {
                            PrdSectionTitle("3. Hands-Free Voice AI Flow", MuseColors.EmeraldGreen)
                            PrdBodyText("The 'Hey Muse' voice pipeline runs a lightweight continuous keyword spotter in background. Upon trigger, audio frames are routed to the semantic intent parser which extracts volume percentages, track IDs, spatial parameters, or invokes Gemini for lyric notes generation.")
                        }
                    } else {
                        // UI WIREFRAME LAYOUT SPECIFICATION
                        item {
                            PrdSectionTitle("Main Player Screen Layout Architecture", MuseColors.PrimaryAccent)
                            PrdBodyText("The player interface adheres to modern minimalist dark-mode principles, placing critical audio utilities directly within thumb-reach:")

                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(MuseColors.SurfaceDark)
                                    .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(10.dp))
                                    .padding(10.dp)
                            ) {
                                Text(
                                    text = """
                                    ┌───────────────────────────────────┐
                                    │ [Muse Logo]  [Dolby 3D Badge] [PRD]│ ◄── Header & Badges
                                    ├───────────────────────────────────┤
                                    │                                   │
                                    │    [Album Art / 3D Hologram]     │ ◄── Interactive Canvas
                                    │                                   │
                                    ├───────────────────────────────────┤
                                    │ Title & Artist       [Like] [Sync]│
                                    │ [====== Dynamic Scrubber ======]  │
                                    ├───────────────────────────────────┤
                                    │ [Prev]  [ PLAY / PAUSE ]  [Next]  │ ◄── Master Transport
                                    ├───────────────────────────────────┤
                                    │ ── BGM STEM CAROUSEL (4-5 Stems) ──│ ◄── Stem Extractor
                                    │ [Lead Synth] [Bass] [808] [Pad]   │
                                    ├───────────────────────────────────┤
                                    │ [Hey Muse Orb] [Spatial] [Trimmer]│ ◄── Bottom Dock
                                    └───────────────────────────────────┘
                                    """.trimIndent(),
                                    fontSize = 10.sp,
                                    color = MuseColors.PrimaryAccent,
                                    fontFamily = FontFamily.Monospace,
                                    lineHeight = 13.sp
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PrdSectionTitle(title: String, color: Color) {
    Text(
        text = title,
        fontSize = 13.sp,
        fontWeight = FontWeight.Bold,
        color = color,
        modifier = Modifier.padding(vertical = 4.dp)
    )
}

@Composable
private fun PrdBodyText(text: String) {
    Text(
        text = text,
        fontSize = 11.sp,
        color = MuseColors.TextPrimary,
        lineHeight = 15.sp
    )
}

@Composable
private fun PrdFeatureItem(name: String, desc: String) {
    Row(modifier = Modifier.padding(vertical = 3.dp), verticalAlignment = Alignment.Top) {
        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MuseColors.PrimaryAccent, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(6.dp))
        Column {
            Text(name, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MuseColors.TextPrimary)
            Text(desc, fontSize = 10.sp, color = MuseColors.TextSecondary, lineHeight = 13.sp)
        }
    }
}

@Composable
private fun PrdStoryCard(title: String, story: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(MuseColors.SurfaceDark)
            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(8.dp))
            .padding(8.dp)
    ) {
        Text(title, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MuseColors.PrimaryAccent)
        Spacer(modifier = Modifier.height(2.dp))
        Text(story, fontSize = 10.sp, color = MuseColors.TextSecondary, lineHeight = 14.sp)
    }
}

@Composable
private fun PrdTechCard(layer: String, details: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(MuseColors.SurfaceDark)
            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(8.dp))
            .padding(8.dp)
    ) {
        Text(layer, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MuseColors.PrimaryAccent)
        Spacer(modifier = Modifier.height(2.dp))
        Text(details, fontSize = 10.sp, color = MuseColors.TextSecondary, lineHeight = 13.sp)
    }
}
