import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { exportCorrections } from "@/services/category-corrections";

const ExportCorrectionsQuerySchema = z.object({
  dateRange: z.enum(["7d", "30d", "90d"]).default("30d"),
  category: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const url = new URL(request.url);
    const query = ExportCorrectionsQuerySchema.parse(Object.fromEntries(url.searchParams));
    const data = await exportCorrections(query);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
