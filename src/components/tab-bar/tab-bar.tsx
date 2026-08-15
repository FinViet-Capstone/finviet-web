"use client";

import styles from "./tab-bar.module.css";

export interface TabBarItem {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: TabBarItem[];
  activeKey: string;
  onSelect?: (key: string) => void;
}

export function TabBar({ tabs, activeKey, onSelect }: TabBarProps) {
  return (
    <div className={styles.tabBar} role="tablist">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={key === activeKey}
          className={key === activeKey ? styles.tabActive : styles.tab}
          onClick={onSelect ? () => onSelect(key) : undefined}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
