from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


def _normalize_db_url(url: str) -> str:
    """Pastikan URL memakai driver psycopg 3.

    Penyedia seperti Neon/Render memberi string "postgresql://...". SQLAlchemy
    menerjemahkan itu ke driver default (psycopg2). Kita paksa ke psycopg 3
    agar sesuai dependency, sehingga string dari penyedia bisa ditempel apa adanya.
    """
    if url.startswith("postgresql+"):
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    if url.startswith("postgres://"):  # beberapa penyedia memakai alias ini
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    return url


engine = create_engine(
    _normalize_db_url(settings.database_url), echo=False, pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class untuk semua model SQLAlchemy."""


def get_db() -> Generator[Session, None, None]:
    """Dependency FastAPI untuk sesi database per-request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
