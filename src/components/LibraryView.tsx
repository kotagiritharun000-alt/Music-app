import React, { useState } from 'react';
import { Download, ListMusic, Music, Play, Search, Sparkles, Trash2, Flame, FolderOpen, Disc } from 'lucide-react';
import { DownloadedAsset, PlaylistItem, Song } from '../types';

interface LibraryViewProps {
  songs: Song[];
  playlists: PlaylistItem[];
  currentSong: Song;
  isPlaying: boolean;
  downloadedAssets: DownloadedAsset[];
  onSelectSong: (song: Song) => void;
  onDeleteAsset: (id: string) => void;
  onDownloadAsset: (asset: DownloadedAsset) => void;
  onOpenNaaSongs?: () => void;
  onOpenLocalFilePicker?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  songs,
  playlists,
  currentSong,
  isPlaying,
  downloadedAssets,
  onSelectSong,
  onDeleteAsset,
  onDownloadAsset,
  onOpenNaaSongs,
  onOpenLocalFilePicker
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.album && song.album.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!selectedPlaylistId) return matchesSearch;

    const playlist = playlists.find((p) => p.id === selectedPlaylistId);
    return matchesSearch && playlist?.songIds.includes(song.id);
  });

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in">
      {/* Search & Filter Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E9299]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, Telugu movie soundtracks, artists, or downloaded files..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#130905] border border-[#2C1910] text-sm text-white focus:outline-none focus:border-[#FF5014] placeholder:text-[#8E9299]"
        />
      </div>

      {/* Featured Portals Quick Access: NaaSongs & Local Downloaded Audio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* NaaSongs & SenSongs Hub Card */}
        <div
          onClick={onOpenNaaSongs}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#1C0D06] via-[#150A04] to-[#0D0502] border border-[#FF5014]/40 hover:border-[#FF5014] cursor-pointer shadow-lg shadow-[#FF5014]/10 transition-all group flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF5014] to-[#991B1B] flex items-center justify-center text-white shadow-md shadow-[#FF5014]/30 shrink-0 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white group-hover:text-[#FF7A45] transition-colors truncate">
                  NaaSongs & SenSongs
                </h4>
                <span className="px-1.5 py-0.5 rounded bg-[#FF5014]/20 text-[#FF7A45] text-[9px] font-bold">
                  320Kbps HD
                </span>
              </div>
              <p className="text-[11px] text-[#8E9299] truncate">
                Pushpa 2, Devara, RRR, Kalki 2898 AD, Guntur Kaaram hits
              </p>
            </div>
          </div>
          <span className="p-2 rounded-xl bg-[#26150D] text-[#FF7A45] group-hover:bg-[#FF5014] group-hover:text-white transition-colors shrink-0">
            <Play className="w-4 h-4 fill-current" />
          </span>
        </div>

        {/* Open Downloaded Songs Card */}
        <div
          onClick={onOpenLocalFilePicker}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#0F1C12] via-[#0A150D] to-[#050C07] border border-[#22C55E]/40 hover:border-[#22C55E] cursor-pointer shadow-lg shadow-[#22C55E]/10 transition-all group flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#15803D] flex items-center justify-center text-black shadow-md shadow-[#22C55E]/30 shrink-0 group-hover:scale-105 transition-transform">
              <FolderOpen className="w-6 h-6 text-black" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white group-hover:text-[#22C55E] transition-colors truncate">
                  Open Downloaded Songs
                </h4>
                <span className="px-1.5 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] text-[9px] font-bold">
                  Device Files
                </span>
              </div>
              <p className="text-[11px] text-[#8E9299] truncate">
                Play downloaded .mp3 & .m4a files with 3D Atmos sound
              </p>
            </div>
          </div>
          <span className="p-2 rounded-xl bg-[#142B1A] text-[#22C55E] group-hover:bg-[#22C55E] group-hover:text-black transition-colors shrink-0">
            <Play className="w-4 h-4 fill-current" />
          </span>
        </div>
      </div>

      {/* Smart Playlists Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-[#FF5014]" />
            <span>Curated Playlists</span>
          </h3>
          {selectedPlaylistId && (
            <button
              onClick={() => setSelectedPlaylistId(null)}
              className="text-xs text-[#FF7A45] hover:underline"
            >
              Show All Songs
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {playlists.map((pl) => {
            const isSelected = selectedPlaylistId === pl.id;
            return (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylistId(isSelected ? null : pl.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                  isSelected
                    ? 'bg-[#1A100B] border-[#FF5014] shadow-lg shadow-[#FF5014]/20'
                    : 'bg-[#130905] border-[#2C1910] hover:border-[#2C1910]/80'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white mb-2.5 shadow-md"
                  style={{ background: pl.gradientColor }}
                >
                  <Music className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white truncate">{pl.name}</h4>
                <p className="text-[10px] text-[#8E9299] truncate mt-0.5">{pl.subtitle}</p>
                <span className="inline-block mt-2 text-[9px] font-semibold text-[#FF7A45]">
                  {pl.songIds.length} Tracks
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Track Catalog List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Music className="w-4 h-4 text-[#FF5014]" />
          <span>Master Catalog ({filteredSongs.length})</span>
        </h3>

        <div className="divide-y divide-[#2C1910] bg-[#130905] rounded-2xl border border-[#2C1910] overflow-hidden">
          {filteredSongs.map((song) => {
            const isCurrent = currentSong.id === song.id;
            return (
              <div
                key={song.id}
                onClick={() => onSelectSong(song)}
                className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isCurrent ? 'bg-[#1A100B]' : 'hover:bg-[#1A100B]/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                    style={{
                      background: `linear-gradient(135deg, ${song.gradientStart}, ${song.gradientEnd})`
                    }}
                  >
                    {isCurrent && isPlaying ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    ) : (
                      <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold truncate ${isCurrent ? 'text-[#FF5014]' : 'text-white'}`}>
                        {song.title}
                      </span>
                      {song.sourcePortal && (
                        <span className="px-1.5 py-0.5 rounded bg-[#FF5014]/15 text-[#FF7A45] text-[9px] font-bold border border-[#FF5014]/30">
                          {song.sourcePortal}
                        </span>
                      )}
                      {song.isDolbyAtmos && (
                        <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-[#22C55E]/15 text-[#22C55E] text-[9px] font-bold">
                          Atmos
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8E9299] truncate">
                      {song.artist} • <span className="text-[#5F5B57]">{song.genre}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-mono text-[#E0D8D0]">{formatDuration(song.durationMs)}</div>
                    <div className="text-[10px] text-[#8E9299]">{song.stems.length} Stems</div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSong(song);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-[#FF5014] text-white'
                        : 'bg-[#1A100B] text-[#8E9299] hover:text-white border border-[#2C1910]'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exported Ringtones & Saved Tones */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4 text-[#22C55E]" />
          <span>Exported Ringtones & Stems ({downloadedAssets.length})</span>
        </h3>

        {downloadedAssets.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#130905] border border-dashed border-[#2C1910] text-center space-y-1">
            <p className="text-xs text-[#8E9299]">No ringtones or stem clips exported yet.</p>
            <p className="text-[11px] text-[#5F5B57]">
              Use the "Trim" button or BGM Stem Mixer to isolate and export clips directly to your device.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {downloadedAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-3.5 rounded-2xl bg-[#130905] border border-[#2C1910] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{asset.title}</h4>
                  <p className="text-[10px] text-[#8E9299]">
                    {asset.sourceTrack} • {asset.type} • {asset.fileSizeMb}MB
                  </p>
                  <span className="text-[9px] text-[#5F5B57]">{asset.dateDownloaded}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onDownloadAsset(asset)}
                    className="p-2 rounded-lg bg-[#1A100B] hover:bg-[#FF5014] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
                    title="Download WAV File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteAsset(asset.id)}
                    className="p-2 rounded-lg bg-[#1A100B] hover:bg-[#FF453A]/20 text-[#8E9299] hover:text-[#FF453A] border border-[#2C1910] transition-colors"
                    title="Delete Saved Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
