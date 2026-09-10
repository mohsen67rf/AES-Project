// src/modules/equipment/presentation/components/EquipmentMapCanvas.tsx

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { 
  EquipmentItem, 
  EquipmentCategory, 
  EquipmentStatus 
} from '../../domain/types/equipment.types';
import { SurveyMapService } from '../../../mine/services/SurveyMapService';
import type { SurveyMap, MapFeature } from '../../../../core/domain/types/survey-map.types';
import { EquipmentVectorIcon } from './EquipmentVectorIcons';
import { STATUS_CONFIG } from './EquipmentPropertiesSidebar';
import { 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon, 
  ArrowsPointingOutIcon, 
  CursorArrowRaysIcon,
  UserIcon,
  ClockIcon,
  FireIcon,
  MapIcon,
  XMarkIcon
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

  // دریافت لیست کلیه نقشه‌ها و نقشه مرجع فعال تعیین‌شده توسط واحد نقشه‌برداری
  const [availableMaps, setAvailableMaps] = useState<SurveyMap[]>(() => SurveyMapService.getAllMaps());
  const [activeMapId, setActiveMapId] = useState<string>(() => SurveyMapService.getActiveMasterMapId());

  // هماهنگی بلادرنگ با به‌روزرسانی نقشه مرجع توسط واحد نقشه‌برداری
  useEffect(() => {
    const unsubscribe = SurveyMapService.subscribeToMasterMapUpdates((masterMap) => {
      setAvailableMaps(SurveyMapService.getAllMaps());
      if (masterMap?.id) {
        setActiveMapId(masterMap.id);
      }
    });

    return () => unsubscribe();
  }, []);

  const activeSurveyMap = useMemo(() => {
    return availableMaps.find(m => m.id === activeMapId) || availableMaps[0] || null;
  }, [availableMaps, activeMapId]);

  // بزرگنمایی و جابجایی (Zoom & Pan)
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // سایز قابل تنظیم آیکون ماشین‌آلات (بر حسب پیکسل)
  const [iconSize, setIconSize] = useState<number>(36);

  // وضعیت کشیدن و رها کردن تجهیزات (Drag & Drop)
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragCurrentPos, setDragCurrentPos] = useState<{ x: number; y: number } | null>(null);

  // مودال داینامیک هاور با تاخیر ۲ ثانیه‌ای (2-Second Delay Dynamic Hover Modal)
  const [hoveredItem, setHoveredItem] = useState<EquipmentItem | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // سوئیچ لایه‌های نمایش نقشه مرجع
  const [showSurveyFeatures, setShowSurveyFeatures] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showEquipmentLabels, setShowEquipmentLabels] = useState(true);

  // ابعاد پایه بوم وکتوری SVG
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;
  const PADDING = 40;

  // محاسبه ابعاد و محدوده مختصاتی نقشه مرجع واقعی
  const mapBounds = useMemo(() => {
    if (activeSurveyMap?.bounds && 
        activeSurveyMap.bounds.maxX > activeSurveyMap.bounds.minX && 
        activeSurveyMap.bounds.maxY > activeSurveyMap.bounds.minY) {
      return {
        minX: activeSurveyMap.bounds.minX,
        maxX: activeSurveyMap.bounds.maxX,
        minY: activeSurveyMap.bounds.minY,
        maxY: activeSurveyMap.bounds.maxY,
        width: activeSurveyMap.bounds.maxX - activeSurveyMap.bounds.minX,
        height: activeSurveyMap.bounds.maxY - activeSurveyMap.bounds.minY
      };
    }

    if (activeSurveyMap?.features && activeSurveyMap.features.length > 0) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      let hasValid = false;
      activeSurveyMap.features.forEach(f => {
        const coords = f.coordinates || (f as any).geometry?.coordinates || [];
        coords.forEach((pt: any) => {
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

    // پیش‌فرض UTM استاندارد معدن
    return { minX: 584000, maxX: 585500, minY: 3512000, maxY: 3513500, width: 1500, height: 1500 };
  }, [activeSurveyMap]);

  // مقیاس یکنواخت و همسانگرد (Isotropic Projection) بدون دفرمه شدن نقشه مرجع
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
      drawnHeight: dH
    };
  }, [mapBounds]);

  // تبدیل مختصات UTM نقشه مرجع به پیکسل بوم SVG
  const utmToSvg = useCallback((utmX: number, utmY: number): [number, number] => {
    const svgX = offsetX + (utmX - mapBounds.minX) * uniformScale;
    const svgY = offsetY + (mapBounds.maxY - utmY) * uniformScale; // معکوس Y در سیستم استاندارد کارتوگرافی
    return [svgX, svgY];
  }, [mapBounds, uniformScale, offsetX, offsetY]);

  // فیلتر آیتم‌ها بر اساس فیلترهای فعال در سایدبار
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

  // تبدیل موقعیت کلیک ماوس به مختصات درصد نقشه (0 تا 100)
  const getMapCoordinatesFromMouseEvent = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return { x: 50, y: 50 };
    const rect = mapContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const unzoomedX = (mouseX - centerX - panOffset.x) / zoomLevel + centerX;
    const unzoomedY = (mouseY - centerY - panOffset.y) / zoomLevel + centerY;

    const pctX = Math.max(0, Math.min(100, (unzoomedX / rect.width) * 100));
    const pctY = Math.max(0, Math.min(100, (unzoomedY / rect.height) * 100));

    return { 
      x: Number(pctX.toFixed(2)), 
      y: Number(pctY.toFixed(2)) 
    };
  }, [panOffset, zoomLevel]);

  // کلیک روی بوم نقشه
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPlacementMode) {
      const targetId = activePlacementItemId || selectedEquipmentId;
      if (targetId) {
        const coords = getMapCoordinatesFromMouseEvent(e);
        const benchLevel = activeSurveyMap?.benchLevel || 1040;
        const zoneName = activeSurveyMap?.title || 'نقشه مرجع معدن';
        onUpdatePosition(targetId, coords.x, coords.y, benchLevel, zoneName);
      }
    }
  };

  // شروع Drag یک ماشین
  const handleItemMouseDown = (e: React.MouseEvent, item: EquipmentItem) => {
    e.stopPropagation();
    if (e.button !== 0) return; // فقط کلیک چپ
    setDraggingItemId(item.id);
    setDragCurrentPos({ x: item.position.x, y: item.position.y });
    onSelectEquipment(item);

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setHoveredItem(null);
  };

  // رویداد کلیک روی آیکون ماشین
  const handleMarkerClick = (e: React.MouseEvent, item: EquipmentItem) => {
    e.stopPropagation();
    onSelectEquipment(item);
  };

  // مدیریت رویداد حرکت ماوس روی کانتینر برای Dragging یا Pan
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingItemId) {
      const coords = getMapCoordinatesFromMouseEvent(e);
      setDragCurrentPos(coords);
      return;
    }

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  // اتمام حرکت ماوس / رها کردن
  const handleMouseUp = () => {
    if (draggingItemId && dragCurrentPos) {
      const benchLevel = activeSurveyMap?.benchLevel || 1040;
      const zoneName = activeSurveyMap?.title || 'نقشه مرجع معدن';
      onUpdatePosition(draggingItemId, dragCurrentPos.x, dragCurrentPos.y, benchLevel, zoneName);
      setDraggingItemId(null);
      setDragCurrentPos(null);
    }

    if (isPanning) {
      setIsPanning(false);
    }
  };

  // شروع Pan روی بوم
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

  // اسکرول ماوس برای زوم
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    handleZoom(delta);
  };

  // مدیریت هاور ۲ ثانیه‌ای برای نمایش پاپ‌اور
  const handleMarkerMouseEnter = (item: EquipmentItem, e: React.MouseEvent) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = mapContainerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    
    setHoverPosition({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top
    });

    hoverTimerRef.current = setTimeout(() => {
      setHoveredItem(item);
    }, 1800);
  };

  const handleMarkerMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredItem(null);
  };

  // پیدا کردن ماشین در حال جانمایی
  const activePlacementItem = useMemo(() => {
    const id = activePlacementItemId || selectedEquipmentId;
    return items.find(e => e.id === id) || null;
  }, [items, activePlacementItemId, selectedEquipmentId]);

  return (
    <div 
      className={`relative w-full h-full min-h-[550px] flex-1 rounded-2xl border overflow-hidden select-none flex flex-col ${
        isDark ? 'bg-[#060B14] border-slate-800' : 'bg-slate-100 border-slate-300'
      }`}
    >
      {/* نوار ابزار بالای نقشه: انتخاب نقشه مرجع، زوم، لایه‌ها و سایز آیکون */}
      <div className={`p-2.5 sm:p-3 border-b flex flex-wrap items-center justify-between gap-2 z-10 backdrop-blur-md ${
        isDark ? 'bg-[#0B1323]/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        {/* سمت راست: انتخاب نقشه مرجع معتبر */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <MapIcon className="w-4 h-4" />
            <span className="text-xs font-black">نقشه مرجع معدن:</span>
          </div>

          {availableMaps.length > 0 ? (
            <select
              value={activeMapId}
              onChange={(e) => setActiveMapId(e.target.value)}
              className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border focus:outline-none focus:border-cyan-400 cursor-pointer ${
                isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {availableMaps.map((m, idx) => (
                <option key={m.id || `map-${idx}`} value={m.id}>
                  {m.isMasterMap ? '⭐ [نقشه مرجع مصوب] ' : ''}{m.title} ({m.code || 'CAD'}) - تراز {m.benchLevel}m
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-400">نقشه مرجع پیت معدن</span>
          )}

          {activeSurveyMap && (
            <div className="flex items-center gap-1.5">
              {activeSurveyMap.isMasterMap && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>نقشه مرجع رسمی</span>
                </span>
              )}
              <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
                تراز {activeSurveyMap.benchLevel}m
              </span>
            </div>
          )}
        </div>

        {/* سمت چپ: کنترل سایز آیکون، زوم، لایه‌ها و تاگل جانمایی */}
        <div className="flex flex-wrap items-center gap-2">
          {/* اسلایدر تنظیم سایز آیکون ماشین‌آلات */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs ${
            isDark ? 'bg-[#0E172A] border-slate-700' : 'bg-white border-slate-300'
          }`}>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">سایز آیکون:</span>
            <input 
              type="range" 
              min="20" 
              max="60" 
              step="2"
              value={iconSize} 
              onChange={(e) => setIconSize(Number(e.target.value))} 
              className="w-16 sm:w-20 accent-cyan-400 h-1.5 cursor-pointer bg-slate-700 rounded-lg"
              title={`تنظیم اندازه آیکون ماشین‌آلات (${iconSize}px)`}
            />
            <span className="text-[10px] font-mono font-bold text-cyan-400 w-7 text-center">
              {iconSize}px
            </span>
          </div>

          {/* ابزار زوم و ریست */}
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
              title="بازنشانی زاویه دید (Reset View)"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
          </div>

          {/* تاگل نمایش عوارض نقشه و شبکه */}
          <button
            onClick={() => setShowSurveyFeatures(!showSurveyFeatures)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              showSurveyFeatures 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                : isDark ? 'bg-[#0E172A] border-slate-700 text-slate-400' : 'bg-white border-slate-300 text-slate-600'
            }`}
            title="نمایش / پنهان‌سازی عوارض وکتوری نقشه مرجع (پله‌ها، پیت، راه‌ها)"
          >
            عوارض نقشه
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              showGrid 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                : isDark ? 'bg-[#0E172A] border-slate-700 text-slate-400' : 'bg-white border-slate-300 text-slate-600'
            }`}
            title="نمایش / پنهان‌سازی شبکه مختصاتی UTM"
          >
            شبکه UTM
          </button>

          {/* تاگل نمایش برچسب کد ماشین */}
          <button
            onClick={() => setShowEquipmentLabels(!showEquipmentLabels)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              showEquipmentLabels 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                : isDark ? 'bg-[#0E172A] border-slate-700 text-slate-400' : 'bg-white border-slate-300 text-slate-600'
            }`}
            title="نمایش / پنهان‌سازی کد ماشین‌ها"
          >
            کد ماشین
          </button>

          {/* دکمه وضعیت جانمایی دستی */}
          <button
            onClick={onTogglePlacementMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isPlacementMode 
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse font-black' 
                : isDark ? 'bg-[#0E172A] border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700'
            }`}
            title="تغییر وضعیت به حالت جانمایی یا مشاهده"
          >
            <CursorArrowRaysIcon className="w-4 h-4" />
            <span>{isPlacementMode ? 'حالت جانمایی فعال' : 'جانمایی'}</span>
          </button>
        </div>
      </div>

      {/* بنر راهنمای بالای بوم در حالت جانمایی فعال */}
      {isPlacementMode && (
        <div className="bg-amber-500/90 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md z-20 animate-fade-in">
          <div className="flex items-center gap-2">
            <CursorArrowRaysIcon className="w-4 h-4 stroke-[2.5]" />
            <span>
              حالت جانمایی فعال است: {activePlacementItem ? `جهت استقرار «${activePlacementItem.code} (${activePlacementItem.nameFa})» روی نقطه مورد نظر در نقشه مرجع کلیک فرمایید.` : 'لطفا روی نقطه مورد نظر در نقشه مرجع کلیک کنید.'}
            </span>
          </div>
          <button 
            onClick={onTogglePlacementMode}
            className="p-1 rounded-lg hover:bg-black/10 transition-colors"
            title="خروج از حالت جانمایی"
          >
            <XMarkIcon className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* بوم نقشه مرجع با پشتیبانی Pan و Zoom */}
      <div 
        ref={mapContainerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleMapClick}
        onWheel={handleWheel}
        className={`relative flex-1 w-full h-full overflow-hidden ${
          isPanning ? 'cursor-grabbing' : isPlacementMode ? 'cursor-crosshair' : 'cursor-grab'
        }`}
      >
        {/* کانتینر ترنسفرم شده بر اساس Pan و Zoom */}
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
          {/* نقشه وکتوری SVG معدن (دقیقا همان نقشه مرجع آپلود شده) */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* شبکه شطرنجی مهندسی CAD */}
              <pattern id="mineCadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.04)"} strokeWidth="0.8" />
              </pattern>
              
              <linearGradient id="minePitBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={isDark ? "#070E1B" : "#F1F5F9"} />
                <stop offset="50%" stopColor={isDark ? "#060A14" : "#E2E8F0"} />
                <stop offset="100%" stopColor={isDark ? "#03060C" : "#CBD5E1"} />
              </linearGradient>
            </defs>

            {/* پس‌زمینه و گرید */}
            <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#minePitBg)" />
            {showGrid && <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#mineCadGrid)" />}

            {/* در صورت وجود تصویر ارتوفتو یا نقشه رستری آپلود شده */}
            {activeSurveyMap?.rasterImageUrl && (
              <image
                href={activeSurveyMap.rasterImageUrl}
                x={offsetX}
                y={offsetY}
                width={drawnWidth}
                height={drawnHeight}
                opacity={0.85}
                preserveAspectRatio="none"
              />
            )}

            {/* خط محدوده پیرامونی نقشه مرجع */}
            <rect 
              x={offsetX} 
              y={offsetY} 
              width={drawnWidth} 
              height={drawnHeight} 
              fill="none" 
              stroke={isDark ? "rgba(0, 212, 255, 0.25)" : "rgba(2, 132, 199, 0.3)"} 
              strokeWidth="1.2" 
              strokeDasharray="6,4" 
            />

            {/* برچسب‌های مختصات در گوشه‌های نقشه مرجع */}
            <g className="text-[10px] font-mono fill-slate-500 pointer-events-none opacity-60">
              <text x={offsetX + 6} y={offsetY + 16}>X: {mapBounds.minX.toFixed(0)}m | Y: {mapBounds.maxY.toFixed(0)}m</text>
              <text x={offsetX + drawnWidth - 6} y={offsetY + drawnHeight - 8} textAnchor="end">X: {mapBounds.maxX.toFixed(0)}m | Y: {mapBounds.minY.toFixed(0)}m</text>
            </g>

            {/* رندر عوارض وکتوری نقشه مرجع واقعی (Crest, Toe, Roads, Blocks, etc.) */}
            {showSurveyFeatures && activeSurveyMap?.features && activeSurveyMap.features.length > 0 ? (
              activeSurveyMap.features.map((feature: MapFeature, idx: number) => {
                const coords = feature.coordinates || (feature as any).geometry?.coordinates || [];
                if (!Array.isArray(coords) || coords.length === 0) return null;

                const featureKey = `${feature.id || 'feat'}-${idx}`;

                // چندضلعی‌ها (ساب‌بلوک‌ها، مرز انفجار، دپوها)
                if (feature.type === 'POLYGON' && coords.length >= 3) {
                  const pointsStr = coords.map((pt: any) => {
                    const [sx, sy] = utmToSvg(Number(pt[0]), Number(pt[1]));
                    return `${sx.toFixed(1)},${sy.toFixed(1)}`;
                  }).join(' ');

                  return (
                    <polygon
                      key={featureKey}
                      points={pointsStr}
                      fill={feature.style?.fillColor || (feature as any).color || '#38BDF8'}
                      fillOpacity={feature.style?.fillOpacity ?? 0.18}
                      stroke={feature.style?.strokeColor || (feature as any).color || '#38BDF8'}
                      strokeWidth={feature.style?.strokeWidth || 1.4}
                      strokeDasharray={feature.style?.strokeDash === 'dashed' ? '5,4' : undefined}
                      className="transition-opacity hover:opacity-100"
                    />
                  );
                }

                // خطوط پله‌ها، لبه‌ها و راه‌ها (Toe, Crest, Haul Road)
                if ((feature.type === 'POLYLINE' || feature.type === 'LINE') && coords.length >= 2) {
                  const pathData = coords.map((pt: any, pIdx: number) => {
                    const [sx, sy] = utmToSvg(Number(pt[0]), Number(pt[1]));
                    return `${pIdx === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
                  }).join(' ');

                  const isCrest = feature.category === 'BENCH_CREST';
                  const isToe = feature.category === 'BENCH_TOE';
                  const isRoad = feature.category === 'HAUL_ROAD';

                  const defaultStroke = isCrest ? '#00D4FF' : isToe ? '#38BDF8' : isRoad ? '#F59E0B' : '#64748B';
                  const strokeW = feature.style?.strokeWidth || (isRoad ? 3.5 : isCrest ? 2.2 : 1.3);

                  return (
                    <path
                      key={featureKey}
                      d={pathData}
                      fill="none"
                      stroke={feature.style?.strokeColor || (feature as any).color || defaultStroke}
                      strokeWidth={strokeW}
                      strokeDasharray={isToe || feature.style?.strokeDash === 'dashed' ? '6,4' : undefined}
                      strokeOpacity={0.85}
                    />
                  );
                }

                // نقاط (سرچال، بنچ‌مارک)
                if (feature.type === 'POINT' && coords[0]) {
                  const pt = coords[0];
                  const [sx, sy] = utmToSvg(Number(pt[0]), Number(pt[1]));
                  const radius = feature.style?.pointRadius || 4;

                  return (
                    <circle
                      key={featureKey}
                      cx={sx}
                      cy={sy}
                      r={radius}
                      fill={feature.style?.fillColor || (feature as any).color || '#F59E0B'}
                      stroke="#FFFFFF"
                      strokeWidth="1"
                    />
                  );
                }

                // دایره یا زون
                if (feature.type === 'CIRCLE_ZONE' && coords[0]) {
                  const pt = coords[0];
                  const [sx, sy] = utmToSvg(Number(pt[0]), Number(pt[1]));
                  const radiusM = feature.properties?.radiusM || 40;
                  const radiusSvg = radiusM * uniformScale;

                  return (
                    <circle
                      key={featureKey}
                      cx={sx}
                      cy={sy}
                      r={Math.max(6, radiusSvg)}
                      fill={feature.style?.fillColor || 'rgba(239, 68, 68, 0.12)'}
                      stroke={feature.style?.strokeColor || '#EF4444'}
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                    />
                  );
                }

                return null;
              })
            ) : (
              // در صورت نبود عوارض وکتوری، راهنمای مهندسی نمایش داده می‌شود
              <g className="pointer-events-none">
                <text
                  x={CANVAS_WIDTH / 2}
                  y={CANVAS_HEIGHT / 2 - 10}
                  textAnchor="middle"
                  fill={isDark ? "#64748B" : "#94A3B8"}
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="inherit"
                >
                  {activeSurveyMap ? `نقشه مرجع مهندسی: ${activeSurveyMap.title}` : 'نقشه مرجع معدن'}
                </text>
                <text
                  x={CANVAS_WIDTH / 2}
                  y={CANVAS_HEIGHT / 2 + 15}
                  textAnchor="middle"
                  fill={isDark ? "#475569" : "#CBD5E1"}
                  fontSize="11"
                  fontFamily="inherit"
                >
                  نقشه بارگذاری‌شده از ماژول نقشه‌برداری به عنوان نقشه زمینه استقرار ناوگان نمایش داده می‌شود
                </text>
              </g>
            )}
          </svg>

          {/* ======================================================== */}
          {/* رندر لایه آیکون ماشین‌آلات روی نقشه (بدون دایره احاطه‌کننده) */}
          {/* ======================================================== */}
          {filteredItems.map((item, idx) => {
            const isSelected = selectedEquipmentId === item.id;
            const isBeingDragged = draggingItemId === item.id;
            const isBeingPlaced = isPlacementMode && (activePlacementItemId === item.id || selectedEquipmentId === item.id);

            const posX = isBeingDragged && dragCurrentPos ? dragCurrentPos.x : item.position.x;
            const posY = isBeingDragged && dragCurrentPos ? dragCurrentPos.y : item.position.y;

            return (
              <div
                key={`map-item-${item.id}-${idx}`}
                onMouseDown={(e) => handleItemMouseDown(e, item)}
                onClick={(e) => handleMarkerClick(e, item)}
                onMouseEnter={(e) => handleMarkerMouseEnter(item, e)}
                onMouseLeave={handleMarkerMouseLeave}
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${iconSize}px`,
                  height: `${iconSize}px`
                }}
                className={`absolute z-30 flex flex-col items-center justify-center cursor-pointer select-none transition-transform ${
                  isBeingDragged ? 'scale-125 z-50 opacity-90' : 'hover:scale-115'
                }`}
              >
                {/* هایلایت شیک و مدرن در زمان انتخاب یا در حال جانمایی (بدون دایره ضخیم) */}
                {isSelected && (
                  <div 
                    className="absolute -inset-1 rounded-lg pointer-events-none"
                    style={{
                      boxShadow: '0 0 12px 2px rgba(0, 212, 255, 0.7)',
                      border: '1.5px dashed rgba(0, 212, 255, 0.9)'
                    }}
                  />
                )}
                {isBeingPlaced && (
                  <div 
                    className="absolute -inset-2 rounded-lg pointer-events-none animate-pulse"
                    style={{
                      boxShadow: '0 0 14px 3px rgba(245, 158, 11, 0.8)',
                      border: '1.5px solid rgba(245, 158, 11, 0.9)'
                    }}
                  />
                )}

                {/* آیکون وکتوری تمیز بدون هیچ دایره محصورکننده */}
                <div className="relative flex items-center justify-center filter drop-shadow-md">
                  <EquipmentVectorIcon 
                    category={item.category} 
                    size={iconSize}
                    color={isSelected ? '#00D4FF' : item.status === 'MAINTENANCE' ? '#F43F5E' : undefined}
                  />

                  {/* نقطه نشانگر کوچک وضعیت در گوشه بالا */}
                  <span 
                    className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 shadow-sm ${
                      STATUS_CONFIG[item.status]?.dotClass || 'bg-emerald-400'
                    }`} 
                  />
                </div>

                {/* برچسب کد ماشین زیر آیکون (بدون شلوغ‌کاری و فشرده) */}
                {showEquipmentLabels && (
                  <div className="mt-0.5 pointer-events-none">
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded shadow border leading-none block whitespace-nowrap ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-cyan-400/50'
                        : isDark ? 'bg-slate-900/90 text-slate-200 border-slate-700/80 backdrop-blur-sm' : 'bg-white/95 text-slate-800 border-slate-300'
                    }`}>
                      {item.code}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* پاپ‌اور جزئیات هاور ۲ ثانیه‌ای */}
        {hoveredItem && (
          <div
            style={{
              left: `${hoverPosition.x}px`,
              top: `${hoverPosition.y - 12}px`,
              transform: 'translate(-50%, -100%)'
            }}
            className="absolute z-50 pointer-events-none animate-fade-in"
          >
            <div className={`p-3 rounded-2xl border shadow-2xl w-60 backdrop-blur-md ${
              isDark ? 'bg-[#0B1323]/95 border-cyan-500/40 text-white' : 'bg-white/95 border-slate-300 text-slate-900'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <EquipmentVectorIcon category={hoveredItem.category} size={22} />
                  <div>
                    <h5 className="text-xs font-black font-mono text-cyan-400">{hoveredItem.code}</h5>
                    <p className="text-[10px] text-slate-400 truncate">{hoveredItem.nameFa}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  STATUS_CONFIG[hoveredItem.status]?.badgeClass
                }`}>
                  {STATUS_CONFIG[hoveredItem.status]?.labelFa}
                </span>
              </div>

              <div className="space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <UserIcon className="w-3 h-3 text-cyan-400" />
                    اپراتور:
                  </span>
                  <span className="font-bold">{hoveredItem.operatorName || 'نامشخص'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3 text-cyan-400" />
                    کارکرد موتور:
                  </span>
                  <span className="font-mono font-bold">{hoveredItem.totalEngineHours} ساعت</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <FireIcon className="w-3 h-3 text-cyan-400" />
                    فعالیت جاری:
                  </span>
                  <span className="font-bold text-slate-200">{hoveredItem.currentActivityFa}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* نوار وضعیت زیر بوم: تعداد ماشین‌آلات و راهنمای کوتاه */}
      <div className={`px-4 py-2 border-t flex flex-wrap items-center justify-between text-xs gap-2 ${
        isDark ? 'bg-[#0B1323] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-3">
          <span>ماشین‌آلات نمایان: <strong className="text-cyan-400 font-mono">{filteredItems.length}</strong> از <strong className="font-mono">{items.length}</strong></span>
          <span className="opacity-40">|</span>
          <span className="text-[11px]">جهت جابجایی هر دستگاه می‌توانید آن را روی نقشه بکشید (Drag & Drop).</span>
        </div>

        {selectedEquipmentId && (
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-[11px] font-bold">دستگاه انتخاب‌شده:</span>
            <span className="font-mono text-white text-[11px] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
              {items.find(e => e.id === selectedEquipmentId)?.code}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
