import type { AdminAnnouncement, AnnouncementInput, AnnouncementsListResult } from "@/types/announcements";

// finviet-be's Notification entity is one row per single, nullable CustomerId — there's no
// broadcast/fan-out endpoint yet (see context/project-spec.md Feature G's gap note). This is
// the biggest real-backend lift of the 8 domains migrated in this pass.

export async function listAnnouncements(): Promise<AnnouncementsListResult> {
  throw new Error("Not implemented: finviet-be has no announcement list endpoint yet");
}

export async function sendAnnouncement(_input: AnnouncementInput): Promise<AdminAnnouncement> {
  throw new Error("Not implemented: finviet-be has no broadcast/fan-out endpoint yet");
}
