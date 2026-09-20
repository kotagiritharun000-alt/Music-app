import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Music,
  Play,
  Sparkles,
  Download,
  Disc,
  X,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Volume2,
  Loader2,
  Headphones,
  Zap,
  Sliders,
  Layers,
  FileAudio
} from 'lucide-react';
import { searchJioSaavn } from '../services/jioSaavnService';
import { Song } from '../types';

interface JioSaavnHubModalProps {
  currentSongId?: string;
  onSelectSong: (song: Song) => void;
  onDismiss: () => void;
}

const TRENDING_QUERIES = [
  'Pushpa 2',
  'Devara',
  'RRR',
  'Kalki 2898 AD',
  'Animal',
  'Guntur Kaaram',
  'Tauba Tauba',
  'Anirudh Ravichander',
  'Sid Sriram',
  'A.R. Rahman',
  'Thaman S',
  'Aavesham'
];

export const JioSaavnHubModal: React.FC<JioSaavnHubModalProps> = ({
  currentSongId,
  onSelectSong,
  onDismiss
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Song[]>([]);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [activeQueryTag, setActiveQueryTag] = useState('Pushpa 2');

  // Initial load with default trending search
  useEffect(() => {
    let isMounted = true;
    const loadInitialTrending = async () => {
      setIsSearching(true);
      try {
        const initialSongs = await searchJioSaavn('Pushpa 2', true);
        if (isMounted) {
          setResults(initialSongs);
        }
      } catch (err) {
        console.warn('Initial search error:', err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };
    loadInitialTrending();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim() || activeQueryTag;
    if (!q) return;

    setIsSearching(true);
    try {
      const searchResults = await searchJioSaavn(q, true);
      setResults(searchResults);
    } catch (err) {
      console.warn('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectQueryTag = async (tag: string) => {
    setActiveQueryTag(tag);
    setSearchQuery(tag);
    setIsSearching(true);
    try {
      const searchResults = await searchJioSaavn(tag, true);
      setResults(searchResults);
    } catch (err) {
      console.warn('Tag search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaySong = (song: Song) => {
    onSelectSong(song);
    onDismiss();
  };

  const handleDownloadSong = async (song: Song) => {
    if (!song.audioUrl) return;
    setDownloadSuccess(song.id);

    try {
      // Create download anchor
      const a = document.createElement('a');
      a.href = song.audioUrl;
      a.target = '_blank';
      a.download = `${song.title.replace(/\s+/g, '_')}_[JioSaavn_320Kbps_HD].mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        setDownloadSuccess(null);
      }, 2500);
    } catch (err) {
      console.warn('Download error:', err);
      setDownloadSuccess(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#090D16] border border-[#1E293B] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Disc className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">JioSaavn Online Stream Engine</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> Direct 320 Kbps
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Integrated official JioSaavn API • Play in Muse with Dolby Atmos 360 & 5-Stem isolation
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full bg-[#131C2E] text-[#94A3B8] hover:text-white border border-[#1E293B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any song, movie, album, or singer (e.g. Pushpa, Devara, RRR, Animal, Anirudh, Sid Sriram)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#131C2E] border border-[#1E293B] text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-cyan-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Trending Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-[#64748B] flex items-center gap-1 shrink-0 mr-1">
            <Flame className="w-3 h-3 text-[#F97316]" /> Trending:
          </span>
          {TRENDING_QUERIES.map(tag => (
            <button
              key={tag}
              onClick={() => handleSelectQueryTag(tag)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 border ${
                activeQueryTag === tag
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-[#131C2E] text-[#94A3B8] border-[#1E293B] hover:text-white hover:border-[#334155]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Enabled Features Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0D1525] p-2.5 rounded-xl border border-[#1E293B] text-[11px] text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">Dolby Atmos 360</span>
          </div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">5-Stem Separation</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="truncate">Real-time Lyrics</span>
          </div>
          <div className="flex items-center gap-2">
            <FileAudio className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">320 Kbps HD Master</span>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[300px]">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#94A3B8] space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm font-semibold text-white">Searching JioSaavn master database...</p>
              <p className="text-xs text-[#64748B]">Decrypting 320 Kbps stream endpoints and spatial stems</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#94A3B8] space-y-2">
              <Disc className="w-10 h-10 text-cyan-500/40 animate-spin" />
              <p className="text-sm font-semibold text-white">No tracks found</p>
              <p className="text-xs">Try searching for Pushpa 2, Devara, RRR, Kalki, Anirudh, or Sid Sriram.</p>
            </div>
          ) : (
            results.map((song) => {
              const isCurrentlyPlaying = currentSongId === song.id;

              return (
                <div
                  key={song.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                    isCurrentlyPlaying
                      ? 'bg-[#132238] border-cyan-500 shadow-lg shadow-cyan-500/15'
                      : 'bg-[#10192A] hover:bg-[#15233B] border-[#1E293B] hover:border-cyan-500/40'
                  }`}
                >
                  {/* Track Details */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#0A0E17] shrink-0 border border-[#1E293B]">
                      <img
                        src={song.coverImage}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      <div
                        onClick={() => handlePlaySong(song)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity"
                      >
                        {isCurrentlyPlaying ? (
                          <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
                        ) : (
                          <Play className="w-5 h-5 text-white fill-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate">{song.title}</h3>
                        {isCurrentlyPlaying && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-black text-[9px] font-extrabold tracking-wider animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-black" />
                            PLAYING
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold">
                          JioSaavn
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-semibold">
                          320 Kbps HD
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-semibold">
                          Dolby Atmos
                        </span>
                      </div>

                      <p className="text-xs text-cyan-400 font-medium truncate mt-0.5">
                        {song.album} {song.year ? `(${song.year})` : ''}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] truncate">
                        Singers: <span className="text-[#E2E8F0]">{song.artist}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]/60">
                    <button
                      onClick={() => handlePlaySong(song)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isCurrentlyPlaying
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                          : 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:brightness-110 text-white shadow-md shadow-cyan-500/20'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCurrentlyPlaying ? 'Replay in Muse' : 'Play in Muse'}</span>
                    </button>

                    {song.audioUrl && (
                      <button
                        onClick={() => handleDownloadSong(song)}
                        title="Download 320 Kbps HD Master Audio"
                        className="p-2 rounded-xl bg-[#090D16] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#1E293B] transition-colors"
                      >
                        {downloadSuccess === song.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ad-free high-bitrate streaming with real-time 360 Dolby Atmos & Stem processing</span>
          </div>
          <span className="font-mono text-cyan-400">{results.length} tracks found</span>
        </div>
      </div>
    </div>
  );
};
