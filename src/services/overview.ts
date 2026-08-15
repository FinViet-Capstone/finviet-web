import { isMockMode } from "@/lib/env";
import * as mockOverview from "./mock/overview";
import * as realOverview from "./real/overview";

function impl() {
  return isMockMode() ? mockOverview : realOverview;
}

export const getAnalyticsSummary: typeof mockOverview.getAnalyticsSummary = () => impl().getAnalyticsSummary();
export const getAnalyticsTrend: typeof mockOverview.getAnalyticsTrend = (metric, days) =>
  impl().getAnalyticsTrend(metric, days);
