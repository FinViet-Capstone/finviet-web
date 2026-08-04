import type { LucideIcon } from "lucide-react";
import styles from "./stat-card.module.css";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  subtext?: string;
  valueColor?: string;
}

export function StatCard({ icon: Icon, value, label, subtext, valueColor }: StatCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.iconBadge}>
        <Icon size={18} strokeWidth={2} />
      </span>
      <span className={styles.value} style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </span>
      <span className={styles.label}>{label}</span>
      {subtext ? <span className={styles.subtext}>{subtext}</span> : null}
    </div>
  );
}
