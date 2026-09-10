// src/modules/dashboard/presentation/components/DashboardKPIs.tsx

import React from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { 
  ArrowTrendingUpIcon, 
  EllipsisVerticalIcon,
  WrenchScrewdriverIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/outline';

export interface KPIItem {
  id: string;
  title: string;
  titleFa: string;
  value: string;
  unit?: string;
  unitFa?: string;
  change: string;
  changeFa: string;
  isPositive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconColor: string;
}

export const DashboardKPIs: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const kpis: KPIItem[] = [
    {
      id: 'production',
      title: 'Total Production',
      titleFa: 'مجموع تولید استخراجی',
      value: '12,650',
      unit: 'Ton',
      unitFa: 'تن',
      change: '↑ 12.3%',
      changeFa: '↑ ۱۲.۳٪',
      isPositive: true,
      icon: CubeTransparentIcon,
      gradient: 'from-[#00D2FF]/20 to-[#0077FE]/10',
      iconColor: '#00D2FF',
    },
    {
      id: 'availability',
      title: 'Equipment Readiness',
      titleFa: 'آمادگی ناوگان معدن',
      value: '87%',
      change: '↑ 5.3%',
      changeFa: '↑ ۵.۳٪',
      isPositive: true,
      icon: WrenchScrewdriverIcon,
      gradient: 'from-[#FFB020]/20 to-[#F97316]/10',
      iconColor: '#FFB020',
    },
    {
      id: 'mines',
      title: 'Active Mine Pits',
      titleFa: 'پیت‌ها و جبهه‌کارهای فعال',
      value: '7',
      change: '↑ 2',
      changeFa: '↑ ۲ جبهه‌کار',
      isPositive: true,
      icon: BuildingOffice2Icon,
      gradient: 'from-[#38BDF8]/20 to-[#0284C7]/10',
      iconColor: '#38BDF8',
    },
    {
      id: 'safety',
      title: 'HSE Safety Index',
      titleFa: 'شاخص ایمنی و بهداشت',
      value: '98%',
      change: '↑ 2.1%',
      changeFa: '↑ ۲.۱٪',
      isPositive: true,
      icon: ShieldCheckIcon,
      gradient: 'from-[#22D3EE]/20 to-[#0D9488]/10',
      iconColor: '#22D3EE',
    },
    {
      id: 'revenue',
      title: 'Estimated Revenue',
      titleFa: 'ارزش تخمینی بار ارسالی',
      value: '$ 4.26M',
      change: '↑ 15.7%',
      changeFa: '↑ ۱۵.۷٪',
      isPositive: true,
      icon: CurrencyDollarIcon,
      gradient: 'from-[#FFB020]/20 to-[#D97706]/10',
      iconColor: '#FFB020',
    },
  ];

  // SVG sparkline path helper
  const sparklinePaths = [
    'M 0 25 Q 30 5, 60 20 T 120 10 T 180 15 T 220 5',
    'M 0 20 Q 35 30, 70 12 T 140 22 T 220 8',
    'M 0 28 Q 40 10, 80 25 T 150 15 T 220 6',
    'M 0 22 Q 45 28, 90 14 T 160 18 T 220 4',
    'M 0 26 Q 35 8, 75 22 T 145 10 T 220 5',
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, idx) => {
        const IconComponent = kpi.icon;
        const sparkPath = sparklinePaths[idx % sparklinePaths.length];
        const isGold = idx === 1 || idx === 4;
        const accentColor = isGold ? '#FFB020' : '#00D2FF';

        return (
          <div
            key={`dash-kpi-${kpi.id}-${idx}`}
            className={`relative rounded-[22px] p-4.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
              isDark
                ? 'bg-[#1A264F] text-[#F1F5F9] shadow-[0_12px_32px_rgba(7,11,26,0.5)] border border-[#24356B]/30 hover:border-[#00D2FF]/40'
                : 'bg-white text-slate-900 shadow-sm border border-slate-200 hover:shadow-md'
            }`}
          >
            {/* Header: Title + Icon */}
            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className={`text-[11px] font-bold block leading-tight ${isDark ? 'text-[#8E9EB8]' : 'text-slate-500'}`}>
                  {isRtl ? kpi.titleFa : kpi.title}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black tracking-tight font-sans text-white">
                    {kpi.value}
                  </span>
                  {kpi.unit && (
                    <span className={`text-[10px] font-bold ${isDark ? 'text-[#8E9EB8]' : 'text-slate-400'}`}>
                      {isRtl ? kpi.unitFa : kpi.unit}
                    </span>
                  )}
                </div>
              </div>

              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                  isDark
                    ? `bg-[#141F42] border-[#24356B]/50 text-[${accentColor}]`
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <IconComponent className="w-4 h-4" style={{ color: accentColor }} />
              </div>
            </div>

            {/* Sparkline Curve matching reference image */}
            <div className="w-full h-8 mt-2 relative z-0">
              <svg viewBox="0 0 220 35" className="w-full h-full overflow-visible">
                <path
                  d={sparkPath}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-500 group-hover:opacity-100 opacity-85"
                />
              </svg>
            </div>

            {/* Sub-row: Pill Trend / Delta */}
            <div className={`mt-1 pt-2 border-t flex items-center justify-between text-[10px] font-bold ${
              isDark ? 'border-[#24356B]/30' : 'border-slate-100'
            }`}>
              <span className={isDark ? 'text-[#8E9EB8]' : 'text-slate-500'}>
                {isRtl ? 'نسبت به هفته پیش' : 'vs last week'}
              </span>
              <span 
                className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold"
                style={{ 
                  backgroundColor: isGold ? 'rgba(255, 176, 32, 0.15)' : 'rgba(0, 210, 255, 0.15)',
                  color: accentColor 
                }}
              >
                {isRtl ? kpi.changeFa : kpi.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardKPIs;
