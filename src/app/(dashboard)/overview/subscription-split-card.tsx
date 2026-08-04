import { Crown } from "lucide-react";
import styles from "./overview.module.css";

interface SubscriptionSplitCardProps {
  freePercent: number;
  premiumPercent: number;
}

export function SubscriptionSplitCard({ freePercent, premiumPercent }: SubscriptionSplitCardProps) {
  return (
    <div className={styles.splitCard}>
      <div className={styles.splitHeader}>
        <span className={styles.iconBadge}>
          <Crown size={18} strokeWidth={2} />
        </span>
        <span className={styles.splitTitle}>Gói Free / Premium</span>
      </div>
      <div className={styles.splitBar}>
        <div className={styles.splitBarFree} style={{ width: `${freePercent}%` }} />
        <div className={styles.splitBarPremium} style={{ width: `${premiumPercent}%` }} />
      </div>
      <span className={styles.splitPercent}>
        {freePercent}% / {premiumPercent}%
      </span>
      <div className={styles.splitLegend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDotFree} />
          Miễn phí
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDotPremium} />
          Premium
        </span>
      </div>
    </div>
  );
}
