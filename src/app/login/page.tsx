"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { CredentialStep } from "./credential-step";
import { TotpStep } from "./totp-step";
import styles from "./login.module.css";

type Step = "credential" | "totp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("credential");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [credentialLoading, setCredentialLoading] = useState(false);
  const [credentialError, setCredentialError] = useState(false);

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [totpLoading, setTotpLoading] = useState(false);
  const [totpError, setTotpError] = useState(false);

  function handleCredentialSubmit() {
    setCredentialError(false);

    if (!username.trim() || !password.trim()) {
      setCredentialError(true);
      return;
    }

    setCredentialLoading(true);
    setTimeout(() => {
      setCredentialLoading(false);
      setDigits(Array(6).fill(""));
      setTotpError(false);
      setStep("totp");
    }, 600);
  }

  function handleTotpSubmit() {
    setTotpError(false);

    if (digits.some((digit) => !digit)) {
      setTotpError(true);
      setDigits(Array(6).fill(""));
      return;
    }

    setTotpLoading(true);
    setTimeout(() => {
      setTotpLoading(false);
    }, 600);
  }

  return (
    <div className={styles.page}>
      <div className={styles.logoRow}>
        <div className={styles.logoBadge}>
          <Landmark size={22} strokeWidth={2} />
        </div>
        <span className={styles.logoText}>FinViet Admin</span>
      </div>

      {step === "credential" ? (
        <CredentialStep
          username={username}
          password={password}
          loading={credentialLoading}
          error={credentialError}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onSubmit={handleCredentialSubmit}
        />
      ) : (
        <TotpStep
          digits={digits}
          loading={totpLoading}
          error={totpError}
          onDigitsChange={setDigits}
          onSubmit={handleTotpSubmit}
          onBack={() => setStep("credential")}
        />
      )}

      {step === "credential" && (
        <p className={styles.footerText}>Liên hệ quản trị viên khác nếu bạn không thể đăng nhập</p>
      )}
    </div>
  );
}
