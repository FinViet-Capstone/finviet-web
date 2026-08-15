import type { AdminPlan, PlanInput } from "@/types/plans";
import { createDevStore } from "./dev-store";
import { delay } from "./delay";

const store = createDevStore<AdminPlan[]>("plans", () => [
  {
    id: "1",
    code: "free",
    name: "Miễn phí",
    price: 0,
    billingIntervalMonths: 1,
    features: ["Theo dõi giao dịch cơ bản", "1 ví", "Báo cáo hàng tháng"],
    isActive: true,
  },
  {
    id: "2",
    code: "premium_monthly",
    name: "Premium Tháng",
    price: 49000,
    billingIntervalMonths: 1,
    features: ["Không giới hạn ví", "Điểm chi tiêu AI", "Trợ lý AI chatbot", "Báo cáo nâng cao"],
    isActive: true,
  },
  {
    id: "3",
    code: "premium_yearly",
    name: "Premium Năm",
    price: 490000,
    billingIntervalMonths: 12,
    savingsBadge: "Tiết kiệm 17%",
    highlighted: true,
    features: ["Không giới hạn ví", "Điểm chi tiêu AI", "Trợ lý AI chatbot", "Báo cáo nâng cao"],
    isActive: true,
  },
]);

export async function listPlans(): Promise<AdminPlan[]> {
  await delay();
  return store.get();
}

export async function createPlan(input: PlanInput): Promise<AdminPlan> {
  await delay();
  const created: AdminPlan = { id: crypto.randomUUID(), ...input, isActive: true };
  store.set([...store.get(), created]);
  return created;
}

export async function updatePlan(id: string, input: PlanInput): Promise<AdminPlan> {
  await delay();
  const plans = store.get();
  const index = plans.findIndex((plan) => plan.id === id);
  if (index === -1) throw new Error("Plan not found");

  const updated: AdminPlan = { ...plans[index], ...input };
  const next = [...plans];
  next[index] = updated;
  store.set(next);
  return updated;
}

export async function discontinuePlan(id: string): Promise<AdminPlan> {
  await delay();
  const plans = store.get();
  const index = plans.findIndex((plan) => plan.id === id);
  if (index === -1) throw new Error("Plan not found");

  const updated: AdminPlan = { ...plans[index], isActive: false };
  const next = [...plans];
  next[index] = updated;
  store.set(next);
  return updated;
}
