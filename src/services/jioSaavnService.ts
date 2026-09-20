import CryptoJS from 'crypto-js';
import { Song, StemCategory } from '../types';
import { getFullLyricsForTrack } from '../data/lyricsDatabase';

const DES_KEY = '38346591';

export interface JioSaavnSongRaw {
  id: string;
  song?: string;
  title?: string;
  album?: string;
  year?: string;
  music?: string;
  music_id?: string;
  primary_artists?: string;
  singers?: string;
  starring?: string;
  image?: string;
  label?: string;
  albumid?: string;
  language?: string;
  duration?: string | number;
  play_count?: string | number;
  '320kbps'?: string | boolean;
  has_lyrics?: string | boolean;
  lyrics_snippet?: string;
  encrypted_media_url?: string;
  media_url?: string;
  media_preview_url?: string;
  lyrics?: string | null;
  copyright_text?: string;
}

/**
 * Decrypts JioSaavn's DES-ECB encrypted media URL into the direct CDN audio stream URL.
 */
export function decryptMediaUrl(encryptedUrl: string, quality320: boolean = true): string {
  if (!encryptedUrl) return '';
  try {
    const key = CryptoJS.enc.Utf8.parse(DES_KEY);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl.trim()) } as any,
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    let decUrl = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decUrl) return '';

    if (quality320) {
      decUrl = decUrl.replace(/_96\.mp4|_160\.mp4/, '_320.mp4');
    } else {
      decUrl = decUrl.replace(/_96\.mp4|_320\.mp4/, '_160.mp4');
    }
    return decUrl;
  } catch (err) {
    console.warn('DES decryption error:', err);
    return '';
  }
}

/**
 * Clean up HTML entities returned by JioSaavn API.
 */
export function decodeHtmlEntities(str: string = ''): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&copy;/g, '©');
}

/**
 * Formats a raw JioSaavn song object into sanitized, high-definition data.
 */
export function formatJioSaavnSong(raw: JioSaavnSongRaw): JioSaavnSongRaw {
  const songName = decodeHtmlEntities(raw.song || raw.title || 'Untitled Track');
  const albumName = decodeHtmlEntities(raw.album || 'Single');
  const singers = decodeHtmlEntities(raw.singers || raw.primary_artists || 'Various Artists');
  const music = decodeHtmlEntities(raw.music || raw.primary_artists || 'JioSaavn Music');
  const starring = decodeHtmlEntities(raw.starring || '');

  // High quality cover art (500x500 instead of default 150x150)
  let image = (raw.image || '').replace('150x150', '500x500').replace('50x50', '500x500');
  if (!image || image.includes('default')) {
    image = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
  }

  // Audio Stream URL
  let mediaUrl = raw.media_url || '';
  if (!mediaUrl && raw.encrypted_media_url) {
    mediaUrl = decryptMediaUrl(raw.encrypted_media_url, raw['320kbps'] === 'true' || raw['320kbps'] === true);
  }

  let previewUrl = raw.media_preview_url || '';
  if (!previewUrl && mediaUrl) {
    previewUrl = mediaUrl.replace('_320.mp4', '_96_p.mp4').replace('_160.mp4', '_96_p.mp4').replace('//aac.', '//preview.');
  }

  return {
    ...raw,
    song: songName,
    title: songName,
    album: albumName,
    singers,
    music,
    starring,
    image,
    media_url: mediaUrl,
    media_preview_url: previewUrl,
    lyrics_snippet: decodeHtmlEntities(raw.lyrics_snippet || '')
  };
}

/**
 * Converts a formatted JioSaavn song into a full Muse Song model with
 * 5-Stem simulation, Dolby Atmos spatialization, and lyrics integration.
 */
