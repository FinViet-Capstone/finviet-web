import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type { AdminAnalyticsSummary, DailyMetric, TrendMetric } from "@/types/overview";

// Backed by finviet-be's AnalyticsController (api/analytics), [Authorize(Roles = "Admin")].

interface AdminAnalyticsSummaryDto {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  totalTransactions: number;
  totalWallets: number;
  totalBudgets: number;
  freeSubscriptions: number;
  premiumSubscriptions: number;
}

interface DailyMetricDto {
  date: string;
  count: number;
}

async function authHeaders() {
  const token = await getFinvietAdminToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getAnalyticsSummary(): Promise<AdminAnalyticsSummary> {
  const headers = await authHeaders();
  const res = await finvietApi.get<{ success: boolean; message?: string; data: AdminAnalyticsSummaryDto }>(
    "/api/analytics/summary",
    { headers },
  );
  return unwrap(res);
}

export async function getAnalyticsTrend(metric: TrendMetric, days: number): Promise<DailyMetric[]> {
  const headers = await authHeaders();
  const res = await finvietApi.get<{ success: boolean; message?: string; data: DailyMetricDto[] }>(
    "/api/analytics/trend",
    { params: { metric, days }, headers },
  );
  return unwrap(res);
}
