# Music Metadata Engine Backend

This is the FastAPI backend for Music Metadata Engine.

## Features

- Secure API endpoints for proxying requests to external services (Gemini, Spotify, Last.fm, etc.)
- User authentication (Supabase Auth or similar)
- Cloud database integration (Firestore/PostgreSQL)
- Quota management
- Batch audio analysis
- Tagging
- DDEX export endpoints
- Ready for integration with React/Vite frontend

## Getting Started

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Start the server:

   ```bash
   uvicorn app.main:app --reload
   ```

## Next Steps

- Implement endpoints and integrations as described in `.github/copilot-instructions.md`

## Tagging Endpoint

### POST /tagging

Batch tag audio files (MP3, FLAC) and update metadata using Mutagen.

**Request:**

- `files`: List of audio files (multipart/form-data)
- `user`: Username (form field)

**Response:**

```json
{
  "results": [
    {
      "file": "song.mp3",
      "tagged": true,
      "tags": {
        "title": "Tagged by user",
        "artist": "Artist Name",
        "album": "Album Name"
      },
      "user": "user"
    },
    ...
  ]
}
```

**Supported formats:** MP3 (ID3), FLAC (Vorbis)

**Example (using curl):**

```bash
curl -X POST "http://localhost:8000/tagging" \
  -F "files=@song.mp3" -F "files=@track.flac" -F "user=testuser"
```

## DDEX Export Endpoint

### POST /ddex/export

Export music metadata as DDEX XML.

**Request:**

- JSON body with metadata fields (e.g., title, artist, album)

**Response:**

- XML file (DDEXMessage)

**Example (using curl):**

```bash
curl -X POST "http://localhost:8000/ddex/export" \
  -H "Content-Type: application/json" \
  -d '{"title": "Song Title", "artist": "Artist Name", "album": "Album Name"}'
```
