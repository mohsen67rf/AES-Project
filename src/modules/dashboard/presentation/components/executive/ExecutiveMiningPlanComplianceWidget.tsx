// src/modules/dashboard/presentation/components/executive/ExecutiveMiningPlanComplianceWidget.tsx

import React from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  ClipboardDocumentCheckIcon, 
  CheckBadgeIcon, 
  ClockIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

export const ExecutiveMiningPlanComplianceWidget: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const planMilestones = [
    { nameFa: 'برنامه تولید ماهانه کانسنگ (مرداد ۱۴۰۵)', planned: 500000, actual: 497000, pct: 99.4, status: 'ON_TRACK' },
    { nameFa: 'برنامه باطله‌برداری دیواره شمالی', planned: 1800000, actual: 1790000, pct: 99.4, status: 'ON_TRACK' },
    { nameFa: 'پیشروی و آزادسازی پله ۱۸۰۸', planned: 100, actual: 95, pct: 95.0, status: 'ON_TRACK' },
    { nameFa: 'تحویل خوراک به سنگ‌شکن با عیار مصوب', planned: 100, actual: 102, pct: 102.0, status: 'EXCEEDED' },
  ];

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ClipboardDocumentCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">
                {isRtl ? 'انطباق پیشرفت با طرح استخراج مصوب' : 'Mining Plan Compliance & Bench Progress'}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                انطباق: ۹۹.۱٪
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold">
          <CheckBadgeIcon className="w-4 h-4" />
          <span>مطابق بودجه و زمان‌بندی</span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        {planMilestones.map((m, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-900/30 border border-slate-800/70 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white text-[11px]">{m.nameFa}</span>
              <span className="font-mono text-emerald-400 font-bold text-[11px]">{m.pct}% تحقق</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-emerald-400"
                style={{ width: `${Math.min(100, m.pct)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
