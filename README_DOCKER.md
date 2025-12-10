# Docker Deployment Guide for Music Metadata Engine

This application has been containerized to support the full suite of music analysis tools (Audio Analysis, Stem Separation, etc.) which exceed the size limits of standard serverless platforms like Vercel.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop).

## Running Locally with Docker Compose

1. **Build and Run**:
   Run the following command in the project root:
   ```bash
   docker-compose up --build
   ```
   This will:
   - Build the Frontend (Vite/React)
   - Build the Backend (FastAPI + FFmpeg + ML Libraries)
   - Start the service on `http://localhost:8000`

2. **Access the App**:
   Open your browser and navigate to:
   - [http://localhost:8000](http://localhost:8000)

   The backend automatically serves the frontend static files.

3. **Stop the App**:
   Press `Ctrl+C` or run:
   ```bash
   docker-compose down
   ```

## Deploying to Production (VPS/Railway/Render)

This Docker setup enables deployment to any platform supporting Docker.

### Environment Variables
Ensure you set the following environment variables in your deployment platform:
- `DATABASE_URL` (optional, defaults to SQLite)
- `SUPABASE_URL` & `SUPABASE_KEY` (Authentication)
- `OPENAI_API_KEY` (if using Whisper)
- `GROQ_API_KEY` (if using Groq)

### Railway/Render
Simply connect your GitHub repository and point to the `Dockerfile` in the root directory. The platform will handle the multi-stage build automatically.

## Architecture

- **Single Container**: The app runs as a single container ("Monolith") for simplicity.
- **Frontend**: Built statically (`npm run build`) and copied to `/app/static`.
- **Backend**: FastAPI serves API routes AND static frontend files.
- **FFmpeg**: Included in the image to support `librosa` and audio processing.
