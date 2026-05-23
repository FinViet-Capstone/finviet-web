import type { SystemAnalytics, DailyMetric, CategoryCorrection } from '../api/analytics';
import type { AdminUser, PagedResult } from '../api/users';
import type { AdminLoginResponse } from '../api/auth';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const MOCK_ADMIN_LOGIN: AdminLoginResponse = {
  accessToken: 'mock-access-token-finviet-admin',
  refreshToken: 'mock-refresh-token-finviet-admin',
  tokenType: 'Bearer',
  expiresIn: 3600,
  admin: {
    adminId: 'admin-001',
    adminName: 'FinViet Admin',
    email: 'admin@finviet.local',
  },
};

// ─── System Analytics ─────────────────────────────────────────────────────────

export const MOCK_SYSTEM_ANALYTICS: SystemAnalytics = {
  totalUsers: 1248,
  activeUsers: 1134,
  dailyActiveUsers: 312,
  totalTransactions: 48_750,
  totalWallets: 3195,
  totalBudgets: 2740,
  aiCallsToday: 1543,
  aiCostToday: 2.76,
  aiCallsMonth: 38_210,
  aiCostMonth: 64.35,
};

// ─── Daily helpers ─────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2_147_483_647;
    return (s - 1) / 2_147_483_646;
  };
}

function buildSeries(days: number, base: number, amplitude: number, seedVal: number): DailyMetric[] {
  const rng = seededRandom(seedVal);
  return Array.from({ length: days }, (_, i) => ({
    date: daysAgo(days - 1 - i),
    count: Math.max(0, Math.round(base + amplitude * (rng() - 0.5) * 2)),
  }));
}

export const mockDailyActiveUsers = (days: number): DailyMetric[] =>
  buildSeries(days, 310, 120, 42);

export const mockDailyTransactions = (days: number): DailyMetric[] =>
  buildSeries(days, 820, 340, 77);

export const mockAiUsageSeries = (days: number): DailyMetric[] =>
  buildSeries(days, 1550, 600, 13);

// ─── Category Corrections ─────────────────────────────────────────────────────

