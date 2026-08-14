export interface AdminPlan {
  id: string;
  code: string;
  name: string;
  priceValue: string;
  priceUnit: string;
  savingsBadge?: string;
  highlighted?: boolean;
  features: string[];
  isActive: boolean;
}

export interface PlanInput {
  code: string;
  name: string;
  priceValue: string;
  priceUnit: string;
  features: string[];
}
