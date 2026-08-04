import styles from "./tab-bar.module.css";

export interface TabBarItem {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: TabBarItem[];
  activeKey: string;
}

export function TabBar({ tabs, activeKey }: TabBarProps) {
  return (
    <div className={styles.tabBar} role="tablist">
      {tabs.map(({ key, label }) => (
        <div
          key={key}
          role="tab"
          aria-selected={key === activeKey}
          className={key === activeKey ? styles.tabActive : styles.tab}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
