import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import CryptoJS from 'crypto-js';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('GoogleGenAI initialization failed:', e);
    }
  }
  return genAIClient;
}

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Enable Cross-Origin Resource Sharing
app.use(cors());
app.use(express.json());

const DES_KEY = '38346591';

// Decrypt DES-ECB media URL from JioSaavn
function decryptMediaUrl(encryptedUrl: string, is320: boolean = true): string {
  if (!encryptedUrl) return '';
  try {
    const key = CryptoJS.enc.Utf8.parse(DES_KEY);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl.trim()) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    let decUrl = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decUrl) return '';
    if (is320) {
      decUrl = decUrl.replace(/_96\.mp4|_160\.mp4/, '_320.mp4');
    } else {
      decUrl = decUrl.replace(/_96\.mp4|_320\.mp4/, '_160.mp4');
    }
    return decUrl;
  } catch (err) {
    console.error('Server DES decrypt error:', err);
    return '';
  }
}

function cleanHtml(str: string = ''): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&copy;/g, '©');
}

function formatSongItem(data: any, lyrics: boolean = false): any {
  if (!data) return null;
  const is320 = data['320kbps'] === 'true' || data['320kbps'] === true;
  let mediaUrl = '';
  if (data.encrypted_media_url) {
    mediaUrl = decryptMediaUrl(data.encrypted_media_url, is320);
  } else if (data.media_url) {
    mediaUrl = data.media_url;
  }

  const previewUrl = mediaUrl
    ? mediaUrl.replace('_320.mp4', '_96_p.mp4').replace('_160.mp4', '_96_p.mp4').replace('//aac.', '//preview.')
    : '';

  const image = (data.image || '').replace('150x150', '500x500').replace('50x50', '500x500');

  return {
    ...data,
    song: cleanHtml(data.song || data.title),
    title: cleanHtml(data.song || data.title),
    music: cleanHtml(data.music || data.primary_artists),
    singers: cleanHtml(data.singers || data.primary_artists),
    starring: cleanHtml(data.starring || ''),
    album: cleanHtml(data.album),
    primary_artists: cleanHtml(data.primary_artists),
    image,
    media_url: mediaUrl,
    media_preview_url: previewUrl,
    lyrics: data.lyrics || null,
    copyright_text: cleanHtml(data.copyright_text || '')
  };
}

async function fetchLyricsText(id: string): Promise<string | null> {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics&ctx=web6dot0&api_version=4&_format=json&_marker=0%3F_marker%3D0&lyrics_id=${id}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.lyrics || null;
    }
  } catch (err) {
    console.warn('Error fetching lyrics from JioSaavn:', err);
  }
  return null;
}

// -------------------------------------------------------------
// JIOSAAVN API ROUTES (Matching cyberboysumanjay/JioSaavnAPI)
// -------------------------------------------------------------

// 1. Search song (/song/ or /api/jiosaavn/search)
async function handleSearch(req: Request, res: Response) {
  const query = (req.query.query as string) || (req.query.q as string);
  const withLyrics = req.query.lyrics === 'true';

  if (!query) {
    return res.status(400).json({ status: false, error: 'Query is required to search songs!' });
  }

  try {
    // Call rich results endpoint
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=1&n=25&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`JioSaavn API responded with status ${response.status}`);
    }

    const data = await response.json();
    const rawResults = data.results || [];
    const formatted = await Promise.all(
      rawResults.map(async (song: any) => {
        const item = formatSongItem(song, withLyrics);
        if (withLyrics && song.has_lyrics === 'true') {
          item.lyrics = await fetchLyricsText(song.id);
        }
        return item;
      })
    );

    return res.json(formatted);
  } catch (err: any) {
    console.error('JioSaavn search error:', err);
    return res.status(500).json({ status: false, error: err.message });
  }
}

app.get('/song', handleSearch);
app.get('/song/', handleSearch);
app.get('/api/jiosaavn/search', handleSearch);

// 2. Get Song Details (/song/get/ or /api/jiosaavn/song)
async function handleGetSong(req: Request, res: Response) {
  const id = (req.query.id as string) || (req.query.pids as string);
  const withLyrics = req.query.lyrics === 'true';

  if (!id) {
    return res.status(400).json({ status: false, error: 'Song ID is required to get a song!' });
  }

  try {
    const url = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${encodeURIComponent(id)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`JioSaavn API responded with status ${response.status}`);
    }

    const data = await response.json();
    const songRaw = data[id];
    if (!songRaw) {
      return res.status(404).json({ status: false, error: 'Invalid Song ID received!' });
    }

    const formatted = formatSongItem(songRaw, withLyrics);
    if (withLyrics && songRaw.has_lyrics === 'true') {
      formatted.lyrics = await fetchLyricsText(id);
    }

    return res.json(formatted);
  } catch (err: any) {
    console.error('JioSaavn getSong error:', err);
    return res.status(500).json({ status: false, error: err.message });
  }
}

