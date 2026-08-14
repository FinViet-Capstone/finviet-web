import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AdminScoringCriterion, ScoringWeightInput } from "@/types/scoring";

export function useScoringCriteria() {
  return useQuery({
    queryKey: queryKeys.scoring.all(),
    queryFn: () => apiFetch<AdminScoringCriterion[]>("/api/scoring-criteria"),
  });
}

export function useSaveScoringCriteria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inputs: ScoringWeightInput[]) =>
      apiFetch<AdminScoringCriterion[]>("/api/scoring-criteria", {
        method: "PUT",
        body: JSON.stringify(inputs),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.scoring.all() }),
  });
}
