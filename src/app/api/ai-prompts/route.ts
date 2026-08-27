import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { listPromptConfigs } from "@/services/ai-prompts";

export async function GET() {
  try {
    await requireAdminSession();
    const data = await listPromptConfigs();
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
