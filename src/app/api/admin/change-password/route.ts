import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { changeAdminPassword } from "@/services/admins";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = ChangePasswordSchema.parse(await request.json());
    const data = await changeAdminPassword(body);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
