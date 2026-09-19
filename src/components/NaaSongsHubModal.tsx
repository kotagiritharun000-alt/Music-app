import React, { useState, useMemo } from 'react';
import {
  Search,
  Music,
  Play,
  Sparkles,
  Download,
  Disc,
  Filter,
  X,
  CheckCircle2,
  ShieldCheck,
  Flame,
  FolderOpen,
  Radio,
  Link,
  Volume2
} from 'lucide-react';
import { NAA_SONGS_CATALOG, convertNaaSongToSong } from '../data/naaSongsData';
import { generateNaaSongAudioBlob } from '../audio/naaSongsAudioSynthesizer';
import { NaaSongsTrack, Song, StemCategory } from '../types';

interface NaaSongsHubModalProps {
  currentSongId?: string;
  onSelectSong: (song: Song) => void;
  onOpenLocalFilePicker: () => void;
  onDismiss: () => void;
}

export const NaaSongsHubModal: React.FC<NaaSongsHubModalProps> = ({
  currentSongId,
  onSelectSong,
  onOpenLocalFilePicker,
  onDismiss
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'NaaSongs' | 'SenSongs'>('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [showDirectUrlInput, setShowDirectUrlInput] = useState(false);
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [customSongTitle, setCustomSongTitle] = useState('');

  const filteredTracks = useMemo(() => {
    return NAA_SONGS_CATALOG.filter(track => {
      const matchesFilter = activeFilter === 'ALL' || track.portalSource === activeFilter;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesFilter;

      const matchesSearch =
        track.title.toLowerCase().includes(query) ||
        track.movie.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.musicDirector.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [searchQuery, activeFilter]);

  const handlePlayTrack = (track: NaaSongsTrack) => {
    const song = convertNaaSongToSong(track);
    onSelectSong(song);
    onDismiss();
  };

  const handleDownloadTrack = (track: NaaSongsTrack) => {
    setDownloadSuccess(track.id);
    try {
      const blob = generateNaaSongAudioBlob(track, 60);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.title.replace(/\s+/g, '_')}_[${track.portalSource}_320Kbps_HD].wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setDownloadSuccess(null);
      }, 2500);
    } catch (e) {
      console.warn('Download error:', e);
      setDownloadSuccess(null);
    }
  };

  const handlePlayCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAudioUrl.trim()) return;

    const title = customSongTitle.trim() || 'NaaSongs Direct Stream';
    const customSong: Song = {
      id: `custom_stream_${Date.now()}`,
      title: title,
      artist: 'NaaSongs / SenSongs Web Stream',
      album: 'Online HD Audio Stream',
      durationMs: 240000,
      bpm: 124,
      key: 'D Major',
      genre: 'Telugu Cinema Soundtrack',
      gradientStart: '#FF5014',
      gradientEnd: '#8B2500',
      isDolbyAtmos: true,
      isHiResLossless: true,
      bitDepth: 24,
      sampleRateKhz: 96,
      sourcePortal: 'NaaSongs',
      audioUrl: customAudioUrl.trim(),
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
      description: 'Online direct audio stream with Dolby Atmos 360.',
      stems: [
        {
          id: 'stream_stem_1',
          name: 'Main Audio & Vocals',
          category: StemCategory.MAIN_MELODY,
          durationMs: 240000,
          waveformPoints: Array.from({ length: 48 }, () => 0.5),
          isRingtoneRecommended: true,
          description: 'Live audio stream with Dolby Atmos 360 spatialization.'
        }
      ],
      lyrics: [
        {
          timestampMs: 0,
          text: 'Streaming direct from NaaSongs / SenSongs portal...',
          translation: 'Direct High-Resolution Web Audio Stream',
          aiNote: 'Dolby Atmos 360 spatial acoustic engine active.'
        },
        {
          timestampMs: 5000,
          text: 'Dolby Atmos 360 spatial acoustic engine active',
          translation: 'Surround Sound Audio Processed',
          aiNote: 'Spatial panner and clarity boost enabled.'
        }
      ]
    };

    onSelectSong(customSong);
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#110804] border border-[#2C1910] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C1910] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5014] to-[#B91C1C] flex items-center justify-center text-white shadow-lg shadow-[#FF5014]/20 border border-[#FF7A45]/30">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">NaaSongs & SenSongs Hub</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#FF5014]/20 text-[#FF7A45] text-[10px] font-bold border border-[#FF5014]/30">
                  Instant Play in Muse
                </span>
              </div>
              <p className="text-xs text-[#8E9299]">
                High-fidelity 320 Kbps HD Master with real audio playback & Dolby Atmos 360
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full bg-[#1A100B] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dual Quick Action Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Open Local Downloaded Songs */}
          <div
            onClick={() => {
              onDismiss();
              onOpenLocalFilePicker();
            }}
            className="p-3 rounded-xl bg-[#1A100B] hover:bg-[#24150D] border border-[#22C55E]/40 cursor-pointer flex items-center justify-between gap-3 group transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] shrink-0">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white group-hover:text-[#22C55E] transition-colors truncate">
                  Open Downloaded Songs
                </h4>
                <p className="text-[10px] text-[#8E9299] truncate">
                  Load downloaded MP3 / M4A files from device
                </p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-md bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold shrink-0">
              Browse
            </span>
          </div>

          {/* Paste Direct Audio Link */}
          <div
            onClick={() => setShowDirectUrlInput(prev => !prev)}
            className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition-colors ${
              showDirectUrlInput
                ? 'bg-[#24150D] border-[#FF5014]'
                : 'bg-[#1A100B] hover:bg-[#24150D] border-[#FF5014]/40'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#FF5014]/15 border border-[#FF5014]/30 flex items-center justify-center text-[#FF7A45] shrink-0">
                <Link className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">
                  Paste Stream URL
                </h4>
                <p className="text-[10px] text-[#8E9299] truncate">
                  Stream direct NaaSongs/SenSongs audio link
                </p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-md bg-[#FF5014]/20 text-[#FF7A45] text-[10px] font-bold shrink-0">
              {showDirectUrlInput ? 'Close' : 'Stream'}
            </span>
          </div>
        </div>

        {/* Direct Audio URL Form (Collapsible) */}
        {showDirectUrlInput && (
          <form onSubmit={handlePlayCustomUrl} className="p-3.5 rounded-2xl bg-[#170B06] border border-[#FF5014]/50 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FF7A45] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                <span>Stream Direct Online Audio Track in Muse</span>
              </span>
              <span className="text-[10px] text-[#8E9299]">Supports .mp3, .aac, .m4a, .wav</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Song Title (optional)"
                value={customSongTitle}
                onChange={e => setCustomSongTitle(e.target.value)}
                className="sm:col-span-1 px-3 py-2 rounded-xl bg-[#0F0603] border border-[#2C1910] text-xs text-white placeholder-[#8E9299] focus:outline-none focus:border-[#FF5014]"
              />
              <input
                type="url"
                required
                placeholder="Paste direct audio stream URL (https://...mp3)"
                value={customAudioUrl}
                onChange={e => setCustomAudioUrl(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-[#0F0603] border border-[#2C1910] text-xs text-white placeholder-[#8E9299] focus:outline-none focus:border-[#FF5014]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF5014] to-[#E64009] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#FF5014]/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Stream in Muse with Dolby Atmos</span>
              </button>
            </div>
          </form>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8E9299] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Telugu movie, song, or composer (Pushpa 2, Devara, RRR, Kalki, Anirudh, Thaman)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1A100B] border border-[#2C1910] text-xs text-white placeholder-[#8E9299] focus:outline-none focus:border-[#FF5014] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#1A100B] border border-[#2C1910] rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === 'ALL'
                  ? 'bg-[#FF5014] text-white shadow-sm'
                  : 'text-[#8E9299] hover:text-white'
              }`}
            >
              All ({NAA_SONGS_CATALOG.length})
            </button>
            <button
              onClick={() => setActiveFilter('NaaSongs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                activeFilter === 'NaaSongs'
                  ? 'bg-[#FF5014] text-white shadow-sm'
                  : 'text-[#8E9299] hover:text-white'
              }`}
            >
              <Disc className="w-3 h-3" />
              <span>NaaSongs</span>
            </button>
            <button
              onClick={() => setActiveFilter('SenSongs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                activeFilter === 'SenSongs'
                  ? 'bg-[#FF5014] text-white shadow-sm'
                  : 'text-[#8E9299] hover:text-white'
              }`}
            >
              <Music className="w-3 h-3" />
              <span>SenSongs</span>
            </button>
          </div>
        </div>

        {/* Songs Grid / List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[280px]">
          {filteredTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[#8E9299] space-y-2">
              <Disc className="w-10 h-10 text-[#FF5014]/50 animate-spin" />
              <p className="text-sm font-semibold text-white">No movie songs matched "{searchQuery}"</p>
              <p className="text-xs">Try searching for Pushpa, Devara, RRR, Kalki, Thaman, or Anirudh.</p>
            </div>
          ) : (
            filteredTracks.map(track => {
              const isCurrentlyActive = currentSongId === track.id;

              return (
                <div
                  key={track.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                    isCurrentlyActive
                      ? 'bg-[#24150D] border-[#FF5014] shadow-lg shadow-[#FF5014]/15'
                      : 'bg-[#1A100B] hover:bg-[#24150D] border-[#2C1910] hover:border-[#FF5014]/40'
                  }`}
                >
                  {/* Track Details */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#0A0502] shrink-0 border border-[#2C1910]">
                      <img
                        src={track.albumArt}
                        alt={track.movie}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      <div
                        onClick={() => handlePlayTrack(track)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity"
                      >
                        {isCurrentlyActive ? (
                          <Volume2 className="w-5 h-5 text-[#FF5014] animate-pulse" />
                        ) : (
                          <Play className="w-5 h-5 text-white fill-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate">{track.title}</h3>
                        {isCurrentlyActive && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FF5014] text-white text-[9px] font-extrabold tracking-wider animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            PLAYING
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          track.portalSource === 'NaaSongs'
                            ? 'bg-[#FF5014]/20 text-[#FF7A45] border border-[#FF5014]/30'
                            : 'bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30'
                        }`}>
                          {track.portalSource}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] text-[9px] font-semibold">
                          {track.bitrate}
                        </span>
                      </div>

                      <p className="text-xs text-[#FF7A45] font-medium truncate">{track.movie}</p>
                      <p className="text-[11px] text-[#8E9299] truncate">
                        Music: <span className="text-[#E0D8D0]">{track.musicDirector}</span> • Singers: {track.artist}
                      </p>
                      <p className="text-[10px] text-[#8E9299]/80 italic truncate mt-0.5">
                        "{track.lyricsSnippet}"
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2C1910]/60">
                    <button
                      onClick={() => handlePlayTrack(track)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isCurrentlyActive
                          ? 'bg-[#22C55E] text-black shadow-md shadow-[#22C55E]/20'
                          : 'bg-gradient-to-r from-[#FF5014] to-[#E64009] hover:brightness-110 text-white shadow-md shadow-[#FF5014]/20'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCurrentlyActive ? 'Replay in Muse' : 'Play in Muse'}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadTrack(track)}
                      title="Download 320Kbps HD Audio Track to Device"
                      className="p-2 rounded-xl bg-[#0A0502] hover:bg-[#2C1910] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
                    >
                      {downloadSuccess === track.id ? (
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#2C1910] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8E9299]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Ad-free playback with 5-stem isolation & Dolby Atmos 360 enabled</span>
          </div>
          <span className="font-mono text-[#FF7A45]">{filteredTracks.length} movie tracks available</span>
        </div>
      </div>
    </div>
  );
};
