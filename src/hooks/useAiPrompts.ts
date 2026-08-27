import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type {
  AdminAiPromptConfig,
  AdminAiPromptHistoryEntry,
  AiPromptConfigInput,
} from "@/types/ai-prompts";

export function useAiPromptConfigs() {
  return useQuery({
    queryKey: queryKeys.aiPrompts.all(),
    queryFn: () => apiFetch<AdminAiPromptConfig[]>("/api/ai-prompts"),
  });
}

export function useAiPromptHistory(featureKey: string | null) {
  return useQuery({
    queryKey: queryKeys.aiPrompts.history(featureKey ?? ""),
    queryFn: () => apiFetch<AdminAiPromptHistoryEntry[]>(`/api/ai-prompts/${featureKey}/history`),
    enabled: featureKey !== null,
  });
}

export function useUpdateAiPromptConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ featureKey, input }: { featureKey: string; input: AiPromptConfigInput }) =>
      apiFetch<AdminAiPromptConfig>(`/api/ai-prompts/${featureKey}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    // Invalidating the whole ai-prompt-configs key covers both the list and every feature's
    // history, since queryKeys.aiPrompts.history() is nested under it.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.aiPrompts.all() }),
  });
}
