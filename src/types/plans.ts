export interface AdminPlan {
  id: string;
  code: string;
  name: string;
  price: number; // VND, whole currency unit — matches the real backend's decimal column
  billingIntervalMonths: number; // 1 = monthly, 12 = yearly
  savingsBadge?: string;
  highlighted?: boolean;
  features: string[];
  isActive: boolean;
}

export interface PlanInput {
  code: string;
  name: string;
  price: number;
  billingIntervalMonths: number;
  features: string[];
}
