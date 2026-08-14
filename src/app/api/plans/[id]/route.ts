import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { updatePlan } from "@/services/plans";

const PlanInputSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  priceValue: z.string().min(1),
  priceUnit: z.string(),
  features: z.array(z.string().min(1)),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = PlanInputSchema.parse(await request.json());
    const data = await updatePlan(id, body);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
