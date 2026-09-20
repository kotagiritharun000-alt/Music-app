import React, { useState } from 'react';
import { ModernMusicLogo, LogoVariant, LogoSize } from './ModernMusicLogo';
import { Sparkles, Copy, Check, Download, Palette, Volume2, Layers, ShieldCheck, X } from 'lucide-react';

interface BrandLogoModalProps {
  isPlaying: boolean;
  onDismiss: () => void;
}

export const BrandLogoModal: React.FC<BrandLogoModalProps> = ({ isPlaying, onDismiss }) => {
  const [selectedVariant, setSelectedVariant] = useState<LogoVariant>('flame');
  const [testPlaying, setTestPlaying] = useState<boolean>(isPlaying);
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);

  const variants: { id: LogoVariant; name: string; desc: string; previewColor: string }[] = [
    {
      id: 'flame',
      name: 'Electric Flame (Official)',
      desc: 'High-energy solar flame (#FF2A00 → #FFAA00) with cyber cyan accents',
      previewColor: 'from-[#FF2A00] to-[#FFAA00]'
    },
    {
      id: 'cyan',
      name: 'Cyber Aurora',
      desc: 'Futuristic electric cyan (#00F5D4 → #00BBF9) with deep indigo glow',
      previewColor: 'from-[#00F5D4] to-[#4361EE]'
    },
    {
      id: 'aurora',
      name: 'Neon Twilight',
      desc: 'Rich ultraviolet magenta (#7928CA → #FF0080) with radiant bloom',
      previewColor: 'from-[#7928CA] to-[#FF0080]'
    },
    {
      id: 'obsidian',
      name: 'Monochrome Onyx',
      desc: 'Audiophile matte silver and platinum with subtle amber glint',
      previewColor: 'from-[#FFFFFF] to-[#94A3B8]'
    }
  ];

  const handleCopySvg = () => {
    const svgString = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="90" height="90" rx="26" fill="#120603" stroke="#FF5014" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.06)" stroke-width="1" fill="none"/>
  <path d="M 28 50 C 28 41 38 41 44 48 C 50 55 60 59 66 53 C 72 47 72 38 64 36 C 58 35 52 40 48 45" stroke="#FF6200" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M 58 64 L 58 26 C 66 24 74 29 76 34" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none"/>
  <ellipse cx="48" cy="65" rx="10" ry="7.5" transform="rotate(-22 48 65)" fill="#FF5014" stroke="#FFFFFF" stroke-width="1.5"/>
  <rect x="24" y="44" width="3" height="12" rx="1.5" fill="#00F2FE"/>
  <rect x="31" y="38" width="3" height="24" rx="1.5" fill="#FFFFFF"/>
  <rect x="47" y="33" width="3.2" height="18" rx="1.6" fill="#FF8A65"/>
  <rect x="69" y="42" width="3" height="16" rx="1.5" fill="#FF6200"/>
  <rect x="76" y="46" width="3" height="8" rx="1.5" fill="#00F2FE"/>
