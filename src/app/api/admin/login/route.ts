import { NextResponse } from "next/server";
import axios from "axios";
import { createHmac } from "node:crypto";
import { auth } from "@/lib/auth";

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
  profile: AdminLoginProfile;
  accessToken: string;
  accessTokenExpiry: string; // ISO date string
}

interface FinvietApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const ADMIN_JWT_COOKIE = "finviet_admin_jwt";

// A sibling, first-party cookie alongside better-auth's own session cookie — better-auth has no
// plugin hook for storing an opaque third-party JWT inside its own session record, so this stays
// separate. Read back by src/lib/finviet-admin-token.ts. See context/current-feature.md's history
// for why this exists: src/services/real/*.ts needs finviet-be's actual JWT to call finviet-be
// directly, but better-auth's session cookie never carries it.
function buildAdminJwtCookie(token: string, maxAgeSeconds: number): string {
  const parts = [
    `${ADMIN_JWT_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    `Max-Age=${Math.max(60, maxAgeSeconds)}`,
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
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

  let data: AdminLoginData;
  try {
    const res = await axios.post<FinvietApiResponse<AdminLoginData>>(
      `${process.env.FINVIET_API_BASE_URL}/api/auth/admin-login`,
      { username, password },
    );
    data = res.data.data;
  } catch {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 },
    );
  }

  const { profile, accessToken, accessTokenExpiry } = data;
  const shadowPassword = deriveShadowPassword(profile.customerId);

  let response: Response;
  try {
    // Existing shadow account — normal login. (better-auth's signInEmail
    // returns the same generic "invalid email or password" error for both
    // "wrong password" and "no such user," by design, to prevent user
    // enumeration — so we can't distinguish them here, and don't need to:
    // a derived-password mismatch on an internal, server-only-generated
    // password should never happen outside of first login or a bug.)
    response = await auth.api.signInEmail({
      body: { email: profile.email, password: shadowPassword },
      asResponse: true,
    });
  } catch {
    // First login for this admin — provision the shadow account.
    response = await auth.api.signUpEmail({
      body: {
        email: profile.email,
        name: profile.fullName,
        password: shadowPassword,
      },
      asResponse: true,
    });
  }

  const maxAgeSeconds = Math.floor((new Date(accessTokenExpiry).getTime() - Date.now()) / 1000);
  response.headers.append("Set-Cookie", buildAdminJwtCookie(accessToken, maxAgeSeconds));
  return response;
}
