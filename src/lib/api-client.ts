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
