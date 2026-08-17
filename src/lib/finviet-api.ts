import axios from "axios";

// Server-only client for calling finviet-be directly. Used by src/services/real/*.ts once a
// domain flips out of mock mode.
export const finvietApi = axios.create({
  baseURL: process.env.FINVIET_API_BASE_URL,
});

interface FinvietEnvelope<T> {
  success: boolean;
  message?: string | null;
  data: T;
}

// FluentValidation failures (e.g. CreateAdminCommandValidator) come back with a useless generic
// top-level `message` ("Validation failed.") while the actual per-field reasons live in `errors`
// (ASP.NET's ModelState shape: { FieldName: string[] }) — e.g.
// { message: "Validation failed.", errors: { Password: ["Password must contain at least one
// uppercase letter.", "Password must contain at least one digit."] } }. Reproduced live against
// POST /api/admins with a weak password: the admin only ever saw "Validation failed." with zero
// indication of what to fix. `errors`, when present with real messages, is strictly more
// specific than `message` and is preferred.
function extractErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const { message, errors } = data as { message?: unknown; errors?: unknown };
  if (errors && typeof errors === "object") {
    const fieldMessages = Object.values(errors as Record<string, unknown>)
      .flat()
      .filter((m): m is string => typeof m === "string");
    if (fieldMessages.length > 0) return fieldMessages.join(" ");
  }
  return typeof message === "string" && message.length > 0 ? message : undefined;
}

// Axios rejects on any non-2xx response before a caller's `unwrap()` ever runs, so without
// this, finviet-be's actual validation/conflict message (e.g. "Current password is
// incorrect.") gets replaced by axios's generic "Request failed with status code 400" —
// swallowing the one piece of information the frontend needs to show the user. Re-throws
// with the real envelope message when the error response has the expected shape.
finvietApi.interceptors.response.use(undefined, (error) => {
  const message = extractErrorMessage(error?.response?.data);
  if (message) {
    throw new Error(message);
  }
  throw error;
});

export function unwrap<T>(response: { data: FinvietEnvelope<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.message ?? "finviet-be request failed");
  }
  return response.data.data;
}
