import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins/two-factor";
import { admin } from "better-auth/plugins/admin";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { headers } from "next/headers";
import { isMockMode } from "./env";

/**
 * better-auth owns sessions (httpOnly cookie) and 2FA (TOTP) — see
 * context/admin-spec.md, Feature A. It does NOT own the password check:
 * `finviet-be`'s POST /api/auth/admin-login is the source of truth for
 * "is this username/password correct."
 *
 * `emailAndPassword` stays enabled so a per-admin shadow account can sign in
 * locally once provisioned, but `disableSignUp` closes the public sign-up
 * endpoint — accounts are only ever created server-side, from
 * src/app/api/admin/login/route.ts, after finviet-be confirms the
 * credentials. That route (not written yet) is where the actual
 * finviet-be delegation happens: verify via admin-login, then provision
 * (first time) or sign in (auth.api.signUpEmail / auth.api.signInEmail)
 * the matching better-auth shadow account.
 */
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [
    twoFactor(),
    // `disableSignUp` above blocks auth.api.signUpEmail too, not just the public HTTP endpoint —
    // it's enforced inside the shared endpoint handler both paths funnel through. The admin
    // plugin's createUser bypasses that (by design — it's meant for exactly this "provision an
    // account server-side, not via public self-registration" case) as long as it's called without
    // a `headers`/`request` context, which src/app/api/admin/login/route.ts's first-login branch
    // does. Its own HTTP route stays gated behind a session with "create user" permission, so this
    // doesn't reopen public sign-up.
    admin(),
    // Must stay last — patches Next.js's cookies() so the session cookie
    // actually gets set from Server Actions/Route Handlers.
    nextCookies(),
  ],
});

export class AdminSessionError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AdminSessionError";
  }
}

// Every domain Route Handler calls this before touching the service layer, so an unauthenticated
// request never reaches real finviet-be data. Skipped in mock mode: the Login screen is still
// visual-only (not wired to better-auth yet, per context/current-feature.md's history), so no
// real session exists to check there — enforcing this in mock mode would 401 every Route Handler
// and make the mock-backed app unusable. Revisit once Login is wired to a real better-auth sign-in.
export async function requireAdminSession() {
  if (isMockMode()) {
    return null;
  }
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new AdminSessionError();
  }
  return session;
}
