// src/modules/mine/presentation/components/LifecycleHub/SubBlockLifecycleOverviewBar.tsx

import React from 'react';
import { 
  ChevronLeft, 
  Filter 
} from 'lucide-react';
import type { SubBlock } from '../../../../../core/domain/types/mine.types';
import { getSubBlockStageStates, LIFECYCLE_STAGES } from './SubBlockSteppedProgress';

interface SubBlockLifecycleOverviewBarProps {
  subBlocks: SubBlock[];
  activeStageFilter: string;
  onSelectStageFilter: (filter: string) => void;
}

export const SubBlockLifecycleOverviewBar: React.FC<SubBlockLifecycleOverviewBarProps> = ({
  subBlocks,
  activeStageFilter,
  onSelectStageFilter,
}) => {
  const totalCount = subBlocks.length;

  // محاسبه تعداد ساب‌بلوک‌های موجود در هر مرحله
  const stageStats = React.useMemo(() => {
    // آرایه‌ای برای ۶ مرحله
    const atStage = [0, 0, 0, 0, 0, 0];
    const completedOrPast = [0, 0, 0, 0, 0, 0];

    subBlocks.forEach(sb => {
      const { currentStageIndex, stages } = getSubBlockStageStates(sb);
      if (currentStageIndex >= 0 && currentStageIndex < 6) {
        atStage[currentStageIndex]++;
      }
      stages.forEach((st, idx) => {
        if (st.status === 'COMPLETED' || st.status === 'CURRENT') {
          completedOrPast[idx]++;
        }
      });
    });

    return {
      atStage,
      completedOrPast,
    };
  }, [subBlocks]);

  // نگاشت کلیدهای فیلتر به اندیس مرحله
  const stageFilterMap: Record<number, string> = {
    0: 'DEFINITION',
    1: 'SAMPLING',
    2: 'LAB',
    3: 'CLASSIFY',
    4: 'DESTINATION',
    5: 'CRUSHING',
  };

  // رنگ و تم هر گام
  const getStageTheme = (idx: number, isActive: boolean) => {
    switch (idx) {
      case 0: // تفکیک
        return {
          border: isActive ? 'border-slate-400 bg-slate-800/80 shadow-slate-500/20' : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700',
          accent: 'text-slate-300',
          badge: 'bg-slate-700/50 text-slate-300',
          line: 'from-slate-500 to-amber-500',
        };
      case 1: // نمونه‌برداری
        return {
          border: isActive ? 'border-amber-400 bg-amber-950/40 shadow-amber-500/20' : 'border-slate-800/80 bg-slate-900/50 hover:border-amber-500/40',
          accent: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
          line: 'from-amber-500 to-purple-500',
        };
      case 2: // آزمایشگاه
        return {
          border: isActive ? 'border-purple-400 bg-purple-950/40 shadow-purple-500/20' : 'border-slate-800/80 bg-slate-900/50 hover:border-purple-500/40',
          accent: 'text-purple-400',
          badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
          line: 'from-purple-500 to-blue-500',
        };
      case 3: // طبقه‌بندی
        return {
          border: isActive ? 'border-blue-400 bg-blue-950/40 shadow-blue-500/20' : 'border-slate-800/80 bg-slate-900/50 hover:border-blue-500/40',
          accent: 'text-blue-400',
          badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
          line: 'from-blue-500 to-cyan-500',
        };
      case 4: // تعیین مقصد
        return {
          border: isActive ? 'border-cyan-400 bg-cyan-950/40 shadow-cyan-500/20' : 'border-slate-800/80 bg-slate-900/50 hover:border-cyan-500/40',
          accent: 'text-cyan-400',
          badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
          line: 'from-cyan-500 to-emerald-500',
        };
      case 5: // بارگیری و تحویل
        return {
          border: isActive ? 'border-emerald-400 bg-emerald-950/40 shadow-emerald-500/20' : 'border-slate-800/80 bg-slate-900/50 hover:border-emerald-500/40',
          accent: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
          line: 'from-emerald-500 to-emerald-400',
        };
      default:
        return {
          border: 'border-slate-800 bg-slate-900/50',
          accent: 'text-cyan-400',
          badge: 'bg-slate-800 text-slate-300',
          line: 'from-slate-700 to-slate-700',
        };
    }
  };

  return (
    <div className="space-y-2 text-right" dir="rtl">
      {/* سربرگ نوار پیشرفت مرحله‌ای */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            نوار پیشرفت مرحله‌ای چرخه ساب‌بلوک‌ها (Stepped Lifecycle Pipeline)
          </h3>
          <span className="text-[11px] text-slate-500">
            • تفکیک و پیگیری بلادرنگ در ۶ گام استاندارد
          </span>
        </div>

        {activeStageFilter !== 'ALL' && (
          <button
            onClick={() => onSelectStageFilter('ALL')}
            className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>نمایش همه مراحل ({totalCount})</span>
          </button>
        )}
      </div>

      {/* نوار متصل ۶ گامی پیشرفت با خطوط اتصال گرادیان */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative">
        {LIFECYCLE_STAGES.map((stage, idx) => {
          const filterKey = stageFilterMap[idx];
          const isFilterActive = activeStageFilter === filterKey;
          const currentCount = stageStats.atStage[idx] || 0;
          const passedCount = stageStats.completedOrPast[idx] || 0;
          const percentageOfTotal = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
          const theme = getStageTheme(idx, isFilterActive);
          const IconComponent = stage.icon;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onSelectStageFilter(isFilterActive ? 'ALL' : filterKey)}
              className={`relative p-3.5 rounded-2xl border text-right transition-all duration-200 cursor-pointer shadow-md flex flex-col justify-between gap-2.5 ${theme.border} ${
                isFilterActive ? 'ring-2 ring-cyan-400/50 scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
            >
              {/* نشانگر انتهای مرحله قبلی و اتصال */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-mono font-black ${
                    currentCount > 0 
                      ? 'bg-cyan-400 text-slate-950 font-bold ring-2 ring-cyan-400/30 shadow-sm'
                      : passedCount === totalCount && totalCount > 0
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={`text-xs font-bold truncate ${isFilterActive ? 'text-white' : 'text-slate-200'}`}>
                    {stage.shortTitle}
                  </span>
                </div>

                <IconComponent className={`w-4 h-4 ${theme.accent}`} />
              </div>

              {/* آمار عددی ساب‌بلوک‌های حاضر در این مرحله */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-xl font-black font-mono text-white">
                    {currentCount}
                    <span className="text-[11px] font-normal text-slate-400 mr-1">بلوک</span>
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${theme.badge}`}>
                    {percentageOfTotal}٪ عبور
                  </span>
                </div>

                {/* نوار کوچک درصد پیشرفت داخل هر گام */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-l from-cyan-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${percentageOfTotal}%` }}
                  />
                </div>
              </div>

              {/* متن راهنما / وضعیت جاری */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                <span className="truncate text-slate-400">
                  {currentCount > 0 ? `${currentCount} در انتظار اقدام` : 'تکمیل یا بدون معطلی'}
                </span>
                {idx < 5 && (
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SubBlockLifecycleOverviewBar;
