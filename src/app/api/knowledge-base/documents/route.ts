import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { listDocuments, uploadDocument } from "@/services/knowledge-base";

const UploadDocumentSchema = z.object({
  title: z.string().min(1),
  fileName: z.string().min(1),
});

export async function GET() {
  try {
    await requireAdminSession();
    const data = await listDocuments();
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const formData = await request.formData();
    const file = formData.get("file");
    const body = UploadDocumentSchema.parse({
      title: formData.get("title"),
      fileName: file instanceof File ? file.name : null,
    });
    const data = await uploadDocument(body);
    return jsonSuccess(data, 201);
  } catch (err) {
    return jsonError(err);
  }
}
