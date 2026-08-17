import type {
  CategoryCorrectionView,
  CorrectionsListResult,
  ExportCorrectionsParams,
  ListCorrectionsParams,
} from "@/types/category-corrections";
import { HttpError } from "@/lib/http-error";

// CategoryCorrectionLog exists as a real finviet-be entity, linked to Customer/Transaction/
// Category, but no confirmed paginated list endpoint exists yet (see context/project-spec.md
// Feature E).

export async function listCorrections(_params: ListCorrectionsParams): Promise<CorrectionsListResult> {
  throw new HttpError(501, "Not implemented: finviet-be has no category-correction list endpoint yet");
}

export async function exportCorrections(_params: ExportCorrectionsParams): Promise<CategoryCorrectionView[]> {
  throw new HttpError(501, "Not implemented: finviet-be has no category-correction list endpoint yet");
}
