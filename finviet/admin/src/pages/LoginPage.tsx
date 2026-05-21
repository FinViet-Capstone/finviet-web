import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import toast from 'react-hot-toast';
import { Wallet } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [email, setEmail] = useState('admin@finviet.local');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Đăng nhập thành công');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Đăng nhập thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-emerald-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white shadow-lg mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">FinViet Admin</h1>
          <p className="text-slate-500 mt-1">Bảng điều khiển quản trị viên</p>
        </div>

        <form onSubmit={onSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="admin@finviet.local"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

          <p className="text-xs text-slate-400 text-center pt-2">
            Tài khoản demo: admin@finviet.local / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
