import { Home, PiggyBank, Sparkles, type LucideIcon } from "lucide-react";

export interface BucketIconOption {
  value: string;
  icon: LucideIcon;
}

export const bucketIconOptions: BucketIconOption[] = [
  { value: "home", icon: Home },
  { value: "sparkles", icon: Sparkles },
  { value: "piggy-bank", icon: PiggyBank },
];

export interface MockBucket {
  id: string;
  nameVi: string;
  nameEn: string;
  color: string;
  icon: string;
  sortOrder: number;
}

export const initialBuckets: MockBucket[] = [
  {
    id: "needs",
    nameVi: "Nhu cầu",
    nameEn: "Needs",
    color: "#2563eb",
    icon: "home",
    sortOrder: 1,
  },
  {
    id: "wants",
    nameVi: "Mong muốn",
    nameEn: "Wants",
    color: "#8b5cf6",
    icon: "sparkles",
    sortOrder: 2,
  },
  {
    id: "savings",
    nameVi: "Tiết kiệm",
    nameEn: "Savings",
    color: "#10b981",
    icon: "piggy-bank",
    sortOrder: 3,
  },
];

export function iconForBucket(icon: string): LucideIcon {
  return bucketIconOptions.find((option) => option.value === icon)?.icon ?? Home;
}
