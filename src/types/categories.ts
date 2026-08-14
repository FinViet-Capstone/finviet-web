export type CategoryType = "expense" | "income";
export type DefaultBucket = "needs" | "wants" | "savings" | null;

export interface AdminCategory {
  id: string;
  name: string;
  nameVi: string;
  nameEn: string;
  type: CategoryType;
  defaultBucket: DefaultBucket;
  isMandatory: boolean;
  icon: string;
  customIconDataUrl?: string | null;
  color: string;
  sortOrder: number;
}

export interface CategoryInput {
  name: string;
  nameVi: string;
  nameEn: string;
  type: CategoryType;
  defaultBucket: DefaultBucket;
  isMandatory: boolean;
  icon: string;
  customIconDataUrl?: string | null;
  color: string;
  sortOrder: number;
}
