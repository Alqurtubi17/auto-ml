from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import templates, builds
from routers.preview import router as preview_router

settings = get_settings()  
print(f"DEBUG: CORS Origins are: {settings.cors_origins}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="WebForge AI",
    version="1.0.0",
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

app.include_router(templates.router, prefix="/api/templates", tags=["templates"])
app.include_router(builds.router, prefix="/api/builds", tags=["builds"])
app.include_router(preview_router, tags=["preview"])


@app.get("/healthz")
def health() -> dict:
    return {"ok": True, "env": settings.app_env}
