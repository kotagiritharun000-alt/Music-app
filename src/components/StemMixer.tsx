import React from 'react';
import { Download, Mic2, Music2, RotateCcw, Scissors, Volume2, VolumeX, Zap, Sparkles, Radio } from 'lucide-react';
import { BgmStem, StemCategory } from '../types';

interface StemMixerProps {
  stems: BgmStem[];
  stemMuteStates: Record<StemCategory, boolean>;
  stemSoloStates: Record<StemCategory, boolean>;
  onToggleStemMute: (cat: StemCategory) => void;
  onToggleStemSolo: (cat: StemCategory) => void;
  onResetStems: () => void;
  onTrimStem: (stem: BgmStem) => void;
  onDownloadStem: (stem: BgmStem) => void;
  onOpenBgmGenerator?: () => void;
  isBgmModeActive?: boolean;
  onToggleBgmMode?: () => void;
}

export const StemMixer: React.FC<StemMixerProps> = ({
  stems,
  stemMuteStates,
  stemSoloStates,
  onToggleStemMute,
  onToggleStemSolo,
  onResetStems,
  onTrimStem,
  onDownloadStem,
  onOpenBgmGenerator,
  isBgmModeActive = false,
  onToggleBgmMode
}) => {
  const getCategoryLabel = (cat: StemCategory) => {
    switch (cat) {
      case StemCategory.MAIN_MELODY: return 'Main Lead Melody';
      case StemCategory.BASSLINE_GROOVE: return 'Sub-Bass Groove';
      case StemCategory.DRUMS_PERCUSSION: return '808 Beat / Drums';
      case StemCategory.AMBIENT_PAD: return 'Atmospheric Pad';
      case StemCategory.CLIMAX_SOLO: return 'Climax Arp / Solo';
    }
  };

  const isAnySolo = Object.values(stemSoloStates).some(Boolean);

  return (
    <div className="w-full bg-[#130905] border border-[#2C1910] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Title & Reset Row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-[#FF5014]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              BGM Highlights & Multi-Stem Mixer
            </h3>
          </div>
          <p className="text-[11px] text-[#8E9299]">
            Solo or mute individual instrument layers to create custom ringtones & alarms.
          </p>
        </div>

        <button
          onClick={onResetStems}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A100B] hover:bg-[#24150D] text-[#8E9299] hover:text-[#E0D8D0] border border-[#2C1910] text-[11px] font-semibold transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Dedicated BGM Generator & Karaoke Mode Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#201008] to-[#170B05] border border-[#FF5014]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF5014]/20 border border-[#FF5014]/40 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-[#FF5014]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                BGM & Instrumental Studio
              </h4>
              <span className="px-1.5 py-0.2 rounded bg-[#FF5014]/15 text-[#FF7A45] text-[9px] font-bold">
                Dolby 360
              </span>
            </div>
            <p className="text-[11px] text-[#8E9299]">
              Isolate background music, remove vocals, and download uncompressed WAV.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onToggleBgmMode && (
            <button
              onClick={onToggleBgmMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isBgmModeActive
                  ? 'bg-[#FF5014] text-white shadow-md shadow-[#FF5014]/30'
                  : 'bg-[#24130A] hover:bg-[#2E180D] text-[#E0D8D0] border border-[#2C1910]'
              }`}
              title="Toggle BGM instrumental mode (mutes vocals during live playback)"
            >
              <Mic2 className={`w-3.5 h-3.5 ${isBgmModeActive ? 'line-through' : ''}`} />
              <span>{isBgmModeActive ? 'BGM Mode ON' : 'BGM Mode'}</span>
            </button>
          )}

          {onOpenBgmGenerator && (
            <button
              onClick={onOpenBgmGenerator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5014]/15 hover:bg-[#FF5014]/25 text-[#FF7A45] border border-[#FF5014]/40 text-xs font-bold transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate BGM</span>
            </button>
          )}
        </div>
      </div>

      {/* Stem Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stems.map((stem) => {
          const isMuted = stemMuteStates[stem.category];
          const isSolo = stemSoloStates[stem.category];
          const isAudible = isAnySolo ? isSolo : !isMuted;

          return (
            <div
              key={stem.id}
              className={`p-3.5 rounded-xl border transition-all duration-200 ${
                isAudible
                  ? 'bg-[#1A100B] border-[#2C1910] hover:border-[#FF5014]/40'
                  : 'bg-[#130905]/60 border-[#2C1910]/40 opacity-50'
              }`}
            >
              {/* Header: Name & Ringtone Tag */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{stem.name}</span>
                    {stem.isRingtoneRecommended && (
                      <span className="px-1.5 py-0.2 rounded bg-[#FF5014]/15 text-[#FF7A45] text-[9px] font-bold border border-[#FF5014]/30">
                        Ringtone Ready
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] text-[#8E9299] font-medium">
                    {getCategoryLabel(stem.category)} • {Math.round(stem.durationMs / 1000)}s
                  </span>
                </div>

                {/* Solo / Mute Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onToggleStemSolo(stem.category)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                      isSolo
                        ? 'bg-[#FF5014] text-white'
                        : 'bg-[#24150D] text-[#8E9299] hover:text-[#E0D8D0]'
                    }`}
                    title="Solo this stem layer"
                  >
                    S
                  </button>

                  <button
                    onClick={() => onToggleStemMute(stem.category)}
                    className={`p-1 rounded text-xs transition-colors ${
                      isMuted
                        ? 'bg-[#FF453A]/20 text-[#FF453A]'
                        : 'bg-[#24150D] text-[#8E9299] hover:text-[#E0D8D0]'
                    }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Waveform Visualization */}
              <div className="h-8 flex items-center gap-0.5 my-2 px-1 bg-[#130905] rounded-md border border-[#2C1910]/50">
                {stem.waveformPoints.map((point, pIdx) => (
                  <div
                    key={pIdx}
                    className={`flex-1 rounded-full transition-all ${
                      isAudible ? 'bg-[#FF5014]' : 'bg-[#5F5B57]'
                    }`}
                    style={{ height: `${Math.round(point * 100)}%` }}
                  />
                ))}
              </div>

              <p className="text-[11px] text-[#8E9299] line-clamp-1 mb-2.5">
                {stem.description}
              </p>

              {/* Action Buttons: Trim Stem / Download */}
              <div className="flex items-center justify-between pt-1 border-t border-[#2C1910]/60">
                <button
                  onClick={() => onTrimStem(stem)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#FF7A45] hover:text-white transition-colors"
                >
                  <Scissors className="w-3 h-3" />
                  <span>Trim to Ringtone / Alarm</span>
                </button>

                <button
                  onClick={() => onDownloadStem(stem)}
                  className="p-1 rounded bg-[#24150D] hover:bg-[#FF5014] text-[#8E9299] hover:text-white transition-colors"
                  title="Export WAV Stem"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
