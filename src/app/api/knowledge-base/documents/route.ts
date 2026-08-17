import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { listDocuments, uploadDocument } from "@/services/knowledge-base";

const TitleSchema = z.string().min(1);

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
    if (!(file instanceof File)) {
      throw new Error("Vui lòng chọn tệp để tải lên.");
    }
    const title = TitleSchema.parse(formData.get("title"));
    const data = await uploadDocument({ title, fileName: file.name, file });
    return jsonSuccess(data, 201);
  } catch (err) {
    return jsonError(err);
  }
}
