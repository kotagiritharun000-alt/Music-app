export enum StemCategory {
  MAIN_MELODY = 'MAIN_MELODY',
  BASSLINE_GROOVE = 'BASSLINE_GROOVE',
  DRUMS_PERCUSSION = 'DRUMS_PERCUSSION',
  AMBIENT_PAD = 'AMBIENT_PAD',
  CLIMAX_SOLO = 'CLIMAX_SOLO'
}

export interface BgmStem {
  id: string;
  name: string;
  category: StemCategory;
  durationMs: number;
  startOffsetMs?: number;
  waveformPoints: number[];
  isRingtoneRecommended: boolean;
  description: string;
}

export interface LyricLine {
  timestampMs: number;
  text: string;
  translation?: string;
  aiNote?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  bpm: number;
  key: string;
  genre: string;
  gradientStart: string;
  gradientEnd: string;
  isDolbyAtmos: boolean;
  isHiResLossless: boolean;
  bitDepth: number;
  sampleRateKhz: number;
  stems: BgmStem[];
  lyrics: LyricLine[];
  description: string;
  audioUrl?: string;
  bgmUrl?: string;
  bgmBlob?: Blob;
  hasBgmReady?: boolean;
  fullLyricsText?: string;
  teluguLyrics?: string;
  sourcePortal?: 'NaaSongs' | 'SenSongs' | 'LocalFile' | 'MuseOriginal';
  coverImage?: string;
  year?: string;
  movieName?: string;
}

export enum RoomPreset {
  STUDIO = 'STUDIO',
  ATMOS_360 = 'ATMOS_360',
  CONCERT_HALL = 'CONCERT_HALL',
  BINAURAL_3D = 'BINAURAL_3D'
}

export interface RoomPresetInfo {
  label: string;
  description: string;
}

export const ROOM_PRESET_METADATA: Record<RoomPreset, RoomPresetInfo> = {
  [RoomPreset.STUDIO]: {
    label: 'Studio Reference',
    description: 'Ultra-clean acoustic isolation with zero room coloration'
  },
  [RoomPreset.ATMOS_360]: {
    label: 'Dolby Atmos 360',
    description: 'Immersive object-based soundfield with heightened verticality'
  },
  [RoomPreset.CONCERT_HALL]: {
    label: 'Concert Hall',
    description: 'Expansive reverberation and deep spatial envelope'
  },
  [RoomPreset.BINAURAL_3D]: {
    label: 'Binaural 3D Headphone',
    description: 'HRTF filtered spatialized binaural field'
  }
};

export interface AudioSpatialConfig {
  isSpatialEnabled: boolean;
  isDolbyAtmosEnabled: boolean;
  roomPreset: RoomPreset;
  bassBoost: number; // 0.0 to 1.0
  vocalClarity: number; // 0.0 to 1.0
  azimuthAngleDegrees: number; // -180 to +180
  distanceMeters: number;
  isHeadTrackingActive: boolean;
}

export interface VoiceAssistantState {
  isListening: boolean;
  isAlwaysListeningEnabled: boolean;
  recognizedText: string;
  assistantFeedback: string;
  lastAction?: string | null;
  confidence: number;
}

export enum ToneExportType {
  RINGTONE = 'RINGTONE',
  NOTIFICATION = 'NOTIFICATION',
  ALARM = 'ALARM',
  AUDIO_CLIP = 'AUDIO_CLIP'
}

export interface ToneExportTypeInfo {
  label: string;
  defaultDurationMs: number;
}

export const TONE_EXPORT_METADATA: Record<ToneExportType, ToneExportTypeInfo> = {
  [ToneExportType.RINGTONE]: { label: 'Phone Ringtone', defaultDurationMs: 30000 },
  [ToneExportType.NOTIFICATION]: { label: 'Notification Chime', defaultDurationMs: 5000 },
  [ToneExportType.ALARM]: { label: 'Wake-up Alarm', defaultDurationMs: 45000 },
  [ToneExportType.AUDIO_CLIP]: { label: 'HQ Audio Stem Export', defaultDurationMs: 60000 }
};

export interface TrimConfig {
  startMs: number;
  endMs: number;
  isFadeIn: boolean;
  isFadeOut: boolean;
  targetType: ToneExportType;
  customTitle: string;
}

export interface PlaylistItem {
  id: string;
  name: string;
  subtitle: string;
  songIds: string[];
  gradientColor: string;
}

export interface DownloadedAsset {
  id: string;
  title: string;
  sourceTrack: string;
  type: string;
  fileSizeMb: number;
  dateDownloaded: string;
  blobData?: Blob;
}

export interface NaaSongsTrack {
  id: string;
  title: string;
  movie: string;
  artist: string;
  musicDirector: string;
  year: string;
  durationMs: number;
  bitrate: string;
  portalSource: 'NaaSongs' | 'SenSongs';
  albumArt: string;
  genre: string;
  bpm: number;
  key: string;
  gradientStart: string;
  gradientEnd: string;
  lyricsSnippet: string;
  audioPreviewNote: string;
  audioUrl?: string;
  isDolbyAtmos: boolean;
}

export interface LocalImportedFile {
  id: string;
  name: string;
  fileSizeFormatted: string;
  objectUrl: string;
  durationMs: number;
  dateAdded: string;
}

export enum MessageSender {
  USER = 'USER',
  MUSE_AI = 'MUSE_AI'
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  isNotesCard?: boolean;
  notesSummary?: string | null;
}

export type VoiceAction =
  | { type: 'SET_VOLUME'; targetVolume: number }
  | { type: 'ADJUST_VOLUME_RELATIVE'; delta: number }
  | { type: 'MUTE' }
  | { type: 'UNMUTE' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'NEXT_SONG' }
  | { type: 'PREVIOUS_SONG' }
  | { type: 'RESTART_SONG' }
  | { type: 'SEARCH_AND_PLAY'; query: string }
  | { type: 'SET_SPATIAL_AUDIO'; enabled: boolean }
  | { type: 'SET_DOLBY_ATMOS'; enabled: boolean }
  | { type: 'OPEN_STEM_EXTRACTOR' }
  | { type: 'OPEN_AUDIO_TRIMMER' }
  | { type: 'OPEN_LYRICS_CHAT' }
  | { type: 'GENERAL_INFO'; response: string };
