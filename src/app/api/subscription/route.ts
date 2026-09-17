import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { finvietApi, unwrap } from "@/lib/finviet-api";
import { HttpError } from "@/lib/http-error";
import type { SubscriptionCheckout } from "@/types/subscription";

const COOKIE = "finviet_customer_checkout";
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/api/subscription" };
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(256) });
const checkoutSchema = z.object({ planId: z.string().uuid(), key: z.string().uuid() });

function ok(data: unknown) {
  return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
}

function fail(error: unknown) {
  const status = error instanceof HttpError ? error.status : error instanceof z.ZodError ? 400 : 502;
  const message = error instanceof HttpError ? error.message : error instanceof z.ZodError
    ? "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại." : "Không thể kết nối máy chủ. Vui lòng thử lại.";
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

async function authHeaders() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) throw new HttpError(401, "Vui lòng đăng nhập tài khoản FinViet.");
  return { Authorization: `Bearer ${token}` };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const headers = await authHeaders();
    let path: string;
    switch (action) {
      case "session": path = "/api/profile"; break;
      case "plans": path = "/api/subscriptions/plans"; break;
      case "current": path = "/api/subscriptions/current"; break;
      case "payment": {
        const id = z.string().uuid().parse(url.searchParams.get("id"));
        path = `/api/subscriptions/payments/${id}`;
        break;
      }
      default: throw new HttpError(400, "Yêu cầu không hợp lệ.");
    }
    return ok(unwrap(await finvietApi.get(path, { headers, timeout: 15000 })));
  } catch (error) { return fail(error); }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    if (request.headers.get("origin") !== url.origin)
      throw new HttpError(403, "Nguồn yêu cầu không hợp lệ.");
    const action = url.searchParams.get("action");
    if (action === "login") {
      const input = loginSchema.parse(await request.json());
      const result = unwrap<{ accessToken: string; accessTokenExpiry: string }>(
        await finvietApi.post("/api/auth/login", input, { timeout: 15000 }));
      if (!result.accessToken) throw new HttpError(502, "Đăng nhập chưa hoàn tất.");
      const ttl = Math.floor((Date.parse(result.accessTokenExpiry) - Date.now()) / 1000);
      (await cookies()).set(COOKIE, result.accessToken, { ...cookieOptions, maxAge: Number.isFinite(ttl) ? Math.max(0, ttl) : 900 });
      return ok(true);
    }
    if (action === "logout") {
      (await cookies()).set(COOKIE, "", { ...cookieOptions, maxAge: 0 });
      return ok(true);
    }
    if (action !== "subscribe") throw new HttpError(400, "Yêu cầu không hợp lệ.");
    const headers = await authHeaders();
    const input = checkoutSchema.parse(await request.json());
    const result = unwrap<SubscriptionCheckout>(await finvietApi.post("/api/subscriptions/subscribe", {
      planId: input.planId, bankCode: "VNPAYQR", returnUrl: `${url.origin}/subscription`,
    }, { headers: { ...headers, "Idempotency-Key": input.key }, timeout: 20000 }));
    return ok(result);
  } catch (error) { return fail(error); }
}
