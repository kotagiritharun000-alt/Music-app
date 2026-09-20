import React, { useState } from 'react';
import {
  Moon,
  Clock,
  Volume2,
  X,
  Plus,
  Play,
  Pause,
  Sparkles,
  Check,
  Bed,
  Power
} from 'lucide-react';
import { Song } from '../types';

interface SleepTimerModalProps {
  remainingSeconds: number | null;
  totalSeconds: number | null;
  currentSong: Song;
  currentPositionMs: number;
  fadeAudio: boolean;
  onSetTimer: (seconds: number, fadeAudio: boolean) => void;
  onCancelTimer: () => void;
  onAddMinutes: (minutes: number) => void;
  onToggleFadeAudio: (fade: boolean) => void;
  onTriggerSleepNow: () => void;
  onDismiss: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  remainingSeconds,
  totalSeconds,
  currentSong,
  currentPositionMs,
  fadeAudio,
  onSetTimer,
  onCancelTimer,
  onAddMinutes,
  onToggleFadeAudio,
  onTriggerSleepNow,
  onDismiss
}) => {
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [localFade, setLocalFade] = useState<boolean>(fadeAudio);

  const isTimerActive = remainingSeconds !== null && remainingSeconds > 0;

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${remM.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remainingTrackMs = Math.max(0, currentSong.durationMs - currentPositionMs);
  const endOfTrackSeconds = Math.max(15, Math.round(remainingTrackMs / 1000));

  const formatTrackRemaining = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartPreset = (secs: number) => {
    onSetTimer(secs, localFade);
  };

  const handleStartCustom = () => {
    if (customMinutes > 0) {
      onSetTimer(customMinutes * 60, localFade);
    }
  };

  const progressPercent =
    isTimerActive && totalSeconds && totalSeconds > 0
      ? Math.min(100, Math.max(0, ((totalSeconds - (remainingSeconds || 0)) / totalSeconds) * 100))
      : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#130905] border border-[#2C1910] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C1910] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Moon className="w-5 h-5 fill-indigo-400/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Sleep Timer</h3>
                {isTimerActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8E9299]">Auto-pauses audio and enters Sleep Mode</p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-[#8E9299] hover:text-white hover:bg-[#1A100B] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Timer Card (If Running) */}
        {isTimerActive && (
          <div className="p-4 rounded-xl bg-gradient-to-b from-indigo-950/40 to-[#1A100B] border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
                Time Remaining
              </span>
              <span className="text-[11px] text-[#8E9299] font-mono">
                {progressPercent.toFixed(0)}% elapsed
              </span>
            </div>

            <div className="text-center py-2">
              <div className="text-4xl font-extrabold text-white font-mono tracking-wider text-indigo-100 drop-shadow-sm">
                {formatCountdown(remainingSeconds)}
              </div>
              <p className="text-xs text-indigo-300/80 mt-1">
                Audio will gently pause and enter Sleep Mode
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#24150D] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-[#FF5014] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Quick Adjustment Controls */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => onAddMinutes(5)}
                className="px-2 py-1.5 rounded-lg bg-[#24150D] hover:bg-[#2F1B11] border border-[#3D2316] text-[11px] font-semibold text-[#E0D8D0] hover:text-white transition-colors"
                title="Add 5 minutes to timer"
              >
                +5 min
              </button>
              <button
                onClick={() => onAddMinutes(15)}
                className="px-2 py-1.5 rounded-lg bg-[#24150D] hover:bg-[#2F1B11] border border-[#3D2316] text-[11px] font-semibold text-[#E0D8D0] hover:text-white transition-colors"
                title="Add 15 minutes to timer"
              >
                +15 min
              </button>
              <button
                onClick={onTriggerSleepNow}
                className="px-2 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-[11px] font-semibold text-indigo-200 transition-colors"
                title="Immediately pause audio and sleep"
              >
                Sleep Now
              </button>
              <button
                onClick={onCancelTimer}
                className="px-2 py-1.5 rounded-lg bg-[#FF453A]/15 hover:bg-[#FF453A]/25 border border-[#FF453A]/30 text-[11px] font-semibold text-[#FF453A] transition-colors"
                title="Turn off sleep timer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Preset Countdown Durations */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8E9299] uppercase tracking-wider">
            {isTimerActive ? 'Change Timer Preset' : 'Select Timer Preset'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: '15 Minutes', secs: 15 * 60, desc: 'Quick rest' },
              { label: '30 Minutes', secs: 30 * 60, desc: 'Recommended' },
              { label: '45 Minutes', secs: 45 * 60, desc: 'Deep drift' },
              { label: '60 Minutes', secs: 60 * 60, desc: '1 Hour' },
              { label: '90 Minutes', secs: 90 * 60, desc: 'Full cycle' }
            ].map((p) => {
              const isSelected = isTimerActive && totalSeconds === p.secs;
              return (
                <button
                  key={p.secs}
                  onClick={() => handleStartPreset(p.secs)}
                  className={`p-2.5 rounded-xl border text-left transition-all group ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                      : 'bg-[#1A100B] hover:bg-[#24150D] border-[#2C1910] hover:border-[#3D2316] text-[#E0D8D0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                      {p.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <span className="text-[10px] text-[#8E9299] block mt-0.5">{p.desc}</span>
                </button>
              );
            })}

            {/* End of Current Song Preset */}
            <button
              onClick={() => handleStartPreset(endOfTrackSeconds)}
              className="p-2.5 rounded-xl border bg-[#1A100B] hover:bg-[#24150D] border-[#2C1910] hover:border-[#3D2316] text-[#E0D8D0] text-left transition-all group col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                  End of Song
                </span>
                <span className="text-[10px] font-mono text-[#FF7A45]">
                  {formatTrackRemaining(remainingTrackMs)}
                </span>
              </div>
              <span className="text-[10px] text-[#8E9299] block mt-0.5 truncate">
                When {currentSong.title} finishes
              </span>
            </button>
          </div>
        </div>

        {/* Custom Minutes Slider */}
        <div className="p-3.5 rounded-xl bg-[#1A100B] border border-[#2C1910] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#E0D8D0]">Custom Duration</span>
            <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              {customMinutes} minutes
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCustomMinutes((prev) => Math.max(1, prev - 5))}
              className="w-8 h-8 rounded-lg bg-[#24150D] border border-[#2C1910] text-[#8E9299] hover:text-white flex items-center justify-center font-bold text-sm"
              title="Decrease 5 minutes"
            >
              -
            </button>

            <input
              type="range"
              min="1"
              max="120"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Number(e.target.value))}
              className="flex-1 h-1.5 bg-[#24150D] rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />

            <button
              onClick={() => setCustomMinutes((prev) => Math.min(180, prev + 5))}
              className="w-8 h-8 rounded-lg bg-[#24150D] border border-[#2C1910] text-[#8E9299] hover:text-white flex items-center justify-center font-bold text-sm"
              title="Increase 5 minutes"
            >
              +
            </button>
          </div>

          <button
            onClick={handleStartCustom}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Set Timer for {customMinutes} Minutes</span>
          </button>
        </div>

        {/* Gentle Audio Fade-out Option & Sleep Now Button */}
        <div className="pt-2 border-t border-[#2C1910] space-y-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-[#8E9299] group-hover:text-indigo-400 transition-colors" />
              <div>
                <span className="text-xs font-semibold text-[#E0D8D0] block">
                  Gentle Audio Fade-Out
                </span>
                <span className="text-[10px] text-[#8E9299] block">
                  Gradually lowers volume in final 30 seconds
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={localFade}
              onChange={(e) => {
                setLocalFade(e.target.checked);
                onToggleFadeAudio(e.target.checked);
              }}
              className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
            />
          </label>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onTriggerSleepNow}
              className="flex-1 py-2 px-3 rounded-xl bg-[#24150D] hover:bg-[#2F1B11] border border-[#3D2316] text-xs font-semibold text-[#E0D8D0] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Bed className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enter Sleep Mode Now</span>
            </button>

            <button
              onClick={onDismiss}
              className="py-2 px-4 rounded-xl bg-[#1A100B] hover:bg-[#24150D] border border-[#2C1910] text-xs font-semibold text-[#8E9299] hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
