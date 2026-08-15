import type { DailyMetric } from "@/types/overview";

export interface ChartPoint {
  label: string;
  fullDate: string;
  value: number;
}

function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function formatFullDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Edge-labeled chart points: only the first and last day get a visible x-axis label. */
export function toChartPoints(data: DailyMetric[]): ChartPoint[] {
  return data.map((point, index) => ({
    label: index === 0 || index === data.length - 1 ? formatShortDate(point.date) : "",
    fullDate: formatFullDate(point.date),
    value: point.count,
  }));
}

export function sumCounts(data: DailyMetric[]): number {
  return data.reduce((total, point) => total + point.count, 0);
}

/**
 * Compares the second half of the fetched window against the first half — the only trend
 * signal available without a backend-provided prior-period baseline. Not a fabricated number:
 * it's a real split of the actual data just returned.
 */
export function computeTrendLabel(data: DailyMetric[]): string {
  if (data.length < 2) return "—";
  const mid = Math.floor(data.length / 2);
  const firstHalf = sumCounts(data.slice(0, mid));
  const secondHalf = sumCounts(data.slice(mid));
  if (firstHalf === 0) return secondHalf > 0 ? "↗ Mới" : "→ 0%";
  const change = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
  if (change > 0) return `↗ +${change}%`;
  if (change < 0) return `↘ ${change}%`;
  return "→ 0%";
}
