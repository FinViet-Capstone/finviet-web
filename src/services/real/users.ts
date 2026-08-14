import type { AdminCustomerSummary, ListUsersParams, UsersListResult } from "@/types/users";

// No admin user-list/lock endpoint exists in finviet-be yet (see context/project-spec.md
// Feature C and context/backend-gaps.md). triggerPasswordReset could wire real sooner, since
// POST /api/auth/forgot-password already exists, but stays a stub here too for consistency
// until the JWT-propagation gap (see src/lib/finviet-api.ts) is solved.

export async function listUsers(_params: ListUsersParams): Promise<UsersListResult> {
  throw new Error("Not implemented: finviet-be has no admin user-list endpoint yet");
}

export async function setUserActive(_id: string, _isActive: boolean): Promise<AdminCustomerSummary> {
  throw new Error("Not implemented: finviet-be has no admin user-lock endpoint yet");
}

export async function triggerPasswordReset(_id: string): Promise<{ sent: boolean }> {
  throw new Error("Not implemented: admin-initiated password reset endpoint not wired yet");
}
