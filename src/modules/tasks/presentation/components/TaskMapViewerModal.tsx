// src/modules/tasks/presentation/components/TaskMapViewerModal.tsx

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Compass,
  ExternalLink,
  Layers,
  ZoomIn,
  ZoomOut,
  FileCheck,
  MessageSquare,
} from 'lucide-react';
import type { UnitTask } from '../../../../core/domain/types/task.types';
import { useNavigate } from 'react-router-dom';
import { MINE_MAP_BLOCKS } from './taskMapConstants';
import { SurveyMapService } from '../../../mine/services/SurveyMapService';
import type { SurveyMap, MapFeature } from '../../../../core/domain/types/survey-map.types';
import { BlockCodeDisplay } from '../../../../shared/components/BlockCodeDisplay';

interface TaskMapViewerModalProps {
  task: UnitTask | null;
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 650;
const PADDING = 35;

export const TaskMapViewerModal: React.FC<TaskMapViewerModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // واکشی نقشه مرجع مرتبط با تسک یا نقشه فعال سامانه
  const masterMap = useMemo<SurveyMap | null>(() => {
    if (!task) return null;
    if (task.mapLocation?.mapId) {
      const found = SurveyMapService.getMapById(task.mapLocation.mapId);
      if (found) return found;
    }
    return SurveyMapService.getActiveMasterMap();
  }, [task]);

  const mapBounds = useMemo(() => {
    if (
      masterMap?.bounds &&
      masterMap.bounds.maxX > masterMap.bounds.minX &&
      masterMap.bounds.maxY > masterMap.bounds.minY
    ) {
      return {
        minX: masterMap.bounds.minX,
        maxX: masterMap.bounds.maxX,
        minY: masterMap.bounds.minY,
        maxY: masterMap.bounds.maxY,
        width: masterMap.bounds.maxX - masterMap.bounds.minX,
        height: masterMap.bounds.maxY - masterMap.bounds.minY,
      };
    }
    return { minX: 642000, maxX: 643500, minY: 3583500, maxY: 3585000, width: 1500, height: 1500 };
  }, [masterMap]);

  const { uniformScale, offsetX, offsetY, drawnWidth, drawnHeight } = useMemo(() => {
    const availW = CANVAS_WIDTH - PADDING * 2;
    const availH = CANVAS_HEIGHT - PADDING * 2;
    const scale = Math.min(availW / (mapBounds.width || 1), availH / (mapBounds.height || 1));
    const dW = (mapBounds.width || 1) * scale;
    const dH = (mapBounds.height || 1) * scale;
    const oX = PADDING + (availW - dW) / 2;
    const oY = PADDING + (availH - dH) / 2;
    return { uniformScale: scale, offsetX: oX, offsetY: oY, drawnWidth: dW, drawnHeight: dH };
  }, [mapBounds]);

