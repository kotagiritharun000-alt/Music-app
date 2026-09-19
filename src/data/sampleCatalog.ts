import { Song, StemCategory, BgmStem, PlaylistItem } from '../types';

export function generateWaveform(seed: number, size: number = 40): number[] {
  const list: number[] = [];
  for (let i = 0; i < size; i++) {
    const v = 0.2 + 0.75 * Math.abs(Math.sin(i * 0.35 + seed * 0.7) * Math.cos(i * 0.15 + seed));
    list.push(Math.min(1.0, Math.max(0.15, v)));
  }
  return list;
}

export const SAMPLE_SONGS: Song[] = [
  {
    id: 'muse_track_1',
    title: 'Neon Horizon',
    artist: 'Aethelgard & Lofi Pulse',
    album: 'Cyber Solitude 2099',
    durationMs: 214000, // 3m 34s
    bpm: 118,
    key: 'F# Minor',
    genre: 'Cyberwave / Synthwave',
    gradientStart: '#7928CA',
    gradientEnd: '#00DFD8',
    isDolbyAtmos: true,
    isHiResLossless: true,
    bitDepth: 24,
    sampleRateKhz: 96,
    description: 'Hypnotic analog synthesizer arpeggios drifting over cinematic sub-bass and crisp 808 percussion.',
    stems: [
      {
        id: 'stem_1_melody',
        name: 'Main Lead Synth Theme',
        category: StemCategory.MAIN_MELODY,
        durationMs: 38000,
        startOffsetMs: 0,
        waveformPoints: generateWaveform(101),
        isRingtoneRecommended: true,
        description: 'Signature polyphonic Juno-106 hook melody with lush tape chorus.'
      },
      {
        id: 'stem_1_bass',
        name: 'Analog Sub-Bass Groove',
        category: StemCategory.BASSLINE_GROOVE,
        durationMs: 32000,
        startOffsetMs: 12000,
        waveformPoints: generateWaveform(102),
        isRingtoneRecommended: true,
        description: 'Punchy Moog Minitaur bassline tuned for deep subwoofer resonance.'
      },
      {
        id: 'stem_1_drums',
        name: '808 Cyber Beat & Percussion',
        category: StemCategory.DRUMS_PERCUSSION,
        durationMs: 28000,
        startOffsetMs: 24000,
        waveformPoints: generateWaveform(103),
        isRingtoneRecommended: false,
        description: 'Gated reverb snare and transient-shaped kick drum cadence.'
      },
      {
        id: 'stem_1_ambient',
        name: 'Celestial Atmos Pad',
        category: StemCategory.AMBIENT_PAD,
        durationMs: 45000,
        startOffsetMs: 0,
        waveformPoints: generateWaveform(104),
        isRingtoneRecommended: true,
        description: 'Binaural spatial atmospheric textures with modulated pitch drift.'
      },
      {
        id: 'stem_1_solo',
        name: 'Climax Laser Arp Solo',
        category: StemCategory.CLIMAX_SOLO,
        durationMs: 35000,
        startOffsetMs: 120000,
        waveformPoints: generateWaveform(105),
        isRingtoneRecommended: true,
        description: 'Dynamic high-octave arpeggiated crescendo designed for peak energy.'
      }
    ],
    lyrics: [
      { timestampMs: 4000, text: 'Drifting through the neon rain...', translation: 'Gliding past the rainy city lights', aiNote: 'Metaphor for modern isolation amidst technological brilliance' },
      { timestampMs: 12000, text: 'Signals fading out across the bay', translation: 'Radio waves vanishing over the water', aiNote: 'Foreshadows departure and acoustic release' },
      { timestampMs: 24000, text: "Hold the frequency, don't let it slip away", translation: 'Keep our connection strong and alive', aiNote: 'Theme of acoustic resonance' },
      { timestampMs: 38000, text: 'Echoes in the electric midnight sky', translation: 'Reflections dancing on the skyline', aiNote: 'Key vocal hook leading into the main synth theme' },
      { timestampMs: 52000, text: 'We find our rhythm where the shadows fly', translation: 'Finding peace in the hidden corners', aiNote: 'Transition into the harmonic chorus' },
      { timestampMs: 70000, text: 'Every heartbeat calibrated true', translation: 'Pure synchronized cadence', aiNote: 'Musical precision reference' },
      { timestampMs: 95000, text: 'Lost in neon, running back to you...', translation: 'Returning home through the digital labyrinth', aiNote: 'Climax emotional payoff' }
    ]
  },
  {
    id: 'muse_track_2',
    title: 'Midnight Reverie',
    artist: 'Seraphina Vance & The Velvet Trio',
    album: 'Midnight Acoustic Suite',
    durationMs: 186000, // 3m 06s
    bpm: 84,
    key: 'D Major',
    genre: 'Neo-Soul / Ambient Lofi',
    gradientStart: '#FF416C',
    gradientEnd: '#FF4B2B',
    isDolbyAtmos: true,
    isHiResLossless: true,
    bitDepth: 24,
    sampleRateKhz: 96,
    description: 'Velvet Rhodes electric piano chords complemented by fingerpicked nylon acoustic guitar and warm vinyl warmth.',
    stems: [
      {
        id: 'stem_2_melody',
        name: 'Acoustic Nylon Guitar Solo',
        category: StemCategory.MAIN_MELODY,
        durationMs: 34000,
        startOffsetMs: 14000,
        waveformPoints: generateWaveform(201),
        isRingtoneRecommended: true,
        description: 'Intimate Spanish flamenco-inspired acoustic guitar solo.'
      },
      {
        id: 'stem_2_rhodes',
        name: 'Vintage Rhodes Chords',
        category: StemCategory.AMBIENT_PAD,
        durationMs: 42000,
        startOffsetMs: 0,
        waveformPoints: generateWaveform(202),
        isRingtoneRecommended: true,
        description: 'Warm 1973 Suitcase Rhodes through tube tremolo emulation.'
      },
      {
        id: 'stem_2_upright',
        name: 'Acoustic Upright Bass Walk',
        category: StemCategory.BASSLINE_GROOVE,
        durationMs: 30000,
        startOffsetMs: 8000,
        waveformPoints: generateWaveform(203),
        isRingtoneRecommended: true,
        description: 'Deep wooden acoustic bass resonance recorded with dual ribbon mics.'
      },
      {
        id: 'stem_2_brush',
        name: 'Lofi Brush Snare & Shaker',
        category: StemCategory.DRUMS_PERCUSSION,
        durationMs: 26000,
        startOffsetMs: 16000,
        waveformPoints: generateWaveform(204),
        isRingtoneRecommended: false,
        description: 'Gentle jazz brush sweep with organic sidechain compression.'
      },
      {
        id: 'stem_2_strings',
        name: 'Cello & Viola String Bed',
        category: StemCategory.CLIMAX_SOLO,
        durationMs: 36000,
        startOffsetMs: 90000,
        waveformPoints: generateWaveform(205),
        isRingtoneRecommended: true,
        description: 'Rich chamber string harmonies configured for 3D Dolby expansion.'
      }
    ],
    lyrics: [
      { timestampMs: 3000, text: 'Coffee cools beside the open pane', translation: 'Morning calm before the world awakens', aiNote: 'Setting an intimate, sensory mood' },
      { timestampMs: 14000, text: "Whispers lingering from yesterday's rain", translation: 'Memories washed soft by the storm', aiNote: 'Poetic imagery' },
      { timestampMs: 28000, text: 'Play the chords that ease the quiet strain', translation: 'Harmonies that soothe the spirit', aiNote: 'Music therapy motif' },
      { timestampMs: 45000, text: 'Let the midnight reverie begin again...', translation: 'Welcoming the serene nightfall', aiNote: 'Main thematic refrain' }
    ]
  },
  {
    id: 'muse_track_3',
    title: 'Echoes of Elysium',
    artist: 'Orchestral Apex & Hans K.',
    album: 'Symphonic Dimensions',
    durationMs: 248000, // 4m 08s
    bpm: 132,
    key: 'A Minor',
    genre: 'Cinematic / Spatial Orchestral',
    gradientStart: '#4A00E0',
    gradientEnd: '#8E2DE2',
    isDolbyAtmos: true,
    isHiResLossless: true,
    bitDepth: 24,
    sampleRateKhz: 192,
    description: 'Epic cinematic orchestral composition featuring soaring French horns, taiko drums, and ethereal choir.',
    stems: [
      {
        id: 'stem_3_brass',
        name: 'French Horn & Trumpet Fanfare',
        category: StemCategory.MAIN_MELODY,
        durationMs: 32000,
        startOffsetMs: 20000,
        waveformPoints: generateWaveform(301),
        isRingtoneRecommended: true,
        description: 'Regal brass melody recorded in an 800-seat acoustic hall.'
      },
      {
        id: 'stem_3_taiko',
        name: 'Cinematic Taiko & Timpani',
        category: StemCategory.DRUMS_PERCUSSION,
        durationMs: 28000,
        startOffsetMs: 15000,
        waveformPoints: generateWaveform(302),
        isRingtoneRecommended: true,
        description: 'Thunderous low-end impact percussion for heroic ringtone alarms.'
      },
      {
        id: 'stem_3_choir',
        name: 'Elysian Choir Soprano',
        category: StemCategory.AMBIENT_PAD,
        durationMs: 40000,
        startOffsetMs: 0,
        waveformPoints: generateWaveform(303),
        isRingtoneRecommended: true,
        description: 'Multi-voice vocal arrangement spanning 4 octaves.'
      },
      {
        id: 'stem_3_strings',
        name: 'Spiccato Violins & Cellos',
        category: StemCategory.BASSLINE_GROOVE,
        durationMs: 34000,
        startOffsetMs: 10000,
        waveformPoints: generateWaveform(304),
        isRingtoneRecommended: true,
        description: 'Fast rhythmic string ostinato driving forward momentum.'
      },
      {
        id: 'stem_3_climax',
        name: 'Grand Orchestral Tutti Climax',
        category: StemCategory.CLIMAX_SOLO,
        durationMs: 45000,
        startOffsetMs: 140000,
        waveformPoints: generateWaveform(305),
        isRingtoneRecommended: true,
        description: 'Full 90-piece orchestra fortissimo peak with spatial surround.'
      }
    ],
    lyrics: [
      { timestampMs: 5000, text: '[Instrumental Prelude: Strings rising in 3D surround]', translation: 'Orchestral build', aiNote: 'Dolby Atmos height channel test' },
      { timestampMs: 22000, text: 'Ascend beyond the golden gates of stone', translation: 'Rising above earthly limits', aiNote: 'Mythological theme' },
      { timestampMs: 42000, text: 'Where every forgotten melody is known', translation: 'All lost songs find their home', aiNote: 'Ode to musical eternity' },
      { timestampMs: 65000, text: 'Echoes of Elysium forever chime!', translation: 'The timeless song rings out', aiNote: 'Grand chorus entry' }
    ]
  },
  {
    id: 'muse_track_4',
    title: 'Celestial Drift',
    artist: 'Kira Nova & Stellaris',
    album: 'Deep Orbital Horizons',
    durationMs: 195000,
    bpm: 124,
    key: 'C Minor',
    genre: 'Deep Melodic House',
    gradientStart: '#00C9FF',
    gradientEnd: '#92FE9D',
    isDolbyAtmos: true,
    isHiResLossless: true,
    bitDepth: 24,
    sampleRateKhz: 96,
    description: 'Ethereal female vocal chops layered with hypnotic bass synth and crystalline spatial arpeggios.',
    stems: [
      {
        id: 'stem_4_vocal_chop',
        name: 'Ethereal Vocal Chops Theme',
        category: StemCategory.MAIN_MELODY,
        durationMs: 30000,
        startOffsetMs: 16000,
        waveformPoints: generateWaveform(401),
        isRingtoneRecommended: true,
        description: 'Granular-resynthesized pitch-shifted vocal hook.'
      },
      {
        id: 'stem_4_club_bass',
        name: 'Deep House Pluck Bass',
        category: StemCategory.BASSLINE_GROOVE,
        durationMs: 32000,
        startOffsetMs: 8000,
        waveformPoints: generateWaveform(402),
        isRingtoneRecommended: true,
        description: 'FM-synthesized round bassline with dynamic filter cutoff.'
      },
      {
        id: 'stem_4_house_drums',
        name: 'Punchy 4-on-the-Floor Kick & Hats',
        category: StemCategory.DRUMS_PERCUSSION,
        durationMs: 28000,
        startOffsetMs: 0,
        waveformPoints: generateWaveform(403),
        isRingtoneRecommended: false,
        description: 'High-definition club drum groove with crisp open hi-hats.'
      },
      {
        id: 'stem_4_synth_pad',
        name: 'Deep Space Lush Shimmer',
        category: StemCategory.AMBIENT_PAD,
        durationMs: 40000,
        startOffsetMs: 0,
        waveformPoints: generateWaveform(404),
        isRingtoneRecommended: true,
        description: 'Infinite reverb wash creating expansive 360 soundfield.'
      },
      {
        id: 'stem_4_drop',
        name: 'Euphoric Drop Lead Hook',
        category: StemCategory.CLIMAX_SOLO,
        durationMs: 35000,
        startOffsetMs: 75000,
        waveformPoints: generateWaveform(405),
        isRingtoneRecommended: true,
        description: 'Anthemic supersaw lead with stereo widening effect.'
      }
    ],
    lyrics: [
      { timestampMs: 4000, text: 'Weightless floating in the atmosphere', translation: 'Zero gravity sensation', aiNote: 'Introduction to spatial dimension' },
      { timestampMs: 18000, text: 'Every distant constellation burning clear', translation: 'Cosmic clarity', aiNote: 'Visual and sonic resonance' },
      { timestampMs: 35000, text: 'Feel the gravity releasing all its hold', translation: 'Letting go of weight', aiNote: 'Drop buildup cue' },
      { timestampMs: 50000, text: "We're turning stardust into sonic gold!", translation: 'Transforming energy into music', aiNote: 'Peak drop celebration' }
    ]
  }
];

