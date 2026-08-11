// src/shared/components/Table/Table.tsx

import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  emptyMessage = 'داده ای یافت نشد',
}: TableProps<T>) {
  const isDark = typeof window !== 'undefined' 
    ? document.documentElement.classList.contains('dark')
    : true;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-[#8A9DB0]">در حال بارگذاری...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-16 rounded-xl border ${
        isDark 
          ? 'border-[#AACCDD]/10 text-[#8A9DB0]' 
          : 'border-gray-200 text-gray-500'
      }`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const bgPrimary = isDark ? 'bg-[#13203A]/40' : 'bg-white/60';
  const borderColor = isDark ? 'border-[#AACCDD]/10' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-[#8A9DB0]' : 'text-gray-500';

  return (
    <div className={`overflow-hidden backdrop-blur-xl border rounded-xl ${bgPrimary} ${borderColor}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className={`border-b ${borderColor}`}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-medium ${textSecondary} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`border-b ${borderColor} hover:bg-white/5 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm">
                    {col.render 
                      ? col.render(item, index) 
                      : <span className={textPrimary}>{String((item as any)[col.key] ?? '-')}</span>
                    }
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