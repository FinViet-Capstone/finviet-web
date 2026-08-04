import { Topbar } from "@/components/topbar/topbar";
import { SidebarNav } from "./sidebar-nav";
import styles from "./dashboard-layout.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Topbar />
      <div className={styles.body}>
        <SidebarNav />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
