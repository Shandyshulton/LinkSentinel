import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import Base, engine
from app.routers import checks, settings as settings_router, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Matikan access log uvicorn agar URL yang diperiksa dan header perangkat
    # tidak pernah tercatat ke konsol/log. Request tetap diproses normal.
    logging.getLogger("uvicorn.access").disabled = True

    # Buat tabel saat startup (cukup untuk pengembangan; produksi gunakan migrasi).
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="LinkSentinel API",
    description="Backend deteksi phishing untuk aplikasi LinkSentinel.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(checks.router)
app.include_router(settings_router.router)
app.include_router(stats.router)


@app.get("/api/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok", "app": "LinkSentinel"}
