import type { AdminPlan, PlanInput } from "@/types/plans";
import { createDevStore } from "./dev-store";
import { delay } from "./delay";

const store = createDevStore<AdminPlan[]>("plans", () => [
  {
    id: "1",
    code: "free",
    name: "Miễn phí",
    priceValue: "0đ",
    priceUnit: "",
    features: ["Theo dõi giao dịch cơ bản", "1 ví", "Báo cáo hàng tháng"],
    isActive: true,
  },
  {
    id: "2",
    code: "premium_monthly",
    name: "Premium Tháng",
    priceValue: "49.000đ",
    priceUnit: "/tháng",
    features: ["Không giới hạn ví", "Điểm chi tiêu AI", "Trợ lý AI chatbot", "Báo cáo nâng cao"],
    isActive: true,
  },
  {
    id: "3",
    code: "premium_yearly",
    name: "Premium Năm",
    priceValue: "490.000đ",
    priceUnit: "/năm",
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
