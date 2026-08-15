import type { AdminDocument, DocumentUploadInput } from "@/types/knowledge-base";
import { createDevStore } from "./dev-store";
import { delay } from "./delay";

const store = createDevStore<AdminDocument[]>("knowledge-base-documents", () => [
  { id: "doc-1", title: "Chính sách bảo mật 2026", status: "ready", chunkCount: 42, uploadedAtLabel: "01/07/2025" },
  { id: "doc-2", title: "FAQ Premium", status: "processing", chunkCount: null, uploadedAtLabel: "Hôm nay" },
  { id: "doc-3", title: "Hướng dẫn sử dụng ví", status: "ready", chunkCount: 28, uploadedAtLabel: "15/05/2025" },
  { id: "doc-4", title: "Điều khoản dịch vụ", status: "ready", chunkCount: 56, uploadedAtLabel: "02/03/2025" },
  { id: "doc-5", title: "Chính sách hoàn tiền", status: "processing", chunkCount: null, uploadedAtLabel: "Hôm qua" },
]);

export async function listDocuments(): Promise<AdminDocument[]> {
  await delay();
  return store.get();
}

export async function uploadDocument(input: DocumentUploadInput): Promise<AdminDocument> {
  await delay();
  const created: AdminDocument = {
    id: crypto.randomUUID(),
    title: input.title,
    status: "processing",
    chunkCount: null,
    uploadedAtLabel: "Hôm nay",
  };
  store.set([created, ...store.get()]);
  return created;
}

export async function deleteDocument(id: string): Promise<{ id: string }> {
  await delay();
  store.set(store.get().filter((doc) => doc.id !== id));
  return { id };
}
