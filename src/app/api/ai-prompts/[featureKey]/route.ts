import { z } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api-response";
import {
  AI_PROMPT_FEATURE_KEYS,
  MAX_OUTPUT_TOKENS_MAX,
  MAX_OUTPUT_TOKENS_MIN,
  PERSONA_MAX_LENGTH,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
} from "@/lib/ai-prompt-features";
import { updatePromptConfig } from "@/services/ai-prompts";

// Mirrors UpdateAiPromptConfigCommandValidator on finviet-be — rejecting here keeps the round-trip
// off the network and gives a Vietnamese message, but the backend stays the source of truth.
const FeatureKeySchema = z.enum(AI_PROMPT_FEATURE_KEYS, {
  message: `Tính năng AI không hợp lệ. Hợp lệ: ${AI_PROMPT_FEATURE_KEYS.join(", ")}.`,
});

const UpdatePromptConfigSchema = z.object({
  personaInstruction: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập nội dung persona.")
    .max(PERSONA_MAX_LENGTH, `Persona tối đa ${PERSONA_MAX_LENGTH} ký tự.`),
  temperature: z
    .number()
    .min(TEMPERATURE_MIN, `Temperature phải từ ${TEMPERATURE_MIN} đến ${TEMPERATURE_MAX}.`)
    .max(TEMPERATURE_MAX, `Temperature phải từ ${TEMPERATURE_MIN} đến ${TEMPERATURE_MAX}.`),
  maxOutputTokens: z
    .number()
    .int("Giới hạn token phải là số nguyên.")
    .min(MAX_OUTPUT_TOKENS_MIN, `Giới hạn token phải từ ${MAX_OUTPUT_TOKENS_MIN} đến ${MAX_OUTPUT_TOKENS_MAX}.`)
    .max(MAX_OUTPUT_TOKENS_MAX, `Giới hạn token phải từ ${MAX_OUTPUT_TOKENS_MIN} đến ${MAX_OUTPUT_TOKENS_MAX}.`),
});

export async function PUT(request: Request, { params }: { params: Promise<{ featureKey: string }> }) {
  try {
    await requireAdminSession();
    const featureKey = FeatureKeySchema.parse((await params).featureKey);
    const body = UpdatePromptConfigSchema.parse(await request.json());
    const data = await updatePromptConfig(featureKey, body);
    return jsonSuccess(data);
  } catch (err) {
    return jsonError(err);
  }
}
