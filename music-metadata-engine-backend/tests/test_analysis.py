import pytest
from httpx import AsyncClient
from app.main import app
import pathlib

@pytest.mark.asyncio
async def test_analysis_generate(client: AsyncClient):
    # Use the known valid MP3 file (same as in test_tagging.py)
    # test_uc_ó.mp3 is known to be invalid/corrupt
    test_file_path = pathlib.Path(r"h:\Projekty\music-metadata-engine\music-metadata-engine-backend\temp_88fa8fd4-f25c-4c69-a47d-43dfbb9b6fb9_All day long.mp3")
    
    if not test_file_path.exists():
        # Fallback to the old one if the new one is missing, but warn
        test_file_path = pathlib.Path(__file__).parents[2] / "music-metadata-engine-backend" / "test_uc_ó.mp3"
        
    assert test_file_path.is_file(), f"Test file not found: {test_file_path}"
    with open(test_file_path, "rb") as f:
        files = {"file": (test_file_path.name, f, "audio/mpeg")}
        response = await client.post("/analysis/generate", files=files, data={"is_pro_mode": "false", "transcribe": "true"})
    
    if response.status_code != 200:
        print(f"Error Response: {response.text}")
    assert response.status_code == 200
    json_data = response.json()
    # Basic sanity checks on returned metadata
    assert isinstance(json_data, dict)
    # Expect at least one of the keys like "bpm" or "metadata"
    assert any(key in json_data for key in ["bpm", "metadata", "analysis"])
