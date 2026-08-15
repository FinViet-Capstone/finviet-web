"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { AlertCircle, Check, Copy } from "lucide-react";
import styles from "./login.module.css";

const DIGIT_COUNT = 6;

interface EnrollStepProps {
  totpURI: string;
  backupCodes: string[];
  digits: string[];
  loading: boolean;
  error: boolean;
  onDigitsChange: (digits: string[]) => void;
  onSubmit: () => void;
}

function extractSecret(totpURI: string): string {
  try {
    return new URL(totpURI).searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}

export function EnrollStep({
  totpURI,
  backupCodes,
  digits,
  loading,
  error,
  onDigitsChange,
  onSubmit,
}: EnrollStepProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const secret = extractSecret(totpURI);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(totpURI, { width: 180, margin: 1 }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [totpURI]);

  function handleCopyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

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
      <h1 className={styles.title}>Thiết lập xác thực 2 lớp</h1>

      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} strokeWidth={2} />
          <span>Mã xác thực không đúng</span>
        </div>
      )}

      <p className={styles.instruction}>
        Quét mã QR bằng ứng dụng xác thực (Google Authenticator, Authy, ...) hoặc nhập mã thủ công
      </p>

      <div className={styles.qrWrapper}>
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="Mã QR xác thực 2 lớp" width={160} height={160} />
        ) : (
          <div className={styles.qrPlaceholder} />
        )}
      </div>

      {secret ? <p className={styles.manualSecret}>{secret}</p> : null}

      <div className={styles.backupCodesBox}>
        <div className={styles.backupCodesHeader}>
          <span className={styles.label}>Mã dự phòng (dùng khi mất thiết bị xác thực)</span>
          <button type="button" className={styles.copyButton} onClick={handleCopyBackupCodes}>
            {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={2} />}
            {copied ? "Đã sao chép" : "Sao chép"}
          </button>
        </div>
        <div className={styles.backupCodesGrid}>
          {backupCodes.map((code) => (
            <span key={code} className={styles.backupCode}>
              {code}
            </span>
          ))}
        </div>
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
        />
        <span>Tôi đã lưu các mã dự phòng này ở nơi an toàn</span>
      </label>

      <p className={styles.instruction}>Nhập mã 6 chữ số từ ứng dụng xác thực để hoàn tất</p>

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
            disabled={!acknowledged}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
          />
        ))}
      </div>

      <button type="submit" className={styles.submitButton} disabled={loading || !acknowledged}>
        {loading ? <span className={styles.spinner} /> : "Hoàn tất thiết lập"}
      </button>
    </form>
  );
}
