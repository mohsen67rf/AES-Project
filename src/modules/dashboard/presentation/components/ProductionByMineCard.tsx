// src/modules/dashboard/presentation/components/ProductionByMineCard.tsx

import React from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';

export const ProductionByMineCard: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const mineShares = [
    { id: 'mineA', name: 'Mine A', nameFa: 'معدن چادرملو (A)', share: 42, color: '#00D2FF', glow: 'rgba(0, 210, 255, 0.4)' },
    { id: 'mineB', name: 'Mine B', nameFa: 'معدن گل‌گهر (B)', share: 28, color: '#FFB020', glow: 'rgba(255, 176, 32, 0.4)' },
    { id: 'mineC', name: 'Mine C', nameFa: 'معدن سنگان (C)', share: 18, color: '#38BDF8', glow: 'rgba(56, 189, 248, 0.3)' },
    { id: 'mineD', name: 'Mine D', nameFa: 'معدن مرکزی (D)', share: 12, color: '#6366F1', glow: 'rgba(99, 102, 241, 0.3)' },
  ];

  // SVG Donut calculation with rounded stroke caps
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div 
      className={`rounded-[22px] p-5.5 border transition-all duration-300 flex flex-col justify-between h-[350px] ${
        isDark 
          ? 'bg-[#1A264F] border-[#24356B]/30 text-[#F1F5F9] shadow-[0_12px_32px_rgba(7,11,26,0.5)]' 
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black tracking-tight text-[#F1F5F9]">
          {isRtl ? 'توزیع استخراج معادن' : 'Production by Mine'}
        </h3>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#141F42] text-[#8E9EB8] border border-[#24356B]/40">
          {isRtl ? '۴ معدن فعال' : '4 Mines'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 flex-1 my-1">
        {/* Donut Chart Ring with Glowing Track */}
        <div className="relative w-[150px] h-[150px] flex-shrink-0 flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {/* Background circular track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={isDark ? '#141F42' : '#E2E8F0'}
              strokeWidth={strokeWidth}
            />

            {mineShares.map((item, idx) => {
              const strokeDasharray = `${(item.share / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedOffset;
              accumulatedOffset += (item.share / 100) * circumference;

              return (
                <circle
                  key={`mine-circle-${item.id}-${idx}`}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 hover:opacity-95 cursor-pointer"
                  style={{ filter: isDark ? `drop-shadow(0 0 6px ${item.glow})` : undefined }}
                />
              );
            })}
          </svg>

          {/* Center Hole Graphic */}
          <div 
            className={`absolute w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-inner ${
              isDark ? 'bg-[#141F42]' : 'bg-slate-50'
            }`}
          >
            <span className="text-xl font-black font-sans text-white">42%</span>
            <span className={`text-[9px] font-bold ${isDark ? 'text-[#8E9EB8]' : 'text-slate-400'}`}>
              {isRtl ? 'سهم برتر' : 'Top Mine'}
            </span>
          </div>
        </div>

        {/* Horizontal Rounded Pill Bars List */}
        <div className="flex flex-col gap-2.5 flex-1 w-full">
          {mineShares.map((item, idx) => (
            <div key={`mine-bar-${item.id}-${idx}`} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={isDark ? 'text-[#F1F5F9]' : 'text-slate-700'}>
                  {isRtl ? item.nameFa : item.name}
                </span>
                <span className="font-mono text-white">
                  {item.share}%
                </span>
              </div>

              {/* Capsule progress bar with rounded-full */}
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#141F42]' : 'bg-slate-100'}`}>
                <div 
                  className="h-full rounded-full transition-all duration-700"
                  style={{ 
                    width: `${item.share}%`, 
                    backgroundColor: item.color,
                    boxShadow: isDark ? `0 0 8px ${item.glow}` : undefined,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionByMineCard;
