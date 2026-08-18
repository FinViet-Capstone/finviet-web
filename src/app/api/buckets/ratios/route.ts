import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { saveBucketDefaultRatios } from "@/services/buckets";

const SaveRatiosSchema = z.array(
  z.object({
    id: z.string().min(1),
    defaultPct: z.number().min(0).max(100),
  })
);

export async function PUT(request: Request) {
  try {
    await requireAdminSession();
    const body = SaveRatiosSchema.parse(await request.json());
    const data = await saveBucketDefaultRatios(body);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
