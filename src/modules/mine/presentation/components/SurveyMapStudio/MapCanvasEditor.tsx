// src/modules/mine/presentation/components/SurveyMapStudio/MapCanvasEditor.tsx

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { SurveyMap, MapFeature } from '../../../../../core/domain/types/survey-map.types';
import type { StakeholderRole } from '../../../../../core/domain/types';
import { SurveyMapService } from '../../../services/SurveyMapService';
import { SurveyPermissionService } from '../../../services/SurveyPermissionService';
import type { DisplayOverlaySettings } from './MapLayersControlPanel';
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  PencilSquareIcon,
  TrashIcon,
  Square2StackIcon,
  SparklesIcon,
  ViewfinderCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

export type ActiveToolType = 
  | 'SELECT' 
  | 'INSPECT'
  | 'PAN' 
  | 'POLYGON' 
  | 'POLYLINE' 
  | 'POINT' 
  | 'DRILLING_BAND'
  | 'GEOLOGY_ROCK_BAND'
  | 'GEOLOGY_FAULT'
  | 'MEASURE' 
  | 'ANNOTATION';

export type CadRenderMode = 'SHADED' | 'WIREFRAME' | 'TRANSLUCENT';
export type StrokeWeightMode = 'FINE' | 'REGULAR' | 'BOLD';

