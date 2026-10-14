const STORAGE_KEY = "ls_device_id";

/**
 * ID perangkat anonim untuk memisahkan riwayat antar pengguna di perangkat/
 * browser yang berbeda. Dibuat sekali lalu disimpan di localStorage.
 *
 * Catatan privasi: nilai ini TIDAK boleh dicatat ke console atau dikirim ke
 * pihak ketiga. Hanya dikirim ke backend LinkSentinel lewat header X-Device-Id.
 * Ini bukan autentikasi — hanya pemisah tampilan, bukan jaminan keamanan.
 */
export function getDeviceId(): string {
  let id: string | null = null;
  try {
    id = localStorage.getItem(STORAGE_KEY);
  } catch {
    // localStorage bisa tidak tersedia (mode privat ketat). Pakai nilai sesi.
  }

  if (!id) {
    id = generateUuid();
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Abaikan: tetap kembalikan id untuk sesi berjalan.
    }
  }
  return id;
}

function generateUuid(): string {
  // Pakai crypto.randomUUID bila tersedia; fallback untuk lingkungan lama.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
