import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Tags, Megaphone, Wallet } from 'lucide-react';
import clsx from 'clsx';

const items = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Người dùng', icon: Users },
  { to: '/analytics', label: 'Phân tích', icon: BarChart3 },
  { to: '/category-corrections', label: 'Sửa danh mục', icon: Tags },
  { to: '/announcements', label: 'Thông báo', icon: Megaphone },
];

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-slate-900">FinViet</div>
          <div className="text-xs text-slate-500">Admin Console</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <it.icon className="w-4 h-4" />
            {it.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-xs text-slate-400 border-t border-slate-200">
        FinViet v1.0 · Capstone SU26SE026
      </div>
    </aside>
  );
}
