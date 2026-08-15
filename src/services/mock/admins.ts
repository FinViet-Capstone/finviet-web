import type { AdminAccount, CreateAdminInput } from "@/types/admins";
import { createDevStore } from "./dev-store";
import { delay } from "./delay";

const store = createDevStore<AdminAccount[]>("admins", () => [
  {
    adminId: "1",
    username: "admin",
    email: "admin@finviet.vn",
    createdAt: "2026-08-04T00:00:00.000Z",
  },
]);

export async function listAdmins(): Promise<AdminAccount[]> {
  await delay();
  return store.get();
}

export async function createAdmin(input: CreateAdminInput): Promise<AdminAccount> {
  await delay();
  const admins = store.get();
  if (admins.some((admin) => admin.username === input.username || admin.email === input.email)) {
    throw new Error(`An admin with username '${input.username}' or email '${input.email}' already exists.`);
  }
  const created: AdminAccount = {
    adminId: crypto.randomUUID(),
    username: input.username,
    email: input.email,
    createdAt: new Date().toISOString(),
  };
  store.set([...admins, created]);
  return created;
}
