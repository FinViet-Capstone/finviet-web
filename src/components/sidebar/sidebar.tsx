import {
  LayoutDashboard,
  Users,
  Settings,
  Wand2,
  BookOpen,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import styles from "./sidebar.module.css";

export type SidebarItemKey =
  | "overview"
  | "users"
  | "system-config"
  | "category-corrections"
  | "knowledge-base"
  | "announcements";

interface SidebarItem {
  key: SidebarItemKey;
  label: string;
  icon: LucideIcon;
}

const items: SidebarItem[] = [
  { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { key: "users", label: "Người dùng", icon: Users },
  { key: "system-config", label: "Cấu hình hệ thống", icon: Settings },
  { key: "category-corrections", label: "Sửa danh mục AI", icon: Wand2 },
  { key: "knowledge-base", label: "Kho tri thức AI", icon: BookOpen },
  { key: "announcements", label: "Thông báo", icon: Megaphone },
];

interface SidebarProps {
  activeKey: SidebarItemKey;
}

export function Sidebar({ activeKey }: SidebarProps) {
  return (
    <nav className={styles.sidebar} aria-label="Điều hướng chính">
      {items.map(({ key, label, icon: Icon }) => (
        <div key={key} className={key === activeKey ? styles.itemActive : styles.item}>
          <Icon size={18} strokeWidth={2} />
          <span>{label}</span>
        </div>
      ))}
    </nav>
  );
}
