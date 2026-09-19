import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
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
  return (
    <div className="relative flex items-center justify-center py-4 select-none">
      {/* Outer Spatial Resonance Aura */}
      <div
        className={`absolute w-72 h-72 rounded-full filter blur-3xl opacity-25 transition-opacity duration-1000 ${
          isPlaying ? 'opacity-40 scale-105' : 'opacity-15 scale-95'
        }`}
        style={{
          background: `radial-gradient(circle, ${song.gradientStart} 0%, ${song.gradientEnd} 100%)`
        }}
      />

      {/* Orbiting Spatial Ring */}
      <div
        className={`absolute w-64 h-64 rounded-full border border-dashed border-[#FF5014]/25 transition-all pointer-events-none ${
          isPlaying ? 'animate-spin-slow scale-100 opacity-80' : 'opacity-30 scale-95'
        }`}
        style={{
          boxShadow: isPlaying ? '0 0 25px rgba(255, 80, 20, 0.15)' : 'none'
        }}
      >
        {/* Orbital Sound Object Node */}
        <div
          className="absolute w-3 h-3 -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-[#FF5014] shadow-md shadow-[#FF5014]/50 border border-white/60"
          title="Spatialized Object Node"
        />
      </div>

      {/* Album Artwork Card */}
      <div
        onClick={onOpenSpatial}
        className="group relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden cursor-pointer shadow-2xl border border-[#2C1910] hover:border-[#FF5014]/50 transition-all duration-300 transform hover:scale-[1.02]"
        style={{
          background: `linear-gradient(135deg, ${song.gradientStart} 0%, #130905 60%, ${song.gradientEnd} 100%)`
        }}
      >
        {/* Vinyl Grooves Texture */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(255,255,255,0.15)_31%,_transparent_32%,_rgba(255,255,255,0.15)_50%,_transparent_51%,_rgba(255,255,255,0.15)_70%,_transparent_71%)] pointer-events-none" />

        {/* Center Content / Soundwave Icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center mb-3 shadow-inner">
            <svg
              className={`w-7 h-7 text-white transition-transform ${isPlaying ? 'scale-110' : 'scale-90'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v4" />
            </svg>
          </div>

          <span className="font-bold text-xs tracking-wider uppercase text-white/90 drop-shadow">
            {song.genre.split('/')[0]}
          </span>
          <span className="text-[10px] text-[#E0D8D0]/70 font-medium mt-0.5">
            {song.bpm} BPM • {song.key}
          </span>
        </div>

        {/* Spatial Audio Badge Overlay on Hover */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-[#E0D8D0]">
          <span className="flex items-center gap-1 text-[#FF7A45]">
            <Compass className="w-3 h-3 animate-pulse" />
            <span>{spatialConfig.isSpatialEnabled ? 'Spatial 3D On' : 'Stereo'}</span>
          </span>
          <span className="text-[#8E9299]">Click to Tune</span>
        </div>
      </div>
    </div>
  );
};
