"use client";

import { useState } from "react";
import { Filter, KeyRound, Lock, Search, Unlock } from "lucide-react";
import { ConfirmationModal, type ConfirmationModalVariant } from "@/components/confirmation-modal/confirmation-modal";
import { getPageNumbers } from "@/lib/pagination";
import { useSetUserActive, useTriggerPasswordReset, useUsers } from "@/hooks/useUsers";
import type { AdminCustomerSummary } from "@/types/users";
import styles from "./users.module.css";

type StatusFilter = "all" | "active" | "locked";
type ModalAction = "lock" | "unlock" | "reset";

interface ModalState {
  action: ModalAction;
  customer: AdminCustomerSummary;
}

const statusFilterOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Trạng thái: Tất cả" },
  { value: "active", label: "Trạng thái: Hoạt động" },
  { value: "locked", label: "Trạng thái: Khóa" },
];

const modalCopyByAction: Record<
  ModalAction,
  { title: string; description: (email: string) => string; confirmLabel: string; variant: ConfirmationModalVariant }
> = {
  lock: {
    title: "Khóa tài khoản?",
    description: (email) => `Khóa tài khoản ${email}? Người dùng sẽ không thể đăng nhập.`,
    confirmLabel: "Xác nhận",
    variant: "destructive",
  },
  unlock: {
    title: "Mở khóa tài khoản?",
    description: (email) => `Mở khóa tài khoản ${email}? Người dùng sẽ có thể đăng nhập trở lại.`,
    confirmLabel: "Xác nhận",
    variant: "primary",
  },
  reset: {
    title: "Đặt lại mật khẩu?",
    description: (email) => `Gửi email đặt lại mật khẩu cho ${email}?`,
    confirmLabel: "Gửi",
    variant: "primary",
  },
};

const PAGE_SIZE = 10;

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activePage, setActivePage] = useState(1);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Reset to page 1 whenever the filters change (adjusting state during render
  // instead of an effect, per https://react.dev/learn/you-might-not-need-an-effect).
  const [prevFilters, setPrevFilters] = useState({ search, statusFilter });
  if (prevFilters.search !== search || prevFilters.statusFilter !== statusFilter) {
    setPrevFilters({ search, statusFilter });
    setActivePage(1);
  }

  const { data, isLoading, isError } = useUsers({
    search,
    status: statusFilter,
    page: activePage,
    pageSize: PAGE_SIZE,
  });
  const setUserActive = useSetUserActive();
  const triggerPasswordReset = useTriggerPasswordReset();

  const pagedCustomers = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const clampedPage = Math.min(activePage, totalPages);
  const pageNumbers = getPageNumbers(clampedPage, totalPages);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  function handleConfirm() {
    if (!modal) return;
    const { action, customer } = modal;

    if (action === "reset") {
      triggerPasswordReset.mutate(
        { id: customer.id, email: customer.email },
        {
          onSuccess: () => showToast(`Đã gửi email đặt lại mật khẩu cho ${customer.email}`),
          onError: (err) => showToast(err instanceof Error ? err.message : "Không thể gửi email đặt lại mật khẩu."),
        }
      );
    } else {
      const willBeActive = action === "unlock";
      setUserActive.mutate(
        { id: customer.id, isActive: willBeActive },
        {
          onSuccess: () =>
            showToast(
              willBeActive
                ? `Đã mở khóa tài khoản ${customer.email}`
                : `Đã khóa tài khoản ${customer.email}`
            ),
          onError: (err) =>
            showToast(
              err instanceof Error
                ? err.message
                : willBeActive
                  ? "Không thể mở khóa tài khoản."
                  : "Không thể khóa tài khoản."
            ),
        }
      );
    }

    setModal(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Người dùng</h1>
        <p className={styles.subtitle}>Tìm kiếm, lọc và quản lý tài khoản khách hàng</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} strokeWidth={2} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo tên hoặc email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className={styles.filterBox}>
          <Filter size={16} strokeWidth={2} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            aria-label="Lọc theo trạng thái"
          >
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Tổng GD</th>
              <th>Tổng ví</th>
              <th>Gói</th>
              <th aria-hidden />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  Đang tải…
                </td>
              </tr>
            ) : null}
            {isError ? (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  Không thể tải danh sách khách hàng.
                </td>
              </tr>
            ) : null}
            {!isLoading && !isError
              ? pagedCustomers.map((customer) => (
                  <tr key={customer.id} className={styles.row}>
                    <td className={styles.nameCell}>{customer.name}</td>
                    <td className={styles.mutedCell}>{customer.email}</td>
                    <td>
                      <span className={customer.isActive ? styles.statusActive : styles.statusLocked}>
                        <span className={styles.statusDot} />
                        {customer.isActive ? "Hoạt động" : "Khóa"}
                      </span>
                    </td>
                    <td className={styles.mutedCell}>{customer.createdAt}</td>
                    <td>{customer.totalTransactions}</td>
                    <td>{customer.totalWallets}</td>
                    <td>
                      <span className={customer.plan === "premium" ? styles.planPremium : styles.planFree}>
                        {customer.plan === "premium" ? "Premium" : "Free"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {customer.isActive ? (
                          <button
                            type="button"
                            className={styles.actionButtonDanger}
                            aria-label={`Khóa tài khoản ${customer.email}`}
                            onClick={() => setModal({ action: "lock", customer })}
                          >
                            <Lock size={16} strokeWidth={2} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.actionButtonNeutral}
                            aria-label={`Mở khóa tài khoản ${customer.email}`}
                            onClick={() => setModal({ action: "unlock", customer })}
                          >
                            <Unlock size={16} strokeWidth={2} />
                          </button>
                        )}
                        <button
                          type="button"
                          className={styles.actionButtonNeutral}
                          aria-label={`Đặt lại mật khẩu cho ${customer.email}`}
                          onClick={() => setModal({ action: "reset", customer })}
                        >
                          <KeyRound size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              : null}
            {!isLoading && !isError && pagedCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  Không tìm thấy khách hàng phù hợp.
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

      {modal ? (
        <ConfirmationModal
          isOpen
          title={modalCopyByAction[modal.action].title}
          description={modalCopyByAction[modal.action].description(modal.customer.email)}
          confirmLabel={modalCopyByAction[modal.action].confirmLabel}
          variant={modalCopyByAction[modal.action].variant}
          onCancel={() => setModal(null)}
          onConfirm={handleConfirm}
        />
      ) : null}

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}
