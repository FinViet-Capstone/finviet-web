import { isMockMode } from "@/lib/env";
import * as mockAiPrompts from "./mock/ai-prompts";
import * as realAiPrompts from "./real/ai-prompts";

function impl() {
  return isMockMode("ai-prompts") ? mockAiPrompts : realAiPrompts;
}

export const listPromptConfigs: typeof mockAiPrompts.listPromptConfigs = () => impl().listPromptConfigs();
export const updatePromptConfig: typeof mockAiPrompts.updatePromptConfig = (featureKey, input) =>
  impl().updatePromptConfig(featureKey, input);
export const listPromptConfigHistory: typeof mockAiPrompts.listPromptConfigHistory = (featureKey) =>
  impl().listPromptConfigHistory(featureKey);
