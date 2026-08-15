import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AdminAccount, AdminChangePasswordInput, CreateAdminInput } from "@/types/admins";

export function useAdmins() {
  return useQuery({
    queryKey: queryKeys.admins.all(),
    queryFn: () => apiFetch<AdminAccount[]>("/api/admins"),
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdminInput) =>
      apiFetch<AdminAccount>("/api/admins", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admins.all() }),
  });
}

export function useChangeAdminPassword() {
  return useMutation({
    mutationFn: (input: AdminChangePasswordInput) =>
      apiFetch<string>("/api/admin/change-password", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}
