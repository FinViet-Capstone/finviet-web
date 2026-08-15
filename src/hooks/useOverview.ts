import { useQuery } from "@tanstack/react-query";
import { apiFetch, toQueryString } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AdminAnalyticsSummary, DailyMetric, TrendMetric } from "@/types/overview";

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: queryKeys.overview.summary(),
    queryFn: () => apiFetch<AdminAnalyticsSummary>("/api/overview/summary"),
  });
}

export function useAnalyticsTrend(metric: TrendMetric, days = 30) {
  return useQuery({
    queryKey: queryKeys.overview.trend(metric, days),
    queryFn: () => apiFetch<DailyMetric[]>(`/api/overview/trend?${toQueryString({ metric, days })}`),
  });
}
