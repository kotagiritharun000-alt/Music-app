import React from 'react';
import { CheckCircle2, Cpu, FileText, Layers, ShieldCheck, Sparkles, X } from 'lucide-react';

interface PrdArchitectureModalProps {
  onDismiss: () => void;
}

export const PrdArchitectureModal: React.FC<PrdArchitectureModalProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#130905] border border-[#2C1910] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C1910] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF5014]/15 border border-[#FF5014]/30 flex items-center justify-center text-[#FF5014]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Muse PRD & Audio Architecture</h2>
              <p className="text-xs text-[#8E9299]">Technical System Blueprint & Feature Specifications</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full bg-[#1A100B] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Executive Summary Card */}
        <div className="p-4 rounded-2xl bg-[#1A100B] border border-[#2C1910] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF7A45]">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Ad-Free Spatial Audio Core Principle</span>
          </div>
          <p className="text-xs text-[#E0D8D0] leading-relaxed">
            Muse is engineered as a zero-interruption, ad-free music streaming and audio utility platform. Audio generation, multi-stem isolation, and 3D binaural spatialization run entirely on a real-time procedural Web Audio API engine, providing 24-bit/96kHz lossless fidelity with zero server buffer latency.
          </p>
        </div>

        {/* Feature Specifications Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">System Specifications</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Spec 1: Dolby Atmos */}
            <div className="p-3.5 rounded-xl bg-[#1A100B] border border-[#2C1910] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-[#FF5014]" />
                <span>Dolby Atmos & 3D Spatial Audio</span>
              </div>
              <p className="text-[11px] text-[#8E9299] leading-normal">
                StereoPannerNode + BiquadFilter low-shelf (+14dB bass) + Peaking filter (vocal presence) + algorithmic convolution reverb for Studio, Atmos 360, Concert Hall, and Binaural modes.
              </p>
            </div>

            {/* Spec 2: Multi-Stem Mixer */}
            <div className="p-3.5 rounded-xl bg-[#1A100B] border border-[#2C1910] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Cpu className="w-4 h-4 text-[#FF5014]" />
                <span>BGM Segment Isolation</span>
              </div>
              <p className="text-[11px] text-[#8E9299] leading-normal">
                Multi-layer stem separation (Main Melody, Sub-Bass, Drums, Pad, Climax Solo). Users can solo or mute any stem live and export it directly as a phone ringtone.
              </p>
            </div>

            {/* Spec 3: Audio Trimmer */}
            <div className="p-3.5 rounded-xl bg-[#1A100B] border border-[#2C1910] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <FileText className="w-4 h-4 text-[#FF5014]" />
                <span>Millisecond Trimmer Studio</span>
              </div>
              <p className="text-[11px] text-[#8E9299] leading-normal">
                Sub-second waveform slicing with preset targets (Ringtone 30s, Chime 5s, Alarm 45s, Stem 60s), fade in/out envelopes, live loop playback, and client-side WAV binary compiler.
              </p>
            </div>

            {/* Spec 4: Voice AI */}
            <div className="p-3.5 rounded-xl bg-[#1A100B] border border-[#2C1910] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-[#FF5014]" />
                <span>"Hey Muse" Voice Assistant</span>
              </div>
              <p className="text-[11px] text-[#8E9299] leading-normal">
                Web Speech API integration parsing 15+ voice intents: volume levels, relative volume, skip, replay, spatial audio toggling, and direct navigation to trimmer and stem tools.
              </p>
            </div>
          </div>
        </div>

        {/* Audio Pipeline Diagram */}
        <div className="p-4 rounded-2xl bg-[#0A0502] border border-[#2C1910] space-y-2">
          <div className="text-xs font-bold text-[#E0D8D0]">Procedural Audio Routing Graph</div>
          <div className="p-2.5 rounded-xl bg-[#130905] font-mono text-[10px] text-[#FF7A45] leading-relaxed border border-[#2C1910]/70 overflow-x-auto">
            [Multi-Stem Synthesizers] → [Bass Boost LowShelf (120Hz)] → [Vocal Clarity Peaking (2.8kHz)]
            <br />
            &nbsp;&nbsp;→ [Spatial Panner (-1 to +1)] → [Parallel Convolver Reverb (Room IR)]
            <br />
            &nbsp;&nbsp;→ [Master Gain (0-100%)] → [16-Band Analyser (FFT 64)] → [Hardware Speakers / Headphones]
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="w-full py-2.5 rounded-xl bg-[#1A100B] hover:bg-[#24150D] text-[#E0D8D0] font-semibold text-xs border border-[#2C1910] transition-colors"
        >
          Close Blueprint
        </button>
      </div>
    </div>
  );
};
