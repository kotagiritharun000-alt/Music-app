import React from 'react';

export type LogoVariant = 'flame' | 'cyan' | 'aurora' | 'obsidian';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';

interface ModernMusicLogoProps {
  size?: LogoSize;
  isPlaying?: boolean;
  variant?: LogoVariant;
  showGlow?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Modern Music App Logo for MUSE
 * Follows the 5-Part Formula:
 * 1. Logo Style: Minimalist geometric emblem with high-gloss depth
 * 2. Symbol: Acoustic infinity wave fused with a musical note & equalizer pulse
 * 3. Business: Spatial audio & Dolby Atmos music streaming app
 * 4. Palette: Electric sunset flame (#FF3800), Cyber cyan (#00F5D4), Obsidian onyx (#0A0502)
 * 5. Brand Personality: Magnetic, audiophile-grade, futuristic, captivating
 */
export const ModernMusicLogo: React.FC<ModernMusicLogoProps> = ({
  size = 'md',
  isPlaying = false,
  variant = 'flame',
  showGlow = true,
  className = '',
  onClick
}) => {
  const sizeMap: Record<LogoSize, { px: number; containerClass: string }> = {
    xs: { px: 24, containerClass: 'w-6 h-6' },
    sm: { px: 32, containerClass: 'w-8 h-8' },
    md: { px: 42, containerClass: 'w-10 h-10 sm:w-[42px] sm:h-[42px]' },
    lg: { px: 56, containerClass: 'w-14 h-14' },
    xl: { px: 80, containerClass: 'w-20 h-20' },
    hero: { px: 128, containerClass: 'w-32 h-32' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Color palette gradients based on selected variant
  const paletteGradients = {
    flame: {
      primaryStart: '#FF2A00',
      primaryMid: '#FF6200',
      primaryEnd: '#FFAA00',
      accent: '#00F2FE',
      glowColor: 'rgba(255, 80, 20, 0.45)',
      ringColor: '#FF6200'
    },
    cyan: {
      primaryStart: '#00F5D4',
      primaryMid: '#00BBF9',
      primaryEnd: '#4361EE',
      accent: '#FF007F',
      glowColor: 'rgba(0, 245, 212, 0.4)',
      ringColor: '#00BBF9'
    },
    aurora: {
      primaryStart: '#7928CA',
      primaryMid: '#FF0080',
      primaryEnd: '#FF4D4D',
      accent: '#00DFD8',
      glowColor: 'rgba(255, 0, 128, 0.45)',
      ringColor: '#FF0080'
    },
    obsidian: {
      primaryStart: '#FFFFFF',
      primaryMid: '#E0E7FF',
      primaryEnd: '#94A3B8',
      accent: '#FF6200',
      glowColor: 'rgba(255, 255, 255, 0.25)',
      ringColor: '#94A3B8'
    }
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 select-none group cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 ${currentSize.containerClass} ${className}`}
      title="Muse — High-Fidelity Spatial Music"
    >
      {/* Ambient Pulsing Glow Aura */}
      {showGlow && (
        <div
          className={`absolute -inset-1.5 rounded-3xl blur-md transition-opacity duration-500 pointer-events-none ${
            isPlaying ? 'opacity-90 animate-pulse' : 'opacity-40 group-hover:opacity-75'
          }`}
          style={{ backgroundColor: paletteGradients.glowColor }}
        />
      )}

      {/* Primary SVG Logo Canvas */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg relative z-10 overflow-visible"
      >
        <defs>
          {/* Main Dynamic Gradient */}
          <linearGradient id={`museGrad-${variant}`} x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={paletteGradients.primaryStart} />
            <stop offset="50%" stopColor={paletteGradients.primaryMid} />
            <stop offset="100%" stopColor={paletteGradients.primaryEnd} />
          </linearGradient>

          {/* Accent Glow Gradient */}
          <linearGradient id={`museAccent-${variant}`} x1="90" y1="10" x2="10" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={paletteGradients.accent} />
            <stop offset="100%" stopColor={paletteGradients.primaryMid} />
          </linearGradient>

          {/* Glass Specular Reflection */}
          <linearGradient id="museGlassLight" x1="20" y1="0" x2="80" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Background Plate Gradient */}
          <linearGradient id="museBgPlate" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E0E08" />
            <stop offset="50%" stopColor="#120603" />
            <stop offset="100%" stopColor="#080302" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id={`neonGlow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Base Squircle Container */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="26"
          fill="url(#museBgPlate)"
          stroke={`url(#museGrad-${variant})`}
          strokeWidth="2.5"
          className="transition-colors"
        />

        {/* 2. Concentric Vinyl Micro-Grooves */}
        <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
        <circle cx="50" cy="50" r="31" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" fill="none" />
        <circle cx="50" cy="50" r="24" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" fill="none" />

        {/* 3. Orbiting Spatial Audio Radar Arc */}
        <g
          className={`origin-center transition-transform ${isPlaying ? 'animate-spin' : ''}`}
          style={{ animationDuration: '8s' }}
        >
          <path
            d="M 50 14 A 36 36 0 0 1 86 50"
            stroke={paletteGradients.accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.85"
          />
          <circle cx="86" cy="50" r="2" fill="#FFFFFF" />
          <path
            d="M 50 86 A 36 36 0 0 1 14 50"
            stroke={`url(#museGrad-${variant})`}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
        </g>

        {/* 4. The Core Icon: Intertwined Infinity Wave & Musical Note Symbol */}
        <g filter={`url(#neonGlow-${variant})`}>
          {/* Infinity Wave Acoustic Flow (Left loop to Center to Right loop) */}
          <path
            d="M 28 50 C 28 41 38 41 44 48 C 50 55 60 59 66 53 C 72 47 72 38 64 36 C 58 35 52 40 48 45"
            stroke={`url(#museGrad-${variant})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Musical Note Stem & Flag ascending with acoustic power */}
          <path
            d="M 58 64 L 58 26 C 66 24 74 29 76 34"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Musical Note Head (Filled Glow Pill) */}
          <ellipse
            cx="48"
            cy="65"
            rx="10"
            ry="7.5"
            transform="rotate(-22 48 65)"
            fill={`url(#museGrad-${variant})`}
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />

          {/* Sound Energy Frequency Equalizer Bars (inside & radiating from note) */}
          <g className="transition-all">
            {/* Bar 1 */}
            <rect
              x="24"
              y={isPlaying ? '44' : '47'}
              width="3"
              height={isPlaying ? '12' : '6'}
              rx="1.5"
              fill={paletteGradients.accent}
              className={isPlaying ? 'animate-pulse' : ''}
              style={{ animationDuration: '400ms' }}
            />
            {/* Bar 2 */}
            <rect
              x="31"
              y={isPlaying ? '38' : '43'}
              width="3"
              height={isPlaying ? '24' : '14'}
              rx="1.5"
              fill="#FFFFFF"
              className={isPlaying ? 'animate-pulse' : ''}
              style={{ animationDuration: '600ms', animationDelay: '100ms' }}
            />
            {/* Bar 3 (Center) */}
            <rect
              x="47"
              y={isPlaying ? '33' : '39'}
              width="3.2"
              height={isPlaying ? '18' : '10'}
              rx="1.6"
              fill={`url(#museGrad-${variant})`}
              className={isPlaying ? 'animate-pulse' : ''}
              style={{ animationDuration: '500ms', animationDelay: '250ms' }}
            />
            {/* Bar 4 */}
            <rect
              x="69"
              y={isPlaying ? '42' : '45'}
              width="3"
              height={isPlaying ? '16' : '10'}
              rx="1.5"
              fill={paletteGradients.primaryMid}
              className={isPlaying ? 'animate-pulse' : ''}
              style={{ animationDuration: '550ms', animationDelay: '350ms' }}
            />
            {/* Bar 5 */}
            <rect
              x="76"
              y={isPlaying ? '46' : '48'}
              width="3"
              height={isPlaying ? '8' : '4'}
              rx="1.5"
              fill={paletteGradients.accent}
              className={isPlaying ? 'animate-pulse' : ''}
              style={{ animationDuration: '450ms', animationDelay: '200ms' }}
            />
          </g>
        </g>

        {/* 5. Central Sparkle Prism Star */}
        <path
          d="M 76 22 Q 76 26 80 26 Q 76 26 76 30 Q 76 26 72 26 Q 76 26 76 22 Z"
          fill="#FFFFFF"
          className={isPlaying ? 'animate-ping' : ''}
          style={{ transformOrigin: '76px 26px', animationDuration: '2.5s' }}
        />

        {/* 6. Precision Glass Specular Reflection Highlight */}
        <path
          d="M 8 28 C 8 16 16 8 28 8 L 72 8 C 84 8 92 16 92 28 C 76 32 30 36 8 52 Z"
          fill="url(#museGlassLight)"
          pointerEvents="none"
        />

        {/* 7. Subtle Corner Rim Glint */}
        <circle cx="20" cy="18" r="1.5" fill="#FFFFFF" opacity="0.8" />
      </svg>
    </div>
  );
};
