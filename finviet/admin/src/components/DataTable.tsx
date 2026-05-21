import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
  loading?: boolean;
}

export function DataTable<T>({ columns, data, rowKey, empty, loading }: Props<T>) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-semibold text-slate-600 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  {empty ?? 'Không có dữ liệu'}
                </td>
              </tr>
            )}
            {!loading &&
              data.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-slate-50">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
