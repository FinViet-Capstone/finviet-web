export interface MockAnnouncement {
  id: string;
  title: string;
  targetLabel: string;
  recipientCount: number;
  sentAtLabel: string;
}

export const TARGET_AUDIENCE_COUNT = 12480;

export const initialAnnouncements: MockAnnouncement[] = [
  {
    id: "ann-1",
    title: "Cập nhật tính năng mới",
    targetLabel: "Tất cả",
    recipientCount: 12102,
    sentAtLabel: "02/08/2026",
  },
  {
    id: "ann-2",
    title: "Bảo trì hệ thống",
    targetLabel: "Tất cả",
    recipientCount: 11980,
    sentAtLabel: "20/07/2026",
  },
  {
    id: "ann-3",
    title: "Ưu đãi nâng cấp Premium",
    targetLabel: "Tất cả",
    recipientCount: 11540,
    sentAtLabel: "05/07/2026",
  },
  {
    id: "ann-4",
    title: "Chào mừng tính năng ví mới",
    targetLabel: "Tất cả",
    recipientCount: 10822,
    sentAtLabel: "18/06/2026",
  },
];
