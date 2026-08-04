"use client";

import { useRef } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import styles from "./login.module.css";

const DIGIT_COUNT = 6;

interface TotpStepProps {
  digits: string[];
  loading: boolean;
  error: boolean;
  onDigitsChange: (digits: string[]) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function TotpStep({ digits, loading, error, onDigitsChange, onSubmit, onBack }: TotpStepProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function handleDigitChange(index: number, rawValue: string) {
    const value = rawValue.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = value;
    onDigitsChange(next);

    if (value && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <form
      className={styles.card}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h1 className={styles.title}>Xác thực 2 lớp</h1>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} strokeWidth={2} />
          <span>Mã xác thực không đúng</span>
        </div>
      )}

      <p className={styles.instruction}>Nhập mã 6 chữ số từ ứng dụng xác thực của bạn</p>

      <div className={styles.digitsRow}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            className={`${styles.digitBox} ${error ? styles.digitBoxError : ""}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
          />
        ))}
      </div>

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : "Xác minh"}
      </button>

      <button type="button" className={styles.backLink} onClick={onBack}>
        <ArrowLeft size={16} />
        <span>Quay lại</span>
      </button>
    </form>
  );
}
