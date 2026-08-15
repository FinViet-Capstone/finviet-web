import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { listScoringCriteria, saveScoringCriteria } from "@/services/scoring";

const SaveScoringCriteriaSchema = z.array(
  z.object({
    code: z.string().min(1),
    weightWeekly: z.number().min(0).max(100).nullable(),
    weightMonthly: z.number().min(0).max(100).nullable(),
  })
);

export async function GET() {
  try {
    await requireAdminSession();
    const data = await listScoringCriteria();
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession();
    const body = SaveScoringCriteriaSchema.parse(await request.json());
    const data = await saveScoringCriteria(body);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
