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
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.VolumeDown
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.muse.model.VoiceAssistantState
import com.example.muse.ui.theme.MuseColors

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun VoiceAssistantOverlay(
    state: VoiceAssistantState,
    currentVolume: Int,
    isMuted: Boolean,
    isPermissionGranted: Boolean = true,
    onRequestPermission: () -> Unit = {},
    onStartListening: () -> Unit,
    onStopListening: () -> Unit,
    onExecuteCommand: (String) -> Unit,
    onDismiss: () -> Unit
) {
    var textInput by remember { mutableStateOf("") }
    val scrollState = rememberScrollState()

    val infiniteTransition = rememberInfiniteTransition(label = "OrbPulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.25f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "OrbScale"
    )

    Dialog(onDismissRequest = onDismiss) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(26.dp))
                .background(MuseColors.SurfaceDark)
                .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(26.dp))
                .padding(20.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(scrollState),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        MuseLogo(size = 28.dp, showWordmark = false)
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "Hey Muse — Voice AI",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = MuseColors.TextWarmIvory
                            )
                            Text(
                                text = "Multimodal Real-Time Assistant",
                                fontSize = 10.sp,
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

                // Permission Status Chip
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            if (isPermissionGranted) MuseColors.CardSurface
                            else MuseColors.RosePink.copy(alpha = 0.15f)
                        )
                        .border(
                            1.dp,
                            if (isPermissionGranted) MuseColors.CardBorder
                            else MuseColors.RosePink.copy(alpha = 0.4f),
                            RoundedCornerShape(12.dp)
                        )
                        .clickable(enabled = !isPermissionGranted) { onRequestPermission() }
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (isPermissionGranted) Icons.Default.Mic else Icons.Default.MicOff,
                        contentDescription = "Permission Status",
                        tint = if (isPermissionGranted) MuseColors.PrimaryAccent else MuseColors.RosePink,
                        modifier = Modifier.size(13.dp)
                    )
                    Spacer(modifier = Modifier.width(5.dp))
                    Text(
                        text = if (isPermissionGranted) "Microphone Ready" else "Tap to Grant Mic Permission",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (isPermissionGranted) MuseColors.TextSecondary else MuseColors.RosePink
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Animated Holographic Voice AI Orb
                Box(
                    modifier = Modifier
                        .size(130.dp)
                        .clip(CircleShape)
                        .clickable {
                            if (!isPermissionGranted) {
                                onRequestPermission()
                            } else {
                                if (state.isListening) onStopListening() else onStartListening()
                            }
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Canvas(modifier = Modifier.size(120.dp)) {
                        val center = Offset(size.width / 2f, size.height / 2f)
                        val baseRadius = size.width / 2f * 0.75f
                        val animRadius = baseRadius * if (state.isListening) pulseScale else 1.0f

                        // Outer glowing aura rings
                        drawCircle(
                            brush = Brush.radialGradient(
                                colors = listOf(
                                    MuseColors.PrimaryAccent.copy(alpha = if (state.isListening) 0.55f else 0.25f),
                                    MuseColors.SecondaryAccent.copy(alpha = if (state.isListening) 0.35f else 0.12f),
                                    Color.Transparent
                                )
                            ),
                            radius = animRadius,
                            center = center
                        )

                        // Inner core orb
                        drawCircle(
                            brush = Brush.radialGradient(
                                colors = listOf(
                                    MuseColors.PrimaryAccent,
                                    MuseColors.SecondaryAccent
                                )
                            ),
                            radius = baseRadius * 0.6f,
                            center = center
                        )

                        // Orbit ring
                        drawCircle(
                            color = MuseColors.PrimaryAccent.copy(alpha = 0.6f),
                            radius = animRadius * 0.9f,
                            center = center,
                            style = Stroke(width = 1.5.dp.toPx())
                        )
                    }

                    Icon(
                        imageVector = if (state.isListening) Icons.Default.GraphicEq else if (isPermissionGranted) Icons.Default.Mic else Icons.Default.MicOff,
                        contentDescription = "Microphone",
                        tint = Color.White,
                        modifier = Modifier.size(34.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Listening Status / Wake Word prompt
                Text(
                    text = when {
                        !isPermissionGranted -> "⚠️ Mic Permission Needed for 'Hey Muse'"
                        state.isListening -> "🎙️ Listening... Say 'Hey Muse' or a command"
                        else -> "Tap Orb to Speak or Say 'Hey Muse'"
                    },
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = when {
                        !isPermissionGranted -> MuseColors.RosePink
                        state.isListening -> MuseColors.PrimaryAccent
                        else -> MuseColors.TextSecondary
                    }
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Live Assistant Feedback Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(MuseColors.CardSurface)
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(14.dp))
                        .padding(14.dp)
                ) {
                    Column {
                        if (state.recognizedText.isNotBlank()) {
                            Text(
                                text = "\"${state.recognizedText}\"",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = MuseColors.PrimaryAccent
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                        }
                        Text(
                            text = state.assistantFeedback,
                            fontSize = 12.sp,
                            color = MuseColors.TextPrimary,
                            lineHeight = 16.sp
                        )

                        // Live Volume Status Bar
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(MuseColors.SurfaceDark)
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                                    contentDescription = "Volume",
                                    tint = if (isMuted) MuseColors.RosePink else MuseColors.PrimaryAccent,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (isMuted) "Audio Muted" else "Volume Level",
                                    fontSize = 11.sp,
                                    color = MuseColors.TextSecondary
                                )
                            }
                            Text(
                                text = "$currentVolume%",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                color = if (isMuted) MuseColors.RosePink else MuseColors.PrimaryAccent
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Instant Voice Command Shortcut Chips
                Text(
                    text = "Quick Voice Command Test Chips:",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MuseColors.TextSecondary,
                    modifier = Modifier.align(Alignment.Start)
                )
                Spacer(modifier = Modifier.height(6.dp))

                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    val commands = listOf(
                        "Volume 30",
                        "Volume 85",
                        "Volume 100",
                        "Mute",
                        "Unmute",
                        "Next Song",
                        "Previous Song",
                        "Play Neon Horizon",
                        "Play Midnight Reverie",
                        "Turn on Spatial Audio",
                        "Extract BGMs",
                        "Trim this song"
                    )

                    commands.forEach { cmd ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(MuseColors.CardSurface)
                                .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(8.dp))
                                .clickable { onExecuteCommand(cmd) }
                                .padding(horizontal = 8.dp, vertical = 5.dp)
                        ) {
                            Text(
                                text = cmd,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Medium,
                                color = MuseColors.PrimaryAccent
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Direct Text Command Input (for quiet environments)
                OutlinedTextField(
                    value = textInput,
                    onValueChange = { textInput = it },
                    placeholder = { Text("Type voice command (e.g. 'Volume 65')...", fontSize = 11.sp) },
                    singleLine = true,
                    trailingIcon = {
                        IconButton(
                            onClick = {
                                if (textInput.isNotBlank()) {
                                    onExecuteCommand(textInput)
                                    textInput = ""
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = "Send",
                                tint = MuseColors.PrimaryAccent
                            )
                        }
                    },
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                    keyboardActions = KeyboardActions(
                        onSend = {
                            if (textInput.isNotBlank()) {
                                onExecuteCommand(textInput)
                                textInput = ""
                            }
                        }
                    ),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MuseColors.PrimaryAccent,
                        unfocusedBorderColor = MuseColors.CardBorder,
                        focusedTextColor = MuseColors.TextPrimary,
                        unfocusedTextColor = MuseColors.TextPrimary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
