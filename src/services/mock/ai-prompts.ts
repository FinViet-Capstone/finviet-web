import type {
  AdminAiPromptConfig,
  AdminAiPromptHistoryEntry,
  AiPromptConfigInput,
} from "@/types/ai-prompts";
import { createDevStore } from "./dev-store";
import { delay } from "./delay";

const ASSISTANT_PERSONA =
  "Bạn là trợ lý tài chính cá nhân của FinViet.\n" +
  "Luôn trả lời bằng tiếng Việt, giọng thân thiện, tích cực và hữu ích.";

const CLASSIFIER_PERSONA =
  "Bạn là bộ phân loại giao dịch tài chính của FinViet.\n" +
  "Tuân thủ danh sách danh mục đóng và schema đầu ra.";

// Same four rows migration V0010__ai_prompt_configs.sql seeds on the backend.
const configStore = createDevStore<AdminAiPromptConfig[]>("ai-prompt-configs", () => [
  {
    featureKey: "chat",
    displayName: "Trợ lý chat",
    personaInstruction: ASSISTANT_PERSONA,
    temperature: 0.4,
    maxOutputTokens: 768,
    updatedByUsername: null,
    updatedAtLabel: "01/08/2026 09:00",
  },
  {
    featureKey: "weekly_report",
    displayName: "Báo cáo tuần",
    personaInstruction: ASSISTANT_PERSONA,
    temperature: 0.5,
    maxOutputTokens: 512,
    updatedByUsername: null,
    updatedAtLabel: "01/08/2026 09:00",
  },
  {
    featureKey: "score_comment",
    displayName: "Nhận xét điểm chi tiêu",
    personaInstruction: ASSISTANT_PERSONA,
    temperature: 0.5,
    maxOutputTokens: 160,
    updatedByUsername: null,
    updatedAtLabel: "01/08/2026 09:00",
  },
  {
    featureKey: "classification",
    displayName: "Phân loại giao dịch",
    personaInstruction: CLASSIFIER_PERSONA,
    temperature: 0.1,
    maxOutputTokens: 512,
    updatedByUsername: null,
    updatedAtLabel: "01/08/2026 09:00",
  },
]);

const historyStore = createDevStore<AdminAiPromptHistoryEntry[]>("ai-prompt-config-history", () =>
  configStore.get().map((config) => ({
    id: `seed-${config.featureKey}`,
    featureKey: config.featureKey,
    personaInstruction: config.personaInstruction,
    temperature: config.temperature,
    maxOutputTokens: config.maxOutputTokens,
    changedByUsername: null,
    changedAtLabel: config.updatedAtLabel,
  })),
);

function nowLabel(): string {
  const date = new Date();
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()} ${hh}:${min}`;
}

export async function listPromptConfigs(): Promise<AdminAiPromptConfig[]> {
  await delay();
  return configStore.get();
}

export async function updatePromptConfig(
  featureKey: string,
  input: AiPromptConfigInput,
): Promise<AdminAiPromptConfig> {
  await delay();
  const current = configStore.get().find((config) => config.featureKey === featureKey);
  if (!current) {
    throw new Error(`Không tìm thấy cấu hình AI cho tính năng ${featureKey}.`);
  }
  const updated: AdminAiPromptConfig = {
    ...current,
    personaInstruction: input.personaInstruction,
    temperature: input.temperature,
    maxOutputTokens: input.maxOutputTokens,
    updatedByUsername: "admin",
    updatedAtLabel: nowLabel(),
  };
  configStore.set(configStore.get().map((config) => (config.featureKey === featureKey ? updated : config)));
  historyStore.set([
    {
      id: crypto.randomUUID(),
      featureKey,
      personaInstruction: updated.personaInstruction,
      temperature: updated.temperature,
      maxOutputTokens: updated.maxOutputTokens,
      changedByUsername: updated.updatedByUsername,
      changedAtLabel: updated.updatedAtLabel,
    },
    ...historyStore.get(),
  ]);
  return updated;
}

export async function listPromptConfigHistory(featureKey: string): Promise<AdminAiPromptHistoryEntry[]> {
  await delay();
  return historyStore.get().filter((entry) => entry.featureKey === featureKey);
}
