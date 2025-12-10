import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

# Create a minimal MP3 file
from mutagen.id3 import ID3, TIT2
audio = ID3()
audio["TIT2"] = TIT2(encoding=3, text="Test")
audio.save("test_debug.mp3")
with open("test_debug.mp3", "rb+") as f:
    f.seek(0, os.SEEK_END)
    f.write(b"\xff\xfb\x90\x0c" * 8)

# Test with invalid ISRC
invalid_isrc = "US-ABC-23-1234"  # Too short
analysis_data = json.dumps({"bpm": 110, "key": "E major"})

with open("test_debug.mp3", "rb") as f:
    response = client.post(
        "/tagging",
        files={"files": ("test_debug.mp3", f, "audio/mpeg")},
        data={"user": "test_user", "isrc": invalid_isrc, "analysis_data": analysis_data},
    )

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")

# Cleanup
os.remove("test_debug.mp3")
