import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type { AdminDocument, DocumentFile, DocumentUploadInput } from "@/types/knowledge-base";

// Backed by finviet-be's AdminAiController (api/ai/documents), [Authorize(Roles = "Admin")].
// Ingestion (POST) is synchronous — IngestPdfAsync chunks the PDF before returning — so there is
// no real "processing" state to model: every document GET /api/ai/documents returns already has
// its final chunkCount, and status is always "ready".
//
// DELETE has no backend endpoint yet (see context/backend-gaps.md) — left stubbed below,
// matching the already-disabled delete button in src/app/(dashboard)/knowledge-base/page.tsx.

interface RagDocumentResponseDto {
  id: string;
  title: string | null;
  sourceType: string | null;
  uri: string | null;
  createdAt: string;
  chunkCount: number;
  hasFile: boolean;
}

async function authHeaders() {
  const token = await getFinvietAdminToken();
  return { Authorization: `Bearer ${token}` };
}

function formatUploadedAt(iso: string): string {
  const date = new Date(iso);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

function toAdminDocument(dto: RagDocumentResponseDto): AdminDocument {
  return {
    id: dto.id,
    title: dto.title ?? "",
    status: "ready",
    chunkCount: dto.chunkCount,
    uploadedAtLabel: formatUploadedAt(dto.createdAt),
    hasFile: dto.hasFile,
  };
}

export async function listDocuments(): Promise<AdminDocument[]> {
  const headers = await authHeaders();
  const res = await finvietApi.get<{ success: boolean; message?: string; data: RagDocumentResponseDto[] }>(
    "/api/ai/documents",
    { headers },
  );
  return unwrap(res).map(toAdminDocument);
}

export async function uploadDocument(input: DocumentUploadInput): Promise<AdminDocument> {
  const headers = await authHeaders();
  const formData = new FormData();
  formData.set("title", input.title);
  formData.set("file", input.file, input.fileName);

  // IngestDocument only returns the new document's id, not a full RagDocumentResponse — the
  // upload mutation's onSuccess already invalidates the documents list query, which is what
  // actually refreshes the table with the real chunkCount/uploadedAt; this return value is a
  // best-effort placeholder in the meantime, not re-rendered anywhere itself.
  const res = await finvietApi.post<{ success: boolean; message?: string; data: string }>(
    "/api/ai/documents",
    formData,
    { headers },
  );
  const id = unwrap(res);
  return { id, title: input.title, status: "ready", chunkCount: null, uploadedAtLabel: "Hôm nay", hasFile: true };
}

// The original uploaded PDF, stored in finviet-be's database (rag_document_file). 404 for documents
// uploaded before that storage existed — those must be re-uploaded.
export async function getDocumentFile(id: string): Promise<DocumentFile> {
  const headers = await authHeaders();
  const res = await finvietApi.get<ArrayBuffer>(`/api/ai/documents/${encodeURIComponent(id)}/file`, {
    headers,
    responseType: "arraybuffer",
  });
  return {
    content: res.data,
    contentType: String(res.headers["content-type"] ?? "application/pdf"),
  };
}

export async function deleteDocument(_id: string): Promise<{ id: string }> {
  throw new Error("Not implemented: finviet-be has no knowledge-base document delete endpoint yet");
}
