import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AdminAnnouncement, AnnouncementInput, AnnouncementsListResult } from "@/types/announcements";

export function useAnnouncements() {
  return useQuery({
    queryKey: queryKeys.announcements.all(),
    queryFn: () => apiFetch<AnnouncementsListResult>("/api/announcements"),
  });
}

export function useSendAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AnnouncementInput) =>
      apiFetch<AdminAnnouncement>("/api/announcements", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all() }),
  });
}
