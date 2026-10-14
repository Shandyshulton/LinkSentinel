import { NavLink } from "react-router-dom";
import { ChartIcon, HistoryIcon, HouseIcon, SettingsIcon } from "./Icons";
import styles from "./BottomNav.module.css";

const ITEMS = [
  { to: "/home", label: "Beranda", Icon: HouseIcon },
  { to: "/history", label: "Riwayat", Icon: HistoryIcon },
  { to: "/stats", label: "Statistik", Icon: ChartIcon },
  { to: "/settings", label: "Pengaturan", Icon: SettingsIcon },
];

export function BottomNav() {
  return (
    <nav className={styles.nav}>
      {ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `${styles.item} ${isActive ? styles.active : ""}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={20}
                color={isActive ? "#ffffff" : "var(--color-text-secondary)"}
              />
              <span className={styles.label}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
