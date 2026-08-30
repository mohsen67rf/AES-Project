// src/modules/equipment/presentation/components/EquipmentMapCanvas.tsx

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { 
  EquipmentItem, 
  EquipmentCategory, 
  EquipmentStatus, 
  MineMapZone 
} from '../../domain/types/equipment.types';
import { MINE_MAP_ZONES } from '../../services/EquipmentService';
import { SurveyMapService } from '../../../mine/services/SurveyMapService';
import type { SurveyMap, MapFeature } from '../../../../core/domain/types/survey-map.types';
import { EquipmentVectorIcon } from './EquipmentVectorIcons';
import { STATUS_CONFIG } from './EquipmentPropertiesSidebar';
import { 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon, 
  ArrowsPointingOutIcon, 
  CursorArrowRaysIcon,
  CheckIcon,
  EyeIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  ClockIcon,
  FireIcon,
  BoltIcon,
  MapIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface EquipmentMapCanvasProps {
  items: EquipmentItem[];
  selectedCategories: EquipmentCategory[];
  statusFilter: EquipmentStatus | 'ALL';
  searchQuery: string;
  isPlacementMode: boolean;
  activePlacementItemId: string | null;
  onUpdatePosition: (id: string, x: number, y: number, benchLevel?: number, zoneNameFa?: string) => void;
  onSelectEquipment: (item: EquipmentItem) => void;
  selectedEquipmentId: string | null;
  isDark: boolean;
  onTogglePlacementMode: () => void;
  onStatusChange?: (id: string, newStatus: EquipmentStatus) => void;
  onEditEquipment?: (item: EquipmentItem) => void;
}

export const EquipmentMapCanvas: React.FC<EquipmentMapCanvasProps> = ({
  items,
  selectedCategories,
  statusFilter,
  searchQuery,
  isPlacementMode,
  activePlacementItemId,
  onUpdatePosition,
  onSelectEquipment,
  selectedEquipmentId,
  isDark,
  onTogglePlacementMode,
  onStatusChange,
  onEditEquipment
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // دریافت لیست کلیه نقشه‌های بارگذاری شده از ماژول GIS و نقشه
  const [availableMaps, setAvailableMaps] = useState<SurveyMap[]>(() => SurveyMapService.getAllMaps());
  const [activeMapId, setActiveMapId] = useState<string>(() => {
    const maps = SurveyMapService.getAllMaps();
    return maps.length > 0 ? maps[0].id : '';
  });

  const activeSurveyMap = useMemo(() => {
    return availableMaps.find(m => m.id === activeMapId) || availableMaps[0] || null;
  }, [availableMaps, activeMapId]);

  // بزرگنمایی و جابجایی (Zoom & Pan)
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // ضریب اندازه پایه آیکون‌های ماشین‌آلات (جهت تنظیم کاربر)
  const [markerScaleMultiplier, setMarkerScaleMultiplier] = useState<number>(1);

  // وضعیت کشیدن و رها کردن تجهیزات (Drag & Drop)
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragCurrentPos, setDragCurrentPos] = useState<{ x: number; y: number } | null>(null);

  // مودال داینامیک هاور با تاخیر ۲ ثانیه‌ای (2-Second Delay Dynamic Hover Modal)
  const [hoveredItem, setHoveredItem] = useState<EquipmentItem | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const popoverCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // فیلتر لایه‌های نقشه
  const [showSurveyFeatures, setShowSurveyFeatures] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showEquipmentLabels, setShowEquipmentLabels] = useState(true);

  // ابعاد پایه بوم
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  // محاسبه ابعاد و بازه مختصات نقشه فعال
  const mapBounds = useMemo(() => {
    if (activeSurveyMap?.features && activeSurveyMap.features.length > 0) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      let hasValid = false;
      activeSurveyMap.features.forEach(f => {
        if (f.geometry?.coordinates) {
          const coords = Array.isArray(f.geometry.coordinates[0]) 
            ? f.geometry.coordinates as [number, number][] 
            : [f.geometry.coordinates as [number, number]];
          coords.forEach(([x, y]) => {
            if (!isNaN(x) && !isNaN(y)) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              hasValid = true;
            }
          });
        }
      });
      if (hasValid && maxX > minX && maxY > minY) {
        return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
      }
    }
    return { minX: 584000, maxX: 585000, minY: 3512500, maxY: 3513500, width: 1000, height: 1000 };
  }, [activeSurveyMap]);

  // تبدیل مختصات واقعی نقشه به پیکسل بوم
  const transformToCanvas = useCallback((utmX: number, utmY: number): [number, number] => {
    const PADDING = 40;
    const drawWidth = CANVAS_WIDTH - PADDING * 2;
    const drawHeight = CANVAS_HEIGHT - PADDING * 2;

    const normX = (utmX - mapBounds.minX) / (mapBounds.width || 1);
    const normY = 1 - (utmY - mapBounds.minY) / (mapBounds.height || 1);

    const canvasX = PADDING + normX * drawWidth;
    const canvasY = PADDING + normY * drawHeight;
    return [canvasX, canvasY];
  }, [mapBounds]);

  // فیلتر آیتم‌ها بر اساس فیلتر چندگانه دسته‌بندی، وضعیت و جستجو
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.code.toLowerCase().includes(q) ||
          item.nameFa.toLowerCase().includes(q) ||
          item.operatorName.toLowerCase().includes(q) ||
          item.position.zoneNameFa.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, selectedCategories, statusFilter, searchQuery]);

  // محاسبه موقعیت ماوس نسبت به نقشه به درصد (0 تا 100) با در نظر گرفتن Pan و Zoom
  const getMapCoordinatesFromMouseEvent = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return { x: 50, y: 50 };
    const rect = mapContainerRef.current.getBoundingClientRect();
    
    // موقعیت خام ماوس داخل کانتینر
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // معکوس کردن ماتریس ترنسفرم Pan و Zoom
    const centerOffsetX = (rect.width * (1 - zoomLevel)) / 2;
    const centerOffsetY = (rect.height * (1 - zoomLevel)) / 2;

    const unscaledX = (mouseX - panOffset.x - centerOffsetX) / zoomLevel;
    const unscaledY = (mouseY - panOffset.y - centerOffsetY) / zoomLevel;

    const xPct = Math.max(2, Math.min(98, (unscaledX / rect.width) * 100));
    const yPct = Math.max(2, Math.min(98, (unscaledY / rect.height) * 100));
    
    return { x: Number(xPct.toFixed(1)), y: Number(yPct.toFixed(1)) };
  }, [zoomLevel, panOffset]);

  // شروع کشیدن یک ماشین
  const handleItemMouseDown = (e: React.MouseEvent, item: EquipmentItem) => {
    e.stopPropagation();
    if (!isPlacementMode) {
      onSelectEquipment(item);
      return;
    }
    setDraggingItemId(item.id);
    const coords = getMapCoordinatesFromMouseEvent(e as unknown as React.MouseEvent<HTMLDivElement>);
    setDragCurrentPos(coords);
  };

  // حرکت ماوس روی نقشه
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (draggingItemId && isPlacementMode) {
      const coords = getMapCoordinatesFromMouseEvent(e);
      setDragCurrentPos(coords);
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  // رها کردن ماوس
  const handleMouseUp = () => {
    if (draggingItemId && dragCurrentPos && isPlacementMode) {
      // ذخیره موقعیت جدید
      onUpdatePosition(draggingItemId, dragCurrentPos.x, dragCurrentPos.y);
      setDraggingItemId(null);
      setDragCurrentPos(null);
    }
    setIsPanning(false);
  };

  // کلیک روی نقشه در حالت جانمایی
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPlacementMode && activePlacementItemId) {
      const coords = getMapCoordinatesFromMouseEvent(e);
      onUpdatePosition(activePlacementItemId, coords.x, coords.y);
    }
  };

  // مدیریت هاور با تاخیر ۲ ثانیه و تعاملی بودن پاپ‌اور
  const handleMarkerMouseEnter = (item: EquipmentItem, e: React.MouseEvent) => {
    if (draggingItemId) return;
    if (popoverCloseTimerRef.current) {
      clearTimeout(popoverCloseTimerRef.current);
      popoverCloseTimerRef.current = null;
    }
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    const clientX = e.clientX;
    const clientY = e.clientY;

    hoverTimerRef.current = setTimeout(() => {
      setHoveredItem(item);
      setPopoverPos({ x: clientX, y: clientY });
    }, 2000);
  };

  const handleMarkerMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    popoverCloseTimerRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 350);
  };

  const handlePopoverMouseEnter = () => {
    if (popoverCloseTimerRef.current) {
      clearTimeout(popoverCloseTimerRef.current);
      popoverCloseTimerRef.current = null;
    }
  };

  const handlePopoverMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleMarkerClick = (e: React.MouseEvent, item: EquipmentItem) => {
    e.stopPropagation();
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    onSelectEquipment(item);
  };

  // شروع Pan با کشیدن پس‌زمینه
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0 && !isPlacementMode) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      });
    }
  };

  // زوم این و اوت
  const handleZoom = (delta: number) => {
    setZoomLevel(prev => {
      const next = Math.max(0.4, Math.min(3.5, prev + delta));
      return Number(next.toFixed(2));
    });
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // کنترل اسکرول ماوس برای زوم
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    handleZoom(delta);
  };

  // محاسبه اندازه بصری آیکون ماشین بر اساس زوم
  // در زوم اوت کوچک‌تر و در زوم این بزرگ‌تر می‌شود
  const computedMarkerDimension = useMemo(() => {
    // پایه ۲۶ پیکسل، متناسب با ریشه زوم مقیاس می‌گیرد تا نه خیلی ریز شود نه خیلی غول‌پیکر
    const base = 26 * markerScaleMultiplier;
    const scaled = base * Math.pow(zoomLevel, 0.75);
    return Math.max(16, Math.min(64, scaled));
  }, [zoomLevel, markerScaleMultiplier]);

  return (
    <div 
      className={`relative w-full h-full min-h-[550px] flex-1 rounded-3xl border overflow-hidden select-none flex flex-col ${
        isDark ? 'bg-[#080E1B] border-[#1E293B]' : 'bg-slate-100 border-slate-300'
      }`}
    >
      {/* ======================================================== */}
      {/* نوار ابزار بالای نقشه: انتخاب نقشه GIS، زوم، لایه‌ها */}
      {/* ======================================================== */}
      <div className={`p-2.5 sm:p-3 border-b flex flex-wrap items-center justify-between gap-2 z-10 backdrop-blur-md ${
        isDark ? 'bg-[#0B1323]/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200 text-slate-900'
      }`}>
        {/* سمت راست: انتخاب نقشه GIS آپلود شده + تراز و وضعیت */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <MapIcon className="w-4 h-4" />
            <span className="text-xs font-black">نقشه معدن:</span>
          </div>

          {availableMaps.length > 0 ? (
            <select
              value={activeMapId}
              onChange={(e) => setActiveMapId(e.target.value)}
              className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border focus:outline-none focus:border-cyan-400 cursor-pointer ${
                isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {availableMaps.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.version}) - تراز {m.benchLevel}m
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-400">نقشه پیش‌فرض پیت مرکزی</span>
          )}

          {activeSurveyMap && (
            <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
              تراز {activeSurveyMap.benchLevel}m
            </span>
          )}
        </div>

        {/* سمت چپ: کنترل‌های زوم، حالت جانمایی، لایه‌ها و مقیاس آیکون‌ها */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* دکمه سوئیچ حالت جانمایی (Placement Mode) */}
          <button
            onClick={onTogglePlacementMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isPlacementMode 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse font-black' 
                : isDark ? 'bg-[#0E172A] border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700'
            }`}
            title="فعال/غیرفعال کردن حالت جابجایی و جانمایی دستی ماشین‌آلات"
          >
            <CursorArrowRaysIcon className="w-4 h-4" />
            <span>{isPlacementMode ? 'حالت جانمایی فعال' : 'جانمایی ماشین‌آلات'}</span>
          </button>

          {/* ابزار زوم */}
          <div className={`flex items-center rounded-xl border p-0.5 ${
            isDark ? 'bg-[#0E172A] border-slate-700' : 'bg-white border-slate-300'
          }`}>
            <button
              onClick={() => handleZoom(0.2)}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
              title="بزرگنمایی (Zoom In)"
            >
              <MagnifyingGlassPlusIcon className="w-4 h-4" />
            </button>
            <span className="px-2 text-[11px] font-mono font-bold text-cyan-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(-0.2)}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
              title="کوچکنمایی (Zoom Out)"
            >
              <MagnifyingGlassMinusIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors border-r border-slate-700/50"
              title="بازنشانی زاویه دید (Reset 100%)"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
          </div>

          {/* کنترل مقیاس اندازه وکتورها */}
          <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs ${
            isDark ? 'bg-[#0E172A] border-slate-700' : 'bg-white border-slate-300'
          }`}>
            <span className="text-[10px] text-slate-400">اندازه آیکون:</span>
            <button 
              onClick={() => setMarkerScaleMultiplier(0.8)} 
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${markerScaleMultiplier === 0.8 ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              ریز
            </button>
            <button 
              onClick={() => setMarkerScaleMultiplier(1.0)} 
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${markerScaleMultiplier === 1.0 ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              عادی
            </button>
            <button 
              onClick={() => setMarkerScaleMultiplier(1.3)} 
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${markerScaleMultiplier === 1.3 ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              درشت
            </button>
          </div>

          {/* تاگل نمایش برچسب‌ها */}
          <button
            onClick={() => setShowEquipmentLabels(!showEquipmentLabels)}
            className={`p-1.5 rounded-xl border text-xs ${
              showEquipmentLabels 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                : isDark ? 'bg-[#0E172A] border-slate-700 text-slate-400' : 'bg-white border-slate-300 text-slate-600'
            }`}
            title="نمایش/عدم نمایش کد ماشین‌ها زیر آیکون"
          >
            <span className="text-[11px] font-bold px-1">کد</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* بوم نقشه (Canvas Map Viewport) با پشتیبانی Pan و Zoom */}
      {/* ======================================================== */}
      <div 
        ref={mapContainerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleMapClick}
        onWheel={handleWheel}
        className={`relative flex-1 w-full h-full overflow-hidden cursor-grab ${
          isPanning ? 'cursor-grabbing' : isPlacementMode ? 'cursor-crosshair' : 'cursor-grab'
        }`}
      >
        {/* لایه ترنسفرم شده Pan و Zoom */}
        <div 
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isPanning || draggingItemId ? 'none' : 'transform 0.15s ease-out',
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0
          }}
        >
          {/* نقشه وکتوری SVG معدن (برگرفته از SurveyMapService واقعی) */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* تعریف گرادینت‌ها و پترن‌های مهندسی معدن */}
            <defs>
              <pattern id="mineGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} strokeWidth="0.8" />
              </pattern>
              
              <linearGradient id="pitDepthGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={isDark ? "#0A1528" : "#E2E8F0"} />
                <stop offset="50%" stopColor={isDark ? "#08101E" : "#CBD5E1"} />
                <stop offset="100%" stopColor={isDark ? "#040810" : "#94A3B8"} />
              </linearGradient>

              {/* پترن بافت سنگ‌آهن و پله */}
              <pattern id="benchHatch" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="20" stroke={isDark ? "#00D4FF" : "#0284C7"} strokeWidth="0.6" strokeOpacity="0.15" />
              </pattern>
            </defs>

            {/* پس‌زمینه پیت معدن */}
            <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#pitDepthGradient)" />
            {showGrid && <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#mineGrid)" />}

            {/* اگر تصویر رستری آپلود شده باشد (Raster Satellite / Drone Orthophoto) */}
            {activeSurveyMap?.rasterImageUrl && (
              <image
                href={activeSurveyMap.rasterImageUrl}
                x="40"
                y="40"
                width={CANVAS_WIDTH - 80}
                height={CANVAS_HEIGHT - 80}
                opacity={0.75}
                preserveAspectRatio="none"
              />
            )}

            {/* رندر زون‌های معدن به عنوان پس‌زمینه */}
            {showZones && MINE_MAP_ZONES.map((zone) => {
              const x = (zone.bounds.xMin / 100) * CANVAS_WIDTH;
              const y = (zone.bounds.yMin / 100) * CANVAS_HEIGHT;
              const w = ((zone.bounds.xMax - zone.bounds.xMin) / 100) * CANVAS_WIDTH;
              const h = ((zone.bounds.yMax - zone.bounds.yMin) / 100) * CANVAS_HEIGHT;

              return (
                <g key={zone.id} className="transition-opacity hover:opacity-100">
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx="16"
                    fill={zone.color}
                    fillOpacity={isDark ? 0.08 : 0.12}
                    stroke={zone.color}
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={x + w / 2}
                    y={y + 20}
                    textAnchor="middle"
                    fill={zone.color}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="inherit"
                    opacity={0.85}
                  >
                    {zone.nameFa} (تراز {zone.benchLevel}m)
                  </text>
                </g>
              );
            })}

            {/* رندر خطوط پله‌ها و عوارض نقشه‌برداری واقعی از `activeSurveyMap.features` */}
            {showSurveyFeatures && activeSurveyMap?.features && activeSurveyMap.features.map((feature: MapFeature) => {
              if (!feature.geometry?.coordinates) return null;

              if (feature.geometry.type === 'LineString' || feature.type === 'LINE') {
                const coords = feature.geometry.coordinates as [number, number][];
                const pathData = coords.map((pt, idx) => {
                  const [cx, cy] = transformToCanvas(pt[0], pt[1]);
                  return `${idx === 0 ? 'M' : 'L'} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
                }).join(' ');

                const isCrest = feature.category === 'BENCH_CREST';
                const isToe = feature.category === 'BENCH_TOE';
                const isRoad = feature.category === 'HAUL_ROAD';

                return (
                  <path
                    key={feature.id}
                    d={pathData}
                    fill="none"
                    stroke={feature.color || (isCrest ? '#00D4FF' : isToe ? '#38BDF8' : isRoad ? '#F59E0B' : '#64748B')}
                    strokeWidth={isCrest ? 2.5 : isRoad ? 4 : 1.5}
                    strokeDasharray={isToe ? '6,4' : undefined}
                    strokeOpacity={0.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              }

              if (feature.geometry.type === 'Polygon' || feature.type === 'POLYGON') {
                const coords = feature.geometry.coordinates as [number, number][];
                const pathData = coords.map((pt, idx) => {
                  const [cx, cy] = transformToCanvas(pt[0], pt[1]);
                  return `${idx === 0 ? 'M' : 'L'} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
                }).join(' ') + ' Z';

                return (
                  <path
                    key={feature.id}
                    d={pathData}
                    fill={feature.color || '#10B981'}
                    fillOpacity={0.15}
                    stroke={feature.color || '#10B981'}
                    strokeWidth={1.5}
                  />
                );
              }

              return null;
            })}

            {/* خطوط تراز و کانتورهای فرضی زیباسازی در صورت عدم وجود خطوط برداری */}
            {showContours && (!activeSurveyMap?.features || activeSurveyMap.features.length === 0) && (
              <g opacity={0.6}>
                {/* حلقه پله‌های استخراجی بیرونی به درونی */}
                <ellipse cx="600" cy="400" rx="520" ry="340" fill="none" stroke="#00D4FF" strokeWidth="2.5" strokeDasharray="3,3" />
                <ellipse cx="600" cy="400" rx="440" ry="280" fill="none" stroke="#38BDF8" strokeWidth="2" />
                <ellipse cx="600" cy="400" rx="360" ry="220" fill="none" stroke="#00D4FF" strokeWidth="2" strokeDasharray="5,3" />
                <ellipse cx="600" cy="400" rx="280" ry="160" fill="none" stroke="#38BDF8" strokeWidth="1.8" />
                <ellipse cx="600" cy="400" rx="200" ry="110" fill="none" stroke="#00D4FF" strokeWidth="1.5" />
                <ellipse cx="600" cy="400" rx="120" ry="60" fill="url(#benchHatch)" stroke="#00D4FF" strokeWidth="1.5" />
                
                {/* رمپ‌های اصلی و جاده حمل بار */}
                <path d="M 120 700 Q 300 650 600 560 T 950 350 T 800 150" fill="none" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.8" />
                <path d="M 120 700 Q 300 650 600 560 T 950 350 T 800 150" fill="none" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="8,6" />
              </g>
            )}
          </svg>

          {/* ======================================================== */}
          {/* لایه نشانگرهای ماشین‌آلات با وکتورهای سبک و مقیاس‌پذیر */}
          {/* ======================================================== */}
          {filteredItems.map((item) => {
            const isSelected = selectedEquipmentId === item.id;
            const isBeingDragged = draggingItemId === item.id;
            const isBeingPlaced = isPlacementMode && activePlacementItemId === item.id;

            // موقعیت موقت در زمان درگ یا موقعیت ثابت
            const posX = isBeingDragged && dragCurrentPos ? dragCurrentPos.x : item.position.x;
            const posY = isBeingDragged && dragCurrentPos ? dragCurrentPos.y : item.position.y;

            return (
              <div
                key={item.id}
                onMouseDown={(e) => handleItemMouseDown(e, item)}
                onClick={(e) => handleMarkerClick(e, item)}
                onMouseEnter={(e) => handleMarkerMouseEnter(item, e)}
                onMouseLeave={handleMarkerMouseLeave}
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${computedMarkerDimension}px`,
                  height: `${computedMarkerDimension}px`
                }}
                className={`absolute z-30 flex flex-col items-center justify-center cursor-pointer transition-transform ${
                  isBeingDragged ? 'scale-125 z-50 opacity-90' : 'hover:scale-115'
                }`}
              >
                {/* حلقه پالس فعال یا انتخاب شده */}
                {isSelected && (
                  <div className="absolute -inset-2 rounded-full border-2 border-cyan-400 animate-ping opacity-75 pointer-events-none" />
                )}
                {isBeingPlaced && (
                  <div className="absolute -inset-3 rounded-full border-2 border-amber-400 animate-pulse pointer-events-none" />
                )}

                {/* نشانگر گرد وکتوری کم‌حجم */}
                <div 
                  className={`w-full h-full rounded-2xl flex items-center justify-center border shadow-lg transition-all ${
                    isSelected 
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 shadow-cyan-500/50' 
                      : item.status === 'ACTIVE'
                        ? 'bg-[#0F172A] border-emerald-500/80 text-emerald-400 shadow-emerald-950/40'
                        : item.status === 'HAULING'
                          ? 'bg-[#0F172A] border-cyan-500/80 text-cyan-400 shadow-cyan-950/40'
                          : item.status === 'MAINTENANCE'
                            ? 'bg-[#0F172A] border-rose-500/80 text-rose-400'
                            : 'bg-[#0F172A] border-amber-500/80 text-amber-400'
                  }`}
                  style={{
                    boxShadow: isSelected ? '0 0 16px rgba(0, 212, 255, 0.6)' : undefined
                  }}
                >
                  <EquipmentVectorIcon 
                    category={item.category} 
                    size={Math.max(14, computedMarkerDimension * 0.65)} 
                    color={isSelected ? '#020617' : undefined}
                  />

                  {/* نقطه وضعیت کوچک گوشه بالا */}
                  <span 
                    className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-900 ${
                      STATUS_CONFIG[item.status].dotClass
                    }`} 
                  />
                </div>

                {/* برچسب کد ماشین زیر آیکون (بدون شلوغ‌کاری و فشرده) */}
                {showEquipmentLabels && (
                  <div className="absolute top-full mt-1 pointer-events-none">
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded-md whitespace-nowrap shadow border leading-tight block ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                        : isDark ? 'bg-slate-900/90 text-slate-200 border-slate-700' : 'bg-white/90 text-slate-800 border-slate-300'
                    }`}>
                      {item.code}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* راهنمای حالت جانمایی شناور بالای بوم */}
        {/* ======================================================== */}
        {isPlacementMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-amber-500/90 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs shadow-lg backdrop-blur-md flex items-center gap-2 border border-amber-300">
            <CursorArrowRaysIcon className="w-4 h-4 animate-spin" />
            <span>
              {activePlacementItemId 
                ? `در حال جانمایی دستگاه ${activePlacementItemId}: روی نقطه مورد نظر در نقشه کلیک کنید`
                : 'حالت جانمایی فعال است: یک ماشین را از نقشه یا سایدبار بکشید و رها کنید'}
            </span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* مودال داینامیک و متحرک هاور ۲ ثانیه‌ای (Compact Dynamic Popover) */}
      {/* ======================================================== */}
      {hoveredItem && !draggingItemId && (
        <div 
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
          style={{
            position: 'fixed',
            left: `${Math.min(window.innerWidth - 300, Math.max(16, popoverPos.x + 12))}px`,
            top: `${Math.min(window.innerHeight - 280, Math.max(16, popoverPos.y + 12))}px`,
            pointerEvents: 'auto'
          }}
          className={`z-50 w-72 rounded-2xl p-3 border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 ${
            isDark ? 'bg-[#0B1323]/95 border-cyan-500/40 text-white' : 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-900/20'
          }`}
        >
          {/* سربرگ مودال داینامیک */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-700/50">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 rounded-xl bg-slate-900 border border-slate-700 flex-shrink-0">
                <EquipmentVectorIcon category={hoveredItem.category} size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-cyan-400 font-mono">{hoveredItem.code}</span>
                  <span className="text-[10px] text-slate-400 truncate">{hoveredItem.nameFa}</span>
                </div>
                <span className="text-[9px] text-slate-400 block truncate">{hoveredItem.brand} {hoveredItem.model}</span>
              </div>
            </div>
            <button
              onClick={() => setHoveredItem(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
              title="بستن"
            >
              ✕
            </button>
          </div>

          {/* آمار کارکرد روزانه */}
          <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px]">
            <div className={`p-1.5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-slate-400 block text-[9px]">کارکرد امروز:</span>
              <span className="font-black text-emerald-400 text-xs">{hoveredItem.dailyStats.operatingHoursToday} ساعت</span>
            </div>
            <div className={`p-1.5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-slate-400 block text-[9px]">مصرف گازوئیل:</span>
              <span className="font-black text-amber-400 text-xs">{hoveredItem.dailyStats.fuelConsumedLitersToday} لیتر</span>
            </div>
          </div>

          {/* اطلاعات موقعیت و اپراتور */}
          <div className="mt-2 text-[10px] text-slate-300 space-y-1">
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span className="text-slate-400">موقعیت:</span>
              <span className="font-bold text-cyan-300">{hoveredItem.position.zoneNameFa} (تراز {hoveredItem.position.benchLevel}m)</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span className="text-slate-400">راننده:</span>
              <span className="font-bold text-slate-200">{hoveredItem.operatorName}</span>
            </div>
          </div>

          {/* امکان تغییر مستقیم وضعیت در همین مودال (Quick Status Edit) */}
          <div className="mt-2 pt-2 border-t border-slate-800">
            <label className="block text-[9px] font-bold text-slate-400 mb-1">تغییر وضعیت:</label>
            <div className="grid grid-cols-3 gap-1">
              {(['ACTIVE', 'STANDBY', 'MAINTENANCE'] as EquipmentStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    if (onStatusChange) onStatusChange(hoveredItem.id, st);
                    setHoveredItem(prev => prev && prev.id === hoveredItem.id ? { ...prev, status: st } : prev);
                  }}
                  className={`py-0.5 px-1 rounded-lg text-[9px] font-bold border transition-all ${
                    hoveredItem.status === st
                      ? STATUS_CONFIG[st].badgeClass + ' ring-1 ring-cyan-400 font-black'
                      : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  {STATUS_CONFIG[st].labelFa}
                </button>
              ))}
            </div>
          </div>

          {/* دکمه‌های اقدام سریع (مشاهده جزئیات / جانمایی) */}
          <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onSelectEquipment(hoveredItem);
                setHoveredItem(null);
              }}
              className="py-1 px-2 rounded-xl text-[10px] font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1 transition-all"
            >
              <EyeIcon className="w-3 h-3" />
              <span>مشاهده مشخصات</span>
            </button>

            <button
              onClick={() => {
                onSelectEquipment(hoveredItem);
                if (onEditEquipment) onEditEquipment(hoveredItem);
                setHoveredItem(null);
              }}
              className="py-1 px-2 rounded-xl text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1 transition-all"
            >
              <WrenchScrewdriverIcon className="w-3 h-3" />
              <span>ویرایش اطلاعات</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