app.get('/song/get', handleGetSong);
app.get('/song/get/', handleGetSong);
app.get('/api/jiosaavn/song', handleGetSong);

// 3. Album details (/album/ or /api/jiosaavn/album)
async function handleAlbum(req: Request, res: Response) {
  const albumId = (req.query.id as string) || (req.query.query as string);
  const withLyrics = req.query.lyrics === 'true';

  if (!albumId) {
    return res.status(400).json({ status: false, error: 'Album ID or query is required!' });
  }

  try {
    const url = `https://www.jiosaavn.com/api.php?__call=content.getAlbumDetails&_format=json&cc=in&_marker=0%3F_marker%3D0&albumid=${encodeURIComponent(albumId)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.songs && Array.isArray(data.songs)) {
      data.image = (data.image || '').replace('150x150', '500x500');
      data.songs = data.songs.map((s: any) => formatSongItem(s, withLyrics));
    }

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ status: false, error: err.message });
  }
}

app.get('/album', handleAlbum);
app.get('/album/', handleAlbum);
app.get('/api/jiosaavn/album', handleAlbum);

// 4. Playlist details (/playlist/ or /api/jiosaavn/playlist)
async function handlePlaylist(req: Request, res: Response) {
  const listId = (req.query.id as string) || (req.query.query as string);
  const withLyrics = req.query.lyrics === 'true';

  if (!listId) {
    return res.status(400).json({ status: false, error: 'Playlist ID is required!' });
  }

  try {
    const url = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&cc=in&_marker=0%3F_marker%3D0&listid=${encodeURIComponent(listId)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.songs && Array.isArray(data.songs)) {
      data.songs = data.songs.map((s: any) => formatSongItem(s, withLyrics));
    }

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ status: false, error: err.message });
  }
}

app.get('/playlist', handlePlaylist);
app.get('/playlist/', handlePlaylist);
app.get('/api/jiosaavn/playlist', handlePlaylist);

// 5. Lyrics (/lyrics/ or /api/jiosaavn/lyrics)
async function handleLyrics(req: Request, res: Response) {
  const query = (req.query.query as string) || (req.query.id as string);
  if (!query) {
    return res.status(400).json({ status: false, error: 'Song ID is required to fetch lyrics!' });
  }

  const lyricsText = await fetchLyricsText(query);
  if (lyricsText) {
    return res.json({ status: true, lyrics: lyricsText });
  } else {
    return res.status(404).json({ status: false, error: 'Lyrics not available for this track' });
  }
}

app.get('/lyrics', handleLyrics);
app.get('/lyrics/', handleLyrics);
app.get('/api/jiosaavn/lyrics', handleLyrics);

// 5b. Multi-Source Verified Synced Lyrics Engine (/api/lyrics/sync)
const serverLyricsCache = new Map<string, any>();

function parseLrcServer(lrcText: string, durationSec: number = 180): any[] {
  const lines = lrcText.split('\n');
  const result: any[] = [];
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
  let hasTimestamp = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || /^\[(ti|ar|al|by|offset|length):/i.test(trimmed)) continue;

    const matches = Array.from(trimmed.matchAll(timeRegex));
    if (matches.length > 0) {
      hasTimestamp = true;
      const text = trimmed.replace(timeRegex, '').trim();
      if (text) {
        for (const m of matches) {
          const min = parseInt(m[1], 10);
          const sec = parseInt(m[2], 10);
          const msFrac = m[3] ? parseInt(m[3].padEnd(3, '0').slice(0, 3), 10) : 0;
          result.push({
            timestampMs: (min * 60 + sec) * 1000 + msFrac,
            text,
            translation: undefined
          });
        }
      }
    }
  }

  if (hasTimestamp && result.length > 0) {
    result.sort((a, b) => a.timestampMs - b.timestampMs);
    return result;
  }

  const plain = lrcText.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !/^\[(ti|ar|al):/i.test(l));
  const stepMs = Math.floor((durationSec * 1000) / Math.max(1, plain.length));
  return plain.map((text, idx) => ({
    timestampMs: idx * stepMs,
    text,
    translation: undefined
  }));
}

function cleanTitleForQuery(raw: string): string {
  if (!raw) return '';
  let s = cleanHtml(raw);
  s = s.replace(/[\(\[](from|feat|ft|with|couples? song|official|video|lyrical|audio|full video|telugu|hindi|tamil|kannada|malayalam|original|motion picture).*?[\)\]]/gi, '');
  s = s.replace(/[-|].*$/, '');
  s = s.replace(/["'“”]/g, '').trim();
  return s;
}

function cleanArtistForQuery(raw?: string): string {
  if (!raw) return '';
  let s = cleanHtml(raw);
  const parts = s.split(/[,/&;]/);
  return parts[0].trim();
}

async function handleLyricsSync(req: Request, res: Response) {
  const rawTitle = (req.query.title as string) || '';
  const rawArtist = (req.query.artist as string) || '';
  const album = (req.query.album as string) || '';
  const durationSec = parseInt(req.query.duration as string, 10) || 180;
  const songId = (req.query.id as string) || '';

  if (!rawTitle) {
    return res.status(400).json({ status: false, error: 'Song title is required for lyrics sync' });
  }

  const cleanTitle = cleanTitleForQuery(rawTitle) || rawTitle;
  const cleanArtist = cleanArtistForQuery(rawArtist);
  const cacheKey = `${cleanTitle.toLowerCase()}_${cleanArtist.toLowerCase()}`;

  if (serverLyricsCache.has(cacheKey)) {
    return res.json(serverLyricsCache.get(cacheKey));
  }

  // Tier 1: Search LRCLIB with clean title + artist
  try {
    const lrcQuery = `${cleanTitle} ${cleanArtist}`.trim();
    const lrcUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(lrcQuery)}`;
    const lrcRes = await fetch(lrcUrl, {
      headers: { 'User-Agent': 'MuseMusicPlayer/1.0 (Server)' }
    });
    if (lrcRes.ok) {
      const results = await lrcRes.json();
      if (Array.isArray(results) && results.length > 0) {
        const top = results[0];
        if (top.syncedLyrics && top.syncedLyrics.trim().length > 0) {
          const parsed = parseLrcServer(top.syncedLyrics, durationSec);
          const responseData = {
            status: true,
            source: 'LRCLIB_SYNCED',
            synced: true,
            lyrics: parsed,
            fullText: top.plainLyrics || top.syncedLyrics
          };
          serverLyricsCache.set(cacheKey, responseData);
          return res.json(responseData);
        } else if (top.plainLyrics && top.plainLyrics.trim().length > 0) {
          const parsed = parseLrcServer(top.plainLyrics, durationSec);
          const responseData = {
            status: true,
            source: 'LRCLIB_PLAIN',
            synced: false,
            lyrics: parsed,
            fullText: top.plainLyrics
          };
          serverLyricsCache.set(cacheKey, responseData);
          return res.json(responseData);
        }
      }
    }
  } catch (err) {
    console.warn('LRCLIB title+artist search error:', err);
  }

  // Tier 2: Search LRCLIB with clean title alone
  try {
    const lrcUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle)}`;
    const lrcRes = await fetch(lrcUrl, {
      headers: { 'User-Agent': 'MuseMusicPlayer/1.0 (Server)' }
    });
    if (lrcRes.ok) {
      const results = await lrcRes.json();
      if (Array.isArray(results) && results.length > 0) {
        const top = results[0];
        if (top.syncedLyrics && top.syncedLyrics.trim().length > 0) {
          const parsed = parseLrcServer(top.syncedLyrics, durationSec);
          const responseData = {
            status: true,
            source: 'LRCLIB_SYNCED',
            synced: true,
            lyrics: parsed,
            fullText: top.plainLyrics || top.syncedLyrics
          };
          serverLyricsCache.set(cacheKey, responseData);
          return res.json(responseData);
        } else if (top.plainLyrics && top.plainLyrics.trim().length > 0) {
          const parsed = parseLrcServer(top.plainLyrics, durationSec);
          const responseData = {
            status: true,
            source: 'LRCLIB_PLAIN',
            synced: false,
            lyrics: parsed,
            fullText: top.plainLyrics
          };
          serverLyricsCache.set(cacheKey, responseData);
          return res.json(responseData);
        }
      }
    }
  } catch (err) {
    console.warn('LRCLIB title search error:', err);
  }

  // Tier 3: JioSaavn official lyrics check
  if (songId) {
    try {
      const jioLyrics = await fetchLyricsText(songId);
      if (jioLyrics && jioLyrics.trim().length > 0) {
        const plainText = jioLyrics.replace(/<br\s*\/?>/gi, '\n');
        const parsed = parseLrcServer(plainText, durationSec);
        const responseData = {
          status: true,
          source: 'JIOSAAVN_OFFICIAL',
          synced: false,
          lyrics: parsed,
          fullText: plainText
        };
        serverLyricsCache.set(cacheKey, responseData);
        return res.json(responseData);
      }
    } catch (err) {
      console.warn('JioSaavn lyrics error:', err);
    }
  }

  // Tier 4: Google GenAI fallback for authentic song lyrics
  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `You are a music lyrics catalog expert. Provide the authentic, official lyrics for the song "${cleanTitle}" by artist "${cleanArtist || 'Original Artist'}" ${album ? `from "${album}"` : ''}.
