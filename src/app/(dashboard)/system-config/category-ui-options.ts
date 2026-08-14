import { Bus, Clapperboard, Coins, Home, Utensils, type LucideIcon } from "lucide-react";
import type { DefaultBucket } from "@/types/categories";

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

export function iconForCategory(icon: string): LucideIcon {
  return categoryIconOptions.find((option) => option.value === icon)?.icon ?? Coins;
}

export const bucketLabels: Record<Exclude<DefaultBucket, null>, string> = {
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
};
