import { finvietApi, unwrap } from "@/lib/finviet-api";
import { getFinvietAdminToken } from "@/lib/finviet-admin-token";
import type { AdminScoringCriterion, ScoringWeightInput } from "@/types/scoring";

// Backed by finviet-be's ScoringCriteriaController (api/scoring-criteria),
// [Authorize(Roles = "Admin")]. Also backs the real spending score now (see
// SpendingScoreService.cs reading ScoringCriterion directly) — saving here has a real effect,
// unlike when context/backend-gaps.md's entry on this was written.

interface ScoringCriterionResponseDto {
  code: string;
  criterionName: string;
  weightWeekly: number;
  weightMonthly: number;
  version: number;
  updatedAt: string | null;
}

async function authHeaders() {
  const token = await getFinvietAdminToken();
  return { Authorization: `Bearer ${token}` };
}

function toAdminCriterion(dto: ScoringCriterionResponseDto): AdminScoringCriterion {
  return {
    code: dto.code,
    name: dto.criterionName,
    weightWeekly: dto.weightWeekly,
    weightMonthly: dto.weightMonthly,
    version: String(dto.version),
  };
}

export async function listScoringCriteria(): Promise<AdminScoringCriterion[]> {
  const headers = await authHeaders();
  const res = await finvietApi.get<{ success: boolean; message?: string; data: ScoringCriterionResponseDto[] }>(
    "/api/scoring-criteria",
    { headers },
  );
  return unwrap(res).map(toAdminCriterion);
}

// finviet-be only exposes a per-criterion PATCH (/{code}), not a bulk save — so this issues one
// PATCH per input. The 100%-per-period sum is validated here, against the merged (current +
// incoming) full set, before any PATCH fires: three independent single-row updates give the
// server no natural place to enforce "the whole set must sum to 100" atomically.
export async function saveScoringCriteria(inputs: ScoringWeightInput[]): Promise<AdminScoringCriterion[]> {
  const current = await listScoringCriteria();
  const merged = current.map((criterion) => {
    const input = inputs.find((item) => item.code === criterion.code);
    return input ? { ...criterion, weightWeekly: input.weightWeekly, weightMonthly: input.weightMonthly } : criterion;
  });

  const weeklyTotal = merged.reduce((total, c) => total + (c.weightWeekly ?? 0), 0);
  const monthlyTotal = merged.reduce((total, c) => total + (c.weightMonthly ?? 0), 0);
  if (weeklyTotal !== 100 || monthlyTotal !== 100) {
    throw new Error("Tổng trọng số tuần và tháng phải bằng 100%.");
  }

  const headers = await authHeaders();
  const updated = await Promise.all(
    inputs.map(async (input) => {
      const res = await finvietApi.patch<{ success: boolean; message?: string; data: ScoringCriterionResponseDto }>(
        `/api/scoring-criteria/${input.code}`,
        { weightWeekly: input.weightWeekly, weightMonthly: input.weightMonthly },
        { headers },
      );
      return toAdminCriterion(unwrap(res));
    }),
  );

  const byCode = new Map(updated.map((c) => [c.code, c]));
  return merged.map((c) => byCode.get(c.code) ?? c);
}
