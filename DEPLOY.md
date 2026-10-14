# Panduan Deploy LinkSentinel (Gratis)

Arsitektur deploy:

- **Frontend** → Vercel
- **Backend** → Render (Web Service, plan Free)
- **Database** → Neon (PostgreSQL, plan Free)

> Semua langkah pakai tier gratis. Dua catatan: backend Render **tidur setelah
> ~15 menit idle** (request pertama lambat/cold start), dan database Neon
> **scale-to-zero** setelah idle. Wajar untuk demo/portofolio.

Prasyarat: kode sudah di GitHub (repo `LinkSentinel`), dan Anda punya akun
Vercel, Render, serta Neon (bisa daftar pakai akun GitHub).

---

## Langkah 1 — Database di Neon

1. Buka https://neon.com → **Sign up** (pakai GitHub).
2. **Create project** → beri nama `linksentinel`, pilih region terdekat
   (mis. Singapore), biarkan versi Postgres default.
3. Setelah dibuat, buka **Connection string** (atau menu **Connect**).
4. Salin string berbentuk:
   ```
   postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
   Simpan — ini akan jadi `DATABASE_URL` di Render.

Tidak perlu membuat database/tabel manual. Backend membuat tabel otomatis saat
start pertama. (Kode sudah menormalkan `postgresql://` → driver psycopg dan
mempertahankan `sslmode=require`.)

---

## Langkah 2 — Backend di Render

### Cara A: via Blueprint (otomatis, pakai `render.yaml`)

1. Buka https://render.com → **Sign up** (GitHub).
2. **New** → **Blueprint** → pilih repo `LinkSentinel`.
3. Render membaca `render.yaml` dan menyiapkan service `linksentinel-api`.
4. Saat diminta, isi environment variables:
   - `DATABASE_URL` → tempel connection string Neon dari Langkah 1.
   - `FRONTEND_ORIGIN` → **isi sementara** `http://localhost:5173`
     (nanti diperbarui setelah tahu URL Vercel).
5. Klik **Apply** / **Create**. Tunggu build selesai.

### Cara B: manual (tanpa Blueprint)

1. **New** → **Web Service** → connect repo `LinkSentinel`.
2. Isi:
   - **Root Directory**: `backend`
   - **Runtime**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/health`
   - **Instance Type**: Free
3. **Environment** → tambah:
   - `DATABASE_URL` = connection string Neon
   - `FRONTEND_ORIGIN` = `http://localhost:5173` (sementara)
4. **Create Web Service**.

Setelah live, catat URL backend, mis.:
```
https://linksentinel-api.onrender.com
```
Uji di browser: `https://linksentinel-api.onrender.com/api/health`
→ harus menampilkan `{"status":"ok","app":"LinkSentinel"}`.

---

## Langkah 3 — Frontend di Vercel

1. Buka https://vercel.com → **Add New** → **Project** → import repo `LinkSentinel`.
2. Pada konfigurasi:
   - **Root Directory**: `frontend`
   - Framework otomatis terdeteksi **Vite** (biarkan default build/output).
3. **Environment Variables** → tambah:
   - `VITE_API_BASE` = URL backend Render dari Langkah 2
     (mis. `https://linksentinel-api.onrender.com`, tanpa trailing slash).
4. **Deploy**. Setelah selesai, catat URL frontend, mis.:
   ```
   https://linksentinel.vercel.app
   ```

---

## Langkah 4 — Hubungkan CORS (penting!)

Backend harus mengizinkan origin Vercel, kalau tidak browser memblokir request.

1. Kembali ke **Render** → service `linksentinel-api` → **Environment**.
2. Ubah `FRONTEND_ORIGIN` menjadi URL Vercel (boleh beberapa, pisah koma):
   ```
   https://linksentinel.vercel.app,http://localhost:5173
   ```
3. Simpan → Render otomatis redeploy.

---

## Langkah 5 — Uji end-to-end

1. Buka URL Vercel.
2. Periksa sebuah URL (mis. `verifikasi-akun.example/login`).
   - Request pertama bisa lambat bila backend sedang "tidur" — tunggu.
3. Pastikan hasil muncul, riwayat tersimpan, statistik terisi.
4. Buka DevTools (F12) → tab **Network** → tidak ada error CORS; request
   mengarah ke domain Render.

---

## Troubleshooting

| Gejala | Penyebab & solusi |
|--------|-------------------|
| Error CORS di konsol browser | `FRONTEND_ORIGIN` di Render belum berisi URL Vercel yang tepat (harus persis, tanpa trailing slash). |
| Request pertama lama lalu normal | Cold start Render Free (idle > 15 mnt). Normal. |
| 500 saat pertama kali | Biasanya `DATABASE_URL` salah. Pastikan string Neon lengkap termasuk `?sslmode=require`. |
| Frontend tetap panggil localhost | `VITE_API_BASE` belum di-set di Vercel, atau belum redeploy setelah menambah env. |
| 400 "Header perangkat tidak valid" | Normal bila memanggil API langsung tanpa header `X-Device-Id`. Frontend mengirimnya otomatis. |

## Setelah update kode

- Push ke branch `main` → **Vercel dan Render otomatis redeploy** (keduanya
  terhubung ke GitHub).
- Perubahan skema database: untuk saat ini tabel dibuat otomatis saat start.
  Perubahan kolom pada tabel yang sudah ada memerlukan migrasi manual
  (lihat `backend/scripts/`).
