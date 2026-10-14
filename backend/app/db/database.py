from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

engine = create_engine(settings.database_url, echo=False, pool_pre_ping=True)
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
