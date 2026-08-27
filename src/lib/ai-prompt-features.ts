// Mirrors finviet-be's AiPromptFeatures.All + UpdateAiPromptConfigCommandValidator limits, and the
// CHECK constraints in migration V0010__ai_prompt_configs.sql. Kept in one place so the Route
// Handler's zod schema and the editor UI's client-side validation can't drift apart — or drift
// away from what the backend will actually accept.
export const AI_PROMPT_FEATURE_KEYS = ["chat", "weekly_report", "score_comment", "classification"] as const;

export type AiPromptFeatureKey = (typeof AI_PROMPT_FEATURE_KEYS)[number];

export const PERSONA_MAX_LENGTH = 4000;
export const TEMPERATURE_MIN = 0;
export const TEMPERATURE_MAX = 2;
// numeric(3,2) in Postgres — anything finer than 2 decimals gets rounded server-side anyway.
export const TEMPERATURE_STEP = 0.05;
export const MAX_OUTPUT_TOKENS_MIN = 16;
export const MAX_OUTPUT_TOKENS_MAX = 8192;
