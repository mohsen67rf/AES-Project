// src/modules/dashboard/presentation/components/executive/ExecutiveShiftWorkforceWidget.tsx

import React from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  UsersIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const ExecutiveShiftWorkforceWidget: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const shifts = [
    { nameFa: 'شیفت صبح (A) - ۰۷:۰۰ الی ۱۵:۰۰', activeStaff: 124, oreTons: 7200, wasteTons: 26000, efficiency: 96 },
    { nameFa: 'شیفت عصر (B) - ۱۵:۰۰ الی ۲۳:۰۰', activeStaff: 118, oreTons: 6400, wasteTons: 22500, efficiency: 92 },
    { nameFa: 'شیفت شب (C) - ۲۳:۰۰ الی ۰۷:۰۰', activeStaff: 86, oreTons: 2950, wasteTons: 11200, efficiency: 88 },
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <UserGroupIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">
                {isRtl ? 'بهره‌وری نیروی انسانی و عملکرد شیفت‌ها' : 'Workforce Productivity & Shifts'}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ۳۲۸ پرسنل حاضر
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shifts Breakdown */}
      <div className="space-y-2">
        {shifts.map((s, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-900/30 border border-slate-800/70 flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px]">{s.nameFa}</span>
              <span className="font-mono text-emerald-400 font-bold text-[11px]">{s.efficiency}% راندمان</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
              <span>{s.activeStaff} پرسنل شیفت</span>
              <span>استخراج: {s.oreTons.toLocaleString()} تن کانسنگ | باطله: {s.wasteTons.toLocaleString()} تن</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
