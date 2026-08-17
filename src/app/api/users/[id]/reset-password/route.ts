import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { triggerPasswordReset } from "@/services/users";

const TriggerPasswordResetSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const { email } = TriggerPasswordResetSchema.parse(await request.json());
    const data = await triggerPasswordReset(id, email);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