</svg>`;
    navigator.clipboard.writeText(svgString);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2200);
  };

  const handleDownloadSvg = () => {
    const svgString = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="10" y1="10" x2="90" y2="90">
      <stop offset="0%" stop-color="#FF2A00"/>
      <stop offset="50%" stop-color="#FF6200"/>
      <stop offset="100%" stop-color="#FFAA00"/>
    </linearGradient>
  </defs>
  <rect x="5" y="5" width="90" height="90" rx="26" fill="#120603" stroke="url(#grad)" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.06)" stroke-width="1" fill="none"/>
  <circle cx="50" cy="50" r="31" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" fill="none"/>
  <path d="M 28 50 C 28 41 38 41 44 48 C 50 55 60 59 66 53 C 72 47 72 38 64 36 C 58 35 52 40 48 45" stroke="url(#grad)" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M 58 64 L 58 26 C 66 24 74 29 76 34" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none"/>
  <ellipse cx="48" cy="65" rx="10" ry="7.5" transform="rotate(-22 48 65)" fill="url(#grad)" stroke="#FFFFFF" stroke-width="1.5"/>
  <rect x="24" y="44" width="3" height="12" rx="1.5" fill="#00F2FE"/>
  <rect x="31" y="38" width="3" height="24" rx="1.5" fill="#FFFFFF"/>
  <rect x="47" y="33" width="3.2" height="18" rx="1.6" fill="#FFAA00"/>
  <rect x="69" y="42" width="3" height="16" rx="1.5" fill="#FF6200"/>
  <rect x="76" y="46" width="3" height="8" rx="1.5" fill="#00F2FE"/>
</svg>`;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muse-music-logo-${selectedVariant}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#110804] border border-[#2C1910] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2C1910] pb-4">
          <div className="flex items-center gap-3">
            <ModernMusicLogo size="sm" isPlaying={testPlaying} variant={selectedVariant} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">Muse Brand Identity & Logo</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#FF5014]/20 text-[#FF7A45] border border-[#FF5014]/40 text-[9px] font-bold">
                  Official Asset
                </span>
              </div>
              <p className="text-xs text-[#8E9299]">The 5-part formula applied to an eye-catching music logo</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full bg-[#1A100B] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Stage: Hero Logo Preview */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#1C0E07] via-[#140804] to-[#0A0402] border border-[#2C1910] p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-hidden shadow-inner">
          {/* Subtle background radial spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,80,20,0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Large Hero Logo Display */}
          <div className="mb-4">
            <ModernMusicLogo
              size="hero"
              isPlaying={testPlaying}
              variant={selectedVariant}
              showGlow={true}
            />
          </div>

          <div className="space-y-1 z-10">
            <h3 className="text-2xl font-black tracking-widest text-white flex items-center justify-center gap-2">
              <span>MUSE</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-semibold tracking-normal">
                Dolby 360
              </span>
            </h3>
            <p className="text-xs text-[#E0D8D0] font-medium max-w-sm">
              An acoustic infinity wave seamlessly fused with a musical note and real-time frequency equalizer.
            </p>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="mt-5 flex items-center gap-3 z-10">
            <button
              onClick={() => setTestPlaying(!testPlaying)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                testPlaying
                  ? 'bg-[#22C55E] text-black shadow-[#22C55E]/20'
                  : 'bg-[#1F120A] text-[#8E9299] hover:text-white border border-[#2C1910]'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{testPlaying ? 'Audio Pulse Active' : 'Simulate Play Pulse'}</span>
            </button>

            <button
              onClick={handleCopySvg}
              className="px-3 py-1.5 rounded-xl bg-[#1F120A] hover:bg-[#2C1910] text-xs font-semibold text-[#E0D8D0] border border-[#2C1910] flex items-center gap-1.5 transition-colors"
            >
              {copiedSvg ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSvg ? 'SVG Copied!' : 'Copy SVG'}</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className="px-3 py-1.5 rounded-xl bg-[#FF5014] hover:bg-[#FF6A38] text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-[#FF5014]/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SVG</span>
            </button>
          </div>
        </div>

        {/* Color Palette Variations Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#FF5014]" />
              <span>Color Themes</span>
            </h4>
            <span className="text-[11px] text-[#8E9299]">Click to preview live in app</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {variants.map((v) => {
              const isSelected = selectedVariant === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVariant(v.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-[#1C0F08] border-[#FF5014] shadow-md shadow-[#FF5014]/10'
                      : 'bg-[#140A05] border-[#2C1910] hover:border-[#2C1910]/80'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${v.previewColor} shrink-0 shadow-sm`} />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{v.name}</h5>
                    <p className="text-[11px] text-[#8E9299] truncate">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The 5-Part Formula Breakdown for this Logo */}
        <div className="p-4 rounded-2xl bg-[#140A05] border border-[#2C1910] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Layers className="w-4 h-4 text-[#FF5014]" />
            <span>The 5-Part Formula Behind This Logo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-[#0C0603] border border-[#22130B]">
              <span className="text-[10px] font-bold text-[#FF7A45] uppercase tracking-wider">1. Logo Style</span>
              <p className="text-white font-medium mt-0.5">Minimalist Geometric Emblem</p>
              <p className="text-[11px] text-[#8E9299]">Modern tactile squircle with micro-grooves and specular highlights.</p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0C0603] border border-[#22130B]">
              <span className="text-[10px] font-bold text-[#00F5D4] uppercase tracking-wider">2. Symbol / Icon</span>
              <p className="text-white font-medium mt-0.5">Infinity Wave & Musical Note</p>
              <p className="text-[11px] text-[#8E9299]">Represents endless sound playback and Dolby Atmos spatial frequencies.</p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0C0603] border border-[#22130B]">
              <span className="text-[10px] font-bold text-[#FFD166] uppercase tracking-wider">3. Business Type</span>
              <p className="text-white font-medium mt-0.5">Spatial Audio Streaming Player</p>
              <p className="text-[11px] text-[#8E9299]">For audiophiles streaming 320Kbps HD tracks & local device music.</p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0C0603] border border-[#22130B]">
              <span className="text-[10px] font-bold text-[#FF0080] uppercase tracking-wider">4. Color Palette</span>
              <p className="text-white font-medium mt-0.5">Electric Flame & Cyber Cyan</p>
              <p className="text-[11px] text-[#8E9299]">High-contrast complementary warmth on deep obsidian carbon.</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0C0603] border border-[#22130B] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">5. Brand Personality</span>
              <p className="text-xs text-white font-medium">Magnetic, Audiophile-Grade, Futuristic & Immediately Eye-Catching</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#22C55E] shrink-0" />
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onDismiss}
            className="px-5 py-2.5 rounded-xl bg-[#1A100B] hover:bg-[#2C1910] text-xs font-bold text-white border border-[#2C1910] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
