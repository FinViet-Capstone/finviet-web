import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { createAdmin, listAdmins } from "@/services/admins";

const CreateAdminInputSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function GET() {
  try {
    await requireAdminSession();
    const data = await listAdmins();
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = CreateAdminInputSchema.parse(await request.json());
    const data = await createAdmin(body);
    return jsonSuccess(data, 201);
  } catch (err) {
    return jsonError(err);
  }
}
