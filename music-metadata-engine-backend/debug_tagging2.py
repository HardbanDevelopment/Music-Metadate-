import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
import json
import shutil

client = TestClient(app)

# Copy the real test MP3 file
source_file = "test_uc_ó.mp3"
test_file = "test_debug2.mp3"
shutil.copy(source_file, test_file)

# Test with valid data
isrc = "US-ABC-23-00001"
tipl_data = [
    {"role": "Composer", "name": "John Doe"},
    {"role": "Producer", "name": "Jane Smith"},
]
tipl_json = json.dumps(tipl_data)
analysis_data = json.dumps({"bpm": 120, "key": "C major"})

with open(test_file, "rb") as f:
    response = client.post(
        "/tagging",
        files={"files": (test_file, f, "audio/mpeg")},
        data={"user": "test_user", "isrc": isrc, "tipl": tipl_json, "analysis_data": analysis_data},
    )

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

# Cleanup
os.remove(test_file)
