"""
Groq + Local Whisper AI Service
Zero-cost AI for metadata generation using Groq LLM + local Whisper transcription.
"""

import json
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)


# === LAZY IMPORTS ===
def get_groq_client():
    from groq import Groq

    return Groq(api_key=settings.GROQ_API_KEY)


def get_whisper():
    import whisper

    return whisper


class GroqWhisperService:
    """
    AI service combining:
    - Local Whisper for audio transcription (lyrics extraction)
    - Groq LLM for metadata generation (fast, free, no rate limits)
    """

    VOCAB_MAIN_GENRES = "Classical, Jazz, Blues, Rock, Metal, Pop, Hip-Hop, R&B, Soul, Funk, Electronic, House, Techno, Trance, Drum and Bass, Dubstep, Ambient, Country, Folk, Reggae, Latin, World Music, Soundtrack, Gospel, Experimental"

    VOCAB_MOODS = "Joyful, Euphoric, Melancholic, Sad, Reflective, Nostalgic, Hopeful, Inspiring, Powerful, Angry, Aggressive, Triumphant, Mysterious, Ethereal, Dreamy, Serene, Peaceful, Passionate, Romantic, Dramatic, Epic, Heroic, Somber, Haunting, Dark, Intense, Energetic, Upbeat, Relaxed, Chill"

    VOCAB_INSTRUMENTS = "Vocals, Acoustic Guitar, Electric Guitar, Bass Guitar, Piano, Synthesizer, Drums, Percussion, Strings, Brass, Woodwinds, Organ, Harmonica, Saxophone, Trumpet, Violin, Cello, Harp"

    @staticmethod
    def is_available() -> bool:
        return settings.GROQ_API_KEY is not None and len(settings.GROQ_API_KEY) > 0

    @staticmethod
    async def transcribe_audio(
        file_path: str, model_size: str = "base"
    ) -> Dict[str, Any]:
        """
        Transcribe audio using local Whisper model.

        model_size: "tiny", "base", "small", "medium", "large"
        Smaller = faster, larger = more accurate
        """
        try:
            whisper = get_whisper()

            # Load model (cached after first load)
            model = whisper.load_model(model_size)

            # Transcribe
            result = model.transcribe(file_path)

            return {
                "text": result["text"],
                "language": result.get("language", "unknown"),
                "segments": [
                    {"start": seg["start"], "end": seg["end"], "text": seg["text"]}
                    for seg in result.get("segments", [])
                ],
            }
        except Exception as e:
            logger.error(f"Whisper transcription failed: {e}")
            return {"error": str(e), "text": ""}

    @staticmethod
    async def generate_metadata(
        audio_analysis: Dict[str, Any],
        transcription: Optional[str] = None,
        existing_metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generate rich metadata using Groq LLM based on audio analysis results.
        """
        if not GroqWhisperService.is_available():
            raise RuntimeError("GROQ_API_KEY not configured")

        try:
            client = get_groq_client()

            logger.info("DEBUG: Starting context build")

            # Build context from analysis
            analysis_context = ""
            if audio_analysis:
                core = audio_analysis.get("core", {})
                loudness = audio_analysis.get("loudness", {})

                analysis_context = f"""
AUDIO ANALYSIS DATA (from local analysis):
- BPM: {core.get('bpm', 'unknown')}
- Key: {core.get('full_key', 'unknown')}
- Duration: {core.get('duration_seconds', 'unknown')} seconds
- Spectral Brightness: {core.get('spectral', {}).get('brightness', 'unknown')}
- Danceability: {core.get('rhythm', {}).get('danceability', 'unknown')}
- Dynamic Range: {core.get('energy', {}).get('dynamic_range', 'unknown')}
- LUFS: {loudness.get('lufs', 'unknown')}
"""

            # Helper to safely sanitize strings to ASCII
            def safe_ascii(val):
                if val is None:
                    return ""
                try:
                    return str(val).encode("ascii", "replace").decode("ascii")
                except Exception as e:
                    logger.error(f"DEBUG: safe_ascii failed for {val}: {e}")
                    return "unknown"

            logger.info("DEBUG: Building transcription context")
            transcription_context = ""
            if transcription:
                safe_transcription = safe_ascii(transcription[:2000])
                transcription_context = f"""
LYRICS/VOCALS (transcribed):
{safe_transcription}
"""

            logger.info("DEBUG: Building existing metadata context")
            existing_context = ""
            if existing_metadata:
                existing_context = f"""
EXISTING FILE METADATA:
- Title: {safe_ascii(existing_metadata.get('title'))}
- Artist: {safe_ascii(existing_metadata.get('artist'))}
- Album: {safe_ascii(existing_metadata.get('album'))}
- Genre: {safe_ascii(existing_metadata.get('genre'))}
"""

            logger.info("DEBUG: Constructing Prompt string")
            try:
                prompt = f"""You are the Music Metadata Engine. Analyze the provided data and generate professional music metadata.

{analysis_context}
{transcription_context}
{existing_context}

VOCABULARY RULES:
- Main Genre: Pick ONE from: {GroqWhisperService.VOCAB_MAIN_GENRES}
- Moods: Pick 3-5 from: {GroqWhisperService.VOCAB_MOODS}
- Instruments: List detected from: {GroqWhisperService.VOCAB_INSTRUMENTS}

Return ONLY valid JSON matching this structure:
{{
    "title": "Suggested title based on mood/content",
    "artist": "Keep existing or suggest 'Unknown Artist'",
    "album": "Keep existing or suggest 'Single'",
    "year": "2024 or detected year",
    "mainGenre": "ONE genre from list",
    "additionalGenres": ["genre1", "genre2"],
    "moods": ["mood1", "mood2", "mood3"],
    "instrumentation": ["instrument1", "instrument2"],
    "bpm": {core.get('bpm', 120)},
    "key": "{core.get('key', 'C')}",
    "mode": "{core.get('mode', 'Major')}",
    "energyLevel": "Low/Medium/High",
    "trackDescription": "2-3 sentence professional description",
    "keywords": ["tag1", "tag2", "tag3"],
    "lyrics": "Transcribed or empty string"
}}
"""
            except Exception as e:
                logger.error(f"DEBUG: Prompt construction failed: {e}")
                raise

            # Sanitize the entire prompt to ASCII
            def sanitize_to_ascii(text: str) -> str:
                try:
                    return text.encode("ascii", "replace").decode("ascii")
                except Exception as e:
                    logger.error(f"DEBUG: sanitize_to_ascii failed: {e}")
                    return text.encode("ascii", "ignore").decode("ascii")

            logger.info("DEBUG: Sanitizing prompt")
            prompt_safe = sanitize_to_ascii(prompt)

            # Call Groq API
            logger.info("DEBUG: Calling Groq API")
            response = client.chat.completions.create(
                model="llama3-70b-8192",  # Fast, capable, free
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional music metadata analyst. Always respond with valid JSON only.",
                    },
                    {"role": "user", "content": prompt_safe},
                ],
                temperature=0.3,
                max_tokens=2000,
                response_format={"type": "json_object"},
            )

            logger.info("DEBUG: Got response from Groq")
            result_text = response.choices[0].message.content

            # Parse JSON
            try:
                metadata = json.loads(result_text)
            except json.JSONDecodeError:
                # Try to extract JSON from response
                import re

                json_match = re.search(r"\{.*\}", result_text, re.DOTALL)
                if json_match:
                    metadata = json.loads(json_match.group())
                else:
                    raise ValueError("Could not parse AI response as JSON")

            # Ensure BPM and Key from local analysis take priority
            if audio_analysis and "core" in audio_analysis:
                core = audio_analysis["core"]
                metadata["bpm"] = core.get("bpm", metadata.get("bpm"))
                metadata["key"] = core.get("key", metadata.get("key"))
                metadata["mode"] = core.get("mode", metadata.get("mode"))

            return metadata

        except Exception as e:
            logger.error(f"Groq metadata generation failed: {e}")
            raise

    @staticmethod
    async def full_pipeline(file_path: str, transcribe: bool = True) -> Dict[str, Any]:
        """
        Run full analysis + AI pipeline:
        1. Local audio analysis (librosa, pyloudnorm)
        2. Local transcription (Whisper) - optional
        3. AI metadata generation (Groq)
        """
        from app.services.audio_analyzer import AdvancedAudioAnalyzer

        # Step 1: Local Analysis
        logger.info("Running local audio analysis...")
        audio_analysis = await AdvancedAudioAnalyzer.full_analysis(file_path)

        # Step 2: Transcription (optional)
        transcription = None
        if transcribe:
            logger.info("Running Whisper transcription...")
            whisper_result = await GroqWhisperService.transcribe_audio(file_path)
            transcription = whisper_result.get("text", "")

        # Step 3: AI Metadata
        logger.info("Generating metadata with Groq...")
        metadata = await GroqWhisperService.generate_metadata(
            audio_analysis=audio_analysis,
            transcription=transcription,
            existing_metadata=audio_analysis.get("existing_metadata"),
        )

        # Combine all results
        return {
            "metadata": metadata,
            "analysis": audio_analysis,
            "transcription": transcription,
        }
