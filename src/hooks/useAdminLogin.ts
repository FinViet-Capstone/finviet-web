import { useMutation } from "@tanstack/react-query";

export type AdminLoginResult =
  | { step: "enroll"; totpURI: string; backupCodes: string[] }
  | { step: "totp" }
  | { step: "done" };

// Deliberately not using apiFetch here: its global 401 handler (src/lib/api-client.ts) treats any
// 401 as "your session died, redirect to /login" — correct for an already-authenticated call, but
// wrong for this endpoint, which returns 401 for the completely ordinary case of wrong credentials
// on the login screen itself. Using apiFetch here caused a full-page reload back to /login instead
// of ever showing the "wrong username or password" banner.
export function useAdminLogin() {
  return useMutation({
    mutationFn: async (input: { username: string; password: string }) => {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = (await res.json()) as { success: boolean; data: AdminLoginResult | null; error: string | null };
      if (!body.success || body.data === null) {
        throw new Error(body.error ?? "Đăng nhập thất bại");
      }
      return body.data;
    },
  });
}

// Calls better-auth's own catch-all route directly rather than a custom wrapper — this endpoint
// is already fully implemented by the two-factor plugin and needs no finviet-be-specific logic,
// unlike /api/admin/login. Its envelope isn't the app's usual {success,data,error} shape, so this
// doesn't go through apiFetch.
export function useVerifyTotp() {
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch("/api/auth/two-factor/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(typeof body?.message === "string" ? body.message : "Mã xác thực không đúng");
      }
      return body as { token: string; user: unknown };
    },
  });
}
