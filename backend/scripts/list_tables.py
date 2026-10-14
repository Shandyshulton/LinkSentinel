"""Daftar tabel di database linksentinel beserta jumlah baris & kolomnya."""

import sys
from urllib.parse import urlparse

import psycopg

sys.path.insert(0, ".")
from app.config import settings  # noqa: E402

url = settings.database_url.replace("postgresql+psycopg://", "postgresql://")
p = urlparse(url)

conn = psycopg.connect(
    host=p.hostname,
    port=p.port or 5432,
    user=p.username,
    password=p.password or "",
    dbname=p.path.lstrip("/"),
)

tables = conn.execute(
    "SELECT table_name FROM information_schema.tables "
    "WHERE table_schema = 'public' ORDER BY table_name"
).fetchall()

print(f"Jumlah tabel: {len(tables)}\n")
for (name,) in tables:
    rows = conn.execute(f'SELECT count(*) FROM "{name}"').fetchone()[0]
    cols = conn.execute(
        "SELECT column_name, data_type FROM information_schema.columns "
        "WHERE table_name = %s ORDER BY ordinal_position",
        (name,),
    ).fetchall()
    print(f"- {name}  ({rows} baris)")
    for col, dtype in cols:
        print(f"    · {col}: {dtype}")
    print()

conn.close()
