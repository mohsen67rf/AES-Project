// src/modules/dashboard/presentation/components/executive/ExecutiveExtractionByRockTypeWidget.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  BuildingLibraryIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  FunnelIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  Legend 
} from 'recharts';

interface LithologyExtraction {
  id: string;
  nameFa: string;
  nameEn: string;
  actualTons: number;
  plannedTons: number;
  feGrade: number;
  color: string;
  sharePct: number;
  category: 'ORE' | 'WASTE';
  benches: string;
}

export const ExecutiveExtractionByRockTypeWidget: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  const lithologyData: LithologyExtraction[] = [
    {
      id: 'mag_high',
      nameFa: 'مگنتیت توده‌ای پرعیار (Massive Ore)',
      nameEn: 'Massive High-Grade Magnetite',
      actualTons: 8450,
      plannedTons: 8000,
      feGrade: 62.4,
      color: '#10B981', // Emerald
      sharePct: 38,
      category: 'ORE',
      benches: 'پله ۱۸۲۰ و ۱۸۰۸'
    },
    {
      id: 'mag_dissem',
      nameFa: 'مگنتیت دانه‌ای و هماتیت (Disseminated Ore)',
      nameEn: 'Disseminated Magnetite & Hematite',
      actualTons: 5200,
      plannedTons: 5500,
      feGrade: 55.8,
      color: '#38BDF8', // Cyan
      sharePct: 23,
      category: 'ORE',
      benches: 'پله ۱۷۹۶'
    },
    {
      id: 'skarn_calc',
      nameFa: 'کالک‌سیلیکات و اسکارن کانسار (Skarn Ore)',
      nameEn: 'Calc-Silicate & Skarn Ore',
      actualTons: 2900,
      plannedTons: 3000,
      feGrade: 47.9,
      color: '#F59E0B', // Amber
      sharePct: 13,
      category: 'ORE',
      benches: 'پله ۱۸۰۸ شرقی'
    },
    {
      id: 'waste_schist',
      nameFa: 'باطله سخت - شیست و هورنفلس (Hard Waste)',
      nameEn: 'Hard Waste (Schist & Hornfels)',
      actualTons: 38200,
      plannedTons: 36000,
      feGrade: 11.2,
      color: '#A855F7', // Purple
      sharePct: 62,
      category: 'WASTE',
      benches: 'دیواره شمالی پیت'
    },
    {
      id: 'waste_alluvium',
      nameFa: 'باطله نرم و روباره هوازده (Alluvial Overburden)',
      nameEn: 'Soft Waste & Alluvium Overburden',
      actualTons: 21500,
      plannedTons: 24000,
      feGrade: 6.5,
      color: '#64748B', // Slate
      sharePct: 38,
      category: 'WASTE',
      benches: 'پله‌های فوقانی ۱۹۲۰-۱۹۴۰'
    }
  ];

  const totalOreActual = lithologyData.filter(d => d.category === 'ORE').reduce((s, d) => s + d.actualTons, 0);
  const totalOrePlanned = lithologyData.filter(d => d.category === 'ORE').reduce((s, d) => s + d.plannedTons, 0);
  const oreVariancePct = (((totalOreActual - totalOrePlanned) / totalOrePlanned) * 100).toFixed(1);

  const totalWasteActual = lithologyData.filter(d => d.category === 'WASTE').reduce((s, d) => s + d.actualTons, 0);
  const totalWastePlanned = lithologyData.filter(d => d.category === 'WASTE').reduce((s, d) => s + d.plannedTons, 0);

  const chartData = [
    { name: isRtl ? 'مگنتیت توده‌ای' : 'Massive Mag', واقعی: 8450, برنامه: 8000, color: '#10B981' },
    { name: isRtl ? 'هماتیت/دانه‌ای' : 'Hematite/Diss', واقعی: 5200, برنامه: 5500, color: '#38BDF8' },
    { name: isRtl ? 'اسکارن معدنی' : 'Skarn Ore', واقعی: 2900, برنامه: 3000, color: '#F59E0B' },
    { name: isRtl ? 'باطله سخت' : 'Hard Waste', واقعی: 38200, برنامه: 36000, color: '#A855F7' },
    { name: isRtl ? 'روباره نرم' : 'Alluvium', واقعی: 21500, برنامه: 24000, color: '#64748B' },
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CubeTransparentIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">
                {isRtl ? 'میزان استخراج به تفکیک جنس سنگ و لیتولوژی' : 'Extraction by Rock Type & Lithology'}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {isRtl ? 'کانسنگ: ۱۶,۵۵۰ تن/روز' : 'Ore: 16,550 T/D'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl ? 'تفکیک تناژ استخراجی بر اساس جنس سنگ، عیار متوسط و مقایسه با برنامه مصوب' : 'Tonnage by rock lithology, grade & plan vs. actual'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('DAILY')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              viewMode === 'DAILY' ? 'bg-blue-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isRtl ? 'شیفت ۲۴ ساعته' : '24h Shift'}
          </button>
          <button
            onClick={() => setViewMode('WEEKLY')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              viewMode === 'WEEKLY' ? 'bg-blue-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isRtl ? 'هفتگی تجمیعی' : 'Cumulative'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'استخراج کانسنگ آهن (واقعی)' : 'Total Ore Mined'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-emerald-400 font-mono">{totalOreActual.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'تن' : 'Tons'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'انحراف از برنامه کانسنگ' : 'Ore Plan Variance'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-lg font-black font-mono ${Number(oreVariancePct) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {Number(oreVariancePct) >= 0 ? `+${oreVariancePct}%` : `${oreVariancePct}%`}
            </span>
            <span className="text-[10px] text-slate-400">({(totalOreActual - totalOrePlanned > 0 ? '+' : '') + (totalOreActual - totalOrePlanned).toLocaleString()} تن)</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'باطله‌برداری روزانه' : 'Waste Extracted'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-purple-400 font-mono">{totalWasteActual.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'تن' : 'Tons'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'مجموع جابجایی کل مواد' : 'Total Material Mined'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-white font-mono">{(totalOreActual + totalWasteActual).toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'تن/روز' : 'T/Day'}</span>
          </div>
        </div>
      </div>

      {/* Bar Chart comparing Plan vs. Actual by Rock Type */}
      <div className="w-full h-44 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }} />
            <YAxis tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
                borderRadius: '12px',
                fontSize: '12px',
                color: isDark ? '#FFFFFF' : '#0F172A'
              }}
              formatter={(val: any) => [`${Number(val).toLocaleString()} تن`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="برنامه" fill="#475569" radius={[4, 4, 0, 0]} name={isRtl ? 'برنامه مصوب' : 'Planned'} />
            <Bar dataKey="واقعی" fill="#38BDF8" radius={[4, 4, 0, 0]} name={isRtl ? 'عملکرد واقعی' : 'Actual'}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lithology Breakdown Table */}
      <div className="space-y-1.5">
        {lithologyData.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/30 border border-slate-800/60 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-bold text-white text-[11px]">{isRtl ? item.nameFa : item.nameEn}</span>
              <span className="text-[10px] text-slate-500 font-mono">({item.benches})</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-slate-300">
                {item.actualTons.toLocaleString()} <span className="text-[9px] text-slate-500 font-sans">تن</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                {item.feGrade}% Fe
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
