import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type { AdminPlan, PlanInput } from "@/types/plans";

// Backed by finviet-be's AdminSubscriptionPlansController (api/admin/subscription-plans),
// [Authorize(Roles = "Admin")]. savingsBadge/highlighted have no backend column — they're a
// pre-existing display-only gap (no UI path ever set them, even in mock mode) and are simply
// omitted when mapping from real data.

interface SubscriptionPlanDto {
  planId: string;
  code: string;
  name: string;
  price: number;
  billingIntervalMonths: number;
  features: string[];
  isActive: boolean;
}

function toAdminPlan(dto: SubscriptionPlanDto): AdminPlan {
  return {
    id: dto.planId,
    code: dto.code,
    name: dto.name,
    price: dto.price,
    billingIntervalMonths: dto.billingIntervalMonths,
    features: dto.features,
    isActive: dto.isActive,
  };
}

async function authHeaders() {
  const token = await getFinvietAdminToken();
  return { Authorization: `Bearer ${token}` };
}

export async function listPlans(): Promise<AdminPlan[]> {
  const headers = await authHeaders();
  const res = await finvietApi.get<{ success: boolean; message?: string; data: SubscriptionPlanDto[] }>(
    "/api/admin/subscription-plans",
    { params: { includeInactive: true }, headers },
  );
  return unwrap(res).map(toAdminPlan);
}

export async function createPlan(input: PlanInput): Promise<AdminPlan> {
  const headers = await authHeaders();
  const res = await finvietApi.post<{ success: boolean; message?: string; data: SubscriptionPlanDto }>(
    "/api/admin/subscription-plans",
    {
      code: input.code,
      name: input.name,
      price: input.price,
      billingIntervalMonths: input.billingIntervalMonths,
      features: input.features,
    },
    { headers },
  );
  return toAdminPlan(unwrap(res));
}

export async function updatePlan(id: string, input: PlanInput): Promise<AdminPlan> {
  const headers = await authHeaders();
  // Code is immutable on the backend (see UpdateSubscriptionPlanCommand) — deliberately not sent.
  const res = await finvietApi.patch<{ success: boolean; message?: string; data: SubscriptionPlanDto }>(
    `/api/admin/subscription-plans/${id}`,
    {
      name: input.name,
      price: input.price,
      billingIntervalMonths: input.billingIntervalMonths,
      features: input.features,
    },
    { headers },
  );
  return toAdminPlan(unwrap(res));
}

export async function discontinuePlan(id: string): Promise<AdminPlan> {
  const headers = await authHeaders();
  const res = await finvietApi.patch<{ success: boolean; message?: string; data: SubscriptionPlanDto }>(
    `/api/admin/subscription-plans/${id}/discontinue`,
    undefined,
    { headers },
  );
  return toAdminPlan(unwrap(res));
}
