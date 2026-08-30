// src/modules/dashboard/presentation/components/executive/ExecutiveFleetOEEWidget.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  TruckIcon, 
  WrenchScrewdriverIcon, 
  ClockIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface FleetCategory {
  nameFa: string;
  nameEn: string;
  activeCount: number;
  totalCount: number;
  availability: number;
  utilization: number;
  oee: number;
  avgCycleMins?: number;
  iconColor: string;
}

export const ExecutiveFleetOEEWidget: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const fleetData: FleetCategory[] = [
    {
      nameFa: 'دامپ‌تراک‌های ۱۰۰ و ۱۳۰ تن',
      nameEn: 'Rigid Haul Trucks (100-130T)',
      activeCount: 18,
      totalCount: 20,
      availability: 90.0,
      utilization: 84.5,
      oee: 76.1,
      avgCycleMins: 22.4,
      iconColor: '#F59E0B' // Amber
    },
    {
      nameFa: 'شاول‌های کابلی و هیدرولیک',
      nameEn: 'Hydraulic & Rope Shovels',
      activeCount: 4,
      totalCount: 4,
      availability: 94.2,
      utilization: 88.0,
      oee: 82.9,
      avgCycleMins: 1.8,
      iconColor: '#38BDF8' // Cyan
    },
    {
      nameFa: 'لودرهای سنگین معدنی (WA900/CAT)',
      nameEn: 'Heavy Wheel Loaders',
      activeCount: 5,
      totalCount: 6,
      availability: 83.3,
      utilization: 79.0,
      oee: 65.8,
      avgCycleMins: 2.2,
      iconColor: '#10B981' // Emerald
    },
    {
      nameFa: 'دستگاه‌های دریل واگن و حفاری روتاری',
      nameEn: 'Rotary Blast-Hole Drills',
      activeCount: 3,
      totalCount: 3,
      availability: 96.0,
      utilization: 91.5,
      oee: 87.8,
      iconColor: '#A855F7' // Purple
    }
  ];

  const overallFleetAvailability = 90.8;
  const overallOEE = 78.4;
  const totalHaulsToday = 412;
  const dieselPerTon = 0.68; // Liter per ton moved

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <TruckIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">
                {isRtl ? 'راندمان، بهره‌وری و زمان چرخه ناوگان' : 'Fleet OEE, Availability & Haul Cycles'}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                OEE: {overallOEE}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl ? 'نرخ آمادگی مکانیکی، زمان رفت و برگشت بارگیری و مصرف سوخت' : 'Mechanical availability, cycle time & diesel consumption'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/30 border border-amber-500/30 px-3 py-1 rounded-xl font-bold">
          <BoltIcon className="w-4 h-4" />
          <span>۳۰ دستگاه فعال در شیفت</span>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'آمادگی کل ناوگان' : 'Availability'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-emerald-400 font-mono">{overallFleetAvailability}%</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'آماده‌به‌کار' : 'Avail'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'تعداد سرویس باربری امروز' : 'Haul Loads'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-amber-400 font-mono">{totalHaulsToday}</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'سرویس' : 'Loads'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'متوسط چرخه دامپ‌تراک' : 'Avg Haul Cycle'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-cyan-400 font-mono">22.4</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'دقیقه (پیت-دپو)' : 'Mins'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'شاخص مصرف گازوئیل' : 'Fuel Rate'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-rose-400 font-mono">{dieselPerTon}</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'لیتر/تن جابجایی' : 'L/Ton'}</span>
          </div>
        </div>
      </div>

      {/* Fleet Breakdown Rows */}
      <div className="space-y-2.5">
        {fleetData.map((f, i) => (
          <div
            key={i}
            className="p-3 rounded-xl bg-slate-900/30 border border-slate-800/70 flex flex-col gap-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.iconColor }} />
                <span className="font-bold text-white text-[11px]">{isRtl ? f.nameFa : f.nameEn}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({f.activeCount} از {f.totalCount} دستگاه فعال)
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-slate-300">
                  آمادگی: <span className="font-bold text-emerald-400">{f.availability}%</span>
                </span>
                <span className="text-slate-300">
                  بهره‌وری: <span className="font-bold text-cyan-400">{f.utilization}%</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                  OEE {f.oee}%
                </span>
              </div>
            </div>

            {/* Availability bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${f.availability}%`, backgroundColor: f.iconColor }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
