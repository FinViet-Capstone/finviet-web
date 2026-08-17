import type { AdminDocument, DocumentUploadInput } from "@/types/knowledge-base";
import { HttpError } from "@/lib/http-error";

// POST /api/ai/documents already exists for real in finviet-be ([Authorize(Roles = "Admin")],
// see context/project-spec.md Feature F) — upload could flip real sooner than list/delete, which
// have no confirmed endpoints yet. Kept as a stub here too for consistency until JWT propagation
// (see src/lib/finviet-api.ts) is solved.

export async function listDocuments(): Promise<AdminDocument[]> {
  throw new HttpError(501, "Not implemented: finviet-be has no knowledge-base document list endpoint yet");
}

export async function uploadDocument(_input: DocumentUploadInput): Promise<AdminDocument> {
  throw new HttpError(501, "Not implemented: document upload wiring pending JWT propagation");
}

export async function deleteDocument(_id: string): Promise<{ id: string }> {
  throw new HttpError(501, "Not implemented: finviet-be has no knowledge-base document delete endpoint yet");
}
