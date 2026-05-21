import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-500">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-600">Bạn không có quyền truy cập trang này</div>
      </div>
    );
  }

  return <>{children}</>;
}
