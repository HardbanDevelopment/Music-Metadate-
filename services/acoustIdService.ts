
import { initEssentia, decodeAudio } from './audioAnalysisService';
import { AcoustIDResponse, Metadata } from '../types';

const ACOUSTID_CLIENT_ID_KEY = 'acoustid_client_id';
// Provided by user
const DEFAULT_CLIENT_ID = '3jYmFI4MnN';

export const getSavedAcoustIdClientId = (): string => {
    return localStorage.getItem(ACOUSTID_CLIENT_ID_KEY) || DEFAULT_CLIENT_ID;
};

export const saveAcoustIdClientId = (clientId: string) => {
    localStorage.setItem(ACOUSTID_CLIENT_ID_KEY, clientId);
};

/**
 * Calculates Chromaprint fingerprint using Essentia.js
 * Note: AcoustID requires audio resampled to 11025Hz
 */
export const calculateFingerprint = async (file: File): Promise<{ fingerprint: string; duration: number }> => {
    // 1. Decode original audio
    const originalBuffer = await decodeAudio(file);
    
    // 2. Resample to 11025 Hz (Required by AcoustID)
    // We use OfflineAudioContext for resampling
    const targetSampleRate = 11025;
    const offlineCtx = new OfflineAudioContext(1, originalBuffer.duration * targetSampleRate, targetSampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = originalBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);
    
    const resampledBuffer = await offlineCtx.startRendering();
    const duration = Math.floor(originalBuffer.duration);

    // 3. Use Essentia to generate fingerprint
    const essentia = await initEssentia();
    if (!essentia) throw new Error("Essentia library failed to load for fingerprinting.");

    const channelData = resampledBuffer.getChannelData(0);
    const audioVector = essentia.arrayToVector(channelData);
    
    // @ts-ignore
    const chromaprinter = essentia.Chromaprinter({ sampleRate: targetSampleRate });
    const fingerprintResult = chromaprinter(audioVector);

    return {
        fingerprint: fingerprintResult.fingerprint,
        duration
    };
};

/**
 * Lookups the fingerprint in AcoustID database
 */
export const lookupAcoustId = async (fingerprint: string, duration: number, clientId: string): Promise<AcoustIDResponse> => {
    // Use passed clientId or fallback to default
    const keyToUse = clientId || DEFAULT_CLIENT_ID;
    
    if (!keyToUse) throw new Error("AcoustID Client ID is required.");

    const params = new URLSearchParams({
        client: keyToUse,
        meta: 'recordings+releases+compress', // Requesting recordings and releases data
        duration: duration.toString(),
        fingerprint: fingerprint
    });

    const response = await fetch(`https://api.acoustid.org/v2/lookup?${params.toString()}`);
    
    if (!response.ok) {
        throw new Error(`AcoustID API Error: ${response.statusText}`);
    }

    return await response.json();
};

/**
 * Maps AcoustID result to application Metadata format
 */
export const mapAcoustIdToMetadata = (response: AcoustIDResponse): Partial<Metadata> | null => {
    if (response.status !== 'ok' || !response.results || response.results.length === 0) return null;

    // Get the best result (highest score)
    const bestResult = response.results.sort((a, b) => b.score - a.score)[0];
    
    if (!bestResult.recordings || bestResult.recordings.length === 0) return null;

    const recording = bestResult.recordings[0];
    const release = recording.releases?.[0];

    return {
        title: recording.title,
        artist: recording.artists?.map(a => a.name).join(', '),
        album: release?.title,
        year: release?.date ? release.date.substring(0, 4) : undefined,
        // AcoustID links to MusicBrainz, but doesn't provide label/publisher in basic lookup
        // This is usually enough to start a MusicBrainz specific search if needed
    };
};
