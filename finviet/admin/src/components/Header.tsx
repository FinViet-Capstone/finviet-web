import { LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (user?.fullName || 'A')
    .split(' ')
    .map((p) => p[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div>
        <div className="text-sm text-slate-500">Xin chào,</div>
        <div className="font-semibold text-slate-900">{user?.fullName}</div>
      </div>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-sm">
            {initials}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-slate-900 leading-tight">{user?.email}</div>
            <div className="text-xs text-slate-500">{user?.role}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 card py-1 z-10">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
