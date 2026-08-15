import { delay } from "./delay";
import type { AdminAnalyticsSummary, DailyMetric, TrendMetric } from "@/types/overview";

const MOCK_SUMMARY: AdminAnalyticsSummary = {
  totalCustomers: 12480,
  activeCustomers: 11203,
  newCustomers: 842,
  totalTransactions: 84210,
  totalWallets: 15902,
  totalBudgets: 9340,
  freeSubscriptions: 8486,
  premiumSubscriptions: 3994,
};

function seededTrend(days: number, base: number, amplitude: number): DailyMetric[] {
  const today = new Date();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    const wave = Math.round(amplitude * Math.sin(index / 3) + amplitude);
    return { date: date.toISOString().slice(0, 10), count: Math.max(0, base + wave) };
  });
}

export async function getAnalyticsSummary(): Promise<AdminAnalyticsSummary> {
  await delay();
  return MOCK_SUMMARY;
}

export async function getAnalyticsTrend(metric: TrendMetric, days: number): Promise<DailyMetric[]> {
  await delay();
  return metric === "transactions" ? seededTrend(days, 40, 25) : seededTrend(days, 20, 12);
}
