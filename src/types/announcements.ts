export interface AdminAnnouncement {
  id: string;
  title: string;
  targetLabel: string;
  recipientCount: number;
  sentAtLabel: string;
}

export interface AnnouncementInput {
  title: string;
  body: string;
  targetSegment: "all";
}

export interface AnnouncementsListResult {
  items: AdminAnnouncement[];
  targetAudienceCount: number;
}
