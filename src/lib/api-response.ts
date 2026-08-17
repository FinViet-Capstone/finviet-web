import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AdminSessionError } from "./auth";
import { HttpError } from "./http-error";

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data, error: null }, { status });
}

export function jsonError(err: unknown) {
  if (err instanceof AdminSessionError) {
    return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
  }
  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => issue.message).join("; ");
    return NextResponse.json({ success: false, data: null, error: message }, { status: 400 });
  }
  if (err instanceof HttpError) {
    return NextResponse.json({ success: false, data: null, error: err.message }, { status: err.status });
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  return NextResponse.json({ success: false, data: null, error: message }, { status: 400 });
}
