from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import List, Optional
import tempfile
import os
import json  # Import json for parsing TIPL
from mutagen import File as MutagenFile
from mutagen.id3 import ID3, TIT2, TXXX
from mutagen.flac import FLAC
from app.utils.audio_metadata import is_valid_isrc

router = APIRouter()


@router.post("/tagging")
async def tagging(
    files: List[UploadFile] = File(...),
    user: str = Form(...),
    analysis_data: str = Form(...),  # Expecting JSON string from analysis endpoint
    isrc: Optional[str] = Form(None),
    tipl: Optional[str] = Form(None),
):
    results = []
    try:
        parsed_analysis_data = json.loads(analysis_data)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON format for analysis_data.",
        )
    
    # Validate TIPL format before processing files
    parsed_tipl = []
    if tipl:
        try:
            parsed_tipl = json.loads(tipl)
            if not isinstance(parsed_tipl, list):
                raise ValueError("TIPL must be a list of dictionaries.")
            for item in parsed_tipl:
                if (
                    not isinstance(item, dict)
                    or "role" not in item
                    or "name" not in item
                ):
                    raise ValueError(
                        "Each TIPL item must be a dictionary with 'role' and 'name'."
                    )
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid TIPL format: {e}",
            )
    
    # Validate ISRC format before processing files
    if isrc:
        if not is_valid_isrc(isrc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid ISRC format: {isrc}",
            )
    
    for f in files:
        try:
            # Save uploaded file to temp location
            suffix = os.path.splitext(f.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                content = await f.read()
                tmp.write(content)
                tmp_path = tmp.name
            audio = MutagenFile(tmp_path)
            tags = {}

            if audio is not None:
                if isinstance(audio, ID3):
                    # Existing ID3 tags
                    tags = {
                        "title": str(audio.get("TIT2", "")),
                        "artist": str(audio.get("TPE1", "")),
                        "album": str(audio.get("TALB", "")),
                    }

                    # Write ISRC
                    if isrc:
                        audio.delall(
                            "TXXX:ISRC"
                        )  # Remove existing ISRC to avoid duplicates
                        audio.add(TXXX(encoding=3, desc="ISRC", text=[isrc]))

                    # Write TIPL
                    if parsed_tipl:
                        # Remove existing TIPL-like TXXX frames
                        for frame_id in list(audio.keys()):
                            if frame_id.startswith("TXXX:") and frame_id.split(":")[
                                1
                            ] in [item["role"] for item in parsed_tipl]:
                                audio.delall(frame_id)

                        for item in parsed_tipl:
                            audio.add(
                                TXXX(encoding=3, desc=item["role"], text=[item["name"]])
                            )

                    # Example: Write a tag (dummy)
                    audio["TIT2"] = TIT2(encoding=3, text="Tagged by " + user)
                    audio.save()

                elif isinstance(audio, FLAC):
                    # Existing FLAC tags
                    tags = {
                        "title": (
                            audio.get("title", [""])[0] if audio.get("title") else ""
                        ),
                        "artist": (
                            audio.get("artist", [""])[0] if audio.get("artist") else ""
                        ),
                        "album": (
                            audio.get("album", [""])[0] if audio.get("album") else ""
                        ),
                    }

                    # Write ISRC
                    if isrc:
                        audio["isrc"] = isrc

                    # Write TIPL
                    if parsed_tipl:
                        # Clear existing involvedpeople or similar custom fields
                        if "involvedpeople" in audio:
                            del audio["involvedpeople"]
                        for item in parsed_tipl:
                            audio.add_tag(
                                "involvedpeople", f"{item['role']}={item['name']}"
                            )  # Using custom field

                    audio["title"] = "Tagged by " + user
                    audio.save()

                else:
                    # For other audio formats, just return empty tags
                    # Don't include all tags as they may contain binary data (e.g., album art)
                    tags = {}
                tagged = True
            else:
                tags = {}
                tagged = False

            # Append ISRC and TIPL to results for verification
            if isrc:
                tags["isrc"] = isrc
            if parsed_tipl:
                tags["tipl"] = parsed_tipl

            results.append(
                {"file": f.filename, "tagged": tagged, "tags": tags, "user": user}
            )
        except HTTPException:
            # Re-raise HTTP exceptions (validation errors) to return proper status codes
            raise
        except Exception as e:
            results.append(
                {"file": f.filename, "tagged": False, "error": str(e), "user": user}
            )
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                pass
    return {"results": results}
