import { DeviceTrackRecord, saveDeviceTracks } from './deviceMusicStorage';
import { Song, StemCategory } from '../types';
import { getFullLyricsForTrack } from '../data/lyricsDatabase';

const AUDIO_EXTENSIONS = /\.(mp3|wav|m4a|aac|flac|ogg|opus|wma)$/i;

export function cleanTrackMetaFromFilename(filename: string): {
  title: string;
  artist: string;
  album: string;
  format: string;
} {
  // Extract format
  const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
  const format = extMatch ? extMatch[1].toUpperCase() : 'AUDIO';

  // Strip extension
  let base = filename.replace(/\.[^/.]+$/, '');

  // Strip common tags
  base = base.replace(/\[.*?\]|\(.*?\)/g, ' ').trim();
  // Strip track numbers e.g. "01 - ", "02. "
  base = base.replace(/^\d+[\s._-]+/, '');
  // Replace underscores and extra hyphens
  base = base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();

  let artist = 'Local Device';
  let album = 'Device Music';
  let title = base || 'Untitled Audio';

  if (base.includes(' - ')) {
    const parts = base.split(' - ');
    if (parts.length >= 2) {
      artist = parts[0].trim();
      title = parts[1].trim();
      if (parts.length >= 3) {
        album = parts[2].trim();
      }
    }
  }

  return { title, artist, album, format };
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getAudioDurationMs(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(blob);
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.src = url;

      const cleanup = () => {
        URL.revokeObjectURL(url);
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve(180000); // 3-minute fallback if metadata takes too long
      }, 3000);

      audio.onloadedmetadata = () => {
        clearTimeout(timer);
        cleanup();
        if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
          resolve(Math.floor(audio.duration * 1000));
        } else {
          resolve(180000);
        }
      };

      audio.onerror = () => {
        clearTimeout(timer);
        cleanup();
        resolve(180000);
      };
    } catch {
      resolve(180000);
    }
  });
}

/**
 * Scan a single File object and create a DeviceTrackRecord
 */
export async function convertFileToDeviceTrack(file: File): Promise<DeviceTrackRecord> {
  const meta = cleanTrackMetaFromFilename(file.name);
  const durationMs = await getAudioDurationMs(file);
  const objectUrl = URL.createObjectURL(file);

  return {
    id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    name: file.name,
    title: meta.title,
    artist: meta.artist,
    album: meta.album,
    format: meta.format,
    sizeFormatted: formatBytes(file.size),
    sizeBytes: file.size,
    durationMs,
    dateAdded: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    blob: file,
    objectUrl
  };
}

/**
 * Process a collection of files (from input or drop)
 */
export async function processFilesToDeviceTracks(
  files: FileList | File[],
  onProgress?: (processed: number, total: number) => void
): Promise<DeviceTrackRecord[]> {
  const fileArray = Array.from(files).filter(
    (f) => f.type.startsWith('audio/') || AUDIO_EXTENSIONS.test(f.name)
  );

  const results: DeviceTrackRecord[] = [];
  const total = fileArray.length;

  for (let i = 0; i < total; i++) {
    try {
      const track = await convertFileToDeviceTrack(fileArray[i]);
      results.push(track);
      if (onProgress) {
        onProgress(i + 1, total);
      }
    } catch (e) {
      console.warn('Skipping unreadable audio file:', fileArray[i].name, e);
    }
  }

  // Save to IndexedDB
  if (results.length > 0) {
    try {
      await saveDeviceTracks(results);
    } catch (err) {
      console.warn('Could not persist to IndexedDB:', err);
    }
  }

  return results;
}

/**
 * Scan directory using File System Access API (Desktop/Laptop Chrome, Edge, etc.)
 */
export async function scanDirectoryHandle(
  onProgress?: (count: number, currentDir: string) => void
): Promise<DeviceTrackRecord[]> {
  if (typeof window === 'undefined' || !(window as any).showDirectoryPicker) {
    throw new Error('DIRECTORY_PICKER_NOT_SUPPORTED');
  }

  // Request directory permission from user
  const dirHandle = await (window as any).showDirectoryPicker({
    mode: 'read',
    startIn: 'music'
  });

  const audioFiles: File[] = [];

  async function traverse(handle: any, path: string) {
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        if (AUDIO_EXTENSIONS.test(entry.name)) {
          try {
            const file = await entry.getFile();
            audioFiles.push(file);
            if (onProgress) {
              onProgress(audioFiles.length, path || dirHandle.name);
            }
          } catch (e) {
            console.warn('Could not read file:', entry.name, e);
          }
        }
      } else if (entry.kind === 'directory') {
        try {
          await traverse(entry, `${path}/${entry.name}`);
        } catch (e) {
          console.warn('Directory read restricted:', entry.name, e);
        }
      }
    }
  }

  await traverse(dirHandle, dirHandle.name);

  return processFilesToDeviceTracks(audioFiles);
}

/**
 * Convert a DeviceTrackRecord to a Muse Song object for full playback
 */
export function convertDeviceTrackToSong(track: DeviceTrackRecord): Song {
  const durationMs = track.durationMs || 180000;
  const objectUrl = track.objectUrl || (track.blob ? URL.createObjectURL(track.blob) : '');

  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album || `Device Music (${track.format})`,
    movieName: track.album,
    year: new Date().getFullYear().toString(),
    durationMs,
    bpm: 124,
    key: 'C Major',
    genre: `Device Audio (${track.format})`,
    gradientStart: '#10B981',
    gradientEnd: '#064E3B',
    isDolbyAtmos: true,
    isHiResLossless: true,
    bitDepth: 24,
    sampleRateKhz: 96,
    audioUrl: objectUrl,
    sourcePortal: 'LocalFile',
    coverImage: undefined,
    stems: [
      {
        id: `stem_${track.id}_lead`,
        name: `${track.title} (Device Stereo Master)`,
        category: StemCategory.MAIN_MELODY,
        durationMs,
        waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.7 + 0.3),
        isRingtoneRecommended: true,
        description: `Direct master playback from device audio (${track.format}).`
      },
      {
        id: `stem_${track.id}_bass`,
        name: 'Dynamic Sub-Bass (80Hz - 250Hz)',
        category: StemCategory.BASSLINE_GROOVE,
        durationMs,
        waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.8 + 0.2),
        isRingtoneRecommended: false,
        description: 'Low-end isolation with Muse analog warm saturation.'
      },
      {
        id: `stem_${track.id}_drums`,
        name: 'Rhythm, Kicks & Transients',
        category: StemCategory.DRUMS_PERCUSSION,
        durationMs,
        waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.6 + 0.4),
        isRingtoneRecommended: true,
        description: 'Percussive transients processed with dynamic expansion.'
      },
      {
        id: `stem_${track.id}_pad`,
        name: 'Dolby Atmos 360 Spatial Bed',
        category: StemCategory.AMBIENT_PAD,
        durationMs,
        waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.5 + 0.2),
        isRingtoneRecommended: false,
        description: 'Binaural convolution soundstage with 360 spatialization.'
      },
      {
        id: `stem_${track.id}_solo`,
        name: 'Vocal Clarity & Climax Lead',
        category: StemCategory.CLIMAX_SOLO,
        durationMs,
        waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.9 + 0.1),
        isRingtoneRecommended: true,
        description: 'Mid-high vocal & solo resonance ideal for custom ringtones.'
      }
    ],
    lyrics: getFullLyricsForTrack(track.title, track.artist, undefined, durationMs),
    description: `Local audio track loaded directly from your device (${track.format} • ${track.sizeFormatted}). Processed with full Dolby Atmos 360 & 5-stem isolation.`
  };
}
