export interface AdminCustomerSummary {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  totalTransactions: number;
  totalWallets: number;
  plan: "free" | "premium";
}

export interface ListUsersParams {
  search?: string;
  status?: "all" | "active" | "locked";
  page: number;
  pageSize: number;
}

export interface UsersListResult {
  items: AdminCustomerSummary[];
  total: number;
  page: number;
  pageSize: number;
}
