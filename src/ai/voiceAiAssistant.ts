import { VoiceAction, VoiceAssistantState } from '../types';

// SpeechRecognition type declarations for browser support
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class VoiceAiAssistant {
  private recognition: any = null;
  private isListening: boolean = false;
  private onActionDispatched?: (action: VoiceAction) => void;
  private onStateUpdated?: (state: VoiceAssistantState) => void;

  private state: VoiceAssistantState = {
    isListening: false,
    isAlwaysListeningEnabled: false,
    recognizedText: '',
    assistantFeedback: "Listening for 'Hey Muse' or your command...",
    lastAction: null,
    confidence: 0.95
  };

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.updateState({
            isListening: true,
            assistantFeedback: "Hey Muse is listening..."
          });
        };

        this.recognition.onresult = (event: any) => {
          const results = event.results;
          if (!results || results.length === 0) return;

          const transcript = results[0][0].transcript;
          const isFinal = results[0].isFinal;

          this.updateState({ recognizedText: transcript });

          if (isFinal) {
            this.parseAndExecute(transcript);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error/warning:', event.error);
          this.updateState({
            isListening: false,
            assistantFeedback: "Tap the voice orb or click a quick command chip below."
          });
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.updateState({ isListening: false });
        };
      } catch (err) {
        console.warn('Speech recognition could not be initialized:', err);
      }
    }
  }

  public setCallbacks(
    onAction: (action: VoiceAction) => void,
    onState: (state: VoiceAssistantState) => void
  ) {
    this.onActionDispatched = onAction;
    this.onStateUpdated = onState;
    onState(this.state);
  }

  public startListening() {
    if (this.recognition) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        // already active
      }
    } else {
      this.updateState({
        isListening: true,
        recognizedText: '',
        assistantFeedback: "Web Speech API ready. Speak or pick a command chip..."
      });
      // Simulate listening window timeout if no microphone API is supported
      setTimeout(() => {
        if (this.state.isListening && !this.state.recognizedText) {
          this.updateState({
            isListening: false,
            assistantFeedback: "Pick a command chip below or enter a voice prompt."
          });
        }
      }, 4000);
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
    this.updateState({ isListening: false });
  }

  public parseCommand(rawInput: string): VoiceAction {
    const cleanInput = rawInput.trim().toLowerCase();
    const normalized = cleanInput
      .replace('hey muse', '')
      .replace('ok muse', '')
      .replace('muse', '')
      .trim();

    const textToEvaluate = normalized.length > 0 ? normalized : cleanInput;

    // 1. Explicit Volume 0 - 100
    const volumeMatch = textToEvaluate.match(/(?:volume|sound|level)\s*(?:to|at|is|=)?\s*(\d{1,3})%?/);
    if (volumeMatch && volumeMatch[1]) {
      const vol = parseInt(volumeMatch[1], 10);
      if (!isNaN(vol)) {
        return { type: 'SET_VOLUME', targetVolume: Math.max(0, Math.min(100, vol)) };
      }
    }

    // Relative Volume
    if (textToEvaluate.includes('decrease volume') || textToEvaluate.includes('volume down') || textToEvaluate.includes('lower sound') || textToEvaluate.includes('quieter')) {
      const numMatch = textToEvaluate.match(/(\d{1,2})/);
      const delta = numMatch ? -parseInt(numMatch[1], 10) : -15;
      return { type: 'ADJUST_VOLUME_RELATIVE', delta };
    }

    if (textToEvaluate.includes('increase volume') || textToEvaluate.includes('volume up') || textToEvaluate.includes('raise sound') || textToEvaluate.includes('louder')) {
      const numMatch = textToEvaluate.match(/(\d{1,2})/);
      const delta = numMatch ? parseInt(numMatch[1], 10) : 15;
      return { type: 'ADJUST_VOLUME_RELATIVE', delta };
    }

    // Mute / Unmute
    if (textToEvaluate.includes('unmute') || textToEvaluate.includes('sound on')) {
      return { type: 'UNMUTE' };
    }
    if (textToEvaluate.includes('mute') || textToEvaluate.includes('silence')) {
      return { type: 'MUTE' };
    }

    // Playback Navigation
    if (textToEvaluate.includes('next song') || textToEvaluate.includes('next track') || textToEvaluate.includes('skip')) {
      return { type: 'NEXT_SONG' };
    }
    if (textToEvaluate.includes('previous song') || textToEvaluate.includes('previous track') || textToEvaluate.includes('go back')) {
      return { type: 'PREVIOUS_SONG' };
    }
    if (textToEvaluate.includes('restart') || textToEvaluate.includes('replay')) {
      return { type: 'RESTART_SONG' };
    }
    if (textToEvaluate.includes('pause') || textToEvaluate.includes('stop')) {
      return { type: 'PAUSE' };
    }
    if (textToEvaluate === 'play' || textToEvaluate === 'resume' || textToEvaluate.includes('start playing')) {
      return { type: 'PLAY' };
    }

    // Search & Play
    if (textToEvaluate.startsWith('play ') || textToEvaluate.includes('play track') || textToEvaluate.includes('search for')) {
      const query = textToEvaluate
        .replace('play track', '')
        .replace('search for', '')
        .replace('play', '')
        .trim();
      return { type: 'SEARCH_AND_PLAY', query };
    }

    // Spatial Audio & Dolby Atmos
    if (textToEvaluate.includes('spatial audio') || textToEvaluate.includes('3d audio')) {
      const enable = !textToEvaluate.includes('off') && !textToEvaluate.includes('disable');
      return { type: 'SET_SPATIAL_AUDIO', enabled: enable };
    }
    if (textToEvaluate.includes('dolby atmos') || textToEvaluate.includes('dolby audio')) {
      const enable = !textToEvaluate.includes('off') && !textToEvaluate.includes('disable');
      return { type: 'SET_DOLBY_ATMOS', enabled: enable };
    }

    // Feature sheets / modals
    if (textToEvaluate.includes('bgm') || textToEvaluate.includes('stem') || textToEvaluate.includes('extract layer')) {
      return { type: 'OPEN_STEM_EXTRACTOR' };
    }
    if (textToEvaluate.includes('trim') || textToEvaluate.includes('crop') || textToEvaluate.includes('ringtone')) {
      return { type: 'OPEN_AUDIO_TRIMMER' };
    }
    if (textToEvaluate.includes('lyrics') || textToEvaluate.includes('words') || textToEvaluate.includes('notes')) {
      return { type: 'OPEN_LYRICS_CHAT' };
    }

    return { type: 'GENERAL_INFO', response: `Executing voice request: "${rawInput}"` };
  }

  public parseAndExecute(rawInput: string) {
    const action = this.parseCommand(rawInput);
    const feedback = this.generateFeedback(action);

    this.updateState({
      recognizedText: rawInput,
      assistantFeedback: feedback,
      isListening: false
    });

    if (this.onActionDispatched) {
      this.onActionDispatched(action);
    }
  }

  private generateFeedback(action: VoiceAction): string {
    switch (action.type) {
      case 'SET_VOLUME':
        return `Adjusted volume to ${action.targetVolume}%.`;
      case 'ADJUST_VOLUME_RELATIVE':
        return action.delta > 0 ? 'Increasing volume...' : 'Decreasing volume...';
      case 'MUTE':
        return 'Audio output muted.';
      case 'UNMUTE':
        return 'Audio unmuted.';
      case 'NEXT_SONG':
        return 'Skipping to next track...';
      case 'PREVIOUS_SONG':
        return 'Going back to previous track...';
      case 'RESTART_SONG':
        return 'Restarting track from beginning...';
      case 'PLAY':
        return 'Resuming audio playback...';
      case 'PAUSE':
        return 'Playback paused.';
      case 'SEARCH_AND_PLAY':
        return `Searching and playing "${action.query}"...`;
      case 'SET_SPATIAL_AUDIO':
        return action.enabled ? 'Spatial 3D Audio enabled.' : 'Spatial Audio bypassed.';
      case 'SET_DOLBY_ATMOS':
        return action.enabled ? 'Dolby Atmos engine active.' : 'Dolby Atmos bypassed.';
      case 'OPEN_STEM_EXTRACTOR':
        return 'Opening BGM Multi-Stem Segment Explorer...';
      case 'OPEN_AUDIO_TRIMMER':
        return 'Opening Audio Trimmer Studio...';
      case 'OPEN_LYRICS_CHAT':
        return 'Opening Muse Lyrics Intelligence...';
      case 'GENERAL_INFO':
        return action.response;
    }
  }

  private updateState(partial: Partial<VoiceAssistantState>) {
    this.state = { ...this.state, ...partial };
    if (this.onStateUpdated) {
      this.onStateUpdated(this.state);
    }
  }
}
