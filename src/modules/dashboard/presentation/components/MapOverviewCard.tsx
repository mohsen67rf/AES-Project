// src/modules/dashboard/presentation/components/MapOverviewCard.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { 
  PlusIcon, 
  MinusIcon, 
  Square3Stack3DIcon, 
  MapPinIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

interface MapMarker {
  id: string;
  name: string;
  nameFa: string;
  production: string;
  productionFa: string;
  x: number; // percentage
  y: number; // percentage
  color: string;
  pinBg: string;
  textColor: string;
}

export const MapOverviewCard: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const isRtl = language === 'fa';

  const markers: MapMarker[] = [
    {
      id: 'mineA',
      name: 'Mine A',
      nameFa: 'معدن چادرملو (A)',
      production: '2,450 ton',
      productionFa: '۲,۴۵۰ تن',
      x: 22,
      y: 48,
      color: '#10B981', // green
      pinBg: 'bg-emerald-500',
      textColor: 'text-emerald-400',
    },
    {
      id: 'mineB',
      name: 'Mine B',
      nameFa: 'معدن گل‌گهر (B)',
      production: '1,890 ton',
      productionFa: '۱,۸۹۰ تن',
      x: 48,
      y: 62,
      color: '#F59E0B', // orange
      pinBg: 'bg-amber-500',
      textColor: 'text-amber-400',
    },
    {
      id: 'mineC',
      name: 'Mine C',
      nameFa: 'معدن سنگان (C)',
      production: '3,210 ton',
      productionFa: '۳,۲۱۰ تن',
      x: 68,
      y: 35,
      color: '#8B5CF6', // purple
      pinBg: 'bg-purple-500',
      textColor: 'text-purple-400',
    },
    {
      id: 'mineD',
      name: 'Mine D',
      nameFa: 'معدن مرکزی (D)',
      production: '1,560 ton',
      productionFa: '۱,۵۶۰ تن',
      x: 85,
      y: 52,
      color: '#3B82F6', // blue
      pinBg: 'bg-blue-500',
      textColor: 'text-blue-400',
    },
  ];

  return (
    <div 
      className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
        isDark 
          ? 'bg-[#111726]/80 border-[#1E293B] text-white shadow-lg backdrop-blur-xl' 
          : 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-black tracking-tight">
            {isRtl ? 'نمای کلی نقشه و موقعیت معادن (GIS)' : 'Map Overview'}
          </h3>
        </div>

        <button 
          onClick={() => navigate('/mine/map')}
          className="text-xs font-bold text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
        >
          <span>{isRtl ? 'باز کردن نقشه سه‌بعدی کامل' : 'Full GIS Map'}</span>
          <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Terrain Canvas Container */}
      <div 
        className="relative w-full h-[230px] rounded-xl overflow-hidden border border-slate-800/40 select-none group"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 40% 50%, #152238 0%, #0c1424 50%, #060a12 100%)'
            : 'radial-gradient(ellipse at 40% 50%, #E2E8F0 0%, #CBD5E1 60%, #94A3B8 100%)'
        }}
      >
        {/* Topographic Contour Lines SVG Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topoContour" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 0 30 Q 30 10 60 30 T 120 30" fill="none" stroke={isDark ? '#38BDF8' : '#64748B'} strokeWidth="0.8" opacity="0.4" />
              <path d="M 0 60 Q 40 40 80 70 T 120 50" fill="none" stroke={isDark ? '#38BDF8' : '#64748B'} strokeWidth="0.8" opacity="0.3" />
              <path d="M 0 90 Q 50 110 90 80 T 120 100" fill="none" stroke={isDark ? '#38BDF8' : '#64748B'} strokeWidth="0.8" opacity="0.4" />
              <ellipse cx="60" cy="60" rx="35" ry="20" fill="none" stroke={isDark ? '#818CF8' : '#475569'} strokeWidth="0.7" opacity="0.3" />
              <ellipse cx="60" cy="60" rx="20" ry="10" fill="none" stroke={isDark ? '#C084FC' : '#334155'} strokeWidth="0.7" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topoContour)" />
        </svg>

        {/* Mountain Ridge Accents & Pit Terrains */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/5 w-64 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        {/* Map Interactive Pins / Badges */}
        {markers.map((marker) => {
          const isSelected = selectedMarker === marker.id;
          return (
            <div
              key={marker.id}
              onClick={() => {
                setSelectedMarker(marker.id);
                navigate('/mine');
              }}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 z-10"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            >
              <div className="flex items-center gap-2">
                {/* Pin Head with Pulsing Halo */}
                <div className="relative">
                  <div className={`w-3.5 h-3.5 rounded-full ${marker.pinBg} border-2 border-white shadow-lg`} />
                  <div className={`absolute -inset-1 rounded-full ${marker.pinBg} opacity-40 animate-ping`} />
                </div>

                {/* Floating Mine Details Badge */}
                <div 
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-xl flex flex-col backdrop-blur-md transition-all ${
                    isDark 
                      ? 'bg-[#0B101D]/90 border-[#1F293D] text-white' 
                      : 'bg-white/95 border-slate-200 text-slate-900 shadow-md'
                  }`}
                >
                  <span className="font-extrabold">{isRtl ? marker.nameFa : marker.name}</span>
                  <span className={`text-[9px] font-semibold ${marker.textColor}`}>
                    {isRtl ? `تولید: ${marker.productionFa}` : `Production: ${marker.production}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Map Control Buttons (Top Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2))}
            className={`w-7 h-7 rounded-lg flex items-center justify-center border font-bold text-xs shadow-md transition-all ${
              isDark ? 'bg-[#111726] border-[#1F293D] text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.6))}
            className={`w-7 h-7 rounded-lg flex items-center justify-center border font-bold text-xs shadow-md transition-all ${
              isDark ? 'bg-[#111726] border-[#1F293D] text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <MinusIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('/mine/map')}
            className={`w-7 h-7 rounded-lg flex items-center justify-center border font-bold text-xs shadow-md transition-all ${
              isDark ? 'bg-[#111726] border-[#1F293D] text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
            }`}
            title="لایه‌های نقشه"
          >
            <Square3Stack3DIcon className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapOverviewCard;
