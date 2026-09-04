// src/modules/tasks/presentation/components/TaskInteractiveMapSelector.tsx

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Square,
  Crosshair,
} from 'lucide-react';
import type { TaskMapLocation } from '../../../../core/domain/types/task.types';

export interface MineMapBench {
  level: string;
  nameFa: string;
  elevation: number;
  color: string;
  yMin: number;
  yMax: number;
}

export interface MineMapBlock {
  id: string;
  code: string;
  bench: string;
  type: 'ORE_HIGH' | 'ORE_MED' | 'ORE_LOW' | 'WASTE';
  gradeText: string;
  polygon: [number, number][]; // percentage [x, y]
  center: [number, number];
  areaM2: number;
  eastingUTM: number;
  northingUTM: number;
}

const BENCHES: MineMapBench[] = [
  { level: '1060', nameFa: 'پله ۱۰۶۰ (تراز بالادست پیت)', elevation: 1060, color: '#F59E0B', yMin: 10, yMax: 28 },
  { level: '1050', nameFa: 'پله ۱۰۵۰ (پله میانی استخراج)', elevation: 1050, color: '#3B82F6', yMin: 28, yMax: 46 },
  { level: '1040', nameFa: 'پله ۱۰۴۰ (جبهه‌کار فعال اصلی)', elevation: 1040, color: '#00D2FF', yMin: 46, yMax: 66 },
  { level: '1030', nameFa: 'پله ۱۰۳۰ (کف پیت و زهکشی)', elevation: 1030, color: '#10B981', yMin: 66, yMax: 84 },
];

export const MINE_MAP_BLOCKS: MineMapBlock[] = [
  {
    id: 'block-1040-b33',
    code: '1040 B 33',
    bench: '1040',
    type: 'ORE_HIGH',
    gradeText: 'مگنتیت پرعیار Fe 61.8%',
    polygon: [[52, 48], [66, 48], [64, 60], [50, 60]],
    center: [58, 54],
    areaM2: 1850,
    eastingUTM: 642450,
    northingUTM: 3584320,
  },
  {
    id: 'block-1040-b32',
    code: '1040 B 32',
    bench: '1040',
    type: 'ORE_HIGH',
    gradeText: 'مگنتیت پرعیار Fe 62.4%',
    polygon: [[36, 48], [50, 48], [48, 60], [34, 60]],
    center: [42, 54],
    areaM2: 1900,
    eastingUTM: 642320,
    northingUTM: 3584280,
  },
  {
    id: 'block-1040-b12',
    code: '1040 B 12',
    bench: '1040',
    type: 'ORE_MED',
    gradeText: 'متوسط‌عیار Fe 52.0%',
    polygon: [[20, 50], [32, 50], [30, 61], [18, 61]],
    center: [25, 55.5],
    areaM2: 1550,
    eastingUTM: 642100,
    northingUTM: 3584210,
  },
  {
    id: 'block-1050-b15',
    code: '1050 B 15',
    bench: '1050',
    type: 'ORE_MED',
    gradeText: 'مگنتیت Fe 54.1%',
    polygon: [[38, 32], [52, 32], [50, 43], [36, 43]],
    center: [44, 37.5],
    areaM2: 1750,
    eastingUTM: 642380,
    northingUTM: 3584420,
  },
  {
    id: 'block-1050-b16',
    code: '1050 B 16',
    bench: '1050',
    type: 'ORE_LOW',
    gradeText: 'کم‌عیار اسکارن Fe 44.5%',
    polygon: [[55, 32], [69, 32], [67, 43], [53, 43]],
    center: [61, 37.5],
    areaM2: 1680,
    eastingUTM: 642510,
    northingUTM: 3584460,
  },
  {
    id: 'block-1030-b08',
    code: '1030 B 08',
    bench: '1030',
    type: 'WASTE',
    gradeText: 'باطله برونزون پیت',
    polygon: [[42, 69], [58, 69], [56, 79], [40, 79]],
    center: [49, 74],
    areaM2: 2100,
    eastingUTM: 642390,
    northingUTM: 3584160,
  },
];

interface TaskInteractiveMapSelectorProps {
  value?: TaskMapLocation;
  onChange: (location: TaskMapLocation | undefined) => void;
  selectedBench?: string;
  onBenchSelect?: (bench: string) => void;
  isDark?: boolean;
}

