import axios from "axios";
import { HttpError } from "./http-error";

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

// Axios rejects on any non-2xx response before a caller's `unwrap()` ever runs, so without
// this, finviet-be's actual validation/conflict message (e.g. "Current password is
// incorrect.") gets replaced by axios's generic "Request failed with status code 400" —
// swallowing the one piece of information the frontend needs to show the user. Re-throws as an
// HttpError carrying the real status, so jsonError() in src/lib/api-response.ts doesn't have to
// collapse every finviet-be failure (401/403/404/500/...) down to a generic 400.
finvietApi.interceptors.response.use(undefined, (error) => {
  const status = error?.response?.status ?? 500;
  const message = error?.response?.data?.message;
  if (typeof message === "string" && message.length > 0) {
    throw new HttpError(status, message);
  }
  throw error;
});

export function unwrap<T>(response: { data: FinvietEnvelope<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.message ?? "finviet-be request failed");
  }
  return response.data.data;
}
