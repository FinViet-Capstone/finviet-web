import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { createCategory, listCategories } from "@/services/categories";

const CategoryInputSchema = z.object({
  name: z.string().min(1),
  nameVi: z.string().min(1),
  nameEn: z.string().min(1),
  type: z.enum(["expense", "income"]),
  defaultBucket: z.enum(["needs", "wants", "savings"]).nullable(),
  isMandatory: z.boolean(),
  icon: z.string().min(1),
  customIconDataUrl: z.string().nullable().optional(),
  color: z.string().min(1),
  sortOrder: z.number().int().min(1),
});

export async function GET() {
  try {
    await requireAdminSession();
    const data = await listCategories();
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = CategoryInputSchema.parse(await request.json());
    const data = await createCategory(body);
    return jsonSuccess(data, 201);
  } catch (err) {
    return jsonError(err);
  }
}
