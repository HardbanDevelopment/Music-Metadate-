
import { DiscogsSearchResponse, DiscogsResult } from '../types';

const CONSUMER_KEY = 'CbjZUVvyutIAkOHASArX';
const CONSUMER_SECRET = 'UhyPQRDLvMYnKGoilBLIEwCsmJoXVePD';
const BASE_URL = 'https://api.discogs.com';

/**
 * Searches Discogs database for release information to find labels and catalog numbers.
 */
export const searchDiscogs = async (artist: string, title: string): Promise<DiscogsResult | null> => {
    if (!artist || !title) return null;

    try {
        // Construct query: Artist - Title
        const query = `${artist} - ${title}`;
        
        // Discogs Auth Header format
        const authHeader = `Discogs key=${CONSUMER_KEY}, secret=${CONSUMER_SECRET}`;

        const params = new URLSearchParams({
            q: query,
            type: 'release', // Focus on releases to get label/catno
            per_page: '1'
        });

        const response = await fetch(`${BASE_URL}/database/search?${params.toString()}`, {
            headers: {
                'Authorization': authHeader,
                'User-Agent': 'MusicMetadataEngine/1.3'
            }
        });

        if (!response.ok) return null;

        const data: DiscogsSearchResponse = await response.json();
        
        if (data.results && data.results.length > 0) {
            return data.results[0];
        }
        return null;

    } catch (error) {
        console.error("Discogs Search Error:", error);
        return null;
    }
};
