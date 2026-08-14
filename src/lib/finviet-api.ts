import axios from "axios";

// Server-only client for calling finviet-be directly. Used by src/services/real/*.ts once a
// domain flips out of mock mode — see the JWT-propagation gap noted in context/current-feature.md
// (src/app/api/admin/login/route.ts doesn't persist the finviet-be JWT anywhere yet, so real/*.ts
// implementations can't authenticate until that's solved).
export const finvietApi = axios.create({
  baseURL: process.env.FINVIET_API_BASE_URL,
});

interface FinvietEnvelope<T> {
  success: boolean;
  message?: string | null;
  data: T;
}

export function unwrap<T>(response: { data: FinvietEnvelope<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.message ?? "finviet-be request failed");
  }
  return response.data.data;
}
