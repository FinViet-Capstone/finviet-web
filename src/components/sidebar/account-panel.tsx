"use client";

import { useState } from "react";
import { FormModal } from "@/components/form-modal/form-modal";
import styles from "./account-panel.module.css";

interface AccountPanelProps {
  onClose: () => void;
  onSaved: () => void;
}

export function AccountPanel({ onClose, onSaved }: AccountPanelProps) {
  const [name, setName] = useState("Admin");
  const [email, setEmail] = useState("admin@finviet.vn");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (password.length > 0 && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setError(null);
    onSaved();
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
          <button type="button" className={styles.confirmButton} onClick={handleSave}>
            Lưu
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
