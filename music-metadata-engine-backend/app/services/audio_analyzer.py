"""
Advanced Audio Analysis Service
Zero-cost local audio analysis using open-source libraries.
"""

import os
import logging
import numpy as np
from typing import Dict, Any

logger = logging.getLogger(__name__)


# === LAZY IMPORTS (to avoid startup crashes if lib missing) ===
def get_librosa():
    import librosa

    return librosa


def get_soundfile():
    import soundfile as sf

    return sf


def get_crepe():
    import crepe

    return crepe


def get_pyloudnorm():
    import pyloudnorm as pyln

    return pyln


def get_tinytag():
    from tinytag import TinyTag

    return TinyTag


def get_spleeter():
    from spleeter.separator import Separator

    return Separator


class AdvancedAudioAnalyzer:
    """
    Comprehensive audio analysis using local, zero-cost libraries.
    """

    @staticmethod
    def is_available() -> bool:
        try:
            import librosa

            return True
        except ImportError:
            return False

    @staticmethod
    async def analyze_core(file_path: str) -> Dict[str, Any]:
        """
        Core analysis: BPM, Key, Spectral features, Duration.
        Uses: librosa
        """
        librosa = get_librosa()

        try:
            # Load audio (full duration for accuracy)
            y, sr = librosa.load(file_path, duration=None)

            # === BPM & Beat Detection ===
            tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
            bpm = float(tempo) if isinstance(tempo, (int, float)) else float(tempo[0])

            # === Key Detection (Chroma-based) ===
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            key_idx = int(np.argmax(np.mean(chroma, axis=1)))
            keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
            detected_key = keys[key_idx]

            # Major/Minor detection (simplified)
            # Compare energy in major vs minor third intervals
            major_energy = np.mean(chroma[(key_idx + 4) % 12])
            minor_energy = np.mean(chroma[(key_idx + 3) % 12])
            mode = "Major" if major_energy > minor_energy else "Minor"

            # === Spectral Features ===
            spectral_centroid = float(
                np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
            )
            spectral_rolloff = float(
                np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))
            )
            spectral_bandwidth = float(
                np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr))
            )
            zero_crossing_rate = float(np.mean(librosa.feature.zero_crossing_rate(y)))

            # === Energy / RMS ===
            rms = librosa.feature.rms(y=y)
            energy_mean = float(np.mean(rms))
            energy_std = float(np.std(rms))

            # === Danceability (rhythm stability) ===
            onset_env = librosa.onset.onset_strength(y=y, sr=sr)
            pulse = librosa.beat.plp(onset_envelope=onset_env, sr=sr)
            danceability = float(np.mean(pulse))

            # === Duration ===
            duration = librosa.get_duration(y=y, sr=sr)

            # === MFCC (for genre/mood classification) ===
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            mfcc_mean = [float(x) for x in np.mean(mfcc, axis=1)]

            # === Heuristic Mood Detection ===
            detected_moods = []
            if energy_mean > 0.1 and bpm > 120:
                detected_moods.append("Energetic")
            if energy_mean < 0.05 and bpm < 100:
                detected_moods.append("Calm")
            if mode == "Major" and bpm > 110:
                detected_moods.append("Happy")
            if mode == "Minor" and bpm < 110:
                detected_moods.append("Melancholic")
            if danceability > 1.2:  # Assuming arbitrary threshold for high danceability
                detected_moods.append("Danceable")
            if spectral_centroid < 1500:
                detected_moods.append("Dark")
            if spectral_centroid > 3500:
                detected_moods.append("Bright")

            return {
                "bpm": round(bpm, 1),
                "key": detected_key,
                "mode": mode,
                "full_key": f"{detected_key} {mode}",
                "duration_seconds": round(duration, 2),
                "moods": detected_moods, 
                "spectral": {
                    "centroid": round(spectral_centroid, 2),
                    "rolloff": round(spectral_rolloff, 2),
                    "bandwidth": round(spectral_bandwidth, 2),
                    "zero_crossing_rate": round(zero_crossing_rate, 4),
                    "brightness": "bright" if spectral_centroid > 3000 else "warm",
                },
                "energy": {
                    "mean": round(energy_mean, 4),
                    "std": round(energy_std, 4),
                    "dynamic_range": "high" if energy_std > 0.05 else "compressed",
                },
                "rhythm": {
                    "danceability": round(danceability, 2),
                    "beat_count": len(beat_frames),
                },
                "mfcc": mfcc_mean,
            }
        except Exception as e:
            logger.error(f"Core analysis failed: {e}")
            raise

    @staticmethod
    async def analyze_loudness(file_path: str) -> Dict[str, Any]:
        """
        Loudness analysis: LUFS, True Peak.
        Uses: pyloudnorm, soundfile
        """
        try:
            sf = get_soundfile()
            pyln = get_pyloudnorm()

            data, rate = sf.read(file_path)

            # Ensure stereo or mono
            if len(data.shape) == 1:
                data = np.column_stack([data, data])

            meter = pyln.Meter(rate)
            loudness = meter.integrated_loudness(data)

            # True Peak
            true_peak = float(np.max(np.abs(data)))
            true_peak_db = 20 * np.log10(true_peak) if true_peak > 0 else -np.inf

            # Loudness range (dynamic range estimate)
            # Split into segments and measure variation
            segment_length = rate * 3  # 3 second segments
            segments = [
                data[i : i + segment_length]
                for i in range(0, len(data), segment_length)
                if len(data[i : i + segment_length]) >= segment_length
            ]

            if segments:
                segment_loudness = [
                    meter.integrated_loudness(seg)
                    for seg in segments
                    if not np.isinf(meter.integrated_loudness(seg))
                ]
                if segment_loudness:
                    loudness_range = max(segment_loudness) - min(segment_loudness)
                else:
                    loudness_range = 0
            else:
                loudness_range = 0

            # Normalization recommendation
            target_lufs = -14  # Spotify/YouTube standard
            gain_needed = target_lufs - loudness if not np.isinf(loudness) else 0

            return {
                "lufs": round(float(loudness), 2) if not np.isinf(loudness) else None,
                "true_peak_db": (
                    round(float(true_peak_db), 2) if not np.isinf(true_peak_db) else None
                ),
                "loudness_range_lu": round(float(loudness_range), 2),
                "normalization": {
                    "target_lufs": target_lufs,
                    "gain_needed_db": round(float(gain_needed), 2),
                    "is_compliant": bool(abs(gain_needed) < 1),
                },
            }
        except Exception as e:
            logger.error(f"Loudness analysis failed: {e}")
            return {"error": str(e)}

    @staticmethod
    async def analyze_pitch(file_path: str) -> Dict[str, Any]:
        """
        Pitch and vocal analysis.
        Uses: CREPE
        """
        try:
            crepe = get_crepe()
            sf = get_soundfile()

            # Limit to 60 seconds for performance on CPU
            # CREPE is extremely heavy; full track would take hours.
            audio, sr = sf.read(file_path, stop=16000 * 60)

            # CREPE expects mono
            if len(audio.shape) > 1:
                audio = np.mean(audio, axis=1)

            # Resample to 16kHz for CREPE
            if sr != 16000:
                librosa = get_librosa()
                audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)
                sr = 16000

            # Run CREPE (viterbi for smoother results)
            time, frequency, confidence, _ = crepe.predict(audio, sr, viterbi=True)

            # Filter by confidence
            confident_freqs = frequency[confidence > 0.5]

            if len(confident_freqs) > 0:
                avg_pitch = float(np.mean(confident_freqs))
                pitch_range = float(np.max(confident_freqs) - np.min(confident_freqs))

                # Convert to musical note
                def freq_to_note(freq):
                    if freq <= 0:
                        return "N/A"
                    notes = [
                        "C",
                        "C#",
                        "D",
                        "D#",
                        "E",
                        "F",
                        "F#",
                        "G",
                        "G#",
                        "A",
                        "A#",
                        "B",
                    ]
                    note_num = 12 * np.log2(freq / 440) + 49
                    note_idx = int(round(note_num) % 12)
                    octave = int((round(note_num) + 8) // 12)
                    return f"{notes[note_idx]}{octave}"

                return {
                    "average_pitch_hz": round(avg_pitch, 2),
                    "average_note": freq_to_note(avg_pitch),
                    "pitch_range_hz": round(pitch_range, 2),
                    "vocal_presence": (
                        len(confident_freqs) / len(frequency)
                        if len(frequency) > 0
                        else 0
                    ),
                }
            else:
                return {"vocal_presence": 0, "note": "Instrumental/No clear vocals"}

        except Exception as e:
            logger.error(f"Pitch analysis failed: {e}")
            return {"error": str(e)}

    @staticmethod
    async def read_metadata(file_path: str) -> Dict[str, Any]:
        """
        Read existing metadata from file.
        Uses: tinytag (fast) or mutagen (detailed)
        """

        def safe_str(val):
            """Sanitize strings to ASCII to avoid encoding issues with AI APIs"""
            if val is None:
                return None
            try:
                return str(val).encode("ascii", "replace").decode("ascii")
            except:
                return None

        try:
            TinyTag = get_tinytag()
            tag = TinyTag.get(file_path, image=True)

            return {
                "title": safe_str(tag.title),
                "artist": safe_str(tag.artist),
                "album": safe_str(tag.album),
                "year": safe_str(tag.year),
                "genre": safe_str(tag.genre),
                "duration": tag.duration,
                "bitrate": tag.bitrate,
                "samplerate": tag.samplerate,
                "channels": tag.channels,
                "has_cover": (
                    tag.get_image() is not None if hasattr(tag, "get_image") else False
                ),
            }
        except Exception as e:
            logger.error(f"Metadata read failed: {e}")
            return {"error": str(e)}

    @staticmethod
    async def separate_stems(
        file_path: str, output_dir: str, stems: int = 2
    ) -> Dict[str, str]:
        """
        Separate audio into stems (vocals, accompaniment, drums, bass, other).
        Uses: Spleeter

        stems: 2 (vocals/accompaniment), 4 (vocals/drums/bass/other), 5 (vocals/drums/bass/piano/other)
        """
        try:
            Separator = get_spleeter()

            separator = Separator(f"spleeter:{stems}stems")
            separator.separate_to_file(file_path, output_dir)

            # Return paths to separated files
            base_name = os.path.splitext(os.path.basename(file_path))[0]
            stem_dir = os.path.join(output_dir, base_name)

            stem_files = {}
            if os.path.exists(stem_dir):
                for f in os.listdir(stem_dir):
                    stem_name = os.path.splitext(f)[0]
                    stem_files[stem_name] = os.path.join(stem_dir, f)

            return stem_files
        except Exception as e:
            logger.error(f"Stem separation failed: {e}")
            return {"error": str(e)}

    @staticmethod
    async def full_analysis(file_path: str) -> Dict[str, Any]:
        """
        Run all available analyses and combine results.
        """
        results = {}

        # Core analysis (always run)
        try:
            results["core"] = await AdvancedAudioAnalyzer.analyze_core(file_path)
        except Exception as e:
            results["core"] = {"error": str(e)}

        # Loudness
        try:
            results["loudness"] = await AdvancedAudioAnalyzer.analyze_loudness(
                file_path
            )
        except Exception as e:
            results["loudness"] = {"error": str(e)}

        # Pitch (optional, can be slow)
        try:
            results["pitch"] = await AdvancedAudioAnalyzer.analyze_pitch(file_path)
        except Exception as e:
            results["pitch"] = {"error": str(e)}

        # Existing metadata
        try:
            results["existing_metadata"] = await AdvancedAudioAnalyzer.read_metadata(
                file_path
            )
        except Exception as e:
            results["existing_metadata"] = {"error": str(e)}

        return results
