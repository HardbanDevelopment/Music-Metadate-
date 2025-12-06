
import * as id3 from 'browser-id3-writer';
import { Metadata } from '../types';
import { calculateFileHash } from './copyrightService';

// Robust import handling for browser-id3-writer to support both named and default exports
// @ts-ignore
const ID3Writer = id3.ID3Writer || id3.default || id3;

/**
 * Creates a new WAV file blob with an embedded ID3 chunk.
 */
const writeId3ToWav = async (originalWavFile: File, id3TagBlob: Blob): Promise<Blob> => {
    const originalBuffer = await originalWavFile.arrayBuffer();
    const id3Buffer = await id3TagBlob.arrayBuffer();
    const view = new DataView(originalBuffer);

    // 1. Validate WAV Header
    const riffHeader = String.fromCharCode(...new Uint8Array(originalBuffer.slice(0, 4)));
    const waveHeader = String.fromCharCode(...new Uint8Array(originalBuffer.slice(8, 12)));

    if (riffHeader !== 'RIFF' || waveHeader !== 'WAVE') {
        throw new Error("Nieprawidłowy format pliku WAV.");
    }

    // 2. Prepare new chunk data
    const id3Length = id3Buffer.byteLength;
    // WAV chunks must be word-aligned (even number of bytes). Add padding byte if needed.
    const padding = id3Length % 2 !== 0 ? 1 : 0;

    // Chunk Header: 4 bytes ID ("id3 ") + 4 bytes Size
    const chunkHeaderSize = 8;
    const totalChunkSize = chunkHeaderSize + id3Length + padding;

    // 3. Create new buffer
    // Original file + new chunk
    const newBufferSize = originalBuffer.byteLength + totalChunkSize;
    const newBuffer = new Uint8Array(newBufferSize);

    // Copy original WAV data
    newBuffer.set(new Uint8Array(originalBuffer), 0);

    // 4. Update RIFF Size (Bytes 4-7)
    // RIFF size = Total File Size - 8 bytes (RIFF id + size itself)
    const newRiffSize = newBufferSize - 8;
    // We need to write this in Little Endian to the new buffer
    newBuffer[4] = newRiffSize & 0xFF;
    newBuffer[5] = (newRiffSize >> 8) & 0xFF;
    newBuffer[6] = (newRiffSize >> 16) & 0xFF;
    newBuffer[7] = (newRiffSize >> 24) & 0xFF;

    // 5. Append "id3 " Chunk at the end
    let offset = originalBuffer.byteLength;

    // Write Chunk ID "id3 " (lower case is standard for ID3 inside WAV)
    newBuffer[offset++] = 0x69; // i
    newBuffer[offset++] = 0x64; // d
    newBuffer[offset++] = 0x33; // 3
    newBuffer[offset++] = 0x20; // space

    // Write Chunk Size (ID3 data length only) - Little Endian
    newBuffer[offset++] = id3Length & 0xFF;
    newBuffer[offset++] = (id3Length >> 8) & 0xFF;
    newBuffer[offset++] = (id3Length >> 16) & 0xFF;
    newBuffer[offset++] = (id3Length >> 24) & 0xFF;

    // Write ID3 Data
    newBuffer.set(new Uint8Array(id3Buffer), offset);
    offset += id3Length;

    // Write Padding if needed
    if (padding > 0) {
        newBuffer[offset] = 0x00;
    }

    return new Blob([newBuffer], { type: 'audio/wav' });
};


