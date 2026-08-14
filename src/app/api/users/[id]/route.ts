import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { setUserActive } from "@/services/users";

const UpdateUserSchema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = UpdateUserSchema.parse(await request.json());
    const data = await setUserActive(id, body.isActive);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
