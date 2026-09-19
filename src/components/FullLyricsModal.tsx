import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, Sparkles, X, Copy, Check, Music, Edit3, Volume2, Share2 } from 'lucide-react';
import { Song, LyricLine } from '../types';
import { generateLyricsPdf } from '../utils/lyricsPdfGenerator';

interface FullLyricsModalProps {
  currentSong: Song;
  currentPositionMs: number;
  onSeekTo: (ms: number) => void;
  onUpdateLyrics?: (newLyrics: LyricLine[]) => void;
  onDismiss: () => void;
}

export const FullLyricsModal: React.FC<FullLyricsModalProps> = ({
  currentSong,
  currentPositionMs,
  onSeekTo,
  onUpdateLyrics,
  onDismiss
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activeIndex = currentSong.lyrics.reduce((acc, lyric, index) => {
    return currentPositionMs >= lyric.timestampMs ? index : acc;
  }, -1);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIndex !== -1 && listRef.current && !isEditing) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex, isEditing]);

  const handleDownloadPdf = () => {
    try {
      generateLyricsPdf(currentSong);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  const handleCopyLyrics = () => {
    const textContent = currentSong.lyrics
      .map(
        (l) =>
          `[${Math.floor(l.timestampMs / 60000)}:${Math.floor((l.timestampMs % 60000) / 1000)
            .toString()
            .padStart(2, '0')}] ${l.text}\nMeaning: ${l.translation}\n`
      )
      .join('\n');

    navigator.clipboard.writeText(
      `Song: ${currentSong.title}\nArtist: ${currentSong.artist}\nAlbum: ${currentSong.album}\nFormat: Dolby Atmos 360 Lossless\n\n${textContent}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCustomLyrics = () => {
    if (!editedText.trim()) {
      setIsEditing(false);
      return;
    }

    const lines = editedText.split('\n').filter((l) => l.trim().length > 0);
    const durPerLine = Math.floor(currentSong.durationMs / Math.max(1, lines.length));

    const newLyrics: LyricLine[] = lines.map((lineText, idx) => ({
      timestampMs: idx * durPerLine,
      text: lineText.trim(),
      translation: 'Custom User-Authored Lyric Line',
      aiNote: 'Dolby Atmos 360 vocal sync.'
    }));

    if (onUpdateLyrics) {
      onUpdateLyrics(newLyrics);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-[#140A06] border border-[#2C1910] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1F100A] text-[#8E9299] hover:text-white hover:bg-[#2C1910] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pr-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5014]/15 border border-[#FF5014]/30 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-[#FF5014]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#FF5014]/20 text-[#FF7A45] text-[10px] font-bold uppercase tracking-wider border border-[#FF5014]/30">
                  Full Song Lyrics
                </span>
                <span className="text-xs text-[#8E9299]">Dolby Atmos Synchronized</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                {currentSong.title}
              </h2>
              <p className="text-xs text-[#8E9299]">
                {currentSong.artist} • {currentSong.album || currentSong.movieName || 'Telugu Master'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#1B0E07] border border-[#2C1910]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5014] to-[#E03E00] hover:from-[#FF6530] hover:to-[#FF5014] text-white text-xs font-bold shadow-md shadow-[#FF5014]/20 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? 'PDF Exported!' : 'Download Lyrics (PDF)'}</span>
            </button>

            <button
              onClick={handleCopyLyrics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24130A] hover:bg-[#2C1910] text-[#E0D8D0] border border-[#2C1910] text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!isEditing) {
                  setEditedText(currentSong.lyrics.map((l) => l.text).join('\n'));
                }
                setIsEditing(!isEditing);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24130A] hover:bg-[#2C1910] text-[#8E9299] hover:text-white border border-[#2C1910] text-xs font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit / Custom Lyrics'}</span>
            </button>
          </div>
        </div>

        {/* Content Area: Lyrics List or Text Editor */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {isEditing ? (
            <div className="flex-1 flex flex-col space-y-3">
              <p className="text-xs text-[#8E9299]">
                Paste or type line-by-line lyrics below. Muse will automatically time-synchronize each line across the track.
              </p>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="Enter full lyrics, one line per verse..."
                rows={10}
                className="w-full flex-1 p-3.5 rounded-xl bg-[#180C07] border border-[#2C1910] text-white text-sm font-sans focus:outline-none focus:border-[#FF5014] resize-none"
              />
              <button
                onClick={handleSaveCustomLyrics}
                className="self-end px-4 py-2 rounded-xl bg-[#FF5014] hover:bg-[#FF6530] text-white text-xs font-bold transition-all"
              >
                Save & Apply Synchronized Lyrics
              </button>
            </div>
          ) : (
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin divide-y divide-[#2C1910]/40"
            >
              {currentSong.lyrics.map((line, idx) => {
                const isActive = idx === activeIndex;
                const seconds = Math.floor(line.timestampMs / 1000);
                const min = Math.floor(seconds / 60);
                const sec = seconds % 60;
                const timeStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;

                return (
                  <div
                    key={idx}
                    onClick={() => onSeekTo(line.timestampMs)}
                    className={`pt-3 pb-2.5 px-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1F100A] border-l-4 border-[#FF5014] text-white shadow-md'
                        : 'hover:bg-[#1A0E08] text-[#A09A94]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                              isActive
                                ? 'bg-[#FF5014]/20 text-[#FF7A45] font-bold'
                                : 'bg-[#24130A] text-[#8E9299]'
                            }`}
                          >
                            {timeStr}
                          </span>
                          <p
                            className={`text-sm sm:text-base font-bold transition-colors ${
                              isActive ? 'text-white' : 'text-[#D0C8C0]'
                            }`}
                          >
                            {line.text}
                          </p>
                        </div>

                        {line.translation && (
                          <p className="text-xs text-[#8E9299] italic pl-11">
                            Meaning: {line.translation}
                          </p>
                        )}

                        {line.aiNote && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#FF7A45] font-medium pl-11 pt-0.5">
                            <Sparkles className="w-3 h-3" />
                            <span>{line.aiNote}</span>
                          </div>
                        )}
                      </div>

                      {isActive && (
                        <div className="shrink-0 pt-1">
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5014] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5014]"></span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-3 border-t border-[#2C1910] flex items-center justify-between text-xs text-[#8E9299]">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-[#FF5014]" />
            <span>Click any line to seek playback</span>
          </span>
          <span className="font-mono">{currentSong.lyrics.length} Synchronized Lines</span>
        </div>
      </div>
    </div>
  );
};
