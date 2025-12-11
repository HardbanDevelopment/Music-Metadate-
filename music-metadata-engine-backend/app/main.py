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


@app.get("/")
def read_root():
    return {"message": "Music Metadata Engine Backend is running"}
    
# Force reload for env vars

