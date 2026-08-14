import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { triggerPasswordReset } from "@/services/users";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const data = await triggerPasswordReset(id);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
