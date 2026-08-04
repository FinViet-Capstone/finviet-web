import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins/two-factor";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

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
    // Must stay last — patches Next.js's cookies() so the session cookie
    // actually gets set from Server Actions/Route Handlers.
    nextCookies(),
  ],
});
