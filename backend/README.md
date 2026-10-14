# LinkSentinel — Backend (FastAPI)

API deteksi phishing berbasis heuristik untuk aplikasi LinkSentinel.

## Stack

- Python + FastAPI
- SQLAlchemy 2.x + PostgreSQL (psycopg 3)
- Pydantic v2

## Prasyarat

- Python 3.14 (dites dengan 3.14.6)
- PostgreSQL berjalan (Laragon default: `localhost:5433`, user `postgres`, tanpa password)

## Setup

```powershell
# dari folder backend/
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

# salin konfigurasi dan sesuaikan bila perlu
Copy-Item .env.example .env

# buat database
.\.venv\Scripts\python.exe scripts\create_db.py

# jalankan server (tabel dibuat otomatis saat startup)
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Dokumentasi interaktif: http://localhost:8000/docs

## Endpoint

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/health` | Health check |
| POST | `/api/checks` | Periksa sebuah URL (body `{"url": "..."}`) |
| GET | `/api/checks` | Daftar riwayat (filter: `risk_level`, `status`, `q`) |
| GET | `/api/checks/{id}` | Detail satu hasil |
| DELETE | `/api/checks` | Hapus semua riwayat |
| GET | `/api/stats` | Ringkasan statistik |
| GET | `/api/settings` | Baca preferensi |
| PATCH | `/api/settings` | Ubah preferensi |

## Tingkat risiko

Hasil `risk_level`: `low` (1), `suspicious` (2), `high` (3), atau `null` bila `status = "failed"`.

Logika heuristik ada di `app/services/detector.py` dan dirancang modular —
tambahkan aturan baru atau integrasi API eksternal (mis. Google Safe Browsing)
di sana tanpa mengubah router.
