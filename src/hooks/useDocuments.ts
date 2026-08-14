import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AdminDocument } from "@/types/knowledge-base";

export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents.all(),
    queryFn: () => apiFetch<AdminDocument[]>("/api/knowledge-base/documents"),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiFetch<AdminDocument>("/api/knowledge-base/documents", { method: "POST", body: formData }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents.all() }),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string }>(`/api/knowledge-base/documents/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents.all() }),
  });
}
