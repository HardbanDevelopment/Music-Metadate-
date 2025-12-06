import { SpotifyAudioFeatures, SpotifyTrack } from '../types';

/**
 * Searches for a track on Spotify by proxying the request through the backend.
 */
export const searchSpotifyTrack = async (query: string): Promise<SpotifyTrack | null> => {
    try {
        const response = await fetch(`/spotify/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            console.error("Backend proxy error for Spotify search:", response.statusText);
            return null;
        }

        const data = await response.json();
        // The backend now returns the full search result, we need to get the track item
        return data.tracks?.items?.[0] || null;
    } catch (error) {
        console.error("Spotify Search Error via proxy", error);
        return null;
    }
};

/**
 * Fetches Audio Features for a specific track ID by proxying the request through the backend.
 */
export const getSpotifyAudioFeatures = async (trackId: string): Promise<SpotifyAudioFeatures | null> => {
    try {
        const response = await fetch(`/spotify/audio-features/${trackId}`);

        if (!response.ok) {
            console.error("Backend proxy error for Spotify audio features:", response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Spotify Audio Features Error via proxy", error);
        return null;
    }
};

/**
 * Helper to map Spotify Key integer to Pitch Class notation
 */
export const mapSpotifyKey = (key: number, mode: number): string => {
    const pitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    if (key < 0 || key > 11) return 'Unknown';
    const pitch = pitches[key];
    const scale = mode === 1 ? 'Major' : 'Minor';
    return `${pitch} ${scale}`;
};
