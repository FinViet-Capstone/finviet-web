export interface AdminAiPromptConfig {
  featureKey: string;
  displayName: string;
  personaInstruction: string;
  temperature: number;
  maxOutputTokens: number;
  updatedByUsername: string | null;
  updatedAtLabel: string;
}

export interface AdminAiPromptHistoryEntry {
  id: string;
  featureKey: string;
  personaInstruction: string;
  temperature: number;
  maxOutputTokens: number;
  changedByUsername: string | null;
  changedAtLabel: string;
}

export interface AiPromptConfigInput {
  personaInstruction: string;
  temperature: number;
  maxOutputTokens: number;
}
