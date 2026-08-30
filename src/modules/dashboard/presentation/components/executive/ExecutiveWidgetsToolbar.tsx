// src/modules/dashboard/presentation/components/executive/ExecutiveWidgetsToolbar.tsx

import React from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  AdjustmentsHorizontalIcon, 
  SparklesIcon, 
  EyeIcon, 
  PrinterIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  FunnelIcon,
  RectangleGroupIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { PRESET_PROFILES, EXECUTIVE_WIDGETS_CONFIG } from './executiveWidgets.types';

interface ExecutiveWidgetsToolbarProps {
  visibleWidgets: Record<string, boolean>;
  onOpenCustomizer: () => void;
  onApplyPreset: (widgetIds: string[]) => void;
  activeTimeRange: string;
  onChangeTimeRange: (range: string) => void;
}

export const ExecutiveWidgetsToolbar: React.FC<ExecutiveWidgetsToolbarProps> = ({
  visibleWidgets,
  onOpenCustomizer,
  onApplyPreset,
  activeTimeRange,
  onChangeTimeRange
}) => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const activeCount = Object.values(visibleWidgets).filter(Boolean).length;
  const totalCount = EXECUTIVE_WIDGETS_CONFIG.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
        isDark 
          ? 'bg-[#0E1424]/90 border-[#1E293B] shadow-xl' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Left / Start Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#7C3AED] flex items-center justify-center text-white shadow-lg shadow-[#6366F1]/20 flex-shrink-0">
          <RectangleGroupIcon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black tracking-tight">
              {isRtl ? 'میز کار هوشمند و شاخص‌های کلیدی مدیر کارفرما' : 'Executive Management KPI Board'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-mono">
              {activeCount} / {totalCount} ویجت فعال
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isRtl ? 'امکان فعال/غیرفعال‌سازی اختصاصی ویجت‌ها بر اساس اولویت تصمیم‌گیری' : 'Customizable KPI widgets tailored for client manager decision-making'}
          </p>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
        {/* Preset Quick Dropdown or Pills */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          {PRESET_PROFILES.slice(0, 3).map((p) => {
            const isActive = p.widgetIds.every(id => visibleWidgets[id]) && 
              Object.keys(visibleWidgets).filter(k => visibleWidgets[k]).length === p.widgetIds.length;
            return (
              <button
                key={p.id}
                onClick={() => onApplyPreset(p.widgetIds)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? p.nameFa.split(' ')[0] + ' ' + p.nameFa.split(' ')[1] : p.nameEn.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Date Time Range Selector */}
        <div 
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${
            isDark 
              ? 'bg-[#111726] border-[#1F293D] text-slate-300' 
              : 'bg-white border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <CalendarDaysIcon className="w-4 h-4 text-indigo-400" />
          <select
            value={activeTimeRange}
            onChange={(e) => onChangeTimeRange(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-xs cursor-pointer"
          >
            <option value="today" className="bg-slate-900 text-white">{isRtl ? 'شیفت جاری و امروز' : 'Today / Active Shift'}</option>
            <option value="week" className="bg-slate-900 text-white">{isRtl ? 'هفته جاری (۱۴۰۵/۰۳/۰۱ - ۰۷)' : 'This Week'}</option>
            <option value="month" className="bg-slate-900 text-white">{isRtl ? 'ماه جاری (مرداد ۱۴۰۵)' : 'This Month'}</option>
            <option value="year" className="bg-slate-900 text-white">{isRtl ? 'تجمعی سال ۱۴۰۵ (LOM)' : 'Year-to-Date'}</option>
          </select>
        </div>

        {/* Print / Report button */}
        <button
          onClick={handlePrint}
          title={isRtl ? 'چاپ یا خروجی گزارش' : 'Print / Export'}
          className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
            isDark 
              ? 'bg-[#111726] border-[#1F293D] text-slate-400 hover:text-white' 
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-950 shadow-sm'
          }`}
        >
          <PrinterIcon className="w-4 h-4" />
        </button>

        {/* Main Customize Widgets Button */}
        <button
          onClick={onOpenCustomizer}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] shadow-lg shadow-[#6366F1]/30 transition-all active:scale-95 cursor-pointer"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4 stroke-[2.5]" />
          <span>{isRtl ? 'مدیریت و فیلتر ویجت‌ها (Show/Hide)' : 'Customize Widgets'}</span>
        </button>
      </div>
    </div>
  );
};
