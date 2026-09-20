import React, { useState } from 'react';
import { Compass, Sparkles, Film, Maximize2, X, Download, Disc, Layers, Volume2 } from 'lucide-react';
import { AudioSpatialConfig, Song } from '../types';

interface ArtworkVisualizerProps {
  song: Song;
  isPlaying: boolean;
  spatialConfig: AudioSpatialConfig;
  onOpenSpatial: () => void;
}

export const ArtworkVisualizer: React.FC<ArtworkVisualizerProps> = ({
  song,
  isPlaying,
  spatialConfig,
  onOpenSpatial
}) => {
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'poster' | 'vinyl'>('poster');
  const [imageError, setImageError] = useState(false);

  const movieTitle = song.movieName || song.album || song.title;
  const posterUrl = !imageError && song.coverImage
    ? song.coverImage
    : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';

  const handleDownloadPoster = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const a = document.createElement('a');
      a.href = posterUrl;
      a.target = '_blank';
      a.download = `${movieTitle.replace(/\s+/g, '_')}_Movie_Poster.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.warn('Poster download error:', err);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-2 select-none">
      {/* Mode Switcher & Movie Info Bar */}
      <div className="w-full max-w-md flex items-center justify-between px-2 mb-3 z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#180D07] border border-[#2C1910] text-[11px] text-[#E0D8D0]">
          <Film className="w-3.5 h-3.5 text-[#FF5014]" />
          <span className="text-[#8E9299]">Movie:</span>
          <span className="font-bold text-white max-w-[170px] sm:max-w-[220px] truncate">
            {movieTitle}
          </span>
          {song.year && (
            <span className="text-[10px] text-[#8E9299] font-mono">({song.year})</span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-[#180D07] p-0.5 rounded-lg border border-[#2C1910]">
          <button
            onClick={() => setViewMode('poster')}
            className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'poster'
                ? 'bg-[#FF5014] text-white shadow-sm'
                : 'text-[#8E9299] hover:text-white'
            }`}
            title="Cinematic Movie Poster View"
          >
            <Film className="w-3 h-3" />
            <span>Poster</span>
          </button>
          <button
            onClick={() => setViewMode('vinyl')}
            className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
              viewMode === 'vinyl'
                ? 'bg-[#FF5014] text-white shadow-sm'
                : 'text-[#8E9299] hover:text-white'
            }`}
            title="Vinyl Record & Sleeve View"
          >
            <Disc className="w-3 h-3" />
            <span>Vinyl</span>
          </button>
        </div>
      </div>

      {/* Outer Spatial Resonance Aura */}
      <div
        className={`absolute w-80 h-80 rounded-full filter blur-3xl opacity-20 transition-all duration-1000 pointer-events-none ${
          isPlaying ? 'opacity-40 scale-110' : 'opacity-15 scale-95'
        }`}
        style={{
          background: `radial-gradient(circle, ${song.gradientStart} 0%, ${song.gradientEnd} 100%)`
        }}
      />

      {/* Orbiting Spatial Ring */}
      <div
        className={`absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-dashed border-[#FF5014]/20 transition-all pointer-events-none ${
          isPlaying ? 'animate-spin-slow scale-100 opacity-70' : 'opacity-20 scale-95'
        }`}
        style={{
          boxShadow: isPlaying ? '0 0 30px rgba(255, 80, 20, 0.12)' : 'none'
        }}
      >
        <div
          className="absolute w-3 h-3 -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-[#FF5014] shadow-md shadow-[#FF5014]/50 border border-white/60"
          title="Spatialized Object Node"
        />
      </div>

      {/* MAIN VIEWPORT: CINEMATIC POSTER MODE OR VINYL SLEEVE MODE */}
      {viewMode === 'poster' ? (
        /* Cinematic Movie Poster Card (Vertical 2:3 Aspect Ratio) */
        <div className="relative group">
          <div
            onClick={() => setIsPosterModalOpen(true)}
            className="relative w-52 h-72 sm:w-60 sm:h-84 rounded-2xl overflow-hidden cursor-pointer shadow-2xl border-2 border-[#2C1910] hover:border-[#FF5014]/60 transition-all duration-300 transform group-hover:scale-[1.02] bg-[#0E0604]"
          >
            {/* Movie Poster Image */}
            <img
              src={posterUrl}
              alt={`${movieTitle} Movie Poster`}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />

            {/* Poster Lighting Gradient & Gloss Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

            {/* Top Bar on Poster: Film Tag & Expand Button */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-sm">
                <Film className="w-2.5 h-2.5 text-amber-400" />
                <span>MOVIE POSTER</span>
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPosterModalOpen(true);
                }}
                className="p-1.5 rounded-full bg-black/60 hover:bg-[#FF5014] text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-colors shadow-sm"
                title="View Full High-Resolution Poster"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Playback Equalizer Badge */}
            {isPlaying && (
              <div className="absolute top-10 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500/80 backdrop-blur-md text-black text-[9px] font-extrabold tracking-wider flex items-center gap-1 shadow-md">
                <Volume2 className="w-2.5 h-2.5 text-black animate-pulse" />
                <span>PLAYING</span>
              </div>
            )}

            {/* Bottom Content: Movie Title & Quick Audio Info */}
            <div className="absolute bottom-0 inset-x-0 p-3 text-left">
              <span className="text-[10px] font-semibold text-[#FF7A45] tracking-wider uppercase block truncate drop-shadow">
                {song.movieName ? 'Film Soundtrack' : song.genre}
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-white truncate drop-shadow-md">
                {movieTitle}
              </h3>
              <p className="text-[11px] text-[#E0D8D0]/80 truncate mt-0.5">
                {song.title} • <span className="text-[#8E9299]">{song.artist}</span>
              </p>

              {/* Quality Badges */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[#FF7A45] text-[9px] font-bold border border-[#FF5014]/30">
                  Dolby Atmos 360
                </span>
                <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                  320 Kbps HD
                </span>
              </div>
            </div>
          </div>

          {/* Click to Zoom Hint */}
          <div className="text-center mt-2">
            <button
              onClick={() => setIsPosterModalOpen(true)}
              className="text-[11px] text-[#8E9299] hover:text-[#FF7A45] transition-colors inline-flex items-center gap-1"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Click poster to expand</span>
            </button>
          </div>
        </div>
      ) : (
        /* Vinyl Record & Jacket Mode */
        <div className="relative flex items-center justify-center">
          {/* Vinyl Disc that slides out and spins when playing */}
          <div
            className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-[#080808] border-4 border-[#1A1A1A] shadow-2xl flex items-center justify-center transition-all duration-700 ${
              isPlaying
                ? 'translate-x-12 sm:translate-x-16 animate-spin-slow opacity-100'
                : 'translate-x-4 opacity-50'
            }`}
            style={{
              background: `radial-gradient(circle, #181818 0%, #080808 60%, #151515 80%, #000000 100%)`,
              boxShadow: '0 0 25px rgba(0,0,0,0.8), inset 0 0 15px rgba(255,255,255,0.05)'
            }}
          >
            {/* Vinyl Grooves Texture */}
            <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-5 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />

            {/* Center Movie Poster Sticker on Vinyl Record */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-500/40 relative shadow-inner">
              <img
                src={posterUrl}
                alt="Vinyl Center Label"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              {/* Spindle Hole */}
              <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-[#130905] border border-white/40 shadow-inner" />
            </div>
          </div>

          {/* Front Album Jacket Card with Movie Poster */}
          <div
            onClick={() => setIsPosterModalOpen(true)}
            className="group relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden cursor-pointer shadow-2xl border border-[#2C1910] hover:border-[#FF5014]/50 transition-all duration-300 transform hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${song.gradientStart} 0%, #130905 60%, ${song.gradientEnd} 100%)`
            }}
          >
            <img
              src={posterUrl}
              alt={`${movieTitle} Poster Cover`}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

            {/* Poster Tag */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 flex items-center gap-1">
              <Film className="w-2.5 h-2.5 text-amber-400" />
              <span>{song.movieName || 'FILM POSTER'}</span>
            </div>

            {/* Spatial Tune Overlay */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onOpenSpatial();
              }}
              className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-[#E0D8D0] hover:bg-black/90 transition-colors"
            >
              <span className="flex items-center gap-1 text-[#FF7A45]">
                <Compass className="w-3 h-3 animate-pulse" />
                <span>{spatialConfig.isSpatialEnabled ? 'Spatial 3D On' : 'Stereo'}</span>
              </span>
              <span className="text-[#8E9299]">Tune</span>
            </div>
          </div>
        </div>
      )}

      {/* FULL HIGH-RESOLUTION MOVIE POSTER MODAL (LIGHTBOX) */}
      {isPosterModalOpen && (
        <div
          onClick={() => setIsPosterModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-[#130905] border border-[#2C1910] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2C1910] bg-[#1A0E08]/60">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#FF5014]" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Official Movie Poster
                </h3>
              </div>
              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-[#8E9299] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Movie Poster Main Image Area */}
            <div className="relative bg-black flex items-center justify-center p-3 overflow-hidden flex-1 min-h-[320px] max-h-[520px]">
              <img
                src={posterUrl}
                alt={`${movieTitle} Poster`}
                className="max-h-[500px] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
              />
            </div>

            {/* Movie Details Footer */}
            <div className="p-4 sm:p-5 bg-[#180D07] border-t border-[#2C1910] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A45]">
                    {song.genre} • {song.year || '2024'}
                  </span>
                  <h2 className="text-lg font-extrabold text-white truncate mt-0.5">
                    {movieTitle}
                  </h2>
                  <p className="text-xs text-[#8E9299] truncate">
                    Track: <span className="text-white font-medium">{song.title}</span> • {song.artist}
                  </p>
                </div>

                <button
                  onClick={handleDownloadPoster}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#FF5014] to-[#FF7A45] hover:from-[#FF4100] hover:to-[#FF6B35] text-white text-xs font-bold transition-all shadow-md shrink-0 active:scale-95"
                  title="Download Movie Poster Image"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>

              {/* Quality Indicators & Cast Details */}
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[#2C1910]/60 text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-[#24130A] text-[#FF7A45] border border-[#FF5014]/20 font-semibold">
                  Dolby Atmos 360 Spatial Audio
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#24130A] text-emerald-400 border border-emerald-500/20 font-semibold">
                  320 Kbps HD Lossless Master
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#24130A] text-cyan-400 border border-cyan-500/20 font-mono">
                  {song.bpm} BPM • {song.key}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
