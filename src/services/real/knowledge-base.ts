import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type { AdminDocument, DocumentUploadInput } from "@/types/knowledge-base";

// Backed by finviet-be's AdminAiController (api/ai/documents), [Authorize(Roles = "Admin")].
// Ingestion (POST) is synchronous — IngestPdfAsync chunks the PDF before returning — so there is
// no real "processing" state to model: every document GET /api/ai/documents returns already has
// its final chunkCount. status is always "ready" in real mode; DocumentStatus stays a union type
// only because mock mode still simulates a "processing" row for demo purposes.
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
  return { id, title: input.title, status: "ready", chunkCount: null, uploadedAtLabel: "Hôm nay" };
}

export async function deleteDocument(_id: string): Promise<{ id: string }> {
  throw new Error("Not implemented: finviet-be has no knowledge-base document delete endpoint yet");
}