// توابع هندسی با کارایی فوق‌العاده بالا جهت Hit-Testing هوشمند و انتخاب نرم در تمام زوم‌ها
function isPointInPolygon(point: [number, number], vs: [number, number][]): boolean {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function distToSegmentSquared(p: [number, number], v: [number, number], w: [number, number]): number {
  const l2 = (v[0] - w[0]) ** 2 + (v[1] - w[1]) ** 2;
  if (l2 === 0) return (p[0] - v[0]) ** 2 + (p[1] - v[1]) ** 2;
  let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return (p[0] - (v[0] + t * (w[0] - v[0]))) ** 2 + (p[1] - (v[1] + t * (w[1] - v[1]))) ** 2;
}

function distToSegment(p: [number, number], v: [number, number], w: [number, number]): number {
  return Math.sqrt(distToSegmentSquared(p, v, w));
}

interface MapCanvasEditorProps {
  map: SurveyMap;
  activeRole: StakeholderRole;
  userName: string;
  activeTool: ActiveToolType | string;
  selectedFeatureId: string | null;
  displaySettings: DisplayOverlaySettings;
  onSelectFeature: (feature: MapFeature | null) => void;
  onFeatureCreated?: () => void;
  onEditFeatureRequest: (feature: MapFeature) => void;
  onDeleteFeatureRequest?: (feature: MapFeature) => void;
  onMapUpdated: () => void;
  onOpenLayersPanel?: () => void;
}

export const MapCanvasEditor: React.FC<MapCanvasEditorProps> = ({
  map,
  activeRole,
  userName,
  activeTool,
  selectedFeatureId,
  displaySettings,
  onSelectFeature,
  onFeatureCreated,
  onEditFeatureRequest,
  onDeleteFeatureRequest,
  onMapUpdated,
  onOpenLayersPanel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // وضعیت Pan و Zoom بوم CAD
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const zoomRef = useRef<number>(zoom);
  const panRef = useRef<{ x: number; y: number }>(pan);

  // همگام‌سازی مراجع برای جلوگیری از Race Conditions در رویدادهای سریع
  zoomRef.current = zoom;
  panRef.current = pan;

  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [showZoomMenu, setShowZoomMenu] = useState<boolean>(false);
  const [showDisplayModeMenu, setShowDisplayModeMenu] = useState<boolean>(false);

  // حالت‌های نمایش و کنترل ضخامت خطوط CAD
  const [renderMode, setRenderMode] = useState<CadRenderMode>('TRANSLUCENT');
  const [strokeWeight, setStrokeWeight] = useState<StrokeWeightMode>('REGULAR');
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);

  // مراجع نگهداری وضعیت درگ و کلیک چپ ماوس جهت Pan بدون تأخیر و بدون تداخل با کلیک
  const isPointerDownRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerDownTimeRef = useRef<number>(0);
  const totalDragDistanceRef = useRef<number>(0);
  const lastPanPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedEnoughToPanRef = useRef<boolean>(false);

  // نقاط در حال ترسیم (برای پلی‌گان، خط یا اندازه‌گیری)
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  // سابقه نقاط واگرد شده جهت Redo در زمان ترسیم
  const [drawingRedoPoints, setDrawingRedoPoints] = useState<[number, number][]>([]);
  
  const drawingPointsRef = useRef<[number, number][]>(drawingPoints);
  const drawingRedoPointsRef = useRef<[number, number][]>(drawingRedoPoints);
  drawingPointsRef.current = drawingPoints;
  drawingRedoPointsRef.current = drawingRedoPoints;

  const activeToolRef = useRef<ActiveToolType>(activeTool);
  activeToolRef.current = activeTool;

  const finalizeDrawingRef = useRef<() => void>(() => {});
  const cancelDrawingRef = useRef<() => void>(() => {});
  const undoDrawingPointRef = useRef<() => void>(() => {});
  const redoDrawingPointRef = useRef<() => void>(() => {});

  const [measureResults, setMeasureResults] = useState<{ distance: number; area?: number } | null>(null);
  // پنجره راهنمای میانبرهای کیبورد CAD
  const [showShortcutsHelp, setShowShortcutsHelp] = useState<boolean>(false);

  // مختصات لحظه‌ای نشانگر ماوس
  const [cursorCoords, setCursorCoords] = useState<{ utmX: number; utmY: number; z: number }>({
    utmX: 584400,
    utmY: 3513000,
    z: map.benchLevel
  });

  // بررسی دسترسی ویرایش
  const canEdit = useMemo(() => {
    return SurveyPermissionService.canEdit(activeRole);
  }, [activeRole]);

  // ابعاد واید بوم SVG
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;
  const PADDING = 40;

  // محدوده و ابعاد نقشه (محاسبه هوشمند بر اساس عوارض و نگهداری دقت اعشاری)
  const bounds = useMemo(() => {
    if (map.features && map.features.length > 0) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      let hasValid = false;
      map.features.forEach(f => {
        f.coordinates?.forEach(([x, y]) => {
          if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
            hasValid = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        });
      });
      if (hasValid && minX !== Infinity && maxX > minX && maxY > minY) {
        const dx = maxX - minX;
        const dy = maxY - minY;
        const padX = Math.max(dx * 0.06, 0.0001);
        const padY = Math.max(dy * 0.06, 0.0001);
        return {
          minX: minX - padX,
          maxX: maxX + padX,
          minY: minY - padY,
          maxY: maxY + padY
        };
      } else if (hasValid && minX !== Infinity) {
        const pad = minX < 180 ? 0.005 : 50;
        return {
          minX: minX - pad,
          maxX: maxX + pad,
          minY: minY - pad,
          maxY: maxY + pad
        };
      }
    }

    if (map.bounds && map.bounds.maxX > map.bounds.minX && map.bounds.maxY > map.bounds.minY) {
      return map.bounds;
    }

    return {
      minX: 584100,
      maxX: 584750,
      minY: 3512700,
      maxY: 3513400
    };
  }, [map]);

  const isDegreeCoords = useMemo(() => {
    return Math.abs(bounds.maxX) <= 180 && Math.abs(bounds.maxY) <= 90 && Math.abs(bounds.maxX - bounds.minX) < 1.0;
  }, [bounds]);

  const mapWidth = Math.max(0.00001, bounds.maxX - bounds.minX);
  const mapHeight = Math.max(0.00001, bounds.maxY - bounds.minY);

  const availableWidth = CANVAS_WIDTH - 2 * PADDING;
  const availableHeight = CANVAS_HEIGHT - 2 * PADDING;

  // مقیاس یکنواخت همسانگرد (Isotropic Scale): بدون هیچ‌گونه کشیدگی یا دفورمگی در نقشه
  const uniformScale = useMemo(() => {
    return Math.min(availableWidth / mapWidth, availableHeight / mapHeight);
  }, [availableWidth, availableHeight, mapWidth, mapHeight]);

  const drawnWidth = mapWidth * uniformScale;
  const drawnHeight = mapHeight * uniformScale;

  // مرکز قراردادن دقیق نقشه در بوم بدون تغییر نسبت ابعاد
  const offsetX = PADDING + (availableWidth - drawnWidth) / 2;
  const offsetY = PADDING + (availableHeight - drawnHeight) / 2;

  const svgViewBox = `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`;

  // تبدیل مختصات UTM / درجه به مختصات دید پایه SVG
  const utmToSvg = useCallback((x: number, y: number): [number, number] => {
    const svgX = offsetX + (x - bounds.minX) * uniformScale;
    const svgY = offsetY + (bounds.maxY - y) * uniformScale; // معکوس Y در سیستم استاندارد کارتوگرافی
    return [svgX, svgY];
  }, [bounds, uniformScale, offsetX, offsetY]);

  // تبدیل مختصات دید پایه SVG به مختصات واقعی نقشه
  const svgToUtm = useCallback((svgX: number, svgY: number): [number, number] => {
    const rawX = bounds.minX + (svgX - offsetX) / uniformScale;
    const rawY = bounds.maxY - (svgY - offsetY) / uniformScale;
    if (isDegreeCoords) {
      return [Number(rawX.toFixed(6)), Number(rawY.toFixed(6))];
    }
    return [Math.round(rawX), Math.round(rawY)];
  }, [bounds, uniformScale, offsetX, offsetY, isDegreeCoords]);

  // تبدیل دقیق مختصات پیکسل صفحه نمایش به مختصات فضای داخلی SVG با احتساب Zoom و Pan
  const getSvgCoordinates = useCallback((clientX: number, clientY: number): [number, number] => {
    const svgEl = svgRef.current;
    if (!svgEl) return [0, 0];

    let baseSvgX = CANVAS_WIDTH / 2;
    let baseSvgY = CANVAS_HEIGHT / 2;

    const ctm = svgEl.getScreenCTM();
    if (ctm) {
      const pt = svgEl.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const svgP = pt.matrixTransform(ctm.inverse());
      baseSvgX = svgP.x;
      baseSvgY = svgP.y;
    } else {
      const rect = svgEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return [0, 0];
      baseSvgX = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      baseSvgY = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    }

    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;
    const curZoom = zoomRef.current;
    const curPan = panRef.current;

    // اعمال تبدیل معکوس نسبت به مرکز بوم
    const svgX = cx + (baseSvgX - cx - curPan.x) / curZoom;
    const svgY = cy + (baseSvgY - cy - curPan.y) / curZoom;
    return [svgX, svgY];
  }, []);

  // بازنشانی پیش‌فرض نقشه به حالت تمام‌نما (Zoom to Extents)
  const zoomToExtents = useCallback(() => {
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // اجرای زوم اکستند در زمان تغییر نقشه
  useEffect(() => {
    zoomToExtents();
    setDrawingPoints([]);
    setMeasureResults(null);
  }, [map.id, zoomToExtents]);

  // فعال‌سازی زوم روی عارضه انتخابی
  const zoomToFeature = useCallback((feature: MapFeature) => {
    if (!feature.coordinates || feature.coordinates.length === 0) return;
    const avgX = feature.coordinates.reduce((s, p) => s + p[0], 0) / feature.coordinates.length;
    const avgY = feature.coordinates.reduce((s, p) => s + p[1], 0) / feature.coordinates.length;
    const [targetSvgX, targetSvgY] = utmToSvg(avgX, avgY);
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;
    const targetZoom = 3.5;

    const newPan = {
      x: -(targetSvgX - cx) * targetZoom,
      y: -(targetSvgY - cy) * targetZoom
    };

    zoomRef.current = targetZoom;
    panRef.current = newPan;
    setZoom(targetZoom);
    setPan(newPan);
  }, [utmToSvg]);

  // زوم مرحله‌ای از مرکز
  const handleZoomStep = (factor: number) => {
    const curZoom = zoomRef.current;
    const curPan = panRef.current;
    const nextZoom = Math.min(Math.max(curZoom * factor, 0.02), 120);
    const ratio = nextZoom / curZoom;
    const newPan = {
      x: curPan.x * ratio,
      y: curPan.y * ratio
    };
    zoomRef.current = nextZoom;
    panRef.current = newPan;
    setZoom(nextZoom);
    setPan(newPan);
  };

  // تنظیم زوم به مقادیر پیش‌فرض
  const handleSetZoomPreset = (targetZoom: number) => {
    if (targetZoom === 1) {
      zoomToExtents();
    } else {
      const curZoom = zoomRef.current;
      const curPan = panRef.current;
      const ratio = targetZoom / curZoom;
      const newPan = {
        x: curPan.x * ratio,
        y: curPan.y * ratio
      };
      zoomRef.current = targetZoom;
      panRef.current = newPan;
      setZoom(targetZoom);
      setPan(newPan);
    }
    setShowZoomMenu(false);
  };

  // شنودگر رویداد اسکرول ماوس (Mouse Wheel Zoom) متمرکز بر موقعیت نشانگر ماوس
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const svgEl = svgRef.current;
      if (!svgEl) return;

      let baseSvgX = CANVAS_WIDTH / 2;
      let baseSvgY = CANVAS_HEIGHT / 2;

      const ctm = svgEl.getScreenCTM();
      if (ctm) {
        const pt = svgEl.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(ctm.inverse());
        baseSvgX = svgP.x;
        baseSvgY = svgP.y;
      } else {
        const rect = svgEl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        baseSvgX = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
        baseSvgY = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
      }

      const cx = CANVAS_WIDTH / 2;
      const cy = CANVAS_HEIGHT / 2;
      const curZoom = zoomRef.current;
      const curPan = panRef.current;

      // محاسبه ضریب زوم نرم و پیوسته مانند AutoCAD
      const zoomFactor = Math.exp(-e.deltaY * 0.002);
      const nextZoom = Math.min(Math.max(curZoom * zoomFactor, 0.02), 120);

      if (Math.abs(nextZoom - curZoom) < 0.00001) return;

      const ratio = nextZoom / curZoom;

      // فرمول پایدار و دقیق هندسی اتوکد: نقطه زیر نشانگر ماوس در حین زوم کاملاً ثابت می‌ماند
      const newPanX = curPan.x * ratio + (baseSvgX - cx) * (1 - ratio);
      const newPanY = curPan.y * ratio + (baseSvgY - cy) * (1 - ratio);

      zoomRef.current = nextZoom;
      panRef.current = { x: newPanX, y: newPanY };

      setZoom(nextZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, []);

  // واگرد آخرین نقطه ثبت شده در حین ترسیم (Undo Vertex)
  const undoDrawingPoint = useCallback(() => {
    setDrawingPoints(prev => {
      if (prev.length === 0) return prev;
      const lastPoint = prev[prev.length - 1];
      setDrawingRedoPoints(redo => [...redo, lastPoint]);
      const nextPoints = prev.slice(0, prev.length - 1);
      
      if (activeTool === 'MEASURE') {
        if (nextPoints.length >= 2) {
          const lengthCalc = SurveyMapService.calculateLength(nextPoints);
          const areaCalc = nextPoints.length >= 3 ? SurveyMapService.calculateArea(nextPoints) : undefined;
          setMeasureResults({
            distance: lengthCalc,
            area: areaCalc?.areaM2
          });
        } else {
          setMeasureResults(null);
        }
      }
      return nextPoints;
    });
  }, [activeTool]);

  // اعمال مجدد نقطه واگرد شده (Redo Vertex)
  const redoDrawingPoint = useCallback(() => {
    setDrawingRedoPoints(redo => {
      if (redo.length === 0) return redo;
      const pointToRestore = redo[redo.length - 1];
      setDrawingPoints(prev => {
        const nextPoints = [...prev, pointToRestore];
        if (activeTool === 'MEASURE' && nextPoints.length >= 2) {
          const lengthCalc = SurveyMapService.calculateLength(nextPoints);
          const areaCalc = nextPoints.length >= 3 ? SurveyMapService.calculateArea(nextPoints) : undefined;
          setMeasureResults({
            distance: lengthCalc,
            area: areaCalc?.areaM2
          });
        }
        return nextPoints;
      });
      return redo.slice(0, redo.length - 1);
    });
  }, [activeTool]);

  // لغو کامل ترسیم جاری (Cancel Drawing)
  const cancelDrawing = useCallback(() => {
    drawingPointsRef.current = [];
    drawingRedoPointsRef.current = [];
    setDrawingPoints([]);
    setDrawingRedoPoints([]);
    setMeasureResults(null);
  }, []);

  // نهایی کردن ترسیم جاری و ثبت رسمی المان (از طریق کلید Enter یا دابل‌کلیک یا دکمه HUD)
  const finalizeDrawing = useCallback(() => {
    const rawPoints = drawingPointsRef.current;
    if (!rawPoints || rawPoints.length === 0) return;

    // حذف نقاط تکراری مجاور (به‌ویژه ناشی از دابل‌کلیک ماوس در یک مختصات)
    const currentPoints: [number, number][] = [];
    for (let i = 0; i < rawPoints.length; i++) {
      if (i === 0) {
        currentPoints.push(rawPoints[i]);
      } else {
        const prev = currentPoints[currentPoints.length - 1];
        const cur = rawPoints[i];
        const dist = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
        if (dist > 0.05) {
          currentPoints.push(cur);
        }
      }
    }

    const currentTool = activeToolRef.current;

    // ۱. ترسیم باند حفاری واحد حفاری
    if (currentTool === 'DRILLING_BAND') {
      if (currentPoints.length < 3) {
        return;
      }
      const areaCalc = SurveyMapService.calculateArea(currentPoints);
      const bandCode = `DB-${map.benchLevel}-${String.fromCharCode(65 + ((map.features?.filter(f => f.category === 'DRILLING_BAND').length || 0) % 26))}`;
      const created = SurveyMapService.addFeature(
        map.id,
        {
          layerId: 'layer-drilling-bands',
          name: `باند حفاری ${map.benchLevel} (${bandCode})`,
          type: 'POLYGON',
          category: 'DRILLING_BAND',
          unit: 'DRILLING',
          coordinates: currentPoints,
          elevation: map.benchLevel,
          properties: {
            code: bandCode,
            areaM2: areaCalc.areaM2,
            plannedHoles: Math.round(areaCalc.areaM2 / 24),
            drillRig: 'دریل واگن سندویک DX800',
            patternSpacing: '3.5m × 4.0m',
            notes: `ترسیم شده توسط واحد حفاری (${userName})`
          },
          style: {
            strokeColor: '#F97316',
            fillColor: '#F97316',
            fillOpacity: 0.3,
            strokeWidth: 2.2,
            strokeDash: 'dashed'
          },
          createdBy: userName,
          createdRole: activeRole
        },
        activeRole,
        userName
      );
      if (created) {
        if (!map.features) map.features = [];
        if (!map.features.some(f => f.id === created.id)) map.features.push(created);
        onSelectFeature(created);
      }
      drawingPointsRef.current = [];
      drawingRedoPointsRef.current = [];
      setDrawingPoints([]);
      setDrawingRedoPoints([]);
      onMapUpdated();
      if (onFeatureCreated) onFeatureCreated();
      return;
    }

    // ۲. ترسیم باند جنس سنگ واحد زمین‌شناسی
    if (currentTool === 'GEOLOGY_ROCK_BAND') {
      if (currentPoints.length < 3) {
        return;
      }
      const areaCalc = SurveyMapService.calculateArea(currentPoints);
      const rockName = 'مگنتیت پرعیار (Fe 62%)';
      
      const created = SurveyMapService.addFeature(
        map.id,
        {
          layerId: 'layer-geology-rock',
          name: `باند زمین‌شناسی: ${rockName}`,
          type: 'POLYGON',
          category: 'GEOLOGY_ROCK_BAND',
          unit: 'GEOLOGY',
          coordinates: currentPoints,
          elevation: map.benchLevel,
          properties: {
            code: `GEO-${Date.now().toString().slice(-4)}`,
            rockType: rockName,
            areaM2: areaCalc.areaM2,
            feGrade: 61.5,
            density: 3.85,
            notes: `مدل‌سازی لیتولوژی توسط زمین‌شناسی (${userName})`
          },
          style: {
            strokeColor: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.28,
            strokeWidth: 2
          },
          createdBy: userName,
          createdRole: activeRole
        },
        activeRole,
        userName
      );
      if (created) {
        if (!map.features) map.features = [];
        if (!map.features.some(f => f.id === created.id)) map.features.push(created);
        onSelectFeature(created);
      }
      drawingPointsRef.current = [];
      drawingRedoPointsRef.current = [];
      setDrawingPoints([]);
      setDrawingRedoPoints([]);
      onMapUpdated();
      if (onFeatureCreated) onFeatureCreated();
      return;
    }

    // ۳. ترسیم خط گسل واحد زمین‌شناسی
    if (currentTool === 'GEOLOGY_FAULT') {
      if (currentPoints.length < 2) {
        return;
      }
      const lengthM = SurveyMapService.calculateLength(currentPoints);
      const faultName = `گسل ساختاری F-${Date.now().toString().slice(-3)}`;
      const created = SurveyMapService.addFeature(
        map.id,
        {
          layerId: 'layer-geology-faults',
          name: faultName,
          type: 'POLYLINE',
          category: 'GEOLOGY_FAULT',
          unit: 'GEOLOGY',
          coordinates: currentPoints,
          elevation: map.benchLevel,
          properties: {
            code: faultName,
            lengthM,
            dipAngle: '68° SE',
            strike: 'N45E',
            faultType: 'امتدادلغز نرمال (Strike-Slip)',
            safetyBufferM: 15,
            notes: `برداشت گسل توسط واحد زمین‌شناسی (${userName})`
          },
          style: {
            strokeColor: '#DC2626',
            strokeWidth: 2.5,
            strokeDash: 'dashdot'
          },
          createdBy: userName,
          createdRole: activeRole
        },
        activeRole,
        userName
      );
      if (created) {
        if (!map.features) map.features = [];
        if (!map.features.some(f => f.id === created.id)) map.features.push(created);
        onSelectFeature(created);
      }
      drawingPointsRef.current = [];
      drawingRedoPointsRef.current = [];
      setDrawingPoints([]);
      setDrawingRedoPoints([]);
      onMapUpdated();
      if (onFeatureCreated) onFeatureCreated();
      return;
    }

    // ۴. ساب‌بلوک استخراجی
    if (currentTool === 'POLYGON') {
      if (currentPoints.length < 3) {
        return;
      }
      const areaCalc = SurveyMapService.calculateArea(currentPoints);
      const subBlockName = `ساب‌بلوک جدید ${map.benchLevel} – S${String.fromCharCode(65 + ((map.features?.filter(f => f.category === 'SUB_BLOCK').length || 0) % 26))}`;
      
      const created = SurveyMapService.addFeature(
        map.id,
        {
          layerId: 'layer-subblocks',
          name: subBlockName,
          type: 'POLYGON',
          category: 'SUB_BLOCK',
          unit: 'MINING',
          coordinates: currentPoints,
          elevation: map.benchLevel,
          properties: {
            code: subBlockName,
            tonnage: Math.round(areaCalc.areaM2 * 12 * 2.7),
            areaM2: areaCalc.areaM2,
            feGrade: 58.5,
            rockType: 'مگنتیت پرعیار',
            destination: 'سنگ‌شکن خط ۱',
            status: 'CLASSIFIED_HIGH',
            notes: `ترسیم شده توسط ${userName}`
          },
          style: {
            strokeColor: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.28,
            strokeWidth: 2
          },
          createdBy: userName,
          createdRole: activeRole
        },
        activeRole,
        userName
      );
      if (created) {
        if (!map.features) map.features = [];
        if (!map.features.some(f => f.id === created.id)) map.features.push(created);
        onSelectFeature(created);
      }
      drawingPointsRef.current = [];
      drawingRedoPointsRef.current = [];
      setDrawingPoints([]);
      setDrawingRedoPoints([]);
      onMapUpdated();
      if (onFeatureCreated) onFeatureCreated();
      return;
    }

    // ۵. خط مهندسی / رمپ
    if (currentTool === 'POLYLINE') {
      if (currentPoints.length < 2) {
        return;
      }
      const lengthM = SurveyMapService.calculateLength(currentPoints);
      const created = SurveyMapService.addFeature(
        map.id,
        {
          layerId: 'layer-roads',
          name: `مسیر / خط مهندسی (${lengthM} متر)`,
          type: 'POLYLINE',
          category: 'HAUL_ROAD',
          unit: 'MINING',
          coordinates: currentPoints,
          elevation: map.benchLevel,
          properties: {
            lengthM,
            notes: `ترسیم شده توسط ${userName}`
          },
          style: {
            strokeColor: '#38BDF8',
            strokeWidth: 2
          },
          createdBy: userName,
          createdRole: activeRole
        },
        activeRole,
        userName
      );
      if (created) {
        if (!map.features) map.features = [];
        if (!map.features.some(f => f.id === created.id)) map.features.push(created);
        onSelectFeature(created);
      }
      drawingPointsRef.current = [];
      drawingRedoPointsRef.current = [];
      setDrawingPoints([]);
      setDrawingRedoPoints([]);
      onMapUpdated();
      if (onFeatureCreated) onFeatureCreated();
      return;
    }

    // ۶. اندازه‌گیری
    if (currentTool === 'MEASURE') {
      setDrawingPoints([]);
      setDrawingRedoPoints([]);
      setMeasureResults(null);
    }
  }, [map, userName, activeRole, onMapUpdated, onFeatureCreated, onSelectFeature]);

  // اتصال ارجاعات پایدار جهت فراخوانی در شنودگر سراسری کیبورد بدون Stale Closure
  finalizeDrawingRef.current = finalizeDrawing;
  cancelDrawingRef.current = cancelDrawing;
  undoDrawingPointRef.current = undoDrawingPoint;
  redoDrawingPointRef.current = redoDrawingPoint;

  // کلیدهای میانبر ناوبری کیبورد (+, -, 0, Space, Enter, Escape, Ctrl+Z, Ctrl+Y, Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // ۱. پایان یافتن ترسیمات با زدن دکمه Enter
      if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
        if (drawingPointsRef.current.length > 0) {
          e.preventDefault();
          finalizeDrawingRef.current();
          return;
        }
      }

      // ۲. لغو ترسیم جاری یا انصراف با Escape
      if (e.key === 'Escape' || e.code === 'Escape') {
        if (drawingPointsRef.current.length > 0) {
          e.preventDefault();
          cancelDrawingRef.current();
          return;
        } else if (selectedFeatureId) {
          e.preventDefault();
          onSelectFeature(null);
          return;
        }
      }

      // ۳. عملگرهای Undo و Redo در زمان ترسیم المان‌ها
      // Undo با Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        if (drawingPointsRef.current.length > 0 || drawingRedoPointsRef.current.length > 0) {
          e.preventDefault();
          if (e.shiftKey) {
            redoDrawingPointRef.current();
          } else {
            undoDrawingPointRef.current();
          }
          return;
        }
      }

      // Redo با Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        if (drawingRedoPointsRef.current.length > 0) {
          e.preventDefault();
          redoDrawingPointRef.current();
          return;
        }
      }

      // واگرد آخرین نقطه با Backspace در زمان ترسیم المان‌ها
      if (e.key === 'Backspace') {
        if (drawingPointsRef.current.length > 0) {
          e.preventDefault();
          undoDrawingPointRef.current();
          return;
        } else if (selectedFeatureId && canEdit) {
          const feat = map.features?.find(f => f.id === selectedFeatureId);
          if (feat) {
            e.preventDefault();
            handleFeatureDelete(feat);
            return;
          }
        }
      }

      // کلید فاصله‌گذاری جهت Pan
      if (e.key === ' ' || e.code === 'Space') {
        setIsSpacePressed(true);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomStep(1.3);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomStep(0.77);
      } else if (e.key === '0' || e.key === 'Home' || e.key.toLowerCase() === 'f') {
        e.preventDefault();
        zoomToExtents();
      } else if (e.key === 'Delete') {
        if (selectedFeatureId && canEdit) {
          const feat = map.features?.find(f => f.id === selectedFeatureId);
          if (feat) {
            e.preventDefault();
            handleFeatureDelete(feat);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [zoomToExtents, selectedFeatureId, canEdit, map.features, map.id, activeRole, userName]);

  // ثبت شنودگر سراسری mouseup جهت متوقف کردن ایمن جابجایی (Pan)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPointerDownRef.current) {
        isPointerDownRef.current = false;
        setIsPanning(false);
        setTimeout(() => {
          hasMovedEnoughToPanRef.current = false;
        }, 60);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // محاسبه استروک‌دش برای انواع خطوط
  const getStrokeDashArray = (dash?: string) => {
    if (dash === 'dashed') return '6 4';
    if (dash === 'dotted') return '2 3';
    if (dash === 'dashdot') return '8 3 2 3';
    return undefined;
  };

  // محاسبه ضخامت خطوط بر اساس انتخاب کاربر
  const getFeatureStrokeWidth = useCallback((baseWidth: number = 1.2, isSelected: boolean = false): number => {
    if (isSelected) return 2.8;
    const factor = strokeWeight === 'FINE' ? 0.75 : strokeWeight === 'BOLD' ? 1.8 : 1.1;
    return Math.max(0.6, baseWidth * factor);
  }, [strokeWeight]);

  // شروع فشرده شدن کلیک ماوس جهت آغاز Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0 || e.button === 1) {
      isPointerDownRef.current = true;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      pointerDownTimeRef.current = Date.now();
      totalDragDistanceRef.current = 0;
      hasMovedEnoughToPanRef.current = false;
    }
  };

  // جابجایی ماوس و اجرای Pan در صورت درگ
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPointerDownRef.current) {
      const moveDistance = Math.hypot(
        e.clientX - pointerStartRef.current.x,
        e.clientY - pointerStartRef.current.y
      );
      totalDragDistanceRef.current = moveDistance;

      // آستانه را به ۸ پیکسل افزایش می‌دهیم تا لرزش دست یا کلیک ساده، انتخاب را لغو نکند
      if (moveDistance > 8) {
        hasMovedEnoughToPanRef.current = true;
        if (!isPanning) {
          setIsPanning(true);
        }
        const deltaX = e.clientX - lastPanPosRef.current.x;
        const deltaY = e.clientY - lastPanPosRef.current.y;

        const svgEl = svgRef.current;
        let scaleFactorX = 1;
        let scaleFactorY = 1;
        if (svgEl) {
          const rect = svgEl.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            scaleFactorX = CANVAS_WIDTH / rect.width;
            scaleFactorY = CANVAS_HEIGHT / rect.height;
          }
        }

        const newPanX = panRef.current.x + deltaX * scaleFactorX;
        const newPanY = panRef.current.y + deltaY * scaleFactorY;

        panRef.current = { x: newPanX, y: newPanY };
        setPan({ x: newPanX, y: newPanY });

        lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      }
    }

    const [svgX, svgY] = getSvgCoordinates(e.clientX, e.clientY);
    const [utmX, utmY] = svgToUtm(svgX, svgY);
    setCursorCoords({
      utmX,
      utmY,
      z: map.benchLevel
    });

    if (activeTool === 'MEASURE' && drawingPoints.length > 0 && !hasMovedEnoughToPanRef.current && !isPanning) {
      const currentPts = [...drawingPoints, [utmX, utmY]];
      const dist = SurveyMapService.calculateLength(currentPts);
      const areaObj = currentPts.length >= 3 ? SurveyMapService.calculateArea(currentPts) : { areaM2: 0 };
      setMeasureResults({ distance: dist, area: areaObj.areaM2 });
    }
  };

  // اتمام نگه‌داشتن کلیک ماوس
  const handleMouseUp = () => {
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      setIsPanning(false);
      // در کلیک‌های بسیار سریع یا بدون جابجایی معنادار بلافاصله آزاد شود
      if (totalDragDistanceRef.current < 8) {
        hasMovedEnoughToPanRef.current = false;
      } else {
        setTimeout(() => {
          hasMovedEnoughToPanRef.current = false;
        }, 50);
      }
    }
  };

  // لایه‌های فعال و فیلتر شده و میزان شفافیت
  const layersById = useMemo(() => {
    const mapObj: Record<string, (typeof map.layers)[0]> = {};
    (map.layers || []).forEach(l => {
      mapObj[l.id] = l;
    });
    return mapObj;
  }, [map.layers]);

  const visibleLayersMap = useMemo(() => {
    const vis: Record<string, boolean> = {};
    (map.layers || []).forEach(l => {
      vis[l.id] = l.isVisible;
    });
    return vis;
  }, [map.layers]);

  const layerOpacityMap = useMemo(() => {
    const op: Record<string, number> = {};
    (map.layers || []).forEach(l => {
      op[l.id] = l.opacity ?? 1;
    });
    return op;
  }, [map.layers]);

  const visibleFeatures = useMemo(() => {
    return (map.features || []).filter(f => {
      if (f.layerId && visibleLayersMap[f.layerId] === false) return false;
      return true;
    });
  }, [map.features, visibleLayersMap]);

  const selectedFeature = useMemo(() => {
    return map.features?.find(f => f.id === selectedFeatureId) || null;
  }, [map.features, selectedFeatureId]);

  // سیستم انتخاب هوشمند عارضه در هر زوم با تلورانس متناسب با پیکسل‌های صفحه نمایش
  const findFeatureAtSvgCoords = useCallback((svgX: number, svgY: number): MapFeature | null => {
    const svgEl = svgRef.current;
    const rect = svgEl ? svgEl.getBoundingClientRect() : { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
    const screenToSvgRatio = (CANVAS_WIDTH / (rect.width || CANVAS_WIDTH)) / (zoomRef.current || 1);
    
    // آستانه کلیک معادل ۲۴ پیکسل نمایشگر جهت انتخاب بی‌نهایت نرم و سریع
    const toleranceSvg = 24 * screenToSvgRatio;
    const clickPt: [number, number] = [svgX, svgY];

    let candidateFeature: MapFeature | null = null;
    let minDistance = Infinity;

    // پیمایش معکوس عوارض تا عوارض ترسیم‌شده رویی اولویت داشته باشند
    const featuresReversed = [...visibleFeatures].reverse();

    for (const feat of featuresReversed) {
      if (!feat.coordinates || feat.coordinates.length === 0) continue;

      // ۱. اگر نقطه است (چال، بنچ‌مارک)
      if (feat.type === 'POINT' && feat.coordinates[0]) {
        const ptSvg = utmToSvg(feat.coordinates[0][0], feat.coordinates[0][1]);
        const dist = Math.hypot(svgX - ptSvg[0], svgY - ptSvg[1]);
        const ptTol = Math.max(toleranceSvg, (feat.style.pointRadius || 4) * screenToSvgRatio * 3);
        if (dist <= ptTol && dist < minDistance) {
          minDistance = dist;
          candidateFeature = feat;
        }
      }

      // ۲. اگر چندضلعی است (ساب‌بلوک، باند حفاری، باند زمین‌شناسی)
      else if (feat.type === 'POLYGON' && feat.coordinates.length >= 3) {
        const polySvgPts = feat.coordinates.map(pt => utmToSvg(pt[0], pt[1]));
        const isInside = isPointInPolygon(clickPt, polySvgPts);
        if (isInside) {
          return feat;
        }
        for (let i = 0; i < polySvgPts.length; i++) {
          const nextIdx = (i + 1) % polySvgPts.length;
          const segDist = distToSegment(clickPt, polySvgPts[i], polySvgPts[nextIdx]);
          if (segDist <= toleranceSvg && segDist < minDistance) {
            minDistance = segDist;
            candidateFeature = feat;
          }
        }
      }

      // ۳. اگر خط یا مسیر است (گسل، رمپ، Toe، Crest)
      else if (feat.type === 'POLYLINE' && feat.coordinates.length >= 2) {
        const lineSvgPts = feat.coordinates.map(pt => utmToSvg(pt[0], pt[1]));
        for (let i = 0; i < lineSvgPts.length - 1; i++) {
          const segDist = distToSegment(clickPt, lineSvgPts[i], lineSvgPts[i + 1]);
          if (segDist <= toleranceSvg && segDist < minDistance) {
            minDistance = segDist;
            candidateFeature = feat;
          }
        }
      }

      // ۴. اگر دایره یا زون است
      else if (feat.type === 'CIRCLE_ZONE' && feat.coordinates[0]) {
        const centerSvg = utmToSvg(feat.coordinates[0][0], feat.coordinates[0][1]);
        const radiusSvg = (feat.properties?.radiusM || 40) * uniformScale;
        const distToCenter = Math.hypot(svgX - centerSvg[0], svgY - centerSvg[1]);
        const distToRim = Math.abs(distToCenter - radiusSvg);
        if (distToCenter <= radiusSvg || distToRim <= toleranceSvg) {
          if (distToRim < minDistance) {
            minDistance = distToRim;
            candidateFeature = feat;
          }
        }
      }
    }

    return candidateFeature;
  }, [visibleFeatures, utmToSvg, uniformScale]);

  // کلیک ماوس روی نقشه برای ترسیم یا انتخاب هوشمند
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const clickDuration = Date.now() - pointerDownTimeRef.current;
    if (hasMovedEnoughToPanRef.current && totalDragDistanceRef.current > 8 && clickDuration > 180) {
      return;
    }

    const [svgX, svgY] = getSvgCoordinates(e.clientX, e.clientY);
    const [utmX, utmY] = svgToUtm(svgX, svgY);

    if (activeTool === 'POINT') {
      if (!canEdit) return;
      const created = SurveyMapService.addFeature(
        map.id,
        {
          layerId: 'layer-benchmarks',
          name: `نقطه نقشه‌برداری P-${Math.floor(Math.random() * 900 + 100)}`,
          type: 'POINT',
          category: 'SURVEY_BENCHMARK',
          coordinates: [[utmX, utmY]],
          elevation: map.benchLevel,
          properties: {
            code: `PT-${Math.floor(Math.random() * 900 + 100)}`,
            xUTM: utmX,
            yUTM: utmY,
            zElev: map.benchLevel,
            notes: `ثبت شده توسط ${userName}`
          },
          style: {
            strokeColor: '#EC4899',
            fillColor: '#EC4899',
            strokeWidth: 2,
            pointRadius: 6
          },
          createdBy: userName,
          createdRole: activeRole
        },
        activeRole,
        userName
      );
      if (created) {
        if (!map.features) map.features = [];
        if (!map.features.some(f => f.id === created.id)) map.features.push(created);
        onSelectFeature(created);
      }
      onMapUpdated();
      if (onFeatureCreated) onFeatureCreated();
      return;
    }

    if (activeTool === 'ANNOTATION') {
      if (!canEdit && !SurveyPermissionService.getPermissions(activeRole).canAddAnnotations) return;
      const text = window.prompt('متن یادداشت یا برچسب مهندسی را وارد کنید:', 'محدوده دپو کانسنگ') || 'یادداشت فنی';
      if (text) {
        const created = SurveyMapService.addFeature(
          map.id,
          {
            layerId: 'layer-annotations',
            name: text,
            type: 'TEXT_ANNOTATION',
            category: 'ANNOTATION',
            coordinates: [[utmX, utmY]],
            elevation: map.benchLevel,
            properties: {
              notes: text,
              author: userName
            },
            style: {
              strokeColor: '#FBBF24',
              textColor: '#FBBF24',
              strokeWidth: 1,
              fontSize: 11
            },
            createdBy: userName,
            createdRole: activeRole
          },
          activeRole,
          userName
        );
        if (created) {
          if (!map.features) map.features = [];
          if (!map.features.some(f => f.id === created.id)) map.features.push(created);
          onSelectFeature(created);
        }
        onMapUpdated();
        if (onFeatureCreated) onFeatureCreated();
      }
      return;
    }

    if (
      activeTool === 'POLYGON' || 
      activeTool === 'POLYLINE' || 
      activeTool === 'MEASURE' ||
      activeTool === 'DRILLING_BAND' ||
      activeTool === 'GEOLOGY_ROCK_BAND' ||
      activeTool === 'GEOLOGY_FAULT'
    ) {
      // بررسی کلیک در حریم رأس اول جهت بستن خودکار چندضلعی و ثبت نهایی (Snap & Close Loop)
      if (
        (activeTool === 'POLYGON' || activeTool === 'DRILLING_BAND' || activeTool === 'GEOLOGY_ROCK_BAND') &&
        drawingPointsRef.current.length >= 3
      ) {
        const firstPt = drawingPointsRef.current[0];
        const [firstSvgX, firstSvgY] = utmToSvg(firstPt[0], firstPt[1]);
        const distPx = Math.hypot(svgX - firstSvgX, svgY - firstSvgY);
        if (distPx <= 22) {
          finalizeDrawing();
          return;
        }
      }

      // به‌روزرسانی بی‌درنگ هم در Ref و هم در State تا در رویداد دابل‌کلیک هیچ مختصاتی گم نشود
      const next: [number, number][] = [...drawingPointsRef.current, [utmX, utmY]];
      drawingPointsRef.current = next;
      setDrawingPoints(next);
      setDrawingRedoPoints([]);
      drawingRedoPointsRef.current = [];

      if (activeTool === 'MEASURE' && next.length >= 2) {
        const lengthCalc = SurveyMapService.calculateLength(next);
        const areaCalc = next.length >= 3 ? SurveyMapService.calculateArea(next) : undefined;
        setMeasureResults({
          distance: lengthCalc,
          area: areaCalc?.areaM2
        });
      }
      return;
    } else if (activeTool === 'SELECT' || activeTool === 'INSPECT') {
      // انتخاب هوشمند مجاورتی حتی اگر کلیک کمی خارج از لبه خورده باشد
      const nearest = findFeatureAtSvgCoords(svgX, svgY);
      onSelectFeature(nearest);
    }
  };

  // دابل کلیک برای نهایی کردن ترسیم یا زوم اکستند
  const handleDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (drawingPointsRef.current.length >= 2) {
      finalizeDrawing();
    } else if (activeTool === 'PAN' || e.button === 1) {
      zoomToExtents();
    }
  };

  // حذف المان
  const handleFeatureDelete = useCallback((feat: MapFeature) => {
    if (!canEdit) {
      alert('نقش شما دسترسی حذف عوارض و ترسیم‌ها را ندارد.');
      return;
    }
    if (onDeleteFeatureRequest) {
      onDeleteFeatureRequest(feat);
    } else {
      const confirmed = window.confirm(`آیا از حذف عارضه '${feat.name}' اطمینان دارید؟`);
      if (confirmed) {
        SurveyMapService.deleteFeature(map.id, feat.id, activeRole, userName);
        if (selectedFeatureId === feat.id) {
          onSelectFeature(null);
        }
        onMapUpdated();
      }
    }
  }, [canEdit, onDeleteFeatureRequest, map.id, activeRole, userName, selectedFeatureId, onSelectFeature, onMapUpdated]);

  // کلیک مستقیم روی المان‌های نقشه جهت انتخاب عارضه با کارایی بالا
  const handleFeatureClick = useCallback((e: React.MouseEvent, feat: MapFeature) => {
    e.stopPropagation();
    const clickDuration = Date.now() - pointerDownTimeRef.current;
    if (hasMovedEnoughToPanRef.current && totalDragDistanceRef.current > 8 && clickDuration > 180) {
      return;
    }
    onSelectFeature(feat);
  }, [onSelectFeature]);

  // بررسی هوشمند نمایش برچسب عوارض با Level of Detail (LOD)
  const shouldShowFeatureLabel = (feat: MapFeature): boolean => {
    if (!displaySettings.showLabels) return false;
    const isSelected = selectedFeatureId === feat.id;
    const isHovered = hoveredFeatureId === feat.id;

    if (isSelected || isHovered) return true;

    const layer = feat.layerId ? layersById[feat.layerId] : null;
    if (layer && layer.showLabels === false) return false;

    // جلوگیری از شلوغی و توده متن روی نقشه در زوم‌های کمتر
    const totalCount = visibleFeatures.length;
    const zoomThreshold = totalCount > 50 ? 1.6 : totalCount > 20 ? 1.0 : 0.6;
    if (zoom < zoomThreshold) return false;

    if (feat.type === 'POLYLINE') {
      if (!displaySettings.showLineLabels) return false;
      return layer ? (layer.showLabels ?? false) : false;
    }

    if (feat.type === 'POLYGON') {
      return displaySettings.showSubBlockLabels;
    }

    if (feat.type === 'POINT') {
      return displaySettings.showPointLabels && zoom >= 1.2;
    }

    return true;
  };

  // محاسبه مقیاس خطی استاندارد مهندسی
  const scaleBarInfo = useMemo(() => {
    const targetPixelWidth = 80;
    const metersRaw = isDegreeCoords ? (targetPixelWidth / (uniformScale * zoom)) * 111000 : (targetPixelWidth / (uniformScale * zoom));
    const power = Math.pow(10, Math.floor(Math.log10(Math.max(1, metersRaw))));
    let niceMeters = power;
    if (metersRaw / power >= 5) {
      niceMeters = 5 * power;
    } else if (metersRaw / power >= 2) {
      niceMeters = 2 * power;
    }
    const realPixelWidth = Math.max(35, Math.min(140, (niceMeters / (isDegreeCoords ? 111000 : 1)) * uniformScale * zoom));
    return {
      meters: niceMeters,
      pixelWidth: realPixelWidth
    };
  }, [uniformScale, zoom, isDegreeCoords]);

  // استایل مکان‌نما
  const cursorStyle = useMemo(() => {
    if (isPanning) return 'cursor-grabbing';
    if (isSpacePressed || activeTool === 'PAN' || activeTool === 'SELECT') return 'cursor-grab';
    if (activeTool === 'MEASURE' || activeTool === 'POLYGON' || activeTool === 'POLYLINE' || activeTool === 'POINT' || activeTool === 'ANNOTATION') return 'cursor-crosshair';
    return 'cursor-grab';
  }, [isPanning, isSpacePressed, activeTool]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[580px] rounded-2xl bg-[#070F1E] border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col justify-between select-none ${cursorStyle}`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* هدر بالایی وضعیت و نوار ابزارهای CAD HUD */}
      <div className="absolute top-3 right-14 left-14 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* نشانگر زنده مختصات مکان‌نما */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] shadow-lg pointer-events-auto font-mono">
          <div className="flex items-center gap-1 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold">X:</span>
            <span className="text-white font-bold">
              {isDegreeCoords ? cursorCoords.utmX.toFixed(5) + '°' : cursorCoords.utmX.toLocaleString()}
            </span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="font-bold">Y:</span>
            <span className="text-white font-bold">
              {isDegreeCoords ? cursorCoords.utmY.toFixed(5) + '°' : cursorCoords.utmY.toLocaleString()}
            </span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div className="flex items-center gap-1 text-amber-400">
            <span className="font-bold">Z:</span>
            <span className="text-white font-bold">{cursorCoords.z}m</span>
          </div>
        </div>

        {/* نوار ابزار تعاملی و هوشمند کنترل ترسیم CAD: واگرد (Undo)، مجدد (Redo)، پایان ترسیم (Enter) و لغو (Esc) */}
        {drawingPoints.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/95 border border-cyan-500/40 text-xs backdrop-blur-xl shadow-2xl pointer-events-auto ring-1 ring-cyan-500/20">
            {/* مشخصات ابزار جاری و شمارنده رأس‌ها */}
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] pl-2 border-l border-slate-800/80">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>
                {activeTool === 'DRILLING_BAND' && 'ترسیم باند حفاری'}
                {activeTool === 'GEOLOGY_ROCK_BAND' && 'ترسیم باند جنس سنگ'}
                {activeTool === 'GEOLOGY_FAULT' && 'برداشت خط گسل'}
                {activeTool === 'POLYGON' && 'ترسیم ساب‌بلوک'}
                {activeTool === 'POLYLINE' && 'ترسیم خط مهندسی'}
                {activeTool === 'MEASURE' && 'خط‌کش و اندازه‌گیری'}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-cyan-950/90 text-cyan-300 border border-cyan-500/30 font-mono text-[10px]">
                {drawingPoints.length} {activeTool === 'POLYLINE' || activeTool === 'GEOLOGY_FAULT' ? 'نقطه' : 'رأس'}
              </span>
              {activeTool === 'MEASURE' && measureResults && (
                <span className="text-[10px] text-amber-300 mr-1 font-mono">
                  ({measureResults.distance}m {measureResults.area ? `| ${measureResults.area.toLocaleString()} m²` : ''})
                </span>
              )}
            </div>

            {/* دکمه واگرد نقطه (Undo آخرین رأس / نقطه) */}
            <button
              onClick={undoDrawingPoint}
              disabled={drawingPoints.length === 0}
              title="واگرد آخرین نقطه ترسیم شده (Ctrl+Z یا Backspace)"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 disabled:opacity-35 disabled:pointer-events-none text-slate-200 border border-slate-700/80 text-[11px] font-medium transition-all group active:scale-95"
            >
              <ArrowUturnLeftIcon className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>واگرد</span>
              <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] bg-slate-800 text-slate-400 rounded font-mono border border-slate-700">
                Ctrl+Z
              </kbd>
            </button>

            {/* دکمه مجدد نقطه (Redo رأس واگرد شده) */}
            <button
              onClick={redoDrawingPoint}
              disabled={drawingRedoPoints.length === 0}
              title="اعمال مجدد نقطه واگرد شده (Ctrl+Y یا Ctrl+Shift+Z)"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 disabled:opacity-35 disabled:pointer-events-none text-slate-200 border border-slate-700/80 text-[11px] font-medium transition-all group active:scale-95"
            >
              <ArrowUturnRightIcon className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              <span>مجدد</span>
              {drawingRedoPoints.length > 0 && (
                <span className="text-[9px] px-1 rounded-full bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/30">
                  {drawingRedoPoints.length}
                </span>
              )}
              <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] bg-slate-800 text-slate-400 rounded font-mono border border-slate-700">
                Ctrl+Y
              </kbd>
            </button>

            <div className="w-px h-4 bg-slate-800" />

            {/* دکمه برجسته پایان و نهایی‌سازی ترسیم (Enter) */}
            <button
              onClick={finalizeDrawing}
              title="پایان دادن به ترسیم و ثبت در نقشه (کلید Enter کیبورد یا دابل‌کلیک)"
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-[11px] shadow-lg shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
            >
              <CheckIcon className="w-4 h-4 stroke-[2.5]" />
              <span>پایان ترسیم</span>
              <kbd className="px-1.5 py-0.2 text-[9px] bg-slate-950/30 text-slate-950 rounded font-mono border border-emerald-700/30">
                ↵ Enter
              </kbd>
            </button>

            {/* دکمه لغو انصراف (Escape) */}
            <button
              onClick={cancelDrawing}
              title="لغو ترسیم جاری (کلید Esc)"
              className="p-1 rounded-xl bg-slate-900/90 hover:bg-rose-950/60 hover:border-rose-500/60 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* نوار ابزار اصلی ناوبری و حالت‌های نمایش CAD */}
        <div className="relative flex items-center gap-1 p-1 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 pointer-events-auto shadow-xl">
          
          {/* مدیریت لایه‌ها */}
          {onOpenLayersPanel && (
            <button
              onClick={onOpenLayersPanel}
              title="مدیریت لایه‌ها"
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-cyan-400 hover:text-white hover:bg-slate-800 transition-colors text-[11px] font-bold"
            >
              <Square2StackIcon className="w-4 h-4" />
              <span className="font-mono">{visibleFeatures.length}</span>
            </button>
          )}

          <div className="w-px h-4 bg-slate-800 mx-0.5" />

          {/* منوی حالت رندر CAD (سایه روشن / خطی Wireframe / ترنسلوسنت) */}
          <div className="relative">
            <button
              onClick={() => setShowDisplayModeMenu(!showDisplayModeMenu)}
              title="تغییر حالت نمایش و ضخامت خطوط CAD"
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold transition-all ${
                renderMode === 'WIREFRAME' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
              }`}
            >
              <SwatchIcon className="w-3.5 h-3.5" />
              <span>
                {renderMode === 'WIREFRAME' ? 'خطوط خالص' : renderMode === 'TRANSLUCENT' ? 'ترنسلوسنت' : 'توپر'}
              </span>
            </button>

            {showDisplayModeMenu && (
              <div className="absolute top-full right-0 mt-1.5 w-44 py-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 flex flex-col text-xs">
                <div className="px-3 py-1 text-[10px] text-slate-400 font-bold border-b border-slate-800 mb-1">
                  حالت نمایش چندضلعی‌ها:
                </div>
                <button
                  onClick={() => { setRenderMode('WIREFRAME'); setShowDisplayModeMenu(false); }}
                  className={`px-3 py-1 text-right flex items-center justify-between hover:bg-slate-800 ${renderMode === 'WIREFRAME' ? 'text-amber-400 font-bold bg-amber-950/30' : 'text-slate-300'}`}
                >
                  <span>خطوط خالص (Wireframe)</span>
                  <span className="text-[10px] text-slate-500">0% Fill</span>
                </button>
                <button
                  onClick={() => { setRenderMode('TRANSLUCENT'); setShowDisplayModeMenu(false); }}
                  className={`px-3 py-1 text-right flex items-center justify-between hover:bg-slate-800 ${renderMode === 'TRANSLUCENT' ? 'text-cyan-400 font-bold bg-cyan-950/30' : 'text-slate-300'}`}
                >
                  <span>ترنسلوسنت (شفاف)</span>
                  <span className="text-[10px] text-slate-500">18% Fill</span>
                </button>
                <button
                  onClick={() => { setRenderMode('SHADED'); setShowDisplayModeMenu(false); }}
                  className={`px-3 py-1 text-right flex items-center justify-between hover:bg-slate-800 ${renderMode === 'SHADED' ? 'text-emerald-400 font-bold bg-emerald-950/30' : 'text-slate-300'}`}
                >
                  <span>توپر ملایم (Shaded)</span>
                  <span className="text-[10px] text-slate-500">35% Fill</span>
                </button>

                <div className="w-full h-px bg-slate-800 my-1.5" />
                <div className="px-3 py-1 text-[10px] text-slate-400 font-bold border-b border-slate-800 mb-1">
                  ضخامت خطوط (Stroke):
                </div>
                <div className="grid grid-cols-3 gap-1 px-2 py-1">
                  <button
                    onClick={() => setStrokeWeight('FINE')}
                    className={`py-1 text-[10px] font-bold rounded ${strokeWeight === 'FINE' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    نازک
                  </button>
                  <button
                    onClick={() => setStrokeWeight('REGULAR')}
                    className={`py-1 text-[10px] font-bold rounded ${strokeWeight === 'REGULAR' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    استاندارد
                  </button>
                  <button
                    onClick={() => setStrokeWeight('BOLD')}
                    className={`py-1 text-[10px] font-bold rounded ${strokeWeight === 'BOLD' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    برجسته
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-slate-800 mx-0.5" />

          {/* زوم این */}
          <button
            onClick={() => handleZoomStep(1.3)}
            title="بزرگنمایی (Zoom In) [+]"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </button>

          {/* درصد بزرگنمایی و لیست درصدهای زوم */}
          <div className="relative">
            <button
              onClick={() => setShowZoomMenu(!showZoomMenu)}
              title="تغییر درصد بزرگنمایی"
              className="px-2 py-0.5 rounded-md hover:bg-slate-800 text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-0.5 transition-colors"
            >
              <span>{Math.round(zoom * 100)}%</span>
            </button>

            {showZoomMenu && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-32 py-1 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 flex flex-col text-xs font-mono max-h-64 overflow-y-auto">
                <button onClick={() => handleSetZoomPreset(1)} className="px-3 py-1 text-right text-cyan-300 hover:bg-slate-800 font-bold flex justify-between">
                  <span>تمام‌نما (Fit)</span>
                  <span className="text-[10px] text-slate-400">100%</span>
                </button>
                <div className="w-full h-px bg-slate-800 my-0.5" />
                {[0.25, 0.5, 0.75, 1, 1.5, 2, 3, 5, 10, 25, 50, 100].map((z) => (
                  <button
                    key={z}
                    onClick={() => handleSetZoomPreset(z)}
                    className={`px-3 py-0.5 text-right hover:bg-slate-800 flex justify-between ${Math.abs(zoom - z) < 0.01 ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-300'}`}
                  >
                    <span>{Math.round(z * 100)}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* زوم اوت */}
          <button
            onClick={() => handleZoomStep(0.77)}
            title="کوچکنمایی (Zoom Out) [-]"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-0.5" />

          {/* زوم اکستند (Fit All) */}
          <button
            onClick={zoomToExtents}
            title="زوم اکستند / تمام‌نما (Home / 0)"
            className={`p-1.5 rounded-lg transition-all ${zoom === 1 && pan.x === 0 && pan.y === 0 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </button>

          {/* زوم روی عارضه انتخاب شده در صورت وجود */}
          {selectedFeature && (
            <button
              onClick={() => zoomToFeature(selectedFeature)}
              title="زوم روی عارضه انتخابی"
              className="p-1.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-950/50 border border-amber-500/30 animate-pulse transition-colors"
            >
              <ViewfinderCircleIcon className="w-4 h-4" />
            </button>
          )}

          <div className="w-px h-4 bg-slate-800 mx-0.5" />

          {/* دکمه راهنمای کلیدهای میانبر CAD و ترسیم */}
          <div className="relative">
            <button
              onClick={() => setShowShortcutsHelp(prev => !prev)}
              title="کلیدهای میانبر ترسیم و ناوبری CAD"
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${showShortcutsHelp ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'}`}
            >
              <QuestionMarkCircleIcon className="w-4 h-4" />
            </button>

            {/* پنجره راهنمای میانبرها */}
            {showShortcutsHelp && (
              <div 
                className="absolute bottom-10 left-0 w-80 p-3 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-700 shadow-2xl z-50 text-right animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="font-bold text-xs text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    راهنمای میانبرهای کیبورد CAD
                  </span>
                  <button 
                    onClick={() => setShowShortcutsHelp(false)}
                    className="text-slate-500 hover:text-slate-300 p-0.5"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <span className="font-bold">پایان ترسیم المان</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-emerald-900/60 font-mono text-[10px] text-emerald-200 border border-emerald-700/50">Enter ↵</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-200">
                    <span>واگرد نقطه (Undo)</span>
                    <div className="flex gap-1 font-mono text-[10px]">
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">Ctrl+Z</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">Backspace</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-cyan-200">
                    <span>اعمال مجدد نقطه (Redo)</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[10px]">Ctrl+Y</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg bg-slate-900/60 text-slate-300">
                    <span>لغو ترسیم / انصراف</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Esc</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg bg-slate-900/60 text-slate-300">
                    <span>جابجایی نقشه (Pan)</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">کلید Space</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg bg-slate-900/60 text-slate-300">
                    <span>بزرگنمایی / کوچکنمایی</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Scroll / +, -</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg bg-slate-900/60 text-slate-300">
                    <span>دید کامل نقشه (Fit)</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Home / 0 / F</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1 px-1.5 rounded-lg bg-slate-900/60 text-slate-300">
                    <span>حذف المان انتخاب‌شده</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Delete</kbd>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ناحیه بوم ترسیم SVG با نسبت ابعاد همسانگرد دقیق و بدون کشیدگی */}
      <div className="w-full h-full overflow-hidden relative flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox={svgViewBox}
          className="w-full h-full"
          onClick={handleSvgClick}
          onDoubleClick={handleDoubleClick}
        >
          {/* شبکه شطرنجی پس‌زمینه نقشه (CAD Grid) */}
          <defs>
            <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" />
            </pattern>
            <pattern id="cadGridMajor" width="200" height="200" patternUnits="userSpaceOnUse">
              <rect width="200" height="200" fill="url(#cadGrid)" />
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#334155" strokeWidth="1.2" />
            </pattern>
          </defs>

          {/* پس زمینه ثابت */}
          <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#070F1E" />
          {displaySettings.showCadGrid && (
            <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#cadGridMajor)" />
          )}

          {/* درگاه رندر با Pan و Zoom ایزوتروپیک دقیق نسبت به مرکز */}
          <g
            id="map-viewport"
            transform={`translate(${CANVAS_WIDTH / 2 + pan.x} ${CANVAS_HEIGHT / 2 + pan.y}) scale(${zoom}) translate(${-CANVAS_WIDTH / 2} ${-CANVAS_HEIGHT / 2})`}
          >
            {/* خطوط تراز و عوارض منحنی میزان تنها در صورت خالی بودن نقشه یا فعال بودن صریح */}
            {displaySettings.showContourLines && (visibleLayersMap['layer-topography'] !== false) && visibleFeatures.length <= 5 && (
              <g opacity={(layerOpacityMap['layer-topography'] ?? 1) * 0.25} stroke="#00D4FF" strokeWidth="0.8" fill="none" vectorEffect="non-scaling-stroke">
                <path d={`M ${offsetX} ${offsetY + drawnHeight * 0.25} Q ${offsetX + drawnWidth * 0.3} ${offsetY + drawnHeight * 0.15} ${offsetX + drawnWidth * 0.6} ${offsetY + drawnHeight * 0.2} T ${offsetX + drawnWidth} ${offsetY + drawnHeight * 0.3}`} strokeDasharray="4 4" />
                <path d={`M ${offsetX} ${offsetY + drawnHeight * 0.45} Q ${offsetX + drawnWidth * 0.35} ${offsetY + drawnHeight * 0.35} ${offsetX + drawnWidth * 0.65} ${offsetY + drawnHeight * 0.4} T ${offsetX + drawnWidth} ${offsetY + drawnHeight * 0.5}`} />
                <path d={`M ${offsetX} ${offsetY + drawnHeight * 0.65} Q ${offsetX + drawnWidth * 0.32} ${offsetY + drawnHeight * 0.55} ${offsetX + drawnWidth * 0.62} ${offsetY + drawnHeight * 0.6} T ${offsetX + drawnWidth} ${offsetY + drawnHeight * 0.7}`} strokeDasharray="4 4" />
              </g>
            )}

            {/* رندر المان‌های نقشه (Features) با vectorEffect="non-scaling-stroke" */}
            {visibleFeatures.map((feat) => {
              const isSelected = selectedFeatureId === feat.id;
              const isHovered = hoveredFeatureId === feat.id;
              const layer = feat.layerId ? layersById[feat.layerId] : null;
              const layerOpacity = layer?.opacity ?? (layerOpacityMap[feat.layerId] ?? 1);
              const layerColor = layer?.color || feat.style.strokeColor || '#10B981';
              const layerStrokeDash = layer?.strokeDash ?? feat.style.strokeDash;
              const showLabel = shouldShowFeatureLabel(feat);

              // ۱. چندضلعی (ساب‌بلوک‌ها، مرز انفجار، دپوها)
              if (feat.type === 'POLYGON' && feat.coordinates.length >= 3) {
                const svgPoints = feat.coordinates.map(pt => utmToSvg(pt[0], pt[1])).map(p => `${p[0]},${p[1]}`).join(' ');
                
                // محاسبه مرکز هندسی جهت نمایش برچسب
                const centerSvg = utmToSvg(
                  feat.coordinates.reduce((s, p) => s + p[0], 0) / feat.coordinates.length,
                  feat.coordinates.reduce((s, p) => s + p[1], 0) / feat.coordinates.length
                );

                // محاسبه شفافیت پرکننده متناسب با مود انتخاب شده
                const dynamicFillOpacity = renderMode === 'WIREFRAME' 
                  ? 0 
                  : renderMode === 'TRANSLUCENT' 
                    ? (isSelected ? 0.35 : isHovered ? 0.25 : 0.12)
                    : (isSelected ? 0.55 : isHovered ? 0.45 : Math.min(feat.style.fillOpacity ?? 0.25, 0.35));

                const strokeW = getFeatureStrokeWidth(feat.style.strokeWidth || 1.2, isSelected);

                return (
                  <g 
                    key={feat.id}
                    onClick={(e) => handleFeatureClick(e, feat)}
                    onMouseEnter={() => setHoveredFeatureId(feat.id)}
                    onMouseLeave={() => setHoveredFeatureId(null)}
                    className="cursor-pointer group"
                    opacity={layerOpacity}
                  >
                    {/* لایه پرکننده با pointerEvents all جهت انتخاب بدون نقص در هر مد رندر */}
                    <polygon
                      points={svgPoints}
                      fill={feat.style.fillColor || layerColor}
                      fillOpacity={dynamicFillOpacity}
                      stroke={isSelected ? '#00D4FF' : isHovered ? '#38BDF8' : (feat.style.strokeColor || layerColor)}
                      strokeWidth={strokeW}
                      vectorEffect="non-scaling-stroke"
                      strokeDasharray={getStrokeDashArray(layerStrokeDash)}
                      className="transition-all duration-150"
                      style={{ pointerEvents: 'all' }}
                    />
                    
                    {/* لایه ضربه‌ای حاشیه چندضلعی برای کلیک آسان روی مرزها */}
                    <polygon
                      points={svgPoints}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={Math.max(14, strokeW * 3)}
                      vectorEffect="non-scaling-stroke"
                      style={{ pointerEvents: 'stroke' }}
                    />
                    
                    {/* برچسب کد ساب‌بلوک با پس‌زمینه خوانا */}
                    {showLabel && (
                      <g className="pointer-events-none select-none">
                        <rect
                          x={centerSvg[0] - 22}
                          y={centerSvg[1] - 8}
                          width={44}
                          height={16}
                          rx={3}
                          fill="#070F1E"
                          fillOpacity="0.75"
                          stroke={isSelected ? '#00D4FF' : layerColor}
                          strokeWidth="0.6"
                          vectorEffect="non-scaling-stroke"
                        />
                        <text
                          x={centerSvg[0]}
                          y={centerSvg[1] + 3}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="9.5"
                          fontWeight="700"
                          className="font-mono"
                        >
                          {feat.properties?.code || feat.name}
                        </text>
                      </g>
                    )}

                    {/* برچسب عیار آهن */}
                    {displaySettings.showGradeValues && feat.properties?.feGrade && showLabel && (
                      <text
                        x={centerSvg[0]}
                        y={centerSvg[1] + 18}
                        textAnchor="middle"
                        fill="#A7F3D0"
                        fontSize="8.5"
                        fontWeight="600"
                        className="pointer-events-none font-mono drop-shadow-sm select-none"
                      >
                        {feat.properties.feGrade}% Fe
                      </text>
                    )}
                  </g>
                );
              }

              // ۲. خطوط و مسیرها (Toe، Crest، رمپ، راه‌ها)
              if (feat.type === 'POLYLINE' && feat.coordinates.length >= 2) {
                const svgPoints = feat.coordinates.map(pt => utmToSvg(pt[0], pt[1])).map(p => `${p[0]},${p[1]}`).join(' ');
                const midIdx = Math.floor(feat.coordinates.length / 2);
                const midPtSvg = feat.coordinates[midIdx] ? utmToSvg(feat.coordinates[midIdx][0], feat.coordinates[midIdx][1]) : [0, 0];
                const strokeW = getFeatureStrokeWidth(feat.style.strokeWidth || 1.3, isSelected);

                return (
                  <g
                    key={feat.id}
                    onClick={(e) => handleFeatureClick(e, feat)}
                    onMouseEnter={() => setHoveredFeatureId(feat.id)}
                    onMouseLeave={() => setHoveredFeatureId(null)}
                    className="cursor-pointer group"
                    opacity={layerOpacity}
                  >
                    {/* لایه نامرئی ضخیم برای کلیک بی‌نهایت نرم و سریع روی خطوط در تمام زوم‌ها */}
                    <polyline
                      points={svgPoints}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={Math.max(16, strokeW * 4)}
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ pointerEvents: 'stroke' }}
                    />
                    <polyline
                      points={svgPoints}
                      fill="none"
                      stroke={isSelected ? '#00D4FF' : isHovered ? '#FFFFFF' : (feat.style.strokeColor || layerColor || '#38BDF8')}
                      strokeWidth={strokeW}
                      vectorEffect="non-scaling-stroke"
                      strokeDasharray={getStrokeDashArray(layerStrokeDash)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-150"
                      style={{ pointerEvents: 'stroke' }}
                    />
                    
                    {/* برچسب خط یا باند */}
                    {showLabel && (
                      <g className="pointer-events-none select-none">
                        <rect
                          x={midPtSvg[0] - 25}
                          y={midPtSvg[1] - 16}
                          width={Math.max(50, feat.name.length * 6 + 10)}
                          height="14"
                          rx="3"
                          fill="#0F172A"
                          fillOpacity="0.85"
                          stroke={feat.style.strokeColor || layerColor || '#38BDF8'}
                          strokeWidth="0.7"
                          vectorEffect="non-scaling-stroke"
                        />
                        <text
                          x={midPtSvg[0]}
                          y={midPtSvg[1] - 6}
                          textAnchor="middle"
                          fill="#E2E8F0"
                          fontSize="8"
                          fontWeight="600"
                        >
                          {feat.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              }

              // ۳. نقاط (سرچال، بنچ‌مارک)
              if (feat.type === 'POINT' && feat.coordinates[0]) {
                const [ptSvgX, ptSvgY] = utmToSvg(feat.coordinates[0][0], feat.coordinates[0][1]);
                const baseRadius = feat.style.pointRadius || 3.5;
                const r = isSelected ? baseRadius + 2.5 : isHovered ? baseRadius + 1.5 : baseRadius;

                return (
                  <g
                    key={feat.id}
                    onClick={(e) => handleFeatureClick(e, feat)}
                    onMouseEnter={() => setHoveredFeatureId(feat.id)}
                    onMouseLeave={() => setHoveredFeatureId(null)}
                    className="cursor-pointer group"
                    opacity={layerOpacity}
                  >
                    {/* دایره نامرئی بزرگ برای انتخاب فوق‌العاده سریع و نرم نقاط و چال‌ها در هر زومی */}
                    <circle
                      cx={ptSvgX}
                      cy={ptSvgY}
                      r={Math.max(14, r * 2.5)}
                      fill="transparent"
                      stroke="none"
                      style={{ pointerEvents: 'all' }}
                    />
                    <circle
                      cx={ptSvgX}
                      cy={ptSvgY}
                      r={r}
                      fill={feat.style.fillColor || layerColor || '#EC4899'}
                      stroke={isSelected ? '#00D4FF' : '#0F172A'}
                      strokeWidth={isSelected ? 2 : 1}
                      vectorEffect="non-scaling-stroke"
                      className="transition-all duration-150"
                      style={{ pointerEvents: 'all' }}
                    />
                    {showLabel && (
                      <text
                        x={ptSvgX + 6}
                        y={ptSvgY + 3}
                        fill="#F1F5F9"
                        fontSize="8"
                        fontFamily="monospace"
                        className="pointer-events-none font-bold drop-shadow-sm select-none"
                      >
                        {feat.properties?.code || feat.name}
                      </text>
                    )}
                  </g>
                );
              }

              // ۴. دایره و حریم‌های ایمنی (Circle Zones)
              if (feat.type === 'CIRCLE_ZONE' && feat.coordinates[0]) {
                const [ptSvgX, ptSvgY] = utmToSvg(feat.coordinates[0][0], feat.coordinates[0][1]);
                const radiusSvg = (feat.properties?.radiusM || 40) * uniformScale;
                return (
                  <g
                    key={feat.id}
                    onClick={(e) => handleFeatureClick(e, feat)}
                    className="cursor-pointer group"
                    opacity={layerOpacity}
                  >
                    <circle
                      cx={ptSvgX}
                      cy={ptSvgY}
                      r={radiusSvg}
                      fill={feat.style.fillColor || layerColor || '#EF4444'}
                      fillOpacity={feat.style.fillOpacity || 0.15}
                      stroke={isSelected ? '#00D4FF' : (feat.style.strokeColor || layerColor || '#EF4444')}
                      strokeWidth={isSelected ? 2.5 : 1.2}
                      vectorEffect="non-scaling-stroke"
                      strokeDasharray={getStrokeDashArray(layerStrokeDash) || '4 4'}
                    />
                    {showLabel && (
                      <text
                        x={ptSvgX}
                        y={ptSvgY}
                        textAnchor="middle"
                        fill="#FCA5A5"
                        fontSize="9"
                        fontWeight="bold"
                        className="pointer-events-none select-none"
                      >
                        ⚠️ {feat.name}
                      </text>
                    )}
                  </g>
                );
              }

              // ۵. یادداشت متنی (Text Annotation)
              if (feat.type === 'TEXT_ANNOTATION' && feat.coordinates[0]) {
                const [ptSvgX, ptSvgY] = utmToSvg(feat.coordinates[0][0], feat.coordinates[0][1]);
                return (
                  <g
                    key={feat.id}
                    onClick={(e) => handleFeatureClick(e, feat)}
                    className="cursor-pointer select-none"
                    opacity={layerOpacity}
                  >
                    <rect
                      x={ptSvgX - 4}
                      y={ptSvgY - 12}
                      width={feat.name.length * 7 + 12}
                      height="18"
                      rx="3"
                      fill="#0F172A"
                      fillOpacity="0.85"
                      stroke={isSelected ? '#00D4FF' : (feat.style.strokeColor || layerColor || '#FBBF24')}
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                    <text
                      x={ptSvgX + 2}
                      y={ptSvgY}
                      fill={feat.style.textColor || layerColor || '#FBBF24'}
                      fontSize="9"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      📌 {feat.name}
                    </text>
                  </g>
                );
              }

              return null;
            })}

            {/* خطوط و نقاط در حال ترسیم (Active Drawing Preview & Rubber Band) */}
            {drawingPoints.length > 0 && (
              <g className="pointer-events-none">
                {/* چندضلعی‌های در حال ترسیم: ساب‌بلوک، باند حفاری، باند جنس سنگ */}
                {(activeTool === 'POLYGON' || activeTool === 'DRILLING_BAND' || activeTool === 'GEOLOGY_ROCK_BAND') && drawingPoints.length >= 2 && (
                  <polygon
                    points={drawingPoints.map(pt => utmToSvg(pt[0], pt[1])).map(p => `${p[0]},${p[1]}`).join(' ')}
                    fill={activeTool === 'DRILLING_BAND' ? '#F97316' : activeTool === 'GEOLOGY_ROCK_BAND' ? '#8B5CF6' : '#00D4FF'}
                    fillOpacity="0.22"
                    stroke={activeTool === 'DRILLING_BAND' ? '#F97316' : activeTool === 'GEOLOGY_ROCK_BAND' ? '#8B5CF6' : '#00D4FF'}
                    strokeWidth="1.8"
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray="4 4"
                  />
                )}

                {/* خطوط در حال ترسیم: رمپ/مسیر، گسل ساختاری، اندازه‌گیری */}
                {(activeTool === 'POLYLINE' || activeTool === 'GEOLOGY_FAULT' || activeTool === 'MEASURE') && drawingPoints.length >= 2 && (
                  <polyline
                    points={drawingPoints.map(pt => utmToSvg(pt[0], pt[1])).map(p => `${p[0]},${p[1]}`).join(' ')}
                    fill="none"
                    stroke={activeTool === 'GEOLOGY_FAULT' ? '#DC2626' : activeTool === 'MEASURE' ? '#F59E0B' : '#38BDF8'}
                    strokeWidth="2.2"
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray="4 4"
                  />
                )}

                {/* خط راهنمای زنده لاستیکی (Rubber-Band Line) از آخرین رأس تا موقعیت نشانگر */}
                {cursorCoords && drawingPoints.length > 0 && (
                  (() => {
                    const lastPt = drawingPoints[drawingPoints.length - 1];
                    const [p1x, p1y] = utmToSvg(lastPt[0], lastPt[1]);
                    const [p2x, p2y] = utmToSvg(cursorCoords.utmX, cursorCoords.utmY);
                    return (
                      <line
                        x1={p1x}
                        y1={p1y}
                        x2={p2x}
                        y2={p2y}
                        stroke={activeTool === 'GEOLOGY_FAULT' ? '#DC2626' : activeTool === 'DRILLING_BAND' ? '#F97316' : '#00F0FF'}
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.8"
                      />
                    );
                  })()
                )}

                {/* نقاط رأس‌های در حال ترسیم و شماره ترتیب هر رأس */}
                {drawingPoints.map((pt, idx) => {
                  const [sx, sy] = utmToSvg(pt[0], pt[1]);
                  const isFirst = idx === 0;
                  const isLast = idx === drawingPoints.length - 1;
                  return (
                    <g key={idx}>
                      {/* حلقه بستن چندضلعی برای رأس اول در صورت داشتن بیش از ۲ رأس */}
                      {isFirst && drawingPoints.length >= 2 && (activeTool === 'POLYGON' || activeTool === 'DRILLING_BAND' || activeTool === 'GEOLOGY_ROCK_BAND') && (
                        <circle
                          cx={sx}
                          cy={sy}
                          r="14"
                          fill="rgba(16, 185, 129, 0.25)"
                          stroke="#10B981"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                          className="cursor-pointer animate-pulse"
                          onClick={(e) => {
                            e.stopPropagation();
                            finalizeDrawing();
                          }}
                        />
                      )}
                      <circle
                        cx={sx}
                        cy={sy}
                        r={isLast ? "5" : isFirst ? "6" : "3.5"}
                        fill={isLast ? "#38BDF8" : isFirst ? "#10B981" : "#00D4FF"}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                        className={isFirst && drawingPoints.length >= 2 ? "cursor-pointer hover:scale-125 transition-transform" : ""}
                        onClick={(e) => {
                          if (isFirst && drawingPoints.length >= 2) {
                            e.stopPropagation();
                            finalizeDrawing();
                          }
                        }}
                      />
                      {/* برچسب شماره رأس */}
                      <text
                        x={sx + 6}
                        y={sy - 4}
                        fill="#FFFFFF"
                        fontSize="9"
                        fontWeight="bold"
                        className="select-none font-mono"
                        style={{ textShadow: '0 0 4px #000000' }}
                      >
                        {idx + 1}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* قطب‌نما و نشانگر شمال (Compass / North Indicator) */}
      <div className="absolute top-16 right-4 z-20 flex flex-col items-center gap-1 pointer-events-auto">
        <button
          onClick={zoomToExtents}
          title="جهت شمال (کلیک برای ریست دید)"
          className="w-9 h-9 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-800 flex flex-col items-center justify-center hover:border-cyan-500 shadow-xl group transition-all"
        >
          <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[7px] border-b-red-500 -mb-0.5 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-black text-cyan-400 font-mono">N</span>
          <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[7px] border-t-slate-500 -mt-0.5" />
        </button>
      </div>

      {/* نوار پایین: راهنمای لایه‌ها، مقیاس خطی زنده و مشخصات المان */}
      <div className="absolute bottom-3 right-4 left-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* راهنمای سریع لایه‌ها */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[10.5px] shadow-lg pointer-events-auto text-slate-300">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-400" />
            <span>ساب‌بلوک‌ها</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <span>چال / بنچ‌مارک</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-3 h-0.5 bg-cyan-400" />
            <span>Crest / Toe</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-3 h-0.5 bg-blue-400" />
            <span>راه / رمپ</span>
          </span>
        </div>

        {/* مقیاس خطی استاندارد مهندسی (Graphic Scale Bar) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-lg pointer-events-auto text-slate-300 font-mono text-[10px]">
          <span className="text-slate-400 font-bold">مقیاس:</span>
          <div className="flex flex-col items-center">
            <div className="flex justify-between w-full text-[8.5px] text-cyan-300 px-0.5 font-bold">
              <span>0</span>
              <span>{scaleBarInfo.meters >= 1000 ? `${(scaleBarInfo.meters / 1000).toFixed(1)}km` : `${scaleBarInfo.meters}m`}</span>
            </div>
            <div
              style={{ width: `${scaleBarInfo.pixelWidth}px` }}
              className="h-1 bg-gradient-to-r from-cyan-400 via-slate-600 to-cyan-400 border border-slate-400 rounded-sm"
            />
          </div>
        </div>

        {/* جعبه کنترل المان انتخاب شده */}
        {selectedFeature && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 shadow-xl pointer-events-auto text-xs animate-fade-in">
            <span className="font-bold text-white flex items-center gap-1.5">
              <SparklesIcon className="w-4 h-4 text-cyan-400" />
              <span>{selectedFeature.name}</span>
            </span>
            <span className="text-slate-400 text-[10px]">({selectedFeature.category})</span>

            <button
              onClick={() => zoomToFeature(selectedFeature)}
              title="تمرکز و زوم روی عارضه"
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 text-[10px] font-bold flex items-center gap-1"
            >
              <ViewfinderCircleIcon className="w-3.5 h-3.5" />
              <span>زوم</span>
            </button>

            {canEdit && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  onClick={() => onEditFeatureRequest(selectedFeature)}
                  className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 border border-cyan-500/30 flex items-center gap-1 font-bold text-[10px]"
                >
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                  <span>ویرایش</span>
                </button>
                <button
                  onClick={() => handleFeatureDelete(selectedFeature)}
                  className="p-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 border border-red-500/30"
                  title="حذف المان"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapCanvasEditor;
