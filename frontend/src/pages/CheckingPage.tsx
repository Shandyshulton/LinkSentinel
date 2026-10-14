import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Screen } from "../components/Screen";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/Button";
import { api, ApiError } from "../api/client";
import styles from "./CheckingPage.module.css";

interface LocationState {
  url?: string;
}

const STAGES = [
  "Memeriksa format URL dan nama domain",
  "Menganalisis indikasi phishing",
  "Menyusun ringkasan tingkat risiko",
];

const STEP_LABELS = [
  "Format URL dan nama domain",
  "Reputasi domain dan pola phishing",
  "Ringkasan tingkat risiko",
];

type Phase = "checking" | "invalid" | "failed";

export function CheckingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const url = (location.state as LocationState | null)?.url;

  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<Phase>("checking");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const cancelled = useRef(false);
  // Penjaga agar POST /checks hanya dikirim sekali per navigasi. Tanpa ini,
  // React StrictMode (dev) menjalankan effect dua kali dan membuat dua record.
  const startedKey = useRef<string | null>(null);

  // location.key berubah tiap navigasi — termasuk "Coba lagi" ke URL yang sama,
  // sehingga effect di bawah dijalankan ulang untuk memulai pemeriksaan baru.
  useEffect(() => {
    if (!url) {
      navigate("/home", { replace: true });
      return;
    }

    // Lewati bila pemeriksaan untuk navigasi ini sudah pernah dimulai.
    if (startedKey.current === location.key) return;
    startedKey.current = location.key;

    cancelled.current = false;
    // Reset state agar retry memulai dari tahap awal.
    setStage(0);
    setPhase("checking");
    setErrorMsg("");

    // Animasikan tahap 1 -> 2 untuk memberi umpan balik visual.
    const t1 = setTimeout(() => !cancelled.current && setStage(1), 700);

    // Jalankan pemeriksaan sebenarnya ke backend.
    const run = async () => {
      try {
        const check = await api.checkUrl(url);
        if (cancelled.current) return;
        setStage(2);
        // Beri jeda singkat agar tahap akhir terlihat, lalu buka hasil.
        setTimeout(() => {
          if (!cancelled.current) {
            navigate(`/result/${check.id}`, {
              replace: true,
              state: { check },
            });
          }
        }, 500);
      } catch (err) {
        if (cancelled.current) return;
        if (err instanceof ApiError && err.status === 422) {
          setPhase("invalid");
          setErrorMsg(err.message);
        } else {
          setPhase("failed");
          setErrorMsg(
            err instanceof Error
              ? err.message
              : "Pemeriksaan gagal. Coba lagi.",
          );
        }
      }
    };
    run();

    // Catatan: cleanup TIDAK menyetel cancelled=true. Pada React StrictMode
    // (dev) effect dijalankan dua kali (mount→cleanup→mount), dan menyetel
    // cancelled di cleanup akan memblokir navigasi ke halaman hasil. Pembatalan
    // nyata hanya dilakukan lewat tombol "Batalkan" (handleCancel). Timer tetap
    // dibersihkan agar tidak bocor.
    return () => {
      clearTimeout(t1);
    };
    // location.key sengaja dimasukkan agar "Coba lagi" (URL sama) memicu ulang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, location.key, navigate]);

  const handleCancel = () => {
    cancelled.current = true;
    navigate("/home", { replace: true });
  };

  // Layar error: URL tidak valid (screen 09) atau pemeriksaan gagal (screen 05)
  if (phase !== "checking") {
    const isInvalid = phase === "invalid";
    return (
      <Screen showNav>
        <PageHeader
          title={isInvalid ? "URL tidak valid" : "Pemeriksaan gagal"}
          showBack
        />
        <div className={styles.body}>
          <div className={styles.field}>
            <div className={styles.urlBox}>{url}</div>
          </div>
          <div className={styles.errorCard}>
            <div className={styles.errorTitle}>
              {isInvalid ? "Alamat tidak dapat diperiksa" : "Pemeriksaan terhenti"}
            </div>
            <div className={styles.errorText}>{errorMsg}</div>
          </div>
          {isInvalid ? (
            <Button
              fullWidth
              onClick={() =>
                navigate("/home", {
                  replace: true,
                  state: { prefillUrl: url },
                })
              }
            >
              Perbaiki URL
            </Button>
          ) : (
            <Button
              fullWidth
              onClick={() =>
                navigate("/checking", { replace: true, state: { url } })
              }
            >
              Coba lagi
            </Button>
          )}
        </div>
      </Screen>
    );
  }

  const progressPct = ((stage + 1) / STAGES.length) * 100;

  return (
    <Screen showNav>
      <PageHeader title="Memeriksa URL" showBack />

      <div className={styles.body}>
        <div className={styles.field}>
          <div className={styles.urlBox}>{url}</div>
          <p className={styles.hint}>
            Input terkunci selama pemeriksaan. Tunggu hasil atau batalkan untuk
            kembali ke beranda.
          </p>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" disabled>
            Tempel
          </Button>
          <Button disabled>Memeriksa…</Button>
        </div>

        <div className={styles.progressCard}>
          <div className={styles.progressTitle}>Pemeriksaan berlangsung</div>
          <div className={styles.progressStage}>
            Tahap {stage + 1} dari {STAGES.length} · {STAGES[stage]}
          </div>
          <div className={styles.bar}>
            <div className={styles.barFill} style={{ width: `${progressPct}%` }} />
          </div>
          <div className={styles.progressNote}>Mohon tunggu beberapa saat.</div>
        </div>

        <div>
          <h2 className={styles.stepsTitle}>Yang sedang diperiksa</h2>
          <div className={styles.steps}>
            {STEP_LABELS.map((label, i) => {
              const done = i < stage;
              const active = i === stage;
              const cls = done
                ? styles.stepDone
                : active
                  ? styles.stepActive
                  : styles.stepPending;
              const prefix = done ? "✓" : active ? "…" : "—";
              const suffix = done
                ? "Selesai"
                : active
                  ? "Diproses"
                  : "Menunggu";
              return (
                <div key={label} className={`${styles.step} ${cls}`}>
                  {prefix} {label} · {suffix}
                </div>
              );
            })}
          </div>
        </div>

        <p className={styles.hint}>
          Tautan tidak dibuka di perangkat. Keluar membatalkan scan tanpa
          menyimpan hasil.
        </p>

        <Button variant="ghost" fullWidth onClick={handleCancel}>
          Batalkan pemeriksaan
        </Button>
      </div>
    </Screen>
  );
}
