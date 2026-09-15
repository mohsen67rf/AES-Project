// src/modules/tasks/presentation/components/TaskInteractiveMapSelector.tsx

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  CheckCircle2,
  Info,
  Square,
  Crosshair,
  Slash,
  PenTool,
  CornerUpLeft,
  Trash2,
  MessageSquare,
  Sparkles,
  Check,
} from 'lucide-react';
import type { TaskMapLocation } from '../../../../core/domain/types/task.types';
import type { SurveyMap, MapFeature } from '../../../../core/domain/types/survey-map.types';
import { useActiveMasterSurveyMap } from '../../../mine/presentation/hooks/useActiveMasterSurveyMap';
import { SurveyMapService } from '../../../mine/services/SurveyMapService';
import { BENCHES, MINE_MAP_BLOCKS, type MineMapBlock } from './taskMapConstants';
import { BlockCodeDisplay } from '../../../../shared/components/BlockCodeDisplay';

export { BENCHES, MINE_MAP_BLOCKS };
export type DrawingTool = 'POINT' | 'LINE' | 'POLYGON' | 'BLOCK_ZONE';

export interface TaskInteractiveMapSelectorProps {
  value?: TaskMapLocation;
  onChange: (location?: TaskMapLocation) => void;
  selectedBench?: string;
  onBenchSelect?: (bench: string) => void;
  isDark?: boolean;
  onApplyCommentToDescription?: (comment: string) => void;
}

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 650;
const PADDING = 35;

/** محاسبه مساحت چندضلعی به متر مربع بر اساس فرمول Shoelace در مختصات واقعی UTM */
function calculatePolygonAreaM2(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    area += coords[i][0] * coords[j][1];
    area -= coords[i][1] * coords[j][0];
  }
  return Math.round(Math.abs(area) / 2);
}

/** محاسبه طول خط بر حسب متر در مختصات اقلیدسی UTM */
function calculateLineLengthM(coords: [number, number][]): number {
  if (coords.length < 2) return 0;
  let length = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const dx = coords[i + 1][0] - coords[i][0];
    const dy = coords[i + 1][1] - coords[i][1];
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return Math.round(length);
}

