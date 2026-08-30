package com.example.muse.model

data class Song(
    val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val durationMs: Long,
    val bpm: Int,
    val key: String,
    val genre: String,
    val gradientStart: Long,
    val gradientEnd: Long,
    val isDolbyAtmos: Boolean = true,
    val isHiResLossless: Boolean = true,
    val bitDepth: Int = 24,
    val sampleRateKhz: Int = 96,
    val stems: List<BgmStem>,
    val lyrics: List<LyricLine>,
    val description: String = ""
)

data class BgmStem(
    val id: String,
    val name: String,
    val category: StemCategory,
    val durationMs: Long,
    val startOffsetMs: Long = 0L,
    val waveformPoints: List<Float>,
    val isRingtoneRecommended: Boolean = true,
    val description: String = ""
)

enum class StemCategory {
    MAIN_MELODY,
    BASSLINE_GROOVE,
    DRUMS_PERCUSSION,
    AMBIENT_PAD,
    CLIMAX_SOLO
}

data class LyricLine(
    val timestampMs: Long,
    val text: String,
    val translation: String = "",
    val aiNote: String = ""
)

data class AudioSpatialConfig(
    val isSpatialEnabled: Boolean = true,
    val isDolbyAtmosEnabled: Boolean = true,
    val roomPreset: RoomPreset = RoomPreset.ATMOS_360,
    val bassBoost: Float = 0.65f, // 0.0 to 1.0
    val vocalClarity: Float = 0.80f, // 0.0 to 1.0
    val azimuthAngleDegrees: Float = 0f, // -180 to +180
    val distanceMeters: Float = 1.2f,
    val isHeadTrackingActive: Boolean = true
)

enum class RoomPreset(val label: String, val description: String) {
    STUDIO("Studio Reference", "Ultra-clean acoustic isolation with zero room coloration"),
    ATMOS_360("Dolby Atmos 360", "Immersive object-based soundfield with heightened verticality"),
    CONCERT_HALL("Concert Hall", "Expansive reverberation and deep spatial envelope"),
    BINAURAL_3D("Binaural 3D Headphone", "HRTF filtered spatialized binaural field")
}

data class VoiceAssistantState(
    val isListening: Boolean = false,
    val isAlwaysListeningEnabled: Boolean = false,
    val recognizedText: String = "",
    val assistantFeedback: String = "Listening for 'Hey Muse' or your command...",
    val lastAction: String? = null,
    val confidence: Float = 0.95f
)

data class TrimConfig(
    val startMs: Long = 0L,
    val endMs: Long = 30000L,
    val isFadeIn: Boolean = true,
    val isFadeOut: Boolean = true,
    val targetType: ToneExportType = ToneExportType.RINGTONE,
    val customTitle: String = "Muse_Custom_Tone"
)

enum class ToneExportType(val label: String, val defaultDurationMs: Long) {
    RINGTONE("Phone Ringtone", 30000L),
    NOTIFICATION("Notification Chime", 5000L),
    ALARM("Wake-up Alarm", 45000L),
    AUDIO_CLIP("HQ Audio Stem Export", 60000L)
}

data class PlaylistItem(
    val id: String,
    val name: String,
    val subtitle: String,
    val songIds: List<String>,
    val gradientColor: Long
)

data class DownloadedAsset(
    val id: String,
    val title: String,
    val sourceTrack: String,
    val type: String,
    val fileSizeMb: Float,
    val dateDownloaded: String = "Today"
)
