import { isMockMode } from "@/lib/env";
import * as mockAnnouncements from "./mock/announcements";
import * as realAnnouncements from "./real/announcements";

function impl() {
  return isMockMode() ? mockAnnouncements : realAnnouncements;
}

export const listAnnouncements: typeof mockAnnouncements.listAnnouncements = () => impl().listAnnouncements();
export const sendAnnouncement: typeof mockAnnouncements.sendAnnouncement = (input) => impl().sendAnnouncement(input);