export const TaskInteractiveMapSelector: React.FC<TaskInteractiveMapSelectorProps> = ({
  value,
  onChange,
  selectedBench = '1040',
  onBenchSelect,
  onApplyCommentToDescription,
}) => {
  // ۱. دریافت آخرین نقشه مرجع فعال آپلود شده در سامانه (Master Reference Map)
  const { masterMap, hasNewUpdateAlert } = useActiveMasterSurveyMap();
  const allMaps = useMemo<SurveyMap[]>(() => SurveyMapService.getAllMaps(), []);
  const [selectedMapId, setSelectedMapId] = useState<string>(
    () => masterMap?.id || SurveyMapService.getActiveMasterMapId()
  );

  const activeSurveyMap = useMemo<SurveyMap | null>(() => {
    if (selectedMapId) {
      const found = allMaps.find((m) => m.id === selectedMapId);
      if (found) return found;
    }
    return masterMap || allMaps[0] || null;
  }, [selectedMapId, allMaps, masterMap]);

  // ابزارهای ترسیم و تعامل
  const [drawingTool, setDrawingTool] = useState<DrawingTool>('POLYGON');
  const [zoom, setZoom] = useState<number>(1);
  const [activeBench, setActiveBench] = useState<string>(selectedBench);
  const [hoveredBlock, setHoveredBlock] = useState<MineMapBlock | MapFeature | null>(null);
  const [mouseUtm, setMouseUtm] = useState<{ x: number; y: number } | null>(null);

  // رأس‌های موقت در حال ترسیم
  const [activeDrawingPoints, setActiveDrawingPoints] = useState<[number, number][]>([]);
  const [isDrawingActive, setIsDrawingActive] = useState<boolean>(false);

  // کامنت و عنوان عارضه (استخراج مستقیم از مقدار prop value یا استیت محلی هنگام ویرایش)
  const [localTitle, setLocalTitle] = useState<string | null>(null);
  const [localComment, setLocalComment] = useState<string | null>(null);
  const [commentCopiedFeedback, setCommentCopiedFeedback] = useState<boolean>(false);

  const displayTitle = localTitle !== null ? localTitle : value?.zoneName || '';
  const displayComment = localComment !== null ? localComment : value?.comment || value?.notes || '';

  const mapSvgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // محاسبه مرزهای هندسی واقعی نقشه مرجع آپلود شده
  const mapBounds = useMemo(() => {
    if (
      activeSurveyMap?.bounds &&
      activeSurveyMap.bounds.maxX > activeSurveyMap.bounds.minX &&
      activeSurveyMap.bounds.maxY > activeSurveyMap.bounds.minY
    ) {
      return {
        minX: activeSurveyMap.bounds.minX,
        maxX: activeSurveyMap.bounds.maxX,
        minY: activeSurveyMap.bounds.minY,
        maxY: activeSurveyMap.bounds.maxY,
        width: activeSurveyMap.bounds.maxX - activeSurveyMap.bounds.minX,
        height: activeSurveyMap.bounds.maxY - activeSurveyMap.bounds.minY,
      };
    }

    if (activeSurveyMap?.features && activeSurveyMap.features.length > 0) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      let hasValid = false;

      activeSurveyMap.features.forEach((f) => {
        const coords = f.coordinates || [];
        coords.forEach((pt: [number, number] | number[]) => {
          const x = Number(pt[0]);
          const y = Number(pt[1]);
          if (!isNaN(x) && !isNaN(y)) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            hasValid = true;
          }
        });
      });

      if (hasValid && maxX > minX && maxY > minY) {
        return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
      }
    }

    return { minX: 642000, maxX: 643500, minY: 3583500, maxY: 3585000, width: 1500, height: 1500 };
  }, [activeSurveyMap]);

  // مقیاس‌دهی یکنواخت و بدون دفرمه شدن هندسه (Isotropic Scale)
  const { uniformScale, offsetX, offsetY, drawnWidth, drawnHeight } = useMemo(() => {
    const availW = CANVAS_WIDTH - PADDING * 2;
    const availH = CANVAS_HEIGHT - PADDING * 2;
    const scale = Math.min(availW / (mapBounds.width || 1), availH / (mapBounds.height || 1));
    const dW = (mapBounds.width || 1) * scale;
    const dH = (mapBounds.height || 1) * scale;
    const oX = PADDING + (availW - dW) / 2;
    const oY = PADDING + (availH - dH) / 2;
    return {
      uniformScale: scale,
      offsetX: oX,
      offsetY: oY,
      drawnWidth: dW,
      drawnHeight: dH,
    };
  }, [mapBounds]);

  // تبدیل مختصات UTM به پیکسل SVG بوم
  const utmToSvg = useCallback(
    (utmX: number, utmY: number): [number, number] => {
      const svgX = offsetX + (utmX - mapBounds.minX) * uniformScale;
      const svgY = offsetY + (mapBounds.maxY - utmY) * uniformScale;
      return [svgX, svgY];
    },
    [mapBounds, uniformScale, offsetX, offsetY]
  );

  // تبدیل پیکسل SVG بوم به مختصات واقعی UTM
  const svgToUtm = useCallback(
    (svgX: number, svgY: number): [number, number] => {
      const utmX = mapBounds.minX + (svgX - offsetX) / uniformScale;
      const utmY = mapBounds.maxY - (svgY - offsetY) / uniformScale;
      return [utmX, utmY];
    },
    [mapBounds, uniformScale, offsetX, offsetY]
  );

  // به‌روزرسانی زنده کامنت در موقعیت مکانی تسک
  const handleUpdateComment = (newComment: string, newTitle?: string) => {
    setLocalComment(newComment);
    if (newTitle !== undefined) setLocalTitle(newTitle);

    if (value) {
      onChange({
        ...value,
        comment: newComment,
        notes: newComment,
        zoneName: newTitle !== undefined ? newTitle : value.zoneName,
      });
    }
  };

  // اعمال کامنت در متن اصلی شرح تسک
  const handleApplyToTaskDescription = () => {
    if (onApplyCommentToDescription && displayComment.trim()) {
      onApplyCommentToDescription(displayComment.trim());
      setCommentCopiedFeedback(true);
      setTimeout(() => setCommentCopiedFeedback(false), 2500);
    }
  };

  // دریافت مختصات ماوس در بوم SVG
  const getSvgCoordinates = (e: React.MouseEvent<SVGSVGElement>): [number, number] | null => {
    if (!mapSvgRef.current) return null;
    const rect = mapSvgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const svgX = clientX * scaleX;
    const svgY = clientY * scaleY;
    return [svgX, svgY];
  };

  // ردیابی موقعیت نشانگر ماوس و محاسبه مختصات UTM لحظه‌ای
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const pt = getSvgCoordinates(e);
    if (!pt) return;
    const [ux, uy] = svgToUtm(pt[0], pt[1]);
    setMouseUtm({ x: Math.round(ux), y: Math.round(uy) });
  };

  // کلیک روی بوم نقشه بر اساس ابزار فعال
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const pt = getSvgCoordinates(e);
    if (!pt) return;
    const [svgX, svgY] = pt;
    const [utmX, utmY] = svgToUtm(svgX, svgY);

    const pctX = Math.round((svgX / CANVAS_WIDTH) * 100);
    const pctY = Math.round((svgY / CANVAS_HEIGHT) * 100);

    if (drawingTool === 'POINT') {
      const pointTitle = `نقطه پایش در پله ${activeBench} (UTM: ${Math.round(utmX)}E / ${Math.round(utmY)}N)`;
      const newLoc: TaskMapLocation = {
        type: 'POINT',
        bench: activeBench,
        zoneName: pointTitle,
        x: pctX,
        y: pctY,
        areaM2: 100,
        eastingUTM: Math.round(utmX),
        northingUTM: Math.round(utmY),
        elevation: parseInt(activeBench, 10) || 1040,
        mapId: activeSurveyMap?.id,
        mapTitle: activeSurveyMap?.title,
        comment: displayComment || 'موقعیت نقطه‌ای علامت‌گذاری‌شده روی نقشه مرجع جهت بررسی و اقدام میدانی',
        notes: displayComment || 'موقعیت نقطه‌ای علامت‌گذاری‌شده روی نقشه مرجع',
        utmCoords: [[Math.round(utmX), Math.round(utmY)]],
      };
      setLocalTitle(pointTitle);
      setActiveDrawingPoints([]);
      setIsDrawingActive(false);
      onChange(newLoc);
    } else if (drawingTool === 'LINE') {
      const updated: [number, number][] = [...activeDrawingPoints, [svgX, svgY]];
      setActiveDrawingPoints(updated);
      setIsDrawingActive(true);
    } else if (drawingTool === 'POLYGON') {
      const updated: [number, number][] = [...activeDrawingPoints, [svgX, svgY]];
      setActiveDrawingPoints(updated);
      setIsDrawingActive(true);
    }
  };

  // تکمیل و نهایی‌سازی خط
  const handleFinishLine = () => {
    if (activeDrawingPoints.length < 2) return;

    const utmPoints: [number, number][] = activeDrawingPoints.map((pt) => svgToUtm(pt[0], pt[1]));
    const lengthM = calculateLineLengthM(utmPoints);

    const midIdx = Math.floor(activeDrawingPoints.length / 2);
    const midPt = activeDrawingPoints[midIdx];
    const pctX = Math.round((midPt[0] / CANVAS_WIDTH) * 100);
    const pctY = Math.round((midPt[1] / CANVAS_HEIGHT) * 100);
    const midUtm = utmPoints[midIdx];

    const percentagePoints: [number, number][] = activeDrawingPoints.map((pt) => [
      Math.round((pt[0] / CANVAS_WIDTH) * 100),
      Math.round((pt[1] / CANVAS_HEIGHT) * 100),
    ]);

    const lineTitle = `مسیر خطی به طول ${lengthM} متر در پله ${activeBench}`;
    const newLoc: TaskMapLocation = {
      type: 'LINE',
      bench: activeBench,
      zoneName: lineTitle,
      x: pctX,
      y: pctY,
      linePoints: percentagePoints,
      lengthM,
      areaM2: lengthM * 10,
      eastingUTM: Math.round(midUtm[0]),
      northingUTM: Math.round(midUtm[1]),
      elevation: parseInt(activeBench, 10) || 1040,
      mapId: activeSurveyMap?.id,
      mapTitle: activeSurveyMap?.title,
      comment: displayComment || `مسیر ترسیم شده شامل ${activeDrawingPoints.length} نقطه به طول ${lengthM} متر`,
      notes: displayComment || `مسیر به طول ${lengthM} متر`,
      utmCoords: utmPoints.map((p) => [Math.round(p[0]), Math.round(p[1])]),
    };

    setLocalTitle(lineTitle);
    setIsDrawingActive(false);
    onChange(newLoc);
  };

  // تکمیل و نهایی‌سازی چندضلعی (Polygon)
  const handleFinishPolygon = () => {
    if (activeDrawingPoints.length < 3) return;

    const utmPoints: [number, number][] = activeDrawingPoints.map((pt) => svgToUtm(pt[0], pt[1]));
    const areaM2 = calculatePolygonAreaM2(utmPoints);

    let sumX = 0;
    let sumY = 0;
    activeDrawingPoints.forEach((pt) => {
      sumX += pt[0];
      sumY += pt[1];
    });
    const avgX = sumX / activeDrawingPoints.length;
    const avgY = sumY / activeDrawingPoints.length;

    let sumUtmX = 0;
    let sumUtmY = 0;
    utmPoints.forEach((pt) => {
      sumUtmX += pt[0];
      sumUtmY += pt[1];
    });
    const avgUtmX = Math.round(sumUtmX / utmPoints.length);
    const avgUtmY = Math.round(sumUtmY / utmPoints.length);

    const percentagePoints: [number, number][] = activeDrawingPoints.map((pt) => [
      Math.round((pt[0] / CANVAS_WIDTH) * 100),
      Math.round((pt[1] / CANVAS_HEIGHT) * 100),
    ]);

    const polygonTitle = `محدوده ترسیمی به مساحت ${areaM2.toLocaleString()} م² (پله ${activeBench})`;
    const newLoc: TaskMapLocation = {
      type: 'POLYGON',
      bench: activeBench,
      zoneName: polygonTitle,
      x: Math.round((avgX / CANVAS_WIDTH) * 100),
      y: Math.round((avgY / CANVAS_HEIGHT) * 100),
      polygonPoints: percentagePoints,
      areaM2,
      eastingUTM: avgUtmX,
      northingUTM: avgUtmY,
      elevation: parseInt(activeBench, 10) || 1040,
      mapId: activeSurveyMap?.id,
      mapTitle: activeSurveyMap?.title,
      comment: displayComment || `محدوده ترسیم شده به مساحت ${areaM2.toLocaleString()} مترمربع با ${activeDrawingPoints.length} رأس`,
      notes: displayComment || `محدوده عملیاتی به مساحت ${areaM2.toLocaleString()} م²`,
      utmCoords: utmPoints.map((p) => [Math.round(p[0]), Math.round(p[1])]),
    };

    setLocalTitle(polygonTitle);
    setIsDrawingActive(false);
    onChange(newLoc);
  };

  // لغو آخرین نقطه
  const handleUndoPoint = () => {
    if (activeDrawingPoints.length > 0) {
      setActiveDrawingPoints((prev) => prev.slice(0, prev.length - 1));
    }
  };

  // پاک کردن کامل ترسیم و موقعیت
  const handleClear = () => {
    setActiveDrawingPoints([]);
    setIsDrawingActive(false);
    setLocalTitle('');
    setLocalComment('');
    onChange(undefined);
  };

  // انتخاب مستقیم بلوک یا ساب‌بلوک از عوارض نقشه
  const handleSelectBlockFeature = (block: MineMapBlock | MapFeature) => {
    const isMock = 'code' in block && 'gradeText' in block;
    const code = isMock ? block.code : block.properties?.code || block.name || 'بلوک معدنی';
    const bench = isMock ? block.bench : block.properties?.benchLevel?.toString() || activeBench;
    const gradeText = isMock ? block.gradeText : block.properties?.gradeType || `عیار آهن Fe ${block.properties?.feGrade || 58}%`;
    const area = isMock ? block.areaM2 : block.properties?.areaM2 || 1850;
    const easting = isMock ? block.eastingUTM : block.properties?.easting || 642400;
    const northing = isMock ? block.northingUTM : block.properties?.northing || 3584300;

    setActiveBench(bench);

    const blockTitle = `محدوده بلوک ${code} (${gradeText} - پله ${bench})`;
    const newLoc: TaskMapLocation = {
      type: 'BENCH_ZONE',
      bench,
      blockCode: code,
      blockId: block.id,
      zoneName: blockTitle,
      x: isMock ? block.center[0] : 50,
      y: isMock ? block.center[1] : 50,
      polygonPoints: isMock ? block.polygon : undefined,
      areaM2: area,
      eastingUTM: easting,
      northingUTM: northing,
      elevation: parseInt(bench, 10) || 1040,
      mapId: activeSurveyMap?.id,
      mapTitle: activeSurveyMap?.title,
      comment: displayComment || `محدوده استخراجی بلوک ${code} برگرفته از نقشه مرجع مهندسی`,
      notes: `تعیین شده به عنوان زون عملیاتی در بلوک ${code}`,
    };

    setLocalTitle(blockTitle);
    setActiveDrawingPoints([]);
    setIsDrawingActive(false);
    onChange(newLoc);
  };

  return (
    <div className="space-y-3 rounded-2xl border p-3.5 bg-[#0A1020] border-[#1E2E52] text-white shadow-xl select-none">
      {/* ۱. نوار وضعیت و انتخاب نقشه مرجع آپلود شده */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#0F172E] border border-cyan-500/30 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
          <span className="font-bold text-cyan-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>نقشه مرجع مبنا:</span>
          </span>

          {/* سلکتور تعویض نقشه میان نقشه‌های آپلود شده */}
          <div className="relative inline-block">
            <select
              value={activeSurveyMap?.id || ''}
              onChange={(e) => setSelectedMapId(e.target.value)}
              className="bg-[#14213F] text-white font-bold text-[11px] px-2.5 py-1 rounded-lg border border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              {allMaps.map((m, mIdx) => (
                <option key={`map-opt-${m.id}-${mIdx}`} value={m.id}>
                  {m.title} {m.isMasterMap ? '★ (نقشه مرجع فعال پیت)' : `(تراز ${m.benchLevel}m)`}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
            {activeSurveyMap?.coordinateSystem || 'UTM WGS84'} • تراز: {activeSurveyMap?.benchLevel || 1040}m
          </span>
        </div>

        {hasNewUpdateAlert && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>نقشه مرجع تازه منتشر شد</span>
          </div>
        )}
      </div>

      {/* ۲. نوار ابزارهای ترسیم (نقطه، خط، محدوده، انتخاب بلوک) و کنترل دید */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 pb-2 border-b border-[#1E2E52]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-black text-[#8E9EB8] flex items-center gap-1">
            <PenTool className="w-3.5 h-3.5 text-cyan-400" />
            <span>ابزار ترسیم روی نقشه:</span>
          </span>

          <div className="flex items-center gap-1 bg-[#101935] p-1 rounded-xl border border-[#24356B]">
            <button
              type="button"
              onClick={() => {
                setDrawingTool('POLYGON');
                setActiveDrawingPoints([]);
                setIsDrawingActive(false);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                drawingTool === 'POLYGON'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="ترسیم محدوده چندضلعی بسته (حداقل ۳ نقطه)"
            >
              <PenTool className="w-3 h-3" />
              <span>ترسیم محدوده (مساحت)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDrawingTool('LINE');
                setActiveDrawingPoints([]);
                setIsDrawingActive(false);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                drawingTool === 'LINE'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="رسم مسیر خطی (محاسبه طول به متر)"
            >
              <Slash className="w-3 h-3" />
              <span>رسم خط (طول/مسیر)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDrawingTool('POINT');
                setActiveDrawingPoints([]);
                setIsDrawingActive(false);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                drawingTool === 'POINT'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="نقطه‌گذاری آزاد روی نقشه با ثبت مختصات UTM"
            >
              <Crosshair className="w-3 h-3" />
              <span>نقطه‌گذاری</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDrawingTool('BLOCK_ZONE');
                setActiveDrawingPoints([]);
                setIsDrawingActive(false);
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                drawingTool === 'BLOCK_ZONE'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="انتخاب یکی از بلوک‌های نقشه مرجع"
            >
              <Square className="w-3 h-3" />
              <span>انتخاب بلوک</span>
            </button>
          </div>

          {/* اکشن‌های تکمیلی حین ترسیم */}
          {activeDrawingPoints.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUndoPoint}
                className="px-2 py-1 text-[10px] rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1"
                title="حذف آخرین نقطه"
              >
                <CornerUpLeft className="w-3 h-3" />
                <span>لغو نقطه ({activeDrawingPoints.length})</span>
              </button>

              {drawingTool === 'LINE' && activeDrawingPoints.length >= 2 && (
                <button
                  type="button"
                  onClick={handleFinishLine}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1 animate-bounce"
                >
                  <Check className="w-3 h-3" />
                  <span>تکمیل خط</span>
                </button>
              )}

              {drawingTool === 'POLYGON' && activeDrawingPoints.length >= 3 && (
                <button
                  type="button"
                  onClick={handleFinishPolygon}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1 animate-bounce"
                >
                  <Check className="w-3 h-3" />
                  <span>بستن محدوده</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* تراز پله، زوم و پاک کردن */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1">
            <span className="text-[10px] text-slate-400">تراز:</span>
            {BENCHES.map((b, bIdx) => (
              <button
                key={`bench-${b.level}-${bIdx}`}
                type="button"
                onClick={() => {
                  setActiveBench(b.level);
                  if (onBenchSelect) onBenchSelect(b.level);
                }}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded border transition-all ${
                  activeBench === b.level
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {b.level}m
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 bg-[#101935] p-0.5 rounded-lg border border-[#24356B]">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              className="p-1 text-slate-400 hover:text-white"
              title="بزرگنمایی"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.8, z - 0.25))}
              className="p-1 text-slate-400 hover:text-white"
              title="کوچکنمایی"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-1 text-[10px] font-mono text-slate-400 hover:text-white px-1"
              title="بازنشانی زوم"
            >
              {Math.round(zoom * 100)}%
            </button>
          </div>

          {(value || activeDrawingPoints.length > 0) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-1 text-[10px] rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1"
              title="پاک کردن ترسیم و انتخاب جدید"
            >
              <Trash2 className="w-3 h-3" />
              <span>پاک‌کردن</span>
            </button>
          )}
        </div>
      </div>

      {/* راهنمای ابزار جاری */}
      <div className="px-3 py-1.5 rounded-lg bg-[#0E172E]/60 border border-[#223366]/40 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span>
            {drawingTool === 'POLYGON' && (
              isDrawingActive
                ? `در حال ترسیم چندضلعی: روی نقشه کلیک کنید تا رأس‌های محدوده مشخص شوند (${activeDrawingPoints.length} رأس ثبت شد). برای بستن محدوده دکمه «بستن محدوده» را بزنید.`
                : 'حالت ترسیم محدوده فعال است: برای تعیین منطقه، محدوده انفجار یا پترن چال‌ها روی نقشه کلیک کنید.'
            )}
            {drawingTool === 'LINE' && (
              isDrawingActive
                ? `در حال رسم خط: روی نقشه کلیک کنید تا مسیر خط امتداد یابد (${activeDrawingPoints.length} نقطه). برای ثبت «تکمیل خط» را بزنید.`
                : 'حالت رسم خط فعال است: برای تعیین مسیر رمپ، جاده یا ترانشه روی نقشه کلیک کنید.'
            )}
            {drawingTool === 'POINT' && 'حالت نقطه‌گذاری فعال است: روی هر نقطه از نقشه کلیک کنید تا پین تسک ثبت شود.'}
            {drawingTool === 'BLOCK_ZONE' && 'روی یکی از بلوک‌های استخراجی نقشه کلیک کنید تا کل محدوده آن به تسک اختصاص یابد.'}
          </span>
        </div>

        {mouseUtm && (
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-cyan-300/80 bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-500/20">
            <span>E: {mouseUtm.x}</span>
            <span>N: {mouseUtm.y}</span>
          </div>
        )}
      </div>

      {/* ۳. بوم نقشه مرجع مهندسی (Canvas / SVG Stage) */}
      <div
        ref={containerRef}
        className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden border border-[#24356B] bg-[#070C18] select-none shadow-inner"
        style={{ cursor: drawingTool === 'BLOCK_ZONE' ? 'pointer' : 'crosshair' }}
      >
        <svg
          ref={mapSvgRef}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="w-full h-full transition-transform duration-150 ease-out"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          onClick={handleSvgClick}
          onMouseMove={handleMouseMove}
        >
          <defs>
            <pattern id="taskCadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(36, 53, 107, 0.35)" strokeWidth="0.8" />
            </pattern>
            <pattern id="taskCadSubGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(36, 53, 107, 0.15)" strokeWidth="0.4" />
            </pattern>
            <filter id="taskPinGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00D2FF" floodOpacity="0.6" />
            </filter>
          </defs>

          <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#070D1A" />
          <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#taskCadSubGrid)" />
          <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#taskCadGrid)" />

          {/* الف: تصویر رستری نقشه مرجع آپلود شده */}
          {activeSurveyMap?.rasterImageUrl && (
            <image
              href={activeSurveyMap.rasterImageUrl}
              x={offsetX}
              y={offsetY}
              width={drawnWidth}
              height={drawnHeight}
              opacity={0.88}
              preserveAspectRatio="none"
            />
          )}

          {/* ب: کادر نقشه مرجع */}
          <rect
            x={offsetX}
            y={offsetY}
            width={drawnWidth}
            height={drawnHeight}
            fill="none"
            stroke="rgba(0, 210, 255, 0.3)"
            strokeWidth="1.5"
            strokeDasharray="6,4"
          />

          <g className="text-[10px] font-mono fill-slate-400 pointer-events-none select-none opacity-75">
            <text x={offsetX + 6} y={offsetY + 16}>
              UTM: {mapBounds.minX.toFixed(0)}E / {mapBounds.maxY.toFixed(0)}N
            </text>
            <text x={offsetX + drawnWidth - 6} y={offsetY + drawnHeight - 8} textAnchor="end">
              UTM: {mapBounds.maxX.toFixed(0)}E / {mapBounds.minY.toFixed(0)}N
            </text>
          </g>

          {/* ج: رندر عوارض وکتوری نقشه مرجع آپلود شده */}
          {activeSurveyMap?.features && activeSurveyMap.features.length > 0 ? (
            activeSurveyMap.features.map((feature: MapFeature, idx: number) => {
              const coords = feature.coordinates || [];
              if (!Array.isArray(coords) || coords.length === 0) return null;
              const fKey = `feat-${activeSurveyMap.id || 'map'}-${feature.id || 'f'}-${idx}`;

              if (feature.type === 'POLYGON' && coords.length >= 3) {
                const pointsStr = coords
                  .map((pt: [number, number] | number[]) => {
                    const [sx, sy] = utmToSvg(Number(pt[0]), Number(pt[1]));
                    return `${sx.toFixed(1)},${sy.toFixed(1)}`;
                  })
                  .join(' ');

                const isSelected =
                  value?.blockId === feature.id ||
                  (value?.blockCode && feature.properties?.code === value.blockCode);

                return (
                  <polygon
                    key={fKey}
                    points={pointsStr}
                    fill={isSelected ? 'rgba(0, 210, 255, 0.4)' : feature.style?.fillColor || '#38BDF8'}
                    fillOpacity={isSelected ? 0.45 : feature.style?.fillOpacity ?? 0.18}
                    stroke={isSelected ? '#00D2FF' : feature.style?.strokeColor || '#38BDF8'}
                    strokeWidth={isSelected ? 2.5 : feature.style?.strokeWidth || 1.2}
                    strokeDasharray={feature.style?.strokeDash === 'dashed' ? '5,4' : undefined}
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={(e) => {
                      if (drawingTool === 'BLOCK_ZONE') {
                        e.stopPropagation();
                        handleSelectBlockFeature(feature);
                      }
                    }}
                    onMouseEnter={() => setHoveredBlock(feature)}
                    onMouseLeave={() => setHoveredBlock(null)}
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

                const isCrest = feature.category === 'BENCH_CREST';
                const isToe = feature.category === 'BENCH_TOE';
                const isRoad = feature.category === 'HAUL_ROAD';
                const defStroke = isCrest ? '#00D4FF' : isToe ? '#38BDF8' : isRoad ? '#F59E0B' : '#64748B';

                return (
                  <path
                    key={fKey}
                    d={pathData}
                    fill="none"
                    stroke={feature.style?.strokeColor || defStroke}
                    strokeWidth={feature.style?.strokeWidth || (isRoad ? 3 : isCrest ? 2 : 1.2)}
                    strokeDasharray={isToe ? '5,4' : undefined}
                    strokeOpacity={0.7}
                  />
                );
              }

              if (feature.type === 'POINT' && coords[0]) {
                const [sx, sy] = utmToSvg(Number(coords[0][0]), Number(coords[0][1]));
                return (
                  <circle
                    key={fKey}
                    cx={sx}
                    cy={sy}
                    r={3.5}
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    opacity={0.8}
                  />
                );
              }

              return null;
            })
          ) : (
            <g>
              {MINE_MAP_BLOCKS.map((block, bIdx) => {
                const isSelected = value?.blockCode === block.code || value?.blockId === block.id;
                const pointsStr = block.polygon
                  .map((pt) => `${((pt[0] / 100) * CANVAS_WIDTH).toFixed(1)},${((pt[1] / 100) * CANVAS_HEIGHT).toFixed(1)}`)
                  .join(' ');

                return (
                  <polygon
                    key={`mine-block-${block.id}-${bIdx}`}
                    points={pointsStr}
                    fill={isSelected ? 'rgba(0, 210, 255, 0.35)' : 'rgba(56, 189, 248, 0.15)'}
                    stroke={isSelected ? '#00D2FF' : '#38BDF8'}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={(e) => {
                      if (drawingTool === 'BLOCK_ZONE') {
                        e.stopPropagation();
                        handleSelectBlockFeature(block);
                      }
                    }}
                    onMouseEnter={() => setHoveredBlock(block)}
                    onMouseLeave={() => setHoveredBlock(null)}
                  />
                );
              })}
            </g>
          )}

          {/* د: ترسیم زنده کاربر (Live Drawing Preview) */}
          {activeDrawingPoints.length > 0 && (
            <g className="pointer-events-none">
              {drawingTool === 'LINE' && activeDrawingPoints.length >= 2 && (
                <polyline
                  points={activeDrawingPoints.map((pt) => `${pt[0]},${pt[1]}`).join(' ')}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                />
              )}

              {drawingTool === 'POLYGON' && (
                <polygon
                  points={activeDrawingPoints.map((pt) => `${pt[0]},${pt[1]}`).join(' ')}
                  fill="rgba(0, 210, 255, 0.25)"
                  stroke="#00D2FF"
                  strokeWidth="2.5"
                  strokeDasharray="5,3"
                />
              )}

              {activeDrawingPoints.map((pt, pIdx) => (
                <g key={`draw-pt-${pIdx}`}>
                  <circle cx={pt[0]} cy={pt[1]} r={6} fill="#00D2FF" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx={pt[0]} cy={pt[1]} r={12} fill="none" stroke="#00D2FF" strokeWidth="1" opacity="0.4" />
                </g>
              ))}
            </g>
          )}

          {/* ه: شکل نهایی ثبت شده موقعیت تسک */}
          {value && (
            <g className="pointer-events-none">
              {value.polygonPoints && value.polygonPoints.length >= 3 && (
                <polygon
                  points={value.polygonPoints
                    .map((pt) => `${((pt[0] / 100) * CANVAS_WIDTH).toFixed(1)},${((pt[1] / 100) * CANVAS_HEIGHT).toFixed(1)}`)
                    .join(' ')}
                  fill="rgba(0, 210, 255, 0.35)"
                  stroke="#00D2FF"
                  strokeWidth="3"
                />
              )}

              {value.linePoints && value.linePoints.length >= 2 && (
                <polyline
                  points={value.linePoints
                    .map((pt) => `${((pt[0] / 100) * CANVAS_WIDTH).toFixed(1)},${((pt[1] / 100) * CANVAS_HEIGHT).toFixed(1)}`)
                    .join(' ')}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* پین مارکر و برچسب */}
              {(() => {
                const cx = (value.x / 100) * CANVAS_WIDTH;
                const cy = (value.y / 100) * CANVAS_HEIGHT;
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
                        filter="url(#taskPinGlow)"
                      />
                      <circle cx="14" cy="14" r="5" fill="#0A1020" />
                    </g>

                    <g transform="translate(20, -18)">
                      <rect
                        x="0"
                        y="-12"
                        width={Math.max(120, (value.blockCode || value.zoneName || 'موقعیت تسک').length * 8 + 20)}
                        height="24"
                        rx="6"
                        fill="#0A1020"
                        stroke="#00D2FF"
                        strokeWidth="1.5"
                        opacity="0.95"
                      />
                      <text x="10" y="4" fill="#00D2FF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                        {value.blockCode ? `بلوک ${value.blockCode}` : value.zoneName || 'موقعیت تسک'}
                      </text>
                    </g>
                  </g>
                );
              })()}
            </g>
          )}
        </svg>

        {/* قطب‌نما */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0E172E]/90 border border-[#24356B] text-[10px] font-bold text-[#8E9EB8] pointer-events-none backdrop-blur-sm shadow-md">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>شمال N</span>
        </div>

        {/* تراز پله */}
        <div className="absolute top-2.5 left-3 pointer-events-none text-[10px] font-mono text-cyan-400/80 bg-[#0E172E]/80 px-2 py-0.5 rounded border border-[#24356B]">
          BENCH {activeSurveyMap?.benchLevel || activeBench}m
        </div>

        {/* هاور روی عوارض */}
        {hoveredBlock && (
          <div className="absolute bottom-2 left-2 p-2 rounded-xl bg-[#0F172E]/95 border border-cyan-500/50 text-white text-[11px] shadow-2xl backdrop-blur-md pointer-events-none z-30">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {'code' in hoveredBlock ? (
                  <BlockCodeDisplay code={hoveredBlock.code} prefix="بلوک" className="text-cyan-300 font-bold" />
                ) : (
                  hoveredBlock.name || 'عارضه نقشه مرجع'
                )}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 mt-0.5">برای انتخاب این محدوده به عنوان زون تسک کلیک کنید.</p>
          </div>
        )}
      </div>

      {/* ۴. بخش کامنت‌گذاری، یادداشت فنی و جزئیات هندسی عارضه ترسیم‌شده */}
      {value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-[#0F172E] border border-cyan-500/40 space-y-3"
        >
          <div className="flex items-center justify-between border-b border-[#24356B]/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>کامنت‌گذاری و یادداشت فنی عارضه ترسیم‌شده</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                    {value.type === 'POLYGON' ? 'محدوده چندضلعی' : value.type === 'LINE' ? 'مسیر خطی' : value.type === 'POINT' ? 'نقطه پایش' : 'بلوک استخراجی'}
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">این یادداشت بر روی موقعیت مکانی نقشه ثبت و در ارجاع تسک به واحد درج می‌گردد.</p>
              </div>
            </div>

            {/* مشخصات هندسی محاسبه شده */}
            <div className="flex items-center gap-2 font-mono text-[10px] text-cyan-300">
              {value.areaM2 && (
                <span className="bg-[#14213F] px-2 py-1 rounded border border-cyan-500/30">
                  مساحت: {value.areaM2.toLocaleString()} م²
                </span>
              )}
              {value.lengthM && (
                <span className="bg-[#14213F] px-2 py-1 rounded border-amber-500/40 text-amber-300">
                  طول مسیر: {value.lengthM.toLocaleString()} متر
                </span>
              )}
              {value.eastingUTM && (
                <span className="hidden sm:inline bg-[#14213F] px-2 py-1 rounded border border-slate-700 text-slate-300">
                  UTM: {value.eastingUTM}E / {value.northingUTM}N
                </span>
              )}
            </div>
          </div>

          {/* فرم ثبت کامنت و عنوان عارضه */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                برچسب / عنوان عارضه:
              </label>
              <input
                type="text"
                value={displayTitle}
                onChange={(e) => handleUpdateComment(displayComment, e.target.value)}
                placeholder="مثلاً: محدوده چال‌های ترانشه شرقی"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#070D1A] border border-[#24356B] text-white focus:outline-none focus:border-cyan-400 font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>کامنت، دستورالعمل فنی و ملاحظات مکانی:</span>
                {onApplyCommentToDescription && (
                  <button
                    type="button"
                    onClick={handleApplyToTaskDescription}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>{commentCopiedFeedback ? 'به شرح تسک اضافه شد ✓' : 'درج خودکار در شرح کلی تسک'}</span>
                  </button>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayComment}
                  onChange={(e) => handleUpdateComment(e.target.value)}
                  placeholder="دستور کار ویژه این عارضه (مثلاً: شیارزنی و رگلاژ قبل از ورود شاول، بررسی پایداری شیب...)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[#070D1A] border border-[#24356B] text-white focus:outline-none focus:border-cyan-400 font-medium"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TaskInteractiveMapSelector;
