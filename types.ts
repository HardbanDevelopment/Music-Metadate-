

export interface VocalStyle {
    gender: string; // e.g., Male, Female, Androgynous, None
    timbre: string; // e.g., Breathy, Raspy, Clear, Warm
    delivery: string; // e.g., Melismatic, Staccato, Rhythmic, Spoken Word
    emotionalTone: string; // e.g., Melancholic, Joyful, Aggressive, Yearning
}

export interface Metadata {
    // Identity
    title?: string;
    artist?: string;
    album?: string;
    albumArtist?: string;
    year?: string;

    // Sonic & Technical
    mainInstrument: string;
    key: string;
    mode: string;
    bpm: number;
    duration: number;
    tempoCharacter: string;
    mainGenre: string;
    additionalGenres: string[];
    trackDescription: string; // Maps to COMMENT
    keywords: string[];
    energyLevel: string;

    // New Expanded Fields (DSP & Sync)
    language?: string; // e.g., English, Instrumental, Spanish
    explicitContent?: 'Explicit' | 'Clean' | 'Not Applicable';
    musicalEra?: string; // e.g., 80s Retro, Modern, 90s Golden Age
    productionQuality?: string; // e.g., Lo-Fi, Studio Polished, Live Recording, Demo
    dynamics?: string; // e.g., High Dynamic Range, Heavily Compressed, Building
    targetAudience?: string; // e.g., Gen Z, Audiophiles, Workout enthusiasts

    // Credits & Legal
    copyright?: string;
    publisher?: string;
    label?: string;
    composer?: string;
    lyricist?: string;
    lyrics?: string;
    catalogNumber?: string;
    isrc?: string;

    // Pro fields
    moods?: string[]; // Maps to Style/Mood
    instrumentation?: string[];
    vocalStyle?: VocalStyle;
    useCases?: string[];
    structure?: string;
}

export interface AnalysisRecord {
    id: string;
    metadata: Metadata;
    inputType: 'file' | 'idea';
    input: {
        fileName?: string;
        link?: string;
        description?: string;
    }
}

export interface BatchItem {
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'completed' | 'error';
    metadata?: Metadata;
    error?: string;
}

// MusicBrainz Types
export interface MBRecording {
    id: string;
    score: number;
    title: string;
    length: number;
    'artist-credit': Array<{
        name: string;
        artist: { id: string; name: string };
    }>;
    releases?: Array<{
        id: string;
        title: string;
        date?: string;
        country?: string;
        'label-info'?: Array<{
            label: { name: string };
            'catalog-number'?: string;
        }>;
    }>;
    isrcs?: Array<{ id: string }>;
}

export interface MBSearchResult {
    created: string;
    count: number;
    offset: number;
    recordings: MBRecording[];
}

// Hugging Face Types
export interface HFClassificationResult {
    label: string;
    score: number;
}

// ACRCloud Types
export interface ACRCloudConfig {
    host: string;
    accessKey: string;
    accessSecret: string;
}

export interface ACRMusicItem {
    title: string;
    artists?: Array<{ name: string }>;
    album?: { name: string };
    date?: string; // YYYY-MM-DD
    label?: string;
    external_ids?: {
        isrc?: string;
        upc?: string;
    };
    genres?: Array<{ name: string }>;
    score: number; // Confidence
    play_offset_ms: number;
}

export interface ACRResponse {
    status: {
        msg: string;
        code: number;
        version: string;
    };
    metadata?: {
        music?: ACRMusicItem[];
    };
}

// AcoustID Types
export interface AcoustIDArtist {
    name: string;
}

export interface AcoustIDRelease {
    title: string;
    country: string;
    date: string;
    id: string;
}

export interface AcoustIDRecording {
    id: string;
    title: string;
    artists?: AcoustIDArtist[];
    releases?: AcoustIDRelease[];
}

export interface AcoustIDResult {
    score: number;
    id: string;
    recordings?: AcoustIDRecording[];
}

export interface AcoustIDResponse {
    status: string;
    results: AcoustIDResult[];
}

// Spotify Types
export interface SpotifyAudioFeatures {
    danceability: number;
    energy: number;
    key: number;
    loudness: number;
    mode: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    tempo: number;
    id: string;
    duration_ms: number;
    time_signature: number;
}

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    external_urls: { spotify: string };
    album: {
        name: string;
        images: Array<{ url: string }>;
    };
}

// Market Pulse Types
export interface GroundingSource {
    web: {
        uri: string;
        title: string;
    }
}

export interface TrackSuggestion {
    artist: string;
    title: string;
    reason: string;
}

export interface ArtistSuggestion {
    name: string;
    reason: string;
    image_url?: string;
}

export interface PlaylistSuggestion {
    name: string;
    platform: string;
    reason: string;
}

export interface MarketPulseData {
    tracks: TrackSuggestion[];
    artists: ArtistSuggestion[];
    playlists: PlaylistSuggestion[];
}

// Lyrical & Structure Types
export interface LyricsAnalysis {
    lyrics?: string;
    theme: string;
    label?: string;
    // Advanced MIR Fields
    danceability?: number;
    spectral_centroid?: number;
    spectral_rolloff?: number;
    duration?: number;
    mood: string;
    summary: string;
}

export interface LyricalIdeas {
    verse: string;
    chorus: string;
    explanation: string;
}

export interface StructureSegment {
    section: string;
    startTime: string;
    endTime: string;
    description: string;
}

// AudD Types
export interface AudDResponse {
    status: string;
    result: {
        artist: string;
        title: string;
        album: string;
        release_date: string;
        label: string;
        timecode: string;
        song_link: string;
        spotify?: {
            picture: string;
        };
        apple_music?: {
            url: string;
        };
    } | null;
    error?: {
        error_code: number;
        error_message: string;
    };
}

// Last.fm Types
export interface LastFmTag {
    name: string;
    url: string;
}

export interface LastFmArtist {
    name: string;
    url: string;
    listeners?: string;
}

export interface LastFmTrackInfo {
    track?: {
        name: string;
        artist: { name: string };
        toptags: { tag: LastFmTag[] };
        listeners: string;
        playcount: string;
    }
}

export interface LastFmSimilarArtists {
    similarartists?: {
        artist: LastFmArtist[];
    }
}

// Discogs Types
export interface DiscogsResult {
    id: number;
    title: string;
    year?: string;
    label?: string[];
    catno?: string;
    genre?: string[];
    style?: string[];
    thumb?: string;
}

export interface DiscogsSearchResponse {
    results: DiscogsResult[];
}

// Supabase Auth Types
export interface SupabaseUser {
    id: string;
    email?: string;
    user_metadata: { [key: string]: any };
}

export interface SupabaseSession {
    access_token: string;
    token_type: string;
    user: SupabaseUser;
}
