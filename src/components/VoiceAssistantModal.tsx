import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles, X } from 'lucide-react';
import { VoiceAssistantState } from '../types';

interface VoiceAssistantModalProps {
  state: VoiceAssistantState;
  onStartListening: () => void;
  onStopListening: () => void;
  onExecuteCommand: (command: string) => void;
  onDismiss: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  state,
  onStartListening,
  onStopListening,
  onExecuteCommand,
  onDismiss
}) => {
  const [manualInput, setManualInput] = useState('');

  const quickCommands = [
    'Set volume to 90%',
    'Skip to next song',
    'Enable Dolby Atmos',
    'Open stem extractor',
    'Trim ringtone clip',
    'Explain song meaning',
    'Lower volume by 20%',
    'Play Celestial Drift'
  ];

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onExecuteCommand(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#130905] border border-[#2C1910] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C1910] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF5014] to-[#FF7A45] flex items-center justify-center text-white shadow-md shadow-[#FF5014]/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Hey Muse AI Voice Assistant</h2>
              <p className="text-[11px] text-[#8E9299]">Natural speech voice control for playback, stems & spatial audio</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full bg-[#1A100B] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Glowing Voice Orb */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Outer Pulsing Wave Rings */}
            <div
              className={`absolute w-32 h-32 rounded-full bg-[#FF5014]/20 transition-transform duration-700 ${
                state.isListening ? 'animate-ping' : 'scale-90 opacity-20'
              }`}
            />
            <div
              className={`absolute w-24 h-24 rounded-full bg-gradient-to-r from-[#FF5014]/30 to-[#FF7A45]/30 blur-md ${
                state.isListening ? 'animate-pulse' : 'opacity-30'
              }`}
            />

            {/* Microphone Orb Button */}
            <button
              onClick={state.isListening ? onStopListening : onStartListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
                state.isListening
                  ? 'bg-gradient-to-tr from-[#FF453A] to-[#FF5014] scale-105 shadow-[#FF453A]/50'
                  : 'bg-gradient-to-tr from-[#FF5014] to-[#8B3010] hover:scale-105 shadow-[#FF5014]/40'
              }`}
            >
              {state.isListening ? (
                <Mic className="w-9 h-9 animate-pulse" />
              ) : (
                <MicOff className="w-8 h-8 opacity-90" />
              )}
            </button>
          </div>

          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF7A45]">
              {state.isListening ? 'Listening for speech...' : 'Tap Orb to Speak'}
            </span>
            <p className="text-xs text-[#8E9299]">
              Say "Hey Muse, volume up" or choose a command below.
            </p>
          </div>
        </div>

        {/* Assistant Feedback Box */}
        <div className="p-3.5 rounded-2xl bg-[#1A100B] border border-[#2C1910] space-y-2">
          {state.recognizedText && (
            <div className="text-xs text-[#8E9299]">
              <span className="font-semibold text-white">Heard: </span>"{state.recognizedText}"
            </div>
          )}
          <div className="text-xs text-white flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5014] mt-1 shrink-0" />
            <span>{state.assistantFeedback}</span>
          </div>
        </div>

        {/* Quick Command Chips */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#E0D8D0]">Tap to Test Voice Commands</span>
          <div className="flex flex-wrap gap-1.5">
            {quickCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => onExecuteCommand(cmd)}
                className="px-2.5 py-1 rounded-full bg-[#1A100B] hover:bg-[#FF5014]/20 text-[#8E9299] hover:text-[#FF7A45] border border-[#2C1910] hover:border-[#FF5014]/40 text-[11px] font-medium transition-all"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Command Input */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Type a voice command..."
            className="flex-1 px-3 py-2 rounded-xl bg-[#1A100B] border border-[#2C1910] text-xs text-white focus:outline-none focus:border-[#FF5014]"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-[#FF5014] text-white hover:brightness-110 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
