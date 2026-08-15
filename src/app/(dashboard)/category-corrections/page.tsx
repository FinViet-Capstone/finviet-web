"use client";

import { useState } from "react";
import { ArrowRight, Calendar, Download, Filter, Mail, Clock } from "lucide-react";
import { FormModal } from "@/components/form-modal/form-modal";
import { getPageNumbers } from "@/lib/pagination";
import { useCategoryCorrections, exportCategoryCorrections } from "@/hooks/useCategoryCorrections";
import { correctedCategoryOptions } from "@/services/category-corrections";
import type { CategoryCorrectionView, DateRangeFilter } from "@/types/category-corrections";
import styles from "./category-corrections.module.css";

const dateRangeOptions: { value: DateRangeFilter; label: string }[] = [
  { value: "7d", label: "7 ngày qua" },
  { value: "30d", label: "30 ngày qua" },
  { value: "90d", label: "90 ngày qua" },
];

const PAGE_SIZE = 10;

function formatAmount(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}₫`;
}

export default function CategoryCorrectionsPage() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30d");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activePage, setActivePage] = useState(1);
  const [selectedCorrection, setSelectedCorrection] = useState<CategoryCorrectionView | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Reset to page 1 whenever the filters change (adjusting state during render
  // instead of an effect, per https://react.dev/learn/you-might-not-need-an-effect).
  const [prevFilters, setPrevFilters] = useState({ categoryFilter, dateRange });
  if (prevFilters.categoryFilter !== categoryFilter || prevFilters.dateRange !== dateRange) {
    setPrevFilters({ categoryFilter, dateRange });
    setActivePage(1);
  }

  const { data, isLoading, isError } = useCategoryCorrections({
    dateRange,
    category: categoryFilter,
    page: activePage,
    pageSize: PAGE_SIZE,
  });

  const pagedCorrections = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const clampedPage = Math.min(activePage, totalPages);
  const pageNumbers = getPageNumbers(clampedPage, totalPages);

  async function handleExportCsv() {
    setIsExporting(true);
    try {
      const rowsData = await exportCategoryCorrections({ dateRange, category: categoryFilter });
      const headers = ["Mô tả giao dịch", "AI đề xuất", "Đã sửa", "Khách hàng", "Thời gian"];
      const rows = rowsData.map((correction) => [
        correction.transactionDescription,
        correction.aiGuess,
        correction.correctedCategoryName,
        correction.customerEmail,
        correction.correctedAtFull,
      ]);
      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
        .join("\r\n");

      const blob = new Blob([`﻿${csvContent}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sua-danh-muc-ai.csv";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Sửa danh mục AI</h1>
        <p className={styles.subtitle}>
          Nhật ký chỉ đọc — theo dõi các lần AI gợi ý sai để cải thiện độ chính xác phân loại.
        </p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
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
        <button
          type="button"
          className={styles.exportButton}
          onClick={handleExportCsv}
          disabled={isExporting}
        >
          <Download size={16} strokeWidth={2} />
          {isExporting ? "Đang xuất…" : "Xuất CSV"}
        </button>
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
            {isLoading ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  Đang tải…
                </td>
              </tr>
            ) : null}
            {isError ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  Không thể tải nhật ký sửa danh mục.
                </td>
              </tr>
            ) : null}
            {!isLoading && !isError
              ? pagedCorrections.map((correction) => (
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
                ))
              : null}
            {!isLoading && !isError && pagedCorrections.length === 0 ? (
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
            disabled={clampedPage === 1}
            onClick={() => setActivePage((page) => Math.max(1, page - 1))}
            aria-label="Trang trước"
          >
            ‹
          </button>
          {pageNumbers.map((page, index) =>
            page === "…" ? (
              <span key={`ellipsis-${index}`} className={styles.pageEllipsis}>
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                className={page === clampedPage ? styles.pageNumberActive : styles.pageNumber}
                onClick={() => setActivePage(page)}
              >
                {page}
              </button>
            )
          )}
          <button
            type="button"
            className={styles.pageNav}
            disabled={clampedPage === totalPages}
            onClick={() => setActivePage((page) => Math.min(totalPages, page + 1))}
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