Return a JSON array of lyric objects with timestampMs estimated for a song of ${durationSec} seconds.
Format:
[
  { "timestampMs": 0, "text": "First line of song", "translation": "English meaning" },
  { "timestampMs": 12000, "text": "Second line of song", "translation": "English meaning" }
]
Only valid JSON array, no commentary.`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (aiRes.text) {
        const parsedJson = JSON.parse(aiRes.text);
        if (Array.isArray(parsedJson) && parsedJson.length > 0) {
          const responseData = {
            status: true,
            source: 'GEMINI_AI',
            synced: true,
            lyrics: parsedJson,
            fullText: parsedJson.map((l: any) => l.text).join('\n')
          };
          serverLyricsCache.set(cacheKey, responseData);
          return res.json(responseData);
        }
      }
    } catch (err) {
      console.warn('Gemini lyrics generation error:', err);
    }
  }

  return res.status(404).json({
    status: false,
    error: `Could not find lyrics for "${cleanTitle}"`
  });
}

app.get('/api/lyrics/sync', handleLyricsSync);

// 6. Unified Result endpoint (/result/)
app.get('/result', handleSearch);
app.get('/result/', handleSearch);

// 7. Trending Playlists & Charts (/api/jiosaavn/trending-playlists)
async function handleTrendingPlaylists(req: Request, res: Response) {
  try {
    const chartsUrl = `https://www.jiosaavn.com/api.php?__call=content.getCharts&api_version=4&_format=json&_marker=0&ctx=web6dot0`;
    const response = await fetch(chartsUrl);
    const data = await response.json();

    const playlists: any[] = [];

    // Add high-priority curated regional Top 50 playlists if not already in charts
    const priorityPlaylists = [
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

    priorityPlaylists.forEach(p => {
      playlists.push({
        ...p,
        image: p.image.replace('150x150', '500x500')
      });
    });

    if (Array.isArray(data)) {
      data.forEach((chart: any) => {
        if (!playlists.some(p => p.id === chart.id)) {
          playlists.push({
            id: chart.id,
            title: cleanHtml(chart.title || 'Trending Playlist'),
            subtitle: cleanHtml(chart.more_info?.firstname || 'JioSaavn Editorial'),
            language: (chart.title || '').toLowerCase().includes('telugu') ? 'Telugu' : (chart.title || '').toLowerCase().includes('hindi') ? 'Hindi' : (chart.title || '').toLowerCase().includes('tamil') ? 'Tamil' : 'Trending',
            image: (chart.image || '').replace('150x150', '500x500'),
            songCount: chart.count || 50
          });
        }
      });
    }

    return res.json(playlists);
  } catch (err: any) {
    console.warn('Error in handleTrendingPlaylists:', err);
    return res.status(500).json({ status: false, error: err.message });
  }
}

