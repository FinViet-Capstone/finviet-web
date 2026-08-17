import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type { AdminCustomerSummary, ListUsersParams, UsersListResult } from "@/types/users";

// Backed by finviet-be's UsersController (api/users, GET only) and AccountController
// (PUT /api/account/deactivate/{id}), both [Authorize(Roles = "Admin")].
//
// Two real gaps this can't paper over:
// - UserResponseDto has no totalTransactions/totalWallets/subscription-plan fields — no admin
//   endpoint joins those in yet. Defaulted below (0/0/"free") rather than fetched, since there's
//   no per-customer aggregate endpoint to call. See context/backend-gaps.md.
// - `status` (active/locked) has no server-side filter — GetUsersQuery only takes
//   Page/PageSize/Search. Filtering the fetched page client-side would silently break
//   pagination (total count would no longer match what's actually shown), so status is not
//   applied in real mode; the filter dropdown is a no-op until the backend adds it.

interface UserResponseDto {
  customerId: string;
  email: string | null;
  fullName: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string | null;
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
    totalTransactions: 0,
    totalWallets: 0,
    plan: "free",
  };
}

export async function listUsers(params: ListUsersParams): Promise<UsersListResult> {
  const headers = await authHeaders();
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