export const MOCK_CORRECTIONS_RAW: CategoryCorrection[] = [
  { logId: 'cl-001', transactionId: 't-001', userId: 'u-002', userEmail: 'demo@finviet.local', description: 'Nap Lien Quan 50k', originalCategory: 'Ăn uống', correctedCategory: 'Giải trí', correctedAt: '2026-05-12T14:20:00' },
  { logId: 'cl-002', transactionId: 't-002', userId: 'u-003', userEmail: 'nguyenvana@gmail.com', description: 'Grab 4.7km', originalCategory: 'Ăn uống', correctedCategory: 'Đi lại', correctedAt: '2026-05-11T09:05:00' },
  { logId: 'cl-003', transactionId: 't-003', userId: 'u-004', userEmail: 'tranthib@gmail.com', description: 'Chuyen khoan hoc phi HK2', originalCategory: 'Đi lại', correctedCategory: 'Học tập', correctedAt: '2026-05-10T16:45:00' },
  { logId: 'cl-004', transactionId: 't-004', userId: 'u-005', userEmail: 'lethic@gmail.com', description: 'Shopee - mua sach', originalCategory: 'Mua sắm', correctedCategory: 'Học tập', correctedAt: '2026-05-10T11:30:00' },
  { logId: 'cl-005', transactionId: 't-005', userId: 'u-006', userEmail: 'phamvand@gmail.com', description: 'GongCha tay tra', originalCategory: 'Giải trí', correctedCategory: 'Ăn uống', correctedAt: '2026-05-09T20:15:00' },
  { logId: 'cl-006', transactionId: 't-006', userId: 'u-007', userEmail: 'hoangvane@gmail.com', description: 'Highlands Coffee', originalCategory: 'Đi lại', correctedCategory: 'Ăn uống', correctedAt: '2026-05-09T08:10:00' },
  { logId: 'cl-007', transactionId: 't-007', userId: 'u-002', userEmail: 'demo@finviet.local', description: 'Be di lam', originalCategory: 'Giải trí', correctedCategory: 'Đi lại', correctedAt: '2026-05-08T18:30:00' },
  { logId: 'cl-008', transactionId: 't-008', userId: 'u-008', userEmail: 'nguyenf@gmail.com', description: 'Mua thuoc Ha Noi', originalCategory: 'Mua sắm', correctedCategory: 'Sức khỏe', correctedAt: '2026-05-07T14:00:00' },
  { logId: 'cl-009', transactionId: 't-009', userId: 'u-009', userEmail: 'vung@gmail.com', description: 'Tien dien thang 5', originalCategory: 'Ăn uống', correctedCategory: 'Hóa đơn', correctedAt: '2026-05-06T09:50:00' },
  { logId: 'cl-010', transactionId: 't-010', userId: 'u-010', userEmail: 'mainh@gmail.com', description: 'Mua sam Shopee - ao', originalCategory: 'Ăn uống', correctedCategory: 'Mua sắm', correctedAt: '2026-05-05T15:20:00' },
  { logId: 'cl-011', transactionId: 't-011', userId: 'u-011', userEmail: 'trangi@gmail.com', description: 'Tien nha thue thang 5', originalCategory: 'Hóa đơn', correctedCategory: 'Nhà ở', correctedAt: '2026-05-04T10:00:00' },
  { logId: 'cl-012', transactionId: 't-012', userId: 'u-012', userEmail: 'le_j@gmail.com', description: 'Phim rap Galaxy', originalCategory: 'Ăn uống', correctedCategory: 'Giải trí', correctedAt: '2026-05-03T21:30:00' },
  { logId: 'cl-013', transactionId: 't-013', userId: 'u-013', userEmail: 'ngok@gmail.com', description: 'Chup anh The Face', originalCategory: 'Mua sắm', correctedCategory: 'Giải trí', correctedAt: '2026-05-02T13:00:00' },
  { logId: 'cl-014', transactionId: 't-014', userId: 'u-014', userEmail: 'dungm@gmail.com', description: 'Pizza 4Ps Hai Ba Trung', originalCategory: 'Đi lại', correctedCategory: 'Ăn uống', correctedAt: '2026-05-01T19:45:00' },
  { logId: 'cl-015', transactionId: 't-015', userId: 'u-015', userEmail: 'ann@gmail.com', description: 'Khoa hoc Udemy', originalCategory: 'Giải trí', correctedCategory: 'Học tập', correctedAt: '2026-04-30T11:15:00' },
  { logId: 'cl-016', transactionId: 't-016', userId: 'u-016', userEmail: 'binhp@gmail.com', description: 'Tap gym Galaxy', originalCategory: 'Mua sắm', correctedCategory: 'Sức khỏe', correctedAt: '2026-04-29T07:30:00' },
  { logId: 'cl-017', transactionId: 't-017', userId: 'u-017', userEmail: 'chuoiq@gmail.com', description: 'Nap the dien thoai', originalCategory: 'Ăn uống', correctedCategory: 'Hóa đơn', correctedAt: '2026-04-28T16:20:00' },
  { logId: 'cl-018', transactionId: 't-018', userId: 'u-018', userEmail: 'dear@gmail.com', description: 'Vietcombank phi chuyển tiền', originalCategory: 'Hóa đơn', correctedCategory: 'Khác', correctedAt: '2026-04-27T09:00:00' },
  { logId: 'cl-019', transactionId: 't-019', userId: 'u-019', userEmail: 'ems@gmail.com', description: 'Mua hoa sinh nhat', originalCategory: 'Mua sắm', correctedCategory: 'Quà tặng', correctedAt: '2026-04-26T14:30:00' },
  { logId: 'cl-020', transactionId: 't-020', userId: 'u-020', userEmail: 'fengt@gmail.com', description: 'Tiết kiệm số', originalCategory: 'Ăn uống', correctedCategory: 'Tiết kiệm', correctedAt: '2026-04-25T10:45:00' },
];

