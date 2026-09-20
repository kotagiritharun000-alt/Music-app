import React, { useState, useEffect, useRef } from 'react';
import { SAMPLE_SONGS, SAMPLE_PLAYLISTS } from './data/sampleCatalog';
import { ProceduralAudioEngine } from './audio/proceduralAudioEngine';
import { VoiceAiAssistant } from './ai/voiceAiAssistant';
import { LyricsAiChatbot } from './ai/lyricsAiChatbot';
import { Header } from './components/Header';
import { ArtworkVisualizer } from './components/ArtworkVisualizer';
import { FrequencySpectrumVisualizer } from './components/FrequencySpectrumVisualizer';
import { PlayerControls } from './components/PlayerControls';
import { LyricsCard } from './components/LyricsCard';
import { StemMixer } from './components/StemMixer';
import { SpatialAudioModal } from './components/SpatialAudioModal';
import { AudioTrimmerModal } from './components/AudioTrimmerModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { LyricsChatbotModal } from './components/LyricsChatbotModal';
import { PrdArchitectureModal } from './components/PrdArchitectureModal';
import { JioSaavnHubModal } from './components/JioSaavnHubModal';
import { DeviceMusicHubModal } from './components/DeviceMusicHubModal';
import { MobileApkModal } from './components/MobileApkModal';
import { BgmGeneratorModal } from './components/BgmGeneratorModal';
import { FullLyricsModal } from './components/FullLyricsModal';
import { LibraryView } from './components/LibraryView';
import {
  DeviceTrackRecord,
  loadAllDeviceTracks,
  saveDeviceTracks,
  deleteDeviceTrack,
  clearAllDeviceTracks
} from './services/deviceMusicStorage';
import { convertDeviceTrackToSong } from './services/deviceMusicService';
import {
  AudioSpatialConfig,
  BgmStem,
  ChatMessage,
  DownloadedAsset,
  LocalImportedFile,
  RoomPreset,
  Song,
  StemCategory,
  TrimConfig,
  VoiceAction,
  VoiceAssistantState
} from './types';
import { CheckCircle2, Upload } from 'lucide-react';

const ALL_INITIAL_SONGS: Song[] = [...SAMPLE_SONGS];

