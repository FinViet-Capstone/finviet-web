import { isMockMode } from "@/lib/env";
import * as mockPlans from "./mock/plans";
import * as realPlans from "./real/plans";

function impl() {
  return isMockMode("plans") ? mockPlans : realPlans;
}

export const listPlans: typeof mockPlans.listPlans = () => impl().listPlans();
export const createPlan: typeof mockPlans.createPlan = (input) => impl().createPlan(input);
export const updatePlan: typeof mockPlans.updatePlan = (id, input) => impl().updatePlan(id, input);
export const discontinuePlan: typeof mockPlans.discontinuePlan = (id) => impl().discontinuePlan(id);
