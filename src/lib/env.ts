// Domains whose src/services/real/*.ts is an actual finviet-be implementation today. Every other
// domain's real/*.ts is an intentional "not implemented" stub, so it must always fall back to
// mock regardless of the global USE_MOCK_API flag — there's no real endpoint to call yet.
const REAL_BACKED_DOMAINS = new Set([
  "overview",
  "plans",
  "admins",
  "announcements",
  "buckets",
  "categories",
  "category-corrections",
  "knowledge-base",
  "scoring",
  "users",
]);

export type Domain =
  | "admins"
  | "announcements"
  | "buckets"
  | "categories"
  | "category-corrections"
  | "knowledge-base"
  | "overview"
  | "plans"
  | "scoring"
  | "users";

function globalMockFlag(): boolean {
  return (process.env.USE_MOCK_API ?? "true").toLowerCase() !== "false";
}

// Called with no domain by requireAdminSession() (a global session-check bypass, not a
// per-domain data concern) — that call keeps its original global-only behavior.
export function isMockMode(domain?: Domain): boolean {
  if (domain && !REAL_BACKED_DOMAINS.has(domain)) {
    return true;
  }
  return globalMockFlag();
}
