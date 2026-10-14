from sqlalchemy import Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Setting(Base):
    """Preferensi aplikasi (single-row). Mencerminkan layar Pengaturan."""

    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)

    # Simpan riwayat: jika nonaktif, hasil baru tidak disimpan
    save_history: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    # Peringatan risiko tambahan
    risk_warnings: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    # Notifikasi pengingat
    reminder_notifications: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
