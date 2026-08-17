import { isMockMode } from "@/lib/env";
import * as mockUsers from "./mock/users";
import * as realUsers from "./real/users";

function impl() {
  return isMockMode() ? mockUsers : realUsers;
}

export const listUsers: typeof mockUsers.listUsers = (params) => impl().listUsers(params);
export const setUserActive: typeof mockUsers.setUserActive = (id, isActive) => impl().setUserActive(id, isActive);
export const triggerPasswordReset: typeof mockUsers.triggerPasswordReset = (id, email) =>
  impl().triggerPasswordReset(id, email);
