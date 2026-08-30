package com.example

import android.app.Activity
import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.example.muse.ai.LyricsAiChatbot
import com.example.muse.ai.VoiceAction
import com.example.muse.ai.VoiceAiAssistant
import com.example.muse.audio.ProceduralAudioEngine
import com.example.muse.data.SampleCatalog
import com.example.muse.model.BgmStem
import com.example.muse.model.DownloadedAsset
import com.example.muse.model.Song
import com.example.muse.model.ToneExportType
import com.example.muse.permission.MicrophonePermissionManager
import com.example.muse.permission.MicrophonePermissionUiState
import com.example.muse.ui.components.AudioTrimmerDialog
import com.example.muse.ui.components.LyricsChatbotSheet
import com.example.muse.ui.components.MicrophoneRationaleDialog
import com.example.muse.ui.components.MicrophoneSettingsDialog
import com.example.muse.ui.components.PrdArchitectureSheet
import com.example.muse.ui.components.SpatialAudioDialog
import com.example.muse.ui.components.VoiceAssistantOverlay
import com.example.muse.ui.screens.LibraryScreen
import com.example.muse.ui.screens.MainPlayerScreen
import com.example.muse.ui.theme.MuseColors
import com.example.ui.theme.MyApplicationTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var permissionManager: MicrophonePermissionManager

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        permissionManager.onPermissionResult(isGranted, this)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        permissionManager = MicrophonePermissionManager(applicationContext)

        setContent {
            MyApplicationTheme {
                MuseAppRoot(
                    permissionManager = permissionManager,
                    onRequestMicPermission = { onGranted ->
                        permissionManager.requestOrExecute(
                            activity = this,
                            launcher = requestPermissionLauncher,
                            onGrantedAction = onGranted
                        )
                    },
                    onLaunchDirectMicRequest = {
                        permissionManager.launchDirectRequest(requestPermissionLauncher)
                    }
                )
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (::permissionManager.isInitialized) {
            permissionManager.syncCurrentState(applicationContext)
        }
    }
}

