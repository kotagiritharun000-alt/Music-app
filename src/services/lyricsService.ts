import { LyricLine, Song } from '../types';
import { cleanSongTitle, cleanArtistName, findCuratedLyrics } from '../data/lyricsDatabase';
import { parseLrcToLyricLines } from '../utils/lrcParser';

export interface LyricsFetchResult {
  lyrics: LyricLine[];
  source: 'CURATED_DB' | 'LRCLIB_SYNCED' | 'LRCLIB_PLAIN' | 'JIOSAAVN_OFFICIAL' | 'GEMINI_AI' | 'FALLBACK';
  isSynced: boolean;
  fullLyricsText: string;
}

const clientLyricsCache = new Map<string, LyricsFetchResult>();

/**
 * Normalizes cache key from song identifiers or query
 */
function getCacheKey(title: string, artist?: string): string {
  return `${title.toLowerCase().trim()}_${(artist || '').toLowerCase().trim()}`;
}

/**
 * Fetches accurate, verified, and timestamp-synchronized lyrics for any song.
 * Utilizes a multi-tier fallback pipeline:
 * 1. Client-side verified catalog database (instant)
 * 2. Backend lyrics sync engine (LRCLIB synced, JioSaavn official, Gemini AI)
 * 3. Direct browser LRCLIB fallback (if offline or server latency)
 */
export async function fetchAccurateLyrics(
  song: Song,
  customQuery?: string
): Promise<LyricsFetchResult | null> {
  const rawTitle = customQuery ? customQuery.trim() : song.title;
  const cleanTitle = cleanSongTitle(rawTitle) || rawTitle;
  const cleanArtist = cleanArtistName(song.artist);
  const cacheKey = getCacheKey(cleanTitle, cleanArtist);

  if (clientLyricsCache.has(cacheKey)) {
    return clientLyricsCache.get(cacheKey)!;
  }

  // Tier 1: Check curated high-fidelity lyrics database
  const curated = findCuratedLyrics(cleanTitle, cleanArtist, song.album);
  if (curated && curated.length > 0) {
    const result: LyricsFetchResult = {
      lyrics: curated,
      source: 'CURATED_DB',
      isSynced: true,
      fullLyricsText: curated.map(l => l.text).join('\n')
    };
    clientLyricsCache.set(cacheKey, result);
    return result;
  }

  // Tier 2: Call backend lyrics sync service
  try {
    const durationSec = Math.floor(song.durationMs / 1000);
    const cleanId = song.id.replace('jiosaavn_', '');
    const queryParams = new URLSearchParams({
      title: cleanTitle,
      artist: cleanArtist,
      album: song.album || song.movieName || '',
      duration: durationSec.toString(),
      id: cleanId
    });

    const res = await fetch(`/api/lyrics/sync?${queryParams.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.status && Array.isArray(data.lyrics) && data.lyrics.length > 0) {
        const result: LyricsFetchResult = {
          lyrics: data.lyrics,
          source: data.source || 'LRCLIB_SYNCED',
          isSynced: !!data.synced,
          fullLyricsText: data.fullText || data.lyrics.map((l: any) => l.text).join('\n')
        };
        clientLyricsCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Backend lyrics sync query failed, trying client LRCLIB fallback:', err);
  }

  // Tier 3: Direct LRCLIB browser fallback
  try {
    const searchQuery = `${cleanTitle} ${cleanArtist}`.trim();
    const lrcRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`, {
      headers: { 'User-Agent': 'MuseMusicPlayer/1.0 (Web)' }
    });

    if (lrcRes.ok) {
      const results = await lrcRes.json();
      if (Array.isArray(results) && results.length > 0) {
        const item = results[0];
        if (item.syncedLyrics && item.syncedLyrics.trim().length > 0) {
          const parsed = parseLrcToLyricLines(item.syncedLyrics, song.durationMs, cleanTitle);
          if (parsed.length > 0) {
            const result: LyricsFetchResult = {
              lyrics: parsed,
              source: 'LRCLIB_SYNCED',
              isSynced: true,
              fullLyricsText: item.plainLyrics || parsed.map(l => l.text).join('\n')
            };
            clientLyricsCache.set(cacheKey, result);
            return result;
          }
        } else if (item.plainLyrics && item.plainLyrics.trim().length > 0) {
          const parsed = parseLrcToLyricLines(item.plainLyrics, song.durationMs, cleanTitle);
          if (parsed.length > 0) {
            const result: LyricsFetchResult = {
              lyrics: parsed,
              source: 'LRCLIB_PLAIN',
              isSynced: false,
              fullLyricsText: item.plainLyrics
            };
            clientLyricsCache.set(cacheKey, result);
            return result;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Direct client LRCLIB fetch failed:', err);
  }

  return null;
}
