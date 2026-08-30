// src/modules/dashboard/presentation/components/executive/ExecutiveCostRevenueWidget.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  CurrencyDollarIcon, 
  BanknotesIcon, 
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ScaleIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

export const ExecutiveCostRevenueWidget: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const costBreakdown = [
    { name: isRtl ? 'حفاری و مواد ناریه' : 'Drill & Blast', value: 24, costPerTon: '$ 1.95', color: '#00D4FF' },
    { name: isRtl ? 'بارگیری (شاول و لودر)' : 'Loading', value: 21, costPerTon: '$ 1.70', color: '#10B981' },
    { name: isRtl ? 'باربری و انتقال به دپو/باطله‌گاه' : 'Hauling', value: 36, costPerTon: '$ 2.92', color: '#F59E0B' },
    { name: isRtl ? 'سنگ‌شکن و دانه‌بندی' : 'Crushing', value: 12, costPerTon: '$ 0.98', color: '#A855F7' },
    { name: isRtl ? 'سربار و پایش فنی' : 'Overhead/Technical', value: 7, costPerTon: '$ 0.57', color: '#EC4899' },
  ];

  const totalCostPerTonOre = 8.12; // $/ton ore
  const plannedBudgetCost = 8.60;
  const costSavingsPct = (((plannedBudgetCost - totalCostPerTonOre) / plannedBudgetCost) * 100).toFixed(1);
  
  const estimatedRevenueMonth = 14.85; // Million $
  const estimatedEbitdaMargin = 42.6; // %

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CurrencyDollarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">
                {isRtl ? 'بهای تمام‌شده هر تن استخراج و شاخص‌های مالی' : 'Unit Mining Cost (OPEX) & Revenue'}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ${totalCostPerTonOre} / Ton Ore
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl ? 'تحلیل بهای تمام‌شده بر تن کانسنگ، تفکیک هزینه‌های فرآیندی و حاشیه سود' : 'Unit OPEX per ton ore, process cost breakdown & EBITDA'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold">
          <ArrowTrendingDownIcon className="w-4 h-4" />
          <span>{costSavingsPct}% صرفه‌جویی نسبت به بودجه</span>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'بهای تمام‌شده هر تن' : 'OPEX / Ton Ore'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-emerald-400 font-mono">${totalCostPerTonOre}</span>
            <span className="text-[10px] text-slate-400">/ ton</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'بهای باطله‌برداری' : 'Waste Cost'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-purple-400 font-mono">$1.84</span>
            <span className="text-[10px] text-slate-400">/ m³</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'درآمد تخمینی ماه' : 'Est. Revenue'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-amber-400 font-mono">${estimatedRevenueMonth}M</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'ماهانه' : 'M$'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'حاشیه سود ناخالص' : 'EBITDA Margin'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-cyan-400 font-mono">{estimatedEbitdaMargin}%</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'عملیاتی' : 'Margin'}</span>
          </div>
        </div>
      </div>

      {/* Cost Distribution Chart and Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-4 h-36 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderColor: isDark ? '#1E293B' : '#E2E8F0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: isDark ? '#FFFFFF' : '#0F172A'
                }}
                formatter={(val: any) => [`${val}%`, 'سهم از هزینه']}
              />
              <Pie
                data={costBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={52}
                paddingAngle={4}
                dataKey="value"
              >
                {costBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-8 space-y-1.5">
          {costBreakdown.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/30 border border-slate-800/60 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-bold text-white text-[11px]">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-slate-400">{item.costPerTon} / تن</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  {item.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
