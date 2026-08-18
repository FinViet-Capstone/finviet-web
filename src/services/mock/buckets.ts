import type { AdminBucket, BucketInput } from "@/types/buckets";
import { createDevStore } from "./dev-store";
import { delay } from "./delay";

const store = createDevStore<AdminBucket[]>("buckets", () => [
  { id: "needs", nameVi: "Nhu cầu", nameEn: "Needs", color: "#2563eb", icon: "home", sortOrder: 1, defaultPct: 50 },
  { id: "wants", nameVi: "Mong muốn", nameEn: "Wants", color: "#8b5cf6", icon: "sparkles", sortOrder: 2, defaultPct: 30 },
  { id: "savings", nameVi: "Tiết kiệm", nameEn: "Savings", color: "#10b981", icon: "piggy-bank", sortOrder: 3, defaultPct: 20 },
]);

export async function listBuckets(): Promise<AdminBucket[]> {
  await delay();
  return store.get();
}

export async function updateBucket(id: string, input: BucketInput): Promise<AdminBucket> {
  await delay();
  const buckets = store.get();
  const index = buckets.findIndex((bucket) => bucket.id === id);
  if (index === -1) throw new Error("Bucket not found");

  const isDuplicateOrder = buckets.some((bucket) => bucket.id !== id && bucket.sortOrder === input.sortOrder);
  if (isDuplicateOrder) {
    throw new Error(`Thứ tự ${input.sortOrder} đã được dùng bởi nhóm khác.`);
  }

  const updated: AdminBucket = { id, ...input };
  const next = [...buckets];
  next[index] = updated;
  store.set(next);
  return updated;
}
