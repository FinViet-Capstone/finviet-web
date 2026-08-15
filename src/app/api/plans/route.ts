import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { createPlan, listPlans } from "@/services/plans";

const PlanInputSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  billingIntervalMonths: z.number().int().positive(),
  features: z.array(z.string().min(1)),
});

export async function GET() {
  try {
    await requireAdminSession();
    const data = await listPlans();
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = PlanInputSchema.parse(await request.json());
    const data = await createPlan(body);
    return jsonSuccess(data, 201);
  } catch (err) {
    return jsonError(err);
  }
}
