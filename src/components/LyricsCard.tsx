import React, { useEffect, useRef, useState } from 'react';
import { Bot, ChevronRight, Download, FileText, MessageSquareText, Sparkles } from 'lucide-react';
import { LyricLine, Song } from '../types';
import { generateLyricsPdf } from '../utils/lyricsPdfGenerator';

interface LyricsCardProps {
  currentSong: Song;
  currentPositionMs: number;
  onOpenLyricsChat: () => void;
  onOpenFullLyrics?: () => void;
  onSeekTo: (ms: number) => void;
}

export const LyricsCard: React.FC<LyricsCardProps> = ({
  currentSong,
  currentPositionMs,
  onOpenLyricsChat,
  onOpenFullLyrics,
  onSeekTo
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

  return (
    <div className="w-full bg-[#130905] border border-[#2C1910] rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-[#FF5014]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Synced Lyrics & Vocal Sheet
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
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
          <p className="text-xs text-[#8E9299] italic">
            Translation: {currentLyric.translation}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#FF7A45] font-medium pt-1">
            <Sparkles className="w-3 h-3" />
            <span>AI Subtext: {currentLyric.aiNote}</span>
          </div>
        </div>
      )}

      {/* Scrollable Lyric Lines List */}
      <div
        ref={containerRef}
        className="max-h-36 overflow-y-auto space-y-2 pr-1 scrollbar-thin divide-y divide-[#2C1910]/40"
      >
        {currentSong.lyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={idx}
              onClick={() => onSeekTo(line.timestampMs)}
              className={`pt-2 cursor-pointer transition-all ${
                isActive
                  ? 'text-white font-semibold pl-2 border-l-2 border-[#FF5014]'
                  : 'text-[#8E9299] hover:text-[#E0D8D0]'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs sm:text-sm">{line.text}</span>
                <span className="text-[10px] font-mono text-[#5F5B57] shrink-0">
                  {Math.floor(line.timestampMs / 1000)}s
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
