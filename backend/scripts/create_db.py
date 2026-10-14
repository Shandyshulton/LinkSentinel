"""Buat database 'linksentinel' bila belum ada.

Jalankan: python scripts/create_db.py
Menggunakan parameter koneksi dari DATABASE_URL (.env) namun terhubung ke
database administratif 'postgres' untuk menjalankan CREATE DATABASE.
"""

import sys
from urllib.parse import urlparse

import psycopg

sys.path.insert(0, ".")
from app.config import settings  # noqa: E402


def main() -> None:
    # DATABASE_URL format: postgresql+psycopg://user:pass@host:port/dbname
    url = settings.database_url.replace("postgresql+psycopg://", "postgresql://")
    parsed = urlparse(url)
    target_db = parsed.path.lstrip("/")

    conn = psycopg.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        user=parsed.username,
        password=parsed.password or "",
        dbname="postgres",
        autocommit=True,
    )
    try:
        exists = conn.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s", (target_db,)
        ).fetchone()
        if exists:
            print(f"Database '{target_db}' sudah ada.")
        else:
            conn.execute(f'CREATE DATABASE "{target_db}"')
            print(f"Database '{target_db}' berhasil dibuat.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
