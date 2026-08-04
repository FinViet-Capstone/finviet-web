import { Landmark, Search } from "lucide-react";
import styles from "./topbar.module.css";

interface TopbarProps {
  adminInitials?: string;
}

export function Topbar({ adminInitials = "AD" }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>
          <Landmark size={18} strokeWidth={2} />
        </span>
        <span className={styles.brandName}>FinViet Admin</span>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.iconButton} aria-label="Tìm kiếm">
          <Search size={18} strokeWidth={2} />
        </button>
        <span className={styles.avatar}>{adminInitials}</span>
      </div>
    </header>
  );
}
