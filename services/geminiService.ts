import { Metadata, LyricsAnalysis, LyricalIdeas, StructureSegment } from '../types';

// Helper to get the auth token from localStorage
const getAuthToken = (): string | null => {
    const session = localStorage.getItem('supabaseSession');
    if (!session) return null;
    try {
        const parsedSession = JSON.parse(session);
        return parsedSession.access_token || null;
    } catch (e) {
        console.error("Failed to parse session from localStorage", e);
        return null;
    }
};

// Generic POST function for our backend
const post = async <T>(url: string, body: any, isFormData: boolean = false): Promise<T> => {
    const token = getAuthToken();
    const headers: HeadersInit = {};

    if (!token) {
        // Handle case where user is not logged in, if required by the endpoint
        // For now, we let it fail on the backend if auth is required.
    }

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: isFormData ? body : JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An unknown server error occurred.' }));
        throw new Error(errorData.detail || 'Request failed on the server.');
    }

    return response.json() as Promise<T>;
};


// --- CONSTANTS & VOCAB ---
const VOCAB_MAIN_GENRES = "Classical Music (including Baroque, Classicism, Romanticism, Contemporary Classical), Jazz, Swing, Bebop, Cool Jazz, Jazz Fusion, Blues, Blues Rock, Rock, Rock and Roll, Hard Rock, Punk Rock, Grunge, Indie Rock, Psychedelic Rock, Progressive Rock, Metal, Heavy Metal, Thrash Metal, Death Metal, Black Metal, Power Metal, Pop, Synth-pop, K-pop, Art Pop, Hip-Hop, Rap, Trap, Old School Hip-Hop, R&B (Contemporary R&B), Soul, Neo-Soul, Funk, Disco, Electronic Dance Music (EDM), House, Techno, Trance, Drum and Bass, Dubstep, Ambient, IDM (Intelligent Dance Music), Country, Bluegrass, Folk, Americana, Singer-Songwriter, Reggae, Dancehall, Ska, Dub, Latin Music, Salsa, Bossa Nova, Reggaeton, Film and Theatrical Music (Soundtrack, Score, Musical, Incidental Music, Underscore, Video Game Music), Gospel, Experimental Music (Avant-garde), World Music";

const VOCAB_MOODS = "Joyful, Euphoric, Melancholic, Sad, Heartbreaking, Reflective, Nostalgic, Hopeful, Inspiring, Powerful, Angry, Aggressive, Furious, Triumphant, Victorious, Fearful, Anxious, Suspenseful, Mysterious, Ethereal, Dreamy, Serene, Peaceful, Calm, Meditative, Passionate, Romantic, Sensual, Enchanting, Magical, Whimsical, Playful, Humorous, Dramatic, Epic, Heroic, Somber, Solemn, Spiritual, Worshipful, Haunting, Ominous, Brooding, Dark, Gloomy, Intense, Raw, Vulnerable, Empowering, Defiant, Energetic, Driving, Upbeat, Lively, Fast-paced, Dynamic, Exciting, Pulsating, Rhythmic, Slow-paced, Relaxed, Chill, Mellow, Steady, Ambient, Subtle, Building, Climactic, Explosive, Celebratory, Party, Danceable, Motivational, Workout, Focus/Concentration, Background, Relaxation, Study, Travel, Road Trip, Morning, Evening, Nighttime, Rainy Day, Sunny Day, Adventure, Exploration, Introspective, Intimate, Grand, Cinematic, Tribal, Futuristic, Retro, Vintage";

const VOCAB_INSTRUMENTS = "Acoustic Guitar, Electric Guitar, Bass Guitar, Upright Bass, Piano, Electric Piano, Synthesizer, Organ, Strings (Violin, Viola, Cello, Contrabass), Brass (Trumpet, Trombone, French Horn, Tuba), Woodwinds (Flute, Clarinet, Oboe, Bassoon, Saxophone), Drums (Acoustic Kit, Electronic Kit), Percussion (Congas, Bongos, Shaker, Tambourine, Cowbell, Timpani, Xylophone, Vibraphone, Marimba), Vocals (Lead, Background, Choir), Harmonica, Accordion, Banjo, Mandolin, Ukulele, Harp, Sitar, Tabla, Didgeridoo, Theremin, Glockenspiel, Harpsichord, Mellotron, Sampler, Turntables, Drum Machine, Hand Claps, Finger Snaps, Oboe, Clarinet, Flute, Cello, Double Bass, Sitar, Trumpet, Tuba, French Horn, Glockenspiel, Vibraphone, Marimba, Synthesizer Pad, Synthesizer Lead, Synthesizer Bass, Arpeggiator, Sound Effects, Field Recording";