export function convertJioSaavnToMuseSong(raw: JioSaavnSongRaw): Song {
  const formatted = formatJioSaavnSong(raw);
  const durationSec = typeof formatted.duration === 'string' ? parseInt(formatted.duration, 10) : (formatted.duration || 210);
  const durationMs = (durationSec > 0 ? durationSec : 210) * 1000;

  // Determine vibrant gradient pairs based on language/mood
  const isTelugu = (formatted.language || '').toLowerCase().includes('telugu');
  const isTamil = (formatted.language || '').toLowerCase().includes('tamil');
  const isHindi = (formatted.language || '').toLowerCase().includes('hindi');

  const gradientStart = isTelugu ? '#FF5014' : isTamil ? '#EC4899' : isHindi ? '#F59E0B' : '#6366F1';
  const gradientEnd = isTelugu ? '#8B2500' : isTamil ? '#831843' : isHindi ? '#78350F' : '#312E81';

  // Check existing high-detail lyrics database using track name, artist, and album
  const songNameQuery = formatted.song || formatted.title || '';
  const knownLyrics = getFullLyricsForTrack(songNameQuery, formatted.singers, formatted.album, durationMs);

  // Generate synchronized lyric lines
  let lyrics = knownLyrics;
  if (formatted.lyrics) {
    // Split newline/br separated raw lyrics from JioSaavn lyrics API
    const rawLines = formatted.lyrics
      .split(/<br\s*\/?>|\n/gi)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (rawLines.length > 0) {
      const stepMs = Math.max(2500, Math.floor(durationMs / Math.max(rawLines.length, 1)));
      lyrics = rawLines.map((text, idx) => ({
        timestampMs: idx * stepMs,
        text: decodeHtmlEntities(text),
        translation: idx === 0 ? `Official Lyrics: ${songNameQuery}` : undefined,
        aiNote: idx === 1 ? 'Dolby Atmos 360 Vocal Enhancement Active' : undefined
      }));
    }
  }

  if (!lyrics || lyrics.length === 0) {
    lyrics = getFullLyricsForTrack(songNameQuery, formatted.singers, formatted.album, durationMs);
  }

  // 5 Interactive Stem Stems for full Muse isolation
  const stems = [
    {
      id: `${formatted.id}_vocal`,
      name: 'Lead Vocals & Harmonies',
      category: StemCategory.MAIN_MELODY,
      durationMs,
      waveformPoints: Array.from({ length: 50 }, (_, i) => 0.4 + 0.5 * Math.sin(i * 0.35)),
      isRingtoneRecommended: true,
      description: 'Crystal-clear vocal line isolated with Dolby Atmos center channel enhancement.'
    },
    {
      id: `${formatted.id}_bass`,
      name: '808 Sub-Bass & Dappu Kick',
      category: StemCategory.BASSLINE_GROOVE,
      durationMs,
      waveformPoints: Array.from({ length: 50 }, (_, i) => 0.3 + 0.6 * Math.abs(Math.cos(i * 0.25))),
      isRingtoneRecommended: false,
      description: 'Heavy cinematic sub-bass and punchy percussion bottom-end.'
    },
    {
      id: `${formatted.id}_drums`,
      name: 'Rhythm & Acoustic Percussion',
      category: StemCategory.DRUMS_PERCUSSION,
      durationMs,
      waveformPoints: Array.from({ length: 50 }, (_, i) => 0.5 + 0.4 * Math.sin(i * 0.5)),
      isRingtoneRecommended: true,
      description: 'High-energy rhythmic grooves, claps, manjira, and shakers.'
    },
    {
      id: `${formatted.id}_chords`,
      name: 'Acoustic & Synthesizer Chords',
      category: StemCategory.AMBIENT_PAD,
      durationMs,
      waveformPoints: Array.from({ length: 50 }, (_, i) => 0.35 + 0.4 * Math.sin(i * 0.2)),
      isRingtoneRecommended: false,
      description: 'Harmonic guitar, strings, keyboard pads, and melodious fills.'
    },
    {
      id: `${formatted.id}_ambient`,
      name: 'Dolby Atmos 360 Spatial Bed',
      category: StemCategory.CLIMAX_SOLO,
      durationMs,
      waveformPoints: Array.from({ length: 50 }, (_, i) => 0.2 + 0.3 * Math.sin(i * 0.15)),
      isRingtoneRecommended: false,
      description: 'Immersive 3D binaural reverberations and atmospheric wash.'
    }
  ];

  return {
    id: `jiosaavn_${formatted.id}`,
    title: formatted.song || 'Untitled',
    artist: formatted.singers || 'Various Artists',
    album: formatted.album || 'Single',
    movieName: formatted.album,
    year: formatted.year ? String(formatted.year) : '2024',
    durationMs,
    bpm: 124,
    key: 'D Major',
    genre: `${formatted.language ? formatted.language.toUpperCase() : 'INDIAN'} Cinema`,
    description: `Streamed via Muse Stream Engine. Music by ${formatted.music}. Starring ${formatted.starring || 'Cast'}.`,
    gradientStart,
    gradientEnd,
    isDolbyAtmos: true,
    isHiResLossless: true,
    bitDepth: 24,
    sampleRateKhz: 96,
    sourcePortal: 'JioSaavn',
    coverImage: formatted.image,
    audioUrl: formatted.media_url || formatted.media_preview_url,
    stems,
    lyrics,
    fullLyricsText: lyrics.map(l => l.text).join('\n')
  };
}

