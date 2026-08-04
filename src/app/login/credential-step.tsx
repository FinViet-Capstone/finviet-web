"use client";

import { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import styles from "./login.module.css";

interface CredentialStepProps {
  username: string;
  password: string;
  loading: boolean;
  error: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export function CredentialStep({
  username,
  password,
  loading,
  error,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: CredentialStepProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className={styles.card}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h1 className={styles.title}>Đăng nhập</h1>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} strokeWidth={2} />
          <span>Tên đăng nhập hoặc mật khẩu không đúng</span>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="username">
          Tên đăng nhập
        </label>
        <input
          id="username"
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          Mật khẩu
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="password"
            className={`${styles.input} ${error ? styles.inputError : ""}`}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
          <button
            type="button"
            className={styles.toggleVisibility}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : "Đăng nhập"}
      </button>
    </form>
  );
}