export const TaskInteractiveMapSelector: React.FC<TaskInteractiveMapSelectorProps> = ({
  value,
  onChange,
  selectedBench = '1040',
  onBenchSelect,
  isDark = true,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectionMode, setSelectionMode] = useState<'POINT' | 'BLOCK_ZONE'>('BLOCK_ZONE');
  const [activeBench, setActiveBench] = useState<string>(selectedBench);
  const [hoveredBlock, setHoveredBlock] = useState<MineMapBlock | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleBenchChange = (bench: string) => {
    setActiveBench(bench);
    if (onBenchSelect) onBenchSelect(bench);
  };

  const handleBlockClick = (block: MineMapBlock) => {
    setActiveBench(block.bench);
    const newLoc: TaskMapLocation = {
      type: 'BENCH_ZONE',
      bench: block.bench,
      blockCode: block.code,
      blockId: block.id,
      zoneName: `محدوده پله ${block.bench} - بلوک ${block.code} (${block.gradeText})`,
      x: block.center[0],
      y: block.center[1],
      polygonPoints: block.polygon,
      areaM2: block.areaM2,
      eastingUTM: block.eastingUTM,
      northingUTM: block.northingUTM,
      elevation: parseInt(block.bench, 10),
      notes: `تعیین شده به عنوان زون عملیاتی دستور کار در بلوک ${block.code}`,
    };
    onChange(newLoc);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to percentage coordinates (0 - 100)
    const pctX = Math.round(Math.max(2, Math.min(98, (clickX / rect.width) * 100)));
    const pctY = Math.round(Math.max(2, Math.min(98, (clickY / rect.height) * 100)));

    // Approximate bench based on Y
    let detectedBench = activeBench;
    const matchedBench = BENCHES.find((b) => pctY >= b.yMin && pctY <= b.yMax);
    if (matchedBench) detectedBench = matchedBench.level;

    // Approximate UTM
    const easting = 642000 + Math.round(pctX * 10);
    const northing = 3584000 + Math.round((100 - pctY) * 8);

    const newLoc: TaskMapLocation = {
      type: 'POINT',
      bench: detectedBench,
      zoneName: `موقعیت نقطه‌ای در پله ${detectedBench} (X: ${pctX}%, Y: ${pctY}%)`,
      x: pctX,
      y: pctY,
      areaM2: 500,
      eastingUTM: easting,
      northingUTM: northing,
      elevation: parseInt(detectedBench, 10),
      notes: `نقطه مشخص‌شده توسط کاربر در پله ${detectedBench}`,
    };
    onChange(newLoc);
  };

  const handleClearLocation = () => {
    onChange(undefined);
  };

  return (
    <div className="space-y-3 rounded-2xl border p-3.5 bg-[#0C1427]/80 border-[#223366] text-white">
      {/* Top Controls: Mode Switcher + Bench Selector + Clear */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#223366]/60 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#8E9EB8] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span>ثبت محدوده روی نقشه آنلاین:</span>
          </span>
          <div className="flex items-center gap-1 bg-[#101935] p-0.5 rounded-xl border border-[#24356B]">
            <button
              type="button"
              onClick={() => setSelectionMode('BLOCK_ZONE')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 ${
                selectionMode === 'BLOCK_ZONE'
                  ? 'bg-[#00D2FF] text-[#070F1E] font-bold shadow-sm'
                  : 'text-[#8E9EB8] hover:text-white'
              }`}
            >
              <Square className="w-3 h-3" />
              <span>محدوده بلوک</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectionMode('POINT')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1 ${
                selectionMode === 'POINT'
                  ? 'bg-[#00D2FF] text-[#070F1E] font-bold shadow-sm'
                  : 'text-[#8E9EB8] hover:text-white'
              }`}
            >
              <Crosshair className="w-3 h-3" />
              <span>نقطه‌گذاری آزاد</span>
            </button>
          </div>
        </div>

        {/* Bench Quick Selection Buttons */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[#64748B]">تراز پله:</span>
          {BENCHES.map((b) => (
            <button
              key={b.level}
              type="button"
              onClick={() => handleBenchChange(b.level)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-all ${
                activeBench === b.level
                  ? 'bg-[#00D2FF]/20 border-[#00D2FF] text-[#00D2FF]'
                  : 'bg-[#101935] border-[#24356B]/60 text-[#8E9EB8] hover:text-white'
              }`}
            >
              {b.level}m
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div
        ref={mapContainerRef}
        onClick={selectionMode === 'POINT' ? handleMapClick : undefined}
        className="relative w-full h-64 md:h-72 rounded-xl overflow-hidden cursor-crosshair border border-[#24356B]/70 bg-[#070D1A] select-none group shadow-inner"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(0, 210, 255, 0.05) 0%, transparent 70%),
            linear-gradient(rgba(36, 53, 107, 0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(36, 53, 107, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 20px 20px, 20px 20px',
        }}
      >
        {/* SVG Topography & Haul Roads Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Bench Contour Curves */}
          <path
            d="M 5,15 Q 50,10 95,15 Q 90,30 95,45 Q 50,42 5,45 Z"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            opacity="0.35"
          />
          <path
            d="M 10,32 Q 50,28 90,32 Q 88,50 90,65 Q 50,62 10,65 Z"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="0.6"
            strokeDasharray="2,2"
            opacity="0.4"
          />
          <path
            d="M 15,48 Q 50,44 85,48 Q 82,65 85,78 Q 50,75 15,78 Z"
            fill="none"
            stroke="#00D2FF"
            strokeWidth="0.8"
            opacity="0.5"
          />
          <path
            d="M 25,68 Q 50,65 75,68 Q 72,82 75,88 Q 50,86 25,88 Z"
            fill="none"
            stroke="#10B981"
            strokeWidth="0.5"
            strokeDasharray="1,1"
            opacity="0.4"
          />

          {/* Main Haulage Ramps (جاده‌های دسترسی و حمل باطله/سنگ‌آهن) */}
          <path
            d="M 2,12 C 30,22 75,20 92,38 C 96,55 78,72 82,90"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1.6"
            strokeDasharray="3,2"
            opacity="0.35"
          />
          <path
            d="M 8,88 C 22,76 34,70 42,54"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1.2"
            strokeDasharray="2,2"
            opacity="0.25"
          />
        </svg>

        {/* Bench Level Watermarks */}
        <div className="absolute top-2 left-3 pointer-events-none text-[10px] font-mono text-[#F59E0B]/60 tracking-wider">
          BENCH 1060m
        </div>
        <div className="absolute top-[28%] left-3 pointer-events-none text-[10px] font-mono text-[#3B82F6]/60 tracking-wider">
          BENCH 1050m
        </div>
        <div className="absolute top-[48%] left-3 pointer-events-none text-[10px] font-mono text-[#00D2FF]/80 font-bold tracking-wider">
          BENCH 1040m (MAIN PIT ORE)
        </div>
        <div className="absolute top-[72%] left-3 pointer-events-none text-[10px] font-mono text-[#10B981]/60 tracking-wider">
          BENCH 1030m
        </div>

        {/* Compass Indicator */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-md bg-[#101935]/80 border border-[#24356B] text-[10px] font-bold text-[#8E9EB8] pointer-events-none backdrop-blur-sm">
          <Compass className="w-3 h-3 text-[#00D2FF] animate-spin-slow" />
          <span>شمال N</span>
        </div>

        {/* Interactive Block Polygons on the Map */}
        {MINE_MAP_BLOCKS.map((block) => {
          const isSelected = value?.blockCode === block.code || value?.blockId === block.id;
          const isTarget1040B33 = block.code === '1040 B 33';

          // Convert polygon points to SVG path or CSS polygon
          const pointsStr = block.polygon.map((pt) => `${pt[0]}% ${pt[1]}%`).join(', ');

          let fillColor = 'rgba(59, 130, 246, 0.15)';
          let borderColor = 'rgba(59, 130, 246, 0.5)';
          if (block.type === 'ORE_HIGH') {
            fillColor = isSelected ? 'rgba(0, 210, 255, 0.45)' : 'rgba(0, 210, 255, 0.2)';
            borderColor = isSelected ? '#00D2FF' : 'rgba(0, 210, 255, 0.7)';
          } else if (block.type === 'WASTE') {
            fillColor = 'rgba(100, 116, 139, 0.2)';
            borderColor = 'rgba(100, 116, 139, 0.5)';
          }

          return (
            <div
              key={block.id}
              onClick={(e) => {
                e.stopPropagation();
                handleBlockClick(block);
              }}
              onMouseEnter={() => setHoveredBlock(block)}
              onMouseLeave={() => setHoveredBlock(null)}
              className={`absolute transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center p-1 group/block ${
                isSelected ? 'z-20 scale-[1.02]' : 'hover:scale-[1.01] hover:z-10'
              }`}
              style={{
                left: `${block.polygon[0][0]}%`,
                top: `${block.polygon[0][1]}%`,
                width: `${block.polygon[1][0] - block.polygon[0][0]}%`,
                height: `${block.polygon[3][1] - block.polygon[0][1]}%`,
              }}
            >
              <div
                className={`w-full h-full rounded-lg border transition-all flex flex-col items-center justify-center p-1 relative overflow-hidden ${
                  isSelected
                    ? 'border-[#00D2FF] bg-[#00D2FF]/25 shadow-lg shadow-[#00D2FF]/30 ring-2 ring-[#00D2FF]'
                    : isTarget1040B33
                    ? 'border-[#00D2FF]/70 bg-[#00D2FF]/15 hover:bg-[#00D2FF]/25'
                    : 'border-slate-500/40 bg-slate-800/40 hover:bg-slate-700/50'
                }`}
              >
                {/* Visual Hatch Pattern for Mining Ore Blocks */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #00D2FF 0, #00D2FF 1px, transparent 0, transparent 8px)',
                  }}
                />

                <span
                  className={`text-[10px] md:text-xs font-black tracking-tight ${
                    isSelected ? 'text-white' : isTarget1040B33 ? 'text-[#00D2FF]' : 'text-slate-300'
                  }`}
                >
                  {block.code}
                </span>

                <span className="text-[9px] text-slate-300 hidden md:inline truncate max-w-full">
                  {block.gradeText.split(' ')[0]}
                </span>

                {/* Selection Badge */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00D2FF] animate-ping" />
                )}
              </div>
            </div>
          );
        })}

        {/* Point Marker (if free point or selected block center) */}
        {value && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ left: `${value.x}%`, top: `${value.y}%` }}
          >
            <div className="relative flex flex-col items-center">
              {/* Pulsing Target Ring */}
              <div className="absolute -bottom-1 w-6 h-6 rounded-full bg-[#00D2FF]/40 animate-ping" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00D2FF] to-[#0099FF] text-[#070F1E] shadow-xl flex items-center justify-center border-2 border-white">
                <MapPin className="w-4 h-4 fill-current stroke-[2.5]" />
              </div>
              <div className="px-2 py-0.5 mt-1 rounded-md bg-[#101935]/90 border border-[#00D2FF] text-[9px] font-bold text-white whitespace-nowrap shadow-lg">
                {value.blockCode || `پله ${value.bench}`}
              </div>
            </div>
          </motion.div>
        )}

        {/* Hover Block Tooltip inside map */}
        {hoveredBlock && (
          <div className="absolute bottom-2 left-2 right-2 md:right-auto md:w-80 p-2.5 rounded-xl bg-[#101935]/95 border border-[#00D2FF]/60 text-white text-[11px] shadow-2xl backdrop-blur-md pointer-events-none z-40">
            <div className="flex items-center justify-between font-bold text-[#00D2FF] mb-1">
              <span>بلوک معدنی {hoveredBlock.code}</span>
              <span className="text-[10px] text-slate-400">تراز {hoveredBlock.bench}m</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300">
              <div>عیار: <span className="font-semibold text-white">{hoveredBlock.gradeText}</span></div>
              <div>مساحت: <span className="font-semibold text-white">{hoveredBlock.areaM2.toLocaleString()} م²</span></div>
              <div>UTM Easting: <span className="font-mono text-slate-400">{hoveredBlock.eastingUTM}</span></div>
              <div>UTM Northing: <span className="font-mono text-slate-400">{hoveredBlock.northingUTM}</span></div>
            </div>
            <div className="mt-1.5 pt-1 border-t border-[#24356B] text-[9px] text-[#00D2FF]">
              برای اختصاص محدوده این بلوک به تسک کلیک کنید
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Summary Card */}
      {value ? (
        <div className="p-3 rounded-xl bg-[#101935] border border-[#00D2FF]/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00D2FF]/15 border border-[#00D2FF]/30 text-[#00D2FF] flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold text-white">
                <span>موقعیت مکانی ثبت شد:</span>
                <span className="px-2 py-0.5 rounded-md bg-[#00D2FF]/20 text-[#00D2FF] font-black">
                  {value.blockCode ? `بلوک ${value.blockCode}` : `پله ${value.bench}`}
                </span>
                <span className="text-[10px] text-slate-400">({value.zoneName})</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#8E9EB8] mt-1 font-mono">
                {value.elevation && <span>تراز: {value.elevation}m</span>}
                {value.areaM2 && <span>مساحت زون: {value.areaM2.toLocaleString()} م²</span>}
                {value.eastingUTM && <span>UTM: {value.eastingUTM}E / {value.northingUTM}N</span>}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearLocation}
            className="self-end md:self-center px-2.5 py-1 text-[11px] rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
          >
            پاک کردن موقعیت
          </button>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-[#101935]/60 border border-[#24356B]/40 text-xs flex items-center gap-2 text-[#8E9EB8]">
          <Info className="w-4 h-4 text-[#00D2FF] flex-shrink-0" />
          <span>
            برای ارجاع دقیق تسک، روی یکی از بلوک‌های پله ۱۰۴۰ (نظیر <strong className="text-white">1040 B 33</strong>) کلیک کنید یا هر نقطه از نقشه را انتخاب نمایید.
          </span>
        </div>
      )}
    </div>
  );
};