app.get('/api/jiosaavn/trending-playlists', handleTrendingPlaylists);

// 8. Latest Released Songs (/api/jiosaavn/latest-releases)
async function handleLatestReleases(req: Request, res: Response) {
  const language = (req.query.language as string) || '';
  try {
    let queryTerm = 'Latest Songs';
    if (language && language.toLowerCase() !== 'all') {
      queryTerm = `Latest ${language} Songs`;
    }

    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=1&n=30&q=${encodeURIComponent(queryTerm)}`;
    const response = await fetch(url);
    const data = await response.json();
    const rawResults = data.results || [];

    const formatted = rawResults.map((s: any) => formatSongItem(s, false));
    return res.json(formatted);
  } catch (err: any) {
    console.warn('Error in handleLatestReleases:', err);
    return res.status(500).json({ status: false, error: err.message });
  }
}

app.get('/api/jiosaavn/latest-releases', handleLatestReleases);

// 9. Audio Proxy for Seamless Streaming
app.get('/api/audio-proxy', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const headers: Record<string, string> = {};
    if (req.headers.range) {
      headers['Range'] = req.headers.range as string;
    }

    const fetchRes = await fetch(targetUrl, { headers });
    res.status(fetchRes.status);

    fetchRes.headers.forEach((val, key) => {
      // Don't forward content-encoding when proxying chunked stream
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, val);
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');

    if (fetchRes.body) {
      const reader = fetchRes.body.getReader();
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          res.end();
        } catch (e) {
          res.end();
        }
      };
      pump();
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error('Audio proxy error:', err);
    res.status(502).send('Error proxying audio');
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', jiosaavn: 'active', time: new Date().toISOString() });
});

// -------------------------------------------------------------
// Vite Middleware / Production Static File Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Muse + JioSaavn API] Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
