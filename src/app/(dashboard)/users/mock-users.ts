export interface MockCustomer {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  totalTransactions: number;
  totalWallets: number;
  plan: "free" | "premium";
}

export const initialCustomers: MockCustomer[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "a@mail.com",
    isActive: true,
    createdAt: "01/03/2025",
    totalTransactions: 42,
    totalWallets: 3,
    plan: "free",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "b@mail.com",
    isActive: false,
    createdAt: "15/02/2025",
    totalTransactions: 12,
    totalWallets: 1,
    plan: "premium",
  },
  {
    id: "3",
    name: "Lê Minh C",
    email: "c@mail.com",
    isActive: true,
    createdAt: "22/01/2025",
    totalTransactions: 87,
    totalWallets: 4,
    plan: "premium",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    email: "d@mail.com",
    isActive: true,
    createdAt: "09/12/2024",
    totalTransactions: 5,
    totalWallets: 1,
    plan: "free",
  },
  {
    id: "5",
    name: "Hoàng Văn E",
    email: "e@mail.com",
    isActive: false,
    createdAt: "30/11/2024",
    totalTransactions: 63,
    totalWallets: 2,
    plan: "free",
  },
  {
    id: "6",
    name: "Vũ Thị F",
    email: "f@mail.com",
    isActive: true,
    createdAt: "18/10/2024",
    totalTransactions: 29,
    totalWallets: 2,
    plan: "premium",
  },
];
