import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type { AdminCategory, CategoryInput, CategoryType, DefaultBucket } from "@/types/categories";

// Backed by finviet-be's CategoriesController (api/categories) — GET is [Authorize] (any role),
// POST/PATCH/DELETE {id} are [Authorize(Roles = "Admin")], per context/project-spec.md Feature D.
//
// customIconDataUrl stays mock-only / not persisted: the real icon-upload endpoint
// (POST /api/categories/icons) exists but is [Authorize(Roles = "Customer")] only — the admin
// JWT this app holds gets a 403 from it, so there's no real upload path for this admin screen
// today (see context/backend-gaps.md). The color-mix/preset-icon path below never touches it.

interface CategoryResponseDto {
  categoryId: string;
  categoryName: string;
  nameVi: string | null;
  nameEn: string | null;
  type: string;
  isMandatory: boolean;
  expenseClass: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number | null;
}

async function authHeaders() {
  const token = await getFinvietAdminToken();
  return { Authorization: `Bearer ${token}` };
}

function toAdminCategory(dto: CategoryResponseDto): AdminCategory {
  return {
    id: dto.categoryId,
    name: dto.categoryName,
    nameVi: dto.nameVi ?? dto.categoryName,
    nameEn: dto.nameEn ?? dto.categoryName,
    type: dto.type as CategoryType,
    defaultBucket: dto.expenseClass as DefaultBucket,
    isMandatory: dto.isMandatory,
    icon: dto.icon ?? "",
    customIconDataUrl: null,
    color: dto.color ?? "",
    sortOrder: dto.sortOrder ?? 0,
  };
}

function toRequestBody(input: CategoryInput) {
  return {
    categoryName: input.name,
    nameVi: input.nameVi,
    nameEn: input.nameEn,
    type: input.type,
    isMandatory: input.isMandatory,
    expenseClass: input.defaultBucket,
    icon: input.icon,
    color: input.color,
    sortOrder: input.sortOrder,
  };
}

export async function listCategories(): Promise<AdminCategory[]> {
  const headers = await authHeaders();
  const res = await finvietApi.get<{ success: boolean; message?: string; data: CategoryResponseDto[] }>(
    "/api/categories",
    { headers },
  );
  return unwrap(res).map(toAdminCategory);
}

export async function createCategory(input: CategoryInput): Promise<AdminCategory> {
  const headers = await authHeaders();
  const res = await finvietApi.post<{ success: boolean; message?: string; data: CategoryResponseDto }>(
    "/api/categories",
    toRequestBody(input),
    { headers },
  );
  return toAdminCategory(unwrap(res));
}

export async function updateCategory(id: string, input: CategoryInput): Promise<AdminCategory> {
  const headers = await authHeaders();
  const res = await finvietApi.patch<{ success: boolean; message?: string; data: CategoryResponseDto }>(
    `/api/categories/${id}`,
    toRequestBody(input),
    { headers },
  );
  return toAdminCategory(unwrap(res));
}

export async function deleteCategory(id: string): Promise<{ id: string }> {
  const headers = await authHeaders();
  await finvietApi.delete(`/api/categories/${id}`, { headers });
  return { id };
}
