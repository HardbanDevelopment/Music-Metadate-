# Test Suite Plan for Music Metadata Engine

## Goal
Create a comprehensive automated test suite covering both the **frontend** (React/Vite) and the **backend** (FastAPI) of the `music-metadata-engine` project.

## Recommended Tools
- **Backend (Python)**: pytest, httpx, pytest-asyncio, coverage
- **Frontend (TypeScript/React)**: jest, @testing-library/react, @testing-library/jest-dom, eslint-plugin-testing-library
- **E2E**: Playwright (or Cypress)
- **CI**: GitHub Actions

## Structure
```
music-metadata-engine-backend/
  tests/
    conftest.py
    test_api.py
music-metadata-engine/
  src/components/__tests__/
    DashboardStats.test.tsx
  e2e/tests/app.spec.ts
```

## Sample Files
- `conftest.py` creates an AsyncClient fixture.
- `test_api.py` includes a health‑check test.
- `DashboardStats.test.tsx` checks component rendering.
- `app.spec.ts` runs a full flow: start dev server, upload MP3, verify metadata.

## CI Workflow (`.github/workflows/ci.yml`)
Runs backend tests with coverage and frontend/unit + Playwright E2E on every push/PR.

## Getting Started
1. Add the test directories and sample files.
2. Install dependencies:
   ```bash
   # Backend
   cd music-metadata-engine-backend && pip install -r requirements.txt pytest httpx pytest-asyncio coverage
   # Frontend
   cd .. && npm install --save-dev jest @testing-library/react @testing-library/jest-dom playwright
   ```
3. Run locally:
   - Backend: `pytest`
   - Frontend unit: `npm test`
   - E2E: `npx playwright test`
4. Commit and push – CI will run automatically.
