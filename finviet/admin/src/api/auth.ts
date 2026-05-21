import { apiClient, unwrap, ApiEnvelope } from './client';

export interface UserResponse {
  userId: string;
  email: string;
  fullName: string;
  monthlyIncome: number | null;
  role: 'USER' | 'ADMIN';
  status: 'Active' | 'Inactive';
}

export interface AdminInfo {
  adminId: string;
  adminName: string;
  email: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  admin: AdminInfo;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export const authApi = {
  adminLogin: (email: string, password: string) =>
    apiClient
      .post<ApiEnvelope<AdminLoginResponse>>('/api/admin/auth/login', { email, password })
      .then(unwrap),

  me: () =>
    apiClient.get<ApiEnvelope<UserResponse>>('/api/auth/me').then(unwrap),

  refresh: (refreshToken: string) =>
    apiClient
      .post<ApiEnvelope<TokenResponse>>('/api/auth/refresh-token', { refreshToken })
      .then(unwrap),
};
