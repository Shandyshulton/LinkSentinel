import { useNavigate } from "react-router-dom";
import { BackIcon } from "./Icons";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  /** Tampilkan tombol kembali di sebelah kiri judul. */
  showBack?: boolean;
}

export function PageHeader({ title, showBack = false }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.titleRow}>
        {showBack && (
          <button
            className={styles.back}
            onClick={() => navigate(-1)}
            aria-label="Kembali"
          >
            <BackIcon size={24} color="var(--color-text-strong)" />
          </button>
        )}
        <h1 className={styles.title}>{title}</h1>
      </div>
    </header>
  );
}
