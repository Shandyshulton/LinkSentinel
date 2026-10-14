import styles from "./StatusBar.module.css";

/** Status bar perangkat (meniru iOS) sesuai desain: jam + sinyal/wifi/baterai. */
export function StatusBar() {
  return (
    <div className={styles.bar}>
      <span className={styles.time}>9:41</span>
      <div className={styles.indicators}>
        {/* Sinyal */}
        <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden>
          <rect x="0" y="9" width="3" height="5" rx="1" fill="#1e293b" />
          <rect x="4.3" y="6" width="3" height="8" rx="1" fill="#1e293b" />
          <rect x="8.6" y="3" width="3" height="11" rx="1" fill="#1e293b" />
          <rect x="12.9" y="0" width="3" height="14" rx="1" fill="#1e293b" />
        </svg>
        {/* Wifi */}
        <svg width="16" height="14" viewBox="0 0 16 12" fill="none" aria-hidden>
          <path d="M8 11.5 0.8 4.4a10 10 0 0 1 14.4 0L8 11.5Z" fill="#1e293b" opacity="0.25" />
          <path d="M8 11.5 3.5 7a6.4 6.4 0 0 1 9 0L8 11.5Z" fill="#1e293b" />
        </svg>
        {/* Baterai */}
        <svg width="24" height="14" viewBox="0 0 24 14" fill="none" aria-hidden>
          <rect x="0.5" y="1" width="20" height="12" rx="3" stroke="#1e293b" opacity="0.4" />
          <rect x="2" y="2.5" width="17" height="9" rx="1.8" fill="#1e293b" />
          <rect x="21.5" y="4.5" width="1.8" height="5" rx="0.9" fill="#1e293b" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
