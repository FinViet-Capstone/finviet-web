import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type { AdminBucket, BucketInput } from "@/types/buckets";

// Backed by finviet-be's BucketsController (api/buckets), [Authorize(Roles = "Admin")].

interface BucketResponseDto {
  id: string;
  nameVi: string;
  nameEn: string;
  color: string;
  icon: string;
  sortOrder: number;
  // IsLocked is real but deliberately not surfaced — per product direction (see
  // context/backend-gaps.md) admins can edit every bucket, including "savings".
  isLocked: boolean;
  // System-wide default Needs/Wants/Savings % (UC-15) — only affects customers who register
  // *after* a change; RegisterCommandHandler/GoogleLoginCommandHandler read this at signup
  // instead of the old hard-coded 50/30/20 CLR defaults, existing customers untouched.
  defaultPct: number | null;
}

async function authHeaders() {
  const token = await getFinvietAdminToken();
  return { Authorization: `Bearer ${token}` };
}

function toAdminBucket(dto: BucketResponseDto): AdminBucket {
  return {
    id: dto.id,
    nameVi: dto.nameVi,
    nameEn: dto.nameEn,
    color: dto.color,
    icon: dto.icon,
    sortOrder: dto.sortOrder,
    defaultPct: dto.defaultPct ?? 0,
  };
}

export async function listBuckets(): Promise<AdminBucket[]> {
  const headers = await authHeaders();
  const res = await finvietApi.get<{ success: boolean; message?: string; data: BucketResponseDto[] }>(
    "/api/buckets",
    { headers },
  );
  return unwrap(res).map(toAdminBucket);
}

export async function updateBucket(id: string, input: BucketInput): Promise<AdminBucket> {
  const headers = await authHeaders();
  const res = await finvietApi.patch<{ success: boolean; message?: string; data: BucketResponseDto }>(
    `/api/buckets/${id}`,
    input,
    { headers },
  );
  return toAdminBucket(unwrap(res));
}
