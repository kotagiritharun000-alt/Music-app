import React from 'react';
import {
  Heart,
  Mic,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Scissors,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Song } from '../types';

interface PlayerControlsProps {
  currentSong: Song;
  isPlaying: boolean;
  currentPositionMs: number;
  volume: number;
  isMuted: boolean;
  isFavorite: boolean;
  onTogglePlayPause: () => void;
  onNextSong: () => void;
  onPreviousSong: () => void;
  onRestartSong: () => void;
  onSeekTo: (ms: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleFavorite: () => void;
  onOpenSpatial: () => void;
  onOpenTrimmer: () => void;
  onOpenVoiceAssistant: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentSong,
  isPlaying,
  currentPositionMs,
  volume,
  isMuted,
  isFavorite,
  onTogglePlayPause,
  onNextSong,
  onPreviousSong,
  onRestartSong,
  onSeekTo,
  onVolumeChange,
  onToggleMute,
  onToggleFavorite,
  onOpenSpatial,
  onOpenTrimmer,
  onOpenVoiceAssistant
}) => {
  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (currentPositionMs / currentSong.durationMs) * 100));

  return (
    <div className="w-full bg-[#130905] border border-[#2C1910] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Title & Artist Row with Favorite */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate drop-shadow-sm">
              {currentSong.title}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF5014]/15 text-[#FF7A45] border border-[#FF5014]/30 whitespace-nowrap">
              {currentSong.bpm} BPM
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8E9299] truncate font-medium mt-0.5">
            {currentSong.artist} • <span className="text-[#E0D8D0]/70">{currentSong.album}</span>
          </p>
        </div>

        <button
          onClick={onToggleFavorite}
          className={`p-2.5 rounded-full border transition-transform active:scale-95 ${
            isFavorite
              ? 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/40'
              : 'bg-[#1A100B] text-[#8E9299] hover:text-white border-[#2C1910]'
          }`}
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Progress Scrubber */}
      <div className="space-y-1.5">
        <div className="relative flex items-center group cursor-pointer">
          <input
            type="range"
            min="0"
            max={currentSong.durationMs}
            value={currentPositionMs}
            onChange={(e) => onSeekTo(Number(e.target.value))}
            className="w-full h-2 bg-[#24150D] rounded-lg appearance-none cursor-pointer accent-[#FF5014] focus:outline-none"
          />
        </div>
        <div className="flex justify-between text-xs text-[#8E9299] font-mono">
          <span>{formatTime(currentPositionMs)}</span>
          <span className="text-[#5F5B57]">{currentSong.key}</span>
          <span>{formatTime(currentSong.durationMs)}</span>
        </div>
      </div>

      {/* Main Transport Buttons */}
      <div className="flex items-center justify-between sm:justify-center sm:gap-6 pt-1">
        <button
          onClick={onRestartSong}
          title="Restart Track"
          className="p-2 text-[#8E9299] hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onPreviousSong}
          title="Previous Track"
          className="p-2 text-[#E0D8D0] hover:text-[#FF5014] transition-colors"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Big Play / Pause Button with Radiant Glow */}
        <button
          onClick={onTogglePlayPause}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF5014] to-[#FF7A45] flex items-center justify-center text-white shadow-lg shadow-[#FF5014]/40 hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          )}
        </button>

        <button
          onClick={onNextSong}
          title="Next Track"
          className="p-2 text-[#E0D8D0] hover:text-[#FF5014] transition-colors"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenSpatial}
          title="Spatial Audio Tuning"
          className="p-2 text-[#FF7A45] hover:text-white transition-colors"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Volume Bar & Quick Presets */}
      <div className="pt-2 border-t border-[#2C1910] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onToggleMute}
            className="text-[#8E9299] hover:text-[#FF5014] transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-[#FF453A]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#E0D8D0]" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full sm:w-44 h-1.5 bg-[#24150D] rounded-lg appearance-none cursor-pointer accent-[#FF5014] focus:outline-none"
          />

          <span className="text-xs font-mono text-[#8E9299] w-8">
            {isMuted ? '0%' : `${volume}%`}
          </span>
        </div>

        {/* Quick Volume & Action Chips */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {[25, 50, 75, 100].map((preset) => (
            <button
              key={preset}
              onClick={() => onVolumeChange(preset)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                volume === preset && !isMuted
                  ? 'bg-[#FF5014] text-white border-[#FF5014]'
                  : 'bg-[#1A100B] text-[#8E9299] hover:text-[#E0D8D0] border-[#2C1910]'
              }`}
            >
              {preset}%
            </button>
          ))}

          <button
            onClick={onOpenTrimmer}
            title="Open Audio Trimmer"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A100B] hover:bg-[#24150D] text-[#FF7A45] border border-[#2C1910] text-[11px] font-semibold transition-colors"
          >
            <Scissors className="w-3 h-3" />
            <span>Trim</span>
          </button>
        </div>
      </div>
    </div>
  );
};
