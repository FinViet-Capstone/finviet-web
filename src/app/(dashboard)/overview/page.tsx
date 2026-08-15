import { ArrowLeftRight, Eye, PiggyBank, UserPlus, Users, Wallet } from "lucide-react";
import { StatCard } from "@/components/stat-card/stat-card";
import { SubscriptionSplitCard } from "./subscription-split-card";
import { TrendChartCard } from "./trend-chart-card";
import { SignupsChart } from "./signups-chart";
import { TransactionsChart } from "./transactions-chart";
import styles from "./overview.module.css";

export default function OverviewPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tổng quan hệ thống</h1>
        <p className={styles.subtitle}>Theo dõi tình trạng hệ thống theo thời gian thực</p>
      </div>

      <div className={styles.statGrid}>
        <StatCard icon={Users} value="12,480" label="Tổng khách hàng" />
        <StatCard
          icon={Eye}
          value="11,203"
          label="Hoạt động / Không hoạt động"
          subtext="1.277 không hoạt động"
          valueColor="var(--color-active)"
        />
        <StatCard icon={UserPlus} value="842" label="Khách hàng mới (kỳ này)" />
        <StatCard icon={ArrowLeftRight} value="84,210" label="Tổng giao dịch" />
        <StatCard icon={Wallet} value="15,902" label="Tổng ví" />
        <StatCard icon={PiggyBank} value="9,340" label="Tổng ngân sách" />
        <SubscriptionSplitCard freePercent={68} premiumPercent={32} />
      </div>

      <TrendChartCard
        title="Người dùng mới theo thời gian"
        summary="842 người dùng mới"
        trendLabel="↗ +12% so với kỳ trước"
      >
        <SignupsChart />
      </TrendChartCard>

      <TrendChartCard
        title="Khối lượng giao dịch theo thời gian"
        summary="1.847 giao dịch trong 7 ngày qua"
        trendLabel="↗ +8% so với kỳ trước"
      >
        <TransactionsChart />
      </TrendChartCard>
    </div>
  );
}
