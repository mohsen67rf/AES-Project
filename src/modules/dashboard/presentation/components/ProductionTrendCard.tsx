// src/modules/dashboard/presentation/components/ProductionTrendCard.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export const ProductionTrendCard: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isRtl = language === 'fa';

  const dataPoints = [
    { day: 'Mon', dayFa: 'دوشنبه', actual: 4200, target: 5000 },
    { day: 'Tue', dayFa: 'سه‌شنبه', actual: 7500, target: 6800 },
    { day: 'Wed', dayFa: 'چهارشنبه', actual: 6300, target: 7200 },
    { day: 'Thu', dayFa: 'پنج‌شنبه', actual: 10200, target: 8900 },
    { day: 'Fri', dayFa: 'جمعه', actual: 9400, target: 9100 },
    { day: 'Sat', dayFa: 'شنبه', actual: 11800, target: 10500 },
    { day: 'Sun', dayFa: 'یکشنبه', actual: 14500, target: 12000 },
  ];

  // SVG Chart Geometry
  const width = 600;
  const height = 230;
  const paddingX = 42;
  const paddingY = 28;
  const maxY = 16000;

  const actualPoints = dataPoints.map((dp, i) => {
    const x = paddingX + (i * (width - paddingX * 2)) / (dataPoints.length - 1);
    const y = height - paddingY - (dp.actual / maxY) * (height - paddingY * 2);
    return { x, y, value: dp.actual, ...dp };
  });

  const targetPoints = dataPoints.map((dp, i) => {
    const x = paddingX + (i * (width - paddingX * 2)) / (dataPoints.length - 1);
    const y = height - paddingY - (dp.target / maxY) * (height - paddingY * 2);
    return { x, y, value: dp.target, ...dp };
  });

  // Generate cubic bezier smooth curve path
  const makeSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const actualPath = makeSmoothPath(actualPoints);
  const targetPath = makeSmoothPath(targetPoints);
  const areaPath = `${actualPath} L ${actualPoints[actualPoints.length - 1].x} ${height - paddingY} L ${actualPoints[0].x} ${height - paddingY} Z`;

  const cyanColor = '#00D2FF';
  const goldColor = '#FFB020';

  return (
    <div 
      className={`rounded-[22px] p-5.5 border transition-all duration-300 flex flex-col justify-between h-[350px] ${
        isDark 
          ? 'bg-[#1A264F] border-[#24356B]/30 text-[#F1F5F9] shadow-[0_12px_32px_rgba(7,11,26,0.5)]' 
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Card Header: Title + Legend + Timeframe Pill */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-black tracking-tight text-[#F1F5F9]">
            {isRtl ? 'روند تولید و استخراج' : 'Extraction & Production Trend'}
          </h3>

          {/* Minimalist Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D2FF] shadow-[0_0_8px_rgba(0,210,255,0.4)]" />
              <span className={isDark ? 'text-[#8E9EB8]' : 'text-slate-500'}>
                {isRtl ? 'استخراج واقعی' : 'Actual'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB020] shadow-[0_0_8px_rgba(255,176,32,0.4)]" />
              <span className={isDark ? 'text-[#8E9EB8]' : 'text-slate-500'}>
                {isRtl ? 'هدف برنامه' : 'Target'}
              </span>
            </div>
          </div>
        </div>

        {/* Rounded Pill Selector matching ui1.jpg */}
        <div className="relative">
          <button 
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
              isDark 
                ? 'bg-[#141F42] border border-[#24356B]/40 text-[#8E9EB8] hover:text-[#F1F5F9]' 
                : 'bg-slate-100 border border-slate-200 text-slate-700'
            }`}
          >
            <span>{isRtl ? 'این هفته' : 'This Week'}</span>
            <ChevronDownIcon className="w-3.5 h-3.5 text-[#8E9EB8]" />
          </button>
        </div>
      </div>

      {/* Interactive Vector Curves Chart */}
      <div className="relative flex-1 w-full flex items-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="cyanAreaSoft" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#00D2FF" stopOpacity="0.0" />
            </linearGradient>

            <filter id="softCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00D2FF" floodOpacity="0.4" />
            </filter>
            <filter id="softGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FFB020" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Horizontal Dotted Grid Lines */}
          {[16000, 12000, 8000, 4000, 0].map((val) => {
            const y = height - paddingY - (val / maxY) * (height - paddingY * 2);
            return (
              <g key={val}>
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke={isDark ? '#24356B' : '#E2E8F0'} 
                  strokeDasharray={val === 0 ? '0' : '3 3'}
                  strokeWidth="0.8"
                  strokeOpacity={isDark ? '0.45' : '0.8'}
                />
                <text 
                  x={paddingX - 10} 
                  y={y + 3.5} 
                  textAnchor="end" 
                  className={`text-[9px] font-mono ${isDark ? 'fill-[#8E9EB8]' : 'fill-slate-400'}`}
                >
                  {val === 0 ? '0' : `${val / 1000}K`}
                </text>
              </g>
            );
          })}

          {/* Cyan Gradient Area Fill */}
          <path d={areaPath} fill="url(#cyanAreaSoft)" />

          {/* Secondary Target Curve (Gold/Orange) */}
          <path
            d={targetPath}
            fill="none"
            stroke={goldColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="4 4"
            filter="url(#softGoldGlow)"
            opacity="0.85"
          />

          {/* Primary Actual Curve (Cyan) */}
          <path
            d={actualPath}
            fill="none"
            stroke={cyanColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            filter="url(#softCyanGlow)"
          />

          {/* Data Points */}
          {actualPoints.map((pt, idx) => (
            <g 
              key={idx} 
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === idx ? 6 : 4}
                fill={cyanColor}
                stroke={isDark ? '#141F42' : '#FFFFFF'}
                strokeWidth="2.5"
                className="transition-all duration-150"
              />

              <text
                x={pt.x}
                y={height - 6}
                textAnchor="middle"
                className={`text-[10px] font-semibold transition-colors ${
                  hoveredIndex === idx 
                    ? 'fill-[#00D2FF] font-bold' 
                    : (isDark ? 'fill-[#8E9EB8]' : 'fill-slate-500')
                }`}
              >
                {isRtl ? pt.dayFa : pt.day}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIndex !== null && (
          <div 
            className="absolute -top-3 pointer-events-none px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xl transition-all duration-200"
            style={{
              left: `${(actualPoints[hoveredIndex].x / width) * 100}%`,
              transform: 'translateX(-50%)',
              backgroundColor: '#141F42',
              borderColor: '#00D2FF',
              color: '#00D2FF',
            }}
          >
            <div className="flex items-center gap-2">
              <span>{actualPoints[hoveredIndex].value.toLocaleString()}</span>
              <span className="text-[10px] text-[#8E9EB8]">{isRtl ? 'تن واقعی' : 'Ton'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionTrendCard;
