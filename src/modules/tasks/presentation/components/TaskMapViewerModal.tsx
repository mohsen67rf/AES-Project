// src/modules/tasks/presentation/components/TaskMapViewerModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HardHat,
  Calendar,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import type { UnitTask } from '../../../../core/domain/types/task.types';
import { useNavigate } from 'react-router-dom';
import { MINE_MAP_BLOCKS } from './TaskInteractiveMapSelector';

interface TaskMapViewerModalProps {
  task: UnitTask | null;
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const TaskMapViewerModal: React.FC<TaskMapViewerModalProps> = ({
  task,
  isOpen,
  onClose,
  isDark = true,
}) => {
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!isOpen || !task) return null;

  const loc = task.mapLocation || {
    type: 'BENCH_ZONE',
    bench: '1040',
    blockCode: task.relatedEntityCode || '1040 B 33',
    zoneName: 'محدوده عملیاتی پله ۱۰۴۰',
    x: 58,
    y: 54,
    areaM2: 1850,
    elevation: 1040,
    eastingUTM: 642450,
    northingUTM: 3584320,
  };

  const handleNavigateToGis = () => {
    onClose();
    if (loc.blockCode) {
      navigate(`/mine/map?block=${encodeURIComponent(loc.blockCode)}`);
    } else {
      navigate('/mine/map');
    }
  };

