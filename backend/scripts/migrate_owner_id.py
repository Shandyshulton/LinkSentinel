"""Migrasi: tambahkan kolom owner_id ke tabel checks.

Karena data lama hanyalah hasil uji dan tidak punya pemilik, cara teraman:
drop tabel checks lalu buat ulang dari model (sudah menyertakan owner_id).
Jalankan: python scripts/migrate_owner_id.py
"""

import sys

sys.path.insert(0, ".")

from sqlalchemy import inspect  # noqa: E402

from app.db.database import Base, engine  # noqa: E402
from app.models.check import Check  # noqa: E402


def main() -> None:
    inspector = inspect(engine)
    cols = {c["name"] for c in inspector.get_columns("checks")} if inspector.has_table("checks") else set()

    if "owner_id" in cols:
        print("Kolom owner_id sudah ada. Tidak ada yang diubah.")
        return

    print("Menghapus tabel 'checks' lama (berisi data uji) dan membuat ulang…")
    Check.__table__.drop(bind=engine)
    Base.metadata.create_all(bind=engine, tables=[Check.__table__])
    print("Selesai. Tabel 'checks' kini memiliki kolom owner_id.")


if __name__ == "__main__":
    main()
