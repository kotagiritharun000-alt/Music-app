import React from 'react';

interface FrequencySpectrumVisualizerProps {
  frequencyBands: number[];
  isPlaying: boolean;
}

export const FrequencySpectrumVisualizer: React.FC<FrequencySpectrumVisualizerProps> = ({
  frequencyBands,
  isPlaying
}) => {
  return (
    <div className="w-full bg-[#1A100B]/60 rounded-xl p-3 border border-[#2C1910] backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5014] animate-ping" />
          <span className="text-[11px] font-bold text-[#E0D8D0] uppercase tracking-wider">
            16-Band Real-Time Spectrum Analyzer
          </span>
        </div>
        <span className="text-[10px] text-[#8E9299] font-mono">
          {isPlaying ? '96kHz / 24-Bit Active' : 'Engine Idle'}
        </span>
      </div>

      <div className="h-14 flex items-end justify-between gap-1 sm:gap-1.5 px-1">
        {frequencyBands.map((band, idx) => {
          // Band heights: clamp between 8% and 100%
          const heightPercent = isPlaying ? Math.max(8, Math.min(100, Math.round(band * 100))) : 8;

          // Distinct frequency coloring:
          // 0-3 Sub-Bass (Deep Amber/Ember), 4-8 Mid Percussion (Terracotta), 9-12 Leads (Bright Orange), 13-15 Air/Highs (Golden)
          const barGradient = idx < 4
            ? 'from-[#8B3010] to-[#FF5014]'
            : idx < 9
            ? 'from-[#B84010] to-[#FF7A45]'
            : idx < 13
            ? 'from-[#FF5014] to-[#FF9060]'
            : 'from-[#FF7A45] to-[#FFC085]';

          return (
            <div key={idx} className="flex-1 h-full flex items-end justify-center group relative">
              <div
                className={`w-full rounded-t-sm bg-gradient-to-t ${barGradient} transition-all duration-75`}
                style={{
                  height: `${heightPercent}%`,
                  boxShadow: isPlaying && heightPercent > 40 ? '0 0 8px rgba(255, 80, 20, 0.4)' : 'none'
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-[9px] text-[#8E9299] font-mono mt-1.5 px-1 border-t border-[#2C1910]/60 pt-1">
        <span>20Hz (Sub)</span>
        <span>250Hz (Bass)</span>
        <span>1kHz (Mids)</span>
        <span>4kHz (Presence)</span>
        <span>20kHz (Brilliance)</span>
      </div>
    </div>
  );
};
