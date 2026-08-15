"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { CredentialStep } from "./credential-step";
import { TotpStep } from "./totp-step";
import { EnrollStep } from "./enroll-step";
import { useAdminLogin, useVerifyTotp } from "@/hooks/useAdminLogin";
import styles from "./login.module.css";

type Step = "credential" | "totp" | "enroll";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credential");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [credentialError, setCredentialError] = useState(false);

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [totpError, setTotpError] = useState(false);
  const [enrollData, setEnrollData] = useState<{ totpURI: string; backupCodes: string[] } | null>(null);

  const adminLogin = useAdminLogin();
  const verifyTotp = useVerifyTotp();

  function handleCredentialSubmit() {
    setCredentialError(false);

    if (!username.trim() || !password.trim()) {
      setCredentialError(true);
      return;
    }

    adminLogin.mutate(
      { username, password },
      {
        onSuccess: (result) => {
          setDigits(Array(6).fill(""));
          setTotpError(false);
          if (result.step === "enroll") {
            setEnrollData({ totpURI: result.totpURI, backupCodes: result.backupCodes });
            setStep("enroll");
          } else if (result.step === "totp") {
            setStep("totp");
          } else {
            router.push("/overview");
          }
        },
        onError: () => setCredentialError(true),
      }
    );
  }

  function handleTotpSubmit() {
    setTotpError(false);

    if (digits.some((digit) => !digit)) {
      setTotpError(true);
      setDigits(Array(6).fill(""));
      return;
    }

    verifyTotp.mutate(digits.join(""), {
      onSuccess: () => router.push("/overview"),
      onError: () => {
        setTotpError(true);
        setDigits(Array(6).fill(""));
      },
    });
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
          loading={adminLogin.isPending}
          error={credentialError}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onSubmit={handleCredentialSubmit}
        />
      ) : step === "enroll" && enrollData ? (
        <EnrollStep
          totpURI={enrollData.totpURI}
          backupCodes={enrollData.backupCodes}
          digits={digits}
          loading={verifyTotp.isPending}
          error={totpError}
          onDigitsChange={setDigits}
          onSubmit={handleTotpSubmit}
        />
      ) : (
        <TotpStep
          digits={digits}
          loading={verifyTotp.isPending}
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
