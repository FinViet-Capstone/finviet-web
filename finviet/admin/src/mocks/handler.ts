/**
 * Frontend-only mock layer using axios-mock-adapter.
 * Intercepts ALL API calls so the app works without any backend.
 *
 * Activated unconditionally – no VITE_USE_MOCK flag needed.
 * When the real backend is ready, delete this file and remove
 * the import in main.tsx.
 */
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '../api/client';
import {
  MOCK_ADMIN_LOGIN,
  MOCK_SYSTEM_ANALYTICS,
  mockDailyActiveUsers,
  mockDailyTransactions,
  mockAiUsageSeries,
  mockCategoryCorrections,
  mockUsersList,
  ALL_MOCK_USERS,
} from './data';

const mock = new MockAdapter(apiClient, { delayResponse: 300, onNoMatch: 'passthrough' });

// ─── Helper to wrap response in the backend's ApiEnvelope shape ────────────────

const ok = <T>(data: T, message?: string) => ({
  success: true,
  message: message ?? null,
  data,
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

mock.onPost('/api/admin/auth/login').reply((config) => {
  const body = JSON.parse(config.data ?? '{}');
  if (body.email === 'admin@finviet.local' && body.password === 'admin123') {
    return [200, ok(MOCK_ADMIN_LOGIN, 'Admin logged in')];
  }
  return [401, { success: false, message: 'Email hoặc mật khẩu không đúng' }];
});

mock.onGet('/api/auth/me').reply(200,
  ok({
    userId: 'admin-001',
    email: 'admin@finviet.local',
    fullName: 'FinViet Admin',
    monthlyIncome: null,
    role: 'ADMIN',
    status: 'Active',
  }),
);

mock.onPost('/api/auth/refresh-token').reply(200,
  ok({
    accessToken: 'mock-access-token-refreshed',
    refreshToken: 'mock-refresh-token-refreshed',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      userId: 'admin-001',
      email: 'admin@finviet.local',
      fullName: 'FinViet Admin',
      role: 'ADMIN',
      status: 'Active',
    },
  }),
);

// ─── Analytics ────────────────────────────────────────────────────────────────

mock.onGet('/api/admin/analytics/system').reply(200, ok(MOCK_SYSTEM_ANALYTICS));

mock.onGet('/api/admin/analytics/dau').reply((config) => {
  const days = Number(config.params?.days ?? 30);
  return [200, ok(mockDailyActiveUsers(days))];
});

mock.onGet('/api/admin/analytics/transactions-daily').reply((config) => {
  const days = Number(config.params?.days ?? 30);
  return [200, ok(mockDailyTransactions(days))];
});

mock.onGet('/api/admin/analytics/ai-usage/series').reply((config) => {
  const days = Number(config.params?.days ?? 14);
  return [200, ok(mockAiUsageSeries(days))];
});

mock.onGet('/api/admin/analytics/ai-usage').reply((_config) => {
  return [200, ok({
    date: new Date().toISOString().slice(0, 10),
    totalApiCalls: 1543,
    categorizationCalls: 1210,
    chatbotCalls: 280,
    reportGenerationCalls: 53,
    estimatedCostUsd: 2.76,
  })];
});

// ─── Category Corrections ─────────────────────────────────────────────────────

mock.onGet('/api/admin/category-correction-logs').reply((config) => {
  const page = Number(config.params?.page ?? 1);
  const pageSize = Number(config.params?.pageSize ?? 20);
  return [200, ok(mockCategoryCorrections(page, pageSize).data)];
});

// ─── Users ────────────────────────────────────────────────────────────────────

mock.onGet('/api/admin/users').reply((config) => {
  const page = Number(config.params?.page ?? 1);
  const pageSize = Number(config.params?.pageSize ?? 20);
  const keyword = config.params?.keyword as string | undefined;
  const status = config.params?.status as string | undefined;
  return [200, ok(mockUsersList(page, pageSize, keyword, status))];
});

// In-memory state so activate/deactivate are reflected in the list
const userState: Record<string, 'Active' | 'Inactive'> = {};
ALL_MOCK_USERS.forEach((u) => { userState[u.userId] = u.status; });

mock.onPut(/\/api\/admin\/users\/(.+)\/deactivate/).reply((config) => {
  const id = config.url!.split('/')[4];
  if (id) userState[id] = 'Inactive';
  const u = ALL_MOCK_USERS.find((x) => x.userId === id);
  if (u) u.status = 'Inactive';
  return [200, ok(null, 'User deactivated successfully')];
});

mock.onPut(/\/api\/admin\/users\/(.+)\/activate/).reply((config) => {
  const id = config.url!.split('/')[4];
  if (id) userState[id] = 'Active';
  const u = ALL_MOCK_USERS.find((x) => x.userId === id);
  if (u) u.status = 'Active';
  return [200, ok(null, 'User activated successfully')];
});

mock.onPost(/\/api\/admin\/users\/(.+)\/reset-password/).reply(200,
  ok(null, 'Password reset successfully'),
);

mock.onDelete(/\/api\/admin\/users\/(.+)/).reply((config) => {
  const id = config.url!.split('/')[4];
  const idx = ALL_MOCK_USERS.findIndex((x) => x.userId === id);
  if (idx !== -1) ALL_MOCK_USERS.splice(idx, 1);
  return [200, ok(null, 'User deleted successfully')];
});

// ─── Announcements ────────────────────────────────────────────────────────────

mock.onPost('/api/admin/announcements').reply(200,
  ok({
    announcementId: `ann-${Date.now()}`,
    targeted: 1134,
    delivered: 1098,
  }, 'Announcement sent successfully'),
);

export default mock;
