import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { listBuckets } from "@/services/buckets";

export async function GET() {
  try {
    await requireAdminSession();
    const data = await listBuckets();
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
