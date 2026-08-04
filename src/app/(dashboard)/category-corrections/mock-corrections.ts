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
}

export const correctedCategoryOptions = ["Cà phê", "Giải trí", "Dịch vụ đăng ký", "Di chuyển"];

export const initialCorrections: MockCorrection[] = [
  {
    id: "1",
    transactionDescription: "Highlands Coffee",
    amount: 120000,
    aiGuess: "Ăn uống",
    correctedCategoryName: "Cà phê",
    correctedCategoryColor: "#f97316",
    customerEmail: "a@mail.com",
    correctedAtLabel: "2 giờ trước",
    correctedAtFull: "14:32, 03/08/2026",
  },
  {
    id: "2",
    transactionDescription: "Grab Bike",
    amount: 45000,
    aiGuess: "Di chuyển",
    correctedCategoryName: "Giải trí",
    correctedCategoryColor: "#8b5cf6",
    customerEmail: "b@mail.com",
    correctedAtLabel: "Hôm qua",
    correctedAtFull: "09:14, 02/08/2026",
  },
  {
    id: "3",
    transactionDescription: "The Coffee House",
    amount: 89000,
    aiGuess: "Ăn uống",
    correctedCategoryName: "Cà phê",
    correctedCategoryColor: "#f97316",
    customerEmail: "c@mail.com",
    correctedAtLabel: "Hôm qua",
    correctedAtFull: "16:47, 02/08/2026",
  },
  {
    id: "4",
    transactionDescription: "Netflix",
    amount: 260000,
    aiGuess: "Giải trí",
    correctedCategoryName: "Dịch vụ đăng ký",
    correctedCategoryColor: "#2563eb",
    customerEmail: "d@mail.com",
    correctedAtLabel: "2 ngày trước",
    correctedAtFull: "08:02, 01/08/2026",
  },
  {
    id: "5",
    transactionDescription: "Shopee",
    amount: 350000,
    aiGuess: "Mua sắm",
    correctedCategoryName: "Giải trí",
    correctedCategoryColor: "#8b5cf6",
    customerEmail: "e@mail.com",
    correctedAtLabel: "3 ngày trước",
    correctedAtFull: "20:11, 31/07/2026",
  },
  {
    id: "6",
    transactionDescription: "Circle K",
    amount: 32000,
    aiGuess: "Ăn uống",
    correctedCategoryName: "Di chuyển",
    correctedCategoryColor: "#10b981",
    customerEmail: "f@mail.com",
    correctedAtLabel: "4 ngày trước",
    correctedAtFull: "12:35, 30/07/2026",
  },
];
