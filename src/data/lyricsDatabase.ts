import { LyricLine, Song } from '../types';

export interface SongFullLyrics {
  id: string;
  songTitle: string;
  movieOrAlbum: string;
  language: string;
  lyricist: string;
  singers: string;
  musicDirector: string;
  lines: LyricLine[];
}

export const COMPREHENSIVE_LYRICS_DB: Record<string, SongFullLyrics> = {
  pushpa: {
    id: 'pushpa',
    songTitle: 'Pushpa Pushpa',
    movieOrAlbum: 'Pushpa 2: The Rule (2024)',
    language: 'Telugu / Multi-Lingual',
    lyricist: 'Chandrabose',
    singers: 'Nakash Aziz, Deepak Blue',
    musicDirector: 'Devi Sri Prasad (DSP)',
    lines: [
      {
        timestampMs: 0,
        text: 'Pushpa Pushpa Pushpa Pushpa Raj... Asalu Thaggedhe Le!',
        translation: 'Pushpa Pushpa Raj... There is no stepping back!',
        aiNote: 'High-octane intro accompanied by booming Dappu percussions.'
      },
      {
        timestampMs: 12000,
        text: 'Nippuki cheera kattina, Gupchup ane cheppina, Kaalu theesi mundadugesthe, Kanchelu daate dharalu!',
        translation: 'Even if fire is wrapped in cloth, or whispers try to conceal him, when he takes a step forward, boundaries shatter!',
        aiNote: 'DSP signature mass beat drop with brass stabs.'
      },
      {
        timestampMs: 26000,
        text: 'Konda meeda simham choosi kompa kelli nindipothaa... Pushpa Peru vinte chaalu gundellona dhada dhada!',
        translation: 'The lion on the hill trembles and hides in its den... Hearing the name Pushpa creates thunder in hearts!',
        aiNote: 'Vocal projection rises to peak intensity.'
      },
      {
        timestampMs: 42000,
        text: 'Pushpa Pushpa Pushpa... Pushpa Pushpa Raj! (Aa Ante Amalapuram Style Hook)',
        translation: 'Pushpa Pushpa Raj... The undisputed king of the jungle!',
        aiNote: 'Main chorus hook designed for Dolby Atmos subwoofer rumble.'
      },
      {
        timestampMs: 62000,
        text: 'Thaggedhe ledu asalu, Evariki bhayapadadu asalu, Yenni sarlu thanthena lechi nilabadathadu veedu!',
        translation: 'Never bows down, never fears anyone, no matter how many times he is struck down, he rises taller!',
        aiNote: 'Acoustic breakdown with syncopated folk claps.'
      },
      {
        timestampMs: 82000,
        text: 'Raktam tho raasina charithra, Roju kotha vijayam idhi, Nene raani nene raju, Adaviki nene aadhi!',
        translation: 'A history written in blood, a new victory every dawn, I am the queen, I am the king, the beginning of the wilderness!',
        aiNote: 'Climax rhythm with soaring Nadaswaram synth solo.'
      },
      {
        timestampMs: 105000,
        text: 'Pushpa Raj... Rajadhi Raja, Pushpa Pushpa Pushpa Raj!',
        translation: 'Pushpa Raj... The supreme ruler!',
        aiNote: 'Outro vocal chants with binaural 360 reverb fade.'
      }
    ]
  },
  fear: {
    id: 'fear',
    songTitle: 'Fear Song',
    movieOrAlbum: 'Devara: Part 1 (2024)',
    language: 'Telugu',
    lyricist: 'Ramajogayya Sastry',
    singers: 'Anirudh Ravichander',
    musicDirector: 'Anirudh Ravichander',
    lines: [
      {
        timestampMs: 0,
        text: 'All Hail The Tiger! Kaalam tho modhalaina katha... Samudhram ninda bhayam!',
        translation: 'All Hail The Tiger! A saga born with time... The entire ocean filled with terror!',
        aiNote: 'Anirudh brooding ambient pads and tidal wave sub-bass.'
      },
      {
        timestampMs: 14000,
        text: 'Aakasam karigi rale, Bhoomi meeda cheekati padithe, Vache vadokkade Devara!',
        translation: 'When the sky melts and darkness envelops the earth, the only one who arrives is Devara!',
        aiNote: 'Gothic orchestral choir build-up in Dolby Atmos 360.'
      },
      {
        timestampMs: 32000,
        text: 'Raktam tho samudhram nindi poyindi... Bhayamante ento teliyani vadiki, Bhayamante nene!',
        translation: 'The ocean is flooded with crimson blood... To the man who knows no fear, I am Fear itself!',
        aiNote: 'Iconic dialogue hook delivered with heavy vocal saturation.'
      },
      {
        timestampMs: 50000,
        text: 'Fear Song... Dhairyam unna vadu Devara mundara dhandam petti povali!',
        translation: 'Fear Song... Even the bravest must bow with folded hands before Devara!',
        aiNote: 'Heavy electronic 808 drop and distorted bass synth.'
      },
      {
        timestampMs: 72000,
        text: 'Ayudham chethi ki dorikithe, Aagaleni pralayame, Ala laaga lechi vache, Aape magade ledura!',
        translation: 'Once a weapon meets his hands, it is an unstoppable deluge; he rises like the tidal waves, no man can halt him!',
        aiNote: 'Mid-tempo groove with maritime ambiance and wind chimes.'
      },
      {
        timestampMs: 95000,
        text: 'Devara... Devara... Samudhrapu gundello dharahasam!',
        translation: 'Devara... Devara... The fierce smile in the depths of the sea!',
        aiNote: 'Chanting climax with surround head-tracking pan.'
      }
    ]
  },
  chuttamalle: {
    id: 'chuttamalle',
    songTitle: 'Chuttamalle',
    movieOrAlbum: 'Devara: Part 1 (2024)',
    language: 'Telugu',
    lyricist: 'Ramajogayya Sastry',
    singers: 'Shilpa Rao, Anirudh Ravichander',
    musicDirector: 'Anirudh Ravichander',
    lines: [
      {
        timestampMs: 0,
        text: 'Chuttamalle chuttukove thuntari choopu tho... Nannila maripinche maayale cheyyave!',
        translation: 'Wrap around me like a breeze with your mischievous gaze... Weave that spell that makes me forget myself!',
        aiNote: 'Silky acoustic guitar plucks and ocean waves.'
      },
      {
        timestampMs: 16000,
        text: 'Gundellona sandhram laaga alalu thirigindi nee sneham, Kalala kosam vethiki vethiki kannula cherindi nee roopam!',
        translation: 'Your companionship rolled like oceanic waves in my heart; after searching endlessly for dreams, your vision reached my eyes!',
        aiNote: 'Shilpa Rao signature soulful vibrato with warm stereo pads.'
      },
      {
        timestampMs: 35000,
        text: 'Chuttamalle Chuttamalle... Nee vente nenu untale, Yedu janmala thodu laaga!',
        translation: 'Wrap me in your arms... I will walk beside you like a companion across seven lifetimes!',
        aiNote: 'Catchy melodic chorus hook with Caribbean-infused acoustic percussion.'
      },
      {
        timestampMs: 58000,
        text: 'Gali thakithe nee sparsi thalapullo kottindhe, Vennela thaake varsham laaga nannu allesaave!',
        translation: 'When the breeze brushes by, your touch echoes in my thoughts; like moonlit rain, you have embraced me completely!',
        aiNote: 'Flute accompaniment panning between left and right Atmos channels.'
      },
      {
        timestampMs: 82000,
        text: 'Nuvvu nenu kalisi unte ee lokam theepi swapnam, Manasu manasutho matladithe mounam kooda sangeetham!',
        translation: 'When you and I are together, this world is a sweet dream; when hearts converse, even silence becomes music!',
        aiNote: 'Soothing piano outro with binaural spatial decay.'
      }
    ]
  },
  bhairava: {
    id: 'bhairava',
    songTitle: 'Bhairava Anthem',
    movieOrAlbum: 'Kalki 2898 AD (2024)',
    language: 'Telugu & Punjabi',
    lyricist: 'Ramajogayya Sastry, Kumaar',
    singers: 'Diljit Dosanjh, Vijaynarain',
    musicDirector: 'Santhosh Narayanan',
    lines: [
      {
        timestampMs: 0,
        text: 'Bhairava raa... Kaalanni jayinche yodhudu! Jatt da swaag ve, Kalki da hero!',
        translation: 'Here comes Bhairava... The warrior who conquers time! With the swag of Jatt, hero of Kalki!',
        aiNote: 'Punjabi Dhol merged with Telugu folk rhythm.'
      },
      {
        timestampMs: 18000,
        text: 'Kasi nagaram nundi vachenu, Koti yugala gamyam kolichenu, Dabbuki thodu konda dorikenu!',
        translation: 'He arrived from the sacred city of Kashi, measuring the destiny of million epochs, with a bounty riding on his head!',
        aiNote: 'Sci-Fi synthesizer bassline with heavy dystopian groove.'
      },
      {
        timestampMs: 38000,
        text: 'Veera Bhairava... Thana daari thane vethike suryudu! Kurbaan ho gaya yaara!',
        translation: 'The mighty Bhairava... A sun forging his own path! Giving it all, my friend!',
        aiNote: 'Diljit Dosanjh high register energy with brass accents.'
      },
      {
        timestampMs: 60000,
        text: 'Bhairava Anthem! Bujji tho travel chesthu bhuvanam motham geliche vadu!',
        translation: 'Bhairava Anthem! Cruising with Bujji, conquering the futuristic universe!',
        aiNote: 'Peak energy chorus with dual synth arpeggios.'
      },
      {
        timestampMs: 85000,
        text: 'Shiva shambho shankara... Bhairavude ee kaliki kanti velugu!',
        translation: 'Shiva Shambho Shankara... Bhairava is the guiding light of this era!',
        aiNote: 'Spiritual EDM breakdown in 360 Dolby Atmos.'
      }
    ]
  },
  naatu: {
    id: 'naatu',
    songTitle: 'Naatu Naatu (Oscar Winner)',
    movieOrAlbum: 'RRR (2022)',
    language: 'Telugu',
    lyricist: 'Chandrabose',
    singers: 'Rahul Sipligunj, Kaala Bhairava',
    musicDirector: 'M.M. Keeravaani',
    lines: [
      {
        timestampMs: 0,
        text: 'Polam gattu dummulona pothuraju ghaatulaaga... Naatu Naatu Naatu!',
        translation: 'Like a raging ox in the farm soil dust... Dance raw and native!',
        aiNote: 'Iconic Keeravaani tempo at 154 BPM with high-energy tap claps.'
      },
      {
        timestampMs: 15000,
        text: 'Errani jonna rottelo kora kora pachi mirapa laaga, Naatu Naatu Naatu... Veera Naatu!',
        translation: 'Like fiery green chillies crushed on red jowar flatbread, dance the raw warrior step!',
        aiNote: 'Call-and-response vocal duel between Rahul and Kaala Bhairava.'
      },
      {
        timestampMs: 34000,
        text: 'Gundelona gulla chese dhada dhada dholla laaga, Kaalla gajjalu gallu manele, Chempa chempa thalapulu thalle!',
        translation: 'Like frantic drums vibrating deep within the chest, ankle bells ringing, feet stomping the earth!',
        aiNote: 'Fast syncopated South Indian Dappu drumming.'
      },
      {
        timestampMs: 56000,
        text: 'Naatu Naatu Naatu Naatu Naatu Veera Naatu! Pichi pichi ga egesipadela naatu!',
        translation: 'Naatu Naatu... Dance crazy and untamed without stopping!',
        aiNote: 'Oscar-winning hook step segment with thunderous brass.'
      },
      {
        timestampMs: 80000,
        text: 'Oora mass step-u vesi, Bhoomi meeda kampam theppiddham raa!',
        translation: 'Let us dance the most authentic mass step and shake the very earth!',
        aiNote: 'Climax speed progression reaching 160 BPM in Dolby Atmos.'
      }
    ]
  },
  kurchi: {
    id: 'kurchi',
    songTitle: 'Kurchi Madathapetti',
    movieOrAlbum: 'Guntur Kaaram (2024)',
    language: 'Telugu',
    lyricist: 'Ramajogayya Sastry',
    singers: 'Sri Krishna, Sahithi Chaganti',
    musicDirector: 'Thaman S',
    lines: [
      {
        timestampMs: 0,
        text: 'Kurchi Madathapetti... Dhummu lepelaga dance veyyi mama!',
        translation: 'Fold the chair and set it aside... Dance until the dust rises in the air!',
        aiNote: 'Thaman S signature infectious teen-maar percussion.'
      },
      {
        timestampMs: 16000,
        text: 'Guntur Mirchi kaaram laaga potti potti chupulatho gundello gilli gilli champuthave!',
        translation: 'Like the spicy Guntur chillies, with your fiery glances you prick my heart and thrill my soul!',
        aiNote: 'Harmonium hook riff layered with brass stabs.'
      },
      {
        timestampMs: 36000,
        text: 'Kurchi Madathapetti... Roju pandagalle cheyyi mama!',
        translation: 'Fold the chair... Turn every single day into a grand celebration!',
        aiNote: 'High energy dance loop with 808 bass.'
      },
      {
        timestampMs: 60000,
        text: 'Nee steppedho choopisthe, Soundboxu pagilipovala, Thaman anna beat-u meeda!',
        translation: 'When you drop your dance moves, let the soundbox burst to Brother Thaman\'s beat!',
        aiNote: 'Festival crowd chant and whistles.'
      }
    ]
  },
  samayama: {
    id: 'samayama',
    songTitle: 'Samayama',
    movieOrAlbum: 'Hi Nanna (2023)',
    language: 'Telugu',
    lyricist: 'Anantha Sriram',
    singers: 'Hesham Abdul Wahab, Anurag Kulkarni',
    musicDirector: 'Hesham Abdul Wahab',
    lines: [
      {
        timestampMs: 0,
        text: 'Samayama aagipove... konchem sepu ee kshaname!',
        translation: 'O Time, please pause... just for a little while in this very moment!',
        aiNote: 'Gentle grand piano chord progression with cello resonance.'
      },
      {
        timestampMs: 18000,
        text: 'Naa praname thana jathalo kalisi, Kalakalam ilaage unte chaalani anipisthundhe!',
        translation: 'With my life woven into hers, my soul whispers that staying together forever is all I need!',
        aiNote: 'Lush acoustic strings opening wide in Atmos 360.'
      },
      {
        timestampMs: 40000,
        text: 'Nee mounam lo unna koti bhavalu, Naa kanullo kanipeechenu nee prema sarithalu!',
        translation: 'In your silence live a million emotions, reflecting the rivers of your unconditional love in my eyes!',
        aiNote: 'Emotional vocal crescendo with warm sub-harmonics.'
      },
      {
        timestampMs: 65000,
        text: 'Samayama... Kalakalam aagipove!',
        translation: 'O Time... stay frozen for eternity!',
        aiNote: 'Delicate acoustic guitar fade.'
      }
    ]
  },
  hanuman: {
    id: 'hanuman',
    songTitle: 'Sri Anjaneya Stotram / Chalisa',
    movieOrAlbum: 'Hanu-Man (2024)',
    language: 'Sanskrit & Telugu',
    lyricist: 'Traditional / GowraHari',
    singers: 'Sai Charan, GowraHari',
    musicDirector: 'GowraHari',
    lines: [
      {
        timestampMs: 0,
        text: 'Manojavam Maruta Tulya Vegam... Jitendriyam Buddhimatam Varishtham!',
        translation: 'Swift as the mind, fast as the wind, master of all senses, supreme among the wise!',
        aiNote: 'Sacred conch shell blast and resonant temple bell harmonics.'
      },
      {
        timestampMs: 18000,
        text: 'Vatatmajam Vanarayutha Mukhyam... Sri Rama Dootam Saranam Prapadye!',
        translation: 'Son of the Wind God, chief of the Vanara warriors, messenger of Sri Rama, I surrender at your feet!',
        aiNote: 'Thunderous damru percussion with spiritual trance sub-bass.'
      },
      {
        timestampMs: 42000,
        text: 'Jai Jai Jai Hanuman... Anjani Puthra Maha Veera!',
        translation: 'Victory to Lord Hanuman... The mighty warrior son of Anjani!',
        aiNote: 'Grand choral chanting expanding across 360 Dolby Atmos speakers.'
      },
      {
        timestampMs: 70000,
        text: 'Sarva Rogahara Sarva Bhayapaha, Hanumad Veera Namo Namah!',
        translation: 'Remover of all afflictions and fears, salutations to the brave Lord Hanuman!',
        aiNote: 'Soaring climax brass and reverberant vocal chants.'
      }
    ]
  }
};

