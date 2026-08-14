import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AdminPlan, PlanInput } from "@/types/plans";

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans.all(),
    queryFn: () => apiFetch<AdminPlan[]>("/api/plans"),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlanInput) => apiFetch<AdminPlan>("/api/plans", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.plans.all() }),
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PlanInput }) =>
      apiFetch<AdminPlan>(`/api/plans/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.plans.all() }),
  });
}

export function useDiscontinuePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<AdminPlan>(`/api/plans/${id}/discontinue`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.plans.all() }),
  });
}
