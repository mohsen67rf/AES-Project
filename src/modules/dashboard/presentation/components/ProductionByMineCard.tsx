// src/modules/dashboard/presentation/components/ProductionByMineCard.tsx

import React from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';

export const ProductionByMineCard: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const mineShares = [
    { id: 'mineA', name: 'Mine A', nameFa: 'معدن چادرملو (A)', share: 40, color: '#00E5FF' },
    { id: 'mineB', name: 'Mine B', nameFa: 'معدن گل‌گهر (B)', share: 30, color: '#F59E0B' },
    { id: 'mineC', name: 'Mine C', nameFa: 'معدن سنگان (C)', share: 20, color: '#8B5CF6' },
    { id: 'mineD', name: 'Mine D', nameFa: 'معدن مرکزی (D)', share: 10, color: '#4F46E5' },
  ];

  // SVG Donut calculation
  const size = 160;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div 
      className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between h-[340px] ${
        isDark 
          ? 'bg-[#111726]/80 border-[#1E293B] text-white shadow-lg backdrop-blur-xl' 
          : 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black tracking-tight">
          {isRtl ? 'سهم تولید بر اساس معدن' : 'Production by Mine'}
        </h3>
      </div>

      <div className="flex items-center justify-between gap-4 flex-1">
        {/* Donut Chart Ring */}
        <div className="relative w-[150px] h-[150px] flex-shrink-0 flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {mineShares.map((item) => {
              const strokeDasharray = `${(item.share / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedOffset;
              accumulatedOffset += (item.share / 100) * circumference;

              return (
                <circle
                  key={item.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-90"
                />
              );
            })}
          </svg>

          {/* Center Hole Graphic */}
          <div 
            className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-inner ${
              isDark ? 'bg-[#090D16]' : 'bg-slate-50'
            }`}
          >
            <span className="text-[10px] text-slate-400 font-bold">100%</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex flex-col gap-2.5 flex-1 pr-2">
          {mineShares.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }} 
                />
                <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isRtl ? item.nameFa : item.name}
                </span>
              </div>
              <span className={`font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {item.share}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionByMineCard;
