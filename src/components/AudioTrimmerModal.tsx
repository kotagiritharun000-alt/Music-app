import React, { useState } from 'react';
import { Download, Play, Square, Scissors, X, Volume2 } from 'lucide-react';
import { BgmStem, Song, ToneExportType, TONE_EXPORT_METADATA, TrimConfig } from '../types';

interface AudioTrimmerModalProps {
  currentSong: Song;
  initialStem?: BgmStem | null;
  onPreviewLoop: (startMs: number, endMs: number) => void;
  onStopLoop: () => void;
  onExportTone: (config: TrimConfig, durationSec: number) => void;
  onDismiss: () => void;
}

export const AudioTrimmerModal: React.FC<AudioTrimmerModalProps> = ({
  currentSong,
  initialStem,
  onPreviewLoop,
  onStopLoop,
  onExportTone,
  onDismiss
}) => {
  const maxDur = initialStem ? initialStem.durationMs : currentSong.durationMs;

  const [targetType, setTargetType] = useState<ToneExportType>(ToneExportType.RINGTONE);
  const [startMs, setStartMs] = useState<number>(0);
  const [endMs, setEndMs] = useState<number>(Math.min(maxDur, 30000));
  const [isFadeIn, setIsFadeIn] = useState<boolean>(true);
  const [isFadeOut, setIsFadeOut] = useState<boolean>(true);
  const [customTitle, setCustomTitle] = useState<string>(
    initialStem ? `${initialStem.name} (Ringtone)` : `${currentSong.title} (Hook Clip)`
  );
  const [isPlayingLoop, setIsPlayingLoop] = useState<boolean>(false);

  const handleTypeSelect = (type: ToneExportType) => {
    setTargetType(type);
    const defaultDur = TONE_EXPORT_METADATA[type].defaultDurationMs;
    const newEnd = Math.min(maxDur, startMs + defaultDur);
    setEndMs(newEnd);
  };

  const handleStartChange = (val: number) => {
    const clamped = Math.max(0, Math.min(val, endMs - 1000));
    setStartMs(clamped);
  };

  const handleEndChange = (val: number) => {
    const clamped = Math.max(startMs + 1000, Math.min(val, maxDur));
    setEndMs(clamped);
  };

  const formatMs = (ms: number) => {
    const s = (ms / 1000).toFixed(1);
    return `${s}s`;
  };

  const toggleLoopPreview = () => {
    if (isPlayingLoop) {
      onStopLoop();
      setIsPlayingLoop(false);
    } else {
      onPreviewLoop(startMs, endMs);
      setIsPlayingLoop(true);
    }
  };

  const handleExport = () => {
    const durationSec = Math.max(1, (endMs - startMs) / 1000);
    onExportTone(
      {
        startMs,
        endMs,
        isFadeIn,
        isFadeOut,
        targetType,
        customTitle
      },
      durationSec
    );
    onDismiss();
  };

  const sliceDurationSec = ((endMs - startMs) / 1000).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#130905] border border-[#2C1910] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C1910] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF5014]/15 border border-[#FF5014]/30 flex items-center justify-center text-[#FF5014]">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Millisecond Audio Trimmer Studio</h2>
              <p className="text-xs text-[#8E9299]">
                {initialStem ? `Trimming Stem: ${initialStem.name}` : `Source Track: ${currentSong.title}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isPlayingLoop) onStopLoop();
              onDismiss();
            }}
            className="p-2 rounded-full bg-[#1A100B] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tone Export Target Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#E0D8D0]">Preset Export Type</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(ToneExportType).map((type) => {
              const meta = TONE_EXPORT_METADATA[type];
              const isSelected = targetType === type;
              return (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#FF5014]/15 border-[#FF5014] text-white'
                      : 'bg-[#1A100B] border-[#2C1910] text-[#8E9299] hover:text-[#E0D8D0]'
                  }`}
                >
                  <div className={`text-xs font-bold ${isSelected ? 'text-[#FF7A45]' : 'text-white'}`}>
                    {meta.label}
                  </div>
                  <div className="text-[10px] text-[#8E9299] mt-0.5">
                    Recommended: {meta.defaultDurationMs / 1000}s
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trimming Waveform Display */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-white">Waveform Range Selector</span>
            <span className="font-mono text-[#FF7A45] font-bold">
              Duration: {sliceDurationSec}s ({formatMs(startMs)} → {formatMs(endMs)})
            </span>
          </div>

          <div className="relative w-full h-24 bg-[#0A0502] rounded-2xl border border-[#2C1910] p-2 flex items-center justify-between overflow-hidden">
            {/* Background Waveform Bars */}
            <div className="absolute inset-0 flex items-center justify-between gap-1 px-3 pointer-events-none opacity-40">
              {(initialStem?.waveformPoints || Array.from({ length: 36 }, (_, i) => 0.2 + 0.6 * Math.sin(i * 0.3))).map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-[#FF7A45] rounded-full"
                  style={{ height: `${Math.round(val * 85)}%` }}
                />
              ))}
            </div>

            {/* Active Slice Window Overlay */}
            <div
              className="absolute top-0 bottom-0 bg-[#FF5014]/20 border-l-2 border-r-2 border-[#FF5014] pointer-events-none"
              style={{
                left: `${(startMs / maxDur) * 100}%`,
                width: `${((endMs - startMs) / maxDur) * 100}%`
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[11px] font-bold text-white drop-shadow bg-black/60 px-2 py-0.5 rounded">
                  {sliceDurationSec}s Clip
                </span>
              </div>
            </div>
          </div>

          {/* Dual Sliders: Start and End */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#8E9299] w-14">Start:</span>
              <input
                type="range"
                min="0"
                max={maxDur}
                step="250"
                value={startMs}
                onChange={(e) => handleStartChange(Number(e.target.value))}
                className="flex-1 h-1.5 bg-[#24150D] rounded-lg appearance-none cursor-pointer accent-[#FF5014]"
              />
              <span className="font-mono text-xs text-white w-12 text-right">{formatMs(startMs)}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#8E9299] w-14">End:</span>
              <input
                type="range"
                min="0"
                max={maxDur}
                step="250"
                value={endMs}
                onChange={(e) => handleEndChange(Number(e.target.value))}
                className="flex-1 h-1.5 bg-[#24150D] rounded-lg appearance-none cursor-pointer accent-[#FF5014]"
              />
              <span className="font-mono text-xs text-white w-12 text-right">{formatMs(endMs)}</span>
            </div>
          </div>
        </div>

        {/* Options: Fade in / Fade out & Custom Title */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#2C1910]">
          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1A100B] border border-[#2C1910] cursor-pointer">
            <input
              type="checkbox"
              checked={isFadeIn}
              onChange={(e) => setIsFadeIn(e.target.checked)}
              className="accent-[#FF5014] w-4 h-4 rounded"
            />
            <span className="text-xs text-[#E0D8D0]">Fade In (0.5s)</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1A100B] border border-[#2C1910] cursor-pointer">
            <input
              type="checkbox"
              checked={isFadeOut}
              onChange={(e) => setIsFadeOut(e.target.checked)}
              className="accent-[#FF5014] w-4 h-4 rounded"
            />
            <span className="text-xs text-[#E0D8D0]">Fade Out (0.5s)</span>
          </label>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#E0D8D0]">Export Filename / Tone Label</label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#1A100B] border border-[#2C1910] text-sm text-white focus:outline-none focus:border-[#FF5014]"
            placeholder="E.g. Neon Horizon Main Hook (Ringtone)"
          />
        </div>

        {/* Buttons: Preview Loop & Export WAV */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={toggleLoopPreview}
            className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all ${
              isPlayingLoop
                ? 'bg-[#FF453A]/20 border-[#FF453A] text-[#FF453A]'
                : 'bg-[#1A100B] border-[#2C1910] text-white hover:bg-[#24150D]'
            }`}
          >
            {isPlayingLoop ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Preview</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Loop Preview Slice</span>
              </>
            )}
          </button>

          <button
            onClick={handleExport}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF5014] to-[#FF7A45] text-white font-bold text-sm shadow-lg shadow-[#FF5014]/30 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export & Save WAV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
