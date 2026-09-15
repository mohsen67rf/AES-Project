// src/modules/tally/presentation/components/BlockProgressVisualizer.tsx

import React from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { CubeIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { BlockCodeDisplay } from '../../../../shared/components/BlockCodeDisplay';

interface BlockProgressVisualizerProps {
  progressPercent: number;
  totalVolumeM3: number;
  hauledVolumeM3: number;
  remainingVolumeM3: number;
  totalTonnage: number;
  hauledTonnage: number;
  remainingTonnage: number;
  blockCode: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'circle' | 'bar' | 'both';
  title?: string;
  subtitle?: string;
  className?: string;
}

export const BlockProgressVisualizer: React.FC<BlockProgressVisualizerProps> = ({
  progressPercent,
  totalVolumeM3,
  hauledVolumeM3,
  remainingVolumeM3,
  totalTonnage,
  hauledTonnage,
  remainingTonnage,
  blockCode,
  size = 'md',
  variant = 'both',
  title,
  subtitle,
  className = '',
}) => {
  const { isDark } = useTheme();
  const clampedPercent = Math.min(100, Math.max(0, Math.round(progressPercent)));

  // رنگ دینامیک بر اساس درصد پیشرفت
  const getColorScheme = (pct: number) => {
    if (pct >= 90) return { stroke: '#10B981', gradient: 'from-emerald-500 to-teal-400', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    if (pct >= 50) return { stroke: '#00D2FF', gradient: 'from-cyan-400 to-sky-500', text: 'text-[#00D2FF]', badge: 'bg-cyan-500/15 text-[#00D2FF] border-cyan-500/30' };
    if (pct >= 20) return { stroke: '#F59E0B', gradient: 'from-amber-400 to-orange-500', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    return { stroke: '#8B5CF6', gradient: 'from-purple-500 to-indigo-500', text: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
  };

  const scheme = getColorScheme(clampedPercent);

  // تنظیم ابعاد دایره
  const circleDimensions = {
    sm: { size: 84, strokeWidth: 7, radius: 34, fontSize: 'text-sm' },
    md: { size: 120, strokeWidth: 9, radius: 48, fontSize: 'text-xl' },
    lg: { size: 160, strokeWidth: 12, radius: 64, fontSize: 'text-3xl' },
  }[size];

  const circumference = 2 * Math.PI * circleDimensions.radius;
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  const renderCircle = () => (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={circleDimensions.size}
        height={circleDimensions.size}
        className="transform -rotate-90 drop-shadow-md"
      >
        {/* Track */}
        <circle
          cx={circleDimensions.size / 2}
          cy={circleDimensions.size / 2}
          r={circleDimensions.radius}
          stroke={isDark ? '#1E293B' : '#E2E8F0'}
          strokeWidth={circleDimensions.strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Arc */}
        <circle
          cx={circleDimensions.size / 2}
          cy={circleDimensions.size / 2}
          r={circleDimensions.radius}
          stroke={scheme.stroke}
          strokeWidth={circleDimensions.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-mono font-black ${circleDimensions.fontSize} ${scheme.text}`}>
          {clampedPercent}٪
        </span>
        <span className="text-[9px] text-slate-400 font-bold -mt-0.5">
          پیشرفت استخراج
        </span>
      </div>
    </div>
  );

  const renderBar = () => (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-bold flex items-center gap-1">
          <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>نوار پیشرفت تخلیه بلوک:</span>
        </span>
        <span className={`font-mono font-black ${scheme.text}`}>
          {clampedPercent}٪ تکمیل‌شده
        </span>
      </div>

      <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'
      }`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${scheme.gradient} transition-all duration-700 shadow-sm`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>برداشت: {hauledVolumeM3.toLocaleString('fa-IR')} m³ ({hauledTonnage.toLocaleString('fa-IR')} تن)</span>
        <span>باقی‌مانده: {remainingVolumeM3.toLocaleString('fa-IR')} m³</span>
      </div>
    </div>
  );

  return (
    <div className={`rounded-2xl border p-4 transition-all duration-200 ${
      isDark ? 'bg-[#0E172A]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
    } ${className}`}>
      {/* Header if title passed */}
      {(title || blockCode) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${scheme.badge}`}>
              <CubeIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                {title ? (
                  <span>{title}</span>
                ) : (
                  <BlockCodeDisplay code={blockCode} prefix="بلوک" className="text-slate-200 font-bold" />
                )}
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${scheme.badge}`}>
                  {clampedPercent >= 100 ? 'تخلیه کامل' : clampedPercent > 0 ? 'در حال بارگیری' : 'شروع‌نشده'}
                </span>
              </h4>
              {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
            </div>
          </div>

          <div className="text-left font-mono">
            <span className="text-[11px] font-bold text-slate-300 block">
              حجم کل: {totalVolumeM3.toLocaleString('fa-IR')} m³
            </span>
            <span className="text-[10px] text-slate-400">
              {totalTonnage.toLocaleString('fa-IR')} تن برآوردی
            </span>
          </div>
        </div>
      )}

      {/* Content depending on variant */}
      {variant === 'circle' && (
        <div className="flex flex-col items-center py-2">
          {renderCircle()}
          <div className="mt-3 grid grid-cols-2 gap-2 w-full text-center text-xs">
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[9px] text-slate-400 block">حجم باقی‌مانده</span>
              <span className="font-mono font-black text-amber-400">{remainingVolumeM3.toLocaleString('fa-IR')} m³</span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[9px] text-slate-400 block">تناژ باقی‌مانده</span>
              <span className="font-mono font-black text-emerald-400">{remainingTonnage.toLocaleString('fa-IR')} تن</span>
            </div>
          </div>
        </div>
      )}

      {variant === 'bar' && renderBar()}

      {variant === 'both' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              {renderCircle()}
            </div>
            <div className="flex-1 w-full space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9px] text-slate-400 block">تناژ کسر شده (سرویس‌ها)</span>
                  <span className={`font-mono font-black ${scheme.text}`}>{hauledTonnage.toLocaleString('fa-IR')} تن</span>
                  <span className="text-[9px] text-slate-500 font-mono block">({hauledVolumeM3.toLocaleString('fa-IR')} m³)</span>
                </div>
                <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9px] text-slate-400 block">تناژ باقی‌مانده در جبهه‌کار</span>
                  <span className="font-mono font-black text-amber-400">{remainingTonnage.toLocaleString('fa-IR')} تن</span>
                  <span className="text-[9px] text-slate-500 font-mono block">({remainingVolumeM3.toLocaleString('fa-IR')} m³)</span>
                </div>
              </div>
              {renderBar()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
