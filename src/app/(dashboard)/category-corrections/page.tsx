"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calendar, Filter, Mail, Clock } from "lucide-react";
import { FormModal } from "@/components/form-modal/form-modal";
import { correctedCategoryOptions, initialCorrections, type MockCorrection } from "./mock-corrections";
import styles from "./category-corrections.module.css";

type DateRangeFilter = "7d" | "30d" | "90d";

const dateRangeOptions: { value: DateRangeFilter; label: string }[] = [
  { value: "7d", label: "7 ngày qua" },
  { value: "30d", label: "30 ngày qua" },
  { value: "90d", label: "90 ngày qua" },
];

const pageNumbers = [1, 2, 3];
const lastPage = 18;

function formatAmount(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}₫`;
}

export default function CategoryCorrectionsPage() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30d");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activePage, setActivePage] = useState(1);
  const [selectedCorrection, setSelectedCorrection] = useState<MockCorrection | null>(null);

  const filteredCorrections = useMemo(() => {
    if (categoryFilter === "all") return initialCorrections;
    return initialCorrections.filter((correction) => correction.correctedCategoryName === categoryFilter);
  }, [categoryFilter]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Sửa danh mục AI</h1>
        <p className={styles.subtitle}>
          Nhật ký chỉ đọc — theo dõi các lần AI gợi ý sai để cải thiện độ chính xác phân loại.
        </p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterBox}>
          <Calendar size={16} strokeWidth={2} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value as DateRangeFilter)}
            aria-label="Lọc theo khoảng thời gian"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterBox}>
          <Filter size={16} strokeWidth={2} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Lọc theo danh mục"
          >
            <option value="all">Danh mục: Tất cả</option>
            {correctedCategoryOptions.map((category) => (
              <option key={category} value={category}>
                Danh mục: {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mô tả giao dịch</th>
              <th>AI đề xuất</th>
              <th aria-hidden className={styles.arrowCell} />
              <th>Đã sửa</th>
              <th>Khách hàng</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {filteredCorrections.map((correction) => (
              <tr
                key={correction.id}
                className={styles.row}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCorrection(correction)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedCorrection(correction);
                  }
                }}
              >
                <td className={styles.nameCell}>{correction.transactionDescription}</td>
                <td className={styles.mutedCell}>{correction.aiGuess}</td>
                <td className={styles.arrowCell}>
                  <span className={styles.arrowIcon}>
                    <ArrowRight size={14} strokeWidth={2} />
                  </span>
                </td>
                <td>
                  <span
                    className={styles.badge}
                    style={{
                      color: correction.correctedCategoryColor,
                      background: `color-mix(in srgb, ${correction.correctedCategoryColor} 14%, transparent)`,
                    }}
                  >
                    {correction.correctedCategoryName}
                  </span>
                </td>
                <td className={styles.mutedCell}>{correction.customerEmail}</td>
                <td className={styles.mutedCell}>{correction.correctedAtLabel}</td>
              </tr>
            ))}
            {filteredCorrections.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  Không có bản ghi sửa danh mục phù hợp.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageNav}
            disabled={activePage === 1}
            onClick={() => setActivePage((page) => Math.max(1, page - 1))}
            aria-label="Trang trước"
          >
            ‹
          </button>
          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              className={page === activePage ? styles.pageNumberActive : styles.pageNumber}
              onClick={() => setActivePage(page)}
            >
              {page}
            </button>
          ))}
          <span className={styles.pageEllipsis}>…</span>
          <button
            type="button"
            className={activePage === lastPage ? styles.pageNumberActive : styles.pageNumber}
            onClick={() => setActivePage(lastPage)}
          >
            {lastPage}
          </button>
          <button
            type="button"
            className={styles.pageNav}
            disabled={activePage === lastPage}
            onClick={() => setActivePage((page) => Math.min(lastPage, page + 1))}
            aria-label="Trang sau"
          >
            ›
          </button>
        </div>
      </div>

      {selectedCorrection ? (
        <FormModal
          title="Chi tiết sửa danh mục"
          onClose={() => setSelectedCorrection(null)}
          footer={
            <button type="button" className={styles.closeButton} onClick={() => setSelectedCorrection(null)}>
              Đóng
            </button>
          }
        >
          <div className={styles.detailHeader}>
            <p className={styles.detailDescription}>{selectedCorrection.transactionDescription}</p>
            <p className={styles.detailAmount}>{formatAmount(selectedCorrection.amount)}</p>
          </div>

          <div className={styles.detailCompare}>
            <div className={styles.detailSide}>
              <span className={styles.detailGuessText}>{selectedCorrection.aiGuess}</span>
              <span className={styles.detailCaption}>AI đề xuất</span>
            </div>
            <span className={styles.detailArrow}>
              <ArrowRight size={18} strokeWidth={2} />
            </span>
            <div className={styles.detailSide}>
              <span
                className={styles.detailBadge}
                style={{
                  color: selectedCorrection.correctedCategoryColor,
                  background: `color-mix(in srgb, ${selectedCorrection.correctedCategoryColor} 14%, transparent)`,
                }}
              >
                {selectedCorrection.correctedCategoryName}
              </span>
              <span className={styles.detailCaption}>đã sửa</span>
            </div>
          </div>

          <div className={styles.detailMeta}>
            <div className={styles.detailMetaRow}>
              <Mail size={16} strokeWidth={2} />
              Khách hàng: {selectedCorrection.customerEmail}
            </div>
            <div className={styles.detailMetaRow}>
              <Clock size={16} strokeWidth={2} />
              Thời gian: {selectedCorrection.correctedAtFull}
            </div>
          </div>
        </FormModal>
      ) : null}
    </div>
  );
}
