import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import { AI_PROMPT_FEATURE_KEYS } from "@/lib/ai-prompt-features";
import { listPromptConfigHistory } from "@/services/ai-prompts";

const FeatureKeySchema = z.enum(AI_PROMPT_FEATURE_KEYS, {
  message: `Tính năng AI không hợp lệ. Hợp lệ: ${AI_PROMPT_FEATURE_KEYS.join(", ")}.`,
});

export async function GET(_request: Request, { params }: { params: Promise<{ featureKey: string }> }) {
  try {
    await requireAdminSession();
    const featureKey = FeatureKeySchema.parse((await params).featureKey);
    const data = await listPromptConfigHistory(featureKey);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
