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

> Jika sebelumnya sudah pernah membuat tabel `checks` tanpa kolom `owner_id`,
> jalankan sekali: `.\.venv\Scripts\python.exe scripts\migrate_owner_id.py`

## Identitas perangkat (pemisahan riwayat)

Setiap pemeriksaan diikat ke sebuah **ID perangkat anonim** yang dikirim klien
lewat header `X-Device-Id` (UUID yang dibuat & disimpan di `localStorage`
frontend). Semua endpoint `checks` dan `stats` memfilter berdasarkan ID ini,
sehingga riwayat satu pengguna tidak muncul di pengguna lain.

Catatan: ini **bukan autentikasi**, hanya pemisah tampilan. ID dikirim dari
klien sehingga bisa dipalsukan; untuk privasi sungguhan diperlukan login.
Request tanpa header `X-Device-Id` yang valid ditolak dengan `400`.

### Privasi log

Access log uvicorn dimatikan saat startup (`app/main.py`) agar URL yang
diperiksa dan header perangkat tidak pernah tercatat ke konsol/log.

## Endpoint

Semua endpoint di bawah (kecuali health) memerlukan header `X-Device-Id`.

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/health` | Health check (tanpa header) |
| POST | `/api/checks` | Periksa sebuah URL (body `{"url": "..."}`) |
| GET | `/api/checks` | Daftar riwayat device ini (filter: `risk_level`, `status`, `q`) |
| GET | `/api/checks/{id}` | Detail satu hasil (hanya milik device ini) |
| DELETE | `/api/checks` | Hapus riwayat device ini |
| GET | `/api/stats` | Ringkasan statistik device ini |
| GET | `/api/settings` | Baca preferensi |
| PATCH | `/api/settings` | Ubah preferensi |

## Tingkat risiko

Hasil `risk_level`: `low` (1), `suspicious` (2), `high` (3), atau `null` bila `status = "failed"`.

Logika heuristik ada di `app/services/detector.py` dan dirancang modular —
tambahkan aturan baru atau integrasi API eksternal (mis. Google Safe Browsing)
di sana tanpa mengubah router.
