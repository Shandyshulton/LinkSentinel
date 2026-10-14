import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Screen } from "../components/Screen";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/Button";
import { api } from "../api/client";
import type { RiskLevel, Stats } from "../types";
import { RISK_META } from "../lib/risk";
import styles from "./StatsPage.module.css";

const ORDER: RiskLevel[] = ["low", "suspicious", "high"];

export function StatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .getStats()
      .then((s) => active && setStats(s))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const buckets = stats?.buckets ?? [];
  const bucketFor = (level: RiskLevel) =>
    buckets.find((b) => b.level === level) ?? { level, count: 0, percentage: 0 };

  return (
    <Screen showNav>
      <PageHeader title="Statistik" />

      <div className={styles.body}>
        <div className={styles.rangeSelect}>
          <span>Semua waktu</span>
        </div>
        <p className={styles.rangeMeta}>Berdasarkan seluruh riwayat pemeriksaan</p>

        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardNum}>
              {loading ? "–" : stats?.total_attempts ?? 0}
            </div>
            <div className={styles.cardLabel}>Total percobaan</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardNum}>
              {loading ? "–" : stats?.results_available ?? 0}
            </div>
            <div className={styles.cardLabel}>Hasil tersedia</div>
          </div>
        </div>

        <div className={styles.distCard}>
          <h2 className={styles.distTitle}>Hasil menurut tingkat risiko</h2>
          {ORDER.map((level) => {
            const b = bucketFor(level);
            const meta = RISK_META[level];
            return (
              <div key={level} className={styles.distRow}>
                <div className={styles.distTop}>
                  <span className={styles.distLabel} style={{ color: meta.colorVar }}>
                    {meta.label} · {b.percentage}%
                  </span>
                  <span className={styles.distCount} style={{ color: meta.colorVar }}>
                    {b.count} pemeriksaan
                  </span>
                </div>
                <div className={styles.distBar} style={{ background: meta.bgVar }}>
                  <div
                    className={styles.distFill}
                    style={{
                      width: `${b.percentage}%`,
                      background: meta.colorVar,
                    }}
                  />
                </div>
              </div>
            );
          })}
          <p className={styles.distNote}>
            Persentase dihitung dari {stats?.results_available ?? 0} pemeriksaan
            yang menghasilkan penilaian.
          </p>
        </div>

        {!loading && (stats?.failed_count ?? 0) > 0 && (
          <div className={styles.failedCard}>
            <div className={styles.failedTitle}>
              {stats?.failed_count} pemeriksaan gagal
            </div>
            <p className={styles.failedText}>
              Tidak masuk dalam distribusi risiko. Lihat riwayat untuk mencoba
              kembali.
            </p>
            <Button variant="secondary" fullWidth onClick={() => navigate("/history")}>
              Lihat riwayat
            </Button>
          </div>
        )}

        <p className={styles.disclaimer}>
          Statistik aktivitas, bukan jaminan keamanan URL.
        </p>
      </div>
    </Screen>
  );
}
