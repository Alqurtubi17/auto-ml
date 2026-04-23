from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import builds
from services.build_store import store

# 🔥 optional queue + websocket
try:
    from services.queue import start_worker
except:
    start_worker = None

try:
    from services.ws_manager import router as ws_router
except:
    ws_router = None


app = FastAPI(title="LarikAI API", version="1.0.0")


# 🌐 CORS (biar frontend bisa akses)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 🔌 ROUTERS
# Sekarang semua fitur (Create, Get, Predict, Download) berpusat rapi di builds
app.include_router(builds.router, prefix="/api/v1/builds", tags=["builds"])

if ws_router:
    app.include_router(ws_router, prefix="/ws", tags=["websocket"])


# 🚀 STARTUP
@app.on_event("startup")
async def startup():
    print("🚀 Starting LarikAI backend...")

    # ✅ connect DB sekali
    await store.connect()

    # ✅ start worker queue (kalau ada)
    if start_worker:
        import asyncio
        asyncio.create_task(start_worker())
        print("⚡ Queue worker started")

    print("✅ Backend ready")


# ❤️ HEALTH CHECK
@app.get("/")
async def root():
    return {"status": "ok", "message": "LarikAI API running"}