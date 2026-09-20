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
import { BrandLogoModal } from './components/BrandLogoModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { SleepModeOverlay } from './components/SleepModeOverlay';
import { LibraryView } from './components/LibraryView';
import {
  DeviceTrackRecord,
  loadAllDeviceTracks,
  saveDeviceTracks,
  deleteDeviceTrack,
  clearAllDeviceTracks
} from './services/deviceMusicStorage';
import { convertDeviceTrackToSong } from './services/deviceMusicService';
import { searchJioSaavn, fetchJioSaavnLyrics, fetchLatestReleases } from './services/jioSaavnService';
import { fetchAccurateLyrics } from './services/lyricsService';
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

  // Muse Stream Queue & Navigation State
  const [museStreamQueue, setMuseStreamQueue] = useState<Song[]>([]);
  const [isMuseStreamMode, setIsMuseStreamMode] = useState<boolean>(false);

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
  const [isBrandLogoOpen, setIsBrandLogoOpen] = useState<boolean>(false);
  const [isBgmModeActive, setIsBgmModeActive] = useState<boolean>(false);
  const [isWindowDragActive, setIsWindowDragActive] = useState<boolean>(false);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState<boolean>(false);

  // Sleep Timer & Sleep Mode State
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState<boolean>(false);
  const [sleepTimerRemainingSec, setSleepTimerRemainingSec] = useState<number | null>(null);
  const [sleepTimerTotalSec, setSleepTimerTotalSec] = useState<number | null>(null);
  const [isSleepModeActive, setIsSleepModeActive] = useState<boolean>(false);
  const [sleepModeTriggeredAt, setSleepModeTriggeredAt] = useState<Date | null>(null);
  const [fadeAudioOnSleep, setFadeAudioOnSleep] = useState<boolean>(true);
  const originalVolumeRef = useRef<number>(85);

  // High-precision lyrics synchronizer across verified catalog, LRCLIB and AI models
  const ensureSongLyrics = async (targetSong: Song, customQuery?: string) => {
    if (!targetSong) return;
    setIsLoadingLyrics(true);
    try {
      const result = await fetchAccurateLyrics(targetSong, customQuery);
      if (result && result.lyrics && result.lyrics.length > 0) {
        setSongs(prevSongs => prevSongs.map(s => {
          if (s.id === targetSong.id) {
            return {
              ...s,
              lyrics: result.lyrics,
              lyricsSource: result.source,
              isLyricsSynced: result.isSynced,
              fullLyricsText: result.fullLyricsText
            };
          }
          return s;
        }));

        if (lyricsChatbotRef.current) {
          lyricsChatbotRef.current.initializeForSong({
            ...targetSong,
            lyrics: result.lyrics,
            fullLyricsText: result.fullLyricsText
          });
        }
      }
    } catch (err) {
      console.warn('ensureSongLyrics failed:', err);
    } finally {
      setIsLoadingLyrics(false);
    }
  };

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

    // Preload Muse Stream trending releases for instant Next/Previous queue navigation
    fetchLatestReleases().then((releases) => {
      if (releases && releases.length > 0) {
        setMuseStreamQueue(releases);
      }
    }).catch((err) => console.warn('Muse Stream queue prefetch:', err));
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

  // Sleep Timer Countdown Processor
  useEffect(() => {
    if (sleepTimerRemainingSec === null) return;

    if (sleepTimerRemainingSec <= 0) {
      if (audioEngineRef.current) {
        audioEngineRef.current.pause();
      }
      setIsPlaying(false);
      setIsSleepModeActive(true);
      setSleepModeTriggeredAt(new Date());
      setSleepTimerRemainingSec(null);
      setSleepTimerTotalSec(null);

      // Restore original volume if faded
      if (originalVolumeRef.current !== undefined) {
        setVolume(originalVolumeRef.current);
        if (audioEngineRef.current) {
          audioEngineRef.current.setVolume(originalVolumeRef.current);
        }
      }

      showToast('Sleep Mode Active', 'Sleep timer elapsed. Audio playback paused safely.');
      return;
    }

    // Optional gentle volume fade out in last 30 seconds
    if (fadeAudioOnSleep && sleepTimerRemainingSec <= 30 && sleepTimerRemainingSec > 0) {
      const fadeRatio = sleepTimerRemainingSec / 30;
      const baseVol = originalVolumeRef.current || 85;
      const fadedVol = Math.max(0, Math.round(baseVol * fadeRatio));
      if (audioEngineRef.current) {
        audioEngineRef.current.setVolume(fadedVol);
      }
    }

    const timerId = setInterval(() => {
      setSleepTimerRemainingSec((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [sleepTimerRemainingSec, fadeAudioOnSleep]);

  const handleSetSleepTimer = (seconds: number, fadeAudio: boolean) => {
    originalVolumeRef.current = volume;
    setSleepTimerTotalSec(seconds);
    setSleepTimerRemainingSec(seconds);
    setFadeAudioOnSleep(fadeAudio);
    setIsSleepTimerOpen(false);

    const mins = Math.round(seconds / 60);
    showToast(
      'Sleep Timer Set',
      seconds < 60
        ? `Audio will pause in ${seconds} seconds.`
        : `Audio will pause & enter Sleep Mode in ${mins} minute${mins > 1 ? 's' : ''}.`
    );
  };

  const handleCancelSleepTimer = () => {
    setSleepTimerRemainingSec(null);
    setSleepTimerTotalSec(null);
    if (audioEngineRef.current) {
      audioEngineRef.current.setVolume(volume);
    }
    showToast('Sleep Timer Cancelled', 'Audio playback will continue uninterrupted.');
  };

  const handleAddSleepTimerMinutes = (minutes: number) => {
    setSleepTimerRemainingSec((prev) => (prev !== null ? prev + minutes * 60 : minutes * 60));
    setSleepTimerTotalSec((prev) => (prev !== null ? prev + minutes * 60 : minutes * 60));
    showToast('Timer Extended', `Added ${minutes} minutes to sleep countdown.`);
  };

  const handleTriggerSleepNow = () => {
    setIsSleepTimerOpen(false);
    setSleepTimerRemainingSec(null);
    setSleepTimerTotalSec(null);
    if (audioEngineRef.current) {
      audioEngineRef.current.pause();
    }
    setIsPlaying(false);
    setIsSleepModeActive(true);
    setSleepModeTriggeredAt(new Date());
    showToast('Entering Sleep Mode', 'Audio paused safely.');
  };

  const handleWakeUp = (resumePlayback: boolean) => {
    setIsSleepModeActive(false);
    if (audioEngineRef.current) {
      audioEngineRef.current.setVolume(volume);
    }
    if (resumePlayback) {
      if (audioEngineRef.current) {
        audioEngineRef.current.play();
      }
      setIsPlaying(true);
      showToast('Welcome Back', `Resumed playing ${currentSong.title}.`);
    } else {
      showToast('Awake', 'Muse is awake. Audio playback remains paused.');
    }
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

  // Play a song from JioSaavn Muse Stream, NaaSongs, SenSongs, or Local file
  const handleLoadCustomSong = (newSong: Song, streamQueueContext?: Song[]) => {
    // If a stream queue context is provided (from playlist, search results, or trending)
    if (streamQueueContext && streamQueueContext.length > 0) {
      setMuseStreamQueue(streamQueueContext);
      setIsMuseStreamMode(true);
    } else if (newSong.sourcePortal === 'JioSaavn') {
      setIsMuseStreamMode(true);
      setMuseStreamQueue(prev => {
        if (!prev.some(s => s.id === newSong.id)) {
          return [newSong, ...prev];
        }
        return prev;
      });
    }

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

    // Asynchronously fetch live, millisecond-synchronized verified lyrics
    ensureSongLyrics(newSong);

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

  // Automatically ensure verified, synchronized lyrics whenever the active song changes
  useEffect(() => {
    if (currentSong) {
      const isPlaceholder = currentSong.lyrics?.some(l =>
        l.text.includes('[Audio Stream]') || l.text.includes('[Pallavi / Verse 1] Swaraala dhaarallo')
      );
      if (!currentSong.lyricsSource || isPlaceholder || currentSong.lyrics.length <= 5) {
        ensureSongLyrics(currentSong);
      }
    }
  }, [currentSong?.id]);

  // Playback Control Handlers
  const handleTogglePlayPause = () => {
    if (!audioEngineRef.current) return;
    if (isPlaying) {
      audioEngineRef.current.pause();
    } else {
      audioEngineRef.current.play();
    }
  };

  const handleNextSong = async () => {
    // If playing from Muse Stream or stream queue exists
    if (isMuseStreamMode || currentSong.sourcePortal === 'JioSaavn' || museStreamQueue.length > 0) {
      let queue = museStreamQueue;
      if (queue.length === 0) {
        try {
          queue = await fetchLatestReleases();
          setMuseStreamQueue(queue);
        } catch (err) {
          console.warn('Failed to load Muse Stream queue:', err);
        }
      }

      if (queue.length > 0) {
        const currentIdx = queue.findIndex(
          s => s.id === currentSong.id || s.title.toLowerCase() === currentSong.title.toLowerCase()
        );
        const nextIdx = currentIdx !== -1 ? (currentIdx + 1) % queue.length : 0;
        const nextTrack = queue[nextIdx];
        handleLoadCustomSong(nextTrack, queue);
        showToast('Muse Stream • Next Song', `${nextTrack.title} • ${nextTrack.artist}`);
        voiceAssistantRef.current?.speak(`Playing next in Muse Stream: ${nextTrack.title}`);
        return;
      }
    }

    switchSong(currentSongIndex + 1);
  };

  const handlePreviousSong = async () => {
    if (isMuseStreamMode || currentSong.sourcePortal === 'JioSaavn' || museStreamQueue.length > 0) {
      let queue = museStreamQueue;
      if (queue.length === 0) {
        try {
          queue = await fetchLatestReleases();
          setMuseStreamQueue(queue);
        } catch (err) {
          console.warn('Failed to load Muse Stream queue:', err);
        }
      }

      if (queue.length > 0) {
        const currentIdx = queue.findIndex(
          s => s.id === currentSong.id || s.title.toLowerCase() === currentSong.title.toLowerCase()
        );
        const prevIdx = currentIdx !== -1 ? (currentIdx - 1 + queue.length) % queue.length : queue.length - 1;
        const prevTrack = queue[prevIdx];
        handleLoadCustomSong(prevTrack, queue);
        showToast('Muse Stream • Previous Song', `${prevTrack.title} • ${prevTrack.artist}`);
        voiceAssistantRef.current?.speak(`Playing previous in Muse Stream: ${prevTrack.title}`);
        return;
      }
    }

    switchSong(currentSongIndex - 1);
  };
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
    originalVolumeRef.current = newVol;
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
      case 'OPEN_MUSE_STREAM':
        setIsJioSaavnOpen(true);
        break;
      case 'OPEN_STEM_EXTRACTOR':
        setIsBgmGeneratorOpen(true);
        break;
      case 'OPEN_AUDIO_TRIMMER':
        setIsTrimmerOpen(true);
        break;
      case 'OPEN_LYRICS_CHAT':
        setIsLyricsChatOpen(true);
        break;
      case 'SEARCH_AND_PLAY': {
        const query = action.query.toLowerCase().trim();
        const match = songs.find(
          s =>
            s.title.toLowerCase().includes(query) ||
            s.artist.toLowerCase().includes(query) ||
            (s.movieName && s.movieName.toLowerCase().includes(query))
        );
        if (match) {
          handleLoadCustomSong(match);
          voiceAssistantRef.current?.speak(`Now playing ${match.title}`);
        } else {
          // Query Muse Stream Engine for live track
          searchJioSaavn(action.query, true)
            .then((results) => {
              if (results && results.length > 0) {
                const topResult = results[0];
                handleLoadCustomSong(topResult, results);
                voiceAssistantRef.current?.speak(
                  `Playing ${topResult.title} from ${topResult.movieName || 'Muse Stream'}`
                );
                setVoiceState((prev) => ({
                  ...prev,
                  assistantFeedback: `Now streaming "${topResult.title}" • ${topResult.movieName || 'Muse Stream'}`
                }));
              } else {
                voiceAssistantRef.current?.speak(`Could not find "${action.query}" on Muse Stream.`);
              }
            })
            .catch((err) => {
              console.warn('Voice live search error:', err);
            });
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
        onOpenBrandLogo={() => setIsBrandLogoOpen(true)}
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
                voiceFeedback={voiceState.lastAction ? voiceState.assistantFeedback : undefined}
                isVoiceListening={voiceState.isListening}
                sleepTimerRemainingSec={sleepTimerRemainingSec}
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
                onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
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
                onRefreshLyrics={() => ensureSongLyrics(currentSong)}
                isLoadingLyrics={isLoadingLyrics}
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
          currentSong={currentSong}
          isPlaying={isPlaying}
          volume={volume}
          onStartListening={() => voiceAssistantRef.current?.startListening()}
          onStopListening={() => voiceAssistantRef.current?.stopListening()}
          onExecuteCommand={(cmd) => voiceAssistantRef.current?.parseAndExecute(cmd)}
          onTogglePlayPause={handleTogglePlayPause}
          onNextSong={handleNextSong}
          onPreviousSong={handlePreviousSong}
          onVolumeChange={handleVolumeChange}
          onToggleAlwaysListening={(enabled) => voiceAssistantRef.current?.toggleAlwaysListening(enabled)}
          isSpeechOutputEnabled={voiceAssistantRef.current?.getSpeechOutput() ?? true}
          onToggleSpeechOutput={(enabled) => voiceAssistantRef.current?.setSpeechOutput(enabled)}
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
          currentSong={currentSong}
          currentSongId={currentSong.id}
          isPlaying={isPlaying}
          volume={volume}
          onSelectSong={handleLoadCustomSong}
          onTogglePlayPause={handleTogglePlayPause}
          onNextSong={handleNextSong}
          onPreviousSong={handlePreviousSong}
          onVolumeChange={handleVolumeChange}
          onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
          onExecuteVoiceCommand={(cmd) => voiceAssistantRef.current?.parseAndExecute(cmd)}
          voiceState={voiceState}
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
          onSearchLyrics={(query) => ensureSongLyrics(currentSong, query)}
          onDismiss={() => setIsFullLyricsOpen(false)}
        />
      )}

      {isBrandLogoOpen && (
        <BrandLogoModal
          isPlaying={isPlaying}
          onDismiss={() => setIsBrandLogoOpen(false)}
        />
      )}

      {isSleepTimerOpen && (
        <SleepTimerModal
          remainingSeconds={sleepTimerRemainingSec}
          totalSeconds={sleepTimerTotalSec}
          currentSong={currentSong}
          currentPositionMs={currentPositionMs}
          fadeAudio={fadeAudioOnSleep}
          onSetTimer={handleSetSleepTimer}
          onCancelTimer={handleCancelSleepTimer}
          onAddMinutes={handleAddSleepTimerMinutes}
          onToggleFadeAudio={setFadeAudioOnSleep}
          onTriggerSleepNow={handleTriggerSleepNow}
          onDismiss={() => setIsSleepTimerOpen(false)}
        />
      )}

      {isSleepModeActive && (
        <SleepModeOverlay
          lastPlayedSong={currentSong}
          triggeredAt={sleepModeTriggeredAt}
          onWakeUp={handleWakeUp}
        />
      )}
    </div>
  );
};
