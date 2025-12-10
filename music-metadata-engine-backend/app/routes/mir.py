from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from app.services.mir import MIRService
import shutil
import os
import uuid
from pydantic import BaseModel

router = APIRouter(prefix="/mir", tags=["mir"])

TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)


class TaggingRequest(BaseModel):
    # For when we tag a file that's already on the server (advanced flow)
    # or passing metadata to be embedded in a temporary file
    metadata: dict


@router.post("/analyze")
async def analyze_audio_track(file: UploadFile = File(...)):
    """
    Receives an audio file, saves it temporarily, and runs Librosa analysis.
    Returns calculated BPM, Key, and technical details.
    """

    print(f"DEBUG: Received analysis request for {file.filename}")
    if not MIRService.is_available():
        print("DEBUG: MIR Service unavailable")
        return JSONResponse(
            status_code=503,
            content={
                "error": "MIR libraries (Librosa) not active on server. Check installation."
            },
        )

    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]
    temp_path = os.path.join(TEMP_DIR, f"{file_id}{ext}")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run Analysis
        print(f"DEBUG: Starting MIRService.analyze_audio for {temp_path}")
        analysis_result = await MIRService.analyze_audio(temp_path)
        print("DEBUG: Analysis complete")

        # Clean up? Or keep for tagging?
        # For now, clean up.
        os.remove(temp_path)

        return JSONResponse(content=analysis_result)

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/tag_and_download")
async def tag_and_download_track(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    metadata_json: str = "{}",
):
    """
    Upload a file + Metadata JSON.
    Backend repairs tags using Mutagen.
    Returns the tagged file.
    """
    import json

    if not MIRService.is_available():
        return JSONResponse(status_code=503, content={"error": "Mutagen not active."})

    try:
        metadata = json.loads(metadata_json)
    except:
        return JSONResponse(status_code=400, content={"error": "Invalid metadata JSON"})

    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]
    temp_path = os.path.join(TEMP_DIR, f"tagging_{file_id}{ext}")

    try:
        # Save
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Tag
        MIRService.write_metadata(temp_path, metadata)

        # Return file
        # Use BackgroundTasks to delete file after sending
        background_tasks.add_task(os.remove, temp_path)

        return FileResponse(
            temp_path, media_type="audio/mpeg", filename=f"tagged_{file.filename}"
        )

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/separate")
async def separate_track_vocals(
    background_tasks: BackgroundTasks, file: UploadFile = File(...)
):
    """
    Separates the uploaded track using Demucs.
    Returns the ISOLATED VOCAL track (MP3).
    """
    from app.services.separation import SeparationService

    if not SeparationService.is_available():
        return JSONResponse(
            status_code=503, content={"error": "Demucs/Torch not active."}
        )

    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]

    # Input Temp
    temp_input_path = os.path.join(TEMP_DIR, f"input_{file_id}{ext}")
    # Output Dir (Demucs creates subfolders)
    temp_output_dir = os.path.join(TEMP_DIR, f"out_{file_id}")
    os.makedirs(temp_output_dir, exist_ok=True)

    try:
        with open(temp_input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Separate
        result = await SeparationService.separate_vocals(
            temp_input_path, temp_output_dir
        )

        vocals_file = result.get("vocals")

        if vocals_file and os.path.exists(vocals_file):
            # Helper to clean directory
            def clean_dir():
                shutil.rmtree(temp_output_dir, ignore_errors=True)
                if os.path.exists(temp_input_path):
                    os.remove(temp_input_path)

            background_tasks.add_task(clean_dir)

            return FileResponse(
                vocals_file,
                media_type="audio/mpeg",
                filename=f"vocals_{file.filename}.mp3",
            )
        else:
            return JSONResponse(
                status_code=500,
                content={"error": "Separation completed but files not found."},
            )

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
