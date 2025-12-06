from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Dict, Any, List

from app.config import settings
from app.dependencies import get_user_and_check_quota
from gotrue.types import User
import google.generativeai as genai
import json

router = APIRouter(prefix="/generate", tags=["generative"])

# Configure the Gemini client
genai.configure(api_key=settings.GEMINI_API_KEY)

# --- Pydantic Models for Request Bodies ---

class RefineFieldRequest(BaseModel):
    current_metadata: Dict[str, Any] = Field(..., description="The full current metadata object for context.")
    field_to_refine: str = Field(..., description="The specific key/field in the metadata to be refined.")
    refinement_instruction: str = Field(..., description="The user's instruction on how to refine the field.")

class MarketingContentRequest(BaseModel):
    metadata: Dict[str, Any] = Field(..., description="The metadata object to generate content from.")
    content_type: str = Field(..., description="Type of content, e.g., 'social', 'press', 'bio'.")
    tone: str = Field(..., description="Desired tone for the content.")

class LyricalIdeasRequest(BaseModel):
    metadata: Dict[str, Any] = Field(..., description="The metadata object to generate ideas from.")
    
class CoverArtRequest(BaseModel):
    metadata: Dict[str, Any] = Field(..., description="The metadata object to generate cover art ideas from.")


# --- Helper for Gemini JSON response ---
async def call_gemini_json(prompt: str, model_name: str = "gemini-1.5-flash") -> Dict[str, Any]:
    try:
        model = genai.GenerativeModel(
            model_name=model_name,
            generation_config={"response_mime_type": "application/json"},
        )
        response = await model.generate_content_async(prompt)
        return json.loads(response.text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI model returned invalid JSON.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred with the AI model: {str(e)}")


# --- New Endpoints ---

@router.post("/refine_field", dependencies=[Depends(get_user_and_check_quota)])
async def refine_metadata_field(request: RefineFieldRequest):
    prompt = f"""
    Context: Music Metadata Refinement.
    Current Data: {json.dumps(request.current_metadata)}
    Task: Rewrite/Update the field "{request.field_to_refine}".
    Instruction: {request.refinement_instruction}
    Output JSON with ONLY the key "{request.field_to_refine}".
    """
    return await call_gemini_json(prompt)

@router.post("/marketing_content", dependencies=[Depends(get_user_and_check_quota)])
async def generate_marketing_content(request: MarketingContentRequest):
    prompt = f"""
    Generate '{request.content_type}' content with a '{request.tone}' tone 
    for a track with this metadata: {json.dumps(request.metadata)}.
    Return as plain text.
    """
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = await model.generate_content_async(prompt)
    return {"content": response.text}


@router.post("/cover_art_idea", dependencies=[Depends(get_user_and_check_quota)])
async def generate_cover_art_idea(request: CoverArtRequest):
    prompt = f"""
    Generate a visual prompt for an AI image generator (like Midjourney or DALL-E) 
    to create cover art for a track with this metadata: {json.dumps(request.metadata)}.
    Return a JSON object with a single key "visual_prompt".
    """
    return await call_gemini_json(prompt)

@router.post("/analyze_lyrics", dependencies=[Depends(get_user_and_check_quota)])
async def analyze_lyrics(
    metadata: str = Form(...), # JSON string of metadata
    file: UploadFile = File(...)
):
    metadata_dict = json.loads(metadata)
    lyrics = metadata_dict.get("lyrics", "")
    if not lyrics:
        # If no lyrics in metadata, we would need to transcribe the audio file.
        # This is a complex task. For now, we rely on existing lyrics.
        # This is a potential enhancement for later.
        raise HTTPException(status_code=400, detail="Lyrics not found in metadata. Audio transcription not yet implemented.")

    prompt = f"""
    Analyze the following lyrics: "{lyrics}"
    Determine the theme, mood, and provide a short summary.
    Return a JSON object with keys "theme", "mood", "summary".
    """
    return await call_gemini_json(prompt)
    
@router.post("/lyrical_ideas", dependencies=[Depends(get_user_and_check_quota)])
async def generate_lyrical_ideas(request: LyricalIdeasRequest):
    prompt = f"""
    Based on the following track metadata, generate lyrical ideas for a new song.
    Metadata: {json.dumps(request.metadata)}
    Provide a sample verse and chorus, and a brief explanation.
    Return a JSON object with keys "verse", "chorus", "explanation".
    """
    return await call_gemini_json(prompt)

@router.post("/analyze_structure")
async def analyze_structure(
    file: UploadFile = File(...),
    current_user: User = Depends(get_user_and_check_quota)
):
    # This still reads the whole file into memory. It will be fixed in Step 2.
    audio_file = {"mime_type": file.content_type, "data": await file.read()}
    prompt = """
    Analyze the structure of this audio file. Identify segments like 'intro', 'verse', 'chorus', 'bridge', 'outro'.
    For each segment, provide the start and end time in seconds.
    Return a JSON list where each item is an object with keys "label", "start", and "end".
    Example: [{"label": "intro", "start": 0.0, "end": 15.5}, ...]
    """
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config={"response_mime_type": "application/json"},
    )
    response = await model.generate_content_async([prompt, audio_file])
    return json.loads(response.text)
