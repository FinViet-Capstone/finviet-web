import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { updateBucket } from "@/services/buckets";

const BucketInputSchema = z.object({
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  color: z.string().min(1),
  icon: z.string().min(1),
  sortOrder: z.number().int().min(1),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = BucketInputSchema.parse(await request.json());
    const data = await updateBucket(id, body);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
