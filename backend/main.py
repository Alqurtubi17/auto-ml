# backend/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import builds
from services.build_store import db

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Menyala: Koneksi ke Neon.tech
    if not db.is_connected():
        await db.connect()
    yield
    # Mati: Putus koneksi
    if db.is_connected():
        await db.disconnect()

app = FastAPI(
    title="WebForge AI - ML Platform",
    version="2.0.0",
    docs_url="/docs",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hanya aktifkan router builds (ML)
app.include_router(builds.router, prefix="/api/builds", tags=["builds"])

@app.get("/healthz")
def health() -> dict:
    return {"ok": True, "env": settings.app_env}