@Composable
fun MuseAppRoot(
    permissionManager: MicrophonePermissionManager,
    onRequestMicPermission: (onGranted: () -> Unit) -> Unit,
    onLaunchDirectMicRequest: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    // Permission State Flow
    val permissionUiState by permissionManager.uiState.collectAsState()

    // Audio Engine & AI Assistant Singletons
    val audioEngine = remember { ProceduralAudioEngine(scope) }
    val voiceAssistant = remember { VoiceAiAssistant(context) }
    val lyricsChatbot = remember { LyricsAiChatbot() }

    // App State
    val allSongs = remember { SampleCatalog.songs }
    val playlists = remember { SampleCatalog.playlists }
    var currentSongIndex by remember { mutableStateOf(0) }
    val currentSong = allSongs[currentSongIndex]

    val isPlaying by audioEngine.isPlaying.collectAsState()
    val currentPositionMs by audioEngine.currentPositionMs.collectAsState()
    val currentVolume by audioEngine.volume.collectAsState()
    val isMuted by audioEngine.isMuted.collectAsState()
    val spatialConfig by audioEngine.spatialConfig.collectAsState()
    val stemMuteStates by audioEngine.stemMuteStates.collectAsState()
    val stemSoloStates by audioEngine.stemSoloStates.collectAsState()
    val frequencyBands by audioEngine.frequencyBands.collectAsState()
    val isLoopPreviewing by audioEngine.isLoopPreviewing.collectAsState()

    val voiceState by voiceAssistant.state.collectAsState()
    val chatMessages by lyricsChatbot.messages.collectAsState()

    val favoriteSongIds = remember { mutableStateListOf("song_1", "song_3") }
    val downloadedAssets = remember {
        mutableStateListOf(
            DownloadedAsset(
                id = "asset_1",
                title = "Synth Lead Hook",
                sourceTrack = "Neon Horizon",
                type = "FLAC Stem",
                fileSizeMb = 14.2f
            ),
            DownloadedAsset(
                id = "asset_2",
                title = "Cyber 808 Groove",
                sourceTrack = "Neon Horizon",
                type = "Ringtone (M4R)",
                fileSizeMb = 3.8f
            )
        )
    }

    // Navigation & Dialog Visibility
    var currentScreen by remember { mutableStateOf("player") } // "player" or "library"
    var showSpatialDialog by remember { mutableStateOf(false) }
    var showVoiceOverlay by remember { mutableStateOf(false) }
    var showLyricsSheet by remember { mutableStateOf(false) }
    var showPrdSheet by remember { mutableStateOf(false) }
    var showTrimmerDialog by remember { mutableStateOf(false) }
    var stemForTrimmer by remember { mutableStateOf<BgmStem?>(null) }

    // Synchronize initial song to audio engine & chatbot
    LaunchedEffect(currentSong) {
        audioEngine.loadSong(currentSong)
        lyricsChatbot.initializeForSong(currentSong)
    }

    // Voice Action Dispatcher
    fun handleVoiceAction(action: VoiceAction) {
        when (action) {
            is VoiceAction.SetVolume -> {
                audioEngine.setVolume(action.targetVolume)
                scope.launch { snackbarHostState.showSnackbar("Volume adjusted to ${action.targetVolume}%") }
            }
            is VoiceAction.AdjustVolumeRelative -> {
                val newVol = (currentVolume + action.delta).coerceIn(0, 100)
                audioEngine.setVolume(newVol)
                scope.launch { snackbarHostState.showSnackbar("Volume adjusted to $newVol%") }
            }
            is VoiceAction.Mute -> {
                audioEngine.setMute(true)
                scope.launch { snackbarHostState.showSnackbar("Audio Muted") }
            }
            is VoiceAction.Unmute -> {
                audioEngine.setMute(false)
                scope.launch { snackbarHostState.showSnackbar("Audio Unmuted") }
            }
            is VoiceAction.NextSong -> {
                currentSongIndex = (currentSongIndex + 1) % allSongs.size
                audioEngine.loadSong(allSongs[currentSongIndex])
                audioEngine.play()
                scope.launch { snackbarHostState.showSnackbar("Playing: ${allSongs[currentSongIndex].title}") }
            }
            is VoiceAction.PreviousSong -> {
                currentSongIndex = if (currentSongIndex - 1 < 0) allSongs.size - 1 else currentSongIndex - 1
                audioEngine.loadSong(allSongs[currentSongIndex])
                audioEngine.play()
                scope.launch { snackbarHostState.showSnackbar("Playing: ${allSongs[currentSongIndex].title}") }
            }
            is VoiceAction.RestartSong -> {
                audioEngine.seekTo(0L)
                audioEngine.play()
                scope.launch { snackbarHostState.showSnackbar("Restarted: ${currentSong.title}") }
            }
            is VoiceAction.Play -> {
                audioEngine.play()
            }
            is VoiceAction.Pause -> {
                audioEngine.pause()
            }
            is VoiceAction.SearchAndPlay -> {
                val target = action.query.lowercase()
                val matchIdx = allSongs.indexOfFirst {
                    it.title.lowercase().contains(target) || it.artist.lowercase().contains(target) || it.genre.lowercase().contains(target)
                }
                if (matchIdx != -1) {
                    currentSongIndex = matchIdx
                    audioEngine.loadSong(allSongs[matchIdx])
                    audioEngine.play()
                    scope.launch { snackbarHostState.showSnackbar("Found & playing: ${allSongs[matchIdx].title}") }
                } else {
                    scope.launch { snackbarHostState.showSnackbar("Could not find track matching '${action.query}'") }
                }
            }
            is VoiceAction.SetSpatialAudio -> {
                audioEngine.updateSpatialConfig(spatialConfig.copy(isSpatialEnabled = action.enabled))
                scope.launch { snackbarHostState.showSnackbar("Spatial Audio: ${if (action.enabled) "ON" else "OFF"}") }
            }
            is VoiceAction.SetDolbyAtmos -> {
                audioEngine.updateSpatialConfig(spatialConfig.copy(isDolbyAtmosEnabled = action.enabled))
                scope.launch { snackbarHostState.showSnackbar("Dolby Atmos: ${if (action.enabled) "ON" else "OFF"}") }
            }
            is VoiceAction.OpenStemExtractor -> {
                scope.launch { snackbarHostState.showSnackbar("BGM multi-stem explorer ready with ${currentSong.stems.size} stems") }
            }
            is VoiceAction.OpenAudioTrimmer -> {
                stemForTrimmer = null
                showTrimmerDialog = true
            }
            is VoiceAction.OpenLyricsChat -> {
                showLyricsSheet = true
            }
            is VoiceAction.GeneralInfo -> {
                scope.launch { snackbarHostState.showSnackbar(action.response) }
            }
        }
    }

    // Cleanup resources
    DisposableEffect(Unit) {
        onDispose {
            audioEngine.release()
            voiceAssistant.destroy()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = MuseColors.Background,
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MuseColors.Background)
        ) {
            if (currentScreen == "player") {
                MainPlayerScreen(
                    currentSong = currentSong,
                    isPlaying = isPlaying,
                    currentPositionMs = currentPositionMs,
                    volume = currentVolume,
                    isMuted = isMuted,
                    frequencyBands = frequencyBands,
                    spatialConfig = spatialConfig,
                    stemMuteStates = stemMuteStates,
                    stemSoloStates = stemSoloStates,
                    isFavorite = favoriteSongIds.contains(currentSong.id),
                    onTogglePlayPause = {
                        if (isPlaying) audioEngine.pause() else audioEngine.play()
                    },
                    onNextSong = {
                        currentSongIndex = (currentSongIndex + 1) % allSongs.size
                        audioEngine.loadSong(allSongs[currentSongIndex])
                        audioEngine.play()
                    },
                    onPreviousSong = {
                        currentSongIndex = if (currentSongIndex - 1 < 0) allSongs.size - 1 else currentSongIndex - 1
                        audioEngine.loadSong(allSongs[currentSongIndex])
                        audioEngine.play()
                    },
                    onSeekTo = { audioEngine.seekTo(it) },
                    onVolumeChange = { audioEngine.setVolume(it) },
                    onToggleMute = { audioEngine.toggleMute() },
                    onToggleFavorite = {
                        if (favoriteSongIds.contains(currentSong.id)) {
                            favoriteSongIds.remove(currentSong.id)
                        } else {
                            favoriteSongIds.add(currentSong.id)
                        }
                    },
                    onToggleStemMute = { audioEngine.toggleStemMute(it) },
                    onToggleStemSolo = { audioEngine.toggleStemSolo(it) },
                    onDownloadStem = { stem ->
                        downloadedAssets.add(
                            DownloadedAsset(
                                id = "stem_${System.currentTimeMillis()}",
                                title = stem.name,
                                sourceTrack = currentSong.title,
                                type = "FLAC Lossless Stem",
                                fileSizeMb = 8.5f
                            )
                        )
                        scope.launch { snackbarHostState.showSnackbar("Saved '${stem.name}' to Offline Stem Vault") }
                    },
                    onSetRingtone = { stem, toneType ->
                        downloadedAssets.add(
                            DownloadedAsset(
                                id = "tone_${System.currentTimeMillis()}",
                                title = "${stem.name} (${toneType.label})",
                                sourceTrack = currentSong.title,
                                type = toneType.label,
                                fileSizeMb = 2.4f
                            )
                        )
                        scope.launch { snackbarHostState.showSnackbar("Applied '${stem.name}' as ${toneType.label}") }
                    },
                    onOpenTrimmerForStem = { stem ->
                        stemForTrimmer = stem
                        showTrimmerDialog = true
                    },
                    onOpenSpatialDialog = { showSpatialDialog = true },
                    onOpenVoiceAssistant = {
                        showVoiceOverlay = true
                        onRequestMicPermission {
                            voiceAssistant.startListening { action -> handleVoiceAction(action) }
                        }
                    },
                    onOpenLyricsChat = { showLyricsSheet = true },
                    onOpenPrdSheet = { showPrdSheet = true },
                    onNavigateToLibrary = { currentScreen = "library" }
                )
            } else {
                LibraryScreen(
                    playlists = playlists,
                    allSongs = allSongs,
                    favoriteSongIds = favoriteSongIds.toSet(),
                    downloadedAssets = downloadedAssets,
                    onSelectSong = { song ->
                        val idx = allSongs.indexOf(song)
                        if (idx != -1) {
                            currentSongIndex = idx
                            audioEngine.loadSong(song)
                            audioEngine.play()
                        }
                        currentScreen = "player"
                    },
                    onToggleFavorite = { songId ->
                        if (favoriteSongIds.contains(songId)) {
                            favoriteSongIds.remove(songId)
                        } else {
                            favoriteSongIds.add(songId)
                        }
                    }
                )
            }

            // MODALS & DIALOGS

            // 1. Spatial Audio & Dolby Atmos 3D Radar Dialog
            if (showSpatialDialog) {
                SpatialAudioDialog(
                    config = spatialConfig,
                    onConfigChanged = { audioEngine.updateSpatialConfig(it) },
                    onDismiss = { showSpatialDialog = false }
                )
            }

            // 2. Multimodal Voice AI Assistant Overlay
            if (showVoiceOverlay) {
                VoiceAssistantOverlay(
                    state = voiceState,
                    currentVolume = currentVolume,
                    isMuted = isMuted,
                    isPermissionGranted = permissionUiState.isGranted,
                    onRequestPermission = {
                        onRequestMicPermission {
                            voiceAssistant.startListening { action -> handleVoiceAction(action) }
                        }
                    },
                    onStartListening = {
                        onRequestMicPermission {
                            voiceAssistant.startListening { action -> handleVoiceAction(action) }
                        }
                    },
                    onStopListening = {
                        voiceAssistant.stopListening()
                    },
                    onExecuteCommand = { cmd ->
                        val action = voiceAssistant.parseCommand(cmd)
                        voiceAssistant.setManualInputFeedback(cmd, action)
                        handleVoiceAction(action)
                    },
                    onDismiss = {
                        voiceAssistant.stopListening()
                        showVoiceOverlay = false
                    }
                )
            }

            // 3. Synced Lyrics & AI Chatbot Sheet
            if (showLyricsSheet) {
                LyricsChatbotSheet(
                    song = currentSong,
                    currentPositionMs = currentPositionMs,
                    messages = chatMessages,
                    onSeekToTimestamp = { audioEngine.seekTo(it) },
                    onSendMessage = { q ->
                        val activeLine = currentSong.lyrics.lastOrNull { it.timestampMs <= currentPositionMs }
                        lyricsChatbot.sendMessage(q, currentSong, activeLine)
                    },
                    onDownloadNotes = { notesText ->
                        downloadedAssets.add(
                            DownloadedAsset(
                                id = "notes_${System.currentTimeMillis()}",
                                title = "${currentSong.title} — Lyrics Notes Sheet",
                                sourceTrack = currentSong.title,
                                type = "PDF/MD Study Sheet",
                                fileSizeMb = 0.8f
                            )
                        )
                        scope.launch { snackbarHostState.showSnackbar("Downloaded '${currentSong.title}' Lyric Notes Sheet to Storage Vault") }
                    },
                    onDismiss = { showLyricsSheet = false }
                )
            }

            // 4. Audio Trimmer Studio Dialog
            if (showTrimmerDialog) {
                AudioTrimmerDialog(
                    song = currentSong,
                    initialStem = stemForTrimmer,
                    isPlayingPreview = isLoopPreviewing,
                    onStartLoopPreview = { start, end -> audioEngine.startLoopPreview(start, end) },
                    onStopLoopPreview = { audioEngine.stopLoopPreview() },
                    onExportCrop = { title, startMs, endMs, isRingtone ->
                        audioEngine.stopLoopPreview()
                        downloadedAssets.add(
                            DownloadedAsset(
                                id = "crop_${System.currentTimeMillis()}",
                                title = title,
                                sourceTrack = currentSong.title,
                                type = if (isRingtone) "Device Ringtone" else "HQ MP3 Clip",
                                fileSizeMb = 4.2f
                            )
                        )
                        scope.launch {
                            snackbarHostState.showSnackbar(
                                if (isRingtone) "Exported '$title' and assigned as Ringtone!" else "Saved '$title' to Downloads!"
                            )
                        }
                    },
                    onDismiss = {
                        audioEngine.stopLoopPreview()
                        showTrimmerDialog = false
                    }
                )
            }

            // 5. Senior PM & Mobile Architect PRD & Tech Document Sheet
            if (showPrdSheet) {
                PrdArchitectureSheet(
                    onDismiss = { showPrdSheet = false }
                )
            }

            // 6. Microphone Permission Rationale Dialog
            if (permissionUiState.showRationaleDialog) {
                MicrophoneRationaleDialog(
                    onGrantClick = {
                        onLaunchDirectMicRequest()
                    },
                    onDismiss = {
                        permissionManager.dismissRationale()
                    }
                )
            }

            // 7. Microphone Permanently Denied Settings Dialog
            if (permissionUiState.showSettingsDialog) {
                MicrophoneSettingsDialog(
                    onOpenSettingsClick = {
                        permissionManager.openAppSettings(context)
                    },
                    onDismiss = {
                        permissionManager.dismissSettingsDialog()
                    }
                )
            }
        }
    }
}
