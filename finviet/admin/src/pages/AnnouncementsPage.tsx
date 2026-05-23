import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/PageHeader';
import { announcementsApi } from '../api/analytics';

export default function AnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const sendMut = useMutation({
    mutationFn: announcementsApi.send,
    onSuccess: () => {
      toast.success('Đã gửi thông báo đến người dùng');
      setTitle('');
      setBody('');
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || 'Gửi thông báo thất bại'),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }
    if (!window.confirm(`Gửi thông báo "${title}" đến nhóm "${audience}"?`)) return;
    const segment =
      audience === 'ALL' ? 'AllUsers' : audience === 'ACTIVE' ? 'ActiveUsers' : 'InactiveUsers';
    sendMut.mutate({ title, message: body, targetSegment: segment });
  };

  return (
    <div>
      <PageHeader
        title="Gửi thông báo"
        subtitle="Phát thông báo trong ứng dụng tới toàn bộ hoặc nhóm người dùng được chọn"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={onSubmit} className="card p-6 lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Đối tượng nhận</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as any)}
              className="input"
            >
              <option value="ALL">Tất cả người dùng</option>
              <option value="ACTIVE">Người dùng đang hoạt động</option>
              <option value="INACTIVE">Người dùng đã khoá</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tiêu đề</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="input"
              placeholder="Ví dụ: Tính năng mới — Quét hoá đơn bằng AI"
            />
            <div className="text-xs text-slate-400 mt-1">{title.length}/120</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nội dung</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              maxLength={1000}
              className="input resize-none"
              placeholder="Nội dung chi tiết của thông báo..."
            />
            <div className="text-xs text-slate-400 mt-1">{body.length}/1000</div>
          </div>

          <button type="submit" disabled={sendMut.isPending} className="btn-primary">
            <Send className="w-4 h-4" />
            {sendMut.isPending ? 'Đang gửi...' : 'Gửi thông báo'}
          </button>
        </form>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-slate-700 mb-3">
              <Megaphone className="w-4 h-4 text-brand-600" />
              <h3 className="font-semibold">Xem trước</h3>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold text-slate-900 mb-1">
                {title || 'Tiêu đề thông báo'}
              </div>
              <div className="text-sm text-slate-600 whitespace-pre-wrap">
                {body || 'Nội dung thông báo sẽ hiển thị ở đây...'}
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Gửi qua FCM tới ứng dụng Flutter của người dùng.
            </div>
          </div>

          <div className="card p-5 text-sm text-slate-600 space-y-2">
            <div className="font-semibold text-slate-900">Lưu ý</div>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Thông báo sẽ hiển thị dưới dạng push notification.</li>
              <li>Người dùng đã tắt thông báo trên thiết bị sẽ không nhận được.</li>
              <li>Nội dung không được vượt quá 1000 ký tự.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
