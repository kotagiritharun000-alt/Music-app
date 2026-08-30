package com.example.muse.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults.SecondaryIndicator
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.muse.ai.ChatMessage
import com.example.muse.ai.MessageSender
import com.example.muse.model.LyricLine
import com.example.muse.model.Song
import com.example.muse.ui.theme.MuseColors

@Composable
fun LyricsChatbotSheet(
    song: Song,
    currentPositionMs: Long,
    messages: List<ChatMessage>,
    onSeekToTimestamp: (Long) -> Unit,
    onSendMessage: (String) -> Unit,
    onDownloadNotes: (String) -> Unit,
    onDismiss: () -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var chatInput by remember { mutableStateOf("") }
    var copiedToast by remember { mutableStateOf(false) }

    val context = LocalContext.current
    val lyricsListState = rememberLazyListState()

    // Find active lyric line index
    val activeIndex = song.lyrics.indexOfLast { it.timestampMs <= currentPositionMs }.coerceAtLeast(0)

    LaunchedEffect(activeIndex) {
        if (selectedTab == 0 && song.lyrics.isNotEmpty()) {
            lyricsListState.animateScrollToItem(activeIndex.coerceIn(0, song.lyrics.size - 1))
        }
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
                                imageVector = Icons.Default.MenuBook,
                                contentDescription = "Lyrics Intelligence",
                                tint = MuseColors.PrimaryAccent,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Lyrics & AI Intelligence",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = MuseColors.TextWarmIvory
                            )
                            Text(
                                text = song.title,
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

                // Navigation Tabs: 0 -> Synced Live Lyrics, 1 -> AI Chatbot & Notes
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
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.MusicNote, contentDescription = null, tint = if (selectedTab == 0) MuseColors.PrimaryAccent else MuseColors.TextSecondary, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Synced Lyrics", fontSize = 12.sp, color = if (selectedTab == 0) MuseColors.PrimaryAccent else MuseColors.TextSecondary, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = if (selectedTab == 1) MuseColors.PrimaryAccent else MuseColors.TextSecondary, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("AI Chatbot & Notes", fontSize = 12.sp, color = if (selectedTab == 1) MuseColors.PrimaryAccent else MuseColors.TextSecondary, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                if (selectedTab == 0) {
                    // TAB 0: SYNCED LIVE LYRICS
                    LazyColumn(
                        state = lyricsListState,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(340.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(MuseColors.CardSurface)
                            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(14.dp))
                            .padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(song.lyrics.size) { idx ->
                            val line = song.lyrics[idx]
                            val isActive = idx == activeIndex

                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isActive) MuseColors.CardHighlight else Color.Transparent)
                                    .border(
                                        1.dp,
                                        if (isActive) MuseColors.PrimaryAccent else Color.Transparent,
                                        RoundedCornerShape(10.dp)
                                    )
                                    .clickable { onSeekToTimestamp(line.timestampMs) }
                                    .padding(10.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = line.text,
                                        fontSize = if (isActive) 15.sp else 13.sp,
                                        fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
                                        color = if (isActive) MuseColors.PrimaryAccent else MuseColors.TextSecondary,
                                        modifier = Modifier.weight(1f)
                                    )
                                    Text(
                                        text = "${line.timestampMs / 1000}s",
                                        fontSize = 10.sp,
                                        color = MuseColors.TextMuted
                                    )
                                }

                                if (line.translation.isNotBlank()) {
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = line.translation,
                                        fontSize = 11.sp,
                                        color = MuseColors.TextMuted
                                    )
                                }

                                if (isActive && line.aiNote.isNotBlank()) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(MuseColors.SurfaceDark, RoundedCornerShape(6.dp))
                                            .padding(6.dp)
                                    ) {
                                        Text(
                                            text = "💡 AI Insight: ${line.aiNote}",
                                            fontSize = 10.sp,
                                            color = MuseColors.PrimaryAccent
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = {
                            selectedTab = 1
                            onSendMessage("Generate a complete lyrics notes study sheet for this song")
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MuseColors.PrimaryAccent),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Download, contentDescription = null, tint = Color.Black, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Generate & Download Lyric Notes", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }

                } else {
                    // TAB 1: AI CHATBOT & DOWNLOAD NOTES
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(280.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(MuseColors.CardSurface)
                            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(14.dp))
                            .padding(10.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(messages) { msg ->
                            val isAi = msg.sender == MessageSender.MUSE_AI
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = if (isAi) Arrangement.Start else Arrangement.End
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth(0.92f)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(if (isAi) MuseColors.CardHighlight else MuseColors.SecondaryAccent.copy(alpha = 0.35f))
                                        .border(
                                            1.dp,
                                            if (isAi) MuseColors.PrimaryAccent.copy(alpha = 0.3f) else MuseColors.PrimaryAccent,
                                            RoundedCornerShape(12.dp)
                                        )
                                        .padding(10.dp)
                                 ) {
                                    Column {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(
                                                text = if (isAi) "Muse AI Assistant" else "You",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (isAi) MuseColors.PrimaryAccent else MuseColors.TextPrimary
                                            )

                                            if (isAi) {
                                                IconButton(
                                                    onClick = {
                                                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                                        clipboard.setPrimaryClip(ClipData.newPlainText("Muse Lyrics Notes", msg.text))
                                                        copiedToast = true
                                                    },
                                                    modifier = Modifier.size(20.dp)
                                                ) {
                                                    Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = MuseColors.TextSecondary, modifier = Modifier.size(14.dp))
                                                }
                                            }
                                        }

                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = msg.text,
                                            fontSize = 11.sp,
                                            color = MuseColors.TextPrimary,
                                            lineHeight = 15.sp
                                        )

                                        if (msg.isNotesCard) {
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Button(
                                                onClick = {
                                                    onDownloadNotes(msg.text)
                                                },
                                                colors = ButtonDefaults.buttonColors(containerColor = MuseColors.PrimaryAccent),
                                                shape = RoundedCornerShape(8.dp),
                                                modifier = Modifier.fillMaxWidth()
                                            ) {
                                                Icon(Icons.Default.Download, contentDescription = null, tint = Color.Black, modifier = Modifier.size(14.dp))
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text("Download Notes to Storage Vault", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Quick Prompt Suggestions
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        listOf("Explain theme", "Verse breakdown", "Download Sheet").forEach { prompt ->
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(MuseColors.CardSurface)
                                    .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(8.dp))
                                    .clickable { onSendMessage(prompt) }
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(prompt, fontSize = 9.sp, color = MuseColors.PrimaryAccent, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Message input field
                    OutlinedTextField(
                        value = chatInput,
                        onValueChange = { chatInput = it },
                        placeholder = { Text("Ask about lyrics, theme, or chords...", fontSize = 11.sp) },
                        singleLine = true,
                        trailingIcon = {
                            IconButton(
                                onClick = {
                                    if (chatInput.isNotBlank()) {
                                        onSendMessage(chatInput)
                                        chatInput = ""
                                    }
                                }
                            ) {
                                Icon(Icons.Default.Send, contentDescription = "Send", tint = MuseColors.PrimaryAccent)
                            }
                        },
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                        keyboardActions = KeyboardActions(
                            onSend = {
                                if (chatInput.isNotBlank()) {
                                    onSendMessage(chatInput)
                                    chatInput = ""
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
}
