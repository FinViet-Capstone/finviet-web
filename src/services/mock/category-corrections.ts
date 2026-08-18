import type {
  CategoryCorrectionView,
  CorrectionsListResult,
  DateRangeFilter,
  ExportCorrectionsParams,
  ListCorrectionsParams,
} from "@/types/category-corrections";
import { createDevStore } from "./dev-store";
import { delay } from "./delay";

// Matches mock/categories.ts's 4 expense categories exactly, since the real UI now sources its
// filter dropdown from GET /api/categories (see the category-corrections page) rather than a
// hardcoded list — these names have to actually exist in the mock category catalog for the
// dropdown/filter to agree with each other in mock mode.
const correctedCategoryOptions = ["Ăn uống", "Di chuyển", "Nhà ở", "Giải trí"];

const categoryColorByName: Record<string, string> = {
  "Ăn uống": "#f97316",
  "Di chuyển": "#2563eb",
  "Nhà ở": "#64748b",
  "Giải trí": "#8b5cf6",
};

const seeds: { desc: string; aiGuess: string }[] = [
  { desc: "Highlands Coffee", aiGuess: "Ăn uống" },
  { desc: "Grab Bike", aiGuess: "Di chuyển" },
  { desc: "The Coffee House", aiGuess: "Ăn uống" },
  { desc: "Netflix", aiGuess: "Giải trí" },
  { desc: "Shopee", aiGuess: "Mua sắm" },
  { desc: "Circle K", aiGuess: "Ăn uống" },
  { desc: "Tiki", aiGuess: "Mua sắm" },
  { desc: "Be", aiGuess: "Di chuyển" },
  { desc: "Katinat", aiGuess: "Ăn uống" },
  { desc: "Spotify", aiGuess: "Giải trí" },
];

const emailLetters = "abcdefghijklmnopqrstuvwxyz";

function formatFull(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  return `${hh}:${mm}, ${dd}/${mo}/${date.getFullYear()}`;
}

function formatRelativeLabel(daysAgo: number, hoursAgo: number): string {
  if (daysAgo === 0) return hoursAgo <= 1 ? "Vừa xong" : `${hoursAgo} giờ trước`;
  if (daysAgo === 1) return "Hôm qua";
  return `${daysAgo} ngày trước`;
}

function buildCorrections(count: number): CategoryCorrectionView[] {
  const now = new Date();

  return Array.from({ length: count }, (_, i) => {
    const seed = seeds[i % seeds.length];
    const categoryName = correctedCategoryOptions[i % correctedCategoryOptions.length];
    const daysAgo = Math.floor(i * (89 / (count - 1)));
    const hoursAgo = daysAgo === 0 ? (i % 6) + 1 : 0;

    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - hoursAgo, (i * 7) % 60, 0, 0);

    const email = i < emailLetters.length ? `${emailLetters[i]}@mail.com` : `user${i + 1}@mail.com`;

    return {
      id: String(i + 1),
      transactionDescription: seed.desc,
      amount: 20000 + ((i * 4133) % 400000),
      aiGuess: seed.aiGuess,
      correctedCategoryName: categoryName,
      correctedCategoryColor: categoryColorByName[categoryName],
      customerEmail: email,
      correctedAtLabel: formatRelativeLabel(daysAgo, hoursAgo),
      correctedAtFull: formatFull(date),
      correctedAtISO: date.toISOString(),
    };
  });
}

const store = createDevStore<CategoryCorrectionView[]>("category-corrections", () => buildCorrections(60));

const dateRangeDays: Record<DateRangeFilter, number> = { "7d": 7, "30d": 30, "90d": 90 };

function filterCorrections(dateRange: DateRangeFilter, category?: string): CategoryCorrectionView[] {
  const cutoff = Date.now() - dateRangeDays[dateRange] * 24 * 60 * 60 * 1000;
  return store.get().filter((correction) => {
    const matchesCategory = !category || category === "all" || correction.correctedCategoryName === category;
    const matchesDateRange = new Date(correction.correctedAtISO).getTime() >= cutoff;
    return matchesCategory && matchesDateRange;
  });
}

export async function listCorrections(params: ListCorrectionsParams): Promise<CorrectionsListResult> {
  await delay();
  const filtered = filterCorrections(params.dateRange, params.category);
  const start = (params.page - 1) * params.pageSize;
  const items = filtered.slice(start, start + params.pageSize);
  return { items, total: filtered.length, page: params.page, pageSize: params.pageSize };
}

export async function exportCorrections(params: ExportCorrectionsParams): Promise<CategoryCorrectionView[]> {
  await delay();
  return filterCorrections(params.dateRange, params.category);
}
