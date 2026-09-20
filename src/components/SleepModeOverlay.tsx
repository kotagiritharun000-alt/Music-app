import React, { useState, useEffect } from 'react';
import { Moon, Play, Power, Volume2, Sparkles, BedDouble } from 'lucide-react';
import { Song } from '../types';

interface SleepModeOverlayProps {
  lastPlayedSong: Song;
  triggeredAt: Date | null;
  onWakeUp: (resumePlayback: boolean) => void;
}

export const SleepModeOverlay: React.FC<SleepModeOverlayProps> = ({
  lastPlayedSong,
  triggeredAt,
  onWakeUp
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Keep live digital bedside clock updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard accessibility: space or enter wakes & resumes, esc wakes quietly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onWakeUp(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onWakeUp(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onWakeUp]);

  const formattedHoursMinutes = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const formattedTriggeredTime = triggeredAt
    ? triggeredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : undefined;

  return (
    <div
      onClick={() => onWakeUp(false)}
      className="fixed inset-0 bg-[#060302] text-white z-50 flex flex-col items-center justify-between p-6 sm:p-10 select-none cursor-pointer overflow-hidden animate-in fade-in duration-500"
    >
      {/* Gentle ambient background aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-950/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#FF5014]/5 rounded-full blur-3xl" />
        
        {/* Subtle twinkling stars */}
        <div className="absolute top-12 left-16 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute top-28 right-24 w-1.5 h-1.5 bg-indigo-300/40 rounded-full animate-ping" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-32 left-20 w-1 h-1 bg-amber-200/40 rounded-full animate-ping" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-48 right-32 w-1.5 h-1.5 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '7s' }} />
      </div>

      {/* Top Bar: Sleep Mode Status */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-2xl text-xs text-[#8E9299]">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#120805] border border-[#2C1910]">
          <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
          <span className="font-semibold text-indigo-200">Sleep Mode Active</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          <span>Playback Paused Safely</span>
        </div>
      </div>

      {/* Centerpiece: Bedside Digital Clock & Peaceful Aura */}
      <div className="relative z-10 text-center space-y-6 max-w-md my-auto">
        {/* Breathing Crescent Icon */}
        <div className="relative inline-block mx-auto">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-indigo-950/50 to-[#120805] border border-indigo-500/30 flex items-center justify-center shadow-2xl shadow-indigo-950/50">
            <Moon className="w-12 h-12 text-indigo-300 fill-indigo-300/20 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-indigo-600/80 text-[10px] font-bold text-white tracking-widest uppercase">
            Zzz
          </div>
        </div>

        {/* Big Digital Clock */}
        <div className="space-y-1">
          <div className="text-5xl sm:text-7xl font-extrabold font-mono tracking-tight text-white/95 drop-shadow-md">
            {formattedHoursMinutes}
          </div>
          <p className="text-sm sm:text-base text-[#8E9299] font-medium">
            {formattedDate}
          </p>
        </div>

        {/* Last Song Information */}
        {lastPlayedSong && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="p-3.5 rounded-2xl bg-[#120805]/90 border border-[#2C1910] flex items-center gap-3 text-left shadow-lg cursor-default max-w-sm mx-auto"
          >
            <img
              src={lastPlayedSong.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
              alt={lastPlayedSong.title}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#2C1910]"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Paused at {formattedTriggeredTime || 'timer end'}
              </div>
              <h4 className="text-sm font-bold text-white truncate">
                {lastPlayedSong.title}
              </h4>
              <p className="text-xs text-[#8E9299] truncate">
                {lastPlayedSong.artist}
              </p>
            </div>
          </div>
        )}

        {/* Wake Up Actions */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <button
            onClick={() => onWakeUp(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF5014] to-[#FF7A45] hover:scale-105 active:scale-95 text-white font-bold text-sm shadow-xl shadow-[#FF5014]/25 flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Wake Up & Resume</span>
          </button>

          <button
            onClick={() => onWakeUp(false)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1A100B] hover:bg-[#24150D] border border-[#2C1910] text-[#E0D8D0] hover:text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Power className="w-4 h-4 text-[#8E9299]" />
            <span>Wake Up (Silent)</span>
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="relative z-10 text-center text-xs text-[#5F5B57] flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400/50" />
        <span>Tap anywhere or press Space / Escape to wake up</span>
      </div>
    </div>
  );
};
