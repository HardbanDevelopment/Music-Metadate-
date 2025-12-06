import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
    SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
    LASTFM_API_KEY = os.getenv("LASTFM_API_KEY")
    DISCOGS_CONSUMER_KEY = os.getenv("DISCOGS_CONSUMER_KEY")
    DISCOGS_CONSUMER_SECRET = os.getenv("DISCOGS_CONSUMER_SECRET")
    AUDD_API_TOKEN = os.getenv("AUDD_API_TOKEN")
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL")

settings = Settings()
