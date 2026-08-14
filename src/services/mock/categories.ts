import type { AdminCategory, CategoryInput } from "@/types/categories";
import { createDevStore } from "./dev-store";
import { delay } from "./delay";

const store = createDevStore<AdminCategory[]>("categories", () => [
  { id: "1", name: "Ăn uống", nameVi: "Ăn uống", nameEn: "Food", type: "expense", defaultBucket: "wants", isMandatory: false, icon: "utensils", color: "#f97316", sortOrder: 1 },
  { id: "2", name: "Di chuyển", nameVi: "Di chuyển", nameEn: "Transport", type: "expense", defaultBucket: "needs", isMandatory: false, icon: "bus", color: "#2563eb", sortOrder: 2 },
  { id: "3", name: "Nhà ở", nameVi: "Nhà ở", nameEn: "Housing", type: "expense", defaultBucket: "needs", isMandatory: true, icon: "home", color: "#64748b", sortOrder: 3 },
  { id: "4", name: "Lương", nameVi: "Lương", nameEn: "Salary", type: "income", defaultBucket: null, isMandatory: false, icon: "coins", color: "#10b981", sortOrder: 1 },
  { id: "5", name: "Giải trí", nameVi: "Giải trí", nameEn: "Entertainment", type: "expense", defaultBucket: "wants", isMandatory: false, icon: "clapperboard", color: "#8b5cf6", sortOrder: 4 },
]);

export async function listCategories(): Promise<AdminCategory[]> {
  await delay();
  return store.get();
}

export async function createCategory(input: CategoryInput): Promise<AdminCategory> {
  await delay();
  const created: AdminCategory = { id: crypto.randomUUID(), ...input };
  store.set([...store.get(), created]);
  return created;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<AdminCategory> {
  await delay();
  const categories = store.get();
  const index = categories.findIndex((category) => category.id === id);
  if (index === -1) throw new Error("Category not found");

  const updated: AdminCategory = { id, ...input };
  const next = [...categories];
  next[index] = updated;
  store.set(next);
  return updated;
}

export async function deleteCategory(id: string): Promise<{ id: string }> {
  await delay();
  store.set(store.get().filter((category) => category.id !== id));
  return { id };
}
