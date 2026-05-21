import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'brand' | 'blue' | 'amber' | 'rose' | 'violet';
}

const toneMap: Record<NonNullable<Props['tone']>, string> = {
  brand: 'bg-brand-50 text-brand-700',
  blue: 'bg-sky-50 text-sky-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  violet: 'bg-violet-50 text-violet-700',
};

export function StatCard({ icon: Icon, label, value, hint, tone = 'brand' }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
          {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
        </div>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', toneMap[tone])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
