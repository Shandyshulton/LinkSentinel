import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Screen } from "../components/Screen";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/Button";
import { api } from "../api/client";
import type { Check } from "../types";
import { formatRelativeTime } from "../lib/format";
import {
  RISK_GUIDE_TEXT,
  RISK_GUIDE_TITLE,
  RISK_HEADLINE,
  RISK_META,
  RISK_SUMMARY,
} from "../lib/risk";
import styles from "./ResultPage.module.css";

interface LocationState {
  check?: Check;
}

export function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passed = (location.state as LocationState | null)?.check;

  const [check, setCheck] = useState<Check | null>(passed ?? null);
  const [loading, setLoading] = useState(!passed);

  useEffect(() => {
    if (passed || !id) return;
    let active = true;
    api
      .getCheck(Number(id))
      .then((c) => active && setCheck(c))
      .catch(() => active && setCheck(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, passed]);

  if (loading) {
    return (
      <Screen showNav>
        <PageHeader title="Hasil pemeriksaan" showBack />
        <div className={styles.loading}>Memuat hasil…</div>
      </Screen>
    );
  }

  if (!check || !check.risk_level) {
    return (
      <Screen showNav>
        <PageHeader title="Hasil pemeriksaan" showBack />
        <div className={styles.loading}>Hasil tidak ditemukan.</div>
      </Screen>
    );
  }

  const level = check.risk_level;
  const meta = RISK_META[level];

  return (
    <Screen showNav>
      <PageHeader title="Hasil pemeriksaan" showBack />

      <div className={styles.body}>
        {/* Kartu risiko utama */}
        <div
          className={styles.riskCard}
          style={{ background: meta.bgVar, borderColor: meta.borderVar }}
        >
          <div className={styles.riskTop}>
            <span className={styles.scoreDot} style={{ background: meta.colorVar }}>
              {meta.score}
            </span>
            <span className={styles.riskKicker} style={{ color: meta.colorVar }}>
              Tingkat risiko · {meta.score} dari 3
            </span>
          </div>
          <h2 className={styles.riskHeadline} style={{ color: meta.colorVar }}>
            {RISK_HEADLINE[level]}
          </h2>
          <p className={styles.riskSummary} style={{ color: meta.colorVar }}>
            {RISK_SUMMARY[level]}
          </p>
        </div>

        {/* URL + waktu */}
        <div className={styles.urlMeta}>
          <span className={styles.urlMetaLabel}>
            URL diperiksa · {formatRelativeTime(check.created_at)}
          </span>
          <span className={styles.urlMetaValue}>{check.url}</span>
        </div>

        {/* Dasar penilaian */}
        <div className={styles.reasonCard}>
          <h3 className={styles.reasonTitle}>Dasar penilaian</h3>
          <ul className={styles.reasonList}>
            {check.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>

        {/* Panduan tindak lanjut */}
        <div className={styles.guide}>
          <h3 className={styles.guideTitle}>{RISK_GUIDE_TITLE[level]}</h3>
          <p className={styles.guideText}>{RISK_GUIDE_TEXT[level]}</p>
        </div>

        {/* Aksi */}
        <div className={styles.actions}>
          <Button fullWidth onClick={() => navigate("/home")}>
            Periksa URL lain
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate("/history")}>
            Lihat riwayat
          </Button>
        </div>

        <p className={styles.disclaimer}>
          Hasil tersimpan di riwayat. Penilaian dapat berubah.
        </p>
      </div>
    </Screen>
  );
}
