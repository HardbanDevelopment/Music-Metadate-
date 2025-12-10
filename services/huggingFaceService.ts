
import { GoogleGenAI, Type } from "@google/genai";
import { HFClassificationResult } from '../types';
import { VOCAB_MAIN_GENRES, VOCAB_SUB_GENRES, VOCAB_MOODS, VOCAB_INSTRUMENTS } from './geminiService';

// We use Gemini instead of HF.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper: File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string, mimeType: string } }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({
                inlineData: {
                    data: base64String,
                    mimeType: file.type
                }
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Helper: Deduplicate results based on label text (case-insensitive)
const deduplicateResults = (results: HFClassificationResult[]): HFClassificationResult[] => {
    const unique = new Map<string, HFClassificationResult>();

    results.forEach(item => {
        // Normalize: remove distinct suffixes like " music", trim, lowercase
        const normalized = item.label.toLowerCase().replace(/ music$/i, '').trim();

        if (!unique.has(normalized)) {
            unique.set(normalized, item);
        } else {
            // If duplicate exists, keep the one with higher score
            const existing = unique.get(normalized)!;
            if (item.score > existing.score) {
                unique.set(normalized, item);
            }
        }
    });

    return Array.from(unique.values()).sort((a, b) => b.score - a.score);
};

// Unified Schema for single-shot analysis
const sonicAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        genres: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    label: { type: Type.STRING },
                    score: { type: Type.NUMBER }
                }
            }
        },
        moods: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    label: { type: Type.STRING },
                    score: { type: Type.NUMBER }
                }
            }
        },
        instruments: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    label: { type: Type.STRING },
                    score: { type: Type.NUMBER }
                }
            }
        }
    }
};

export interface SonicAnalysisResult {
    genres: HFClassificationResult[];
    moods: HFClassificationResult[];
    instruments: HFClassificationResult[];
}

/**
 * UNIFIED ANALYSIS: Fetches Genre, Mood, and Instruments in ONE call to save bandwidth and time.
 */
export const analyzeFullSonicContext = async (file: File): Promise<SonicAnalysisResult> => {
    try {
        const audioPart = await fileToGenerativePart(file);

        const prompt = `
        Analyze this audio track comprehensively as a professional musicologist.
        
        STRICT VOCABULARY ENFORCEMENT:
        You MUST select terms from the following lists:
        
        1. **GENRES**: Choose from:
        ${VOCAB_MAIN_GENRES}
        ${VOCAB_SUB_GENRES}
        
        2. **MOODS**: Choose from:
        ${VOCAB_MOODS}
        
        3. **INSTRUMENTS**: Choose from:
        ${VOCAB_INSTRUMENTS}
        
        Task 1: Identify the specific musical GENRES (be precise).
        Task 2: Identify the emotional MOODS.
        Task 3: Identify the audible INSTRUMENTS.
        
        Output strictly structured JSON with confidence scores (0.0-1.0).
        Avoid duplicates.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [audioPart, { text: prompt }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: sonicAnalysisSchema,
                temperature: 0.1 // Low temp for precision
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response from AI");

        const rawData = JSON.parse(text);

        return {
            genres: deduplicateResults(rawData.genres || []),
            moods: deduplicateResults(rawData.moods || []),
            instruments: deduplicateResults(rawData.instruments || [])
        };

    } catch (error) {
        console.error("Sonic Analysis Error:", error);
        throw new Error("Sonic analysis error. Check your connection.");
    }
};


// --- COMPATIBILITY WRAPPERS (For legacy individual calls if needed) ---

export const classifyGenre = async (file: File, _token?: string): Promise<HFClassificationResult[]> => {
    const res = await analyzeFullSonicContext(file);
    return res.genres;
};

export const analyzeMood = async (file: File, _token?: string): Promise<HFClassificationResult[]> => {
    const res = await analyzeFullSonicContext(file);
    return res.moods;
};

export const detectInstruments = async (file: File, _token?: string): Promise<HFClassificationResult[]> => {
    const res = await analyzeFullSonicContext(file);
    return res.instruments;
};

// Dummy functions
export const getSavedHFToken = (): string => "";
export const saveHFToken = (_token: string) => { };
