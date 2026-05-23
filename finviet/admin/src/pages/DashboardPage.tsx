import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, ArrowLeftRight, Sparkles, DollarSign, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { InfoTooltip } from '../components/InfoTooltip';
import { analyticsApi } from '../api/analytics';
import { formatNumber, formatUsd } from '../lib/format';

export default function DashboardPage() {
  const summaryQuery = useQuery({
    queryKey: ['analytics', 'system'],
    queryFn: analyticsApi.system,
  });
  const dauQuery = useQuery({
    queryKey: ['analytics', 'dau', 30],
    queryFn: () => analyticsApi.dailyActiveUsers(30),
  });
  const txQuery = useQuery({
    queryKey: ['analytics', 'tx-daily', 30],
    queryFn: () => analyticsApi.dailyTransactions(30),
  });
  const aiQuery = useQuery({
    queryKey: ['analytics', 'ai-series', 14],
    queryFn: () => analyticsApi.aiUsageSeries(14),
  });

  const s = summaryQuery.data;

  return (
    <div>
      <PageHeader
        title="Tổng quan hệ thống"
        subtitle="Theo dõi chỉ số người dùng, giao dịch và chi phí AI"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Tổng người dùng"
          value={summaryQuery.isLoading ? '...' : formatNumber(s?.totalUsers)}
          hint={`Đang kích hoạt: ${formatNumber(s?.activeUsers ?? 0)}`}
          tooltip="Tổng số tài khoản trong bảng users. 'Đang kích hoạt' đếm user có active = true (chưa bị khoá)."
          tone="brand"
        />
        <StatCard
          icon={UserCheck}
          label="Người dùng hoạt động hôm nay"
          value={summaryQuery.isLoading ? '...' : formatNumber(s?.dailyActiveUsers)}
          tooltip="DAU = COUNT(DISTINCT user_id) FROM transactions WHERE occurred_on = hôm nay. Đo số user thực sự dùng app trong ngày."
          tone="blue"
        />
        <StatCard
          icon={ArrowLeftRight}
          label="Giao dịch hôm nay"
          value={summaryQuery.isLoading ? '...' : formatNumber(s?.transactionsToday)}
          tooltip="COUNT(*) FROM transactions WHERE occurred_on = hôm nay. Phản ánh khối lượng ghi nhận giao dịch trong ngày."
          tone="violet"
        />
        <StatCard
          icon={Sparkles}
          label="AI calls hôm nay"
          value={summaryQuery.isLoading ? '...' : formatNumber(s?.aiCallsToday)}
          hint={`Chi phí: ${formatUsd(s?.aiCostToday ?? 0)}`}
          tooltip="COUNT(*) FROM ai_usage WHERE occurred_on = hôm nay (mọi loại: phân loại, chat, báo cáo). Chi phí = SUM(cost_usd) cùng điều kiện."
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-slate-900">Người dùng hoạt động hằng ngày</h3>
                <InfoTooltip text="Mỗi điểm = COUNT(DISTINCT user_id) FROM transactions WHERE occurred_on = ngày đó. Phản ánh số user thực sự dùng app mỗi ngày." />
              </div>
              <p className="text-xs text-slate-500">30 ngày gần nhất · nguồn: bảng transactions</p>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dauQuery.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} name="DAU" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-slate-900">Giao dịch theo ngày</h3>
                <InfoTooltip text="Mỗi cột = COUNT(*) FROM transactions WHERE occurred_on = ngày đó. Tính cả giao dịch nhập tay, AI gán và import từ SMS/CSV." />
              </div>
              <p className="text-xs text-slate-500">30 ngày gần nhất · nguồn: bảng transactions</p>
            </div>
            <ArrowLeftRight className="w-5 h-5 text-violet-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={txQuery.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Giao dịch" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-slate-900">Mức độ sử dụng AI</h3>
              <InfoTooltip text="Mỗi điểm = COUNT(*) FROM ai_usage WHERE occurred_on = ngày đó. Gộp mọi loại lượt gọi (phân loại giao dịch, chat, sinh báo cáo tuần)." />
            </div>
            <p className="text-xs text-slate-500">Số lượt gọi OpenAI · 14 ngày · nguồn: bảng ai_usage</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500">
              <span>Chi phí tháng này</span>
              <InfoTooltip text="SUM(cost_usd) FROM ai_usage trong tháng hiện tại (từ ngày 1 đến cuối tháng). Quy đổi USD theo provider trả về." placement="left" width="w-56" />
            </div>
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-amber-600" />
              {formatUsd(s?.aiCostMonth ?? 0)}
            </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aiQuery.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} name="API calls" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
