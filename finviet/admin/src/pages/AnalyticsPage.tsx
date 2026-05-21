import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { analyticsApi } from '../api/analytics';

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const dauQuery = useQuery({
    queryKey: ['analytics', 'dau', days],
    queryFn: () => analyticsApi.dailyActiveUsers(days),
  });
  const txQuery = useQuery({
    queryKey: ['analytics', 'tx-daily', days],
    queryFn: () => analyticsApi.dailyTransactions(days),
  });
  const aiQuery = useQuery({
    queryKey: ['analytics', 'ai-series', days],
    queryFn: () => analyticsApi.aiUsageSeries(days),
  });

  return (
    <div>
      <PageHeader
        title="Phân tích chi tiết"
        subtitle="Xu hướng người dùng, giao dịch và lưu lượng AI"
        actions={
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="input"
          >
            <option value={7}>7 ngày</option>
            <option value={14}>14 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={90}>90 ngày</option>
          </select>
        }
      />

      <div className="space-y-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">DAU — Người dùng hoạt động hằng ngày</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dauQuery.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name="DAU" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Số giao dịch theo ngày</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={txQuery.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name="Giao dịch" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Lưu lượng AI (OpenAI calls)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiQuery.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} name="AI calls" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
