import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins/two-factor";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { headers } from "next/headers";
import { isMockMode } from "./env";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
  database: pool,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  // finvietAccessToken: the finviet-be JWT for this admin, stashed here at login
  // (src/app/api/admin/login/route.ts) so Route Handlers can attach it when calling
  // finviet-be as this admin — see getFinvietJwt() below. Lives on the session, not the
  // user, since a fresh one is minted every login and it's short-lived (~15 min, no
  // working refresh token yet — see project-spec.md's Feature A gap note).
  session: {
    additionalFields: {
      finvietAccessToken: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    twoFactor(),
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

// The finviet-be JWT for the current admin session, for Route Handlers to attach as
// `Authorization: Bearer <token>` when calling finviet-be. Null if there's no session, or
// the session predates this field being introduced. Not usable ~15 minutes after login —
// see the `finvietAccessToken` comment above.
export async function getFinvietJwt(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const token = (session?.session as { finvietAccessToken?: string } | undefined)?.finvietAccessToken;
  return token ?? null;
}

// Stashes the finviet-be JWT on a just-created/just-signed-in better-auth session row.
// better-auth's high-level signIn/signUp calls don't expose a way to set a custom session
// field inline, so this updates it directly via the same pool `auth` uses, keyed by the
// session token from that call's own Set-Cookie-bearing response.
export async function stashFinvietJwt(sessionToken: string, finvietAccessToken: string): Promise<void> {
  await pool.query(`UPDATE "session" SET "finvietAccessToken" = $1 WHERE "token" = $2`, [
    finvietAccessToken,
    sessionToken,
  ]);
}
