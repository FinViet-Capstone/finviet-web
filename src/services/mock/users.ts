import type { AdminCustomerSummary, ListUsersParams, UsersListResult } from "@/types/users";
import { createDevStore } from "./dev-store";
import { delay } from "./delay";

const namedCustomers: AdminCustomerSummary[] = [
  { id: "1", name: "Nguyễn Văn A", email: "a@mail.com", isActive: true, createdAt: "01/03/2025", totalTransactions: 42, totalWallets: 3, plan: "free" },
  { id: "2", name: "Trần Thị B", email: "b@mail.com", isActive: false, createdAt: "15/02/2025", totalTransactions: 12, totalWallets: 1, plan: "premium" },
  { id: "3", name: "Lê Minh C", email: "c@mail.com", isActive: true, createdAt: "22/01/2025", totalTransactions: 87, totalWallets: 4, plan: "premium" },
  { id: "4", name: "Phạm Thị D", email: "d@mail.com", isActive: true, createdAt: "09/12/2024", totalTransactions: 5, totalWallets: 1, plan: "free" },
  { id: "5", name: "Hoàng Văn E", email: "e@mail.com", isActive: false, createdAt: "30/11/2024", totalTransactions: 63, totalWallets: 2, plan: "free" },
  { id: "6", name: "Vũ Thị F", email: "f@mail.com", isActive: true, createdAt: "18/10/2024", totalTransactions: 29, totalWallets: 2, plan: "premium" },
];

const surnames = ["Đặng", "Bùi", "Đỗ", "Ngô", "Dương", "Lý", "Trịnh", "Đinh", "Phan", "Mai"];
const givenNames = ["Văn", "Thị", "Minh", "Quang", "Thu", "Anh", "Hữu", "Ngọc", "Đức", "Thanh"];
const letters = "GHIKLMNOPQRSTUVXYZ";

function generateMoreCustomers(count: number): AdminCustomerSummary[] {
  const generated: AdminCustomerSummary[] = [];
  for (let i = 0; i < count; i++) {
    const index = namedCustomers.length + i;
    const surname = surnames[i % surnames.length];
    const given = givenNames[Math.floor(i / surnames.length) % givenNames.length];
    const letter = letters[i % letters.length];
    const day = String(((i * 3) % 28) + 1).padStart(2, "0");
    const month = String((i % 12) + 1).padStart(2, "0");
    const year = 2024 + (i % 2);

    generated.push({
      id: String(index + 1),
      name: `${surname} ${given} ${letter}`,
      email: `user${index + 1}@mail.com`,
      isActive: i % 3 !== 0,
      createdAt: `${day}/${month}/${year}`,
      totalTransactions: 5 + ((i * 7) % 90),
      totalWallets: 1 + (i % 4),
      plan: i % 4 === 0 ? "premium" : "free",
    });
  }
  return generated;
}

const store = createDevStore<AdminCustomerSummary[]>("users", () => [
  ...namedCustomers,
  ...generateMoreCustomers(34),
]);

export async function listUsers(params: ListUsersParams): Promise<UsersListResult> {
  await delay();
  const query = (params.search ?? "").trim().toLowerCase();
  const filtered = store.get().filter((customer) => {
    const matchesQuery =
      query.length === 0 ||
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query);
    const matchesStatus =
      !params.status ||
      params.status === "all" ||
      (params.status === "active" && customer.isActive) ||
      (params.status === "locked" && !customer.isActive);
    return matchesQuery && matchesStatus;
  });

  const start = (params.page - 1) * params.pageSize;
  const items = filtered.slice(start, start + params.pageSize);

  return { items, total: filtered.length, page: params.page, pageSize: params.pageSize };
}

export async function setUserActive(id: string, isActive: boolean): Promise<AdminCustomerSummary> {
  await delay();
  const customers = store.get();
  const index = customers.findIndex((customer) => customer.id === id);
  if (index === -1) throw new Error("Customer not found");

  const updated = { ...customers[index], isActive };
  const next = [...customers];
  next[index] = updated;
  store.set(next);
  return updated;
}

export async function triggerPasswordReset(id: string, _email: string): Promise<{ sent: boolean }> {
  await delay();
  const customer = store.get().find((item) => item.id === id);
  if (!customer) throw new Error("Customer not found");
  return { sent: true };
}
