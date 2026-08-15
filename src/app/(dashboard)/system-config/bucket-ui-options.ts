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

export function iconForBucket(icon: string): LucideIcon {
  return bucketIconOptions.find((option) => option.value === icon)?.icon ?? Home;
}
