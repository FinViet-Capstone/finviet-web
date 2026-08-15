"use client";

import { useState } from "react";
import { Plus, UserCog } from "lucide-react";
import { ConfirmationModal } from "@/components/confirmation-modal/confirmation-modal";
import { FormModal } from "@/components/form-modal/form-modal";
import { useAdmins, useCreateAdmin } from "@/hooks/useAdmins";
import type { CreateAdminInput } from "@/types/admins";
import styles from "./admins.module.css";

const emptyForm: CreateAdminInput = { username: "", email: "", password: "" };

export default function AdminsPage() {
  const { data: admins = [], isLoading, isError } = useAdmins();
  const createAdmin = useCreateAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CreateAdminInput>(emptyForm);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }

  function openAddForm() {
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  }

  function handleSubmit() {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setFormError(null);
    setIsFormOpen(false);
    setIsConfirmOpen(true);
  }

  function handleConfirmCreate() {
    createAdmin.mutate(form, {
      onSuccess: () => showToast(`Đã tạo tài khoản quản trị viên ${form.username}`),
      onError: (err) => showToast(err instanceof Error ? err.message : "Không thể tạo tài khoản."),
    });
    setIsConfirmOpen(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản trị viên</h1>
        <p className={styles.subtitle}>Danh sách tài khoản quản trị viên và tạo tài khoản mới</p>
      </div>

      <div className={styles.toolbar}>
        <button type="button" className={styles.addButton} onClick={openAddForm}>
          <Plus size={16} strokeWidth={2} />
          Thêm quản trị viên
        </button>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className={styles.emptyState}>
                  Đang tải…
                </td>
              </tr>
            ) : null}
            {isError ? (
              <tr>
                <td colSpan={3} className={styles.emptyState}>
                  Không thể tải danh sách quản trị viên.
                </td>
              </tr>
            ) : null}
            {!isLoading && !isError
              ? admins.map((admin) => (
                  <tr key={admin.adminId} className={styles.row}>
                    <td className={styles.nameCell}>
                      <UserCog size={14} strokeWidth={2} style={{ marginRight: 8, verticalAlign: "text-bottom" }} />
                      {admin.username}
                    </td>
                    <td className={styles.mutedCell}>{admin.email}</td>
                    <td className={styles.mutedCell}>{new Date(admin.createdAt).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))
              : null}
            {!isLoading && !isError && admins.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.emptyState}>
                  Chưa có quản trị viên nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {isFormOpen ? (
        <FormModal
          title="Thêm quản trị viên"
          onClose={() => setIsFormOpen(false)}
          footer={
            <>
              <button type="button" className={styles.cancelButton} onClick={() => setIsFormOpen(false)}>
                Hủy
              </button>
              <button type="button" className={styles.confirmButton} onClick={handleSubmit}>
                Tiếp tục
              </button>
            </>
          }
        >
          <label className={styles.field}>
            <span className={styles.label}>Tên đăng nhập</span>
            <input
              type="text"
              className={styles.input}
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              type="email"
              className={styles.input}
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Mật khẩu ban đầu</span>
            <input
              type="password"
              className={styles.input}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>
          {formError ? <p className={styles.fieldError}>{formError}</p> : null}
        </FormModal>
      ) : null}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Tạo tài khoản quản trị viên?"
        description={`Tạo tài khoản quản trị viên cho "${form.username}"? Hãy thông báo mật khẩu ban đầu cho họ qua một kênh riêng và đề nghị họ đổi mật khẩu ngay sau khi đăng nhập.`}
        confirmLabel="Tạo tài khoản"
        variant="warning"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmCreate}
      />

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}
