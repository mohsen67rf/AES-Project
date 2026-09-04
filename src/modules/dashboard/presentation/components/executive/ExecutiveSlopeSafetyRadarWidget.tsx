// src/modules/dashboard/presentation/components/executive/ExecutiveSlopeSafetyRadarWidget.tsx

import React from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  MapPinIcon,
  EyeIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

export const ExecutiveSlopeSafetyRadarWidget: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const monitoringSectors = [
    { nameFa: 'دیواره شمالی (پله‌های ۱۹۰۰-۱۸۲۰)', nameEn: 'North Wall (Sector A)', displacementMmDay: 0.4, status: 'STABLE', thresholdMmDay: 2.0, prismCount: 14 },
    { nameFa: 'دیواره شرقی مجاور گسل اصلی', nameEn: 'East Fault Zone (Sector B)', displacementMmDay: 1.1, status: 'WATCH', thresholdMmDay: 2.0, prismCount: 18 },
    { nameFa: 'دیواره غربی و رمپ اصلی حمل', nameEn: 'West Wall & Main Haul Ramp', displacementMmDay: 0.2, status: 'STABLE', thresholdMmDay: 1.5, prismCount: 12 },
    { nameFa: 'کف پیت و زهکشی آب', nameEn: 'Pit Floor & Sump Drainage', displacementMmDay: 0.1, status: 'STABLE', thresholdMmDay: 1.0, prismCount: 8 },
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">
                {isRtl ? 'پایداری دیواره پیت، ژئوتکنیک و ایمنی (HSE)' : 'Slope Stability & Mine Safety Radar'}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {isRtl ? 'وضعیت دیواره‌ها: پایدار' : 'Slopes: Stable'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold">
          <CheckBadgeIcon className="w-4 h-4" />
          <span>۳۴۸ روز بدون حادثه (LTI)</span>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'حداکثر جابجایی دیواره' : 'Max Displacement'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-emerald-400 font-mono">1.1</span>
            <span className="text-[10px] text-slate-400">mm/day</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'منشورهای فعال اپتیکی' : 'Active Prisms'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-cyan-400 font-mono">52 / 52</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'ایستگاه' : 'Units'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'دبی پمپاژ آب کف پیت' : 'Pit Dewatering'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-blue-400 font-mono">140</span>
            <span className="text-[10px] text-slate-400">m³/hr</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'شاخص ایمنی کارگاه' : 'Safety Score'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-emerald-400 font-mono">99.4%</span>
            <span className="text-[10px] text-slate-400">HSE Index</span>
          </div>
        </div>
      </div>

      {/* Geotechnical Sectors Status */}
      <div className="space-y-2">
        {monitoringSectors.map((sector, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/30 border border-slate-800/70 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span 
                className={`w-2.5 h-2.5 rounded-full ${
                  sector.status === 'STABLE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                }`} 
              />
              <div>
                <span className="font-bold text-white text-[11px] block">{isRtl ? sector.nameFa : sector.nameEn}</span>
                <span className="text-[10px] text-slate-400 font-mono">{sector.prismCount} تارگت منشور فعال لیزری</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-slate-300">
                نرخ جابجایی: <span className={`font-bold ${sector.status === 'STABLE' ? 'text-emerald-400' : 'text-amber-400'}`}>{sector.displacementMmDay} mm/day</span>
              </span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">حد مجاز {sector.thresholdMmDay}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
