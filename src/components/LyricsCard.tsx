import React, { useEffect, useRef, useState } from 'react';
import { Bot, ChevronRight, Download, FileText, MessageSquareText, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { LyricLine, Song } from '../types';
import { generateLyricsPdf } from '../utils/lyricsPdfGenerator';

interface LyricsCardProps {
  currentSong: Song;
  currentPositionMs: number;
  onOpenLyricsChat: () => void;
  onOpenFullLyrics?: () => void;
  onSeekTo: (ms: number) => void;
  onRefreshLyrics?: () => void;
  isLoadingLyrics?: boolean;
}

export const LyricsCard: React.FC<LyricsCardProps> = ({
  currentSong,
  currentPositionMs,
  onOpenLyricsChat,
  onOpenFullLyrics,
  onSeekTo,
  onRefreshLyrics,
  isLoadingLyrics = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Find active lyric line based on current position
  const activeIndex = currentSong.lyrics.reduce((acc, lyric, index) => {
    return currentPositionMs >= lyric.timestampMs ? index : acc;
  }, -1);

  useEffect(() => {
    if (activeIndex !== -1 && containerRef.current) {
      const activeEl = containerRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  const handleQuickPdfDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      generateLyricsPdf(currentSong);
      setTimeout(() => setDownloading(false), 2000);
    } catch (err) {
      console.error(err);
      setDownloading(false);
    }
  };

  const currentLyric = activeIndex >= 0 ? currentSong.lyrics[activeIndex] : null;

  const sourceBadge = currentSong.lyricsSource === 'LRCLIB_SYNCED'
    ? 'Synced LRC'
    : currentSong.lyricsSource === 'JIOSAAVN_OFFICIAL'
    ? 'Official'
    : currentSong.lyricsSource === 'CURATED_DB'
    ? 'Verified Master'
    : currentSong.lyricsSource === 'GEMINI_AI'
    ? 'AI Synced'
    : 'Dolby Atmos Synced';

  return (
    <div className="w-full bg-[#130905] border border-[#2C1910] rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-[#FF5014]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Synced Lyrics & Vocal Sheet
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-[#FF5014]/15 border border-[#FF5014]/30 text-[10px] text-[#FF7A45] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            {sourceBadge}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onRefreshLyrics && (
            <button
              onClick={onRefreshLyrics}
              disabled={isLoadingLyrics}
              className="p-1.5 rounded-full bg-[#1F100A] hover:bg-[#2C1910] text-[#8E9299] hover:text-white border border-[#2C1910] text-xs transition-all"
              title="Re-sync or refresh official lyrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLyrics ? 'animate-spin text-[#FF5014]' : ''}`} />
            </button>
          )}

          {onOpenFullLyrics && (
            <button
              onClick={onOpenFullLyrics}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1F100A] hover:bg-[#2C1910] text-[#E0D8D0] border border-[#2C1910] text-xs font-semibold transition-all hover:scale-105"
              title="View full song lyrics"
            >
              <FileText className="w-3.5 h-3.5 text-[#FF7A45]" />
              <span>Full Lyrics</span>
            </button>
          )}

          <button
            onClick={handleQuickPdfDownload}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF5014]/15 hover:bg-[#FF5014]/25 text-[#FF7A45] border border-[#FF5014]/30 text-xs font-semibold transition-all hover:scale-105"
            title="Download lyrics in PDF format"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Exporting...' : 'PDF'}</span>
          </button>

          <button
            onClick={onOpenLyricsChat}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1F100A] hover:bg-[#2C1910] text-[#8E9299] hover:text-[#E0D8D0] border border-[#2C1910] text-xs font-semibold transition-all"
            title="Ask AI about lyrics meaning & translations"
          >
            <Bot className="w-3.5 h-3.5 text-[#FF7A45]" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>

      {/* Active Lyric Spotlight */}
      {currentLyric && (
        <div className="p-3 rounded-xl bg-[#1A100B] border border-[#FF5014]/20 space-y-1">
          <p className="text-sm sm:text-base font-bold text-white transition-all">
            "{currentLyric.text}"
          </p>
          {currentLyric.translation && (
            <p className="text-xs text-[#8E9299] italic">
              Meaning: {currentLyric.translation}
            </p>
          )}
          {currentLyric.aiNote && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#FF7A45] font-medium pt-0.5">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="truncate">AI Subtext: {currentLyric.aiNote}</span>
            </div>
          )}
        </div>
      )}

      {/* Scrollable Lyric Lines List */}
      <div
        ref={containerRef}
        className="max-h-40 overflow-y-auto space-y-2 pr-1 scrollbar-thin divide-y divide-[#2C1910]/40"
      >
        {currentSong.lyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={idx}
              onClick={() => onSeekTo(line.timestampMs)}
              className={`pt-2 cursor-pointer transition-all ${
                isActive
                  ? 'text-white font-semibold pl-2 border-l-2 border-[#FF5014] bg-[#FF5014]/5 rounded-r-lg'
                  : 'text-[#8E9299] hover:text-[#E0D8D0]'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs sm:text-sm">{line.text}</span>
                <span className="text-[10px] font-mono text-[#5F5B57] shrink-0">
                  {Math.floor(line.timestampMs / 60000)}:
                  {Math.floor((line.timestampMs % 60000) / 1000)
                    .toString()
                    .padStart(2, '0')}
                </span>
              </div>
              {line.translation && isActive && (
                <p className="text-[11px] text-[#A69B95] italic mt-0.5">
                  {line.translation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
