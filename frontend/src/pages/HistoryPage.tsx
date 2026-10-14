import { useEffect, useMemo, useState } from "react";
import { Screen } from "../components/Screen";
import { PageHeader } from "../components/PageHeader";
import { HistoryRow } from "../components/HistoryRow";
import { SearchIcon } from "../components/Icons";
import { api } from "../api/client";
import type { Check } from "../types";
import styles from "./HistoryPage.module.css";

type FilterKey = "all" | "low" | "suspicious" | "high" | "failed";

const BASE_FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "low", label: "Rendah" },
  { key: "suspicious", label: "Mencurigakan" },
  { key: "high", label: "Tinggi" },
];

const FAILED_FILTER = { key: "failed" as FilterKey, label: "Gagal" };

export function HistoryPage() {
  const [all, setAll] = useState<Check[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .listChecks()
      .then((checks) => active && setAll(checks))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Tampilkan filter "Gagal" hanya bila memang ada entri gagal.
  const hasFailed = useMemo(
    () => all.some((c) => c.status === "failed"),
    [all],
  );
  const filters = useMemo(
    () => (hasFailed ? [...BASE_FILTERS, FAILED_FILTER] : BASE_FILTERS),
    [hasFailed],
  );

  // Jika filter aktif "Gagal" tapi tak ada lagi entri gagal, kembalikan ke "Semua".
  useEffect(() => {
    if (filter === "failed" && !hasFailed) setFilter("all");
  }, [filter, hasFailed]);

  const filtered = useMemo(() => {
    return all.filter((c) => {
      // Filter tingkat/status
      if (filter === "failed" && c.status !== "failed") return false;
      if (filter !== "all" && filter !== "failed" && c.risk_level !== filter)
        return false;
      // Pencarian teks
      if (query && !c.url.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [all, filter, query]);

  const summary = useMemo(() => {
    const count = filtered.length;
    if (count === 0) return "Tidak ada hasil";
    return `${count} pemeriksaan`;
  }, [filtered]);

  return (
    <Screen showNav>
      <PageHeader title="Riwayat" />

      <div className={styles.body}>
        <div className={styles.search}>
          <span className={styles.searchIcon}>
            <SearchIcon size={20} color="var(--color-text-muted)" />
          </span>
          <input
            className={styles.searchInput}
            placeholder="Cari URL atau domain"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className={styles.filters}>
          {filters.map((f) => (
            <button
              key={f.key}
              className={`${styles.pill} ${filter === f.key ? styles.active : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={styles.summaryRow}>
          <span className={styles.summary}>{summary}</span>
          <span className={styles.sort}>Terbaru ↓</span>
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.empty}>Memuat…</div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              {all.length === 0
                ? "Belum ada pemeriksaan."
                : "Tidak ada entri yang cocok."}
            </div>
          ) : (
            filtered.map((c) => <HistoryRow key={c.id} check={c} />)
          )}
        </div>

        <p className={styles.disclaimer}>
          Pilih entri berhasil untuk detail hasil atau entri gagal untuk coba
          lagi.
        </p>
      </div>
    </Screen>
  );
}
