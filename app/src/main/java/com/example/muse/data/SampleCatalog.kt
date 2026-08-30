package com.example.muse.data

import com.example.muse.model.BgmStem
import com.example.muse.model.LyricLine
import com.example.muse.model.PlaylistItem
import com.example.muse.model.Song
import com.example.muse.model.StemCategory

object SampleCatalog {

    fun generateWaveform(seed: Int, size: Int = 40): List<Float> {
        val list = mutableListOf<Float>()
        for (i in 0 until size) {
            val v = 0.2f + 0.75f * kotlin.math.abs(kotlin.math.sin(i * 0.35 + seed * 0.7).toFloat() * kotlin.math.cos(i * 0.15 + seed).toFloat())
            list.add(v.coerceIn(0.15f, 1.0f))
        }
        return list
    }

    val songs: List<Song> = listOf(
        Song(
            id = "muse_track_1",
            title = "Neon Horizon",
            artist = "Aethelgard & Lofi Pulse",
            album = "Cyber Solitude 2099",
            durationMs = 214000L, // 3m 34s
            bpm = 118,
            key = "F# Minor",
            genre = "Cyberwave / Synthwave",
            gradientStart = 0xFF7928CA,
            gradientEnd = 0xFF00DFD8,
            isDolbyAtmos = true,
            isHiResLossless = true,
            bitDepth = 24,
            sampleRateKhz = 96,
            description = "Hypnotic analog synthesizer arpeggios drifting over cinematic sub-bass and crisp 808 percussion.",
            stems = listOf(
                BgmStem(
                    id = "stem_1_melody",
                    name = "Main Lead Synth Theme",
                    category = StemCategory.MAIN_MELODY,
                    durationMs = 38000L,
                    startOffsetMs = 0L,
                    waveformPoints = generateWaveform(101),
                    isRingtoneRecommended = true,
                    description = "Signature polyphonic Juno-106 hook melody with lush tape chorus."
                ),
                BgmStem(
                    id = "stem_1_bass",
                    name = "Analog Sub-Bass Groove",
                    category = StemCategory.BASSLINE_GROOVE,
                    durationMs = 32000L,
                    startOffsetMs = 12000L,
                    waveformPoints = generateWaveform(102),
                    isRingtoneRecommended = true,
                    description = "Punchy Moog Minitaur bassline tuned for deep subwoofer resonance."
                ),
                BgmStem(
                    id = "stem_1_drums",
                    name = "808 Cyber Beat & Percussion",
                    category = StemCategory.DRUMS_PERCUSSION,
                    durationMs = 28000L,
                    startOffsetMs = 24000L,
                    waveformPoints = generateWaveform(103),
                    isRingtoneRecommended = false,
                    description = "Gated reverb snare and transient-shaped kick drum cadence."
                ),
                BgmStem(
                    id = "stem_1_ambient",
                    name = "Celestial Atmos Pad",
                    category = StemCategory.AMBIENT_PAD,
                    durationMs = 45000L,
                    startOffsetMs = 0L,
                    waveformPoints = generateWaveform(104),
                    isRingtoneRecommended = true,
                    description = "Binaural spatial atmospheric textures with modulated pitch drift."
                ),
                BgmStem(
                    id = "stem_1_solo",
                    name = "Climax Laser Arp Solo",
                    category = StemCategory.CLIMAX_SOLO,
                    durationMs = 35000L,
                    startOffsetMs = 120000L,
                    waveformPoints = generateWaveform(105),
                    isRingtoneRecommended = true,
                    description = "Dynamic high-octave arpeggiated crescendo designed for peak energy."
                )
            ),
            lyrics = listOf(
                LyricLine(4000L, "Drifting through the neon rain...", "Gliding past the rainy city lights", "Metaphor for modern isolation amidst technological brilliance"),
                LyricLine(12000L, "Signals fading out across the bay", "Radio waves vanishing over the water", "Foreshadows departure and acoustic release"),
                LyricLine(24000L, "Hold the frequency, don't let it slip away", "Keep our connection strong and alive", "Theme of acoustic resonance"),
                LyricLine(38000L, "Echoes in the electric midnight sky", "Reflections dancing on the skyline", "Key vocal hook leading into the main synth theme"),
                LyricLine(52000L, "We find our rhythm where the shadows fly", "Finding peace in the hidden corners", "Transition into the harmonic chorus"),
                LyricLine(70000L, "Every heartbeat calibrated true", "Pure synchronized cadence", "Musical precision reference"),
                LyricLine(95000L, "Lost in neon, running back to you...", "Returning home through the digital labyrinth", "Climax emotional payoff")
            )
        ),
        Song(
            id = "muse_track_2",
            title = "Midnight Reverie",
            artist = "Seraphina Vance & The Velvet Trio",
            album = "Midnight Acoustic Suite",
            durationMs = 186000L, // 3m 06s
            bpm = 84,
            key = "D Major",
            genre = "Neo-Soul / Ambient Lofi",
            gradientStart = 0xFFFF416C,
            gradientEnd = 0xFFFF4B2B,
            isDolbyAtmos = true,
            isHiResLossless = true,
            bitDepth = 24,
            sampleRateKhz = 96,
            description = "Velvet Rhodes electric piano chords complemented by fingerpicked nylon acoustic guitar and warm vinyl warmth.",
            stems = listOf(
                BgmStem(
                    id = "stem_2_melody",
                    name = "Acoustic Nylon Guitar Solo",
                    category = StemCategory.MAIN_MELODY,
                    durationMs = 34000L,
                    startOffsetMs = 14000L,
                    waveformPoints = generateWaveform(201),
                    isRingtoneRecommended = true,
                    description = "Intimate Spanish flamenco-inspired acoustic guitar solo."
                ),
                BgmStem(
                    id = "stem_2_rhodes",
                    name = "Vintage Rhodes Chords",
                    category = StemCategory.AMBIENT_PAD,
                    durationMs = 42000L,
                    startOffsetMs = 0L,
                    waveformPoints = generateWaveform(202),
                    isRingtoneRecommended = true,
                    description = "Warm 1973 Suitcase Rhodes through tube tremolo emulation."
                ),
                BgmStem(
                    id = "stem_2_upright",
                    name = "Acoustic Upright Bass Walk",
                    category = StemCategory.BASSLINE_GROOVE,
                    durationMs = 30000L,
                    startOffsetMs = 8000L,
                    waveformPoints = generateWaveform(203),
                    isRingtoneRecommended = true,
                    description = "Deep wooden acoustic bass resonance recorded with dual ribbon mics."
                ),
                BgmStem(
                    id = "stem_2_brush",
                    name = "Lofi Brush Snare & Shaker",
                    category = StemCategory.DRUMS_PERCUSSION,
                    durationMs = 26000L,
                    startOffsetMs = 16000L,
                    waveformPoints = generateWaveform(204),
                    isRingtoneRecommended = false,
                    description = "Gentle jazz brush sweep with organic sidechain compression."
                ),
                BgmStem(
                    id = "stem_2_strings",
                    name = "Cello & Viola String Bed",
                    category = StemCategory.CLIMAX_SOLO,
                    durationMs = 36000L,
                    startOffsetMs = 90000L,
                    waveformPoints = generateWaveform(205),
                    isRingtoneRecommended = true,
                    description = "Rich chamber string harmonies configured for 3D Dolby expansion."
                )
            ),
            lyrics = listOf(
                LyricLine(3000L, "Coffee cools beside the open pane", "Morning calm before the world awakens", "Setting an intimate, sensory mood"),
                LyricLine(14000L, "Whispers lingering from yesterday's rain", "Memories washed soft by the storm", "Poetic imagery"),
                LyricLine(28000L, "Play the chords that ease the quiet strain", "Harmonies that soothe the spirit", "Music therapy motif"),
                LyricLine(45000L, "Let the midnight reverie begin again...", "Welcoming the serene nightfall", "Main thematic refrain")
            )
        ),
        Song(
            id = "muse_track_3",
            title = "Echoes of Elysium",
            artist = "Orchestral Apex & Hans K.",
            album = "Symphonic Dimensions",
            durationMs = 248000L, // 4m 08s
            bpm = 132,
            key = "A Minor",
            genre = "Cinematic / Spatial Orchestral",
            gradientStart = 0xFF4A00E0,
            gradientEnd = 0xFF8E2DE2,
            isDolbyAtmos = true,
            isHiResLossless = true,
            bitDepth = 24,
            sampleRateKhz = 192,
            description = "Epic cinematic orchestral composition featuring soaring French horns, taiko drums, and ethereal choir.",
            stems = listOf(
                BgmStem(
                    id = "stem_3_brass",
                    name = "French Horn & Trumpet Fanfare",
                    category = StemCategory.MAIN_MELODY,
                    durationMs = 32000L,
                    startOffsetMs = 20000L,
                    waveformPoints = generateWaveform(301),
                    isRingtoneRecommended = true,
                    description = "Regal brass melody recorded in an 800-seat acoustic hall."
                ),
                BgmStem(
                    id = "stem_3_taiko",
                    name = "Cinematic Taiko & Timpani",
                    category = StemCategory.DRUMS_PERCUSSION,
                    durationMs = 28000L,
                    startOffsetMs = 15000L,
                    waveformPoints = generateWaveform(302),
                    isRingtoneRecommended = true,
                    description = "Thunderous low-end impact percussion for heroic ringtone alarms."
                ),
                BgmStem(
                    id = "stem_3_choir",
                    name = "Elysian Choir Soprano",
                    category = StemCategory.AMBIENT_PAD,
                    durationMs = 40000L,
                    startOffsetMs = 0L,
                    waveformPoints = generateWaveform(303),
                    isRingtoneRecommended = true,
                    description = "Multi-voice vocal arrangement spanning 4 octaves."
                ),
                BgmStem(
                    id = "stem_3_strings",
                    name = "Spiccato Violins & Cellos",
                    category = StemCategory.BASSLINE_GROOVE,
                    durationMs = 34000L,
                    startOffsetMs = 10000L,
                    waveformPoints = generateWaveform(304),
                    isRingtoneRecommended = true,
                    description = "Fast rhythmic string ostinato driving forward momentum."
                ),
                BgmStem(
                    id = "stem_3_climax",
                    name = "Grand Orchestral Tutti Climax",
                    category = StemCategory.CLIMAX_SOLO,
                    durationMs = 45000L,
                    startOffsetMs = 140000L,
                    waveformPoints = generateWaveform(305),
                    isRingtoneRecommended = true,
                    description = "Full 90-piece orchestra fortissimo peak with spatial surround."
                )
            ),
            lyrics = listOf(
                LyricLine(5000L, "[Instrumental Prelude: Strings rising in 3D surround]", "Orchestral build", "Dolby Atmos height channel test"),
                LyricLine(22000L, "Ascend beyond the golden gates of stone", "Rising above earthly limits", "Mythological theme"),
                LyricLine(42000L, "Where every forgotten melody is known", "All lost songs find their home", "Ode to musical eternity"),
                LyricLine(65000L, "Echoes of Elysium forever chime!", "The timeless song rings out", "Grand chorus entry")
            )
        ),
        Song(
            id = "muse_track_4",
            title = "Celestial Drift",
            artist = "Kira Nova & Stellaris",
            album = "Deep Orbital Horizons",
            durationMs = 195000L,
            bpm = 124,
            key = "C Minor",
            genre = "Deep Melodic House",
            gradientStart = 0xFF00C9FF,
            gradientEnd = 0xFF92FE9D,
            isDolbyAtmos = true,
            isHiResLossless = true,
            bitDepth = 24,
            sampleRateKhz = 96,
            description = "Ethereal female vocal chops layered with hypnotic bass synth and crystalline spatial arpeggios.",
            stems = listOf(
                BgmStem(
                    id = "stem_4_vocal_chop",
                    name = "Ethereal Vocal Chops Theme",
                    category = StemCategory.MAIN_MELODY,
                    durationMs = 30000L,
                    startOffsetMs = 16000L,
                    waveformPoints = generateWaveform(401),
                    isRingtoneRecommended = true,
                    description = "Granular-resynthesized pitch-shifted vocal hook."
                ),
                BgmStem(
                    id = "stem_4_club_bass",
                    name = "Deep House Pluck Bass",
                    category = StemCategory.BASSLINE_GROOVE,
                    durationMs = 32000L,
                    startOffsetMs = 8000L,
                    waveformPoints = generateWaveform(402),
                    isRingtoneRecommended = true,
                    description = "FM-synthesized round bassline with dynamic filter cutoff."
                ),
                BgmStem(
                    id = "stem_4_house_drums",
                    name = "Punchy 4-on-the-Floor Kick & Hats",
                    category = StemCategory.DRUMS_PERCUSSION,
                    durationMs = 28000L,
                    startOffsetMs = 0L,
                    waveformPoints = generateWaveform(403),
                    isRingtoneRecommended = false,
                    description = "High-definition club drum groove with crisp open hi-hats."
                ),
                BgmStem(
                    id = "stem_4_synth_pad",
                    name = "Deep Space Lush Shimmer",
                    category = StemCategory.AMBIENT_PAD,
                    durationMs = 40000L,
                    startOffsetMs = 0L,
                    waveformPoints = generateWaveform(404),
                    isRingtoneRecommended = true,
                    description = "Infinite reverb wash creating expansive 360 soundfield."
                ),
                BgmStem(
                    id = "stem_4_drop",
                    name = "Euphoric Drop Lead Hook",
                    category = StemCategory.CLIMAX_SOLO,
                    durationMs = 35000L,
                    startOffsetMs = 75000L,
                    waveformPoints = generateWaveform(405),
                    isRingtoneRecommended = true,
                    description = "Anthemic supersaw lead with stereo widening effect."
                )
            ),
            lyrics = listOf(
                LyricLine(4000L, "Weightless floating in the atmosphere", "Zero gravity sensation", "Introduction to spatial dimension"),
                LyricLine(18000L, "Every distant constellation burning clear", "Cosmic clarity", "Visual and sonic resonance"),
                LyricLine(35000L, "Feel the gravity releasing all its hold", "Letting go of weight", "Drop buildup cue"),
                LyricLine(50000L, "We're turning stardust into sonic gold!", "Transforming energy into music", "Peak drop celebration")
            )
        )
    )

    val playlists: List<PlaylistItem> = listOf(
        PlaylistItem("pl_spatial", "Dolby Atmos Masters", "Object-based 3D soundscapes", listOf("muse_track_1", "muse_track_3"), 0xFF7928CA),
        PlaylistItem("pl_bgm_vault", "Extracted BGM Highlights", "Isolated stems for ringtones & alarms", listOf("muse_track_1", "muse_track_2", "muse_track_4"), 0xFF00DFD8),
        PlaylistItem("pl_lofi", "Midnight Acoustic & Lofi", "Relaxing vibes for deep focus", listOf("muse_track_2"), 0xFFFF416C),
        PlaylistItem("pl_cinematic", "Epic Cinematic Scores", "Hi-Res lossless orchestral climaxes", listOf("muse_track_3", "muse_track_4"), 0xFF4A00E0)
    )
}