export const mockCategoryCorrections = (page: number, pageSize: number): { data: PagedResult<CategoryCorrection> } => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = MOCK_CORRECTIONS_RAW.slice(start, end);
  return {
    data: {
      items,
      page,
      pageSize,
      totalItems: MOCK_CORRECTIONS_RAW.length,
      totalPages: Math.ceil(MOCK_CORRECTIONS_RAW.length / pageSize),
    },
  };
};

// ─── Users ────────────────────────────────────────────────────────────────────

const STATUSES: Array<'Active' | 'Inactive'> = ['Active', 'Active', 'Active', 'Active', 'Inactive'];

const buildUsers = (): AdminUser[] => {
  const names = [
    ['Nguyễn Văn Demo', 'demo@finviet.local'],
    ['Nguyễn Thị Mai', 'nguyenthimai@gmail.com'],
    ['Trần Văn Bình', 'tranvanbinh@gmail.com'],
    ['Lê Minh Tuấn', 'leminhtuan@gmail.com'],
    ['Phạm Thu Hằng', 'phamthuhang@gmail.com'],
    ['Hoàng Đức Long', 'hoanduclong@gmail.com'],
    ['Vũ Thị Lan', 'vuthilan@gmail.com'],
    ['Đặng Quốc Hùng', 'dangquochung@gmail.com'],
    ['Bùi Thị Thảo', 'buithithao@gmail.com'],
    ['Đinh Hữu Nam', 'dinhhuvnam@gmail.com'],
    ['Ngô Thanh Hoa', 'ngothanhhoa@gmail.com'],
    ['Tô Thị Kim', 'tothikim@gmail.com'],
    ['Lý Văn Khoa', 'lyvankhoa@gmail.com'],
    ['Mai Thị Ánh', 'maithanh@gmail.com'],
    ['Cao Xuân Dũng', 'caoxuandung@gmail.com'],
    ['Phan Thị Ngọc', 'phanthingoc@gmail.com'],
    ['Trịnh Văn Khải', 'trinhvankhai@gmail.com'],
    ['Đỗ Minh Hiếu', 'dominhhieu@gmail.com'],
    ['Kiều Thị Bích', 'kieuthibich@gmail.com'],
    ['Lưu Hồng Phúc', 'luuhongphuc@gmail.com'],
    ['Nguyễn Thị Hồng', 'nguyenthihong@gmail.com'],
    ['Trần Quốc Việt', 'tranquocviet@gmail.com'],
    ['Lê Thanh Tùng', 'lethanhtung@gmail.com'],
    ['Phạm Thị Thủy', 'phamthithuy@gmail.com'],
    ['Hoàng Văn Tú', 'hoangvantu@gmail.com'],
  ];

  const baseDate = new Date('2026-01-01');
  return names.map(([fullName, email], i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i * 3);
    return {
      userId: `user-${String(i + 1).padStart(3, '0')}`,
      email,
      fullName,
      monthlyIncome: [5_000_000, 7_500_000, 8_000_000, 10_000_000, 12_000_000][i % 5],
      role: 'USER' as const,
      status: STATUSES[i % STATUSES.length],
      createdAt: d.toISOString(),
      totalTransactions: 20 + (i * 17) % 120,
      totalWallets: 1 + (i % 3),
    };
  });
};

export const ALL_MOCK_USERS: AdminUser[] = buildUsers();

export const mockUsersList = (
  page: number,
  pageSize: number,
  keyword?: string,
  status?: string,
): PagedResult<AdminUser> => {
  let filtered = ALL_MOCK_USERS;
  if (keyword) {
    const q = keyword.toLowerCase();
    filtered = filtered.filter(
      (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }
  if (status) {
    filtered = filtered.filter((u) => u.status === status);
  }
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    page,
    pageSize,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
};
