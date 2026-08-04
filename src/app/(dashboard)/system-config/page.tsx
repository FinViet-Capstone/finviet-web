"use client";

import { useState } from "react";
import { TabBar, type TabBarItem } from "@/components/tab-bar/tab-bar";
import { CategoriesTab } from "./categories-tab";
import { BucketsTab } from "./buckets-tab";
import { ScoringTab } from "./scoring-tab";
import { PlansTab } from "./plans-tab";
import styles from "./system-config.module.css";

type TabKey = "categories" | "buckets" | "scoring" | "plans";

const tabs: TabBarItem[] = [
  { key: "categories", label: "Danh mục" },
  { key: "buckets", label: "Nhóm ngân sách" },
  { key: "scoring", label: "Trọng số điểm" },
  { key: "plans", label: "Gói dịch vụ" },
];

export default function SystemConfigPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("categories");

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Cấu hình hệ thống</h1>
        <p className={styles.subtitle}>Quản lý các thiết lập mặc định áp dụng cho toàn bộ khách hàng</p>
      </div>

      <TabBar tabs={tabs} activeKey={activeTab} onSelect={(key) => setActiveTab(key as TabKey)} />

      {activeTab === "categories" ? <CategoriesTab /> : null}
      {activeTab === "buckets" ? <BucketsTab /> : null}
      {activeTab === "scoring" ? <ScoringTab /> : null}
      {activeTab === "plans" ? <PlansTab /> : null}
    </div>
  );
}
