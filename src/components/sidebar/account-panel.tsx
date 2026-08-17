"use client";

import { useState } from "react";
import { FormModal } from "@/components/form-modal/form-modal";
import { useChangeAdminPassword } from "@/hooks/useAdmins";
import styles from "./account-panel.module.css";

interface AccountPanelProps {
  name: string;
  email: string;
  onClose: () => void;
  onSaved: () => void;
}

export function AccountPanel({ name: initialName, email: initialEmail, onClose, onSaved }: AccountPanelProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const changePassword = useChangeAdminPassword();

  function handleSave() {
    // Leaving the new-password field blank means "not changing password" — no call made.
    if (password.length === 0) {
      setError(null);
      onSaved();
      return;
    }
    if (!currentPassword.trim()) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setError(null);
    changePassword.mutate(
      { currentPassword, newPassword: password },
      {
        onSuccess: () => onSaved(),
        onError: (err) => setError(err instanceof Error ? err.message : "Không thể đổi mật khẩu."),
      }
    );
  }

  return (
    <FormModal
      title="Tài khoản của tôi"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Hủy
          </button>
          <button type="button" className={styles.confirmButton} onClick={handleSave} disabled={changePassword.isPending}>
            {changePassword.isPending ? "Đang lưu…" : "Lưu"}
          </button>
        </>
      }
    >
      <label className={styles.field}>
        <span className={styles.label}>Họ tên</span>
        <input type="text" className={styles.input} value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          type="email"
          className={styles.input}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Mật khẩu hiện tại</span>
        <input
          type="password"
          className={styles.input}
          placeholder="Bắt buộc nếu đổi mật khẩu"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Mật khẩu mới</span>
        <input
          type="password"
          className={styles.input}
          placeholder="Để trống nếu không đổi mật khẩu"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Xác nhận mật khẩu mới</span>
        <input
          type="password"
          className={styles.input}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </label>
      {error ? <p className={styles.error}>{error}</p> : null}
    </FormModal>
  );
}
