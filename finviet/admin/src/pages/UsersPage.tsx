import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, KeyRound, Power, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/PageHeader';
import { DataTable } from '../components/DataTable';
import { usersApi, AdminUser } from '../api/users';
import { formatVnd, formatNumber, formatDate } from '../lib/format';

export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<'' | 'Active' | 'Inactive'>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, pageSize, keyword, status],
    queryFn: () =>
      usersApi.list({
        page,
        pageSize,
        keyword: keyword || undefined,
        status: status || undefined,
      }),
  });

  const setActiveMut = useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) =>
      active ? usersApi.activate(userId) : usersApi.deactivate(userId),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['analytics', 'system'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Thao tác thất bại'),
  });

  const resetPwMut = useMutation({
    mutationFn: ({ userId, pw }: { userId: string; pw: string }) =>
      usersApi.resetPassword(userId, pw),
    onSuccess: () => toast.success('Đặt lại mật khẩu thành công'),
    onError: (e: any) => toast.error(e.response?.data?.message || 'Thao tác thất bại'),
  });

  const deleteMut = useMutation({
    mutationFn: (userId: string) => usersApi.delete(userId),
    onSuccess: () => {
      toast.success('Đã xoá người dùng');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['analytics', 'system'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Thao tác thất bại'),
  });

  const onResetPassword = (u: AdminUser) => {
    const pw = window.prompt(`Đặt lại mật khẩu cho ${u.email} (tối thiểu 6 ký tự):`);
    if (!pw) return;
    if (pw.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    resetPwMut.mutate({ userId: u.userId, pw });
  };

  const onDelete = (u: AdminUser) => {
    if (!window.confirm(`Xoá vĩnh viễn ${u.email}? Hành động không thể hoàn tác.`)) return;
    deleteMut.mutate(u.userId);
  };

  const columns = [
    {
      key: 'user',
      header: 'Người dùng',
      render: (u: AdminUser) => (
        <div>
          <div className="font-medium text-slate-900">{u.fullName}</div>
          <div className="text-xs text-slate-500">{u.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (u: AdminUser) => (
        <span className={u.role === 'ADMIN' ? 'badge-amber' : 'badge-slate'}>{u.role}</span>
      ),
    },
    {
      key: 'income',
      header: 'Thu nhập/tháng',
      render: (u: AdminUser) => <span className="text-slate-700">{formatVnd(u.monthlyIncome)}</span>,
    },
    {
      key: 'wallets',
      header: 'Ví / Giao dịch',
      render: (u: AdminUser) => (
        <span className="text-slate-700">
          {formatNumber(u.totalWallets)} / {formatNumber(u.totalTransactions)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày đăng ký',
      render: (u: AdminUser) => <span className="text-slate-700">{formatDate(u.createdAt)}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (u: AdminUser) =>
        u.status === 'Active' ? (
          <span className="badge-green">Hoạt động</span>
        ) : (
          <span className="badge-red">Đã khoá</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u: AdminUser) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() =>
              setActiveMut.mutate({ userId: u.userId, active: u.status !== 'Active' })
            }
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
            title={u.status === 'Active' ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            onClick={() => onResetPassword(u)}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
            title="Đặt lại mật khẩu"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(u)}
            className="p-1.5 rounded hover:bg-red-50 text-red-600"
            title="Xoá người dùng"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = data?.totalPages ?? 0;

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        subtitle={`Tổng ${formatNumber(data?.totalItems ?? 0)} người dùng`}
      />

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={keyword}
            onChange={(e) => {
              setPage(1);
              setKeyword(e.target.value);
            }}
            placeholder="Tìm theo tên hoặc email..."
            className="input pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as any);
          }}
          className="input sm:w-44"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Active">Đang hoạt động</option>
          <option value="Inactive">Đã khoá</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        rowKey={(u) => u.userId}
        loading={isLoading}
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
