import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type { AdminAnnouncement, AnnouncementInput, AnnouncementsListResult } from "@/types/announcements";

// Backed by finviet-be's AdminAnnouncementsController (api/admin/announcements),
// [Authorize(Roles = "Admin")]. POST fans a Notification row out to every active customer and
// records one AnnouncementBroadcast history row; GET lists past broadcasts, newest first.

interface AnnouncementResponseDto {
  id: string;
  title: string;
  targetLabel: string;
  recipientCount: number;
  sentAt: string;
}

interface PagedResultDto<T> {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[] | null;
}

interface AnalyticsSummaryDto {
  activeCustomers: number;
}

const HISTORY_PAGE_SIZE = 50;

async function authHeaders() {
  const token = await getFinvietAdminToken();
  return { Authorization: `Bearer ${token}` };
}

function formatSentAt(iso: string): string {
  const date = new Date(iso);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

function toAdminAnnouncement(dto: AnnouncementResponseDto): AdminAnnouncement {
  return {
    id: dto.id,
    title: dto.title,
    targetLabel: dto.targetLabel,
    recipientCount: dto.recipientCount,
    sentAtLabel: formatSentAt(dto.sentAt),
  };
}

export async function listAnnouncements(): Promise<AnnouncementsListResult> {
  const headers = await authHeaders();

  const [historyRes, summaryRes] = await Promise.all([
    finvietApi.get<{ success: boolean; message?: string; data: PagedResultDto<AnnouncementResponseDto> }>(
      "/api/admin/announcements",
      { params: { Page: 1, PageSize: HISTORY_PAGE_SIZE }, headers },
    ),
    // No dedicated "active customer count" endpoint — reuses the same Overview summary the
    // dashboard already calls, so the pre-send confirm count matches
    // CreateAnnouncementCommandHandler's own "all" fan-out (Where(c => c.IsActive)) exactly.
    finvietApi.get<{ success: boolean; message?: string; data: AnalyticsSummaryDto }>("/api/analytics/summary", {
      headers,
    }),
  ]);

  return {
    items: (unwrap(historyRes).items ?? []).map(toAdminAnnouncement),
    targetAudienceCount: unwrap(summaryRes).activeCustomers,
  };
}

export async function sendAnnouncement(input: AnnouncementInput): Promise<AdminAnnouncement> {
  const headers = await authHeaders();
  const res = await finvietApi.post<{ success: boolean; message?: string; data: AnnouncementResponseDto }>(
    "/api/admin/announcements",
    { title: input.title, message: input.body, targetSegment: input.targetSegment },
    { headers },
  );
  return toAdminAnnouncement(unwrap(res));
}
