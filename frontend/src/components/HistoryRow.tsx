import { useNavigate } from "react-router-dom";
import type { Check } from "../types";
import { formatRelativeTime } from "../lib/format";
import { RISK_META } from "../lib/risk";
import { ChevronRightIcon } from "./Icons";
import styles from "./HistoryRow.module.css";

interface HistoryRowProps {
  check: Check;
}

export function HistoryRow({ check }: HistoryRowProps) {
  const navigate = useNavigate();
  const isFailed = check.status === "failed";

  const statusLabel = isFailed
    ? "Gagal · coba lagi"
    : check.risk_level
      ? RISK_META[check.risk_level].label
      : "";

  const statusColor = isFailed
    ? "var(--color-high)"
    : check.risk_level
      ? RISK_META[check.risk_level].colorVar
      : "var(--color-text-secondary)";

  const handleClick = () => {
    if (isFailed) {
      // Entri gagal: langsung jalankan ulang pemeriksaan URL tersebut.
      navigate("/checking", { state: { url: check.url } });
    } else {
      navigate(`/result/${check.id}`);
    }
  };

  return (
    <button className={styles.row} onClick={handleClick}>
      <div className={styles.main}>
        <span className={styles.url}>{check.url}</span>
        <span className={styles.status} style={{ color: statusColor }}>
          {statusLabel}
        </span>
      </div>
      <div className={styles.meta}>
        <span className={styles.time}>{formatRelativeTime(check.created_at)}</span>
        <ChevronRightIcon size={18} color="var(--color-text-muted)" />
      </div>
    </button>
  );
}
