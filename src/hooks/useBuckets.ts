import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AdminBucket, BucketInput, BucketRatioInput } from "@/types/buckets";

export function useBuckets() {
  return useQuery({
    queryKey: queryKeys.buckets.all(),
    queryFn: () => apiFetch<AdminBucket[]>("/api/buckets"),
  });
}

export function useUpdateBucket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BucketInput }) =>
      apiFetch<AdminBucket>(`/api/buckets/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.buckets.all() }),
  });
}

export function useSaveBucketRatios() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inputs: BucketRatioInput[]) =>
      apiFetch<AdminBucket[]>("/api/buckets/ratios", { method: "PUT", body: JSON.stringify(inputs) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.buckets.all() }),
  });
}
