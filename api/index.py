import sys
import os

# Add the backend directory to sys.path
# Using relative path from ./api/index.py to ./music-metadata-engine-backend
# Vercel places function in /var/task/api/index.py (usually)
# or project root /var/task/
# We need to find music-metadata-engine-backend relative to PROJECT ROOT.

# current file is in /api/index.py
# project root is ..
backend_path = os.path.join(os.path.dirname(__file__), '..', 'music-metadata-engine-backend')
sys.path.append(backend_path)

from app.main import app
