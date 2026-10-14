import type { ReactNode } from "react";
import { StatusBar } from "./StatusBar";
import { BottomNav } from "./BottomNav";
import styles from "./Screen.module.css";

interface ScreenProps {
  children: ReactNode;
  /** Tampilkan navigasi bawah (layar utama bertab). */
  showNav?: boolean;
}

/** Pembungkus layar: status bar atas + area konten yang bisa discroll + nav bawah. */
export function Screen({ children, showNav = false }: ScreenProps) {
  return (
    <>
      <StatusBar />
      <main className={`${styles.content} scroll-area`}>{children}</main>
      {showNav && <BottomNav />}
    </>
  );
}