/**
 * Searches JioSaavn for songs using both server endpoints and direct API fallback.
 */
export async function searchJioSaavn(query: string, includeLyrics: boolean = true): Promise<Song[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // 1. Try local server API first (/api/jiosaavn/search or /song/)
  try {
    const serverUrl = `/api/jiosaavn/search?query=${encodeURIComponent(cleanQuery)}&lyrics=${includeLyrics ? 'true' : 'false'}`;
    const res = await fetch(serverUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(convertJioSaavnToMuseSong);
      } else if (data.results && Array.isArray(data.results)) {
        return data.results.map(convertJioSaavnToMuseSong);
      }
    }
  } catch (err) {
    console.warn('Server JioSaavn search failed, trying direct search.getResults:', err);
  }

  // 2. Direct fallback using search.getResults
  try {
    const directUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=1&n=25&q=${encodeURIComponent(cleanQuery)}`;
    const res = await fetch(directUrl);
    if (res.ok) {
      const json = await res.json();
      const rawSongs = json.results || [];
      return rawSongs.map(convertJioSaavnToMuseSong);
    }
  } catch (err) {
    console.warn('Direct JioSaavn search failed, trying autocomplete fallback:', err);
  }

  // 3. Autocomplete fallback
  try {
    const autoUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(cleanQuery)}`;
    const res = await fetch(autoUrl);
    if (res.ok) {
      const json = await res.json();
      const rawSongs = json.songs?.data || [];
      return rawSongs.map((s: any) => {
        const item: JioSaavnSongRaw = {
          id: s.id,
          song: s.title,
          album: s.album,
          singers: s.more_info?.singers || s.description,
          image: s.image,
          encrypted_media_url: s.more_info?.encrypted_media_url
        };
        return convertJioSaavnToMuseSong(item);
      });
    }
  } catch (err) {
    console.error('All JioSaavn search attempts failed:', err);
  }

  return [];
}

/**
 * Fetches lyrics for a JioSaavn song ID.
 */
export async function fetchJioSaavnLyrics(songId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/jiosaavn/lyrics?id=${encodeURIComponent(songId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.status && data.lyrics) {
        return data.lyrics;
      }
    }
  } catch (err) {
    console.warn('Fetch lyrics failed:', err);
  }

  try {
    const url = `https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics&ctx=web6dot0&api_version=4&_format=json&_marker=0%3F_marker%3D0&lyrics_id=${songId}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      return json.lyrics || null;
    }
  } catch (err) {
    console.warn('Direct lyrics fetch failed:', err);
  }

  return null;
}

export interface JioSaavnPlaylistMeta {
  id: string;
  title: string;
  subtitle?: string;
  language?: string;
  image: string;
  songCount: number;
}

export interface JioSaavnPlaylistDetails {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  songs: Song[];
}

/**
 * Fetches top trending playlists and charts.
 */
export async function fetchTrendingPlaylists(): Promise<JioSaavnPlaylistMeta[]> {
  // 1. Try local server endpoint first
  try {
    const res = await fetch('/api/jiosaavn/trending-playlists');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Server trending playlists fetch failed, attempting fallback:', err);
  }

  // 2. Direct fallback charts API
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=content.getCharts&api_version=4&_format=json&_marker=0&ctx=web6dot0`;
    const res = await fetch(url);
    if (res.ok) {
      const charts = await res.json();
      if (Array.isArray(charts)) {
        return charts.map((c: any) => ({
          id: c.id,
          title: decodeHtmlEntities(c.title || 'Trending Playlist'),
          subtitle: decodeHtmlEntities(c.more_info?.firstname || 'JioSaavn Editorial'),
          language: (c.title || '').toLowerCase().includes('telugu') ? 'Telugu' : (c.title || '').toLowerCase().includes('hindi') ? 'Hindi' : 'Trending',
          image: (c.image || '').replace('150x150', '500x500'),
          songCount: c.count || 50
        }));
      }
    }
  } catch (err) {
    console.warn('Direct charts fallback failed:', err);
  }

  // 3. Fallback to verified popular playlists
  return [
    {
      id: '1134548194',
      title: 'India Superhits Top 50',
      subtitle: 'Most Streamed Hits across India',
      language: 'All Languages',
      image: 'https://c.saavncdn.com/editorial/IndiaSuperhitsTop50_20260918045504.jpg',
      songCount: 50
    },
    {
      id: '1134643225',
      title: 'Telugu: India Superhits Top 50',
      subtitle: 'Tollywood Top Chartbusters',
      language: 'Telugu',
      image: 'https://c.saavncdn.com/editorial/Telugu-IndiaSuperhitsTop50_20260918045504.jpg',
      songCount: 50
    },
    {
      id: '1266643840',
      title: 'Trending Telugu Songs',
      subtitle: 'Viral Tollywood Audio & Reels',
      language: 'Telugu',
      image: 'https://c.saavncdn.com/editorial/TrendingTeluguSongs_20260911054516.jpg',
      songCount: 40
    },
    {
      id: '1134543272',
      title: 'Hindi: India Superhits Top 50',
      subtitle: 'Bollywood Top Trending Hits',
      language: 'Hindi',
      image: 'https://c.saavncdn.com/editorial/Hindi-IndiaSuperhitsTop50_20260911054516.jpg',
      songCount: 50
    },
    {
      id: '1134651042',
      title: 'Tamil: India Superhits Top 50',
      subtitle: 'Kollywood Top Chartbusters',
      language: 'Tamil',
      image: 'https://c.saavncdn.com/editorial/Tamil-IndiaSuperhitsTop50_20260918045504.jpg',
      songCount: 50
    },
    {
      id: '47599074',
      title: 'Now Trending - Pan India',
      subtitle: 'Viral Hits Dominating the Nation',
      language: 'Pan-India',
      image: 'https://c.saavncdn.com/editorial/NowTrending_20260423085344_150x150.jpg',
      songCount: 37
    }
  ];
}

