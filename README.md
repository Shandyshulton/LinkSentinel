# LinkSentinel

Phishing Website Detector — menilai indikasi phishing sebuah URL tanpa
membukanya, lalu menyajikan tingkat risiko (rendah / mencurigakan / tinggi)
beserta alasannya.

> Penilaian membantu mengenali indikasi phishing, bukan menjamin keamanan URL.

## Arsitektur

| Lapisan | Teknologi |
|---------|-----------|
| Frontend | React + Vite + TypeScript (12 layar mobile) |
| Backend | Python + FastAPI |
| Database | PostgreSQL (SQLAlchemy + psycopg 3) |
| Deteksi | Heuristik rule-based (modular, siap ditambah API eksternal) |

```
LinkSentinel/
├── backend/     # API FastAPI + logika deteksi + model DB
├── frontend/    # Aplikasi React (desain Figma High Fidelity)
└── .figma-ref/  # Screenshot referensi desain
```

## Menjalankan

Butuh **dua terminal**. Backend lebih dulu, lalu frontend.

### 1. Backend (http://localhost:8000)

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env           # sesuaikan DATABASE_URL bila perlu
.\.venv\Scripts\python.exe scripts\create_db.py
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

PostgreSQL diharapkan berjalan di `localhost:5433` (default Laragon), user
`postgres` tanpa password. Ubah `backend/.env` bila berbeda.

### 2. Frontend (http://localhost:5173)

```powershell
cd frontend
npm install
npm run dev
```

Buka http://localhost:5173. Panggilan API otomatis diproksikan ke backend.

## Cara kerja deteksi

Logika ada di `backend/app/services/detector.py`. Setiap aturan heuristik
menambah bobot risiko dan satu alasan berbahasa Indonesia; total bobot dipetakan
ke tiga tingkat:

- **Rendah (1)** — tidak ada indikasi kuat
- **Mencurigakan (2)** — ada tanda yang perlu diwaspadai (mis. nuansa promosi/hadiah, tautan pendek)
- **Tinggi (3)** — indikasi kuat phishing (mis. domain di daftar hitam, pola verifikasi akun, IP langsung)

Untuk menambah sumber eksternal (mis. Google Safe Browsing / VirusTotal),
tambahkan aturan di `detector.py` tanpa mengubah router atau frontend.

## Contoh URL untuk uji coba

| URL | Hasil |
|-----|-------|
| `https://id.wikipedia.org` | Risiko rendah |
| `https://promo-hadiah.example/claim` | Mencurigakan |
| `https://verifikasi-akun.example/login` | Risiko tinggi |
| `bukan-url` | URL tidak valid |
