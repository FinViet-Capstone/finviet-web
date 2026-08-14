import type { AdminPlan, PlanInput } from "@/types/plans";

// SubscriptionPlan exists as a real finviet-be table (PlanId, Code, Name, Price, FeaturesJson,
// CreatedAt) but has zero API surface today — no controller references it at all — and no
// IsActive column exists yet for a real discontinue/soft-delete. See context/backend-gaps.md.

export async function listPlans(): Promise<AdminPlan[]> {
  throw new Error("Not implemented: finviet-be has no subscription-plan endpoint yet");
}

export async function createPlan(_input: PlanInput): Promise<AdminPlan> {
  throw new Error("Not implemented: finviet-be has no subscription-plan endpoint yet");
}

export async function updatePlan(_id: string, _input: PlanInput): Promise<AdminPlan> {
  throw new Error("Not implemented: finviet-be has no subscription-plan endpoint yet");
}

export async function discontinuePlan(_id: string): Promise<AdminPlan> {
  throw new Error("Not implemented: finviet-be has no IsActive column on SubscriptionPlan yet");
}
