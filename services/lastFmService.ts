
import { LastFmTrackInfo, LastFmSimilarArtists } from '../types';

const API_KEY = '147deb8099d7c55a5a785ac609b15d4c';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

/**
 * Fetches track information including user tags and playcounts.
 */
export const getLastFmTrackInfo = async (artist: string, title: string): Promise<LastFmTrackInfo | null> => {
    if (!artist || !title) return null;

    try {
        const params = new URLSearchParams({
            method: 'track.getInfo',
            api_key: API_KEY,
            artist: artist,
            track: title,
            format: 'json',
            autocorrect: '1'
        });

        const response = await fetch(`${BASE_URL}?${params.toString()}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        if (data.error) return null;
        
        return data;
    } catch (error) {
        console.error("Last.fm Track Info Error:", error);
        return null;
    }
};

/**
 * Fetches similar artists based on the artist name.
 */
export const getLastFmSimilarArtists = async (artist: string): Promise<LastFmSimilarArtists | null> => {
    if (!artist) return null;

    try {
        const params = new URLSearchParams({
            method: 'artist.getSimilar',
            api_key: API_KEY,
            artist: artist,
            format: 'json',
            limit: '5',
            autocorrect: '1'
        });

        const response = await fetch(`${BASE_URL}?${params.toString()}`);
        if (!response.ok) return null;

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Last.fm Similar Artists Error:", error);
        return null;
    }
};
