import type { AdminAccount, AdminChangePasswordInput, CreateAdminInput } from "@/types/admins";
import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";

async function authHeaders() {
  const token = await getFinvietAdminToken();
  return { Authorization: `Bearer ${token}` };
}

export async function listAdmins(): Promise<AdminAccount[]> {
  const res = await finvietApi.get<{ success: boolean; message?: string; data: AdminAccount[] }>(
    "/api/admins",
    { headers: await authHeaders() },
  );
  return unwrap(res);
}

export async function createAdmin(input: CreateAdminInput): Promise<AdminAccount> {
  const res = await finvietApi.post<{ success: boolean; message?: string; data: AdminAccount }>(
    "/api/admins",
    input,
    { headers: await authHeaders() },
  );
  return unwrap(res);
}

export async function changeAdminPassword(input: AdminChangePasswordInput): Promise<string> {
  const res = await finvietApi.post<{ success: boolean; message?: string; data: string }>(
    "/api/auth/admin-change-password",
    input,
    { headers: await authHeaders() },
  );
  return unwrap(res);
}
