interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  // Skip the JSON content-type for FormData bodies (e.g. file uploads) — the browser sets its
  // own multipart boundary, and overriding it here would break parsing on the server.
  const isFormData = init?.body instanceof FormData;
  const res = await fetch(input, {
    ...init,
    headers: isFormData ? init?.headers : { "Content-Type": "application/json", ...init?.headers },
  });
  const body = (await res.json()) as ApiEnvelope<T>;
  if (!body.success || body.data === null) {
    // A 401 here means the admin JWT cookie (see src/lib/finviet-admin-token.ts) is missing or
    // expired — this can happen even while better-auth's own session still looks valid, since
    // the two cookies have different lifetimes. Redirect rather than surfacing a raw error toast.
    if (res.status === 401 && typeof window !== "undefined") {
      // Plain utility function, not a component — useRouter() isn't available here, and a full
      // reload is actually wanted anyway (clears client-side query cache/state on auth failure).
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
    throw new Error(body.error ?? "Request failed");
  }
  return body.data;
}

export function toQueryString(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== null) search.set(key, String(value));
  }
  return search.toString();
}
