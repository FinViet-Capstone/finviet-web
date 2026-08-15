export interface AdminAnalyticsSummary {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  totalTransactions: number;
  totalWallets: number;
  totalBudgets: number;
  freeSubscriptions: number;
  premiumSubscriptions: number;
}

export interface DailyMetric {
  date: string;
  count: number;
}

export type TrendMetric = "signups" | "transactions";
