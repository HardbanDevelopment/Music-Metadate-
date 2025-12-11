"""
Analysis Routes - Zero-Cost Local + Groq Pipeline
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import os
import uuid
import logging

router = APIRouter(prefix="/analysis", tags=["analysis"])
logger = logging.getLogger(__name__)


def deduplicate_array(arr: list) -> list:
    if not isinstance(arr, list):
        return []
    return list(
        dict.fromkeys(item.strip() for item in arr if item and isinstance(item, str))
    )


@router.post("/generate")
async def generate_analysis(
    file: UploadFile = File(...),
    is_pro_mode: bool = Form(False),
    transcribe: bool = Form(True),  # Enable Whisper transcription
):
    """
    Zero-cost audio analysis pipeline:
    1. Save file temporarily
    2. Run local analysis (librosa, pyloudnorm)
    3. Run Whisper transcription (optional)
    4. Generate metadata with Groq LLM
    5. Return combined results
    """
    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Create a temporary file with safe filename (avoid encoding issues)
    import re

    safe_filename = re.sub(r"[^\w\-.]", "_", file.filename or "audio")
    # Force ASCII for temp file system operations on Windows to be safe
    safe_filename = safe_filename.encode("ascii", "ignore").decode("ascii")
    temp_file_name = f"temp_{uuid.uuid4()}_{safe_filename}"

    try:
        with open(temp_file_name, "wb") as buffer:
            buffer.write(file_content)

        # Check which service to use
        from app.services.groq_whisper import GroqWhisperService

        if GroqWhisperService.is_available():
            logger.info("Using Groq + Whisper pipeline...")

            # Run full pipeline
            result = await GroqWhisperService.full_pipeline(
                file_path=temp_file_name,
                transcribe=transcribe
                and is_pro_mode,  # Transcribe only in Pro mode (slower)
            )

            metadata = result.get("metadata", {})
            analysis = result.get("analysis", {})

            # Merge analysis data into metadata response
            if "core" in analysis:
                core = analysis["core"]
                metadata["bpm"] = core.get("bpm", metadata.get("bpm"))
                metadata["key"] = core.get("key", metadata.get("key"))
                metadata["mode"] = core.get("mode", metadata.get("mode"))
                metadata["technical"] = core.get("spectral", {})
                metadata["technical"]["rhythm"] = core.get("rhythm", {})
                metadata["technical"]["energy"] = core.get("energy", {})
                
                # Merge heuristic moods if AI didn't return any
                if not metadata.get("moods"):
                    metadata["moods"] = core.get("moods", [])
                else:
                    # Optional: Unique merge if you want both
                    current_moods = set(metadata.get("moods", []))
                    heuristic_moods = set(core.get("moods", []))
                    metadata["moods"] = list(current_moods.union(heuristic_moods))

            if "loudness" in analysis and "error" not in analysis["loudness"]:
                metadata["loudness"] = analysis["loudness"]

            # Deduplicate arrays
            metadata["additionalGenres"] = deduplicate_array(
                metadata.get("additionalGenres", [])
            )
            metadata["moods"] = deduplicate_array(metadata.get("moods", []))
            metadata["instrumentation"] = deduplicate_array(
                metadata.get("instrumentation", [])
            )
            metadata["keywords"] = deduplicate_array(metadata.get("keywords", []))

            return metadata

        else:
            # Fallback to local-only analysis (no AI)
            logger.warning("Groq not available, using local analysis only...")

            from app.services.audio_analyzer import AdvancedAudioAnalyzer

            analysis = await AdvancedAudioAnalyzer.full_analysis(temp_file_name)

            core = analysis.get("core", {})
            existing = analysis.get("existing_metadata", {})

            # Build basic metadata from analysis
            return {
                "title": existing.get("title") or file.filename,
                "artist": existing.get("artist") or "Unknown Artist",
                "album": existing.get("album") or "Single",
                "bpm": core.get("bpm"),
                "key": core.get("key"),
                "mode": core.get("mode"),
                "mainGenre": existing.get("genre") or "Unknown",
                "moods": core.get("moods", []),
                "instrumentation": [],
                "technical": core.get("spectral", {}),
                "loudness": analysis.get("loudness", {}),
                "trackDescription": f"Audio track at {core.get('bpm', '?')} BPM in {core.get('full_key', '?')}",
                "_note": "AI metadata generation unavailable. Configure GROQ_API_KEY for full features.",
            }

    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    finally:
        # Clean up temp file
        try:
            if os.path.exists(temp_file_name):
                os.remove(temp_file_name)
        except Exception as e:
            logger.warning(f"Could not delete temp file: {e}")


@router.post("/local-only")
async def local_analysis_only(
    file: UploadFile = File(...),
):
    """
    Run local analysis only (no AI, no internet required).
    Returns: BPM, Key, Loudness, Spectral features, existing metadata.
    """
    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    temp_file_name = f"temp_{uuid.uuid4()}_{file.filename}"

    try:
        with open(temp_file_name, "wb") as buffer:
            buffer.write(file_content)

        from app.services.audio_analyzer import AdvancedAudioAnalyzer

        result = await AdvancedAudioAnalyzer.full_analysis(temp_file_name)
        return result

    except Exception as e:
        logger.error(f"Local analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    finally:
        try:
            if os.path.exists(temp_file_name):
                os.remove(temp_file_name)
        except:
            pass


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    model_size: str = Form("base"),  # tiny, base, small, medium, large
):
    """
    Transcribe audio using local Whisper model.
    """
    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    temp_file_name = f"temp_{uuid.uuid4()}_{file.filename}"

    try:
        with open(temp_file_name, "wb") as buffer:
            buffer.write(file_content)

        from app.services.groq_whisper import GroqWhisperService

        result = await GroqWhisperService.transcribe_audio(temp_file_name, model_size)
        return result

    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    finally:
        try:
            if os.path.exists(temp_file_name):
                os.remove(temp_file_name)
        except:
            pass


@router.post("/separate-stems")
async def separate_stems(
    file: UploadFile = File(...),
    stems: int = Form(2),  # 2, 4, or 5
):
    """
    Separate audio into stems using Spleeter.

    stems:
    - 2: vocals, accompaniment
    - 4: vocals, drums, bass, other
    - 5: vocals, drums, bass, piano, other
    """
    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    temp_file_name = f"temp_{uuid.uuid4()}_{file.filename}"
    output_dir = f"stems_{uuid.uuid4()}"

    try:
        with open(temp_file_name, "wb") as buffer:
            buffer.write(file_content)

        os.makedirs(output_dir, exist_ok=True)

        from app.services.audio_analyzer import AdvancedAudioAnalyzer

        result = await AdvancedAudioAnalyzer.separate_stems(
            temp_file_name, output_dir, stems
        )

        return {
            "stems": result,
            "output_directory": output_dir,
            "note": "Stem files are saved on the server. Download them before cleanup.",
        }

    except Exception as e:
        logger.error(f"Stem separation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Stem separation failed: {str(e)}")

    finally:
        try:
            if os.path.exists(temp_file_name):
                os.remove(temp_file_name)
        except:
            pass