  const handleNavigateToLifecycle = () => {
    onClose();
    if (loc.blockId || loc.blockCode) {
      navigate(`/mining-lifecycle?blockId=${encodeURIComponent(loc.blockId || 'block-1040-b33')}`);
    } else {
      navigate('/mining-lifecycle');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl rounded-2xl border border-[#24356B] bg-[#0E1527] text-white shadow-2xl overflow-hidden my-6"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#24356B]/60 bg-[#101935]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30 flex items-center justify-center shadow-lg shadow-[#00D2FF]/10">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm md:text-base font-black text-white">
                    موقعیت مکانی آنلاین و محدوده تسک: {task.code}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/30">
                    پله {loc.bench}m
                  </span>
                </div>
                <p className="text-xs text-[#8E9EB8] truncate max-w-md mt-0.5">
                  {task.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Map Visual Screen */}
          <div className="relative w-full h-80 md:h-96 bg-[#070D1A] overflow-hidden select-none border-b border-[#24356B]/60">
            {/* Compass & Coordinates Widget */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#101935]/90 border border-[#24356B] text-[11px] font-bold text-[#8E9EB8] backdrop-blur-md shadow-lg">
                <Compass className="w-3.5 h-3.5 text-[#00D2FF] animate-spin-slow" />
                <span>جهت پیت: N-NE</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#101935]/90 border border-[#24356B] text-[11px] font-mono text-[#00D2FF] backdrop-blur-md shadow-lg">
                <span>UTM: {loc.eastingUTM || 642450}E / {loc.northingUTM || 3584320}N</span>
              </div>
            </div>

            {/* Map Canvas Background Grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 50%, rgba(0, 210, 255, 0.08) 0%, transparent 75%),
                  linear-gradient(rgba(36, 53, 107, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(36, 53, 107, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 25px 25px, 25px 25px',
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.2s ease-out',
              }}
            >
              {/* SVG Topography & Haul Roads */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Bench contour lines */}
                <path d="M 5,15 Q 50,10 95,15 Q 90,30 95,45 Q 50,42 5,45 Z" fill="none" stroke="#F59E0B" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4" />
                <path d="M 10,32 Q 50,28 90,32 Q 88,50 90,65 Q 50,62 10,65 Z" fill="none" stroke="#3B82F6" strokeWidth="0.6" strokeDasharray="2,2" opacity="0.45" />
                <path d="M 15,48 Q 50,44 85,48 Q 82,65 85,78 Q 50,75 15,78 Z" fill="none" stroke="#00D2FF" strokeWidth="0.9" opacity="0.6" />
                <path d="M 25,68 Q 50,65 75,68 Q 72,82 75,88 Q 50,86 25,88 Z" fill="none" stroke="#10B981" strokeWidth="0.5" strokeDasharray="1,1" opacity="0.4" />

                {/* Haul road ramp */}
                <path d="M 2,12 C 30,22 75,20 92,38 C 96,55 78,72 82,90" fill="none" stroke="#E2E8F0" strokeWidth="1.8" strokeDasharray="3,2" opacity="0.4" />
              </svg>

              {/* Bench labels */}
              <div className="absolute top-3 left-4 text-[11px] font-mono text-[#F59E0B]/70 tracking-wider">BENCH 1060m</div>
              <div className="absolute top-[28%] left-4 text-[11px] font-mono text-[#3B82F6]/70 tracking-wider">BENCH 1050m</div>
              <div className="absolute top-[48%] left-4 text-[11px] font-mono text-[#00D2FF] font-bold tracking-wider">BENCH 1040m (TARGET ZONE)</div>
              <div className="absolute top-[72%] left-4 text-[11px] font-mono text-[#10B981]/70 tracking-wider">BENCH 1030m</div>

              {/* Blocks */}
              {MINE_MAP_BLOCKS.map((block) => {
                const isTargetBlock = loc.blockCode === block.code || loc.blockId === block.id;
                return (
                  <div
                    key={block.id}
                    className={`absolute flex flex-col items-center justify-center p-1 rounded-lg border transition-all ${
                      isTargetBlock
                        ? 'border-[#00D2FF] bg-[#00D2FF]/25 shadow-2xl shadow-[#00D2FF]/50 ring-2 ring-[#00D2FF] z-20 scale-105'
                        : 'border-slate-600/30 bg-slate-800/20 text-slate-400 opacity-60'
                    }`}
                    style={{
                      left: `${block.polygon[0][0]}%`,
                      top: `${block.polygon[0][1]}%`,
                      width: `${block.polygon[1][0] - block.polygon[0][0]}%`,
                      height: `${block.polygon[3][1] - block.polygon[0][1]}%`,
                    }}
                  >
                    <span className={`text-[11px] font-black ${isTargetBlock ? 'text-[#00D2FF]' : 'text-slate-400'}`}>
                      {block.code}
                    </span>
                    <span className="text-[9px] text-slate-300 truncate max-w-full">
                      {block.gradeText.split(' ')[0]}
                    </span>
                  </div>
                );
              })}

              {/* Task Pin Point with Pulsing Radar Effect */}
              <div
                className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Radar Wave Ping */}
                  <div className="absolute -bottom-2 w-12 h-12 rounded-full bg-[#00D2FF]/30 animate-ping" />
                  <div className="absolute -bottom-1 w-8 h-8 rounded-full bg-[#00D2FF]/40 animate-pulse" />

                  {/* Marker Pin */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00D2FF] to-[#0077FF] text-[#070F1E] shadow-2xl flex items-center justify-center border-2 border-white ring-4 ring-[#00D2FF]/40">
                    <MapPin className="w-5 h-5 fill-current stroke-[2.5]" />
                  </div>

                  {/* Pin Floating Tag */}
                  <div className="px-3 py-1 mt-1 rounded-lg bg-[#070F1E] border border-[#00D2FF] text-[10px] font-black text-[#00D2FF] whitespace-nowrap shadow-2xl flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse" />
                    <span>{loc.blockCode || task.code}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Zoom & View Controls */}
            <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 bg-[#101935]/90 border border-[#24356B] p-1 rounded-xl backdrop-blur-md">
              <button
                onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
                className="p-1.5 rounded-lg text-[#8E9EB8] hover:text-white hover:bg-white/10 transition-colors"
                title="بزرگنمایی"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                className="p-1.5 rounded-lg text-[#8E9EB8] hover:text-white hover:bg-white/10 transition-colors"
                title="کوچکنمایی"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="px-2 py-1 rounded-lg text-[10px] text-[#8E9EB8] hover:text-white hover:bg-white/10 transition-colors"
              >
                ۱۰۰٪
              </button>
            </div>
          </div>

          {/* Details & Action Panel */}
          <div className="p-5 space-y-4 bg-[#0E1527]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#101935] border border-[#24356B]/60">
                <span className="text-[10px] text-[#8E9EB8] block mb-1">پله و تراز عملیاتی:</span>
                <span className="text-sm font-black text-[#00D2FF]">پله {loc.bench} متر</span>
              </div>
              <div className="p-3 rounded-xl bg-[#101935] border border-[#24356B]/60">
                <span className="text-[10px] text-[#8E9EB8] block mb-1">بلوک مرجع:</span>
                <span className="text-sm font-black text-white">{loc.blockCode || 'نامشخص'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#101935] border border-[#24356B]/60">
                <span className="text-[10px] text-[#8E9EB8] block mb-1">مساحت تقریبی زون:</span>
                <span className="text-sm font-black text-emerald-400">
                  {loc.areaM2 ? `${loc.areaM2.toLocaleString()} مترمربع` : '۱,۸۵۰ م²'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#101935] border border-[#24356B]/60">
                <span className="text-[10px] text-[#8E9EB8] block mb-1">مسئول پیگیری:</span>
                <span className="text-sm font-bold text-white truncate block">
                  {task.assignedUserName || task.assignedRole}
                </span>
              </div>
            </div>

            {/* Zone Description / Task description */}
            <div className="p-3.5 rounded-xl bg-[#101935]/70 border border-[#24356B]/60 text-xs space-y-1.5">
              <span className="font-bold text-[#8E9EB8] block">شرح دستور کار و موقعیت میدانی:</span>
              <p className="text-slate-200 leading-relaxed text-[11px]">
                {task.description}
              </p>
              {loc.notes && (
                <p className="text-[#00D2FF] text-[11px] pt-1 border-t border-[#24356B]/40 font-medium">
                  نکته مکانی: {loc.notes}
                </p>
              )}
            </div>

            {/* Quick Navigation Buttons to Deep Pages */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNavigateToLifecycle}
                  className="px-3 py-2 rounded-xl bg-[#00D2FF]/15 hover:bg-[#00D2FF]/25 text-[#00D2FF] border border-[#00D2FF]/30 transition-colors text-xs font-bold flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>بررسی چرخه کامل بلوک {loc.blockCode || '1040 B 33'}</span>
                </button>
                <button
                  onClick={handleNavigateToGis}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors text-xs font-medium flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>مشاهده در نقشه استودیو GIS</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#24356B] hover:bg-[#2e4282] text-white text-xs font-bold transition-colors"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
