import axios, { AxiosError, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090';

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string | null;
  data: T;
}

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const ACCESS_KEY = 'finviet_admin_access';
const REFRESH_KEY = 'finviet_admin_refresh';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pending: Array<(token: string | null) => void> = [];

apiClient.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError<any>) => {
    const original: any = error.config;
    if (error.response?.status === 401 && !original?._retry) {
      const refresh = tokenStore.getRefresh();
      if (!refresh) {
        tokenStore.clear();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pending.push((token) => {
            if (token) {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(original));
            } else {
              reject(error);
            }
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const r = await axios.post(`${baseURL}/api/auth/refresh-token`, {
          refreshToken: refresh,
        });
        const env: ApiEnvelope<any> = r.data;
        const tokenData = env.data ?? env;
        const accessToken = tokenData.accessToken;
        const refreshToken = tokenData.refreshToken;
        tokenStore.set(accessToken, refreshToken);
        pending.forEach((cb) => cb(accessToken));
        pending = [];
        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch (e) {
        pending.forEach((cb) => cb(null));
        pending = [];
        tokenStore.clear();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    const data: any = error.response?.data;
    const msg = data?.message || error.message || 'Có lỗi xảy ra';
    if (error.response && error.response.status >= 500) {
      toast.error(`Lỗi máy chủ: ${msg}`);
    }
    return Promise.reject(error);
  }
);

export function unwrap<T>(resp: AxiosResponse<ApiEnvelope<T>>): T {
  const env = resp.data;
  if (env && typeof env === 'object' && 'success' in env) {
    if (!env.success) {
      throw new Error(env.message || 'API request failed');
    }
    return env.data as T;
  }
  return env as unknown as T;
}
