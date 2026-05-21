import { apiClient, unwrap, ApiEnvelope } from './client';

export interface AdminUser {
  userId: string;
  email: string;
  fullName: string;
  monthlyIncome: number | null;
  role: 'USER' | 'ADMIN';
  status: 'Active' | 'Inactive';
  createdAt: string;
  totalTransactions: number;
  totalWallets: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export const usersApi = {
  list: (params: { page?: number; pageSize?: number; keyword?: string; status?: string } = {}) =>
    apiClient
      .get<ApiEnvelope<PagedResult<AdminUser>>>('/api/admin/users', { params })
      .then(unwrap),

  deactivate: (userId: string) =>
    apiClient.put<ApiEnvelope<void>>(`/api/admin/users/${userId}/deactivate`).then(unwrap),

  activate: (userId: string) =>
    apiClient.put<ApiEnvelope<void>>(`/api/admin/users/${userId}/activate`).then(unwrap),

  resetPassword: (userId: string, newPassword: string) =>
    apiClient
      .post<ApiEnvelope<void>>(`/api/admin/users/${userId}/reset-password`, { newPassword })
      .then(unwrap),

  delete: (userId: string) =>
    apiClient.delete<ApiEnvelope<void>>(`/api/admin/users/${userId}`).then(unwrap),
};
