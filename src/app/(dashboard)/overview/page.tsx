"use client";

import { ArrowLeftRight, Eye, PiggyBank, UserPlus, Users, Wallet } from "lucide-react";
import { StatCard } from "@/components/stat-card/stat-card";
import { SubscriptionSplitCard } from "./subscription-split-card";
import { TrendChartCard } from "./trend-chart-card";
import { SignupsChart } from "./signups-chart";
import { TransactionsChart } from "./transactions-chart";
import { useAnalyticsSummary, useAnalyticsTrend } from "@/hooks/useOverview";
import { formatCount } from "@/lib/format-number";
import { sumCounts, computeTrendLabel } from "./chart-data";
import styles from "./overview.module.css";

export default function OverviewPage() {
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } = useAnalyticsSummary();
  const signups = useAnalyticsTrend("signups");
  const transactions = useAnalyticsTrend("transactions");

  const value = (formatted: string) => (isSummaryLoading ? "…" : isSummaryError ? "—" : formatted);

  const totalSubscriptions = summary ? summary.freeSubscriptions + summary.premiumSubscriptions : 0;
  const freePercent = totalSubscriptions > 0 ? Math.round((summary!.freeSubscriptions / totalSubscriptions) * 100) : 0;
  const premiumPercent = totalSubscriptions > 0 ? 100 - freePercent : 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tổng quan hệ thống</h1>
        <p className={styles.subtitle}>Theo dõi tình trạng hệ thống theo thời gian thực</p>
      </div>

      {isSummaryError ? (
        <div className={styles.errorBanner}>Không thể tải dữ liệu tổng quan.</div>
      ) : null}

      <div className={styles.statGrid}>
        <StatCard icon={Users} value={value(summary ? formatCount(summary.totalCustomers) : "")} label="Tổng khách hàng" />
        <StatCard
          icon={Eye}
          value={value(summary ? formatCount(summary.activeCustomers) : "")}
          label="Hoạt động / Không hoạt động"
          subtext={summary ? `${formatCount(summary.totalCustomers - summary.activeCustomers)} không hoạt động` : undefined}
          valueColor="var(--color-active)"
        />
        <StatCard icon={UserPlus} value={value(summary ? formatCount(summary.newCustomers) : "")} label="Khách hàng mới (30 ngày qua)" />
        <StatCard icon={ArrowLeftRight} value={value(summary ? formatCount(summary.totalTransactions) : "")} label="Tổng giao dịch" />
        <StatCard icon={Wallet} value={value(summary ? formatCount(summary.totalWallets) : "")} label="Tổng ví" />
        <StatCard icon={PiggyBank} value={value(summary ? formatCount(summary.totalBudgets) : "")} label="Tổng ngân sách" />
        <SubscriptionSplitCard freePercent={freePercent} premiumPercent={premiumPercent} />
      </div>

      <TrendChartCard
        title="Người dùng mới theo thời gian"
        summary={signups.data ? `${formatCount(sumCounts(signups.data))} người dùng mới trong 30 ngày qua` : "…"}
        trendLabel={signups.data ? computeTrendLabel(signups.data) : "—"}
      >
        {signups.isLoading ? (
          <div className={styles.chartPlaceholder}>Đang tải…</div>
        ) : signups.isError ? (
          <div className={styles.chartPlaceholder}>Không thể tải biểu đồ.</div>
        ) : signups.data && sumCounts(signups.data) === 0 ? (
          <div className={styles.chartPlaceholder}>Chưa có người dùng mới trong 30 ngày qua.</div>
        ) : (
          <SignupsChart data={signups.data ?? []} />
        )}
      </TrendChartCard>

      <TrendChartCard
        title="Khối lượng giao dịch theo thời gian"
        summary={transactions.data ? `${formatCount(sumCounts(transactions.data))} giao dịch trong 30 ngày qua` : "…"}
        trendLabel={transactions.data ? computeTrendLabel(transactions.data) : "—"}
      >
        {transactions.isLoading ? (
          <div className={styles.chartPlaceholder}>Đang tải…</div>
        ) : transactions.isError ? (
          <div className={styles.chartPlaceholder}>Không thể tải biểu đồ.</div>
        ) : transactions.data && sumCounts(transactions.data) === 0 ? (
          <div className={styles.chartPlaceholder}>Chưa có giao dịch nào trong 30 ngày qua.</div>
        ) : (
          <TransactionsChart data={transactions.data ?? []} />
        )}
      </TrendChartCard>
    </div>
  );
}