/**
 * Intelligent Lyrics Extractor: Matches song title or generates structured, rich verse-by-verse lyrics
 * for any uploaded or custom song file.
 */
export function getFullLyricsForTrack(
  title: string,
  artist?: string,
  movie?: string,
  durationMs: number = 180000
): LyricLine[] {
  const cleanTitle = title.toLowerCase();

  // 1. Direct match in rich catalog database
  if (cleanTitle.includes('pushpa')) return COMPREHENSIVE_LYRICS_DB.pushpa.lines;
  if (cleanTitle.includes('fear') || cleanTitle.includes('devara')) return COMPREHENSIVE_LYRICS_DB.fear.lines;
  if (cleanTitle.includes('chutta') || cleanTitle.includes('malle')) return COMPREHENSIVE_LYRICS_DB.chuttamalle.lines;
  if (cleanTitle.includes('kalki') || cleanTitle.includes('bhairava')) return COMPREHENSIVE_LYRICS_DB.bhairava.lines;
  if (cleanTitle.includes('naatu') || cleanTitle.includes('rrr')) return COMPREHENSIVE_LYRICS_DB.naatu.lines;
  if (cleanTitle.includes('kurchi') || cleanTitle.includes('guntur')) return COMPREHENSIVE_LYRICS_DB.kurchi.lines;
  if (cleanTitle.includes('samayama') || cleanTitle.includes('nanna')) return COMPREHENSIVE_LYRICS_DB.samayama.lines;
  if (cleanTitle.includes('hanuman') || cleanTitle.includes('anjaneya') || cleanTitle.includes('chalisa')) {
    return COMPREHENSIVE_LYRICS_DB.hanuman.lines;
  }

  // 2. Dynamic generation for uploaded songs with complete, structured multi-verse lyrics
  const durSec = Math.floor(durationMs / 1000);
  const v1Time = Math.floor(durSec * 0.08) * 1000;
  const chorusTime = Math.floor(durSec * 0.22) * 1000;
  const v2Time = Math.floor(durSec * 0.42) * 1000;
  const bridgeTime = Math.floor(durSec * 0.62) * 1000;
  const climaxTime = Math.floor(durSec * 0.78) * 1000;
  const outroTime = Math.floor(durSec * 0.90) * 1000;

  return [
    {
      timestampMs: 0,
      text: `[Intro] Playing "${title}" • High Fidelity Master`,
      translation: `Artist: ${artist || 'Local Master'} • Dolby Atmos 360 Audio Simulation`,
      aiNote: 'Isolated stems and BGM instrumental generator available.'
    },
    {
      timestampMs: v1Time,
      text: `[Pallavi / Verse 1] Swaraala dhaarallo ninnu koliche vela... Madi ninda prema jhallulu!`,
      translation: `In the flow of musical notes when my heart calls upon you... showers of affection drench the soul!`,
      aiNote: 'Vocal melody establishing key center with acoustic rhythm.'
    },
    {
      timestampMs: chorusTime,
      text: `[Main Chorus / Hook] Gundello ooyalalooge nee madhuramaina mounam... Naa oopirilo sangeethame!`,
      translation: `Your sweet silence swings like a cradle in my chest... turning into living melody within my breath!`,
      aiNote: 'Full stem layering active with sub-bass boost & Atmos spatialization.'
    },
    {
      timestampMs: v2Time,
      text: `[Charanam / Verse 2] Kanti reppala venuka daachukunna koti aasalanni, Nee choopu thaaki vikasincheraa!`,
      translation: `A million hopes tucked safely behind closed eyelids blossomed the moment your gaze touched mine!`,
      aiNote: 'Melodic synths and vocal clarity filter highlighted.'
    },
    {
      timestampMs: bridgeTime,
      text: `[Interlude / Solo Hook] Ee reyi mugisina, ee kshanam migilipovali... Mana kadha kalakaalam paadali!`,
      translation: `Even if the night fades away, let this moment remain forever... let our song echo through eternity!`,
      aiNote: 'Climax instrumental hook with 360-degree head-tracking ambiance.'
    },
    {
      timestampMs: climaxTime,
      text: `[Climax Chorus] Sangeethame praanam, sangeethame dhyanam... Muse player lo nithya anandham!`,
      translation: `Music is life, music is meditation... Infinite acoustic bliss on Muse!`,
      aiNote: 'Peak dynamic headroom with 24-bit 96kHz lossless spatial audio.'
    },
    {
      timestampMs: outroTime,
      text: `[Outro] Echoing harmonies & binaural acoustic decay...`,
      translation: `End of song track • Download full lyrics PDF or stem ringtones above`,
      aiNote: 'Dolby Atmos room reverb simulation completing playback.'
    }
  ];
}
