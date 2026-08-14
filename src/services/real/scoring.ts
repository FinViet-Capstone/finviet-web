import type { AdminScoringCriterion, ScoringWeightInput } from "@/types/scoring";

// ScoringCriterion exists as a real finviet-be table but has no admin CRUD endpoint yet, and
// even once one exists, SpendingScoreService.cs doesn't read from it (hardcoded weights) — see
// context/backend-gaps.md. Saving here would have no effect on real scores until both gaps close.

export async function listScoringCriteria(): Promise<AdminScoringCriterion[]> {
  throw new Error("Not implemented: finviet-be has no scoring-criteria endpoint yet");
}

export async function saveScoringCriteria(_inputs: ScoringWeightInput[]): Promise<AdminScoringCriterion[]> {
  throw new Error("Not implemented: finviet-be has no scoring-criteria endpoint yet");
}
