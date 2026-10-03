export type DocumentStatus = "ready" | "processing";

export interface AdminDocument {
  id: string;
  title: string;
  status: DocumentStatus;
  chunkCount: number | null;
  uploadedAtLabel: string;
  /** False for documents uploaded before finviet-be stored original files: still used by the AI,
   *  but the PDF itself is gone and must be re-uploaded to be previewable. */
  hasFile: boolean;
}

export interface DocumentUploadInput {
  title: string;
  fileName: string;
  file: File;
}

export interface DocumentFile {
  content: ArrayBuffer;
  contentType: string;
}
