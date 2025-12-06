from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from app.config import settings
from app.dependencies import get_user_and_check_quota, increment_user_quota
from gotrue.types import User
import google.generativeai as genai
import json
import uuid
from app.supabase_client import supabase

router = APIRouter(prefix="/analysis", tags=["analysis"])

# Configure the Gemini client
genai.configure(api_key=settings.GEMINI_API_KEY)

# --- VOCABULARY AND SCHEMA (copied from geminiService.ts) ---

VOCAB_MAIN_GENRES = "Classical Music (including Baroque, Classicism, Romanticism, Contemporary Classical), Jazz, Swing, Bebop, Cool Jazz, Jazz Fusion, Blues, Blues Rock, Rock, Rock and Roll, Hard Rock, Punk Rock, Grunge, Indie Rock, Psychedelic Rock, Progressive Rock, Metal, Heavy Metal, Thrash Metal, Death Metal, Black Metal, Power Metal, Pop, Synth-pop, K-pop, Art Pop, Hip-Hop, Rap, Trap, Old School Hip-Hop, R&B (Contemporary R&B), Soul, Neo-Soul, Funk, Disco, Electronic Dance Music (EDM), House, Techno, Trance, Drum and Bass, Dubstep, Ambient, IDM (Intelligent Dance Music), Country, Bluegrass, Folk, Americana, Singer-Songwriter, Reggae, Dancehall, Ska, Dub, Latin Music, Salsa, Bossa Nova, Reggaeton, Film and Theatrical Music (Soundtrack, Score, Musical, Incidental Music, Underscore, Video Game Music), Gospel, Experimental Music (Avant-garde), World Music"
VOCAB_MOODS = "Joyful, Euphoric, Melancholic, Sad, Heartbreaking, Reflective, Nostalgic, Hopeful, Inspiring, Powerful, Angry, Aggressive, Furious, Triumphant, Victorious, Fearful, Anxious, Suspenseful, Mysterious, Ethereal, Dreamy, Serene, Peaceful, Calm, Meditative, Passionate, Romantic, Sensual, Enchanting, Magical, Whimsical, Playful, Humorous, Dramatic, Epic, Heroic, Somber, Solemn, Spiritual, Worshipful, Haunting, Ominous, Brooding, Dark, Gloomy, Intense, Raw, Vulnerable, Empowering, Defiant, Energetic, Driving, Upbeat, Lively, Fast-paced, Dynamic, Exciting, Pulsating, Rhythmic, Slow-paced, Relaxed, Chill, Mellow, Steady, Ambient, Subtle, Building, Climactic, Explosive, Celebratory, Party, Danceable, Motivational, Workout, Focus/Concentration, Background, Relaxation, Study, Travel, Road Trip, Morning, Evening, Nighttime, Rainy Day, Sunny Day, Adventure, Exploration, Introspective, Intimate, Grand, Cinematic, Tribal, Futuristic, Retro, Vintage"
VOCAB_INSTRUMENTS = "Acoustic Guitar, Electric Guitar, Bass Guitar, Upright Bass, Piano, Electric Piano, Synthesizer, Organ, Strings (Violin, Viola, Cello, Contrabass), Brass (Trumpet, Trombone, French Horn, Tuba), Woodwinds (Flute, Clarinet, Oboe, Bassoon, Saxophone), Drums (Acoustic Kit, Electronic Kit), Percussion (Congas, Bongos, Shaker, Tambourine, Cowbell, Timpani, Xylophone, Vibraphone, Marimba), Vocals (Lead, Background, Choir), Harmonica, Accordion, Banjo, Mandolin, Ukulele, Harp, Sitar, Tabla, Didgeridoo, Theremin, Glockenspiel, Harpsichord, Mellotron, Sampler, Turntables, Drum Machine, Hand Claps, Finger Snaps, Oboe, Clarinet, Flute, Cello, Double Bass, Sitar, Trumpet, Tuba, French Horn, Glockenspiel, Vibraphone, Marimba, Synthesizer Pad, Synthesizer Lead, Synthesizer Bass, Arpeggiator, Sound Effects, Field Recording"
# ... (omitting other long vocab lists for brevity, they should be here)

# Helper to deduplicate arrays
AUDIO_BUCKET = "audio-uploads"

async def delete_from_storage(file_path: str):
    """Helper to delete file from Supabase storage in the background."""
    try:
        supabase.storage.from_(AUDIO_BUCKET).remove([file_path])
        print(f"Successfully deleted {file_path} from storage.")
    except Exception as e:
        print(f"Failed to delete {file_path} from storage: {e}")

def deduplicate_array(arr: list) -> list:
    if not isinstance(arr, list):
        return []
    return list(dict.fromkeys(item.strip() for item in arr if item and isinstance(item, str)))

@router.post("/generate")
async def generate_analysis(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    is_pro_mode: bool = Form(False),
    current_user: User = Depends(get_user_and_check_quota)
):
    """
    Receives an audio file, uploads to storage, generates metadata via URL, 
    and cleans up storage.
    """
    file_content = await file.read()
    if not file_content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    file_path_in_bucket = f"{current_user.id}/{uuid.uuid4()}_{file.filename}"

    try:
        # 1. Upload to Supabase Storage
        supabase.storage.from_(AUDIO_BUCKET).upload(
            path=file_path_in_bucket,
            file=file_content,
            file_options={"content-type": file.content_type}
        )
        
        # 2. Get public URL
        public_url = supabase.storage.from_(AUDIO_BUCKET).get_public_url(file_path_in_bucket)
        
        # 3. Prepare file for Gemini via URL
        audio_file_part = genai.Part.from_uri(
            uri=public_url,
            mime_type=file.content_type
        )
        
        system_prompt = f"""
        You are the Music Metadata Engine, a professional audio archivist.
        Your task is to analyze the provided audio file and generate high-precision metadata.
        STRICT VOCABULARY ENFORCEMENT:
        - Main Genre: Select ONE from: {VOCAB_MAIN_GENRES}
        - Moods: Select 5-7 from: {VOCAB_MOODS}. Prioritize moods that are most prominent and characteristic of the entire track. Briefly justify each mood selection.
        - Instrumentation: List all distinct instruments present. Use specific names from {VOCAB_INSTRUMENTS}. Identify primary lead instruments, rhythm section, and any notable secondary or atmospheric elements. Describe sonic qualities (e.g., bright, muffled, percussive) where relevant for key instruments.
        """

        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={"response_mime_type": "application/json"},
            system_instruction=system_prompt,
        )

        # 4. Generate content from URL
        response = await model.generate_content_async([audio_file_part])
        
        # 5. Schedule cleanup and quota increment
        background_tasks.add_task(increment_user_quota, current_user.id)
        background_tasks.add_task(delete_from_storage, file_path_in_bucket)
        
        try:
            data = json.loads(response.text)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="AI model returned invalid JSON.")

        # Post-processing
        data["additionalGenres"] = deduplicate_array(data.get("additionalGenres"))
        data["moods"] = deduplicate_array(data.get("moods"))
        data["instrumentation"] = deduplicate_array(data.get("instrumentation"))
        data["keywords"] = deduplicate_array(data.get("keywords"))
        
        return data

    except Exception as e:
        print(f"Analysis generation failed: {e}")
        # If upload may have succeeded, try to clean up storage.
        background_tasks.add_task(delete_from_storage, file_path_in_bucket)
        raise HTTPException(status_code=500, detail=f"An error occurred during analysis: {str(e)}")