# LinkSentinel — Frontend (React + Vite)

Antarmuka mobile LinkSentinel: 12 layar sesuai desain Figma High Fidelity.

## Stack

- React 18 + TypeScript
- Vite 6
- React Router 6
- CSS Modules + design tokens (`src/styles/tokens.css`)

## Setup

```powershell
# dari folder frontend/
npm install
npm run dev
```

Buka http://localhost:5173. Permintaan `/api/*` diproksikan ke backend
(`http://127.0.0.1:8000`) lewat konfigurasi di `vite.config.ts`, jadi backend
harus berjalan lebih dulu.

## Script

- `npm run dev` — server pengembangan
- `npm run build` — type-check + build produksi ke `dist/`
- `npm run preview` — pratinjau hasil build

## Peta layar → rute

| # | Layar | Rute |
|---|-------|------|
| 01 | Pembuka | `/` |
| 02–03 | Beranda (kosong / ada riwayat) | `/home` |
| 04 | Pemeriksaan berlangsung | `/checking` |
| 05 | Pemeriksaan gagal | `/checking` (state gagal) |
| 06–08 | Hasil (rendah/mencurigakan/tinggi) | `/result/:id` |
| 09 | URL tidak valid | `/checking` (state invalid) |
| 10 | Riwayat | `/history` |
| 11 | Statistik | `/stats` |
| 12 | Pengaturan | `/settings` |

## Struktur

```
src/
├── api/client.ts        # Pemanggil REST ke backend
├── components/          # Komponen UI reusable (Button, Toggle, nav, dll)
├── lib/                 # Helper risiko & format tanggal
├── pages/               # Satu file per layar
├── styles/              # tokens.css + global.css
└── types/               # Tipe bersama (Check, Stats, Settings)
```
