import { Bus, Clapperboard, Coins, Home, Utensils, type LucideIcon } from "lucide-react";

export type CategoryType = "expense" | "income";
export type DefaultBucket = "needs" | "wants" | "savings" | null;

export interface CategoryIconOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const categoryIconOptions: CategoryIconOption[] = [
  { value: "utensils", label: "Ăn uống", icon: Utensils },
  { value: "bus", label: "Di chuyển", icon: Bus },
  { value: "home", label: "Nhà ở", icon: Home },
  { value: "coins", label: "Tiền", icon: Coins },
  { value: "clapperboard", label: "Giải trí", icon: Clapperboard },
];

export const categoryColorOptions = ["#f97316", "#2563eb", "#ef4444", "#10b981", "#8b5cf6", "#64748b"];

export interface MockCategory {
  id: string;
  name: string;
  nameVi: string;
  nameEn: string;
  type: CategoryType;
  defaultBucket: DefaultBucket;
  isMandatory: boolean;
  icon: string;
  color: string;
  sortOrder: number;
}

export const initialCategories: MockCategory[] = [
  {
    id: "1",
    name: "Ăn uống",
    nameVi: "Ăn uống",
    nameEn: "Food",
    type: "expense",
    defaultBucket: "wants",
    isMandatory: false,
    icon: "utensils",
    color: "#f97316",
    sortOrder: 1,
  },
  {
    id: "2",
    name: "Di chuyển",
    nameVi: "Di chuyển",
    nameEn: "Transport",
    type: "expense",
    defaultBucket: "needs",
    isMandatory: false,
    icon: "bus",
    color: "#2563eb",
    sortOrder: 2,
  },
  {
    id: "3",
    name: "Nhà ở",
    nameVi: "Nhà ở",
    nameEn: "Housing",
    type: "expense",
    defaultBucket: "needs",
    isMandatory: true,
    icon: "home",
    color: "#64748b",
    sortOrder: 3,
  },
  {
    id: "4",
    name: "Lương",
    nameVi: "Lương",
    nameEn: "Salary",
    type: "income",
    defaultBucket: null,
    isMandatory: false,
    icon: "coins",
    color: "#10b981",
    sortOrder: 1,
  },
  {
    id: "5",
    name: "Giải trí",
    nameVi: "Giải trí",
    nameEn: "Entertainment",
    type: "expense",
    defaultBucket: "wants",
    isMandatory: false,
    icon: "clapperboard",
    color: "#8b5cf6",
    sortOrder: 4,
  },
];

export function iconForCategory(icon: string): LucideIcon {
  return categoryIconOptions.find((option) => option.value === icon)?.icon ?? Coins;
}

export const bucketLabels: Record<Exclude<DefaultBucket, null>, string> = {
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
};
