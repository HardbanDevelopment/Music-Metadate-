import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data.get("message") == "Music Metadata Engine Backend is running"
