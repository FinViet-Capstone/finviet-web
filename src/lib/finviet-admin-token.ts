import { cookies } from "next/headers";
import { AdminSessionError } from "./auth";

const ADMIN_JWT_COOKIE = "finviet_admin_jwt";

/**
 * Reads the finviet-be JWT set by src/app/api/admin/login/route.ts on a sibling httpOnly cookie
 * (better-auth's own session cookie never carries this — see that route's comments). Every
 * src/services/real/*.ts call must fetch this before calling finvietApi, since the browser only
 * ever holds better-auth's session cookie, never this JWT directly.
 *
 * Note: better-auth's own session cookie can outlive this one (its default lifetime is longer
 * than the admin JWT's ~8h expiry) — a missing/expired cookie here throws AdminSessionError,
 * which Route Handlers should surface as a 401 so the client's global 401 handler can redirect to
 * /login, even though the better-auth session itself might still look valid.
 */
export async function getFinvietAdminToken(): Promise<string> {
  const store = await cookies();
  const token = store.get(ADMIN_JWT_COOKIE)?.value;
  if (!token) {
    throw new AdminSessionError();
  }
  return token;
}
