import React from 'react';

interface ModernMusicLogoProps {
  size?: 'sm' | 'md' | 'lg';
  isPlaying?: boolean;
}

/**
 * Modern Latest-Type Music Logo for Muse
 * Combines an energetic holographic sound wave, vinyl micro-grooves,
 * and glowing neon Dolby Atmos equalizer pulses.
 */
export const ModernMusicLogo: React.FC<ModernMusicLogoProps> = ({
  size = 'md',
  isPlaying = false
}) => {
  const containerSizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-14 h-14 rounded-3xl'
  }[size];

  const barClasses = {
    sm: 'w-[2.5px] rounded-full',
    md: 'w-[3px] rounded-full',
    lg: 'w-[4px] rounded-full'
  }[size];

  return (
    <div
      className={`relative ${containerSizeClasses} bg-gradient-to-br from-[#FF3B00] via-[#FF5014] to-[#B91C1C] flex items-center justify-center shadow-lg shadow-[#FF5014]/30 border border-[#FF8A65]/40 overflow-hidden group select-none transition-transform duration-300 group-hover:scale-105`}
    >
      {/* Vinyl record micro-grooves effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.3)_60%,rgba(0,0,0,0.6)_95%)] pointer-events-none" />

      {/* Orbiting sound ring indicator */}
      <div
        className={`absolute inset-0.5 rounded-[inherit] border border-white/20 transition-all ${
          isPlaying ? 'animate-spin' : ''
        }`}
        style={{ animationDuration: '6s' }}
      />

      {/* Modern Neon Center Prism */}
      <div className="absolute inset-1.5 rounded-[inherit] bg-gradient-to-t from-black/40 to-white/15 backdrop-blur-[1px]" />

      {/* Dynamic 5-bar Sound Wave Graphic with Latest Wave Heights */}
      <div className="relative z-10 flex items-center justify-center gap-[2.5px] sm:gap-[3px]">
        <div
          className={`${barClasses} bg-white shadow-sm transition-all duration-200 ${
            isPlaying ? 'h-3 animate-pulse' : 'h-2'
          }`}
          style={{ animationDelay: '0ms' }}
        />
        <div
          className={`${barClasses} bg-white shadow-sm transition-all duration-200 ${
            isPlaying ? 'h-5 animate-pulse' : 'h-3.5'
          }`}
          style={{ animationDelay: '120ms' }}
        />
        <div
          className={`${barClasses} bg-gradient-to-t from-white to-[#FFF275] shadow-md transition-all duration-200 ${
            isPlaying ? 'h-6 animate-pulse' : 'h-5'
          }`}
          style={{ animationDelay: '240ms' }}
        />
        <div
          className={`${barClasses} bg-white shadow-sm transition-all duration-200 ${
            isPlaying ? 'h-4 animate-pulse' : 'h-3'
          }`}
          style={{ animationDelay: '360ms' }}
        />
        <div
          className={`${barClasses} bg-white shadow-sm transition-all duration-200 ${
            isPlaying ? 'h-2.5 animate-pulse' : 'h-1.5'
          }`}
          style={{ animationDelay: '480ms' }}
        />
      </div>

      {/* Ambient Pulsing Glow on Play */}
      {isPlaying && (
        <div className="absolute -inset-1 bg-[#FF5014]/25 blur-md pointer-events-none animate-pulse" />
      )}

      {/* Corner Glass Glint */}
      <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white/40 blur-[1.5px] rounded-full pointer-events-none" />
    </div>
  );
};
