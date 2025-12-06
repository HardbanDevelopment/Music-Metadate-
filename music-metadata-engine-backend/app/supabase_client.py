from supabase import create_client, Client
from app.config import settings

supabase_url = settings.SUPABASE_URL
supabase_key = settings.SUPABASE_KEY

if not supabase_url or not supabase_key:
    # raise ValueError("Supabase URL and Key must be set in the environment variables.")
    print("WARNING: Supabase URL/Key missing. Auth/DB features will not work.")


try:
    supabase: Client = create_client(supabase_url, supabase_key)
except Exception as e:
    print(f"Failed to create Supabase client: {e}")
    supabase = None
