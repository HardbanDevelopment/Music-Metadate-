from fastapi import APIRouter
from app.config import settings
import httpx

router = APIRouter()

@router.get("/proxy/discogs/release")
async def get_discogs_release(release_id: str):
    headers = {
        "Authorization": f"Discogs key={settings.DISCOGS_CONSUMER_KEY}, secret={settings.DISCOGS_CONSUMER_SECRET}"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.discogs.com/releases/{release_id}",
            headers=headers
        )
    return response.json()
