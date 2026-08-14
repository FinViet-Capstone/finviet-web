export interface CategoryCorrectionView {
  id: string;
  transactionDescription: string;
  amount: number;
  aiGuess: string;
  correctedCategoryName: string;
  correctedCategoryColor: string;
  customerEmail: string;
  correctedAtLabel: string;
  correctedAtFull: string;
  correctedAtISO: string;
}

export type DateRangeFilter = "7d" | "30d" | "90d";

export interface ListCorrectionsParams {
  dateRange: DateRangeFilter;
  category?: string;
  page: number;
  pageSize: number;
}

export interface CorrectionsListResult {
  items: CategoryCorrectionView[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ExportCorrectionsParams {
  dateRange: DateRangeFilter;
  category?: string;
}
