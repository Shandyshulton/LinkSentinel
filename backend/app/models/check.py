from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Check(Base):
    """Satu catatan hasil pemeriksaan sebuah URL."""

    __tablename__ = "checks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    domain: Mapped[str] = mapped_column(String(512), nullable=False)

    # Status: "completed" (ada penilaian) atau "failed" (pemeriksaan gagal)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="completed")

    # Tingkat risiko: "low" | "suspicious" | "high" | None (jika gagal)
    risk_level: Mapped[str | None] = mapped_column(String(16), nullable=True)
    # Skor numerik 1..3 sesuai desain (1=rendah, 2=mencurigakan, 3=tinggi)
    risk_score: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Alasan penilaian (JSON string berisi list alasan)
    reasons: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Pesan error bila status failed
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