export const embedMetadata = async (
    originalFile: File,
    metadata: Metadata,
    coverArtUrl: string | null
): Promise<void> => {
    const isMp3 = originalFile.type === 'audio/mpeg' || originalFile.name.toLowerCase().endsWith('.mp3');
    const isWav = originalFile.type === 'audio/wav' || originalFile.name.toLowerCase().endsWith('.wav');

    if (!isMp3 && !isWav) {
        throw new Error("Tagowanie jest obecnie obsługiwane dla plików MP3 oraz WAV.");
    }

    try {
        // For MP3: We use the file buffer directly.
        // For WAV: We use a dummy buffer to generate just the ID3 tag, then embed it manually.

        let writerBuffer: ArrayBuffer;

        if (isMp3) {
            writerBuffer = await originalFile.arrayBuffer();
        } else {
            // Empty buffer to generate isolated tag
            writerBuffer = new ArrayBuffer(0);
        }

        // @ts-ignore - Type definition mismatch for browser-id3-writer in this environment
        const writer = new ID3Writer(writerBuffer);

        // Safe wrapper to prevent unsupported frame errors causing a complete crash
        const setFrameSafe = (frameId: string, value: any) => {
            if (value === undefined || value === null || value === '') return;
            try {
                writer.setFrame(frameId, value);
            } catch (e) {
                console.warn(`ID3Writer: Failed to set frame ${frameId}. It might be unsupported by this library version.`, e);
            }
        };

        // --- Map Metadata to ID3 Frames ---

        // Basic Info
        setFrameSafe('TIT2', metadata.title);
        if (metadata.artist) setFrameSafe('TPE1', [metadata.artist]);
        setFrameSafe('TALB', metadata.album);
        setFrameSafe('TYER', metadata.year);
        if (metadata.mainGenre) setFrameSafe('TCON', [metadata.mainGenre]);
        if (metadata.bpm) setFrameSafe('TBPM', metadata.bpm.toString());

        // Credits & Rights
        setFrameSafe('TCOP', metadata.copyright);
        setFrameSafe('TPUB', metadata.publisher || metadata.label); // Fallback Label to Publisher
        setFrameSafe('TSRC', metadata.isrc);
        if (metadata.composer) setFrameSafe('TCOM', [metadata.composer]);
        if (metadata.lyricist) setFrameSafe('TEXT', [metadata.lyricist]);
        setFrameSafe('TPE2', metadata.albumArtist);

        // Lyrics (USLT)
        if (metadata.lyrics) {
            try {
                writer.setFrame('USLT', {
                    description: 'Lyrics',
                    lyrics: metadata.lyrics,
                    language: 'eng'
                });
            } catch (e) { console.warn("USLT frame error", e); }
        }

        // Technical & Creative Details
        if (metadata.key) {
            let keyNotation = metadata.key;
            if (metadata.mode) keyNotation += metadata.mode === 'Minor' ? 'm' : '';
            setFrameSafe('TKEY', keyNotation);
        }

        // Rich Comment
        let richDescription = metadata.trackDescription || '';
        const extras = [];
        if (metadata.moods?.length) extras.push(`Moods: ${metadata.moods.join(', ')}`);
        if (metadata.keywords?.length) extras.push(`Tags: ${metadata.keywords.join(', ')}`);
        if (metadata.energyLevel) extras.push(`Energy: ${metadata.energyLevel}`);
        if (metadata.vocalStyle?.gender) extras.push(`Vocals: ${metadata.vocalStyle.gender} (${metadata.vocalStyle.timbre})`);

        if (extras.length > 0) {
            richDescription += `\n\n[AI Analysis Data]\n${extras.join('\n')}`;
        }

        try {
            writer.setFrame('COMM', {
                description: 'Metadata Engine',
                text: richDescription,
                language: 'eng'
            });
        } catch (e) { console.warn("Failed to set COMM frame", e); }

        // Digital Fingerprint
        try {
            const hash = await calculateFileHash(originalFile);
            setFrameSafe('TXXX', {
                description: 'AudioHash',
                value: hash
            });
            setFrameSafe('TXXX', {
                description: 'MetadataSource',
                value: 'Music Metadata Engine AI'
            });
        } catch (e) {
            console.warn("Could not calculate hash for tagging", e);
        }

        // Cover Art
        if (coverArtUrl) {
            try {
                const response = await fetch(coverArtUrl);
                const blob = await response.blob();
                const buffer = await blob.arrayBuffer();
                writer.setFrame('APIC', {
                    type: 3, // Front Cover
                    data: buffer,
                    description: 'Cover Art'
                });
            } catch (e) {
                console.warn("Could not fetch cover art for tagging", e);
            }
        }

        // --- Finalize ---

        // IMPORTANT: We must add the tag to the writer buffer before extracting it.
        // For MP3, this modifies the buffer passed in constructor (or internal copy).
        // For WAV, we use this to generate the ID3 block from the empty buffer we started with.
        writer.addTag();

        let finalBlob: Blob;
        let downloadName: string;

        if (isMp3) {
            finalBlob = writer.getBlob();
            downloadName = `[TAGGED] ${originalFile.name}`;
        } else {
            // WAV Logic
            const id3TagBlob = writer.getBlob();
            finalBlob = await writeId3ToWav(originalFile, id3TagBlob);
            downloadName = originalFile.name.replace('.wav', '_tagged.wav');
        }

        // Trigger Download
        const taggedUrl = URL.createObjectURL(finalBlob);
        const link = document.createElement('a');
        link.href = taggedUrl;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();

        // Cleanup with small delay to ensure download starts in all browsers
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(taggedUrl);
        }, 100);

    } catch (error) {
        console.error("Error embedding metadata:", error);
        throw error;
    }
};
