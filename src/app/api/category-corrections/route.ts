import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { listCorrections } from "@/services/category-corrections";

const ListCorrectionsQuerySchema = z.object({
  dateRange: z.enum(["7d", "30d", "90d"]).default("30d"),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const url = new URL(request.url);
    const query = ListCorrectionsQuerySchema.parse(Object.fromEntries(url.searchParams));
    const data = await listCorrections(query);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
