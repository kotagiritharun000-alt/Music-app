import { LyricLine } from '../types';

/**
 * Decodes common HTML entities found in scraped or API lyrics.
 */
export function decodeLyricsEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .trim();
}

/**
 * Parses LRC (LyRiCs) formatted text with timestamps [mm:ss.xx] into structured LyricLine array.
 */
export function parseLrcToLyricLines(
  lrcContent: string,
  totalDurationMs: number = 180000,
  fallbackSongTitle?: string
): LyricLine[] {
  if (!lrcContent || !lrcContent.trim()) {
    return [];
  }

  const cleanedContent = decodeLyricsEntities(lrcContent);
  const rawLines = cleanedContent.split('\n');
  const parsedLines: LyricLine[] = [];

  // Timestamp regex: [mm:ss.xx] or [mm:ss.xxx] or [mm:ss]
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  let hasTimestampMatch = false;

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Ignore metadata tags like [ti:Title], [ar:Artist], [al:Album], [length:...]
    if (/^\[(ti|ar|al|by|offset|length|re|ve):/i.test(trimmed)) {
      continue;
    }

    // Find all timestamp tags in this line (some lines have multiple timestamps)
    const matches = Array.from(trimmed.matchAll(timeRegex));

    if (matches.length > 0) {
      hasTimestampMatch = true;
      // The text is whatever is left after stripping all [mm:ss.xx] tags
      const textOnly = trimmed.replace(timeRegex, '').trim();

      if (textOnly) {
        for (const match of matches) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseInt(match[2], 10);
          const msFraction = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
          const timestampMs = (minutes * 60 + seconds) * 1000 + msFraction;

          parsedLines.push({
            timestampMs,
            text: textOnly,
            translation: undefined,
            aiNote: undefined
          });
        }
      }
    }
  }

  // If valid timestamped lines were parsed, sort them chronologically and return
  if (hasTimestampMatch && parsedLines.length > 0) {
    parsedLines.sort((a, b) => a.timestampMs - b.timestampMs);

    // Filter out potential duplicate consecutive timestamps with identical text
    const deduplicated: LyricLine[] = [];
    for (let i = 0; i < parsedLines.length; i++) {
      const cur = parsedLines[i];
      const prev = deduplicated[deduplicated.length - 1];
      if (!prev || prev.timestampMs !== cur.timestampMs || prev.text !== cur.text) {
        deduplicated.push(cur);
      }
    }
    return deduplicated;
  }

  // Fallback: Plain text lyrics without LRC timestamps
  // Split into verse lines and evenly distribute across song duration
  const plainLines = cleanedContent
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !/^\[(ti|ar|al|by|length):/i.test(l));

  if (plainLines.length === 0) {
    return [];
  }

  const safeDuration = totalDurationMs > 10000 ? totalDurationMs : 180000;
  // Intro delay of ~5-8 seconds, outro buffer of ~10 seconds
  const startOffsetMs = Math.min(6000, Math.floor(safeDuration * 0.04));
  const usableDurationMs = Math.max(10000, safeDuration - startOffsetMs - 10000);
  const stepMs = Math.floor(usableDurationMs / plainLines.length);

  return plainLines.map((text, idx) => ({
    timestampMs: startOffsetMs + idx * stepMs,
    text,
    translation: idx === 0 && fallbackSongTitle ? `Official Lyrics • ${fallbackSongTitle}` : undefined,
    aiNote: undefined
  }));
}