export const SAMPLE_PLAYLISTS: PlaylistItem[] = [
  {
    id: 'pl_naasongs_blockbusters',
    name: 'NaaSongs Telugu Hits',
    subtitle: 'Pushpa 2, Devara, RRR, Kalki 2898 AD',
    songIds: ['naa_pushpa2_pushpa', 'naa_devara_fear', 'naa_devara_chuttamalle', 'naa_kalki_bhairava', 'naa_rrr_naatu', 'naa_guntur_kurchi'],
    gradientColor: '#FF5014'
  },
  {
    id: 'pl_spatial',
    name: 'Dolby Atmos Masters',
    subtitle: 'Object-based 3D soundscapes',
    songIds: ['naa_pushpa2_pushpa', 'naa_devara_chuttamalle', 'muse_track_1', 'muse_track_3'],
    gradientColor: '#7928CA'
  },
  {
    id: 'pl_bgm_vault',
    name: 'Extracted BGM Highlights',
    subtitle: 'Isolated stems for ringtones & alarms',
    songIds: ['muse_track_1', 'muse_track_2', 'muse_track_4'],
    gradientColor: '#00DFD8'
  },
  {
    id: 'pl_lofi',
    name: 'Midnight Acoustic & Lofi',
    subtitle: 'Relaxing vibes for deep focus',
    songIds: ['muse_track_2'],
    gradientColor: '#FF416C'
  },
  {
    id: 'pl_cinematic',
    name: 'Epic Cinematic Scores',
    subtitle: 'Hi-Res lossless orchestral climaxes',
    songIds: ['muse_track_3', 'muse_track_4'],
    gradientColor: '#4A00E0'
  }
];
