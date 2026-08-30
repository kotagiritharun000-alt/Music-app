package com.example.muse.ai

import com.example.muse.model.LyricLine
import com.example.muse.model.Song
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class ChatMessage(
    val id: String,
    val sender: MessageSender,
    val text: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isNotesCard: Boolean = false,
    val notesSummary: String? = null
)

enum class MessageSender {
    USER,
    MUSE_AI
}

class LyricsAiChatbot {
    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _isGenerating = MutableStateFlow(false)
    val isGenerating: StateFlow<Boolean> = _isGenerating.asStateFlow()

    fun initializeForSong(song: Song) {
        val initialIntro = """
            ✨ Welcome to Muse Lyrics Intelligence for **"${song.title}"** by ${song.artist}.
            
            I can break down the hidden metaphors, explain the lyrical meaning verse-by-verse, analyze the vocal harmony techniques, or compile a complete **Downloadable Lyric Notes Sheet**.
            
            What would you like to explore?
        """.trimIndent()

        _messages.value = listOf(
            ChatMessage(
                id = "init_${song.id}",
                sender = MessageSender.MUSE_AI,
                text = initialIntro
            )
        )
    }

    fun sendMessage(query: String, currentSong: Song, currentLyric: LyricLine?) {
        val userMsg = ChatMessage(
            id = "user_${System.currentTimeMillis()}",
            sender = MessageSender.USER,
            text = query
        )
        _messages.value = _messages.value + userMsg
        _isGenerating.value = true

        val q = query.lowercase()
        val reply = when {
            q.contains("note") || q.contains("download") || q.contains("sheet") || q.contains("summary") -> {
                generateLyricsNotesSheet(currentSong)
            }
            q.contains("meaning") || q.contains("theme") || q.contains("story") -> {
                generateSongMeaning(currentSong)
            }
            q.contains("metaphor") || q.contains("verse") || q.contains("line") -> {
                generateMetaphorBreakdown(currentSong, currentLyric)
            }
            q.contains("chord") || q.contains("harmony") || q.contains("bpm") || q.contains("key") -> {
                generateMusicTheoryBreakdown(currentSong)
            }
            else -> {
                """
                    💡 **Analysis for "${currentSong.title}":**
                    
                    Regarding "$query": The song employs a rich blend of ${currentSong.genre} textures with evocative lyrical imagery. Notice how the rhythmic cadence in ${currentSong.key} at ${currentSong.bpm} BPM reinforces the emotional tension between acoustic vulnerability and spatial depth.
                    
                    You can tap **"Download Lyric Notes"** to export the comprehensive annotated analysis!
                """.trimIndent()
            }
        }

        val aiMsg = ChatMessage(
            id = "ai_${System.currentTimeMillis()}",
            sender = MessageSender.MUSE_AI,
            text = reply,
            isNotesCard = q.contains("note") || q.contains("download") || q.contains("sheet")
        )

        _messages.value = _messages.value + aiMsg
        _isGenerating.value = false
    }

    private fun generateSongMeaning(song: Song): String {
        return """
            📜 **Theme & Narrative Meaning for "${song.title}":**
            
            **Core Concept:**
            The narrative delves into the dichotomy between digital detachment and intimate emotional resonance.
            
            **Lyrical Highlights:**
            - **Verse Progression:** Begins in quiet observation before exploding into atmospheric spatial harmonies during the chorus.
            - **Emotional Arc:** The transition from wandering alone to rediscovering a grounding heartbeat.
            - **Vocal Production:** Recorded with binaural proximity effect, placing the lead vocal directly in front of the listener's headstage.
        """.trimIndent()
    }

    private fun generateMetaphorBreakdown(song: Song, activeLyric: LyricLine?): String {
        val focusLine = activeLyric?.text ?: song.lyrics.firstOrNull()?.text ?: "Echoes in the electric midnight sky"
        return """
            🔍 **Metaphor & Verse Breakdown:**
            
            **Focal Line:** *"$focusLine"*
            
            - **Poetic Device:** Synesthesia & Contrast (Audio-Visual mapping).
            - **Subtext:** The soundscape uses high-frequency synthesizers to emulate electrical signals that mirror emotional longing.
            - **Spatial Dimension:** Notice how this specific verse is panned with wider stereo expansion in Dolby Atmos to signify mental expanse.
        """.trimIndent()
    }

    private fun generateMusicTheoryBreakdown(song: Song): String {
        return """
            🎵 **Music Theory & Spatial Sound Profile:**
            
            - **Key Signature:** ${song.key} (Elicits introspective yet determined emotional tone)
            - **Tempo:** ${song.bpm} BPM (Ideal for synchronized heart-rate entrainment)
            - **Audio Precision:** Lossless Master (${song.bitDepth}-bit / ${song.sampleRateKhz}kHz)
            - **Dolby Atmos Objects:** 12 independent spatialized audio objects across the 3D dome.
        """.trimIndent()
    }

    fun generateLyricsNotesSheet(song: Song): String {
        val lyricsText = song.lyrics.joinToString("\n") { "[${it.timestampMs / 1000}s] ${it.text} (${it.translation})" }
        return """
            📄 **MUSE AI — COMPREHENSIVE LYRICS & MUSICAL STUDY SHEET**
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            **Track:** ${song.title}
            **Artist:** ${song.artist}
            **Album:** ${song.album}
            **Master Format:** ${if (song.isDolbyAtmos) "Dolby Atmos Spatial Audio" else "Stereo"} (${song.bitDepth}b/${song.sampleRateKhz}kHz)
            **Tempo / Key:** ${song.bpm} BPM | ${song.key}
            
            **Annotated Lyrics & Timestamps:**
            $lyricsText
            
            **Key Thematic Annotations:**
            1. **Primary Motif:** Harmonic synthesis of acoustic warmth and digital horizons.
            2. **BGM Stems Available:** ${song.stems.joinToString(", ") { it.name }}
            3. **Acoustic Signature:** Engineered for ultra-low latency headphone spatialization and millisecond-accurate ringtone extraction.
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            *Status: Formatted & Ready for One-Tap Export.*
        """.trimIndent()
    }
}
