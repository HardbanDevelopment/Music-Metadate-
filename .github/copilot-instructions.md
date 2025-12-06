# Copilot Instructions for Music Metadata Engine

## Project Overview
- This is a client-side React/Vite TypeScript application for music metadata analysis and export.
- No Python backend or scripts are present; all logic runs in the browser or via Node.js.
- Key external integrations: Google Gemini, AcoustID, Spotify, Last.fm, Discogs, AudD, Hugging Face.

## Environment Setup
- All API keys and secrets must be set in `.env.local` (see example below).
- To run locally:
  1. Install Node.js (LTS recommended)
  2. Run `npm install`
  3. Set API keys in `.env.local`
  4. Start with `npm run dev`

### Example `.env.local`
```
GEMINI_API_KEY=... # Google Gemini
ACOUSTID_CLIENT_ID=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
LASTFM_API_KEY=...
DISCOGS_CONSUMER_KEY=...
DISCOGS_CONSUMER_SECRET=...
AUDD_API_TOKEN=...
HUGGINGFACE_TOKEN=...
```

## Architecture & Patterns
- Main UI logic: `utils/App.tsx`, components in `components/`
- Service integrations: `services/` (one file per external API)
- Batch processing, export, and analysis logic is in `App.tsx` and `export.ts`
- Metadata structure: see `types.ts` for all supported fields
- No server-side code; all API calls are made from the frontend

## Changing Gemini to Another AI
- The Gemini integration is in `services/geminiService.ts`.
- To use another AI (e.g., OpenAI, Hugging Face):
  1. Create a new service file (e.g., `services/openAiService.ts`)
  2. Implement API calls and response handling for the new AI
  3. Update `App.tsx` and any components to use the new service
  4. Add new API keys to `.env.local` as needed
- Example: Replace Gemini calls with OpenAI by swapping import and usage in `App.tsx`.

## Developer Workflow
- Use Vite scripts: `npm run dev`, `npm run build`, `npm run preview`
- All tests (if present) are in `components/*.test.tsx` and `services/*.test.ts`
- No backend, so debugging is focused on frontend and API responses

## Conventions
- All API keys/secrets are loaded from `.env.local` and injected via Vite config
- Service files encapsulate all external API logic
- Batch operations and exports use utility functions in `export.ts`
- Metadata fields are mapped for compatibility with tools like Mp3tag (see `mp3tag_mapping.txt`)

## Key Files
- `utils/App.tsx` – main app logic
- `services/` – API integrations
- `types.ts` – metadata and data structures
- `export.ts` – export logic (CSV/JSON)
- `components/` – UI components

---
For further integration or migration to another AI, follow the service pattern in `services/geminiService.ts` and update usage in the main app logic.
