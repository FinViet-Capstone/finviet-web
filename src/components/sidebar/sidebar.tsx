"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Wand2,
  BookOpen,
  Megaphone,
  ChevronUp,
  LogOut,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { AccountPanel } from "./account-panel";
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
  href: string;
}

const items: SidebarItem[] = [
  { key: "overview", label: "Tổng quan", icon: LayoutDashboard, href: "/overview" },
  { key: "users", label: "Người dùng", icon: Users, href: "/users" },
  { key: "system-config", label: "Cấu hình hệ thống", icon: Settings, href: "/system-config" },
  { key: "category-corrections", label: "Sửa danh mục AI", icon: Wand2, href: "/category-corrections" },
  { key: "knowledge-base", label: "Kho tri thức AI", icon: BookOpen, href: "/knowledge-base" },
  { key: "announcements", label: "Thông báo", icon: Megaphone, href: "/announcements" },
];

interface SidebarProps {
  activeKey: SidebarItemKey;
}

export function Sidebar({ activeKey }: SidebarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function handleLogout() {
    setIsMenuOpen(false);
    router.push("/login");
  }

  function handleAccountSaved() {
    setIsAccountOpen(false);
    setToast("Đã lưu thông tin tài khoản");
    window.setTimeout(() => setToast(null), 3000);
  }

  return (
    <nav className={styles.sidebar} aria-label="Điều hướng chính">
      <div className={styles.navItems}>
        {items.map(({ key, label, icon: Icon, href }) => (
          <Link key={key} href={href} className={key === activeKey ? styles.itemActive : styles.item}>
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <div className={styles.accountSection}>
        {isMenuOpen ? (
          <div className={styles.accountMenu} role="menu">
            <button
              type="button"
              className={styles.accountMenuItem}
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                setIsAccountOpen(true);
              }}
            >
              <UserCircle size={16} strokeWidth={2} />
              Tài khoản của tôi
            </button>
            <button
              type="button"
              className={styles.accountMenuItemDanger}
              role="menuitem"
              onClick={handleLogout}
            >
              <LogOut size={16} strokeWidth={2} />
              Đăng xuất
            </button>
          </div>
        ) : null}
        <button
          type="button"
          className={styles.accountButton}
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
        >
          <span className={styles.avatar}>AD</span>
          <span className={styles.accountInfo}>
            <span className={styles.accountName}>Admin</span>
            <span className={styles.accountEmail}>admin@finviet.vn</span>
          </span>
          <ChevronUp size={16} strokeWidth={2} className={isMenuOpen ? styles.chevronOpen : styles.chevron} />
        </button>
      </div>

      {isAccountOpen ? (
        <AccountPanel onClose={() => setIsAccountOpen(false)} onSaved={handleAccountSaved} />
      ) : null}

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </nav>
  );
}
