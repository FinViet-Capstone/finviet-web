import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { analyticsApi, CategoryCorrection } from '../api/analytics';
import { formatDateTime, formatNumber } from '../lib/format';

export default function CategoryCorrectionsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'corrections', page, pageSize],
    queryFn: () => analyticsApi.categoryCorrections(page, pageSize),
  });

  const totalPages = data?.totalPages ?? 0;

  const columns = [
    {
      key: 'date',
      header: 'Thời gian',
      render: (c: CategoryCorrection) => (
        <span className="text-slate-700">{formatDateTime(c.correctedAt)}</span>
      ),
    },
    {
      key: 'user',
      header: 'Người dùng',
      render: (c: CategoryCorrection) => <span className="text-slate-700">{c.userEmail}</span>,
    },
    {
      key: 'desc',
      header: 'Mô tả giao dịch',
      render: (c: CategoryCorrection) => (
        <div className="font-medium text-slate-900 max-w-md truncate">{c.description}</div>
      ),
    },
    {
      key: 'change',
      header: 'AI gợi ý → Người dùng chọn',
      render: (c: CategoryCorrection) => (
        <div className="flex items-center gap-2 text-sm">
          <span className="badge-amber">{c.originalCategory}</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <span className="badge-green">{c.correctedCategory}</span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Nhật ký sửa danh mục"
        subtitle={`Tổng ${formatNumber(data?.totalItems ?? 0)} lần người dùng ghi đè gợi ý của AI — dữ liệu để cải thiện prompt`}
      />

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        rowKey={(c) => c.logId}
        loading={isLoading}
        empty="Chưa có ghi nhận nào"
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-slate-500">
            Trang {page} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-secondary"
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-secondary"
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
