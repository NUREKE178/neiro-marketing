/** null means the data source never reported this number — shown as "—", never coerced to 0. */
export function formatCompactNumber(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("kk-KZ", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("kk-KZ").format(value);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("kk-KZ", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "белгісіз уақыт";
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "бүгін";
  if (days === 1) return "кеше";
  if (days < 30) return `${days} күн бұрын`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ай бұрын`;
  return `${Math.floor(months / 12)} жыл бұрын`;
}
