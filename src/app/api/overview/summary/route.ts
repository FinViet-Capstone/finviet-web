import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { getAnalyticsSummary } from "@/services/overview";

export async function GET() {
  try {
    await requireAdminSession();
    const data = await getAnalyticsSummary();
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
