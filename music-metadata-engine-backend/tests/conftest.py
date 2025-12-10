import pytest
import pytest_asyncio
import sys
import os
from httpx import AsyncClient, ASGITransport

# Ensure the parent directory (containing the 'app' package) is on the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

@pytest_asyncio.fixture
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        yield ac
