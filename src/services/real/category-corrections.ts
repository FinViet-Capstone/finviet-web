import type {
  CategoryCorrectionView,
  CorrectionsListResult,
  ExportCorrectionsParams,
  ListCorrectionsParams,
} from "@/types/category-corrections";
import { HttpError } from "@/lib/http-error";

// GET /api/category-corrections is real now ([Authorize(Roles = "Admin")], paginated, with
// Page/PageSize/CategoryId/CreatedAtFrom/CreatedAtTo query params) — but CategoryCorrectionResponseDto
// only carries raw FK ids (customerId, transactionId, correctedCategoryId as GUIDs) plus
// originalAiGuess/createdAt, with no join to customer email, transaction description, or amount.
// correctedCategoryId could be resolved via GET /api/categories (now wired, see real/categories.ts),
// but customerEmail/transactionDescription/amount — this screen's three most important columns,
// per src/app/(dashboard)/category-corrections/page.tsx and its CSV export — have no admin-
// accessible source at all: TransactionsController is [Authorize(Roles = "Customer")] only, and
// there's no admin customer-lookup-by-id endpoint. Showing raw GUIDs or fabricated placeholders
// in their place would be worse than this explicit error. Needs a joined DTO on the backend
// (or a dedicated admin transaction/customer lookup) before this screen can go real.

export async function listCorrections(_params: ListCorrectionsParams): Promise<CorrectionsListResult> {
  throw new HttpError(
    501,
    "Not implemented: /api/category-corrections exists but returns raw ids with no customer/transaction join yet",
  );
}

export async function exportCorrections(_params: ExportCorrectionsParams): Promise<CategoryCorrectionView[]> {
  throw new HttpError(
    501,
    "Not implemented: /api/category-corrections exists but returns raw ids with no customer/transaction join yet",
  );
}
