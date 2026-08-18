export interface AdminBucket {
  id: string;
  nameVi: string;
  nameEn: string;
  color: string;
  icon: string;
  sortOrder: number;
  defaultPct: number;
}

export interface BucketInput {
  nameVi: string;
  nameEn: string;
  color: string;
  icon: string;
  sortOrder: number;
  defaultPct: number;
}
