// src/modules/mine/presentation/components/SubBlockTimeline/SubBlockTimeline.tsx

import { SubBlock, SubBlockStatus } from '../../../../../core/domain/types/mine.types';
import { 
  SUB_BLOCK_PHASES, 
  PHASE_LABELS, 
  PHASE_COLORS,
  SUB_BLOCK_STATUS_LABELS,
  getPhase,
  getStatusesByPhase
} from '../../../../../core/domain/constants/subblock.constants';
import { SubBlockLifecycleService } from '../../../services/SubBlockLifecycleService';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface SubBlockTimelineProps {
  subBlock: SubBlock;
  className?: string;
  onStatusClick?: (status: SubBlockStatus) => void;
}

export function SubBlockTimeline({ subBlock, className = '', onStatusClick }: SubBlockTimelineProps) {
  const phases = Object.values(SUB_BLOCK_PHASES);
  const currentPhase = getPhase(subBlock.status);
  const currentPhaseIndex = phases.indexOf(currentPhase);

  // دریافت وضعیت‌های هر فاز
  const getPhaseStatuses = (phase: string): SubBlockStatus[] => {
    return getStatusesByPhase(phase as any);
  };

  // بررسی آیا فاز کامل شده
  const isPhaseComplete = (phaseIndex: number): boolean => {
    return phaseIndex < currentPhaseIndex;
  };

  // بررسی آیا فاز فعلی است
  const isPhaseActive = (phaseIndex: number): boolean => {
    return phaseIndex === currentPhaseIndex;
  };

  // بررسی آیا فاز آینده است
  const isPhaseFuture = (phaseIndex: number): boolean => {
    return phaseIndex > currentPhaseIndex;
  };

  // بررسی آیا وضعیت خاصی در این فاز رخ داده
  const hasStatusInPhase = (phase: string): boolean => {
    const phaseStatuses = getStatusesByPhase(phase as any);
    return subBlock.statusHistory?.some(h => 
      phaseStatuses.includes(h.status as SubBlockStatus)
    ) || false;
  };

  // دریافت آخرین وضعیت در یک فاز
  const getLastStatusInPhase = (phase: string): SubBlockStatus | null => {
    const phaseStatuses = getStatusesByPhase(phase as any);
    const history = subBlock.statusHistory || [];
    const statusesInPhase = history
      .filter(h => phaseStatuses.includes(h.status as SubBlockStatus))
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    
    return statusesInPhase.length > 0 ? statusesInPhase[0].status as SubBlockStatus : null;
  };

  // دریافت زمان تغییر در یک فاز
  const getPhaseChangeTime = (phase: string): string | null => {
    const phaseStatuses = getStatusesByPhase(phase as any);
    const history = subBlock.statusHistory || [];
    const statusesInPhase = history
      .filter(h => phaseStatuses.includes(h.status as SubBlockStatus))
      .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
    
    return statusesInPhase.length > 0 ? statusesInPhase[0].changedAt : null;
  };

  return (
    <div className={`${className}`}>
      <div className="relative">
        {/* خط زمان */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-700/50 -translate-x-1/2" />
        
        {/* فازها */}
        <div className="relative space-y-8">
          {phases.map((phase, index) => {
            const isComplete = isPhaseComplete(index);
            const isActive = isPhaseActive(index);
            const isFuture = isPhaseFuture(index);
            const phaseStatus = getLastStatusInPhase(phase);
            const phaseTime = getPhaseChangeTime(phase);
            const hasStatus = hasStatusInPhase(phase);
            const statusLabel = phaseStatus ? SUB_BLOCK_STATUS_LABELS[phaseStatus] : PHASE_LABELS[phase as keyof typeof PHASE_LABELS];
            const color = isComplete ? '#22C55E' : isActive ? PHASE_COLORS[phase as keyof typeof PHASE_COLORS] : '#4B5563';
            
            return (
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-6"
              >
                {/* دایره وضعیت */}
                <div className="relative z-10 flex-shrink-0 w-12">
                  <div 
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                      isComplete 
                        ? 'border-green-500 bg-green-500/20' 
                        : isActive 
                          ? `border-[${color}] bg-[${color}]/20 shadow-lg shadow-[${color}]/30 animate-pulse` 
                          : 'border-gray-600 bg-gray-800/50'
                    }`}
                    style={{ borderColor: isActive ? color : undefined }}
                  >
                    {isComplete ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : isActive ? (
                      <ClockIcon className="w-4 h-4 animate-spin" style={{ color }} />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-600" />
                    )}
                  </div>
                </div>

                {/* محتوای فاز */}
                <div 
                  className={`flex-1 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isComplete 
                      ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10' 
                      : isActive 
                        ? `border-[${color}]/40 bg-[${color}]/5 hover:bg-[${color}]/10 shadow-lg shadow-[${color}]/10` 
                        : 'border-gray-700/30 bg-gray-800/30 hover:bg-gray-800/50'
                  }`}
                  onClick={() => phaseStatus && onStatusClick?.(phaseStatus)}
                  style={{ borderColor: isActive ? color : undefined }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-semibold ${
                        isComplete ? 'text-green-400' : isActive ? 'text-white' : 'text-gray-400'
                      }`}
                      style={{ color: isActive ? color : undefined }}
                      >
                        {PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}
                      </h4>
                      {phaseStatus && (
                        <p className={`text-sm ${
                          isComplete ? 'text-green-300/70' : isActive ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {statusLabel}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {phaseTime && (
                        <p className={`text-xs ${
                          isComplete ? 'text-green-400/60' : isActive ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {new Date(phaseTime).toLocaleDateString('fa-IR')}
                        </p>
                      )}
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#00D4FF]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
                          در حال انجام
                        </span>
                      )}
                      {isComplete && (
                        <span className="text-xs text-green-400/60">✓ تکمیل</span>
                      )}
                    </div>
                  </div>

                  {/* نمایش وضعیت‌های داخل فاز */}
                  {hasStatus && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {getStatusesByPhase(phase as any).map(status => {
                        const hasThisStatus = subBlock.statusHistory?.some(h => h.status === status);
                        if (!hasThisStatus) return null;
                        
                        const historyEntry = subBlock.statusHistory?.find(h => h.status === status);
                        const isCurrentStatus = subBlock.status === status;
                        
                        return (
                          <span 
                            key={status}
                            className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                              isCurrentStatus 
                                ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30' 
                                : 'bg-gray-700/30 text-gray-400'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusClick?.(status);
                            }}
                          >
                            {SUB_BLOCK_STATUS_LABELS[status]}
                            {historyEntry?.duration && (
                              <span className="ml-1 text-[8px] opacity-50">
                                ({Math.floor(historyEntry.duration / 60)}h)
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* نمایش مدت زمان کل فاز */}
                  {hasStatus && (
                    <div className="mt-2 text-[10px] text-gray-500">
                      {(() => {
                        const firstStatus = subBlock.statusHistory?.find(h => 
                          getStatusesByPhase(phase as any).includes(h.status as SubBlockStatus)
                        );
                        const lastStatus = [...(subBlock.statusHistory || [])]
                          .reverse()
                          .find(h => getStatusesByPhase(phase as any).includes(h.status as SubBlockStatus));
                        
                        if (firstStatus && lastStatus) {
                          const start = new Date(firstStatus.changedAt).getTime();
                          const end = new Date(lastStatus.changedAt).getTime();
                          const diff = Math.floor((end - start) / 60000);
                          if (diff > 0) {
                            return `⏱️ ${Math.floor(diff / 60)} ساعت و ${diff % 60} دقیقه`;
                          }
                        }
                        return '';
                      })()}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* خلاصه آمار */}
      <div className="mt-6 p-4 rounded-xl bg-gray-800/30 border border-gray-700/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">وضعیت فعلی</p>
            <p className="text-sm font-semibold text-white">
              {SUB_BLOCK_STATUS_LABELS[subBlock.status] || subBlock.status}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">پیشرفت کل</p>
            <p className="text-sm font-semibold text-[#00D4FF]">
              {SubBlockLifecycleService.getProgress(subBlock).percentComplete}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">فاز فعلی</p>
            <p className="text-sm font-semibold text-white">
              {SubBlockLifecycleService.getProgress(subBlock).currentPhase}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">تعداد تغییرات</p>
            <p className="text-sm font-semibold text-white">
              {subBlock.statusHistory?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}