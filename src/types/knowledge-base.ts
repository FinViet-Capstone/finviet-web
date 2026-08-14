export type DocumentStatus = "ready" | "processing";

export interface AdminDocument {
  id: string;
  title: string;
  status: DocumentStatus;
  chunkCount: number | null;
  uploadedAtLabel: string;
}

export interface DocumentUploadInput {
  title: string;
  fileName: string;
}
