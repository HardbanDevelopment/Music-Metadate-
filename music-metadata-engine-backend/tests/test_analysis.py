import pytest
from httpx import AsyncClient
from app.main import app
import pathlib

@pytest.mark.asyncio
async def test_analysis_generate(client: AsyncClient):
    # Path to a sample MP3 (already present in the repo)
    test_file_path = pathlib.Path(__file__).parents[2] / "music-metadata-engine-backend" / "test_uc_ó.mp3"
    assert test_file_path.is_file(), f"Test file not found: {test_file_path}"
    with open(test_file_path, "rb") as f:
        files = {"file": (test_file_path.name, f, "audio/mpeg")}
        response = await client.post("/analysis/generate", files=files, data={"is_pro_mode": "false", "transcribe": "true"})
    assert response.status_code == 200
    json_data = response.json()
    # Basic sanity checks on returned metadata
    assert isinstance(json_data, dict)
    # Expect at least one of the keys like "bpm" or "metadata"
    assert any(key in json_data for key in ["bpm", "metadata", "analysis"])
