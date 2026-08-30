package com.example.muse.ai

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import com.example.muse.model.VoiceAssistantState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale
import java.util.regex.Pattern

sealed class VoiceAction {
    data class SetVolume(val targetVolume: Int) : VoiceAction()
    data class AdjustVolumeRelative(val delta: Int) : VoiceAction()
    data object Mute : VoiceAction()
    data object Unmute : VoiceAction()
    data object Play : VoiceAction()
    data object Pause : VoiceAction()
    data object NextSong : VoiceAction()
    data object PreviousSong : VoiceAction()
    data object RestartSong : VoiceAction()
    data class SearchAndPlay(val query: String) : VoiceAction()
    data class SetSpatialAudio(val enabled: Boolean) : VoiceAction()
    data class SetDolbyAtmos(val enabled: Boolean) : VoiceAction()
    data object OpenStemExtractor : VoiceAction()
    data object OpenAudioTrimmer : VoiceAction()
    data object OpenLyricsChat : VoiceAction()
    data class GeneralInfo(val response: String) : VoiceAction()
}

class VoiceAiAssistant(
    private val context: Context,
    private var onActionDispatched: ((VoiceAction) -> Unit)? = null
) {
    private val TAG = "VoiceAiAssistant"
    private var speechRecognizer: SpeechRecognizer? = null
    private val _state = MutableStateFlow(VoiceAssistantState())
    val state: StateFlow<VoiceAssistantState> = _state.asStateFlow()

    init {
        try {
            if (SpeechRecognizer.isRecognitionAvailable(context)) {
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
                    setRecognitionListener(createRecognitionListener())
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "SpeechRecognizer initialization warning", e)
        }
    }

    fun startListening(callback: ((VoiceAction) -> Unit)? = null) {
        if (callback != null) {
            this.onActionDispatched = callback
        }
        _state.value = _state.value.copy(
            isListening = true,
            recognizedText = "",
            assistantFeedback = "Listening for 'Hey Muse' or your command..."
        )

        try {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
            }
            speechRecognizer?.startListening(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start speech recognizer", e)
            _state.value = _state.value.copy(
                assistantFeedback = "Mic ready. Tap command or speak 'Hey Muse...'"
            )
        }
    }

    fun stopListening() {
        try {
            speechRecognizer?.stopListening()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping recognizer", e)
        }
        _state.value = _state.value.copy(isListening = false)
    }

    fun parseCommand(rawInput: String): VoiceAction {
        val cleanInput = rawInput.trim().lowercase(Locale.ROOT)
        val normalized = cleanInput
            .replace("hey muse", "")
            .replace("ok muse", "")
            .replace("muse", "")
            .trim()

        val textToEvaluate = if (normalized.isNotEmpty()) normalized else cleanInput

        // 1. Explicit Volume 0 - 100
        val explicitVolumeMatch = Pattern.compile(".*?(?:volume|sound|level)\\s*(?:to|at|is|=)?\\s*(\\d{1,3})%?.*").matcher(textToEvaluate)
        if (explicitVolumeMatch.find()) {
            val volVal = explicitVolumeMatch.group(1)?.toIntOrNull()
            if (volVal != null) {
                return VoiceAction.SetVolume(volVal.coerceIn(0, 100))
            }
        }

        // Relative Volume
        if (textToEvaluate.contains("decrease volume") || textToEvaluate.contains("volume down") || textToEvaluate.contains("lower sound") || textToEvaluate.contains("quieter")) {
            val numberMatch = Pattern.compile(".*?(\\d{1,2}).*").matcher(textToEvaluate)
            val delta = if (numberMatch.find()) -(numberMatch.group(1)?.toIntOrNull() ?: 15) else -15
            return VoiceAction.AdjustVolumeRelative(delta)
        }

        if (textToEvaluate.contains("increase volume") || textToEvaluate.contains("volume up") || textToEvaluate.contains("raise sound") || textToEvaluate.contains("louder")) {
            val numberMatch = Pattern.compile(".*?(\\d{1,2}).*").matcher(textToEvaluate)
            val delta = if (numberMatch.find()) (numberMatch.group(1)?.toIntOrNull() ?: 15) else 15
            return VoiceAction.AdjustVolumeRelative(delta)
        }

        // Mute / Unmute
        if (textToEvaluate.contains("unmute") || textToEvaluate.contains("sound on")) {
            return VoiceAction.Unmute
        }
        if (textToEvaluate.contains("mute") || textToEvaluate.contains("silence")) {
            return VoiceAction.Mute
        }

        // Playback Navigation
        if (textToEvaluate.contains("next song") || textToEvaluate.contains("next track") || textToEvaluate.contains("skip")) {
            return VoiceAction.NextSong
        }
        if (textToEvaluate.contains("previous song") || textToEvaluate.contains("previous track") || textToEvaluate.contains("go back")) {
            return VoiceAction.PreviousSong
        }
        if (textToEvaluate.contains("restart") || textToEvaluate.contains("replay")) {
            return VoiceAction.RestartSong
        }
        if (textToEvaluate.contains("pause") || textToEvaluate.contains("stop")) {
            return VoiceAction.Pause
        }
        if (textToEvaluate == "play" || textToEvaluate == "resume" || textToEvaluate.contains("start playing")) {
            return VoiceAction.Play
        }

        // Search & Play
        if (textToEvaluate.startsWith("play ") || textToEvaluate.contains("play track") || textToEvaluate.contains("search for")) {
            val query = textToEvaluate
                .replace("play track", "")
                .replace("search for", "")
                .replace("play", "")
                .trim()
            return VoiceAction.SearchAndPlay(query)
        }

        // Spatial Audio & Dolby
        if (textToEvaluate.contains("spatial audio") || textToEvaluate.contains("3d audio")) {
            val enable = !textToEvaluate.contains("off") && !textToEvaluate.contains("disable")
            return VoiceAction.SetSpatialAudio(enable)
        }
        if (textToEvaluate.contains("dolby atmos") || textToEvaluate.contains("dolby audio")) {
            val enable = !textToEvaluate.contains("off") && !textToEvaluate.contains("disable")
            return VoiceAction.SetDolbyAtmos(enable)
        }

        // Utilities
        if (textToEvaluate.contains("bgm") || textToEvaluate.contains("stem") || textToEvaluate.contains("extract layer")) {
            return VoiceAction.OpenStemExtractor
        }
        if (textToEvaluate.contains("trim") || textToEvaluate.contains("crop") || textToEvaluate.contains("ringtone")) {
            return VoiceAction.OpenAudioTrimmer
        }
        if (textToEvaluate.contains("lyrics") || textToEvaluate.contains("words") || textToEvaluate.contains("notes")) {
            return VoiceAction.OpenLyricsChat
        }

        return VoiceAction.GeneralInfo("Executing command: $rawInput")
    }

    fun setManualInputFeedback(commandText: String, action: VoiceAction) {
        val feedback = when (action) {
            is VoiceAction.SetVolume -> "Adjusted volume to ${action.targetVolume}%."
            is VoiceAction.AdjustVolumeRelative -> if (action.delta > 0) "Increasing volume..." else "Decreasing volume..."
            is VoiceAction.Mute -> "Audio muted."
            is VoiceAction.Unmute -> "Audio unmuted."
            is VoiceAction.NextSong -> "Skipping to next track..."
            is VoiceAction.PreviousSong -> "Skipping to previous track..."
            is VoiceAction.RestartSong -> "Restarting track..."
            is VoiceAction.Play -> "Resuming audio playback..."
            is VoiceAction.Pause -> "Playback paused."
            is VoiceAction.SearchAndPlay -> "Searching & playing '${action.query}'..."
            is VoiceAction.SetSpatialAudio -> if (action.enabled) "Spatial 3D Audio enabled." else "Spatial Audio bypassed."
            is VoiceAction.SetDolbyAtmos -> if (action.enabled) "Dolby Atmos engine active." else "Dolby Atmos bypassed."
            is VoiceAction.OpenStemExtractor -> "Opening BGM Multi-Stem Segment Explorer..."
            is VoiceAction.OpenAudioTrimmer -> "Opening Audio Trimmer Studio..."
            is VoiceAction.OpenLyricsChat -> "Opening Muse Lyrics Intelligence..."
            is VoiceAction.GeneralInfo -> action.response
        }

        _state.value = _state.value.copy(
            recognizedText = commandText,
            assistantFeedback = feedback,
            isListening = false
        )
    }

    fun parseAndExecute(rawInput: String) {
        val action = parseCommand(rawInput)
        setManualInputFeedback(rawInput, action)
        onActionDispatched?.invoke(action)
    }

    private fun createRecognitionListener() = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {
            _state.value = _state.value.copy(assistantFeedback = "Hey Muse is listening...")
        }

        override fun onBeginningOfSpeech() {}
        override fun onRmsChanged(rmsdB: Float) {}
        override fun onBufferReceived(buffer: ByteArray?) {}
        override fun onEndOfSpeech() {
            _state.value = _state.value.copy(isListening = false)
        }

        override fun onError(error: Int) {
            _state.value = _state.value.copy(
                isListening = false,
                assistantFeedback = "Tap the orb to speak or pick a command chip below."
            )
        }

        override fun onResults(results: Bundle?) {
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val topResult = matches?.firstOrNull() ?: ""
            if (topResult.isNotBlank()) {
                parseAndExecute(topResult)
            }
        }

        override fun onPartialResults(partialResults: Bundle?) {
            val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val partial = matches?.firstOrNull() ?: ""
            if (partial.isNotBlank()) {
                _state.value = _state.value.copy(recognizedText = partial)
            }
        }

        override fun onEvent(eventType: Int, params: Bundle?) {}
    }

    fun destroy() {
        try {
            speechRecognizer?.destroy()
            speechRecognizer = null
        } catch (e: Exception) {
            Log.e(TAG, "Error destroying speech recognizer", e)
        }
    }
}
