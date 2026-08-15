import { useQuery } from "@tanstack/react-query";
import { apiFetch, toQueryString } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type {
  CategoryCorrectionView,
  CorrectionsListResult,
  ExportCorrectionsParams,
  ListCorrectionsParams,
} from "@/types/category-corrections";

export function useCategoryCorrections(params: ListCorrectionsParams) {
  return useQuery({
    queryKey: queryKeys.categoryCorrections.list(params),
    queryFn: () => apiFetch<CorrectionsListResult>(`/api/category-corrections?${toQueryString(params)}`),
  });
}

export async function exportCategoryCorrections(params: ExportCorrectionsParams): Promise<CategoryCorrectionView[]> {
  return apiFetch<CategoryCorrectionView[]>(`/api/category-corrections/export?${toQueryString(params)}`);
}