export const App: React.FC = () => {
  // Master Catalog State (dynamically expandable with local & device tracks)
  const [songs, setSongs] = useState<Song[]>(ALL_INITIAL_SONGS);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const currentSong = songs[currentSongIndex] || ALL_INITIAL_SONGS[0];

  // Engine & Helper Instances
  const audioEngineRef = useRef<ProceduralAudioEngine | null>(null);
  const voiceAssistantRef = useRef<VoiceAiAssistant | null>(null);
  const lyricsChatbotRef = useRef<LyricsAiChatbot | null>(null);

  // Playback States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPositionMs, setCurrentPositionMs] = useState<number>(0);
  const [frequencyBands, setFrequencyBands] = useState<number[]>(Array(16).fill(0.15));
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [favoriteSongIds, setFavoriteSongIds] = useState<Set<string>>(new Set(['muse_track_1', 'muse_track_2']));

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  // Stems States
  const [stemMuteStates, setStemMuteStates] = useState<Record<StemCategory, boolean>>({
    [StemCategory.MAIN_MELODY]: false,
    [StemCategory.BASSLINE_GROOVE]: false,
    [StemCategory.DRUMS_PERCUSSION]: false,
    [StemCategory.AMBIENT_PAD]: false,
    [StemCategory.CLIMAX_SOLO]: false
  });

  const [stemSoloStates, setStemSoloStates] = useState<Record<StemCategory, boolean>>({
    [StemCategory.MAIN_MELODY]: false,
    [StemCategory.BASSLINE_GROOVE]: false,
    [StemCategory.DRUMS_PERCUSSION]: false,
    [StemCategory.AMBIENT_PAD]: false,
    [StemCategory.CLIMAX_SOLO]: false
  });

  // Spatial Audio Configuration
  const [spatialConfig, setSpatialConfig] = useState<AudioSpatialConfig>({
    isSpatialEnabled: true,
    isDolbyAtmosEnabled: true,
    roomPreset: RoomPreset.ATMOS_360,
    bassBoost: 0.65,
    vocalClarity: 0.80,
    azimuthAngleDegrees: 0,
    distanceMeters: 1.2,
    isHeadTrackingActive: true
  });

  // Voice AI & Chatbot States
  const [voiceState, setVoiceState] = useState<VoiceAssistantState>({
    isListening: false,
    isAlwaysListeningEnabled: false,
    recognizedText: '',
    assistantFeedback: "Listening for 'Hey Muse' or voice instructions...",
    lastAction: null,
    confidence: 0.95
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Library & Assets States
  const [activeView, setActiveView] = useState<'player' | 'library'>('player');
  const [savedLocalFiles, setSavedLocalFiles] = useState<LocalImportedFile[]>([]);
  const [downloadedAssets, setDownloadedAssets] = useState<DownloadedAsset[]>([
    {
      id: 'asset_init_1',
      title: 'Neon Horizon Lead Hook (Ringtone)',
      sourceTrack: 'Neon Horizon',
      type: 'Ringtone (30s)',
      fileSizeMb: 5.2,
      dateDownloaded: 'Sep 19, 2026'
    }
  ]);

  // Modal Dialogs States
  const [isSpatialOpen, setIsSpatialOpen] = useState<boolean>(false);
  const [isTrimmerOpen, setIsTrimmerOpen] = useState<boolean>(false);
  const [trimmerStem, setTrimmerStem] = useState<BgmStem | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isLyricsChatOpen, setIsLyricsChatOpen] = useState<boolean>(false);
  const [isPrdOpen, setIsPrdOpen] = useState<boolean>(false);
  const [isJioSaavnOpen, setIsJioSaavnOpen] = useState<boolean>(false);
  const [isDeviceMusicOpen, setIsDeviceMusicOpen] = useState<boolean>(false);
  const [deviceTracks, setDeviceTracks] = useState<DeviceTrackRecord[]>([]);
  const [isMobileApkOpen, setIsMobileApkOpen] = useState<boolean>(false);
  const [isBgmGeneratorOpen, setIsBgmGeneratorOpen] = useState<boolean>(false);
  const [isFullLyricsOpen, setIsFullLyricsOpen] = useState<boolean>(false);
  const [isBgmModeActive, setIsBgmModeActive] = useState<boolean>(false);
  const [isWindowDragActive, setIsWindowDragActive] = useState<boolean>(false);

  // Load stored device tracks on startup from IndexedDB
  useEffect(() => {
    const loadStoredTracks = async () => {
      try {
        const stored = await loadAllDeviceTracks();
        setDeviceTracks(stored);
      } catch (err) {
        console.error('Failed to load device tracks:', err);
      }
    };
    loadStoredTracks();
  }, []);

  const handleAddDeviceTracks = async (newTracks: DeviceTrackRecord[]) => {
    try {
      await saveDeviceTracks(newTracks);
      const all = await loadAllDeviceTracks();
      setDeviceTracks(all);
      showToast(
        'Device Music Library Updated',
        `${newTracks.length} local audio track${newTracks.length > 1 ? 's' : ''} stored and ready to play.`
      );
    } catch (e) {
      console.error('Failed to save device tracks:', e);
    }
  };

  const handleDeleteDeviceTrack = async (id: string) => {
    try {
      await deleteDeviceTrack(id);
      setDeviceTracks((prev) => prev.filter((t) => t.id !== id));
      showToast('Track Removed', 'Audio track removed from local library.');
    } catch (e) {
      console.error('Failed to delete track:', e);
    }
  };

  const handleClearAllDeviceTracks = async () => {
    try {
      await clearAllDeviceTracks();
      setDeviceTracks([]);
      showToast('Device Library Cleared', 'All local audio tracks removed.');
    } catch (e) {
      console.error('Failed to clear tracks:', e);
    }
  };

  const handlePlayDeviceTrack = (record: DeviceTrackRecord) => {
    const song = convertDeviceTrackToSong(record);
    handleLoadCustomSong(song);
  };

  const showToast = (title: string, subtitle: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleBgmMode = () => {
    setIsBgmModeActive((prev) => {
      const next = !prev;
      setStemMuteStates((stems) => ({
        ...stems,
        [StemCategory.MAIN_MELODY]: next,
        [StemCategory.CLIMAX_SOLO]: next
      }));
      showToast(
        next ? 'BGM Instrumental Mode Active' : 'Standard Vocal Mode',
        next ? 'Lead vocals attenuated • Dolby Atmos instruments highlighted' : 'Full vocals restored'
      );
      return next;
    });
  };

  const handleApplyBgmToPlayer = (bgmUrl: string, bgmBlob: Blob) => {
    const updatedSong: Song = {
      ...currentSong,
      title: `${currentSong.title} (Pure BGM Instrumental)`,
      bgmUrl,
      bgmBlob,
      hasBgmReady: true,
      audioUrl: bgmUrl
    };
    setSongs((prev) => prev.map((s, idx) => (idx === currentSongIndex ? updatedSong : s)));
    if (audioEngineRef.current) {
      audioEngineRef.current.loadSong(updatedSong);
      audioEngineRef.current.play();
    }
    setIsPlaying(true);
    showToast('BGM Applied to Player', 'Dolby Atmos 360 instrumental track is now active');
  };

  const handleUpdateLyrics = (newLyrics: any[]) => {
    const updatedSong: Song = {
      ...currentSong,
      lyrics: newLyrics
    };
    setSongs((prev) => prev.map((s, idx) => (idx === currentSongIndex ? updatedSong : s)));
    showToast('Lyrics Updated', 'New synchronized lyrics applied to track');
  };

  // Play a song from NaaSongs, SenSongs, or Local file
  const handleLoadCustomSong = (newSong: Song) => {
    // Position newSong at front and ensure it is selected at index 0
    setSongs(prev => {
      const filtered = prev.filter(s => s.id !== newSong.id);
      return [newSong, ...filtered];
    });

    setCurrentSongIndex(0);

    if (audioEngineRef.current) {
      audioEngineRef.current.loadSong(newSong);
      audioEngineRef.current.resetStems();
      audioEngineRef.current.play();
    }

    if (lyricsChatbotRef.current) {
      lyricsChatbotRef.current.initializeForSong(newSong);
    }

    setIsPlaying(true);
    setActiveView('player');

    showToast(
      `Now Playing: ${newSong.title}`,
      newSong.sourcePortal
        ? `${newSong.sourcePortal} Master • Dolby Atmos 360`
        : 'Local Audio File • Real Audio Playback'
    );
  };

  const handleSaveLocalFile = (file: LocalImportedFile) => {
    setSavedLocalFiles(prev => [file, ...prev.filter(f => f.id !== file.id)]);
  };

  const handleDeleteLocalFile = (id: string) => {
    setSavedLocalFiles(prev => prev.filter(f => f.id !== id));
  };

  // Initialize Engines
  useEffect(() => {
    const engine = new ProceduralAudioEngine();
    audioEngineRef.current = engine;
    engine.loadSong(currentSong);

    engine.onStateChange = (state) => {
      setIsPlaying(state.isPlaying);
      setCurrentPositionMs(state.currentPositionMs);
      setFrequencyBands(state.frequencyBands);
    };

    const voice = new VoiceAiAssistant();
    voiceAssistantRef.current = voice;
    voice.setCallbacks(
      (action) => handleVoiceAction(action),
      (vState) => setVoiceState(vState)
    );

    const chat = new LyricsAiChatbot();
    lyricsChatbotRef.current = chat;
    chat.initializeForSong(currentSong);
    chat.onMessagesUpdated = (msgs) => setChatMessages(msgs);

    return () => {
      engine.destroy();
    };
  }, []);

  // Window drag and drop audio file listener
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsWindowDragActive(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.clientX === 0 || e.clientY === 0) {
        setIsWindowDragActive(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsWindowDragActive(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('audio/') || /\.(mp3|wav|m4a|flac|aac|ogg)$/i.test(file.name)) {
          const objectUrl = URL.createObjectURL(file);
          const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/\[.*?\]|\(.*?\)/g, ' ').trim();
          const importedSong: Song = {
            id: `dropped_${Date.now()}`,
            title: cleanTitle || 'Dropped Audio Song',
            artist: 'Local Audio Master',
            album: `Downloaded Songs (${file.name})`,
            durationMs: 180000,
            bpm: 120,
            key: 'C Major',
            genre: 'Downloaded Audio Track',
            gradientStart: '#FF5014',
            gradientEnd: '#3B1202',
            isDolbyAtmos: true,
            isHiResLossless: true,
            bitDepth: 24,
            sampleRateKhz: 96,
            audioUrl: objectUrl,
            sourcePortal: 'LocalFile',
            stems: [
              {
                id: 'dropped_stem_1',
                name: `${cleanTitle} (Stereo)`,
                category: StemCategory.MAIN_MELODY,
                durationMs: 180000,
                waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.7 + 0.3),
                isRingtoneRecommended: true,
                description: 'Full master stereo channel with Dolby Atmos 360 panner.'
              },
              {
                id: 'dropped_stem_2',
                name: 'Bass & Sub-Harmonics',
                category: StemCategory.BASSLINE_GROOVE,
                durationMs: 180000,
                waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.8 + 0.2),
                isRingtoneRecommended: false,
                description: 'Low-frequency bass foundation.'
              },
              {
                id: 'dropped_stem_3',
                name: 'Percussive Rhythm',
                category: StemCategory.DRUMS_PERCUSSION,
                durationMs: 180000,
                waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.6 + 0.4),
                isRingtoneRecommended: true,
                description: 'Rhythm and drum transients.'
              },
              {
                id: 'dropped_stem_4',
                name: 'Dolby Atmos Spatial Stage',
                category: StemCategory.AMBIENT_PAD,
                durationMs: 180000,
                waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.5 + 0.2),
                isRingtoneRecommended: false,
                description: '360 room reflections.'
              },
              {
                id: 'dropped_stem_5',
                name: 'Vocal Clarity Solo',
                category: StemCategory.CLIMAX_SOLO,
                durationMs: 180000,
                waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.9 + 0.1),
                isRingtoneRecommended: true,
                description: 'Climax segment for ringtone export.'
              }
            ],
            lyrics: [
              {
                timestampMs: 0,
                text: `Playing dropped file: "${cleanTitle}"`,
                translation: 'Local Audio File Played Directly in Muse',
                aiNote: 'Dolby Atmos 360 spatialization and bass boost active.'
              }
            ],
            description: `Imported audio track (${file.name}) loaded directly into Muse audio player.`
          };

          handleLoadCustomSong(importedSong);
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Update current song in engine when track changes
  const switchSong = (index: number, autoPlay: boolean = true) => {
    const targetIndex = (index + songs.length) % songs.length;
    setCurrentSongIndex(targetIndex);
    const newSong = songs[targetIndex];

    if (audioEngineRef.current) {
      audioEngineRef.current.loadSong(newSong);
      audioEngineRef.current.resetStems();
      setStemMuteStates({
        [StemCategory.MAIN_MELODY]: false,
        [StemCategory.BASSLINE_GROOVE]: false,
        [StemCategory.DRUMS_PERCUSSION]: false,
        [StemCategory.AMBIENT_PAD]: false,
        [StemCategory.CLIMAX_SOLO]: false
      });
      setStemSoloStates({
        [StemCategory.MAIN_MELODY]: false,
        [StemCategory.BASSLINE_GROOVE]: false,
        [StemCategory.DRUMS_PERCUSSION]: false,
        [StemCategory.AMBIENT_PAD]: false,
        [StemCategory.CLIMAX_SOLO]: false
      });

      if (autoPlay) {
        audioEngineRef.current.play();
      }
    }

    if (lyricsChatbotRef.current) {
      lyricsChatbotRef.current.initializeForSong(newSong);
    }
  };

  // Playback Control Handlers
  const handleTogglePlayPause = () => {
    if (!audioEngineRef.current) return;
    if (isPlaying) {
      audioEngineRef.current.pause();
    } else {
      audioEngineRef.current.play();
    }
  };

  const handleNextSong = () => switchSong(currentSongIndex + 1);
  const handlePreviousSong = () => switchSong(currentSongIndex - 1);
  const handleRestartSong = () => {
    if (audioEngineRef.current) {
      audioEngineRef.current.seekTo(0);
      if (!isPlaying) audioEngineRef.current.play();
    }
  };

  const handleSeekTo = (ms: number) => {
    if (audioEngineRef.current) {
      audioEngineRef.current.seekTo(ms);
      setCurrentPositionMs(ms);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) setIsMuted(false);
    if (audioEngineRef.current) {
      audioEngineRef.current.setVolume(newVol);
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioEngineRef.current) {
      audioEngineRef.current.setMute(nextMute);
    }
  };

  const handleToggleFavorite = () => {
    const next = new Set(favoriteSongIds);
    if (next.has(currentSong.id)) {
      next.delete(currentSong.id);
    } else {
      next.add(currentSong.id);
    }
    setFavoriteSongIds(next);
  };

  // Stem Mixer Handlers
  const handleToggleStemMute = (category: StemCategory) => {
    const nextState = !stemMuteStates[category];
    const updated = { ...stemMuteStates, [category]: nextState };
    setStemMuteStates(updated);
    if (audioEngineRef.current) {
      audioEngineRef.current.setStemMute(category, nextState);
    }
  };

  const handleToggleStemSolo = (category: StemCategory) => {
    const nextSolo = !stemSoloStates[category];
    const updated = { ...stemSoloStates, [category]: nextSolo };
    setStemSoloStates(updated);
    if (audioEngineRef.current) {
      audioEngineRef.current.setStemSolo(category, nextSolo);
    }
  };

  const handleResetStems = () => {
    setStemMuteStates({
      [StemCategory.MAIN_MELODY]: false,
      [StemCategory.BASSLINE_GROOVE]: false,
      [StemCategory.DRUMS_PERCUSSION]: false,
      [StemCategory.AMBIENT_PAD]: false,
      [StemCategory.CLIMAX_SOLO]: false
    });
    setStemSoloStates({
      [StemCategory.MAIN_MELODY]: false,
      [StemCategory.BASSLINE_GROOVE]: false,
      [StemCategory.DRUMS_PERCUSSION]: false,
      [StemCategory.AMBIENT_PAD]: false,
      [StemCategory.CLIMAX_SOLO]: false
    });
    if (audioEngineRef.current) {
      audioEngineRef.current.resetStems();
    }
  };

  // Spatial Audio Handlers
  const handleSpatialConfigChange = (newConfig: AudioSpatialConfig) => {
    setSpatialConfig(newConfig);
    if (audioEngineRef.current) {
      audioEngineRef.current.updateSpatialConfig(newConfig);
    }
  };

  // Voice Assistant Commands Dispatcher
  const handleVoiceAction = (action: VoiceAction) => {
    switch (action.type) {
      case 'PLAY':
        if (!isPlaying && audioEngineRef.current) audioEngineRef.current.play();
        break;
      case 'PAUSE':
        if (isPlaying && audioEngineRef.current) audioEngineRef.current.pause();
        break;
      case 'NEXT_SONG':
        handleNextSong();
        break;
      case 'PREVIOUS_SONG':
        handlePreviousSong();
        break;
      case 'RESTART_SONG':
        handleRestartSong();
        break;
      case 'SET_VOLUME':
        handleVolumeChange(action.targetVolume);
        break;
      case 'ADJUST_VOLUME_RELATIVE':
        handleVolumeChange(Math.max(0, Math.min(100, volume + action.delta)));
        break;
      case 'MUTE':
        if (!isMuted) handleToggleMute();
        break;
      case 'UNMUTE':
        if (isMuted) handleToggleMute();
        break;
      case 'SET_SPATIAL_AUDIO':
        handleSpatialConfigChange({ ...spatialConfig, isSpatialEnabled: action.enabled });
        break;
      case 'SET_DOLBY_ATMOS':
        handleSpatialConfigChange({ ...spatialConfig, isDolbyAtmosEnabled: action.enabled });
        break;
      case 'OPEN_STEM_EXTRACTOR':
        break;
      case 'OPEN_AUDIO_TRIMMER':
        setIsTrimmerOpen(true);
        break;
      case 'OPEN_LYRICS_CHAT':
        setIsLyricsChatOpen(true);
        break;
      case 'SEARCH_AND_PLAY': {
        const query = action.query.toLowerCase();
        const match = songs.find(
          s => s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query)
        );
        if (match) {
          handleLoadCustomSong(match);
        }
        break;
      }
      default:
        break;
    }
  };

  // Trimmer & Tone Export Handlers
  const handleOpenTrimmerForStem = (stem: BgmStem) => {
    setTrimmerStem(stem);
    setIsTrimmerOpen(true);
  };

  const handleExportTone = (config: TrimConfig, durationSec: number) => {
    if (!audioEngineRef.current) return;
    const wavBlob = audioEngineRef.current.generateExportWavBlob(durationSec);

    const safeTitle = `${currentSong.title.replace(/\s+/g, '_')}_${config.targetType.replace(/\s+/g, '_')}`;
    const filename = `${safeTitle}.wav`;

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const newAsset: DownloadedAsset = {
      id: `asset_${Date.now()}`,
      title: `${currentSong.title} (${config.targetType})`,
      sourceTrack: currentSong.title,
      type: config.targetType,
      fileSizeMb: parseFloat((wavBlob.size / (1024 * 1024)).toFixed(2)),
      dateDownloaded: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      blobData: wavBlob
    };

    setDownloadedAssets((prev) => [newAsset, ...prev]);
    showToast('Ringtone Exported Successfully', `${filename} ready for phone customization`);
  };

  const handleDeleteAsset = (id: string) => {
    setDownloadedAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDownloadAsset = (asset: DownloadedAsset) => {
    const blob = asset.blobData || audioEngineRef.current?.generateExportWavBlob(30);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.title.replace(/[^a-zA-Z0-9]/g, '_')}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chatbot Handlers
  const handleSendChatMessage = async (text: string) => {
    if (!lyricsChatbotRef.current) return;
    const activeLyric = currentSong.lyrics.reduce((acc, lyric) => {
      return currentPositionMs >= lyric.timestampMs ? lyric : acc;
    }, currentSong.lyrics[0]);
    lyricsChatbotRef.current.sendMessage(text, currentSong, activeLyric);
  };

  const handleDownloadNotesSheet = () => {
    if (!lyricsChatbotRef.current) return;
    const markdownContent = lyricsChatbotRef.current.generateLyricsNotesSheet(currentSong);
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSong.title.replace(/\s+/g, '_')}_Lyrics_Intelligence_Notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0502] text-white flex flex-col font-sans relative selection:bg-[#FF5014] selection:text-white">
      {/* Drag & Drop Visual Overlay */}
      {isWindowDragActive && (
        <div className="fixed inset-0 z-50 bg-[#FF5014]/20 backdrop-blur-sm border-4 border-dashed border-[#FF5014] flex flex-col items-center justify-center pointer-events-none animate-in fade-in">
          <div className="p-6 rounded-3xl bg-[#110804] border border-[#FF5014] shadow-2xl flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FF5014]/30 text-[#FF7A45] flex items-center justify-center animate-bounce">
              <Upload className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Drop to Play in Muse</h2>
            <p className="text-xs text-[#8E9299]">Instant playback with Dolby Atmos 360 & Stem extraction</p>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#160B06] border border-[#FF5014]/60 px-4 py-2.5 rounded-2xl shadow-2xl shadow-[#FF5014]/30 flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-8 h-8 rounded-xl bg-[#FF5014]/20 text-[#FF7A45] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{toastMessage.title}</h4>
            <p className="text-[11px] text-[#FF7A45]">{toastMessage.subtitle}</p>
          </div>
        </div>
      )}

      {/* Persistent Navigation Header */}
      <Header
        currentSong={currentSong}
        isPlaying={isPlaying}
        activeView={activeView}
        onToggleView={() => setActiveView((v) => (v === 'player' ? 'library' : 'player'))}
        onOpenPrd={() => setIsPrdOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
        onOpenJioSaavn={() => setIsJioSaavnOpen(true)}
        onOpenDeviceMusic={() => setIsDeviceMusicOpen(true)}
        deviceTrackCount={deviceTracks.length}
        onOpenMobileApk={() => setIsMobileApkOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {activeView === 'player' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Artwork, Live Spectrum Visualizer, and Primary Player Controls */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-6">
              {/* Dynamic Generative Artwork Canvas */}
              <ArtworkVisualizer
                song={currentSong}
                isPlaying={isPlaying}
                spatialConfig={spatialConfig}
                onOpenSpatial={() => setIsSpatialOpen(true)}
              />

              {/* 16-Band Live Frequency Spectrum Analyzer */}
              <FrequencySpectrumVisualizer
                frequencyBands={frequencyBands}
                isPlaying={isPlaying}
              />

              {/* Comprehensive Audio Controls, Timeline & Quick Actions */}
              <PlayerControls
                currentSong={currentSong}
                isPlaying={isPlaying}
                currentPositionMs={currentPositionMs}
                volume={volume}
                isMuted={isMuted}
                isFavorite={favoriteSongIds.has(currentSong.id)}
                onTogglePlayPause={handleTogglePlayPause}
                onNextSong={handleNextSong}
                onPreviousSong={handlePreviousSong}
                onRestartSong={handleRestartSong}
                onSeekTo={handleSeekTo}
                onVolumeChange={handleVolumeChange}
                onToggleMute={handleToggleMute}
                onToggleFavorite={handleToggleFavorite}
                onOpenSpatial={() => setIsSpatialOpen(true)}
                onOpenTrimmer={() => setIsTrimmerOpen(true)}
                onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
              />
            </div>

            {/* Right Column: Synced Lyrics Card & Multi-Stem Mixer */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-6">
              {/* Real-time Synced Lyrics with AI Annotations */}
              <LyricsCard
                currentSong={currentSong}
                currentPositionMs={currentPositionMs}
                onOpenLyricsChat={() => setIsLyricsChatOpen(true)}
                onOpenFullLyrics={() => setIsFullLyricsOpen(true)}
                onSeekTo={handleSeekTo}
              />

              {/* Multi-Stem Segment Isolation Carousel & Mixer */}
              <StemMixer
                stems={currentSong.stems}
                stemMuteStates={stemMuteStates}
                stemSoloStates={stemSoloStates}
                onToggleStemMute={handleToggleStemMute}
                onToggleStemSolo={handleToggleStemSolo}
                onResetStems={handleResetStems}
                onTrimStem={handleOpenTrimmerForStem}
                onOpenBgmGenerator={() => setIsBgmGeneratorOpen(true)}
                isBgmModeActive={isBgmModeActive}
                onToggleBgmMode={handleToggleBgmMode}
                onDownloadStem={(stem) => {
                  if (audioEngineRef.current) {
                    const blob = audioEngineRef.current.generateExportWavBlob(30);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${stem.name.replace(/\s+/g, '_')}_stem.wav`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }
                }}
              />
            </div>
          </div>
        ) : (
          /* Library View: Playlists, All Tracks, Exported Ringtones */
          <LibraryView
            songs={songs}
            playlists={SAMPLE_PLAYLISTS}
            currentSong={currentSong}
            isPlaying={isPlaying}
            downloadedAssets={downloadedAssets}
            deviceTracks={deviceTracks}
            onSelectSong={(song) => {
              const idx = songs.findIndex((s) => s.id === song.id);
              if (idx !== -1) {
                switchSong(idx, true);
                setActiveView('player');
              } else {
                handleLoadCustomSong(song);
              }
            }}
            onDeleteAsset={handleDeleteAsset}
            onDownloadAsset={handleDownloadAsset}
            onOpenJioSaavn={() => setIsJioSaavnOpen(true)}
            onOpenDeviceMusic={() => setIsDeviceMusicOpen(true)}
            onPlayDeviceTrack={handlePlayDeviceTrack}
          />
        )}
      </main>

      {/* Floating Hey Muse Voice Assistant Trigger Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-30">
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#FF5014] to-[#FF7A45] text-white shadow-2xl shadow-[#FF5014]/50 border border-white/20 hover:scale-105 active:scale-95 transition-all"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span className="font-bold text-xs tracking-wide">Hey Muse</span>
        </button>
      </div>

      {/* Modal Dialogs */}
      {isSpatialOpen && (
        <SpatialAudioModal
          config={spatialConfig}
          onConfigChanged={handleSpatialConfigChange}
          onDismiss={() => setIsSpatialOpen(false)}
        />
      )}

      {isTrimmerOpen && (
        <AudioTrimmerModal
          currentSong={currentSong}
          initialStem={trimmerStem}
          onPreviewLoop={(start, end) => {
            if (audioEngineRef.current) audioEngineRef.current.startLoopPreview(start, end);
          }}
          onStopLoop={() => {
            if (audioEngineRef.current) audioEngineRef.current.stopLoopPreview();
          }}
          onExportTone={handleExportTone}
          onDismiss={() => setIsTrimmerOpen(false)}
        />
      )}

      {isVoiceOpen && (
        <VoiceAssistantModal
          state={voiceState}
          onStartListening={() => voiceAssistantRef.current?.startListening()}
          onStopListening={() => voiceAssistantRef.current?.stopListening()}
          onExecuteCommand={(cmd) => voiceAssistantRef.current?.parseAndExecute(cmd)}
          onDismiss={() => setIsVoiceOpen(false)}
        />
      )}

      {isLyricsChatOpen && (
        <LyricsChatbotModal
          currentSong={currentSong}
          currentLyric={currentSong.lyrics.reduce((acc, lyric) => {
            return currentPositionMs >= lyric.timestampMs ? lyric : acc;
          }, currentSong.lyrics[0])}
          messages={chatMessages}
          onSendMessage={handleSendChatMessage}
          onDownloadNotesSheet={handleDownloadNotesSheet}
          onDismiss={() => setIsLyricsChatOpen(false)}
        />
      )}

      {isPrdOpen && (
        <PrdArchitectureModal onDismiss={() => setIsPrdOpen(false)} />
      )}

      {isJioSaavnOpen && (
        <JioSaavnHubModal
          currentSongId={currentSong.id}
          onSelectSong={handleLoadCustomSong}
          onDismiss={() => setIsJioSaavnOpen(false)}
        />
      )}

      {isDeviceMusicOpen && (
        <DeviceMusicHubModal
          deviceTracks={deviceTracks}
          currentSongId={currentSong.id}
          onSelectSong={handleLoadCustomSong}
          onAddTracks={handleAddDeviceTracks}
          onDeleteTrack={handleDeleteDeviceTrack}
          onClearAllTracks={handleClearAllDeviceTracks}
          onDismiss={() => setIsDeviceMusicOpen(false)}
        />
      )}

      {isMobileApkOpen && (
        <MobileApkModal onDismiss={() => setIsMobileApkOpen(false)} />
      )}

      {isBgmGeneratorOpen && (
        <BgmGeneratorModal
          currentSong={currentSong}
          onApplyBgmToPlayer={handleApplyBgmToPlayer}
          onDismiss={() => setIsBgmGeneratorOpen(false)}
        />
      )}

      {isFullLyricsOpen && (
        <FullLyricsModal
          currentSong={currentSong}
          currentPositionMs={currentPositionMs}
          onSeekTo={handleSeekTo}
          onUpdateLyrics={handleUpdateLyrics}
          onDismiss={() => setIsFullLyricsOpen(false)}
        />
      )}
    </div>
  );
};