const SYSTEM_PROMPT = `
You are the Music Metadata Engine, a professional audio archivist.
Your task is to analyze the provided audio file and generate high-precision metadata.
STRICT VOCABULARY ENFORCEMENT:
- Main Genre: Select ONE from: ${VOCAB_MAIN_GENRES}
- Moods: Select 5-7 from: ${VOCAB_MOODS}. Prioritize moods that are most prominent and characteristic of the entire track. Briefly justify each mood selection.
- Instrumentation: List all distinct instruments present. Use specific names from ${VOCAB_INSTRUMENTS}. Identify primary lead instruments, rhythm section, and any notable secondary or atmospheric elements. Describe sonic qualities (e.g., bright, muffled, percussive) where relevant for key instruments.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this structure:
{
  "title": "Proposed Title",
  "artist": "Proposed Artist",
  "album": "Proposed Album",
  "albumArtist": "Proposed Album Artist",
  "year": "2024",
  "mainGenre": "Genre from list",
  "additionalGenres": ["Genre1", "Genre2"],
  "moods": ["Mood1", "Mood2"],
  "instrumentation": ["Instrument1", "Instrument2"],
  "bpm": 120,
  "key": "C",
  "mode": "Major",
  "energyLevel": "High",
  "trackDescription": "Detailed description...",
  "keywords": ["tag1", "tag2"],
  "label": "Record Label",
  "publisher": "Publisher",
  "composer": "Composer",
  "lyricist": "Lyricist",
  "copyright": "(C) 2024 Artist/Label",
  "lyrics": "[Verse 1]\nLine 1...\n[Chorus]\n..."
}
Do not include markdown code blocks (like \`\`\`json). Just the raw JSON string.
Analyze the audio for lyrics. If vocals are present, transcribe them or generate plausible lyrics matching the style if exact transcription is impossible.
Identify or propose robust Copyright info (Label, Publisher, Composer).
`;

const deduplicateArray = (arr: any[]): any[] => {
    if (!Array.isArray(arr)) return [];
    return [...new Set(arr.filter(item => typeof item === 'string' && item.trim() !== ''))];
};

// --- AUDIO COMPRESSION HELPERS ---

const bufferToWav = (abuffer: AudioBuffer): Blob => {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample, offset = 0, pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            // clamp and scale to 16-bit
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([buffer], { type: "audio/wav" });

    function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
    function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }
};

