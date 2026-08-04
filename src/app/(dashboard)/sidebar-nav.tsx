"use client";

import { usePathname } from "next/navigation";
import { Sidebar, type SidebarItemKey } from "@/components/sidebar/sidebar";

const activeKeyByPath: Record<string, SidebarItemKey> = {
  "/overview": "overview",
  "/users": "users",
  "/system-config": "system-config",
  "/category-corrections": "category-corrections",
  "/knowledge-base": "knowledge-base",
  "/announcements": "announcements",
};

export function SidebarNav() {
  const pathname = usePathname();
  const activeKey = activeKeyByPath[pathname] ?? "overview";

  return <Sidebar activeKey={activeKey} />;
}
