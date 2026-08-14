export interface AdminScoringCriterion {
  code: string;
  name: string;
  weightWeekly: number | null;
  weightMonthly: number | null;
  version: string;
}

export interface ScoringWeightInput {
  code: string;
  weightWeekly: number | null;
  weightMonthly: number | null;
}
