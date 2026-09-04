// src/modules/dashboard/presentation/components/executive/ExecutiveStockpileWidget.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  CircleStackIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface StockpileItem {
  id: string;
  nameFa: string;
  nameEn: string;
  type: 'HIGH_GRADE' | 'MEDIUM_GRADE' | 'LOW_GRADE' | 'BLENDING';
  currentTons: number;
  capacityTons: number;
  feGrade: number;
  feO: number;
  siO2: number;
  phosphorus: number;
  bufferDays: number;
  color: string;
  location: string;
}

export const ExecutiveStockpileWidget: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const [selectedStockpile, setSelectedStockpile] = useState<string>('all');
  const [filterType, setFilterType] = useState<'ALL' | 'ORE' | 'BLENDING'>('ALL');

  const stockpiles: StockpileItem[] = [
    {
      id: 'sp-hg-1',
      nameFa: 'دپوی شماره ۱ - مگنتیت پرعیار (High-Grade)',
      nameEn: 'Stockpile #1 - High Grade Magnetite (Fe > 60%)',
      type: 'HIGH_GRADE',
      currentTons: 142500,
      capacityTons: 180000,
      feGrade: 61.8,
      feO: 22.4,
      siO2: 4.8,
      phosphorus: 0.042,
      bufferDays: 14.2,
      color: '#10B981', // Emerald
      location: 'مجاور ورودی سنگ‌شکن ۱'
    },
    {
      id: 'sp-mg-2',
      nameFa: 'دپوی شماره ۲ - متوسط عیار (Medium-Grade)',
      nameEn: 'Stockpile #2 - Medium Grade (Fe 54-60%)',
      type: 'MEDIUM_GRADE',
      currentTons: 86400,
      capacityTons: 150000,
      feGrade: 56.4,
      feO: 18.1,
      siO2: 8.2,
      phosphorus: 0.058,
      bufferDays: 8.6,
      color: '#38BDF8', // Cyan
      location: 'پلتفرم شرقی پیت جنوبی'
    },
    {
      id: 'sp-lg-3',
      nameFa: 'دپوی شماره ۳ - کم‌عیار و اسکارن (Low-Grade)',
      nameEn: 'Stockpile #3 - Low Grade / Skarn (Fe 45-54%)',
      type: 'LOW_GRADE',
      currentTons: 198000,
      capacityTons: 300000,
      feGrade: 48.2,
      feO: 14.6,
      siO2: 14.1,
      phosphorus: 0.081,
      bufferDays: 19.8,
      color: '#F59E0B', // Amber
      location: 'دپوی استراتژیک غربی'
    },
    {
      id: 'sp-blend-4',
      nameFa: 'دپوی شماره ۴ - بالانس و همگن‌سازی (Blending Feed)',
      nameEn: 'Stockpile #4 - Blending Yard for Crusher Feed',
      type: 'BLENDING',
      currentTons: 62000,
      capacityTons: 90000,
      feGrade: 58.5,
      feO: 20.2,
      siO2: 6.9,
      phosphorus: 0.049,
      bufferDays: 6.2,
      color: '#8B5CF6', // Purple
      location: 'محوطه فیدر خوراک‌رسانی سنگ‌شکن'
    }
  ];

  const totalCurrentTons = stockpiles.reduce((sum, sp) => sum + sp.currentTons, 0);
  const totalCapacityTons = stockpiles.reduce((sum, sp) => sum + sp.capacityTons, 0);
  const totalFillPercentage = Math.round((totalCurrentTons / totalCapacityTons) * 100);
  
  // Weighted Average Grade
  const weightedFe = (stockpiles.reduce((sum, sp) => sum + sp.currentTons * sp.feGrade, 0) / totalCurrentTons).toFixed(1);
  const totalBufferDays = (totalCurrentTons / 10000).toFixed(1); // Assuming 10,000 ton/day plant consumption

  const filteredStockpiles = stockpiles.filter(sp => {
    if (filterType === 'ORE') return sp.type === 'HIGH_GRADE' || sp.type === 'MEDIUM_GRADE';
    if (filterType === 'BLENDING') return sp.type === 'BLENDING' || sp.type === 'LOW_GRADE';
    return true;
  });

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CircleStackIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">
                {isRtl ? 'موجودی و کیفیت دپوهای ماده معدنی' : 'Ore Stockpile Inventory & Blending'}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {isRtl ? 'بافر فعال: ۴۸.۸ روز' : 'Active Buffer: 48.8 Days'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              filterType === 'ALL' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isRtl ? 'همه دپوها' : 'All'}
          </button>
          <button
            onClick={() => setFilterType('ORE')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              filterType === 'ORE' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isRtl ? 'پرعیار / متوسط' : 'High/Medium'}
          </button>
          <button
            onClick={() => setFilterType('BLENDING')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              filterType === 'BLENDING' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isRtl ? 'بلندینگ / کم‌عیار' : 'Blending/Low'}
          </button>
        </div>
      </div>

      {/* Top Aggregated Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'مجموع موجودی دپوها' : 'Total Stockpile'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-white font-mono">{totalCurrentTons.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'تن' : 'Tons'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'میانگین وزنی عیار آهن' : 'Weighted Fe%'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-emerald-400 font-mono">{weightedFe}%</span>
            <span className="text-[10px] text-emerald-400/80 font-bold">Fe</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'ضریب اشغال کل دپوها' : 'Total Utilization'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-cyan-400 font-mono">{totalFillPercentage}%</span>
            <span className="text-[10px] text-slate-400">/ {totalCapacityTons.toLocaleString()} تن</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'تاب‌آوری خوراک کارخانه' : 'Feed Buffer'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-amber-400 font-mono">{totalBufferDays}</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'روز با دبی ۱۰k تن/روز' : 'Days'}</span>
          </div>
        </div>
      </div>

      {/* Stockpiles List & Detailed Cards */}
      <div className="space-y-3">
        {filteredStockpiles.map((sp) => {
          const fillPct = Math.round((sp.currentTons / sp.capacityTons) * 100);
          return (
            <div
              key={sp.id}
              onClick={() => setSelectedStockpile(sp.id)}
              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                selectedStockpile === sp.id
                  ? 'bg-slate-800/80 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/30 border-slate-800/70 hover:bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sp.color }} />
                  <span className="text-xs font-black text-white">{isRtl ? sp.nameFa : sp.nameEn}</span>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({sp.location})</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="font-bold text-white">
                    {sp.currentTons.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">تن</span>
                  </span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-400">{sp.capacityTons.toLocaleString()} تن</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${sp.color}20`, color: sp.color }}>
                    {fillPct}% پر
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2.5">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${fillPct}%`,
                    backgroundColor: sp.color
                  }}
                />
              </div>

              {/* Ore Chemical Assay Details */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/40">
                  <span className="text-slate-400">عیار آهن (Fe):</span>
                  <span className="font-mono font-bold text-emerald-400">{sp.feGrade}%</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/40">
                  <span className="text-slate-400">اکسید آهن (FeO):</span>
                  <span className="font-mono font-bold text-cyan-400">{sp.feO}%</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/40">
                  <span className="text-slate-400">سیلیس (SiO2):</span>
                  <span className="font-mono font-bold text-amber-400">{sp.siO2}%</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/40">
                  <span className="text-slate-400">فسفر (P):</span>
                  <span className="font-mono font-bold text-rose-400">{sp.phosphorus}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Recommendation for Executive Manager */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <CheckBadgeIcon className="w-4 h-4" />
          <span>{isRtl ? 'کیفیت خوراک در وضعیت پایدار با میانگین عیار ۵۸.۵٪ Fe' : 'Feed quality stable at 58.5% Fe'}</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">{isRtl ? 'بروزرسانی باسکول: ۱۰ دقیقه پیش' : 'Updated 10m ago'}</span>
      </div>
    </div>
  );
};
