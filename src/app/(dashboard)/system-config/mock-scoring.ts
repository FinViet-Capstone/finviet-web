export interface MockScoringCriterion {
  code: string;
  name: string;
  weightWeekly: number;
  weightMonthly: number;
  version: string;
  updatedAt: string;
}

export const initialScoringCriteria: MockScoringCriterion[] = [
  {
    code: "BUDGET_ADHERENCE",
    name: "Tuân thủ ngân sách",
    weightWeekly: 0.35,
    weightMonthly: 0.3,
    version: "v3",
    updatedAt: "12/01/2025",
  },
  {
    code: "SAVINGS_RATE",
    name: "Tỷ lệ tiết kiệm",
    weightWeekly: 0.25,
    weightMonthly: 0.3,
    version: "v3",
    updatedAt: "12/01/2025",
  },
  {
    code: "SPENDING_CONSISTENCY",
    name: "Tính ổn định chi tiêu",
    weightWeekly: 0.2,
    weightMonthly: 0.2,
    version: "v2",
    updatedAt: "28/11/2024",
  },
  {
    code: "CATEGORY_BALANCE",
    name: "Cân bằng danh mục",
    weightWeekly: 0.2,
    weightMonthly: 0.2,
    version: "v2",
    updatedAt: "28/11/2024",
  },
];
