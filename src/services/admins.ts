import { isMockMode } from "@/lib/env";
import * as mockAdmins from "./mock/admins";
import * as realAdmins from "./real/admins";

function impl() {
  return isMockMode() ? mockAdmins : realAdmins;
}

export const listAdmins: typeof mockAdmins.listAdmins = () => impl().listAdmins();
export const createAdmin: typeof mockAdmins.createAdmin = (input) => impl().createAdmin(input);
