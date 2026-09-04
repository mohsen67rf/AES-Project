// src/modules/workspace/presentation/components/UnitKpiGrid.tsx

import React from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { UnitKPIItem } from '../../domain/workspace.types';
import { 
  TrendingUp, 
  Sparkles, 
  Gauge, 
  ShieldCheck, 
  Pickaxe, 
  HardHat, 
  Layers, 
  Compass, 
  Activity, 
  Truck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  FlaskConical, 
  Warehouse, 
  FileText, 
  Shield, 
  Archive,
  ArrowUpRight,
  Target
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  TrendingUp,
  Sparkles,
  Gauge,
  ShieldCheck,
  Pickaxe,
  HardHat,
  Layers,
  Compass,
  Activity,
  Truck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FlaskConical,
  Warehouse,
  FileText,
  Shield,
  ArchiveBox: Archive,
};

interface UnitKpiGridProps {
  kpis: UnitKPIItem[];
  quickStats: { labelFa: string; value: string; color: string }[];
}

export const UnitKpiGrid: React.FC<UnitKpiGridProps> = ({ kpis, quickStats }) => {
  const { isDark, theme } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const cyberAccents = [
    'border-cyan-400/50 bg-gradient-to-br from-[#00F0FF]/15 to-[#0077FE]/20 shadow-[0_0_20px_rgba(0,240,255,0.2)]',
    'border-amber-400/50 bg-gradient-to-br from-[#FFB703]/20 to-[#FB8500]/20 shadow-[0_0_20px_rgba(255,183,3,0.2)]',
    'border-pink-500/50 bg-gradient-to-br from-[#FF007F]/20 to-[#D946EF]/20 shadow-[0_0_20px_rgba(255,0,127,0.2)]',
    'border-emerald-400/50 bg-gradient-to-br from-[#06D6A0]/15 to-[#118AB2]/20 shadow-[0_0_20px_rgba(6,214,160,0.2)]',
  ];

  return (
    <div className="space-y-4">
      {/* Quick Stat Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickStats.map((stat, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
              theme === 'cyber'
                ? 'bg-[#080E24]/80 border-cyan-500/30'
                : isDark
                ? 'bg-slate-900/60 border-slate-800'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <span className="text-xs text-slate-400 font-bold">{stat.labelFa}</span>
            <span className={`text-sm font-black font-mono ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* 4 Specialized KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const IconComponent = ICON_MAP[kpi.iconName] || Sparkles;

          return (
            <div
              key={kpi.id}
              className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] ${
                theme === 'cyber'
                  ? `${cyberAccents[index % cyberAccents.length]} backdrop-blur-xl text-white`
                  : isDark
                  ? 'bg-[#111726]/80 border-[#1E293B] hover:border-indigo-500/50 text-white backdrop-blur-xl hover:shadow-lg'
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${
                      theme === 'cyber'
                        ? 'bg-[#080E24]/90 border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.4)] text-cyan-300'
                        : 'bg-slate-800/80 border-slate-700 text-indigo-400'
                    }`}
                    style={{ borderColor: theme !== 'cyber' ? `${kpi.accentColor}50` : undefined }}
                  >
                    <IconComponent 
                      className="w-5 h-5" 
                      style={{ color: theme === 'cyber' ? undefined : kpi.accentColor }} 
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block leading-tight">
                      {isRtl ? kpi.titleFa : kpi.titleEn}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                        {kpi.value}
                      </span>
                      {kpi.unitFa && (
                        <span className="text-[11px] text-slate-400 font-bold">
                          {isRtl ? kpi.unitFa : kpi.unitEn}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Target / Progress Bar */}
              {kpi.progressPercent !== undefined && (
                <div className="mt-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-indigo-400" />
                      <span>تارگت: {kpi.target}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-300">{kpi.progressPercent}٪</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, kpi.progressPercent)}%`,
                        backgroundColor: kpi.accentColor || '#6366F1'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Sub-row: Delta / Trend Note */}
              <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] font-bold ${
                theme === 'cyber' 
                  ? 'border-cyan-500/20 text-cyan-300' 
                  : 'border-slate-800/30 text-slate-400'
              }`}>
                <span className={kpi.isPositive ? 'text-emerald-400' : 'text-amber-400'}>
                  {kpi.changeFa}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
