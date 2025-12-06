import pytest
from fastapi.testclient import TestClient
from app.main import app
import os
import tempfile
from mutagen.id3 import ID3, TIT2, TPE1, TALB, TXXX
from mutagen.flac import FLAC, FLACNoHeaderError
import json

client = TestClient(app)

# Helper function to create a dummy MP3 file
def create_dummy_mp3(filename="test.mp3", title="", artist="", album="", isrc="", tipl_data=None):
    audio = ID3()
    if title:
        audio["TIT2"] = TIT2(encoding=3, text=title)
    if artist:
        audio["TPE1"] = TPE1(encoding=3, text=artist)
    if album:
        audio["TALB"] = TALB(encoding=3, text=album)
    if isrc:
        audio.add(TXXX(encoding=3, desc="ISRC", text=[isrc]))
    if tipl_data:
        for item in tipl_data:
            audio.add(TXXX(encoding=3, desc=item['role'], text=[item['name']]))
    audio.save(filename)
    # Write some minimal valid MP3 data (32 bytes header for a silent frame)
    with open(filename, 'rb+') as f:
        f.seek(0, os.SEEK_END)
        f.write(b'\xFF\xFB\x90\x0C' * 8) # A minimal valid MP3 frame (32 bytes)
    return filename

# Helper function to create a dummy FLAC file
def create_dummy_flac(filename="test.flac", title="", artist="", album="", isrc="", tipl_data=None):
    # A minimal valid FLAC header + metadata block for Vorbis comments
    # This is highly simplified and might not be perfectly compliant, but should work for mutagen.
    # For a truly valid FLAC, you'd need a proper encoder.
    flac_header = b'fLaC\x80\x00\x00"\x12\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
    with open(filename, "wb") as f:
        f.write(flac_header)

    audio = FLAC(filename)
    if title:
        audio['title'] = title
    if artist:
        audio['artist'] = artist
    if album:
        audio['album'] = album
    if isrc:
        audio['isrc'] = isrc
    if tipl_data:
        for item in tipl_data:
            audio.add_tag('involvedpeople', f"{item['role']}={item['name']}")
    audio.save()
    return filename

@pytest.fixture(autouse=True)
def run_around_tests():
    # Setup: Create a temporary directory for test files
    with tempfile.TemporaryDirectory() as tmpdir:
        os.chdir(tmpdir) # Change to temporary directory
        yield # Run the tests
    # Teardown: Temporary directory is automatically cleaned up by `with` statement

@pytest.fixture
def mp3_file():
    filepath = create_dummy_mp3()
    yield filepath
    os.remove(filepath)

@pytest.fixture
def flac_file():
    filepath = create_dummy_flac()
    yield filepath
    os.remove(filepath)


def test_tagging_mp3_success(mp3_file):
    isrc = "US-ABC-23-00001"
    tipl_data = [{"role": "Composer", "name": "John Doe"}, {"role": "Producer", "name": "Jane Smith"}]
    tipl_json = json.dumps(tipl_data)

    with open(mp3_file, "rb") as f:
        response = client.post(
            "/tagging",
            files={"files": (os.path.basename(mp3_file), f, "audio/mpeg")},
            data={"user": "test_user", "isrc": isrc, "tipl": tipl_json}
        )
    
    assert response.status_code == 200
    assert response.json()["results"][0]["tagged"] is True
    assert response.json()["results"][0]["tags"]["isrc"] == isrc
    assert response.json()["results"][0]["tags"]["tipl"] == tipl_data

    # Verify tags in the file itself
    audio = ID3(mp3_file)
    assert str(audio.get("TIT2", "")) == "Tagged by test_user"
    assert str(audio.getall("TXXX:ISRC")[0]) == isrc
    
    composer_tag_found = False
    producer_tag_found = False
    for frame in audio.getall("TXXX"):
        if frame.desc == "Composer":
            assert str(frame) == "John Doe"
            composer_tag_found = True
        elif frame.desc == "Producer":
            assert str(frame) == "Jane Smith"
            producer_tag_found = True
    assert composer_tag_found
    assert producer_tag_found


def test_tagging_flac_success(flac_file):
    isrc = "GB-XYZ-24-00002"
    tipl_data = [{"role": "Lyricist", "name": "Alice Wonderland"}]
    tipl_json = json.dumps(tipl_data)

    with open(flac_file, "rb") as f:
        response = client.post(
            "/tagging",
            files={"files": (os.path.basename(flac_file), f, "audio/flac")},
            data={"user": "test_user", "isrc": isrc, "tipl": tipl_json}
        )
    
    assert response.status_code == 200
    assert response.json()["results"][0]["tagged"] is True
    assert response.json()["results"][0]["tags"]["isrc"] == isrc
    assert response.json()["results"][0]["tags"]["tipl"] == tipl_data

    # Verify tags in the file itself
    audio = FLAC(flac_file)
    assert audio.get("title", [""])[0] == "Tagged by test_user"
    assert audio.get("isrc", [""])[0] == isrc
    
    involved_people_found = False
    for tag_val in audio.getall("involvedpeople"):
        if "Lyricist=Alice Wonderland" in tag_val:
            involved_people_found = True
            break
    assert involved_people_found


def test_tagging_invalid_isrc(mp3_file):
    invalid_isrc = "US-ABC-23-1234" # Too short
    tipl_data = [{"role": "Composer", "name": "John Doe"}]
    tipl_json = json.dumps(tipl_data)

    with open(mp3_file, "rb") as f:
        response = client.post(
            "/tagging",
            files={"files": (os.path.basename(mp3_file), f, "audio/mpeg")},
            data={"user": "test_user", "isrc": invalid_isrc, "tipl": tipl_json}
        )
    assert response.status_code == 400
    assert "Invalid ISRC format" in response.json()["detail"]


def test_tagging_invalid_tipl_json(mp3_file):
    invalid_tipl_json = "{not_json"

    with open(mp3_file, "rb") as f:
        response = client.post(
            "/tagging",
            files={"files": (os.path.basename(mp3_file), f, "audio/mpeg")},
            data={"user": "test_user", "tipl": invalid_tipl_json}
        )
    assert response.status_code == 400
    assert "Invalid TIPL format" in response.json()["detail"]

def test_tagging_no_isrc_or_tipl(mp3_file):
    with open(mp3_file, "rb") as f:
        response = client.post(
            "/tagging",
            files={"files": (os.path.basename(mp3_file), f, "audio/mpeg")},
            data={"user": "test_user"}
        )
    
    assert response.status_code == 200
    assert response.json()["results"][0]["tagged"] is True
    assert "isrc" not in response.json()["results"][0]["tags"]
    assert "tipl" not in response.json()["results"][0]["tags"]

    audio = ID3(mp3_file)
    assert str(audio.get("TIT2", "")) == "Tagged by test_user"
    # Ensure no ISRC or TIPL TXXX frames were added
    assert not any("ISRC" in frame.desc for frame in audio.getall("TXXX"))
    assert not any("Composer" in frame.desc for frame in audio.getall("TXXX"))

# Assuming main.py is in the root of the backend app
# and the client is initialized with it.
# If main.py is in app/, then update `from main import app` to `from app.main import app`
