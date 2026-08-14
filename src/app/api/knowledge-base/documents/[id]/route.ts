import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { deleteDocument } from "@/services/knowledge-base";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const data = await deleteDocument(id);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
