import { apiClient, unwrap, ApiEnvelope } from './client';
import { PagedResult } from './users';

export interface SystemAnalytics {
  totalUsers: number;
  activeUsers: number;
  dailyActiveUsers: number;
  totalTransactions: number;
  totalWallets: number;
  totalBudgets: number;
  aiCallsToday: number;
  aiCostToday: number;
  aiCallsMonth: number;
  aiCostMonth: number;
}

export interface DailyMetric {
  date: string;
  count: number;
}

export interface AiUsageDay {
  date: string;
  totalApiCalls: number;
  categorizationCalls: number;
  chatbotCalls: number;
  reportGenerationCalls: number;
  estimatedCostUsd: number;
}

export interface CategoryCorrection {
  logId: string;
  transactionId: string;
  userId: string;
  userEmail: string;
  description: string;
  originalCategory: string;
  correctedCategory: string;
  correctedAt: string;
}

export const analyticsApi = {
  system: () =>
    apiClient
      .get<ApiEnvelope<SystemAnalytics>>('/api/admin/analytics/system')
      .then(unwrap),

  dailyActiveUsers: (days = 30) =>
    apiClient
      .get<ApiEnvelope<DailyMetric[]>>('/api/admin/analytics/dau', { params: { days } })
      .then(unwrap),

  dailyTransactions: (days = 30) =>
    apiClient
      .get<ApiEnvelope<DailyMetric[]>>('/api/admin/analytics/transactions-daily', {
        params: { days },
      })
      .then(unwrap),

  aiUsageByDate: (date: string) =>
    apiClient
      .get<ApiEnvelope<AiUsageDay>>('/api/admin/analytics/ai-usage', { params: { date } })
      .then(unwrap),

  aiUsageSeries: (days = 14) =>
    apiClient
      .get<ApiEnvelope<DailyMetric[]>>('/api/admin/analytics/ai-usage/series', {
        params: { days },
      })
      .then(unwrap),

  categoryCorrections: (page = 1, pageSize = 20) =>
    apiClient
      .get<ApiEnvelope<PagedResult<CategoryCorrection>>>('/api/admin/category-correction-logs', {
        params: { page, pageSize },
      })
      .then(unwrap),
};

export interface AnnouncementRequest {
  title: string;
  message: string;
  targetSegment: 'AllUsers' | 'ActiveUsers' | 'InactiveUsers';
}

export interface AnnouncementResponse {
  announcementId: string;
  targeted: number;
  delivered: number;
}

export const announcementsApi = {
  send: (req: AnnouncementRequest) =>
    apiClient
      .post<ApiEnvelope<AnnouncementResponse>>('/api/admin/announcements', req)
      .then(unwrap),
};
