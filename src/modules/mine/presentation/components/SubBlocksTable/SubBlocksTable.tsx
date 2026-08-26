// src/modules/mine/presentation/components/SubBlocksTable/SubBlocksTable.tsx

import { 
  DocumentPlusIcon, 
  BeakerIcon, 
  TagIcon, 
  TruckIcon, 
  Cog6ToothIcon, 
  CheckCircleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import { SUB_BLOCK_STATUS_LABELS, DESTINATION_LABELS } from '../../../../../core/domain/constants/mine.constants';
import { SUB_BLOCK_STATUS_COLORS } from '../../../../../core/domain/constants/subblock.constants';
import type { SubBlock } from '../../../../../core/domain/types/mine.types';

interface SubBlocksTableProps {
  subBlocks: SubBlock[];
  isLoading?: boolean;
  onRowClick?: (subBlock: SubBlock) => void;
  onActionClick?: (subBlock: SubBlock, actionType: 'sample' | 'lab' | 'classify' | 'destination' | 'crush' | 'view') => void;
}

export function SubBlocksTable({ subBlocks, isLoading, onRowClick, onActionClick }: SubBlocksTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-[#8A9DB0]">
        <div className="w-6 h-6 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin ml-2" />
        در حال بارگذاری ساب‌بلوک‌ها...
      </div>
    );
  }

  if (!subBlocks || subBlocks.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
        <InformationCircleIcon className="w-10 h-10 text-[#4A6A8A] mx-auto mb-2" />
        <p className="text-[#8A9DB0] text-sm">هیچ ساب‌بلوکی برای نمایش یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0A1628]/60 backdrop-blur-md">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-[#8A9DB0] text-xs">
            <th className="px-4 py-3 font-semibold">ردیف</th>
            <th className="px-4 py-3 font-semibold">کد ساب‌بلوک</th>
            <th className="px-4 py-3 font-semibold">تناژ (تن)</th>
            <th className="px-4 py-3 font-semibold">وضعیت چرخه</th>
            <th className="px-4 py-3 font-semibold">آنالیز عیار (Fe)</th>
            <th className="px-4 py-3 font-semibold">طبقه‌بندی کانسار</th>
            <th className="px-4 py-3 font-semibold">مقصد / خط خردایش</th>
            <th className="px-4 py-3 font-semibold text-center">عملیات مرحله بعد</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-white">
          {subBlocks.map((sb, idx) => {
            const fe = sb.labResults?.fe;
            const p = sb.labResults?.p;
            const s = sb.labResults?.s;
            const statusClass = SUB_BLOCK_STATUS_COLORS[sb.status] || 'bg-gray-500/20 text-gray-300';
            const statusLabel = SUB_BLOCK_STATUS_LABELS[sb.status] || sb.status;

            return (
              <tr 
                key={sb.id} 
                onClick={() => onRowClick && onRowClick(sb)}
                className="hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-xs text-[#8A9DB0] font-mono">{idx + 1}</td>
                <td className="px-4 py-3 font-bold text-[#00D4FF] font-mono">{sb.code}</td>
                <td className="px-4 py-3 text-xs font-mono">
                  {sb.tonnage ? `${sb.tonnage.toLocaleString()} تن` : sb.estimatedTonnage ? `~${sb.estimatedTonnage.toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
                    {statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {fe !== undefined && fe !== null ? (
                    <div className="flex flex-col">
                      <span className={`font-bold font-mono ${fe >= 58 ? 'text-green-400' : fe >= 48 ? 'text-yellow-400' : fe >= 35 ? 'text-orange-400' : 'text-red-400'}`}>
                        {fe.toFixed(2)}% Fe
                      </span>
                      {(p || s) ? (
                        <span className="text-[10px] text-[#8A9DB0] font-mono">
                          {p ? `P: ${p.toFixed(2)}% ` : ''}{s ? `S: ${s.toFixed(2)}%` : ''}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-xs text-[#4A6A8A]">در انتظار آنالیز</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {sb.materialClass ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-[#AACCDD]">{sb.materialClass}</span>
                      <span className="text-[10px] text-[#8A9DB0]">{sb.rockType || sb.economicClass || ''}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#4A6A8A]">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {sb.crusherFeedData ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Cog6ToothIcon className="w-3.5 h-3.5" />
                      {sb.crusherFeedData.lineName || sb.crusherFeedData.crusherLine}
                    </span>
                  ) : sb.destination ? (
                    <span className="text-xs text-[#AACCDD]">
                      {DESTINATION_LABELS[sb.destination] || sb.destination}
                    </span>
                  ) : (
                    <span className="text-xs text-[#4A6A8A]">تعیین نشده</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1.5">
                    {/* بر اساس وضعیت فعلی، دکمه اقدام بعدی فعال می‌شود */}
                    {(!sb.sampleId || sb.status === 'DEFINED' || sb.status === 'SUB_BLOCKED') && (
                      <button
                        onClick={() => onActionClick && onActionClick(sb, 'sample')}
                        title="ثبت نمونه‌برداری"
                        className="p-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-colors cursor-pointer border border-yellow-500/20"
                      >
                        <DocumentPlusIcon className="w-4 h-4" />
                      </button>
                    )}

                    {(sb.status === 'SAMPLING_COMPLETED' || sb.status === 'LAB_SENT' || sb.status === 'LAB_IN_PROGRESS') && (
                      <button
                        onClick={() => onActionClick && onActionClick(sb, 'lab')}
                        title="ثبت نتایج آزمایشگاه"
                        className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors cursor-pointer border border-purple-500/20"
                      >
                        <BeakerIcon className="w-4 h-4" />
                      </button>
                    )}

                    {(sb.status === 'LAB_COMPLETED' || sb.status === 'CLASSIFICATION_PENDING') && (
                      <button
                        onClick={() => onActionClick && onActionClick(sb, 'classify')}
                        title="طبقه‌بندی ژئومتالورژی کانسار"
                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors cursor-pointer border border-blue-500/20"
                      >
                        <TagIcon className="w-4 h-4" />
                      </button>
                    )}

                    {(sb.status === 'CLASSIFICATION_DONE' || sb.status === 'DESTINATION_PENDING') && (
                      <button
                        onClick={() => onActionClick && onActionClick(sb, 'destination')}
                        title="تعیین و تخصیص مقصد"
                        className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors cursor-pointer border border-cyan-500/20"
                      >
                        <TruckIcon className="w-4 h-4" />
                      </button>
                    )}

                    {(sb.status === 'DESTINATION_APPROVED' || sb.status === 'DELIVERED' || sb.status === 'PROCESSING') && (
                      <button
                        onClick={() => onActionClick && onActionClick(sb, 'crush')}
                        title="خوراک‌دهی و مصرف در خط خردایش"
                        className="p-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors cursor-pointer border border-pink-500/20"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                      </button>
                    )}

                    {sb.status === 'FINAL_PRODUCT' && (
                      <span className="p-1.5 text-green-400" title="چرخه کامل شده و در خط خردایش مصرف گردید">
                        <CheckCircleIcon className="w-5 h-5" />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
