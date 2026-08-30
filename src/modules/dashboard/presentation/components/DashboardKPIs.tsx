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
      titleFa: 'مجموع تولید',
      value: '12,650',
      unit: 'Ton',
      unitFa: 'تن',
      change: '↑ 12.3% vs last week',
      changeFa: '↑ ۱۲.۳٪ نسبت به هفته قبل',
      isPositive: true,
      icon: CubeTransparentIcon,
      gradient: 'from-blue-600/30 to-indigo-600/30 border-blue-500/30',
      iconColor: '#38BDF8',
    },
    {
      id: 'availability',
      title: 'Equipment Availability',
      titleFa: 'آمادگی تجهیزات',
      value: '87%',
      change: '↑ 5.3% vs last week',
      changeFa: '↑ ۵.۳٪ نسبت به هفته قبل',
      isPositive: true,
      icon: WrenchScrewdriverIcon,
      gradient: 'from-amber-600/30 to-orange-600/30 border-amber-500/30',
      iconColor: '#F59E0B',
    },
    {
      id: 'mines',
      title: 'Active Mines',
      titleFa: 'معادن فعال',
      value: '7',
      change: '↑ 2 vs last week',
      changeFa: '↑ ۲ نسبت به هفته قبل',
      isPositive: true,
      icon: BuildingOffice2Icon,
      gradient: 'from-teal-600/30 to-emerald-600/30 border-teal-500/30',
      iconColor: '#10B981',
    },
    {
      id: 'safety',
      title: 'Safety Index',
      titleFa: 'شاخص ایمنی (HSE)',
      value: '98%',
      change: '↑ 2.1% vs last week',
      changeFa: '↑ ۲.۱٪ نسبت به هفته قبل',
      isPositive: true,
      icon: ShieldCheckIcon,
      gradient: 'from-purple-600/30 to-violet-600/30 border-purple-500/30',
      iconColor: '#A855F7',
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      titleFa: 'درآمد تخمینی کل',
      value: '$ 4.26M',
      change: '↑ 15.7% vs last week',
      changeFa: '↑ ۱۵.۷٪ نسبت به هفته قبل',
      isPositive: true,
      icon: CurrencyDollarIcon,
      gradient: 'from-yellow-600/30 to-amber-600/30 border-yellow-500/30',
      iconColor: '#EAB308',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;
        return (
          <div
            key={kpi.id}
            className={`relative rounded-2xl p-4.5 border transition-all duration-300 group ${
              isDark
                ? 'bg-[#111726]/80 border-[#1E293B] hover:border-[#6366F1]/50 hover:shadow-lg hover:shadow-[#6366F1]/10 text-white backdrop-blur-xl'
                : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-md text-slate-900 shadow-sm'
            }`}
          >
            {/* Header: Icon Container + Title + Menu */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border bg-gradient-to-br ${kpi.gradient} transition-transform group-hover:scale-105`}
                >
                  <IconComponent className="w-5 h-5" style={{ color: kpi.iconColor }} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block leading-tight">
                    {isRtl ? kpi.titleFa : kpi.title}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black tracking-tight font-sans">
                      {kpi.value}
                    </span>
                    {kpi.unit && (
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {isRtl ? kpi.unitFa : kpi.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button className="text-slate-400 hover:text-slate-200 transition-colors p-1 -mr-1">
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-row: Trend / Delta */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/20 dark:border-slate-800/40 flex items-center gap-1.5 text-[11px] font-bold text-emerald-500">
              <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
              <span>{isRtl ? kpi.changeFa : kpi.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardKPIs;
