export type DocumentStatus = "ready" | "processing";

export interface MockDocument {
  id: string;
  title: string;
  status: DocumentStatus;
  chunkCount: number | null;
  uploadedAtLabel: string;
}

export const initialDocuments: MockDocument[] = [
  {
    id: "doc-1",
    title: "Chính sách bảo mật 2026",
    status: "ready",
    chunkCount: 42,
    uploadedAtLabel: "01/07/2025",
  },
  {
    id: "doc-2",
    title: "FAQ Premium",
    status: "processing",
    chunkCount: null,
    uploadedAtLabel: "Hôm nay",
  },
  {
    id: "doc-3",
    title: "Hướng dẫn sử dụng ví",
    status: "ready",
    chunkCount: 28,
    uploadedAtLabel: "15/05/2025",
  },
  {
    id: "doc-4",
    title: "Điều khoản dịch vụ",
    status: "ready",
    chunkCount: 56,
    uploadedAtLabel: "02/03/2025",
  },
  {
    id: "doc-5",
    title: "Chính sách hoàn tiền",
    status: "processing",
    chunkCount: null,
    uploadedAtLabel: "Hôm qua",
  },
];