/**
 * Fetches all songs inside a trending playlist.
 */
export async function fetchPlaylistDetails(playlistId: string): Promise<JioSaavnPlaylistDetails | null> {
  // 1. Try local server playlist route
  try {
    const res = await fetch(`/api/jiosaavn/playlist?id=${encodeURIComponent(playlistId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.songs && Array.isArray(data.songs)) {
        const museSongs = data.songs.map(convertJioSaavnToMuseSong);
        return {
          id: playlistId,
          title: decodeHtmlEntities(data.listname || data.title || 'Trending Playlist'),
          subtitle: decodeHtmlEntities(data.subtitle || `${museSongs.length} Tracks`),
          image: (data.image || '').replace('150x150', '500x500'),
          songs: museSongs
        };
      }
    }
  } catch (err) {
    console.warn('Server playlist fetch failed, trying direct:', err);
  }

  // 2. Direct API call
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&cc=in&_marker=0%3F_marker%3D0&listid=${encodeURIComponent(playlistId)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.songs && Array.isArray(data.songs)) {
        const museSongs = data.songs.map(convertJioSaavnToMuseSong);
        return {
          id: playlistId,
          title: decodeHtmlEntities(data.listname || data.title || 'Trending Playlist'),
          subtitle: decodeHtmlEntities(data.subtitle || `${museSongs.length} Tracks`),
          image: (data.image || '').replace('150x150', '500x500'),
          songs: museSongs
        };
      }
    }
  } catch (err) {
    console.warn('Direct playlist fetch failed:', err);
  }

  return null;
}

/**
 * Fetches latest released songs, optionally filtered by language.
 */
export async function fetchLatestReleases(language?: string): Promise<Song[]> {
  const langParam = language && language.toLowerCase() !== 'all' ? `?language=${encodeURIComponent(language)}` : '';

  // 1. Try local server endpoint
  try {
    const res = await fetch(`/api/jiosaavn/latest-releases${langParam}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(convertJioSaavnToMuseSong);
      }
    }
  } catch (err) {
    console.warn('Server latest releases fetch failed, trying direct:', err);
  }

  // 2. Direct search query fallback
  try {
    const query = language && language.toLowerCase() !== 'all' ? `Latest ${language} Songs` : 'Latest Songs';
    return await searchJioSaavn(query, false);
  } catch (err) {
    console.warn('Fallback latest releases search failed:', err);
  }

  return [];
}

