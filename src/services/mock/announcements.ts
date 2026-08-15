import type { AdminAnnouncement, AnnouncementInput, AnnouncementsListResult } from "@/types/announcements";
import { createDevStore } from "./dev-store";
import { delay } from "./delay";

const TARGET_AUDIENCE_COUNT = 12480;

const store = createDevStore<AdminAnnouncement[]>("announcements", () => [
  { id: "ann-1", title: "Cập nhật tính năng mới", targetLabel: "Tất cả", recipientCount: 12102, sentAtLabel: "02/08/2026" },
  { id: "ann-2", title: "Bảo trì hệ thống", targetLabel: "Tất cả", recipientCount: 11980, sentAtLabel: "20/07/2026" },
  { id: "ann-3", title: "Ưu đãi nâng cấp Premium", targetLabel: "Tất cả", recipientCount: 11540, sentAtLabel: "05/07/2026" },
  { id: "ann-4", title: "Chào mừng tính năng ví mới", targetLabel: "Tất cả", recipientCount: 10822, sentAtLabel: "18/06/2026" },
]);

function formatTodayLabel(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${today.getFullYear()}`;
}

export async function listAnnouncements(): Promise<AnnouncementsListResult> {
  await delay();
  return { items: store.get(), targetAudienceCount: TARGET_AUDIENCE_COUNT };
}

export async function sendAnnouncement(input: AnnouncementInput): Promise<AdminAnnouncement> {
  await delay();
  const created: AdminAnnouncement = {
    id: crypto.randomUUID(),
    title: input.title,
    targetLabel: "Tất cả",
    recipientCount: TARGET_AUDIENCE_COUNT,
    sentAtLabel: formatTodayLabel(),
  };
  store.set([created, ...store.get()]);
  return created;
}
