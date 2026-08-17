import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, toQueryString } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AdminCustomerSummary, ListUsersParams, UsersListResult } from "@/types/users";

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => apiFetch<UsersListResult>(`/api/users?${toQueryString(params)}`),
  });
}

export function useSetUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch<AdminCustomerSummary>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all() }),
  });
}

export function useTriggerPasswordReset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      apiFetch<{ sent: boolean }>(`/api/users/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all() }),
  });
}
