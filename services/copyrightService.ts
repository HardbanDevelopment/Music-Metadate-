
import { Metadata } from '../types';

/**
 * Calculates SHA-256 hash of a file.
 * This serves as a "Digital Fingerprint" of the exact audio file content.
 */
export const calculateFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

/**
 * Writes a WAV header for the given audio buffer and parameters.
 */
function writeWavHeader(sampleRate: number, numChannels: number, numFrames: number) {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    
    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numFrames * numChannels * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true); // 16-bit
    writeString(view, 36, 'data');
    view.setUint32(40, numFrames * numChannels * 2, true);

    return buffer;
}

/**
 * Interleaves audio channels and converts to 16-bit PCM.
 */
function interleave(inputLeft: Float32Array, inputRight: Float32Array | null) {
    const length = inputLeft.length;
    const channels = inputRight ? 2 : 1;
    const result = new Int16Array(length * channels);

    let index = 0;
    let inputIndex = 0;

    while (index < length * channels) {
        // Clamp and convert Left
        let s = Math.max(-1, Math.min(1, inputLeft[inputIndex]));
        s = s < 0 ? s * 0x8000 : s * 0x7FFF;
        result[index++] = s;

        // Clamp and convert Right if exists
        if (inputRight) {
             s = Math.max(-1, Math.min(1, inputRight[inputIndex]));
             s = s < 0 ? s * 0x8000 : s * 0x7FFF;
             result[index++] = s;
        }
        inputIndex++;
    }
    return result;
}

/**
 * Generates a watermarked version of the audio file.
 * Adds a sonic "Beep" pattern every 30 seconds to protect the file.
 */
export const generateWatermarkedAudio = async (file: File): Promise<string> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
    );

    // 1. Source Node (Original Audio)
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    // 2. Watermark Noise/Beep Generation
    // We insert a distinct beep sequence every 30 seconds
    const duration = audioBuffer.duration;
    const interval = 30; 
    
    for (let time = 5; time < duration; time += interval) {
        const osc = offlineContext.createOscillator();
        const gain = offlineContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 880; // High pitch beep
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + 0.05); // Fade in
        gain.gain.linearRampToValueAtTime(0, time + 0.5); // Fade out

        osc.connect(gain);
        gain.connect(offlineContext.destination);
        
        osc.start(time);
        osc.stop(time + 0.5);
    }

    // 3. Render
    const renderedBuffer = await offlineContext.startRendering();

    // 4. Convert to WAV (Simple implementation)
    const left = renderedBuffer.getChannelData(0);
    const right = renderedBuffer.numberOfChannels > 1 ? renderedBuffer.getChannelData(1) : null;
    const interleaved = interleave(left, right);
    const wavHeader = writeWavHeader(renderedBuffer.sampleRate, renderedBuffer.numberOfChannels, renderedBuffer.length);
    
    const wavBlob = new Blob([wavHeader, interleaved], { type: 'audio/wav' });
    return URL.createObjectURL(wavBlob);
};

/**
 * Generates a text certificate proving existence.
 */
export const generateCertificate = (metadata: Metadata, hash: string, fileName: string) => {
    const date = new Date().toISOString();
    const content = `
===================================================================
                CERTYFIKAT CYFROWEGO ŚLADU (PROOF OF EXISTENCE)
===================================================================

Niniejszy dokument poświadcza, że w dniu ${date} wygenerowano
cyfrowy odcisk palca (Hash SHA-256) dla pliku audio.

DANE PLIKU:
Nazwa pliku: ${fileName}
Cyfrowy Odcisk (SHA-256): 
${hash}

DANE METADANYCH (W MOMENCIE GENEROWANIA):
Tytuł: ${metadata.title || 'N/A'}
Artysta: ${metadata.artist || 'N/A'}
Album: ${metadata.album || 'N/A'}
ISRC: ${metadata.isrc || 'N/A'}
Prawa autorskie: ${metadata.copyright || 'N/A'}

-------------------------------------------------------------------
Wygenerowano przez Music Metadata Engine
Wersja: 1.3.0
===================================================================
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificate_${fileName}_${date.split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
