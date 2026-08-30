// src/modules/mine/presentation/components/SurveyMapStudio/MapLayersControlPanel.tsx

import React, { useState, useMemo } from 'react';
import type { MapLayer, FeatureCategory } from '../../../../../core/domain/types/survey-map.types';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import {
  Square2StackIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  MapPinIcon,
  ShieldExclamationIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  TagIcon,
  PaintBrushIcon,
  CheckCircleIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';

export interface DisplayOverlaySettings {
  showCadGrid: boolean;
  showContourLines: boolean;
  showLabels: boolean;              // سوئیچ کلی نمایش برچسب‌ها
  showLineLabels: boolean;          // برچسب خطوط پله، Crest، Toe، رمپ‌ها و باندها
  showSubBlockLabels: boolean;      // برچسب ساب‌بلوک‌ها
  showPointLabels: boolean;         // برچسب چال‌ها و بنچ‌مارک‌ها
  showGradeValues: boolean;         // مقادیر عیار آهن
  showLegend: boolean;
  showDroneRaster?: boolean;
}

export type LayerGroupType = 'ALL' | 'TOPOGRAPHY' | 'MINING' | 'SAFETY';

interface MapLayersControlPanelProps {
  layers: MapLayer[];
  featureCountsByLayer?: Record<string, number>;
  displaySettings: DisplayOverlaySettings;
  onToggleLayerVisibility: (layerId: string) => void;
  onToggleLayerLock?: (layerId: string) => void;
  onToggleLayerLabels?: (layerId: string) => void;
  onChangeLayerOpacity?: (layerId: string, opacity: number) => void;
  onBatchToggleLayers: (layerIds: string[], visible: boolean) => void;
  onSetLayersLabelsVisibility?: (layerIds: string[], show: boolean) => void;
  onUpdateLayersStyle?: (
    layerIds: string[],
    style: {
      color?: string;
      strokeWidth?: number;
      strokeDash?: 'solid' | 'dashed' | 'dotted' | 'dashdot';
      opacity?: number;
      showLabels?: boolean;
    },
    applyToFeatures?: boolean
  ) => void;
  onChangeDisplaySettings: (settings: Partial<DisplayOverlaySettings>) => void;
  onClose?: () => void;
  isFloating?: boolean;
  className?: string;
}

// پالت رنگ‌های استاندارد CAD و مهندسی معدن
const CAD_COLOR_PALETTE = [
  { name: 'فیروزه‌ای سایان', hex: '#00D4FF' },
  { name: 'آبی آسمانی', hex: '#38BDF8' },
  { name: 'آبی کبالت', hex: '#3B82F6' },
  { name: 'زمردی پرعیار', hex: '#10B981' },
  { name: 'سبز روشن', hex: '#22C55E' },
  { name: 'زرد کانسنگ', hex: '#EAB308' },
  { name: 'نارنجی هشدار', hex: '#F59E0B' },
  { name: 'قرمز خطر', hex: '#EF4444' },
  { name: 'سرخابی ژئودزی', hex: '#EC4899' },
  { name: 'بنفش خطوط پله', hex: '#A855F7' },
  { name: 'نیلی ترازها', hex: '#6366F1' },
  { name: 'سفید متالیک', hex: '#F8FAFC' }
];

export const MapLayersControlPanel: React.FC<MapLayersControlPanelProps> = ({
  layers,
  featureCountsByLayer = {},
  displaySettings,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onToggleLayerLabels,
  onChangeLayerOpacity,
  onBatchToggleLayers,
  onSetLayersLabelsVisibility,
  onUpdateLayersStyle,
  onChangeDisplaySettings,
  onClose,
  isFloating = false,
  className = ''
}) => {
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState<LayerGroupType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedOpacityLayerId, setExpandedOpacityLayerId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // لایه‌های انتخاب‌شده به صورت چندگانه (Multi-Selection)
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [isStyleEditorOpen, setIsStyleEditorOpen] = useState<boolean>(false);

  // استایل در حال ویرایش برای لایه‌های انتخاب‌شده
  const [customColor, setCustomColor] = useState<string>('#00D4FF');
  const [customStrokeWidth, setCustomStrokeWidth] = useState<number>(2);
  const [customStrokeDash, setCustomStrokeDash] = useState<'solid' | 'dashed' | 'dotted' | 'dashdot'>('solid');
  const [customOpacity, setCustomOpacity] = useState<number>(0.85);
  const [applyToExistingFeatures, setApplyToExistingFeatures] = useState<boolean>(true);

  // طبقه‌بندی لایه‌ها به ۳ گروه اصلی
  const categorizedLayers = useMemo(() => {
    const topoIds = ['layer-topography', 'layer-crest', 'layer-toe', 'layer-crests', 'layer-toes', 'layer-benchmarks', 'layer-contours', 'layer-drone'];
    const miningIds = ['layer-subblocks', 'layer-blocks', 'layer-holes', 'layer-roads', 'layer-stockpiles', 'layer-crusher'];
    const safetyIds = ['layer-hazards', 'layer-annotations', 'layer-safety', 'layer-cracks'];

    const topography: MapLayer[] = [];
    const mining: MapLayer[] = [];
    const safety: MapLayer[] = [];

    layers.forEach(layer => {
      const cat = layer.category;
      const id = layer.id.toLowerCase();

      if (
        cat === 'SURVEY_BENCHMARK' || 
        cat === 'BENCH_CREST' || 
        cat === 'BENCH_TOE' || 
        topoIds.some(t => id.includes(t.replace('layer-', '')))
      ) {
        topography.push(layer);
      } else if (
        cat === 'HAZARD_CRACK' || 
        cat === 'ANNOTATION' || 
        safetyIds.some(s => id.includes(s.replace('layer-', '')))
      ) {
        safety.push(layer);
      } else {
        mining.push(layer);
      }
    });

    return { topography, mining, safety };
  }, [layers]);

  // فیلتر لایه‌ها با جستجو و تب
  const filterList = (list: MapLayer[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(l => 
      l.name.toLowerCase().includes(q) || 
      (l.description && l.description.toLowerCase().includes(q))
    );
  };

  const visibleTopography = useMemo(() => filterList(categorizedLayers.topography), [categorizedLayers.topography, searchQuery]);
  const visibleMining = useMemo(() => filterList(categorizedLayers.mining), [categorizedLayers.mining, searchQuery]);
  const visibleSafety = useMemo(() => filterList(categorizedLayers.safety), [categorizedLayers.safety, searchQuery]);

  // آمار کلی
  const totalLayersCount = layers.length;
  const activeLayersCount = layers.filter(l => l.isVisible).length;

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // انتخاب یا لغو انتخاب یک لایه
  const handleToggleSelectLayer = (layerId: string) => {
    setSelectedLayerIds(prev => 
      prev.includes(layerId) ? prev.filter(id => id !== layerId) : [...prev, layerId]
    );
  };

  // انتخاب همه یا لغو همه
  const handleSelectAllLayers = () => {
    if (selectedLayerIds.length === layers.length) {
      setSelectedLayerIds([]);
    } else {
      setSelectedLayerIds(layers.map(l => l.id));
    }
  };

  // انتخاب لایه‌های خطوط شکست (Crest و Toe)
  const handleSelectCrestToeLayers = () => {
    const crestToeIds = layers
      .filter(l => l.category === 'BENCH_CREST' || l.category === 'BENCH_TOE' || l.id.includes('crest') || l.id.includes('toe'))
      .map(l => l.id);
    setSelectedLayerIds(crestToeIds);
    if (crestToeIds.length > 0) {
      setIsStyleEditorOpen(true);
    }
  };

  // فعال یا غیرفعال کردن کل یک گروه
  const handleToggleGroup = (groupList: MapLayer[], makeVisible: boolean) => {
    const ids = groupList.map(l => l.id);
    onBatchToggleLayers(ids, makeVisible);
  };

  // اعمال تغییرات استایل گروهی
  const handleApplyBulkStyle = () => {
    if (!onUpdateLayersStyle || selectedLayerIds.length === 0) return;
    onUpdateLayersStyle(
      selectedLayerIds,
      {
        color: customColor,
        strokeWidth: customStrokeWidth,
        strokeDash: customStrokeDash,
        opacity: customOpacity
      },
      applyToExistingFeatures
    );
    setIsStyleEditorOpen(false);
  };

  // خاموش/روشن کردن برچسب‌های لایه‌های انتخاب‌شده
  const handleBulkToggleLabels = (show: boolean) => {
    if (onSetLayersLabelsVisibility && selectedLayerIds.length > 0) {
      onSetLayersLabelsVisibility(selectedLayerIds, show);
    } else if (onUpdateLayersStyle && selectedLayerIds.length > 0) {
      onUpdateLayersStyle(selectedLayerIds, { showLabels: show }, true);
    }
  };

  // پیش‌تنظیم‌های سریع (Presets)
  const applyPreset = (preset: 'ALL_ON' | 'ALL_OFF' | 'ONLY_TOPO' | 'ONLY_MINING' | 'ONLY_SAFETY' | 'HIDE_LINE_LABELS') => {
    if (preset === 'ALL_ON') {
      onBatchToggleLayers(layers.map(l => l.id), true);
      onChangeDisplaySettings({ showContourLines: true, showCadGrid: true, showLabels: true });
    } else if (preset === 'ALL_OFF') {
      onBatchToggleLayers(layers.map(l => l.id), false);
    } else if (preset === 'ONLY_TOPO') {
      const topoIds = categorizedLayers.topography.map(l => l.id);
      const otherIds = [...categorizedLayers.mining, ...categorizedLayers.safety].map(l => l.id);
      onBatchToggleLayers(topoIds, true);
      onBatchToggleLayers(otherIds, false);
      onChangeDisplaySettings({ showContourLines: true, showCadGrid: true });
    } else if (preset === 'ONLY_MINING') {
      const miningIds = categorizedLayers.mining.map(l => l.id);
      const otherIds = [...categorizedLayers.topography, ...categorizedLayers.safety].map(l => l.id);
      onBatchToggleLayers(miningIds, true);
      onBatchToggleLayers(otherIds, false);
    } else if (preset === 'ONLY_SAFETY') {
      const safetyIds = categorizedLayers.safety.map(l => l.id);
      const otherIds = [...categorizedLayers.topography, ...categorizedLayers.mining].map(l => l.id);
      onBatchToggleLayers(safetyIds, true);
      onBatchToggleLayers(otherIds, false);
    } else if (preset === 'HIDE_LINE_LABELS') {
      // خاموش کردن برچسب تمامی خطوط و باندهای پله
      onChangeDisplaySettings({ showLineLabels: false });
      const lineLayerIds = layers.filter(l => l.category === 'BENCH_CREST' || l.category === 'BENCH_TOE' || l.category === 'HAUL_ROAD' || l.id.includes('topography')).map(l => l.id);
      if (onSetLayersLabelsVisibility) {
        onSetLayersLabelsVisibility(lineLayerIds, false);
      }
    }
  };

  // رندر کارت لایه
  const renderLayerItem = (layer: MapLayer) => {
    const count = featureCountsByLayer[layer.id] ?? layer.featureCount ?? 0;
    const isOpacityOpen = expandedOpacityLayerId === layer.id;
    const currentOpacity = layer.opacity ?? 1;
    const isSelected = selectedLayerIds.includes(layer.id);
    const isLabelActive = layer.showLabels ?? (layer.category === 'SUB_BLOCK' || layer.category === 'ANNOTATION');

    return (
      <div
        key={layer.id}
        className={`group rounded-xl border transition-all ${
          isSelected
            ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg ring-1 ring-cyan-500/30'
            : layer.isVisible
            ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm'
            : 'bg-slate-950/60 border-slate-900/80 opacity-60 hover:opacity-90'
        }`}
      >
        <div className="p-2.5 flex items-center justify-between gap-2">
          {/* سمت راست: چک‌باکس انتخاب، سوئیچ دید، رنگ و نام */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* چک‌باکس انتخاب چندگانه برای تغییر گروهی استایل/رنگ */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggleSelectLayer(layer.id)}
              className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0 cursor-pointer shrink-0"
              title={isRtl ? 'انتخاب برای ویرایش استایل و رنگ' : 'Select for styling'}
            />

            {/* سوئیچ مرئی بودن لایه */}
            <button
              type="button"
              onClick={() => onToggleLayerVisibility(layer.id)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                layer.isVisible ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
              title={layer.isVisible ? (isRtl ? 'خاموش کردن لایه' : 'Hide Layer') : (isRtl ? 'روشن کردن لایه' : 'Show Layer')}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  layer.isVisible ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                }`}
              />
            </button>

            {/* نشان رنگ لایه با الگوی خط */}
            <div
              className="w-4 h-3.5 rounded shrink-0 border border-white/30 flex items-center justify-center shadow-sm cursor-pointer"
              style={{ backgroundColor: layer.color || '#00D4FF' }}
              onClick={() => {
                setSelectedLayerIds([layer.id]);
                setCustomColor(layer.color || '#00D4FF');
                setCustomStrokeWidth(layer.strokeWidth || 2);
                setCustomStrokeDash(layer.strokeDash || 'solid');
                setIsStyleEditorOpen(true);
              }}
              title={isRtl ? 'کلیک برای تغییر رنگ و استایل این لایه' : 'Click to change color/style'}
            >
              {layer.strokeDash === 'dashed' && <span className="text-[7px] text-white font-mono leading-none">--</span>}
              {layer.strokeDash === 'dotted' && <span className="text-[8px] text-white font-mono leading-none">··</span>}
            </div>

            {/* نام و توضیحات */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold truncate ${layer.isVisible ? 'text-white' : 'text-slate-400'}`}>
                  {layer.name}
                </span>
                {layer.isLocked && (
                  <LockClosedIcon className="w-3 h-3 text-amber-400 shrink-0" title={isRtl ? 'لایه قفل شده است' : 'Locked Layer'} />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-slate-400 truncate">
                  {layer.strokeWidth ? `${layer.strokeWidth}px` : '2px'} • {layer.strokeDash === 'dashed' ? 'خط‌چین' : layer.strokeDash === 'dotted' ? 'نقطه‌چین' : 'پیوسته'}
                </span>
                {layer.description && (
                  <span className="text-[9px] text-slate-500 truncate">• {layer.description}</span>
                )}
              </div>
            </div>
          </div>

          {/* سمت چپ: کنترل انتخابی برچسب‌ها، تعداد المان، اسلایدر و قفل */}
          <div className="flex items-center gap-1 shrink-0">
            {/* ۱. سوئیچ انتخابی برچسب‌های این لایه (Selective Label Toggle) */}
            {onToggleLayerLabels && (
              <button
                type="button"
                onClick={() => onToggleLayerLabels(layer.id)}
                className={`p-1 rounded-lg transition-all ${
                  isLabelActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
                title={isRtl ? (isLabelActive ? 'برچسب‌های این لایه روشن است (کلیک برای خاموش‌سازی)' : 'برچسب‌های این لایه خاموش است (کلیک برای روشن‌سازی)') : 'Toggle labels for this layer'}
              >
                <TagIcon className="w-3.5 h-3.5" />
              </button>
            )}

            {/* تعداد عوارض در لایه */}
            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800"
              title={isRtl ? `${count} المان در این لایه` : `${count} features`}
            >
              {count}
            </span>

            {/* دکمه تنظیم شفافیت Opacity */}
            {onChangeLayerOpacity && (
              <button
                type="button"
                onClick={() => setExpandedOpacityLayerId(isOpacityOpen ? null : layer.id)}
                className={`p-1 rounded-lg text-slate-400 hover:text-white transition-colors ${
                  isOpacityOpen ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-slate-800'
                }`}
                title={isRtl ? `شفافیت: ${Math.round(currentOpacity * 100)}%` : `Opacity: ${Math.round(currentOpacity * 100)}%`}
              >
                <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
              </button>
            )}

            {/* دکمه قفل لایه */}
            {onToggleLayerLock && (
              <button
                type="button"
                onClick={() => onToggleLayerLock(layer.id)}
                className={`p-1 rounded-lg transition-colors ${
                  layer.isLocked ? 'text-amber-400 hover:bg-amber-950/40' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
                title={layer.isLocked ? (isRtl ? 'باز کردن قفل' : 'Unlock') : (isRtl ? 'قفل کردن لایه' : 'Lock')}
              >
                {layer.isLocked ? <LockClosedIcon className="w-3.5 h-3.5" /> : <LockOpenIcon className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* نوار کشویی اسلایدر شفافیت */}
        {isOpacityOpen && onChangeLayerOpacity && (
          <div className="px-3 pb-2.5 pt-1 border-t border-slate-800/80 flex items-center gap-3 bg-slate-950/40">
            <span className="text-[10px] text-slate-400 font-medium shrink-0">
              {isRtl ? 'میزان شفافیت:' : 'Opacity:'}
            </span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={currentOpacity}
              onChange={(e) => onChangeLayerOpacity(layer.id, parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] font-mono text-cyan-400 font-bold w-9 text-left">
              {Math.round(currentOpacity * 100)}%
            </span>
          </div>
        )}
      </div>
    );
  };

  // رندر هدر هر گروه با دکمه دسته‌جمعی
  const renderGroupSection = (
    title: string,
    icon: React.ReactNode,
    colorClass: string,
    list: MapLayer[],
    groupKey: string
  ) => {
    if (list.length === 0) return null;
    const isCollapsed = !!collapsedGroups[groupKey];
    const groupActiveCount = list.filter(l => l.isVisible).length;
    const isAllActive = groupActiveCount === list.length;

    return (
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between px-1.5 py-1">
          <button
            type="button"
            onClick={() => toggleGroupCollapse(groupKey)}
            className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white transition-colors"
          >
            <div className={`p-1 rounded-lg ${colorClass} text-white shadow-sm`}>
              {icon}
            </div>
            <span>{title}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300">
              {groupActiveCount}/{list.length}
            </span>
            {isCollapsed ? (
              <ChevronDownIcon className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronUpIcon className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* سوییچ گروهی کل دسته */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleToggleGroup(list, !isAllActive)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                isAllActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {isAllActive ? (isRtl ? 'خاموش همه' : 'Hide All') : (isRtl ? 'روشن همه' : 'Show All')}
            </button>
          </div>
        </div>

        {/* لیست لایه‌ها */}
        {!isCollapsed && (
          <div className="space-y-1.5 pr-0.5">
            {list.map(layer => renderLayerItem(layer))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden ${
        isFloating ? 'w-80 sm:w-96 max-h-[85vh] z-40' : 'w-full h-full'
      } ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* هدر کنترل پنل */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/90">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Square2StackIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white flex items-center gap-2">
              <span>{isRtl ? 'کنترل پنل مدیریت و استایل لایه‌ها' : 'Map Layers & Styling'}</span>
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
              <span className="text-cyan-400 font-bold">{activeLayersCount}</span>
              <span>{isRtl ? 'از' : 'of'}</span>
              <span>{totalLayersCount}</span>
              <span>{isRtl ? 'لایه فعال' : 'active layers'}</span>
            </div>
          </div>
        </div>

        {/* دکمه‌های کنترلی هدر */}
        <div className="flex items-center gap-1.5">
          {selectedLayerIds.length > 0 && (
            <button
              onClick={() => setIsStyleEditorOpen(!isStyleEditorOpen)}
              className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                isStyleEditorOpen
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
              }`}
              title={isRtl ? 'ویرایش استایل لایه‌های انتخاب‌شده' : 'Edit Style for Selected'}
            >
              <PaintBrushIcon className="w-3.5 h-3.5" />
              <span>{isRtl ? `استایل (${selectedLayerIds.length})` : `Style (${selectedLayerIds.length})`}</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isRtl ? 'بستن پنل' : 'Close'}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* نوار ابزار انتخاب گروهی و پیش‌تنظیم‌های سریع */}
      <div className="p-2.5 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        {/* انتخاب لایه‌ها */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleSelectAllLayers}
            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            {selectedLayerIds.length === layers.length
              ? (isRtl ? 'لغو انتخاب‌ها' : 'Deselect All')
              : (isRtl ? 'انتخاب همه لایه‌ها' : 'Select All')}
          </button>

          <button
            type="button"
            onClick={handleSelectCrestToeLayers}
            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 transition-all"
          >
            {isRtl ? 'انتخاب خطوط پله (Crest/Toe)' : 'Select Crest/Toe'}
          </button>
        </div>

        {/* پیش‌تنظیم خاموش کردن برچسب خطوط پیت */}
        <button
          type="button"
          onClick={() => applyPreset('HIDE_LINE_LABELS')}
          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all flex items-center gap-1"
          title={isRtl ? 'پنهان کردن برچسب خطوط پله و پای پله و جاده‌ها برای خلوت شدن نقشه' : 'Hide Line/Band Labels'}
        >
          <TagIcon className="w-3 h-3" />
          <span>{isRtl ? 'خاموشی برچسب خطوط/باندها' : 'Hide Line Labels'}</span>
        </button>
      </div>

      {/* پنل بازشونده ویرایش استایل گروهی / تکی لایه‌ها */}
      {isStyleEditorOpen && selectedLayerIds.length > 0 && (
        <div className="p-3 bg-slate-900/95 border-b border-cyan-500/30 animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <PaintBrushIcon className="w-4 h-4" />
              <span>{isRtl ? `ویرایش استایل و رنگ (${selectedLayerIds.length} لایه انتخابی)` : `Style Editor (${selectedLayerIds.length} layers)`}</span>
            </h4>
            <div className="flex items-center gap-1.5">
              {/* کلیدهای سریع روشن/خاموش برچسب انتخابی */}
              <button
                type="button"
                onClick={() => handleBulkToggleLabels(true)}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
              >
                {isRtl ? 'روشن برچسب‌ها' : 'Show Labels'}
              </button>
              <button
                type="button"
                onClick={() => handleBulkToggleLabels(false)}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
              >
                {isRtl ? 'خاموش برچسب‌ها' : 'Hide Labels'}
              </button>
            </div>
          </div>

          {/* انتخاب رنگ از پالت استاندارد */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-medium">{isRtl ? 'رنگ لایه‌ها و خطوط:' : 'Color:'}</span>
            <div className="grid grid-cols-6 gap-1.5">
              {CAD_COLOR_PALETTE.map(item => (
                <button
                  key={item.hex}
                  type="button"
                  onClick={() => setCustomColor(item.hex)}
                  className={`h-6 rounded-lg border transition-all flex items-center justify-center ${
                    customColor.toLowerCase() === item.hex.toLowerCase()
                      ? 'border-white ring-2 ring-cyan-400 scale-105 shadow-md'
                      : 'border-white/20 hover:border-white/60'
                  }`}
                  style={{ backgroundColor: item.hex }}
                  title={item.name}
                >
                  {customColor.toLowerCase() === item.hex.toLowerCase() && (
                    <CheckIcon className="w-3.5 h-3.5 text-slate-950 font-bold" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* تنظیم ضخامت خط و الگوی خطوط */}
          <div className="grid grid-cols-2 gap-2">
            {/* ضخامت خط */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-medium">{isRtl ? 'ضخامت خط (Stroke):' : 'Line Width:'}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 6].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setCustomStrokeWidth(w)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      customStrokeWidth === w
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </div>

            {/* الگوی خط (پیوسته / خط‌چین / نقطه‌چین) */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-medium">{isRtl ? 'الگوی خط (Dash):' : 'Dash Pattern:'}</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setCustomStrokeDash('solid')}
                  className={`py-1 text-[10px] font-bold rounded-lg border transition-all text-center ${
                    customStrokeDash === 'solid' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title={isRtl ? 'خط پیوسته' : 'Solid'}
                >
                  ───
                </button>
                <button
                  type="button"
                  onClick={() => setCustomStrokeDash('dashed')}
                  className={`py-1 text-[10px] font-bold rounded-lg border transition-all text-center ${
                    customStrokeDash === 'dashed' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title={isRtl ? 'خط‌چین' : 'Dashed'}
                >
                  ╌╌╌
                </button>
                <button
                  type="button"
                  onClick={() => setCustomStrokeDash('dotted')}
                  className={`py-1 text-[10px] font-bold rounded-lg border transition-all text-center ${
                    customStrokeDash === 'dotted' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title={isRtl ? 'نقطه‌چین' : 'Dotted'}
                >
                  ┈┈┈
                </button>
              </div>
            </div>
          </div>

          {/* چک‌باکس اعمال روی المان‌های موجود و دکمه اعمال */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <label className="flex items-center gap-2 text-[10px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={applyToExistingFeatures}
                onChange={(e) => setApplyToExistingFeatures(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
              />
              <span>{isRtl ? 'اعمال روی تمام خطوط و المان‌های موجود در لایه‌ها' : 'Apply to all existing features'}</span>
            </label>

            <button
              type="button"
              onClick={handleApplyBulkStyle}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg transition-all"
            >
              {isRtl ? 'اعمال استایل' : 'Apply Style'}
            </button>
          </div>
        </div>
      )}

      {/* فیلد جستجو و تب‌های دسته‌بندی */}
      <div className="p-2.5 border-b border-slate-800 space-y-2">
        {/* جستجو */}
        <div className="relative">
          <MagnifyingGlassIcon className={`w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'جستجوی نام لایه یا عارضه (Crest, Toe, Subblock)...' : 'Search layers...'}
            className={`w-full py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 ${
              isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white ${isRtl ? 'left-2.5' : 'right-2.5'}`}
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* تب‌های دسته‌ای */}
        <div className="grid grid-cols-4 gap-1 p-0.5 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`py-1 rounded-lg transition-all text-center ${
              activeTab === 'ALL' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isRtl ? 'همه' : 'All'}
          </button>
          <button
            onClick={() => setActiveTab('TOPOGRAPHY')}
            className={`py-1 rounded-lg transition-all text-center ${
              activeTab === 'TOPOGRAPHY' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isRtl ? 'تراز/پله' : 'Topo'}
          </button>
          <button
            onClick={() => setActiveTab('MINING')}
            className={`py-1 rounded-lg transition-all text-center ${
              activeTab === 'MINING' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isRtl ? 'استخراج' : 'Mining'}
          </button>
          <button
            onClick={() => setActiveTab('SAFETY')}
            className={`py-1 rounded-lg transition-all text-center ${
              activeTab === 'SAFETY' ? 'bg-rose-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isRtl ? 'ایمنی' : 'Safety'}
          </button>
        </div>
      </div>

      {/* بدنه اسکرول‌خور لایه‌ها */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {/* ۱. لایه‌های توپوگرافی و ترازها (Crest, Toe, Topography, Benchmarks) */}
        {(activeTab === 'ALL' || activeTab === 'TOPOGRAPHY') && (
          renderGroupSection(
            isRtl ? 'لایه‌های توپوگرافی و خطوط شکست (Crest/Toe)' : 'Topography & Bench Lines',
            <MapPinIcon className="w-3.5 h-3.5" />,
            'bg-sky-600',
            visibleTopography,
            'topo'
          )
        )}

        {/* ۲. عوارض و عملیات استخراج معدن */}
        {(activeTab === 'ALL' || activeTab === 'MINING') && (
          renderGroupSection(
            isRtl ? 'ساب‌بلوک‌ها و عملیات استخراج معدن' : 'Sub-Blocks & Mining Operations',
            <TruckIcon className="w-3.5 h-3.5" />,
            'bg-emerald-600',
            visibleMining,
            'mining'
          )
        )}

        {/* ۳. حریم‌های ایمنی، درزه‌ها و ژئوتکنیک */}
        {(activeTab === 'ALL' || activeTab === 'SAFETY') && (
          renderGroupSection(
            isRtl ? 'حریم‌های ایمنی و پایش ژئوتکنیک' : 'Safety & Geotechnical Hazards',
            <ShieldExclamationIcon className="w-3.5 h-3.5" />,
            'bg-rose-600',
            visibleSafety,
            'safety'
          )
        )}

        {/* پیام در صورت نیافتن لایه در جستجو */}
        {visibleTopography.length === 0 && visibleMining.length === 0 && visibleSafety.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-xs">
            {isRtl ? 'لایه‌ای با این مشخصات یافت نشد.' : 'No layers matched your search.'}
          </div>
        )}
      </div>

      {/* فوتر: تنظیمات تفکیکی و انتخابی نمایش برچسب‌ها و پوشش‌های HUD نقشه */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
          <span>{isRtl ? 'مدیریت انتخابی برچسب‌ها و فیلترهای بوم:' : 'Selective Label & Overlay Controls:'}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {/* برچسب خطوط پله و باندها (Crest / Toe / Road) */}
          <label className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border transition-all ${
            displaySettings.showLineLabels
              ? 'bg-sky-950/50 border-sky-500/50 text-sky-200'
              : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:border-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={displaySettings.showLineLabels}
              onChange={(e) => onChangeDisplaySettings({ showLineLabels: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-sky-400 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="font-medium truncate">
              {isRtl ? 'برچسب خطوط پله (Crest/Toe)' : 'Line Labels'}
            </span>
          </label>

          {/* برچسب کدهای ساب‌بلوک */}
          <label className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border transition-all ${
            displaySettings.showSubBlockLabels
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
              : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:border-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={displaySettings.showSubBlockLabels}
              onChange={(e) => onChangeDisplaySettings({ showSubBlockLabels: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-emerald-400 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="font-medium truncate">
              {isRtl ? 'برچسب ساب‌بلوک‌ها' : 'Sub-Block Labels'}
            </span>
          </label>

          {/* برچسب نقاط و چال‌ها */}
          <label className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border transition-all ${
            displaySettings.showPointLabels
              ? 'bg-amber-950/50 border-amber-500/50 text-amber-200'
              : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:border-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={displaySettings.showPointLabels}
              onChange={(e) => onChangeDisplaySettings({ showPointLabels: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-amber-400 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="font-medium truncate">
              {isRtl ? 'برچسب نقاط و چال‌ها' : 'Point & Hole Labels'}
            </span>
          </label>

          {/* مقادیر عیار آهن Fe% */}
          <label className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border transition-all ${
            displaySettings.showGradeValues
              ? 'bg-teal-950/50 border-teal-500/50 text-teal-200'
              : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:border-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={displaySettings.showGradeValues}
              onChange={(e) => onChangeDisplaySettings({ showGradeValues: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-teal-400 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="font-medium truncate">
              {isRtl ? 'نمایش عیار آهن (Fe%)' : 'Grade (Fe%) Tags'}
            </span>
          </label>

          {/* شبکه گرید CAD */}
          <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-slate-700">
            <input
              type="checkbox"
              checked={displaySettings.showCadGrid}
              onChange={(e) => onChangeDisplaySettings({ showCadGrid: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-cyan-400 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-slate-300 font-medium truncate">
              {isRtl ? 'شبکه گرید CAD' : 'CAD Grid'}
            </span>
          </label>

          {/* منحنی‌های میزان طبیعی پیت */}
          <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-slate-700">
            <input
              type="checkbox"
              checked={displaySettings.showContourLines}
              onChange={(e) => onChangeDisplaySettings({ showContourLines: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-sky-400 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-slate-300 font-medium truncate">
              {isRtl ? 'منحنی‌های تراز' : 'Contours'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default MapLayersControlPanel;
