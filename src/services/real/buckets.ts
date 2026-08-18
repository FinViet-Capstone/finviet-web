import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type { AdminBucket, BucketInput, BucketRatioInput } from "@/types/buckets";

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

// UpdateBucketRequest's fields are all optional server-side, so each PATCH here only sends
// defaultPct — same shape as saveScoringCriteria in real/scoring.ts (finviet-be has no bulk-save
// endpoint for either). The 100%-total check runs here, against the merged (current + incoming)
// full set, before any PATCH fires — three independent single-bucket updates give the server no
// atomic place to enforce "the whole set must sum to 100".
export async function saveBucketDefaultRatios(inputs: BucketRatioInput[]): Promise<AdminBucket[]> {
  const current = await listBuckets();
  const merged = current.map((bucket) => {
    const input = inputs.find((item) => item.id === bucket.id);
    return input ? { ...bucket, defaultPct: input.defaultPct } : bucket;
  });

  const total = merged.reduce((sum, bucket) => sum + bucket.defaultPct, 0);
  if (total !== 100) {
    throw new Error("Tổng tỷ lệ 3 nhóm phải bằng 100%.");
  }

  const headers = await authHeaders();
  const updated = await Promise.all(
    inputs.map(async (input) => {
      const res = await finvietApi.patch<{ success: boolean; message?: string; data: BucketResponseDto }>(
        `/api/buckets/${input.id}`,
        { defaultPct: input.defaultPct },
        { headers },
      );
      return toAdminBucket(unwrap(res));
    }),
  );

  const byId = new Map(updated.map((bucket) => [bucket.id, bucket]));
  return merged.map((bucket) => byId.get(bucket.id) ?? bucket);
}
