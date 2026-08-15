import type { AdminScoringCriterion, ScoringWeightInput } from "@/types/scoring";
import { createDevStore } from "./dev-store";
import { delay } from "./delay";

// Mirrors the real, hardcoded weights in finviet-be's SpendingScoreService.cs:
// Weekly = Spike×50 + Budget×50; Monthly = Spike×30 + Budget×40 + Savings×30.
// Savings has no weekly weight — the metric isn't computed for the weekly view at all.
const store = createDevStore<AdminScoringCriterion[]>("scoring-criteria", () => [
  { code: "SPIKE", name: "Đột biến chi tiêu", weightWeekly: 50, weightMonthly: 30, version: "—" },
  { code: "BUDGET", name: "Tuân thủ ngân sách", weightWeekly: 50, weightMonthly: 40, version: "—" },
  { code: "SAVINGS", name: "Nhất quán tiết kiệm", weightWeekly: null, weightMonthly: 30, version: "—" },
]);

function sumWeights(criteria: AdminScoringCriterion[], field: "weightWeekly" | "weightMonthly"): number {
  return criteria.reduce((total, criterion) => total + (criterion[field] ?? 0), 0);
}

export async function listScoringCriteria(): Promise<AdminScoringCriterion[]> {
  await delay();
  return store.get();
}

export async function saveScoringCriteria(inputs: ScoringWeightInput[]): Promise<AdminScoringCriterion[]> {
  await delay();
  const current = store.get();
  const updated = current.map((criterion) => {
    const input = inputs.find((item) => item.code === criterion.code);
    return input ? { ...criterion, weightWeekly: input.weightWeekly, weightMonthly: input.weightMonthly } : criterion;
  });

  const weeklyTotal = sumWeights(updated, "weightWeekly");
  const monthlyTotal = sumWeights(updated, "weightMonthly");
  if (weeklyTotal !== 100 || monthlyTotal !== 100) {
    throw new Error("Tổng trọng số tuần và tháng phải bằng 100%.");
  }

  store.set(updated);
  return updated;
}
