/** Format waktu relatif ringkas dalam Bahasa Indonesia, mis. "Hari ini · 10.32". */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  const timeStr = date
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    .replace(":", ".");

  const sameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (sameDay) return `Hari ini · ${timeStr}`;
  if (isYesterday) return `Kemarin · ${timeStr}`;

  const dateStr = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
  return `${dateStr} · ${timeStr}`;
}

