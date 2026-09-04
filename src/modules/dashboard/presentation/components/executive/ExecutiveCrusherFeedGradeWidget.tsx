// src/modules/dashboard/presentation/components/executive/ExecutiveCrusherFeedGradeWidget.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  SparklesIcon, 
  CheckBadgeIcon, 
  ExclamationCircleIcon,
  BeakerIcon,
  AdjustmentsVerticalIcon
} from '@heroicons/react/24/outline';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

export const ExecutiveCrusherFeedGradeWidget: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const hourlyFeedData = [
    { time: '08:00', actualFe: 58.4, targetFe: 57.5, plantRecovery: 86.2, pImpurity: 0.045 },
    { time: '10:00', actualFe: 59.1, targetFe: 57.5, plantRecovery: 87.4, pImpurity: 0.042 },
    { time: '12:00', actualFe: 57.8, targetFe: 57.5, plantRecovery: 85.9, pImpurity: 0.051 },
    { time: '14:00', actualFe: 58.9, targetFe: 57.5, plantRecovery: 86.8, pImpurity: 0.048 },
    { time: '16:00', actualFe: 59.5, targetFe: 57.5, plantRecovery: 88.1, pImpurity: 0.039 },
    { time: '18:00', actualFe: 58.2, targetFe: 57.5, plantRecovery: 86.4, pImpurity: 0.046 },
    { time: '20:00', actualFe: 58.7, targetFe: 57.5, plantRecovery: 87.0, pImpurity: 0.044 },
  ];

  const currentFeGrade = 58.7;
  const targetFeGrade = 57.5;
  const averageRecovery = 86.8;
  const currentCrusherThroughput = 980; // Ton/hr

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BeakerIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight">
                {isRtl ? 'عیار خوراک ورودی سنگ‌شکن و ریکاوری' : 'Crusher Feed Grade & Plant Recovery'}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {isRtl ? 'عیار آهن: ۵۸.۷٪ Fe' : '58.7% Fe Feed'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold">
          <CheckBadgeIcon className="w-4 h-4" />
          <span>+۱.۲٪ بالاتر از تارگت</span>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'عیار لحظه‌ای سنگ‌شکن' : 'Current Fe%'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-cyan-400 font-mono">{currentFeGrade}%</span>
            <span className="text-[10px] text-slate-400">Fe</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'عیار هدف قرارداد' : 'Target Fe%'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-slate-300 font-mono">{targetFeGrade}%</span>
            <span className="text-[10px] text-emerald-400 font-mono">(تضمین شده)</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'بازیابی متالورژی (Recovery)' : 'Recovery %'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-emerald-400 font-mono">{averageRecovery}%</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'راندمان' : 'Eff'}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 font-bold block">{isRtl ? 'دبی خوراک‌دهی' : 'Throughput'}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-white font-mono">{currentCrusherThroughput}</span>
            <span className="text-[10px] text-slate-400">{isRtl ? 'تن/ساعت' : 'T/H'}</span>
          </div>
        </div>
      </div>

      {/* Hourly Feed Grade Chart */}
      <div className="w-full h-40 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyFeedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanFeedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }} />
            <YAxis domain={[55, 62]} tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
                borderRadius: '12px',
                fontSize: '12px',
                color: isDark ? '#FFFFFF' : '#0F172A'
              }}
              formatter={(val: any) => [`${val}% Fe`, 'عیار']}
            />
            <ReferenceLine y={57.5} stroke="#EAB308" strokeDasharray="3 3" label={{ value: 'Target 57.5%', fill: '#EAB308', fontSize: 10 }} />
            <Area type="monotone" dataKey="actualFe" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#cyanFeedGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Penalty Elements Status Bar */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px]">
        <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/40">
          <span className="text-slate-400">فسفر (P):</span>
          <span className="font-mono font-bold text-emerald-400">0.044% <span className="text-[9px] text-slate-500">(سقف 0.06%)</span></span>
        </div>
        <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/40">
          <span className="text-slate-400">گوگرد (S):</span>
          <span className="font-mono font-bold text-emerald-400">0.038% <span className="text-[9px] text-slate-500">(سقف 0.05%)</span></span>
        </div>
        <div className="flex items-center justify-between px-2 py-1 rounded bg-slate-950/40">
          <span className="text-slate-400">سیلیس (SiO2):</span>
          <span className="font-mono font-bold text-cyan-400">6.4% <span className="text-[9px] text-slate-500">(نرمال)</span></span>
        </div>
      </div>
    </div>
  );
};
