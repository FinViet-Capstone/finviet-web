import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { authApi, UserResponse, AdminInfo } from '../api/auth';
import { tokenStore } from '../api/client';

interface SessionUser {
  userId: string;
  email: string;
  fullName: string;
  role: 'ADMIN';
}

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const adminToSession = (a: AdminInfo): SessionUser => ({
  userId: a.adminId,
  email: a.email,
  fullName: a.adminName,
  role: 'ADMIN',
});

const userToSession = (u: UserResponse): SessionUser => ({
  userId: u.userId,
  email: u.email,
  fullName: u.fullName,
  role: 'ADMIN',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStore.getAccess();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((u) => {
        if (u.role === 'ADMIN') {
          setUser(userToSession(u));
        } else {
          tokenStore.clear();
          setUser(null);
        }
      })
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const resp = await authApi.adminLogin(email, password);
    tokenStore.set(resp.accessToken, resp.refreshToken);
    const session = adminToSession(resp.admin);
    setUser(session);
    return session;
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
