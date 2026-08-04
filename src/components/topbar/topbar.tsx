import { Landmark } from "lucide-react";
import styles from "./topbar.module.css";

export function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>
          <Landmark size={18} strokeWidth={2} />
        </span>
        <span className={styles.brandName}>FinViet Admin</span>
      </div>
    </header>
  );
}
