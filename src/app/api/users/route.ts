import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { listUsers } from "@/services/users";

const ListUsersQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["all", "active", "locked"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const url = new URL(request.url);
    const query = ListUsersQuerySchema.parse(Object.fromEntries(url.searchParams));
    const data = await listUsers(query);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
