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
    { day: 'Mon', dayFa: 'دوشنبه', value: 4200, label: '4.2K' },
    { day: 'Tue', dayFa: 'سه‌شنبه', value: 7500, label: '7.5K' },
    { day: 'Wed', dayFa: 'چهارشنبه', value: 6300, label: '6.3K' },
    { day: 'Thu', dayFa: 'پنج‌شنبه', value: 10200, label: '10.2K' },
    { day: 'Fri', dayFa: 'جمعه', value: 9400, label: '9.4K' },
    { day: 'Sat', dayFa: 'شنبه', value: 11800, label: '11.8K' },
    { day: 'Sun', dayFa: 'یکشنبه', value: 14500, label: '14.5K' },
  ];

  // SVG Chart Geometry
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;
  const maxY = 15000;

  const points = dataPoints.map((dp, i) => {
    const x = paddingX + (i * (width - paddingX * 2)) / (dataPoints.length - 1);
    const y = height - paddingY - (dp.value / maxY) * (height - paddingY * 2);
    return { x, y, ...dp };
  });

  // Generate cubic bezier smooth curve path
  const makeSmoothPath = (pts: typeof points) => {
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

  const linePath = makeSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const lineColor = isDark ? '#00E5FF' : '#7C3AED';
  const glowFilter = isDark ? 'url(#cyanGlow)' : 'url(#purpleGlow)';

  return (
    <div 
      className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between h-[340px] ${
        isDark 
          ? 'bg-[#111726]/80 border-[#1E293B] text-white shadow-lg backdrop-blur-xl' 
          : 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
      }`}
    >
      {/* Card Header: Title + Timeframe Selector */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black tracking-tight">
          {isRtl ? 'روند تولید استخراجی' : 'Production Trend'}
        </h3>

        <div className="relative">
          <button 
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors ${
              isDark 
                ? 'bg-[#090D16] border-[#1E293B] text-slate-300 hover:text-white' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-950'
            }`}
          >
            <span>{isRtl ? 'این هفته' : 'This Week'}</span>
            <ChevronDownIcon className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Interactive Vector Curve Chart */}
      <div className="relative flex-1 w-full flex items-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            {/* Dark mode gradient */}
            <linearGradient id="areaGradientDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
            </linearGradient>

            {/* Light mode gradient */}
            <linearGradient id="areaGradientLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
            </linearGradient>

            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00E5FF" floodOpacity="0.5" />
            </filter>

            <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#7C3AED" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Horizontal Grid lines & Y-axis labels */}
          {[15000, 12000, 9000, 6000, 3000, 0].map((val) => {
            const y = height - paddingY - (val / maxY) * (height - paddingY * 2);
            return (
              <g key={val}>
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke={isDark ? '#1E293B' : '#E2E8F0'} 
                  strokeDasharray={val === 0 ? '0' : '4 4'}
                  strokeWidth="1"
                />
                <text 
                  x={paddingX - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  className={`text-[10px] font-mono ${isDark ? 'fill-slate-500' : 'fill-slate-400'}`}
                >
                  {val === 0 ? '0' : `${val / 1000}K`}
                </text>
              </g>
            );
          })}

          {/* Gradient Area Fill */}
          <path
            d={areaPath}
            fill={isDark ? 'url(#areaGradientDark)' : 'url(#areaGradientLight)'}
          />

          {/* Main Curve Stroke */}
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="3"
            filter={glowFilter}
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
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
                fill={lineColor}
                stroke={isDark ? '#090D16' : '#FFFFFF'}
                strokeWidth="2.5"
                className="transition-all duration-150"
              />

              {/* X-axis Day Label */}
              <text
                x={pt.x}
                y={height - 5}
                textAnchor="middle"
                className={`text-[11px] font-semibold ${
                  hoveredIndex === idx 
                    ? (isDark ? 'fill-cyan-400 font-bold' : 'fill-purple-600 font-bold') 
                    : (isDark ? 'fill-slate-400' : 'fill-slate-500')
                }`}
              >
                {isRtl ? pt.dayFa : pt.day}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating Tooltip when hovering over a point */}
        {hoveredIndex !== null && (
          <div 
            className="absolute -top-3 pointer-events-none px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xl transition-all duration-200"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              transform: 'translateX(-50%)',
              backgroundColor: isDark ? '#111726' : '#FFFFFF',
              borderColor: isDark ? '#00E5FF' : '#7C3AED',
              color: isDark ? '#00E5FF' : '#7C3AED',
            }}
          >
            <div className="flex items-center gap-1.5">
              <span>{points[hoveredIndex].value.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">{isRtl ? 'تن' : 'Ton'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionTrendCard;
