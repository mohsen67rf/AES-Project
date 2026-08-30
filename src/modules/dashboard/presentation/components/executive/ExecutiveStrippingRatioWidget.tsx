// src/modules/dashboard/presentation/components/executive/ExecutiveStrippingRatioWidget.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  ArrowPathIcon, 
  ShieldExclamationIcon, 
  ChartBarSquareIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';

export const ExecutiveStrippingRatioWidget: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY'>('MONTHLY');

  // داده‌های روند نسبت باطله‌برداری دوره‌ای (تن باطله به تن کانسنگ W:O)
  const monthlyData = [
    { period: isRtl ? 'فروردین' : 'Apr', actualSR: 3.45, plannedSR: 3.80, lomTarget: 3.65, wasteTons: 1650000, oreTons: 478000 },
    { period: isRtl ? 'اردیبهشت' : 'May', actualSR: 3.72, plannedSR: 3.80, lomTarget: 3.65, wasteTons: 1840000, oreTons: 494000 },
    { period: isRtl ? 'خرداد' : 'Jun', actualSR: 3.61, plannedSR: 3.75, lomTarget: 3.65, wasteTons: 1810000, oreTons: 501000 },
    { period: isRtl ? 'تیر' : 'Jul', actualSR: 3.85, plannedSR: 3.75, lomTarget: 3.65, wasteTons: 1960000, oreTons: 509000 },
    { period: isRtl ? 'مرداد (جاری)' : 'Aug', actualSR: 3.60, plannedSR: 3.70, lomTarget: 3.65, wasteTons: 1790000, oreTons: 497000 },
  ];

  const currentActualSR = 3.60;
  const currentPlannedSR = 3.70;
  const lomEconomicSR = 3.65;
  const totalWasteYear = 9050000;
  const totalOreYear = 2479000;
  const cummulativeSR = (totalWasteYear / totalOreYear).toFixed(2);

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ArrowPathIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">
                {isRtl ? 'نسبت باطله‌برداری دوره‌ای (Stripping Ratio)' : 'Stripping Ratio (W:O Ratio)'}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                SR: {currentActualSR}:1 (W:O)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl ? 'پایش نسبت تناژ باطله به ماده معدنی و مقایسه با نسبت اقتصادی طرح نهایی پیت' : 'Waste to ore stripping ratio vs. LOM economic target'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <button
            onClick={() => setPeriod('MONTHLY')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              period === 'MONTHLY' ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isRtl ? 'ماه‌های اخیر' : 'Monthly'}
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'نسبت فعلی W:O' : 'Current SR'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-purple-400 font-mono">{currentActualSR} : 1</span>
            <span className="text-[10px] text-slate-400">ton/ton</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'نسبت هدف برنامه' : 'Planned SR'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-slate-300 font-mono">{currentPlannedSR} : 1</span>
            <span className="text-[10px] text-emerald-400/90 font-bold font-mono">(+2.7% پیشرو)</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'نسبت اقتصادی LOM' : 'Life of Mine SR'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-amber-400 font-mono">{lomEconomicSR} : 1</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'طرح نهایی' : 'LOM'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'نسبت تجمعی سال ۱۴۰۵' : 'Year-to-Date SR'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-cyan-400 font-mono">{cummulativeSR} : 1</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'مطلوب' : 'Optimal'}</span>
          </div>
        </div>
      </div>

      {/* Stripping Ratio Trend Chart */}
      <div className="w-full h-44 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="period" tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }} />
            <YAxis domain={[3.0, 4.2]} tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
                borderRadius: '12px',
                fontSize: '12px',
                color: isDark ? '#FFFFFF' : '#0F172A'
              }}
              formatter={(val: any) => [`${val} : 1`, '']}
            />
            <ReferenceLine y={3.65} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'LOM 3.65', fill: '#F59E0B', fontSize: 10 }} />
            <Line type="monotone" dataKey="plannedSR" stroke="#64748B" strokeWidth={2} dot={{ r: 3 }} name={isRtl ? 'برنامه مصوب' : 'Plan'} />
            <Line type="monotone" dataKey="actualSR" stroke="#A855F7" strokeWidth={3} dot={{ r: 4, fill: '#A855F7' }} name={isRtl ? 'عملکرد واقعی' : 'Actual'} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Strategic Insight for Client Manager */}
      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-start gap-2.5 text-xs">
        <CheckCircleIcon className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-purple-300 block">
            {isRtl ? 'تحلیل راهبردی کارفرما در خصوص باطله‌برداری:' : 'Client Manager Strategic Insight:'}
          </span>
          <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
            {isRtl 
              ? 'نسبت باطله‌برداری در محدوده اقتصادی مطلوب قرار دارد و پیشروی پله‌های باطله دیواره شمالی، دسترسی به کانسنگ پله‌های ۱۸۰۸ و ۱۷۹۶ را در ۶ ماهه دوم سال تضمین می‌کند.' 
              : 'Stripping ratio remains well within economic boundaries. Advance on North wall ensures steady ore exposure for lower benches in H2.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
