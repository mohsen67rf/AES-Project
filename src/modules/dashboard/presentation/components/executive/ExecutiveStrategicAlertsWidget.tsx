// src/modules/dashboard/presentation/components/executive/ExecutiveStrategicAlertsWidget.tsx

import React from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  BellAlertIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldAlertIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface StrategicAlert {
  id: string;
  titleFa: string;
  descFa: string;
  level: 'CRITICAL' | 'WARNING' | 'OPPORTUNITY';
  actionFa: string;
  actionRoute?: string;
  time: string;
}

export const ExecutiveStrategicAlertsWidget: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const alerts: StrategicAlert[] = [
    {
      id: 'alt-1',
      titleFa: 'نیاز به بالانس فوری دپوی شماره ۴ (Blending)',
      descFa: 'عیار فسفر (P) در کانسنگ استخراجی پله ۱۸۰۸ شرقی به ۰.۰۵۸٪ رسیده است. ترکیب با دپوی مگنتیت کم‌فسفر پیشنهاد می‌شود.',
      level: 'WARNING',
      actionFa: 'تنظیم نسخه اختلاط دپو',
      time: '۲۵ دقیقه پیش'
    },
    {
      id: 'alt-2',
      titleFa: 'آزادسازی زودهنگام بلوک کانسنگ B-105 در پله ۱۸۰۸',
      descFa: 'با اتمام موفق باطله‌برداری دیواره شمالی، ۶۲,۰۰۰ تن کانسنگ مگنتیت آماده استخراج شاول شماره ۲ قرار گرفت.',
      level: 'OPPORTUNITY',
      actionFa: 'تخصیص ناوگان بارگیری',
      time: '۱ ساعت پیش'
    },
    {
      id: 'alt-3',
      titleFa: 'سرویس دوره‌ای شاول هیدرولیک شماره ۳',
      descFa: 'رسیدن به کارکرد ۲۵۰ ساعت، انجام PM برنامه‌ریزی‌شده در شیفت شب برای جلوگیری از توقف خط.',
      level: 'WARNING',
      actionFa: 'مشاهده دستورکار نت',
      time: '۲ ساعت پیش'
    }
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">
                {isRtl ? 'هوشمندسازی هشدارهای راهبردی و تصمیمات کارفرما' : 'Executive Strategic Intelligence & Alerts'}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                سیستم پایش هوشمند
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl ? 'شناسایی خودکار گلوگاه‌های تولید، فرصت‌های بهینه‌سازی و هشدارهای کنترل کیفیت' : 'Automated bottleneck detection & quality optimization alerts'}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
              alt.level === 'OPPORTUNITY'
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-amber-950/20 border-amber-500/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  alt.level === 'OPPORTUNITY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {alt.level === 'OPPORTUNITY' ? 'فرصت تولید' : 'اقدام راهبردی'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{alt.time}</span>
              </div>
              <h4 className="text-xs font-black text-white mb-1">{alt.titleFa}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{alt.descFa}</p>
            </div>

            <button className="w-full py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-bold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors border border-slate-700">
              <span>{alt.actionFa}</span>
              <ArrowRightIcon className="w-3 h-3 rotate-180" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
