from fastapi import FastAPI
from app.routes import (
    proxy_router,
    spotify_router,
    lastfm_router,
    discogs_router,
    audd_router,
    auth_router,
    history_router,
    quota_router,
    batch_router,
    tagging_router,
    ddex_router,
    analysis_router,
    generative_router,
    health_router,
    mir_router,
)

app = FastAPI()

app.include_router(proxy_router)
app.include_router(health_router)
app.include_router(mir_router)
app.include_router(spotify_router)
app.include_router(lastfm_router)
app.include_router(discogs_router)
app.include_router(audd_router)
app.include_router(auth_router)
app.include_router(history_router)
app.include_router(quota_router)
app.include_router(batch_router)
app.include_router(tagging_router)
app.include_router(ddex_router)
app.include_router(analysis_router)
app.include_router(generative_router)


from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# ... (routers included above)

# Serve React Frontend (SPA)
# In Docker, we copy 'dist' to 'static' folder.
STATIC_DIR = "static"

if os.path.exists(STATIC_DIR):
    # Mount assets directly to handle /assets requests
    app.mount("/assets", StaticFiles(directory=f"{STATIC_DIR}/assets"), name="assets")
    
    # Catch-all for SPA routing (must be last)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # If API path passed through, return 404 (handled by routers if matched, here means no match)
        # But wait, we want to serve index.html for unknown paths (client-side routing)
        # However, we don't want to serve index.html for missing API endpoints?
        # A simple heuristic: if it looks like a file extension, 404. Else index.html.
        
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/")
def read_root():
    if os.path.exists(os.path.join(STATIC_DIR, "index.html")):
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
    return {"message": "Music Metadata Engine Backend is running. Frontend not found."}
