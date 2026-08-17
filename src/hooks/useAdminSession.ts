import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface AdminSessionUser {
  name: string;
  email: string;
}

// Calls better-auth's own /api/auth/get-session directly (already live via the [...all]
// catch-all route) rather than a custom wrapper — no finviet-be-specific logic needed here,
// matching the pattern used by useVerifyTotp/useVerifyBackupCode. Returns null both when
// unauthenticated and in mock mode (where login is still visual-only, so no real session cookie
// is ever set) — callers should fall back to a placeholder in that case.
export function useAdminSession() {
  return useQuery({
    queryKey: queryKeys.adminSession.current(),
    queryFn: async (): Promise<AdminSessionUser | null> => {
      const res = await fetch("/api/auth/get-session");
      if (!res.ok) return null;
      const body = await res.json();
      if (!body?.user) return null;
      return { name: body.user.name, email: body.user.email };
    },
  });
}
