import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type {
  AdminAiPromptConfig,
  AdminAiPromptHistoryEntry,
  AiPromptConfigInput,
} from "@/types/ai-prompts";

// Backed by finviet-be's AdminAiController (api/ai/prompt-configs), [Authorize(Roles = "Admin")].
// Rows are seeded by migration V0010__ai_prompt_configs.sql — one per AiPromptFeatures key — so
// the list is a fixed set of four, never created or deleted from this screen.
//
// Only the persona/tone half of the system instruction is editable here: GeminiAiModelClient always
// appends its own FinancialSafetyPolicy constant after the stored persona, so no admin edit can
// strip the no-fabrication / no-credential / read-only / prompt-injection guardrails.

interface AiPromptConfigDto {
  featureKey: string | null;
  displayName: string | null;
  personaInstruction: string | null;
  temperature: number;
  maxOutputTokens: number;
  updatedBy: string | null;
  updatedByUsername: string | null;
  updatedAt: string;
}

interface AiPromptConfigHistoryDto {
  id: string;
  featureKey: string | null;
  personaInstruction: string | null;
  temperature: number;
  maxOutputTokens: number;
  changedBy: string | null;
  changedByUsername: string | null;
  changedAt: string;
}

async function authHeaders() {
  const token = await getFinvietAdminToken();
  return { Authorization: `Bearer ${token}` };
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()} ${hh}:${min}`;
}

function toAdminConfig(dto: AiPromptConfigDto): AdminAiPromptConfig {
  return {
    featureKey: dto.featureKey ?? "",
    displayName: dto.displayName ?? dto.featureKey ?? "",
    personaInstruction: dto.personaInstruction ?? "",
    temperature: dto.temperature,
    maxOutputTokens: dto.maxOutputTokens,
    updatedByUsername: dto.updatedByUsername,
    updatedAtLabel: formatDateTime(dto.updatedAt),
  };
}

function toAdminHistoryEntry(dto: AiPromptConfigHistoryDto): AdminAiPromptHistoryEntry {
  return {
    id: dto.id,
    featureKey: dto.featureKey ?? "",
    personaInstruction: dto.personaInstruction ?? "",
    temperature: dto.temperature,
    maxOutputTokens: dto.maxOutputTokens,
    changedByUsername: dto.changedByUsername,
    changedAtLabel: formatDateTime(dto.changedAt),
  };
}

export async function listPromptConfigs(): Promise<AdminAiPromptConfig[]> {
  const headers = await authHeaders();
  const res = await finvietApi.get<{ success: boolean; message?: string; data: AiPromptConfigDto[] }>(
    "/api/ai/prompt-configs",
    { headers },
  );
  return unwrap(res).map(toAdminConfig);
}

export async function updatePromptConfig(
  featureKey: string,
  input: AiPromptConfigInput,
): Promise<AdminAiPromptConfig> {
  const headers = await authHeaders();
  const res = await finvietApi.put<{ success: boolean; message?: string; data: AiPromptConfigDto }>(
    `/api/ai/prompt-configs/${encodeURIComponent(featureKey)}`,
    input,
    { headers },
  );
  return toAdminConfig(unwrap(res));
}

export async function listPromptConfigHistory(featureKey: string): Promise<AdminAiPromptHistoryEntry[]> {
  const headers = await authHeaders();
  const res = await finvietApi.get<{ success: boolean; message?: string; data: AiPromptConfigHistoryDto[] }>(
    `/api/ai/prompt-configs/${encodeURIComponent(featureKey)}/history`,
    { headers },
  );
  return unwrap(res).map(toAdminHistoryEntry);
}
