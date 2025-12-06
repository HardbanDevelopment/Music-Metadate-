# Run Music Metadata Engine locally

## Goal Description
Run the existing Vite + React application locally to verify it starts correctly and serves the UI.

## Proposed Changes
No source code changes are required. The task consists of installing dependencies and starting the development server.

### Commands to execute
- `npm install` – install all project dependencies.
- `npm run dev` – start the Vite development server (default URL http://localhost:5173).

## Verification Plan
### Automated Steps
1. Execute `npm install` in the project root and ensure it exits with status 0.
2. Execute `npm run dev` and confirm the console output contains a line like `Local: http://localhost:5173/`.
3. Optionally, make a simple HTTP request to `http://localhost:5173` and verify a 200 response (can be done with `curl`).

### Manual Steps
1. Open a web browser and navigate to the URL printed by the dev server (usually http://localhost:5173).
2. Confirm the React UI loads without errors (no red error overlay in the browser console).

---
