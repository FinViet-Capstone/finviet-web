import type { AdminAccount, CreateAdminInput } from "@/types/admins";
import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietJwt } from "@/lib/auth";

async function authHeaders() {
  const token = await getFinvietJwt();
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
