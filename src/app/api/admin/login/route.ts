import { NextResponse } from "next/server";
import axios from "axios";
import { createHmac } from "node:crypto";
import { auth, stashFinvietJwt } from "@/lib/auth";

/**
 * finviet-be is the source of truth for "is this username/password
 * correct" — see context/admin-spec.md, Feature A. This route verifies
 * against POST /api/auth/admin-login, then signs in (or provisions, on
 * first login) a matching better-auth "shadow" account so better-auth can
 * take over the session/2FA layer from there.
 */

interface AdminLoginProfile {
  // finviet-be's AdminLoginCommandHandler maps AdminId into this field.
  customerId: string;
  fullName: string;
  email: string;
}

interface AdminLoginData {
  accessToken: string;
  profile: AdminLoginProfile;
}

interface FinvietApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function deriveShadowPassword(adminId: string): string {
  const secret = process.env.ADMIN_SHADOW_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SHADOW_SECRET is not set");
  }
  // Fixed per admin, derived only from a server-only secret + the admin's
  // id — never from the password they actually typed. That means the
  // shadow account can never drift out of sync if the real finviet-be
  // password changes later: every login re-derives the same value.
  return createHmac("sha256", secret).update(adminId).digest("base64");
}

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 },
    );
  }

  let accessToken: string;
  let profile: AdminLoginProfile;
  try {
    const res = await axios.post<FinvietApiResponse<AdminLoginData>>(
      `${process.env.FINVIET_API_BASE_URL}/api/auth/admin-login`,
      { username, password },
    );
    accessToken = res.data.data.accessToken;
    profile = res.data.data.profile;
  } catch {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 },
    );
  }

  const shadowPassword = deriveShadowPassword(profile.customerId);

  // Not using `asResponse: true` here: nextCookies() (registered last in auth.ts's plugin
  // list) already sets the session cookie as a side effect via next/headers when these
  // calls run inside a Route Handler, so the plain parsed result is enough — and it's the
  // only way to get the new session's own token back, needed below to stash the
  // finviet-be JWT against the right row.
  let result:
    | Awaited<ReturnType<typeof auth.api.signInEmail>>
    | Awaited<ReturnType<typeof auth.api.signUpEmail>>;
  try {
    // Existing shadow account — normal login. (better-auth's signInEmail
    // returns the same generic "invalid email or password" error for both
    // "wrong password" and "no such user," by design, to prevent user
    // enumeration — so we can't distinguish them here, and don't need to:
    // a derived-password mismatch on an internal, server-only-generated
    // password should never happen outside of first login or a bug.)
    result = await auth.api.signInEmail({
      body: { email: profile.email, password: shadowPassword },
    });
  } catch {
    // First login for this admin — provision the shadow account.
    result = await auth.api.signUpEmail({
      body: {
        email: profile.email,
        name: profile.fullName,
        password: shadowPassword,
      },
    });
  }

  // `token` is absent when 2FA is enabled and this login only produced a pending-2FA
  // cookie rather than a full session — nothing to stash the JWT against yet in that case.
  if ("token" in result && result.token) {
    await stashFinvietJwt(result.token, accessToken);
  }

  return NextResponse.json(result);
}
