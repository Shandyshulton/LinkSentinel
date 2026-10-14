import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Screen } from "../components/Screen";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/Button";
import { HistoryRow } from "../components/HistoryRow";
import { api } from "../api/client";
import type { Check, Stats } from "../types";
import styles from "./HomePage.module.css";

interface LocationState {
  prefillUrl?: string;
}

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as LocationState | null)?.prefillUrl;

  const [url, setUrl] = useState(prefill ?? "");
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<Check[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.listChecks(), api.getStats()])
      .then(([checks, s]) => {
        if (!active) return;
        setRecent(checks.slice(0, 3));
        setStats(s);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError(null);
      }
    } catch {
      setError("Tidak dapat membaca papan klip. Tempel manual.");
    }
  };

  const handleCheck = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Masukkan URL terlebih dahulu.");
      return;
    }
    // Validasi akhir dilakukan di layar pemeriksaan (memanggil API).
    navigate("/checking", { state: { url: trimmed } });
  };

  const hasHistory = !loading && recent.length > 0;

  const resultsAvailable = stats?.results_available ?? 0;
  const totalAttempts = stats?.total_attempts ?? 0;
  const failed = stats?.failed_count ?? 0;

  return (
    <Screen showNav>
      <PageHeader title="LinkSentinel" />

      <div className={styles.body}>
        <p className={styles.intro}>
          {hasHistory
            ? "Periksa tautan baru atau tinjau hasil pemeriksaan sebelumnya."
            : "Punya tautan dari pesan atau email? Periksa indikasi phishing terlebih dahulu."}
        </p>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="url">
            URL yang ingin diperiksa
          </label>
          <input
            id="url"
            className={styles.input}
            placeholder="https://contoh.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <p className={styles.hint}>
              Tempel tautan lengkap. Tanpa https:// pun bisa — otomatis
              dianggap https://.
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={handlePaste}>
            Tempel
          </Button>
          <Button onClick={handleCheck}>Periksa URL</Button>
        </div>

        {hasHistory ? (
          <>
            <div className={styles.statPanel}>
              <div className={styles.statItem}>
                <div className={styles.statNum}>{totalAttempts}</div>
                <div className={styles.statLabel}>Total percobaan</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNum}>{resultsAvailable}</div>
                <div className={styles.statLabel}>
                  Hasil tersedia{failed > 0 ? ` · ${failed} gagal` : ""}
                </div>
              </div>
            </div>

            <div>
              <div className={styles.recentHead}>
                <h2 className={styles.recentTitle}>Terakhir diperiksa</h2>
                <button
                  className={styles.seeAll}
                  onClick={() => navigate("/history")}
                >
                  Lihat semua
                </button>
              </div>
              {recent.map((c) => (
                <HistoryRow key={c.id} check={c} />
              ))}
            </div>

            <p className={styles.disclaimer}>
              Hasil risiko rendah bukan jaminan keamanan. Tetap periksa alamat
              situs sebelum masuk.
            </p>
          </>
        ) : (
          <>
            <div className={styles.emptyCard}>
              <div className={styles.emptyTitle}>Belum ada pemeriksaan</div>
              <div className={styles.emptyText}>
                Riwayat Anda masih kosong. Hasil pemeriksaan pertama akan muncul
                di sini.
              </div>
              <div className={styles.emptyMuted}>
                Mulai dengan menempelkan URL pada kolom di atas.
              </div>
            </div>

            <div className={styles.guide}>
              <h2 className={styles.guideTitle}>Cara memeriksa</h2>
              <ol className={styles.guideList}>
                <li>Salin URL tanpa membukanya.</li>
                <li>Tempel URL, lalu pilih Periksa URL.</li>
                <li>Baca hasil dan alasan tingkat risikonya.</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
