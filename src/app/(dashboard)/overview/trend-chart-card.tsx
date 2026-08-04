import type { ReactNode } from "react";
import styles from "./overview.module.css";

interface TrendChartCardProps {
  title: string;
  summary: string;
  trendLabel: string;
  children: ReactNode;
}

export function TrendChartCard({ title, summary, trendLabel, children }: TrendChartCardProps) {
  return (
    <section className={styles.chartCard}>
      <h2 className={styles.chartTitle}>{title}</h2>
      <div className={styles.chartSummaryRow}>
        <span className={styles.chartSummary}>{summary}</span>
        <span className={styles.trendBadge}>{trendLabel}</span>
      </div>
      {children}
    </section>
  );
}
