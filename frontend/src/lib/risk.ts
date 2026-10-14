import type { RiskLevel } from "../types";

export interface RiskMeta {
  label: string;
  score: number;
  colorVar: string;
  bgVar: string;
  borderVar: string;
}

export const RISK_META: Record<RiskLevel, RiskMeta> = {
  low: {
    label: "Risiko rendah",
    score: 1,
    colorVar: "var(--color-low)",
    bgVar: "var(--color-low-bg)",
    borderVar: "var(--color-low-border)",
  },
  suspicious: {
    label: "Mencurigakan",
    score: 2,
    colorVar: "var(--color-suspicious)",
    bgVar: "var(--color-suspicious-bg)",
    borderVar: "var(--color-suspicious-border)",
  },
  high: {
    label: "Risiko tinggi",
    score: 3,
    colorVar: "var(--color-high)",
    bgVar: "var(--color-high-bg)",
    borderVar: "var(--color-high-border)",
  },
};

/** Judul besar pada kartu hasil (sesuai desain). */
export const RISK_HEADLINE: Record<RiskLevel, string> = {
  low: "Risiko rendah",
  suspicious: "Mencurigakan",
  high: "Risiko tinggi",
};

/** Ringkasan singkat di bawah judul kartu hasil. */
export const RISK_SUMMARY: Record<RiskLevel, string> = {
  low: "Tidak ditemukan indikasi phishing yang kuat pada pemeriksaan ini.",
  suspicious:
    "Ada indikasi yang perlu diwaspadai. Bukti belum cukup untuk menilai risiko tinggi.",
  high: "Ditemukan beberapa indikasi kuat phishing. Hindari membuka tautan ini.",
};

/** Judul blok panduan di bawah "Dasar penilaian" (berbeda per tingkat). */
export const RISK_GUIDE_TITLE: Record<RiskLevel, string> = {
  low: "Langkah berikutnya",
  suspicious: "Langkah berikutnya",
  high: "Jangan lanjutkan ke tautan ini",
};

/** Isi panduan tindak lanjut per tingkat risiko. */
export const RISK_GUIDE_TEXT: Record<RiskLevel, string> = {
  low: "Tetap cocokkan alamat situs dan berhati-hati sebelum mengisi data pribadi. Risiko rendah tidak berarti pasti aman.",
  suspicious:
    "Jangan isi data pribadi dulu. Konfirmasikan tautan kepada pengirim melalui saluran resmi.",
  high: "Jangan masukkan kata sandi, OTP, atau data keuangan. Akses layanan lewat aplikasi atau alamat resminya.",
};
