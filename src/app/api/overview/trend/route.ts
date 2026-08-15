import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { getAnalyticsTrend } from "@/services/overview";

const TrendQuerySchema = z.object({
  metric: z.enum(["signups", "transactions"]).default("signups"),
  days: z.coerce.number().int().min(1).max(365).default(30),
});

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const url = new URL(request.url);
    const query = TrendQuerySchema.parse(Object.fromEntries(url.searchParams));
    const data = await getAnalyticsTrend(query.metric, query.days);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
