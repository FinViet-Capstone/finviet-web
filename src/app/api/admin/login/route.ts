import { NextResponse } from "next/server";
import axios from "axios";
import { createHmac } from "node:crypto";
import { auth } from "@/lib/auth";
import { jsonSuccess } from "@/lib/api-response";

/**
 * finviet-be is the source of truth for "is this username/password
 * correct" — see context/admin-spec.md, Feature A. This route verifies
 * against POST /api/auth/admin-login, then signs in (or provisions, on
 * first login) a matching better-auth "shadow" account so better-auth can
 * take over the session/2FA layer from there.
 *
 * 2FA is mandatory on every admin login (see project-spec.md Feature A). On a brand-new shadow
 * account (first-ever login) this route also enrolls TOTP immediately, using the shadow password
 * the admin never sees — the client couldn't call enableTwoFactor itself for that reason. Returning
 * admins go through the ordinary signInEmail path, which better-auth's own two-factor plugin
 * downgrades to a "twoFactorRedirect" pending state once 2FA is enabled, instead of a full session.
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

type LoginStep =
  | { step: "enroll"; totpURI: string; backupCodes: string[] }
  | { step: "totp" }
  | { step: "done" };

const ADMIN_JWT_COOKIE = "finviet_admin_jwt";

// A sibling, first-party cookie alongside better-auth's own session cookie — better-auth has no
// plugin hook for storing an opaque third-party JWT inside its own session record, so this stays
// separate. Read back by src/lib/finviet-admin-token.ts. src/services/real/*.ts needs finviet-be's
// actual JWT to call finviet-be directly, but better-auth's session cookie never carries it.
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

// The Set-Cookie values on a better-auth `asResponse: true` result, joined into a `Cookie:`
// request header — used to carry a session this route just created into a second, internal
// better-auth call (enableTwoFactor) that requires that session to already exist.
function cookieHeaderFrom(response: Response): string {
  return response.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
}

function withCookiesFrom(authResponse: Response, adminJwtCookie: string, body: LoginStep) {
  const res = jsonSuccess(body);
  for (const cookie of authResponse.headers.getSetCookie()) {
    res.headers.append("Set-Cookie", cookie);
  }
  res.headers.append("Set-Cookie", adminJwtCookie);
  return res;
}

export async function POST(request: Request) {
  try {
    return await handleLogin(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[admin/login] unhandled error:", message);
    return NextResponse.json(
      { success: false, data: null, error: message },
      { status: 500 },
    );
  }
}

async function handleLogin(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { success: false, data: null, error: "Username and password are required" },
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
      { success: false, data: null, error: "Tên đăng nhập hoặc mật khẩu không đúng" },
      { status: 401 },
    );
  }

  const { profile, accessToken, accessTokenExpiry } = data;
  const shadowPassword = deriveShadowPassword(profile.customerId);
  const maxAgeSeconds = Math.floor((new Date(accessTokenExpiry).getTime() - Date.now()) / 1000);
  const adminJwtCookie = buildAdminJwtCookie(accessToken, maxAgeSeconds);

  let signInResponse: Response | null = null;
  try {
    signInResponse = await auth.api.signInEmail({
      body: { email: profile.email, password: shadowPassword },
      asResponse: true,
    });
  } catch {
    signInResponse = null;
  }

  if (signInResponse?.ok) {
    const body = (await signInResponse.clone().json()) as { twoFactorRedirect?: boolean };
    const step: LoginStep = body.twoFactorRedirect ? { step: "totp" } : { step: "done" };
    return withCookiesFrom(signInResponse, adminJwtCookie, step);
  }

  const createResult = await auth.api.createUser({
    body: {
      email: profile.email,
      name: profile.fullName,
      password: shadowPassword,
    },
  });
  if (!createResult?.user) {
    return NextResponse.json(
      { success: false, data: null, error: "Could not provision admin account" },
      { status: 500 },
    );
  }

  const signUpResponse = await auth.api.signInEmail({
    body: { email: profile.email, password: shadowPassword },
    asResponse: true,
  });
  if (!signUpResponse.ok) {
    const errorBody = (await signUpResponse.clone().json().catch(() => null)) as { message?: string } | null;
    return NextResponse.json(
      { success: false, data: null, error: errorBody?.message ?? "Could not sign in" },
      { status: signUpResponse.status },
    );
  }

  const { totpURI, backupCodes } = await auth.api.enableTwoFactor({
    body: { password: shadowPassword, issuer: "FinViet Admin" },
    headers: new Headers({ cookie: cookieHeaderFrom(signUpResponse) }),
  });

  return withCookiesFrom(signUpResponse, adminJwtCookie, { step: "enroll", totpURI, backupCodes });
}