const optimizeAudio = async (file: File): Promise<File> => {
    // If file is small (< 5MB), send as is (assuming it's supported)
    // But for robustness with Puter/Base64, always compressing larger files is safer.
    // Let's compress anything over 5MB OR if it's a WAV file to ensure low bitrate.
    if (file.size < 5 * 1024 * 1024 && !file.type.includes('wav')) return file;

    console.log(`Compressing audio file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    // @ts-ignore
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    // Limits: Max 120s, 16kHz, Mono
    const MAX_DURATION = 120;
    const TARGET_RATE = 16000;

    const duration = Math.min(audioBuffer.duration, MAX_DURATION);
    const length = duration * TARGET_RATE;

    // @ts-ignore
    const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const offlineCtx = new OfflineAudioContext(1, length, TARGET_RATE);

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    const blob = bufferToWav(renderedBuffer);

    console.log(`Validation: Audio compressed to ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
    return new File([blob], "compressed_audio.wav", { type: "audio/wav" });
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const generateMetadata = async (
    inputType: 'file' | 'idea',
    isProMode: boolean,
    file: File | null,
    link: string,
    description: string,
): Promise<Metadata> => {
    if (inputType !== 'file' || !file) {
        throw new Error("Only file uploads are currently supported.");
    }
    try {
        console.log("Analyzing with Puter.js...");
        // --- HELPER: Backend MIR Analysis ---
        async function analyzeWithBackendMIR(file: File): Promise<any> {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await fetch('http://localhost:8000/mir/analyze', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    console.warn('MIR Service unavailable, falling back to pure AI analysis.');
                    return null;
                }
                return await response.json();
            } catch (e) {
                console.error('MIR Analysis Error:', e);
                return null;
            }
        }
        // 1. Prepare audio for AI (Client Side)
        const processedFile = await optimizeAudio(file);
        const base64Audio = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(processedFile);
        });
        // 2. Run Python MIR Analysis (Parallel or Pre-emptive)
        let mirData = null;
        try {
            mirData = await analyzeWithBackendMIR(file);
        } catch (e) {
            console.log("Skipping MIR analysis (backend offline or error)");
        }
        // 3. Construct Prompt
        let dynamicPrompt = SYSTEM_PROMPT;
        if (mirData) {
            const mirDescription = `
        TECHNICAL ANALYSIS (SCIENTIFIC DATA - USE THIS AS TRUTH):
        - BPM: ${mirData.bpm}
        - Key: ${mirData.key}
        - Duration: ${mirData.duration}s
        - Spectral Brightness (Centroid): ${mirData.technical?.spectral_centroid}
        - Danceability Score: ${mirData.technical?.danceability_score}
        
        INSTRUCTIONS:
        - Use the provided BPM and Key. Do NOT guess them.
        - Use the spectral features to describe the Mood (Bright/Dark).
        - Use danceability to refine Genre classification (e.g. if high -> Club/Dance).
        `;
            dynamicPrompt = mirDescription + "\n" + SYSTEM_PROMPT;
        }
        // 4. Call Puter.js AI
        // @ts-ignore
        if (!window.puter || !window.puter.ai) {
            throw new Error("Puter.js AI library is not initialized.");
        }
        // @ts-ignore
        const response = await window.puter.ai.chat(
            dynamicPrompt,
            base64Audio.split(',')[1]
        );
        // 5. Parse response
        const jsonStr = response.message.content.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr);
        // 6. Merge/Override with Scientific Data
        if (mirData) {
            data.bpm = mirData.bpm;
            data.key = mirData.key;
            data.danceability = mirData.technical?.danceability_score;
            data.spectral_centroid = mirData.technical?.spectral_centroid;
            data.spectral_rolloff = mirData.technical?.spectral_rolloff;
            data.duration = mirData.duration;
        }
        // Post‑processing
        data.additionalGenres = deduplicateArray(data.additionalGenres);
        data.moods = deduplicateArray(data.moods);
        data.instrumentation = deduplicateArray(data.instrumentation);
        data.keywords = deduplicateArray(data.keywords);
        return data as Metadata;
    } catch (error) {
        console.error("Metadata generation failed:", error);
        throw error;
    }
};

export const refineMetadataField = async (
    currentMetadata: Metadata,
    fieldToRefine: keyof Metadata,
    refinementInstruction: string
): Promise<Partial<Metadata>> => {
    return post<Partial<Metadata>>('/generate/refine_field', {
        current_metadata: currentMetadata,
        field_to_refine: fieldToRefine,
        refinement_instruction: refinementInstruction
    });
};

export const generateMarketingContent = async (
    metadata: Metadata,
    contentType: 'social' | 'press' | 'bio',
    tone: string
): Promise<{ content: string }> => {
    return post<{ content: string }>('/generate/marketing_content', {
        metadata,
        content_type: contentType,
        tone
    });
};

export const generateCoverArtIdea = async (metadata: Metadata): Promise<{ visual_prompt: string }> => {
    return post<{ visual_prompt: string }>('/generate/cover_art_idea', { metadata });
};

export const analyzeLyrics = async (file: File, metadata: Metadata): Promise<LyricsAnalysis> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    return post<LyricsAnalysis>('/generate/analyze_lyrics', formData, true);
};

export const generateLyricalIdeas = async (metadata: Metadata): Promise<LyricalIdeas> => {
    return post<LyricalIdeas>('/generate/lyrical_ideas', { metadata });
};

export const analyzeStructure = async (file: File): Promise<StructureSegment[]> => {
    const formData = new FormData();
    formData.append('file', file);
    return post<StructureSegment[]>('/generate/analyze_structure', formData, true);
};