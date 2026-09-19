import React, { useState, useRef, useEffect } from 'react';
import { Compass, Headphones, Sparkles, Volume2, X } from 'lucide-react';
import { AudioSpatialConfig, RoomPreset, ROOM_PRESET_METADATA } from '../types';

interface SpatialAudioModalProps {
  config: AudioSpatialConfig;
  onConfigChanged: (config: AudioSpatialConfig) => void;
  onDismiss: () => void;
}

export const SpatialAudioModal: React.FC<SpatialAudioModalProps> = ({
  config,
  onConfigChanged,
  onDismiss
}) => {
  const [localConfig, setLocalConfig] = useState<AudioSpatialConfig>(config);
  const radarRef = useRef<HTMLDivElement>(null);

  const update = (partial: Partial<AudioSpatialConfig>) => {
    const updated = { ...localConfig, ...partial };
    setLocalConfig(updated);
    onConfigChanged(updated);
  };

  // Handle radar click / drag for azimuth angle & distance
  const handleRadarInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!radarRef.current) return;
    const rect = radarRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    let angleRad = Math.atan2(dy, dx);
    // Convert to degrees where top is 0 deg, right is +90, left is -90
    let angleDeg = Math.round((angleRad * 180) / Math.PI) + 90;
    if (angleDeg > 180) angleDeg -= 360;

    const distNormalized = Math.min(1.0, Math.sqrt(dx * dx + dy * dy) / (rect.width / 2));
    const distMeters = Math.max(0.4, Number((distNormalized * 2.0).toFixed(1)));

    update({
      azimuthAngleDegrees: angleDeg,
      distanceMeters: distMeters
    });
  };

  // Calculate position of the sound source orb inside the radar circle
  const radarRadiusPercent = (localConfig.distanceMeters / 2.0) * 42; // up to 42% from center
  const rad = ((localConfig.azimuthAngleDegrees - 90) * Math.PI) / 180;
  const orbX = 50 + radarRadiusPercent * Math.cos(rad);
  const orbY = 50 + radarRadiusPercent * Math.sin(rad);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#130905] border border-[#2C1910] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C1910] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF5014]/15 border border-[#FF5014]/30 flex items-center justify-center text-[#FF5014]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dolby Atmos & Spatial 3D Audio</h2>
              <p className="text-xs text-[#8E9299]">Object-based soundfield & HRTF binaural acoustic engine</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 rounded-full bg-[#1A100B] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Toggles */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#1A100B] border border-[#2C1910] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Spatial Audio 3D</div>
              <div className="text-[10px] text-[#8E9299]">Binaural expansion</div>
            </div>
            <button
              onClick={() => update({ isSpatialEnabled: !localConfig.isSpatialEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                localConfig.isSpatialEnabled ? 'bg-[#FF5014]' : 'bg-[#2C1910]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  localConfig.isSpatialEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1A100B] border border-[#2C1910] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Dolby Atmos 360</div>
              <div className="text-[10px] text-[#8E9299]">Dynamic object rendering</div>
            </div>
            <button
              onClick={() => update({ isDolbyAtmosEnabled: !localConfig.isDolbyAtmosEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                localConfig.isDolbyAtmosEnabled ? 'bg-[#FF5014]' : 'bg-[#2C1910]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  localConfig.isDolbyAtmosEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Interactive 360° Soundstage Radar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#FF5014]" />
              <span>3D Soundstage Panning Radar</span>
            </span>
            <span className="font-mono text-[#FF7A45] font-semibold text-[11px]">
              {localConfig.azimuthAngleDegrees > 0 ? `+${localConfig.azimuthAngleDegrees}°` : `${localConfig.azimuthAngleDegrees}°`} • {localConfig.distanceMeters}m
            </span>
          </div>

          <div
            ref={radarRef}
            onClick={handleRadarInteraction}
            className="relative w-full h-44 rounded-2xl bg-[#0A0502] border border-[#2C1910] flex items-center justify-center cursor-crosshair overflow-hidden group select-none"
          >
            {/* Radar Grid Circles */}
            <div className="absolute w-36 h-36 rounded-full border border-[#2C1910]/70" />
            <div className="absolute w-24 h-24 rounded-full border border-[#2C1910]/60" />
            <div className="absolute w-12 h-12 rounded-full border border-[#2C1910]/50" />
            <div className="absolute w-full h-px bg-[#2C1910]/40" />
            <div className="absolute h-full w-px bg-[#2C1910]/40" />

            {/* Radar Scanning Line */}
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,_rgba(255,80,20,0.15)_0deg,_transparent_60deg)] animate-spin-slow pointer-events-none" />

            {/* Center Listener Head Icon */}
            <div className="z-10 w-8 h-8 rounded-full bg-[#1A100B] border border-[#FF5014]/60 flex items-center justify-center text-[#FF5014] shadow-md shadow-[#FF5014]/30 pointer-events-none">
              <Headphones className="w-4 h-4" />
            </div>

            {/* Draggable Active Sound Source Node */}
            <div
              className="absolute w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF5014] to-[#FF7A45] shadow-lg shadow-[#FF5014]/80 border-2 border-white -translate-x-1/2 -translate-y-1/2 transition-all duration-75 pointer-events-none"
              style={{ left: `${orbX}%`, top: `${orbY}%` }}
            />

            <div className="absolute bottom-2 text-[10px] text-[#8E9299] pointer-events-none">
              Tap anywhere in radar to reposition sound source
            </div>
          </div>
        </div>

        {/* Room Acoustic Presets */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-white">Acoustic Room Environment</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(RoomPreset).map((preset) => {
              const meta = ROOM_PRESET_METADATA[preset];
              const isSelected = localConfig.roomPreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => update({ roomPreset: preset })}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-[#FF5014]/15 border-[#FF5014] text-white'
                      : 'bg-[#1A100B] border-[#2C1910] text-[#8E9299] hover:text-[#E0D8D0]'
                  }`}
                >
                  <div className={`text-xs font-bold ${isSelected ? 'text-[#FF7A45]' : 'text-white'}`}>
                    {meta.label}
                  </div>
                  <div className="text-[10px] text-[#8E9299] line-clamp-1 mt-0.5">
                    {meta.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* EQ Enhancement Sliders */}
        <div className="space-y-3 pt-2 border-t border-[#2C1910]">
          {/* Bass Boost */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#E0D8D0] font-medium">Dolby Sub-Bass Boost (+14dB Max)</span>
              <span className="font-mono text-[#FF7A45]">{Math.round(localConfig.bassBoost * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localConfig.bassBoost}
              onChange={(e) => update({ bassBoost: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#24150D] rounded-lg appearance-none cursor-pointer accent-[#FF5014]"
            />
          </div>

          {/* Vocal Clarity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#E0D8D0] font-medium">Center Channel Vocal Clarity</span>
              <span className="font-mono text-[#FF7A45]">{Math.round(localConfig.vocalClarity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localConfig.vocalClarity}
              onChange={(e) => update({ vocalClarity: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#24150D] rounded-lg appearance-none cursor-pointer accent-[#FF5014]"
            />
          </div>
        </div>

        {/* Footer Done Button */}
        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF5014] to-[#FF7A45] text-white font-bold text-sm shadow-lg shadow-[#FF5014]/25 hover:brightness-110 active:scale-[0.99] transition-all"
        >
          Apply Spatial Configuration
        </button>
      </div>
    </div>
  );
};
