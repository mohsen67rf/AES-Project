// src/modules/mine/presentation/components/BlockTimeline.tsx

import { FullBlock, BlockHistoryEntry } from '../../../../core/domain/types/block.types';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface BlockTimelineProps {
  block: FullBlock;
}

export function BlockTimeline({ block }: BlockTimelineProps) {
  const { isDark } = useTheme();

  const statusLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    'DEFINED': { label: 'تعریف شده', icon: <ClockIcon className="w-4 h-4" />, color: 'text-gray-400' },
    'PENDING_APPROVAL': { label: 'در انتظار تأیید', icon: <ClockIcon className="w-4 h-4" />, color: 'text-yellow-400' },
    'APPROVED': { label: 'تأیید شده', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'text-green-400' },
    'REJECTED': { label: 'رد شده', icon: <XCircleIcon className="w-4 h-4" />, color: 'text-red-400' },
    'DRILLING_PERMIT_ISSUED': { label: 'مجوز حفاری صادر شد', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'text-blue-400' },
    'DRILLING_IN_PROGRESS': { label: 'در حال حفاری', icon: <ClockIcon className="w-4 h-4" />, color: 'text-blue-400' },
    'DRILLING_COMPLETED': { label: 'حفاری کامل شد', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'text-green-400' },
    'SUB_BLOCKING': { label: 'در حال ساب‌بندی', icon: <ClockIcon className="w-4 h-4" />, color: 'text-purple-400' },
    'SUB_BLOCKED': { label: 'ساب‌بندی شد', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'text-purple-400' },
    'SAMPLING_COMPLETED': { label: 'نمونه‌برداری کامل', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'text-yellow-400' },
    'LAB_RESULTS_READY': { label: 'نتایج آزمایشگاه', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'text-purple-400' },
    'CLASSIFIED': { label: 'طبقه‌بندی شد', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'text-blue-400' },
    'DESTINATION_SET': { label: 'مقصد تعیین شد', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'text-green-400' },
    'COMPLETED': { label: 'چرخه کامل شد', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'text-green-400' },
  };

  const history = block.history || [];

  if (history.length === 0) {
    return (
      <div className={`text-center py-8 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
        <p>تاریخچه‌ای برای این بلوک ثبت نشده است</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* خط عمودی */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700/30" />

      <div className="space-y-4">
        {history.map((entry, index) => {
          const statusInfo = statusLabels[entry.status] || { label: entry.status, icon: null, color: 'text-gray-400' };
          const isLast = index === history.length - 1;

          return (
            <div key={entry.id} className="relative pl-10">
              {/* دایره وضعیت */}
              <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
                isDark ? 'border-[#AACCDD]/20' : 'border-gray-300'
              } ${statusInfo.color}`}>
                <div className={`w-2 h-2 rounded-full mx-auto mt-0.5 ${statusInfo.color}`} />
              </div>

              {/* محتوا */}
              <div className={`p-3 rounded-xl transition-all ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={statusInfo.color}>{statusInfo.icon}</span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <span className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                    {new Date(entry.changedAt).toLocaleString('fa-IR')}
                  </span>
                </div>
                {entry.note && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                    {entry.note}
                  </p>
                )}
                <p className={`text-[9px] mt-0.5 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                  {entry.changedByName}
                </p>
              </div>

              {!isLast && (
                <div className={`absolute left-4 top-6 bottom-0 w-0.5 ${isDark ? 'bg-[#AACCDD]/10' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}