import { isMockMode } from "@/lib/env";
import * as mockAdmins from "./mock/admins";
import * as realAdmins from "./real/admins";

function impl() {
  return isMockMode("admins") ? mockAdmins : realAdmins;
}

export const listAdmins: typeof mockAdmins.listAdmins = () => impl().listAdmins();
export const createAdmin: typeof mockAdmins.createAdmin = (input) => impl().createAdmin(input);
export const changeAdminPassword: typeof mockAdmins.changeAdminPassword = (input) =>
  impl().changeAdminPassword(input);
