// Mirrors the real, hardcoded weights in finviet-be's SpendingScoreService.cs:
// Weekly = Spike×50 + Budget×50; Monthly = Spike×30 + Budget×40 + Savings×30.
// Savings has no weekly weight — the metric isn't computed for the weekly view at all.
export interface MockScoringCriterion {
  code: string;
  name: string;
  weightWeekly: number | null;
  weightMonthly: number | null;
  version: string;
}

export const initialScoringCriteria: MockScoringCriterion[] = [
  {
    code: "SPIKE",
    name: "Đột biến chi tiêu",
    weightWeekly: 50,
    weightMonthly: 30,
    version: "—",
  },
  {
    code: "BUDGET",
    name: "Tuân thủ ngân sách",
    weightWeekly: 50,
    weightMonthly: 40,
    version: "—",
  },
  {
    code: "SAVINGS",
    name: "Nhất quán tiết kiệm",
    weightWeekly: null,
    weightMonthly: 30,
    version: "—",
  },
];
