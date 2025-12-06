
export interface LyricsResult {
    lyrics: string;
    source: string;
    error?: string;
}

const BASE_URL = 'https://api.lyrics.ovh/v1';

/**
 * Pobiera tekst utworu z darmowego API Lyrics.ovh
 */
export const fetchLyrics = async (artist: string, title: string): Promise<LyricsResult> => {
    if (!artist || !title) {
        throw new Error("Wymagany artysta i tytuł do wyszukania tekstu.");
    }

    try {
        // Clean up input slightly to improve match rate
        const cleanArtist = artist.split(',')[0].trim(); // Take first artist if multiple
        const cleanTitle = title.replace(/\(.*\)/g, '').trim(); // Remove brackets info like (feat. X)

        const url = `${BASE_URL}/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`;
        
        const response = await fetch(url);
        
        if (response.status === 404) {
            throw new Error("Nie znaleziono tekstu dla tego utworu.");
        }
        
        if (!response.ok) {
            throw new Error(`Błąd API Lyrics.ovh: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.lyrics) {
            return {
                lyrics: data.lyrics,
                source: 'Lyrics.ovh'
            };
        } else {
            throw new Error("API zwróciło pusty tekst.");
        }

    } catch (error) {
        console.error("Lyrics fetch error:", error);
        return {
            lyrics: '',
            source: 'Error',
            error: error instanceof Error ? error.message : "Nieznany błąd pobierania tekstu."
        };
    }
};
