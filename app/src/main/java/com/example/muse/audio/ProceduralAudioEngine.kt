package com.example.muse.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.util.Log
import com.example.muse.model.AudioSpatialConfig
import com.example.muse.model.BgmStem
import com.example.muse.model.RoomPreset
import com.example.muse.model.Song
import com.example.muse.model.StemCategory
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

class ProceduralAudioEngine(
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default)
) {
    private val TAG = "ProceduralAudioEngine"
    private val sampleRate = 44100
    private var audioTrack: AudioTrack? = null
    private var playbackJob: Job? = null

    // State flows
    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _currentPositionMs = MutableStateFlow(0L)
    val currentPositionMs: StateFlow<Long> = _currentPositionMs.asStateFlow()

    private val _volume = MutableStateFlow(85) // 0 to 100
    val volume: StateFlow<Int> = _volume.asStateFlow()

    private val _isMuted = MutableStateFlow(false)
    val isMuted: StateFlow<Boolean> = _isMuted.asStateFlow()

    private val _frequencyBands = MutableStateFlow(List(16) { 0.2f })
    val frequencyBands: StateFlow<List<Float>> = _frequencyBands.asStateFlow()

    private val _spatialConfig = MutableStateFlow(AudioSpatialConfig())
    val spatialConfig: StateFlow<AudioSpatialConfig> = _spatialConfig.asStateFlow()

    private val _isLoopPreviewing = MutableStateFlow(false)
    val isLoopPreviewing: StateFlow<Boolean> = _isLoopPreviewing.asStateFlow()

    // Stem isolation states (StemCategory -> isEnabled)
    private val _stemMuteStates = MutableStateFlow<Map<StemCategory, Boolean>>(
        StemCategory.values().associateWith { false }
    )
    val stemMuteStates: StateFlow<Map<StemCategory, Boolean>> = _stemMuteStates.asStateFlow()

    private val _stemSoloStates = MutableStateFlow<Map<StemCategory, Boolean>>(
        StemCategory.values().associateWith { false }
    )
    val stemSoloStates: StateFlow<Map<StemCategory, Boolean>> = _stemSoloStates.asStateFlow()

    private var currentSong: Song? = null

    // Trimmer preview mode
    private var trimmerModeActive = false
    private var trimmerStartMs = 0L
    private var trimmerEndMs = 30000L

    init {
        initAudioTrack()
    }

    private fun initAudioTrack() {
        try {
            val minBufferSize = AudioTrack.getMinBufferSize(
                sampleRate,
                AudioFormat.CHANNEL_OUT_STEREO,
                AudioFormat.ENCODING_PCM_16BIT
            )
            val bufferSize = (minBufferSize * 2).coerceAtLeast(8192)

            val audioAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build()

            val audioFormat = AudioFormat.Builder()
                .setSampleRate(sampleRate)
                .setChannelMask(AudioFormat.CHANNEL_OUT_STEREO)
                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                .build()

            audioTrack = AudioTrack.Builder()
                .setAudioAttributes(audioAttributes)
                .setAudioFormat(audioFormat)
                .setBufferSizeInBytes(bufferSize)
                .setTransferMode(AudioTrack.MODE_STREAM)
                .build()
        } catch (e: Exception) {
            Log.e(TAG, "AudioTrack init failed, falling back to simulated engine", e)
        }
    }

    fun loadSong(song: Song) {
        currentSong = song
        _currentPositionMs.value = 0L
        trimmerModeActive = false
        _isLoopPreviewing.value = false
    }

    fun play() {
        if (_isPlaying.value) return
        _isPlaying.value = true
        startAudioLoop()
    }

    fun pause() {
        _isPlaying.value = false
        playbackJob?.cancel()
        playbackJob = null
        try {
            audioTrack?.pause()
            audioTrack?.flush()
        } catch (e: Exception) {
            Log.e(TAG, "Error pausing audio", e)
        }
    }

    fun seekTo(positionMs: Long) {
        val song = currentSong ?: return
        _currentPositionMs.value = positionMs.coerceIn(0L, song.durationMs)
    }

    fun setVolume(vol: Int) {
        val clamped = vol.coerceIn(0, 100)
        _volume.value = clamped
        if (clamped > 0 && _isMuted.value) {
            _isMuted.value = false
        }
        applyVolumeToTrack()
    }

    fun setMute(muted: Boolean) {
        _isMuted.value = muted
        applyVolumeToTrack()
    }

    fun toggleMute() {
        setMute(!_isMuted.value)
    }

    private fun applyVolumeToTrack() {
        val effectiveGain = if (_isMuted.value) 0.0f else (_volume.value / 100.0f)
        try {
            audioTrack?.setVolume(effectiveGain)
        } catch (e: Exception) {
            Log.e(TAG, "Error setting volume", e)
        }
    }

    fun updateSpatialConfig(config: AudioSpatialConfig) {
        _spatialConfig.value = config
    }

    fun toggleStemMute(category: StemCategory) {
        val current = _stemMuteStates.value.toMutableMap()
        current[category] = !(current[category] ?: false)
        _stemMuteStates.value = current
    }

    fun toggleStemSolo(category: StemCategory) {
        val current = _stemSoloStates.value.toMutableMap()
        val isSoloed = current[category] ?: false
        if (isSoloed) {
            current[category] = false
        } else {
            // Solo this category, un-solo others
            StemCategory.values().forEach { current[it] = (it == category) }
        }
        _stemSoloStates.value = current
    }

    fun resetStems() {
        _stemMuteStates.value = StemCategory.values().associateWith { false }
        _stemSoloStates.value = StemCategory.values().associateWith { false }
    }

    fun startLoopPreview(startMs: Long, endMs: Long) {
        trimmerModeActive = true
        _isLoopPreviewing.value = true
        trimmerStartMs = startMs
        trimmerEndMs = endMs
        _currentPositionMs.value = startMs
        play()
    }

    fun stopLoopPreview() {
        trimmerModeActive = false
        _isLoopPreviewing.value = false
        pause()
    }

    private fun isStemAudible(category: StemCategory): Boolean {
        val anySolo = _stemSoloStates.value.values.any { it }
        return if (anySolo) {
            _stemSoloStates.value[category] == true
        } else {
            _stemMuteStates.value[category] != true
        }
    }

    private fun startAudioLoop() {
        playbackJob?.cancel()
        try {
            audioTrack?.play()
        } catch (e: Exception) {
            Log.e(TAG, "AudioTrack play error", e)
        }

        playbackJob = scope.launch(Dispatchers.Default) {
            val bufferFrames = 1024
            val pcmBuffer = ShortArray(bufferFrames * 2) // Stereo (L, R)
            var phaseMelody = 0.0
            var phaseBass = 0.0
            var phasePad = 0.0
            var phaseSolo = 0.0

            while (isActive && _isPlaying.value) {
                val song = currentSong
                val songDuration = song?.durationMs ?: 180000L
                val bpm = song?.bpm ?: 120
                val secondsPerBeat = 60.0 / bpm
                val currentSec = _currentPositionMs.value / 1000.0
                val beat = (currentSec / secondsPerBeat)

                // Root notes based on song key
                val baseFreq = when (song?.key) {
                    "F# Minor" -> 185.0 // F#3
                    "D Major" -> 146.8 // D3
                    "A Minor" -> 220.0 // A3
                    "C Minor" -> 130.8 // C3
                    else -> 220.0
                }

                // Spatial Audio binaural panning & room filter coefficients
                val spatial = _spatialConfig.value
                val isSpatial = spatial.isSpatialEnabled
                val isDolby = spatial.isDolbyAtmosEnabled
                val azimuthRad = (spatial.azimuthAngleDegrees * PI / 180.0)
                val panLeft = if (isSpatial) (cos((azimuthRad + PI / 2) / 2.0).toFloat().coerceIn(0.2f, 1.0f)) else 1.0f
                val panRight = if (isSpatial) (sin((azimuthRad + PI / 2) / 2.0).toFloat().coerceIn(0.2f, 1.0f)) else 1.0f
                val bassMultiplier = if (isDolby) (1.0f + spatial.bassBoost * 0.8f) else 1.0f
                val clarityMultiplier = if (isDolby) (1.0f + spatial.vocalClarity * 0.5f) else 1.0f

                val melodyAudible = isStemAudible(StemCategory.MAIN_MELODY)
                val bassAudible = isStemAudible(StemCategory.BASSLINE_GROOVE)
                val drumsAudible = isStemAudible(StemCategory.DRUMS_PERCUSSION)
                val padAudible = isStemAudible(StemCategory.AMBIENT_PAD)
                val soloAudible = isStemAudible(StemCategory.CLIMAX_SOLO)

                val effectiveVol = if (_isMuted.value) 0.0f else (_volume.value / 100.0f)

                // Synthesize stereo PCM frames
                for (i in 0 until bufferFrames) {
                    val frameTime = currentSec + (i.toDouble() / sampleRate)
                    val frameBeat = (frameTime / secondsPerBeat)

                    // 1. Bassline synthesis (Square + Sub sine)
                    var bassSample = 0.0
                    if (bassAudible) {
                        val bassNoteMultiplier = when ((frameBeat.toInt() / 2) % 4) {
                            0 -> 0.5 // Sub root
                            1 -> 0.75 // Sub 4th
                            2 -> 0.667 // Sub flat 3rd
                            else -> 0.888 // Sub 5th
                        }
                        val bassFreq = baseFreq * bassNoteMultiplier
                        phaseBass += (2.0 * PI * bassFreq) / sampleRate
                        if (phaseBass > 2 * PI) phaseBass -= 2 * PI
                        val bassSquare = if (sin(phaseBass) > 0) 0.6 else -0.6
                        val bassSub = sin(phaseBass * 0.5) * 0.8
                        bassSample = (bassSquare + bassSub) * 0.25 * bassMultiplier
                    }

                    // 2. Lead melody arpeggio synthesis
                    var melodySample = 0.0
                    if (melodyAudible) {
                        val arpStep = (frameBeat * 4).toInt() % 8
                        val arpInterval = when (arpStep) {
                            0 -> 1.0
                            1 -> 1.2
                            2 -> 1.5
                            3 -> 1.8
                            4 -> 2.0
                            5 -> 1.5
                            6 -> 1.2
                            else -> 1.0
                        }
                        val melodyFreq = baseFreq * 2.0 * arpInterval
                        phaseMelody += (2.0 * PI * melodyFreq) / sampleRate
                        if (phaseMelody > 2 * PI) phaseMelody -= 2 * PI
                        val noteDecay = 1.0 - ((frameBeat * 4) % 1.0) * 0.7
                        melodySample = sin(phaseMelody) * noteDecay * 0.3 * clarityMultiplier
                    }

                    // 3. Ambient Pad chords (lush chorus)
                    var padSample = 0.0
                    if (padAudible) {
                        phasePad += (2.0 * PI * baseFreq * 1.5) / sampleRate
                        if (phasePad > 2 * PI) phasePad -= 2 * PI
                        padSample = (sin(phasePad) + 0.5 * sin(phasePad * 1.005)) * 0.18
                    }

                    // 4. Drum & Percussion (Kick on beat 1/3, Snare on beat 2/4, HiHat on 16ths)
                    var drumSample = 0.0
                    if (drumsAudible) {
                        val beatFraction = frameBeat % 1.0
                        val isSnareBeat = (frameBeat.toInt() % 2 == 1)
                        if (beatFraction < 0.12) {
                            if (isSnareBeat) {
                                // Snare noise burst
                                val noise = (Math.random() * 2.0 - 1.0)
                                val decay = (1.0 - beatFraction / 0.12)
                                drumSample += noise * decay * 0.35
                            } else {
                                // Kick sine sweep
                                val kickFreq = 120.0 * (1.0 - beatFraction / 0.12) + 45.0
                                drumSample += sin(2.0 * PI * kickFreq * beatFraction) * 0.45 * bassMultiplier
                            }
                        }
                        // Hi-hat tick
                        val hatFraction = (frameBeat * 2) % 1.0
                        if (hatFraction < 0.04) {
                            drumSample += (Math.random() * 2.0 - 1.0) * (1.0 - hatFraction / 0.04) * 0.15
                        }
                    }

                    // 5. Climax Solo layer
                    var soloSample = 0.0
                    if (soloAudible) {
                        val soloFreq = baseFreq * 3.0 + sin(frameTime * 6.0) * 15.0 // vibrato
                        phaseSolo += (2.0 * PI * soloFreq) / sampleRate
                        if (phaseSolo > 2 * PI) phaseSolo -= 2 * PI
                        soloSample = sin(phaseSolo) * 0.28 * clarityMultiplier
                    }

                    // Mix stems
                    val monoMix = (bassSample + melodySample + padSample + drumSample + soloSample) * effectiveVol

                    // Apply Spatial stereo spread
                    val leftOut = (monoMix * panLeft).coerceIn(-1.0, 1.0)
                    val rightOut = (monoMix * panRight).coerceIn(-1.0, 1.0)

                    pcmBuffer[i * 2] = (leftOut * 32767.0).toInt().toShort()
                    pcmBuffer[i * 2 + 1] = (rightOut * 32767.0).toInt().toShort()
                }

                // Write to AudioTrack
                try {
                    audioTrack?.write(pcmBuffer, 0, pcmBuffer.size)
                } catch (e: Exception) {
                    Log.e(TAG, "AudioTrack write error", e)
                }

                // Advance playback time
                val bufferDurationMs = ((bufferFrames.toDouble() / sampleRate) * 1000).toLong()
                var nextPos = _currentPositionMs.value + bufferDurationMs

                if (trimmerModeActive) {
                    if (nextPos >= trimmerEndMs) {
                        nextPos = trimmerStartMs
                    }
                } else {
                    if (nextPos >= songDuration) {
                        nextPos = 0L // Loop or gapless next
                    }
                }
                _currentPositionMs.value = nextPos

                // Update dynamic frequency visualizer bands
                val animTime = currentSec * 8.0
                val bands = List(16) { bandIdx ->
                    val stemWeight = when (bandIdx) {
                        in 0..3 -> if (bassAudible) 0.8f else 0.2f
                        in 4..8 -> if (drumsAudible) 0.75f else 0.3f
                        in 9..12 -> if (melodyAudible) 0.9f else 0.25f
                        else -> if (soloAudible || padAudible) 0.85f else 0.2f
                    }
                    val osc = (0.35f + 0.65f * kotlin.math.abs(sin(animTime + bandIdx * 0.45).toFloat()))
                    (osc * stemWeight * (effectiveVol.coerceAtLeast(0.1f))).coerceIn(0.1f, 1.0f)
                }
                _frequencyBands.value = bands

                delay(15)
            }
        }
    }

    fun release() {
        pause()
        try {
            audioTrack?.release()
            audioTrack = null
        } catch (e: Exception) {
            Log.e(TAG, "AudioTrack release error", e)
        }
    }
}
