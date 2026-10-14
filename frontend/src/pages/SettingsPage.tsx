import { useEffect, useState } from "react";
import { Screen } from "../components/Screen";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/Button";
import { Toggle } from "../components/Toggle";
import { api } from "../api/client";
import type { Settings } from "../types";
import styles from "./SettingsPage.module.css";

type PrefKey = keyof Settings;

const PREFS: { key: PrefKey; name: string; desc: string }[] = [
  {
    key: "save_history",
    name: "Simpan riwayat",
    desc: "Nonaktif: berhenti simpan hasil baru; riwayat lama tetap ada.",
  },
  {
    key: "risk_warnings",
    name: "Peringatan risiko",
    desc: "Hanya pengingat tambahan; label risiko dan saran keselamatan tetap tampil.",
  },
  {
    key: "reminder_notifications",
    name: "Notifikasi pengingat",
    desc: "Ingatkan untuk memeriksa tautan sebelum membukanya.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: '"Tidak tersedia di wilayah Anda" apakah phishing?',
    a: "Bukan. Pesan itu adalah pembatasan wilayah (geo-blocking) yang legal, misalnya karena lisensi konten atau regulasi. Situs justru menolak memberi akses, bukan meminta data Anda. LinkSentinel tidak membuka URL, jadi status ini di luar pemeriksaan dan bukan tanda phishing.",
  },
  {
    q: "Apakah LinkSentinel membuka tautannya?",
    a: "Tidak. Aplikasi hanya menganalisis pola alamat URL (domain, kata kunci, HTTPS), tanpa pernah mengunjungi situsnya. Ini menjaga Anda dari risiko membuka tautan berbahaya.",
  },
  {
    q: "Risiko rendah berarti pasti aman?",
    a: "Tidak. Risiko rendah hanya berarti tidak ditemukan indikasi phishing yang kuat dari pola URL. Tetap cocokkan alamat situs dan berhati-hati sebelum memasukkan data pribadi.",
  },
];

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [clearing, setClearing] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    api.getSettings().then((s) => active && setSettings(s));
    return () => {
      active = false;
    };
  }, []);

  const toggle = async (key: PrefKey) => {
    if (!settings) return;
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next); // optimistik
    try {
      await api.updateSettings({ [key]: next[key] });
    } catch {
      setSettings(settings); // kembalikan bila gagal
    }
  };

  const handleClear = async () => {
    const ok = window.confirm(
      "Hapus semua riwayat? Hasil dan upaya gagal akan dihapus dan statistik direset. Tidak dapat dipulihkan.",
    );
    if (!ok) return;
    setClearing(true);
    try {
      await api.clearHistory();
    } finally {
      setClearing(false);
    }
  };

  return (
    <Screen showNav>
      <PageHeader title="Pengaturan" />

      <div className={styles.body}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Pemeriksaan dan privasi</h2>
          {PREFS.map((p) => {
            const value = settings?.[p.key] ?? false;
            return (
              <div key={p.key} className={styles.pref}>
                <div className={styles.prefText}>
                  <div className={styles.prefName}>{p.name}</div>
                  <div className={styles.prefDesc}>{p.desc}</div>
                </div>
                <div className={styles.prefControl}>
                  <Toggle
                    checked={value}
                    onChange={() => toggle(p.key)}
                    label={p.name}
                  />
                  <span className={styles.prefState}>
                    {value ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Data pemeriksaan</h2>
          <Button variant="secondary" fullWidth onClick={handleClear} disabled={clearing}>
            {clearing ? "Menghapus…" : "Hapus semua riwayat"}
          </Button>
          <p className={styles.dangerNote}>
            Perlu konfirmasi. Hapus hasil dan upaya gagal, reset statistik. Tidak
            dapat dipulihkan.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Tanya jawab</h2>
          <div className={styles.faqList}>
            {FAQS.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className={styles.faqItem}>
                  <button
                    className={styles.faqQuestion}
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span>{item.q}</span>
                    <span className={styles.faqChevron} data-open={open}>
                      ⌄
                    </span>
                  </button>
                  {open && <p className={styles.faqAnswer}>{item.a}</p>}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.about}>
          <h2 className={styles.aboutTitle}>Tentang LinkSentinel</h2>
          <p className={styles.aboutLine}>Versi 1.0 · Bahasa Indonesia</p>
          <a className={styles.aboutLink} href="#" onClick={(e) => e.preventDefault()}>
            Kebijakan privasi →
          </a>
          <p className={styles.aboutDisclaimer}>
            Penilaian membantu mengenali indikasi phishing, bukan menjamin
            keamanan URL.
          </p>
        </div>
      </div>
    </Screen>
  );
}