  const utmToSvg = (utmX: number, utmY: number): [number, number] => {
    const svgX = offsetX + (utmX - mapBounds.minX) * uniformScale;
    const svgY = offsetY + (mapBounds.maxY - utmY) * uniformScale;
    return [svgX, svgY];
  };

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
                    موقعیت مکانی بر روی نقشه مرجع: {task.code}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/30">
                    پله {loc.bench}m
                  </span>
                  {loc.type && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {loc.type === 'POLYGON' ? 'محدوده' : loc.type === 'LINE' ? 'مسیر خطی' : loc.type === 'POINT' ? 'نقطه' : 'بلوک'}
                    </span>
                  )}
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
            {/* قطب‌نما و مختصات */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#101935]/90 border border-[#24356B] text-[11px] font-bold text-[#8E9EB8] backdrop-blur-md shadow-lg">
                <Compass className="w-3.5 h-3.5 text-[#00D2FF]" />
                <span>شمال N</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#101935]/90 border border-[#24356B] text-[11px] font-mono text-[#00D2FF] backdrop-blur-md shadow-lg">
                <span>UTM: {loc.eastingUTM || 642450}E / {loc.northingUTM || 3584320}N</span>
              </div>
            </div>

            {/* عنوان نقشه مرجع */}
            <div className="absolute top-3 left-4 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0E172E]/80 border border-[#24356B] text-[10px] text-cyan-300 font-bold backdrop-blur-sm">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>{masterMap?.title || 'نقشه مرجع معدن'}</span>
            </div>

            {/* بوم SVG با نقشه مرجع آپلود شده */}
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out',
              }}
            >
              <defs>
                <pattern id="viewerCadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(36, 53, 107, 0.35)" strokeWidth="0.8" />
                </pattern>
                <pattern id="viewerCadSubGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(36, 53, 107, 0.15)" strokeWidth="0.4" />
                </pattern>
              </defs>

              <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#070D1A" />
              <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#viewerCadSubGrid)" />
              <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#viewerCadGrid)" />

              {/* تصویر رستری نقشه مرجع در صورت وجود */}
              {masterMap?.rasterImageUrl && (
                <image
                  href={masterMap.rasterImageUrl}
                  x={offsetX}
                  y={offsetY}
                  width={drawnWidth}
                  height={drawnHeight}
                  opacity={0.88}
                  preserveAspectRatio="none"
                />
              )}

              {/* عوارض وکتوری نقشه */}
              {masterMap?.features && masterMap.features.length > 0 ? (
                masterMap.features.map((feature: MapFeature, idx: number) => {
                  const coords = feature.coordinates || [];
                  if (!Array.isArray(coords) || coords.length === 0) return null;
                  const fKey = `view-feat-${feature.id || idx}`;

                  if (feature.type === 'POLYGON' && coords.length >= 3) {
                    const pointsStr = coords
                      .map((pt: [number, number] | number[]) => {
                        const [sx, sy] = utmToSvg(Number(pt[0]), Number(pt[1]));
                        return `${sx.toFixed(1)},${sy.toFixed(1)}`;
                      })
                      .join(' ');
                    return (
                      <polygon
                        key={fKey}
                        points={pointsStr}
                        fill={feature.style?.fillColor || '#38BDF8'}
                        fillOpacity={0.15}
                        stroke={feature.style?.strokeColor || '#38BDF8'}
                        strokeWidth={1.2}
                      />
                    );
                  }

                  if ((feature.type === 'POLYLINE' || feature.type === 'LINE') && coords.length >= 2) {
                    const pathData = coords
                      .map((pt: [number, number] | number[], pIdx: number) => {
                        const [sx, sy] = utmToSvg(Number(pt[0]), Number(pt[1]));
                        return `${pIdx === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
                      })
                      .join(' ');
                    return (
                      <path
                        key={fKey}
                        d={pathData}
                        fill="none"
                        stroke={feature.style?.strokeColor || '#00D4FF'}
                        strokeWidth={feature.style?.strokeWidth || 1.5}
                        strokeOpacity={0.6}
                      />
                    );
                  }
                  return null;
                })
              ) : (
                <g>
                  {MINE_MAP_BLOCKS.map((block) => {
                    const pointsStr = block.polygon
                      .map((pt) => `${((pt[0] / 100) * CANVAS_WIDTH).toFixed(1)},${((pt[1] / 100) * CANVAS_HEIGHT).toFixed(1)}`)
                      .join(' ');
                    return (
                      <polygon
                        key={block.id}
                        points={pointsStr}
                        fill="rgba(56, 189, 248, 0.15)"
                        stroke="#38BDF8"
                        strokeWidth={1.2}
                      />
                    );
                  })}
                </g>
              )}

              {/* عارضه ترسیم‌شده تسک (محدوده چندضلعی، مسیر خطی یا نقطه) */}
              {loc.polygonPoints && loc.polygonPoints.length >= 3 && (
                <polygon
                  points={loc.polygonPoints
                    .map((pt) => `${((pt[0] / 100) * CANVAS_WIDTH).toFixed(1)},${((pt[1] / 100) * CANVAS_HEIGHT).toFixed(1)}`)
                    .join(' ')}
                  fill="rgba(0, 210, 255, 0.35)"
                  stroke="#00D2FF"
                  strokeWidth="3"
                />
              )}

              {loc.linePoints && loc.linePoints.length >= 2 && (
                <polyline
                  points={loc.linePoints
                    .map((pt) => `${((pt[0] / 100) * CANVAS_WIDTH).toFixed(1)},${((pt[1] / 100) * CANVAS_HEIGHT).toFixed(1)}`)
                    .join(' ')}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              )}

              {/* پین مرکزی موقعیت تسک */}
              {(() => {
                const cx = (loc.x / 100) * CANVAS_WIDTH;
                const cy = (loc.y / 100) * CANVAS_HEIGHT;
                return (
                  <g transform={`translate(${cx}, ${cy})`}>
                    <circle r="18" fill="rgba(0, 210, 255, 0.25)" className="animate-ping" />
                    <circle r="10" fill="rgba(0, 210, 255, 0.4)" />

                    <g transform="translate(-14, -28)">
                      <path
                        d="M 14 0 C 6.268 0 0 6.268 0 14 C 0 24.5 14 36 14 36 C 14 36 28 24.5 28 14 C 28 6.268 21.732 0 14 0 Z"
                        fill="#00D2FF"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      <circle cx="14" cy="14" r="5" fill="#0A1020" />
                    </g>

                    {/* برچسب کد تسک */}
                    <g transform="translate(18, -16)">
                      <rect
                        x="0"
                        y="-12"
                        width={Math.max(90, (loc.blockCode || task.code).length * 9 + 20)}
                        height="24"
                        rx="6"
                        fill="#0A1020"
                        stroke="#00D2FF"
                        strokeWidth="1.5"
                        opacity="0.95"
                      />
                      <text x="10" y="4" fill="#00D2FF" fontSize="11" fontWeight="bold">
                        {loc.blockCode || task.code}
                      </text>
                    </g>
                  </g>
                );
              })()}
            </svg>

            {/* کنترل زوم */}
            <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 bg-[#101935]/90 border border-[#24356B] p-1 rounded-xl backdrop-blur-md">
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
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
                {Math.round(zoomLevel * 100)}%
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
                <span className="text-[10px] text-[#8E9EB8] block mb-1">کد بلوک / زون:</span>
                <span className="text-sm font-black text-white">
                  {loc.blockCode ? <BlockCodeDisplay code={loc.blockCode} className="text-white font-black" /> : loc.zoneName || 'محدوده مشخص'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#101935] border border-[#24356B]/60">
                <span className="text-[10px] text-[#8E9EB8] block mb-1">ابعاد / مساحت / طول:</span>
                <span className="text-sm font-black text-emerald-400">
                  {loc.areaM2 ? `${loc.areaM2.toLocaleString()} م²` : loc.lengthM ? `${loc.lengthM} متر طول` : 'نقطه‌ای'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#101935] border border-[#24356B]/60">
                <span className="text-[10px] text-[#8E9EB8] block mb-1">واحد و مسئول پیگیری:</span>
                <span className="text-sm font-bold text-white truncate block">
                  {task.assignedUserName || task.assignedRole}
                </span>
              </div>
            </div>

            {/* کامنت و یادداشت اختصاصی نقشه */}
            {(loc.comment || loc.notes) && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-cyan-300 block text-[11px]">کامنت و دستورالعمل عارضه روی نقشه:</span>
                  <p className="text-slate-200 mt-0.5 text-[11px] leading-relaxed">
                    {loc.comment || loc.notes}
                  </p>
                </div>
              </div>
            )}

            {/* شرح کلی دستور کار */}
            <div className="p-3.5 rounded-xl bg-[#101935]/70 border border-[#24356B]/60 text-xs space-y-1.5">
              <span className="font-bold text-[#8E9EB8] block">شرح کلی دستور کار تسک:</span>
              <p className="text-slate-200 leading-relaxed text-[11px]">
                {task.description}
              </p>
            </div>

            {/* دکمه‌های ناوبری سریع */}
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

export default TaskMapViewerModal;
