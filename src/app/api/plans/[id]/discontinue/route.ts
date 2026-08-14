import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { discontinuePlan } from "@/services/plans";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const data = await discontinuePlan(id);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
