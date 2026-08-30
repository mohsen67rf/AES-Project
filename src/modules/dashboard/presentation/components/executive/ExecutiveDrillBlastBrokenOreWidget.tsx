// src/modules/dashboard/presentation/components/executive/ExecutiveDrillBlastBrokenOreWidget.tsx

import React from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  SparklesIcon, 
  FireIcon, 
  CircleStackIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const ExecutiveDrillBlastBrokenOreWidget: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const brokenOreBenches = [
    { bench: 'پله ۱۸۲۰ مرکزی (بلوک B-104)', tonnage: 48500, type: 'مگنتیت پرعیار', status: 'در حال بارگیری شاول ۱', color: '#10B981' },
    { bench: 'پله ۱۸۰۸ شرقی (بلوک B-105)', tonnage: 62000, type: 'مگنتیت متوسط عیار', status: 'آماده بارگیری شاول ۲', color: '#38BDF8' },
    { bench: 'پله ۱۷۹۶ غربی (بلوک B-106)', tonnage: 85000, type: 'اسکارن و کانسنگ مخلوط', status: 'آتشباری موفق دیروز', color: '#F59E0B' },
  ];

  const totalBrokenOre = brokenOreBenches.reduce((s, b) => s + b.tonnage, 0);
  const specificChargeKgTon = 0.38; // kg anfo/emulsion per ton rock
  const targetSpecificCharge = 0.40;
  const anfoStockKg = 42000;
  const drilledMetersToday = 1450; // meters

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <FireIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">
                {isRtl ? 'بیلان مواد ناریه، خرج ویژه و کانسنگ آماده بارگیری' : 'Drill & Blast & Broken Ore Inventory'}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {totalBrokenOre.toLocaleString()} تن سنگ خردشده
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl ? 'پایش خرج ویژه آتشباری، موجودی سنگ آماده شاول در پله‌ها و متراژ حفاری' : 'Specific charge, broken blasted ore inventory & drill meters'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold">
          <CheckCircleIcon className="w-4 h-4" />
          <span>بافر بارگیری پله‌ها: ۱۱.۸ روز</span>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'خرج ویژه واقعی' : 'Specific Charge'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-orange-400 font-mono">{specificChargeKgTon}</span>
            <span className="text-[10px] text-slate-400">kg/ton</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'مجموع سنگ آماده پله‌ها' : 'Broken Ore Stock'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-emerald-400 font-mono">{totalBrokenOre.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'تن' : 'Tons'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'حفاری روزانه دریل‌ها' : 'Drilled Meters'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-cyan-400 font-mono">{drilledMetersToday}</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'متر' : 'M'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'موجودی انبار آنفو/امولشن' : 'Explosive Stock'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-white font-mono">{anfoStockKg.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">kg</span>
          </div>
        </div>
      </div>

      {/* Broken Ore Benches List */}
      <div className="space-y-2">
        {brokenOreBenches.map((b, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/30 border border-slate-800/70 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
              <div>
                <span className="font-bold text-white text-[11px] block">{b.bench}</span>
                <span className="text-[10px] text-slate-400">{b.type} • <span className="text-slate-300 font-medium">{b.status}</span></span>
              </div>
            </div>

            <div className="font-mono text-[11px] font-bold text-white">
              {b.tonnage.toLocaleString()} <span className="text-[9px] text-slate-400 font-sans">تن آماده</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
