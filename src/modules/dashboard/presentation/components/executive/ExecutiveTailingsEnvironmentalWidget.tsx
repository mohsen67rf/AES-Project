// src/modules/dashboard/presentation/components/executive/ExecutiveTailingsEnvironmentalWidget.tsx

import React from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  GlobeAmericasIcon, 
  SparklesIcon, 
  CheckBadgeIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

export const ExecutiveTailingsEnvironmentalWidget: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  return (
    <div 
      className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
        isDark 
          ? 'bg-[#111726]/85 border-[#1E293B] text-white shadow-xl backdrop-blur-xl' 
          : 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <GlobeAmericasIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">
                {isRtl ? 'پایش باطله‌گاه‌ها، زهکشی و الزامات زیست‌محیطی' : 'Waste Dumps & Environmental Monitoring'}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                HSE Green
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl ? 'ظرفیت باقیمانده دپوهای باطله، مهار ریزگرد جاده‌ها و شاخص آب برگشتی' : 'Waste dump capacity, dust control & recycled water %'}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'ظرفیت باقیمانده باطله‌گاه ۱' : 'Dump #1 Capacity'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-teal-400 font-mono">68%</span>
            <span className="text-[10px] text-slate-400">باقیمانده</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'ظرفیت باقیمانده باطله‌گاه ۲' : 'Dump #2 Capacity'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-cyan-400 font-mono">84%</span>
            <span className="text-[10px] text-slate-400">باقیمانده</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'شاخص بازچرخانی آب' : 'Water Recycling'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-blue-400 font-mono">82.5%</span>
            <span className="text-[10px] text-slate-400">بازیافت</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'سرویس‌های آب‌پاشی جاده' : 'Dust Suppression'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-emerald-400 font-mono">36</span>
            <span className="text-[10px] text-slate-400">سرویس/روز</span>
          </div>
        </div>
      </div>
    </div>
  );
};
