export interface MockCorrection {
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

export const correctedCategoryOptions = ["Cà phê", "Giải trí", "Dịch vụ đăng ký", "Di chuyển"];

const categoryColorByName: Record<string, string> = {
  "Cà phê": "#f97316",
  "Giải trí": "#8b5cf6",
  "Dịch vụ đăng ký": "#2563eb",
  "Di chuyển": "#10b981",
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

function buildCorrections(count: number): MockCorrection[] {
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

export const initialCorrections: MockCorrection[] = buildCorrections(60);
