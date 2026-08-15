import { auth } from "@/lib/auth";

const ADMIN_JWT_COOKIE = "finviet_admin_jwt";

// Clears both cookies the admin session depends on: better-auth's own (via auth.api.signOut)
// and the sibling finviet_admin_jwt cookie (see src/app/api/admin/login/route.ts) — better-auth's
// sign-out has no idea that second cookie exists, so it never touches it on its own.
export async function POST(request: Request) {
  const response = await auth.api.signOut({
    headers: request.headers,
    asResponse: true,
  });

  const clearCookie = [
    `${ADMIN_JWT_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Max-Age=0",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") clearCookie.push("Secure");
  response.headers.append("Set-Cookie", clearCookie.join("; "));

  return response;
}
