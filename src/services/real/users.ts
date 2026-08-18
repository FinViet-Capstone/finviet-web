import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type { AdminCustomerSummary, ListUsersParams, UsersListResult } from "@/types/users";

// Backed by finviet-be's UsersController (api/users, GET only) and AccountController
// (PUT /api/account/deactivate/{id}), both [Authorize(Roles = "Admin")].
//
// UserResponseDto's totalTransactions/totalWallets/subscriptionPlanCode (added on the fix-dto
// branch — see context/backend-gaps.md) are subquery counts joined server-side, not a full
// per-customer aggregate endpoint. subscriptionPlanCode is a real plan code ("free",
// "premium_monthly", "premium_yearly", ...) — collapsed to the UI's binary free/premium badge in
// toAdminCustomerSummary below, since AdminCustomerSummary.plan only distinguishes those two.
//
// `status` (active/locked) has no server-side filter either — GetUsersQuery only takes
// Page/PageSize/Search — so when a status filter is active, listUsers below pages through every
// Search-matching result (finviet-be's max PageSize is 100/request, capped at
// MAX_STATUS_FILTER_PAGES below to bound the worst case), filters by isActive in Node, and
// paginates the filtered set itself. Correct at any size that fits under the cap; beyond it,
// results silently stop growing rather than paginating further — acceptable for today's user
// counts, but flag this for backend work (a real isActive query param) once it stops being true.

interface UserResponseDto {
  customerId: string;
  email: string | null;
  fullName: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string | null;
  totalTransactions: number;
  totalWallets: number;
  subscriptionPlanCode: string | null;
}

interface PagedResultDto<T> {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[] | null;
}

async function authHeaders() {
  const token = await getFinvietAdminToken();
  return { Authorization: `Bearer ${token}` };
}

function formatCreatedAt(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

function toAdminCustomerSummary(dto: UserResponseDto): AdminCustomerSummary {
  return {
    id: dto.customerId,
    name: dto.fullName ?? dto.email ?? dto.customerId,
    email: dto.email ?? "",
    isActive: dto.isActive,
    createdAt: formatCreatedAt(dto.createdAt),
    totalTransactions: dto.totalTransactions,
    totalWallets: dto.totalWallets,
    plan: dto.subscriptionPlanCode && dto.subscriptionPlanCode !== "free" ? "premium" : "free",
  };
}

const STATUS_FILTER_PAGE_SIZE = 100;
const MAX_STATUS_FILTER_PAGES = 20; // caps the worst case at 2,000 Search-matching customers

async function fetchAllMatching(search: string | undefined, headers: Record<string, string>): Promise<UserResponseDto[]> {
  const all: UserResponseDto[] = [];
  for (let page = 1; page <= MAX_STATUS_FILTER_PAGES; page++) {
    const res = await finvietApi.get<{ success: boolean; message?: string; data: PagedResultDto<UserResponseDto> }>(
      "/api/users",
      { params: { Page: page, PageSize: STATUS_FILTER_PAGE_SIZE, Search: search || undefined }, headers },
    );
    const data = unwrap(res);
    all.push(...(data.items ?? []));
    if (page >= data.totalPages) break;
  }
  return all;
}

export async function listUsers(params: ListUsersParams): Promise<UsersListResult> {
  const headers = await authHeaders();

  if (params.status && params.status !== "all") {
    const all = await fetchAllMatching(params.search, headers);
    const filtered = all.filter((dto) => (params.status === "active" ? dto.isActive : !dto.isActive));
    const start = (params.page - 1) * params.pageSize;
    return {
      items: filtered.slice(start, start + params.pageSize).map(toAdminCustomerSummary),
      total: filtered.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  const res = await finvietApi.get<{ success: boolean; message?: string; data: PagedResultDto<UserResponseDto> }>(
    "/api/users",
    { params: { Page: params.page, PageSize: params.pageSize, Search: params.search || undefined }, headers },
  );
  const data = unwrap(res);
  return {
    items: (data.items ?? []).map(toAdminCustomerSummary),
    total: data.totalItems,
    page: data.page,
    pageSize: data.pageSize,
  };
}

export async function setUserActive(id: string, isActive: boolean): Promise<AdminCustomerSummary> {
  if (isActive) {
    throw new Error("finviet-be chưa có API mở khóa tài khoản — chỉ hỗ trợ khóa (deactivate).");
  }

  const headers = await authHeaders();
  await finvietApi.put(`/api/account/deactivate/${id}`, null, { headers });

  // DeactivateAccountCommandHandler returns a plain status string, not the updated customer —
  // the mutation's onSuccess (src/hooks/useUsers.ts) invalidates the users list query right
  // after, which is what actually refreshes the table row. This return value is never rendered.
  return { id, name: "", email: "", isActive: false, createdAt: "", totalTransactions: 0, totalWallets: 0, plan: "free" };
}

export async function triggerPasswordReset(_id: string, email: string): Promise<{ sent: boolean }> {
  // POST /api/auth/forgot-password is the same public (no [Authorize]) endpoint the mobile app's
  // "forgot password" screen calls — finviet-be has no separate admin-initiated reset endpoint,
  // and no admin-usable lookup from customerId to email either (UsersController has no GET/{id}),
  // so the caller (src/app/(dashboard)/users/page.tsx) passes the email it already has
  // client-side rather than this function resolving it from _id.
  await finvietApi.post("/api/auth/forgot-password", { email });
  return { sent: true };
}
