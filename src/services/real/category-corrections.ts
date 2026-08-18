import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type {
  CategoryCorrectionView,
  CorrectionsListResult,
  DateRangeFilter,
  ExportCorrectionsParams,
  ListCorrectionsParams,
} from "@/types/category-corrections";

// Backed by finviet-be's CategoryCorrectionsController (api/category-corrections),
// [Authorize(Roles = "Admin")]. GetCategoryCorrectionsQueryHandler now joins Customer/
// Transaction/CorrectedCategory in, so CategoryCorrectionResponseDto carries customerEmail/
// transactionDescription/amount/correctedCategoryName directly — no separate admin lookup
// needed for those anymore (see the resolved context/backend-gaps.md entry).
//
// The category filter dropdown (src/app/(dashboard)/category-corrections/page.tsx) still works
// in terms of a category *name*, not id — resolved to a real CategoryId here via GET /api/categories
// (fetched fresh per call; this list is small/admin-curated, not worth caching) before it's sent
// as the CategoryId query param the backend actually filters on.

interface CategoryCorrectionResponseDto {
  logId: string;
  customerId: string | null;
  customerEmail: string | null;
  transactionId: string | null;
  transactionDescription: string | null;
  amount: number | null;
  adminId: string | null;
  correctedCategoryId: string | null;
  correctedCategoryName: string | null;
  originalAiGuess: string | null;
  createdAt: string | null;
}

interface PagedResultDto<T> {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[] | null;
}

interface CategoryResponseDto {
  categoryId: string;
  categoryName: string;
  nameVi: string | null;
  color: string | null;
}

const FALLBACK_CATEGORY_COLOR = "#64748b";
const dateRangeDays: Record<DateRangeFilter, number> = { "7d": 7, "30d": 30, "90d": 90 };

async function authHeaders() {
  const token = await getFinvietAdminToken();
  return { Authorization: `Bearer ${token}` };
}

async function fetchCategoryColorById(headers: Record<string, string>): Promise<Map<string, string>> {
  const res = await finvietApi.get<{ success: boolean; message?: string; data: CategoryResponseDto[] }>(
    "/api/categories",
    { headers },
  );
  const categories = unwrap(res);
  return new Map(categories.map((c) => [c.categoryId, c.color ?? FALLBACK_CATEGORY_COLOR]));
}

async function resolveCategoryId(name: string | undefined, headers: Record<string, string>): Promise<string | undefined> {
  if (!name || name === "all") return undefined;
  const res = await finvietApi.get<{ success: boolean; message?: string; data: CategoryResponseDto[] }>(
    "/api/categories",
    { headers },
  );
  const match = unwrap(res).find((c) => (c.nameVi ?? c.categoryName) === name);
  return match?.categoryId;
}

function createdAtFrom(dateRange: DateRangeFilter): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - dateRangeDays[dateRange]);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

function formatFull(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  return `${hh}:${mm}, ${dd}/${mo}/${date.getFullYear()}`;
}

function formatRelativeLabel(createdAt: Date): string {
  const daysAgo = Math.floor((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
  if (daysAgo <= 0) {
    const hoursAgo = Math.floor((Date.now() - createdAt.getTime()) / (60 * 60 * 1000));
    return hoursAgo <= 1 ? "Vừa xong" : `${hoursAgo} giờ trước`;
  }
  if (daysAgo === 1) return "Hôm qua";
  return `${daysAgo} ngày trước`;
}

function toCategoryCorrectionView(
  dto: CategoryCorrectionResponseDto,
  colorById: Map<string, string>,
): CategoryCorrectionView {
  const createdAt = dto.createdAt ? new Date(dto.createdAt) : new Date(0);
  return {
    id: dto.logId,
    transactionDescription: dto.transactionDescription ?? "—",
    amount: dto.amount ?? 0,
    aiGuess: dto.originalAiGuess ?? "—",
    correctedCategoryName: dto.correctedCategoryName ?? "—",
    correctedCategoryColor:
      (dto.correctedCategoryId && colorById.get(dto.correctedCategoryId)) ?? FALLBACK_CATEGORY_COLOR,
    customerEmail: dto.customerEmail ?? "—",
    correctedAtLabel: formatRelativeLabel(createdAt),
    correctedAtFull: formatFull(createdAt),
    correctedAtISO: createdAt.toISOString(),
  };
}

export async function listCorrections(params: ListCorrectionsParams): Promise<CorrectionsListResult> {
  const headers = await authHeaders();
  const [categoryId, colorById] = await Promise.all([
    resolveCategoryId(params.category, headers),
    fetchCategoryColorById(headers),
  ]);

  const res = await finvietApi.get<{ success: boolean; message?: string; data: PagedResultDto<CategoryCorrectionResponseDto> }>(
    "/api/category-corrections",
    {
      params: {
        Page: params.page,
        PageSize: params.pageSize,
        CategoryId: categoryId,
        CreatedAtFrom: createdAtFrom(params.dateRange),
      },
      headers,
    },
  );
  const data = unwrap(res);
  return {
    items: (data.items ?? []).map((dto) => toCategoryCorrectionView(dto, colorById)),
    total: data.totalItems,
    page: data.page,
    pageSize: data.pageSize,
  };
}

const EXPORT_PAGE_SIZE = 100;
const MAX_EXPORT_PAGES = 50; // caps the worst case at 5,000 matching rows for a CSV export

export async function exportCorrections(params: ExportCorrectionsParams): Promise<CategoryCorrectionView[]> {
  const headers = await authHeaders();
  const [categoryId, colorById] = await Promise.all([
    resolveCategoryId(params.category, headers),
    fetchCategoryColorById(headers),
  ]);

  const all: CategoryCorrectionResponseDto[] = [];
  for (let page = 1; page <= MAX_EXPORT_PAGES; page++) {
    const res = await finvietApi.get<{ success: boolean; message?: string; data: PagedResultDto<CategoryCorrectionResponseDto> }>(
      "/api/category-corrections",
      {
        params: {
          Page: page,
          PageSize: EXPORT_PAGE_SIZE,
          CategoryId: categoryId,
          CreatedAtFrom: createdAtFrom(params.dateRange),
        },
        headers,
      },
    );
    const data = unwrap(res);
    all.push(...(data.items ?? []));
    if (page >= data.totalPages) break;
  }

  return all.map((dto) => toCategoryCorrectionView(dto, colorById));
}
