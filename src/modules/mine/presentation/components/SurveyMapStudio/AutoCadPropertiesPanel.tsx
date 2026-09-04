// src/modules/mine/presentation/components/SurveyMapStudio/AutoCadPropertiesPanel.tsx

import React, { useState, useMemo } from 'react';
import type { 
  MapLayer, 
  MapFeature 
} from '../../../../../core/domain/types/survey-map.types';
import type { DisplayOverlaySettings } from './MapLayersControlPanel';
import {
  Sliders,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Tag,
  Paintbrush,
  Trash2,
  Pencil,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Maximize2,
  Ruler,
  Mountain,
  Scale,
  FlaskConical,
  Truck,
  Grid,
  Compass,
  Crosshair,
  Hexagon,
  Spline,
  CircleDot,
  FileText
} from 'lucide-react';

interface AutoCadPropertiesPanelProps {
  layers: MapLayer[];
  selectedFeature: MapFeature | null;
  displaySettings: DisplayOverlaySettings;
  benchLevel: number;
  totalFeaturesCount: number;
  activeRole: string;
  canEdit: boolean;
  onSelectFeature: (feature: MapFeature | null) => void;
  onEditFeatureRequest?: (feature: MapFeature) => void;
  onDeleteFeatureRequest?: (feature: MapFeature) => void;
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
  activeTabDefault?: 'LAYERS' | 'PROPERTIES' | 'VIEW';
}

const CAD_PALETTE = [
  { name: 'Cyan', hex: '#00D4FF' },
  { name: 'Sky', hex: '#38BDF8' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'White', hex: '#F8FAFC' },
  { name: 'Slate', hex: '#94A3B8' }
];

export const AutoCadPropertiesPanel: React.FC<AutoCadPropertiesPanelProps> = ({
  layers,
  selectedFeature,
  displaySettings,
  benchLevel,
  totalFeaturesCount,
  activeRole: _activeRole,
  canEdit,
  onSelectFeature,
  onEditFeatureRequest,
  onDeleteFeatureRequest,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onToggleLayerLabels,
  onChangeLayerOpacity: _onChangeLayerOpacity,
  onBatchToggleLayers,
  onSetLayersLabelsVisibility: _onSetLayersLabelsVisibility,
  onUpdateLayersStyle,
  onChangeDisplaySettings,
  onClose,
  activeTabDefault = 'PROPERTIES'
}) => {
  const [activeTab, setActiveTab] = useState<'PROPERTIES' | 'LAYERS' | 'VIEW'>(
    selectedFeature ? 'PROPERTIES' : activeTabDefault
  );

  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [searchLayer, setSearchLayer] = useState<string>('');
  const [isStyleExpanded, setIsStyleExpanded] = useState<boolean>(true);

  const [styleColor, setStyleColor] = useState<string>('#00D4FF');
  const [styleWidth, setStyleWidth] = useState<number>(2);
  const [styleDash, setStyleDash] = useState<'solid' | 'dashed' | 'dotted' | 'dashdot'>('solid');
  const [styleOpacity, setStyleOpacity] = useState<number>(0.85);
  const [applyToExisting, setApplyToExisting] = useState<boolean>(true);

  React.useEffect(() => {
    if (selectedFeature) {
      setActiveTab('PROPERTIES');
    }
  }, [selectedFeature]);

  const filteredLayers = useMemo(() => {
    if (!searchLayer.trim()) return layers;
    const q = searchLayer.toLowerCase();
    return layers.filter(l => l.name.toLowerCase().includes(q) || (l.description && l.description.toLowerCase().includes(q)));
  }, [layers, searchLayer]);

  const handleSelectLayerForStyle = (layer: MapLayer) => {
    setSelectedLayerIds([layer.id]);
    setStyleColor(layer.color || '#00D4FF');
    setStyleWidth(layer.strokeWidth || 2);
    setStyleDash(layer.strokeDash || 'solid');
    setStyleOpacity(layer.opacity ?? 0.85);
    setIsStyleExpanded(true);
  };

  const handleApplyStyle = () => {
    if (selectedLayerIds.length === 0 || !onUpdateLayersStyle) return;
    onUpdateLayersStyle(
      selectedLayerIds,
      {
        color: styleColor,
        strokeWidth: styleWidth,
        strokeDash: styleDash,
        opacity: styleOpacity
      },
      applyToExisting
    );
  };

  // آیکون و برچسب فشرده نوع عارضه
  const getFeatureIcon = (feature: MapFeature) => {
    if (feature.category === 'SUB_BLOCK' || feature.type === 'POLYGON') {
      return <Hexagon className="w-4 h-4 text-emerald-400" />;
    }
    if (feature.type === 'POLYLINE') {
      return <Spline className="w-4 h-4 text-cyan-400" />;
    }
    if (feature.category === 'ANNOTATION') {
      return <FileText className="w-4 h-4 text-amber-400" />;
    }
    return <CircleDot className="w-4 h-4 text-rose-400" />;
  };

  return (
    <aside 
      className="w-80 h-full flex flex-col bg-[#070F1E]/95 backdrop-blur-xl border-l border-slate-800/90 text-slate-200 select-none shadow-2xl z-20 shrink-0"
      dir="rtl"
    >
      {/* هدر بالایی پنل مشخصات */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/90 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white font-mono tracking-wider">
            PROPERTIES
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* تب‌های سه‌گانه با آیکون‌های استاندارد */}
      <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/60 p-1 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('PROPERTIES')}
          title="مشخصات عارضه"
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
            activeTab === 'PROPERTIES'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>مشخصات</span>
          {selectedFeature && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('LAYERS')}
          title="لایه‌ها"
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
            activeTab === 'LAYERS'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>لایه‌ها</span>
          <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-300 font-mono">
            {layers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('VIEW')}
          title="تنظیمات دید و بوم"
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
            activeTab === 'VIEW'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>نمایش</span>
        </button>
      </div>

      {/* بدنه محتوا بر اساس تب فعال */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-xs">
        
        {/* ======================= تب ۱: مشخصات المان (فرم بصری مبتنی بر آیکون و اشکال) ======================= */}
        {activeTab === 'PROPERTIES' && (
          selectedFeature ? (
            <div className="space-y-2.5 animate-fade-in">
              {/* کارت اصلی عارضه */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getFeatureIcon(selectedFeature)}
                    <span className="font-bold text-white text-xs truncate max-w-[140px]">
                      {selectedFeature.name}
                    </span>
                  </div>
                  {selectedFeature.properties?.code && (
                    <span className="text-[10px] font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                      {selectedFeature.properties.code}
                    </span>
                  )}
                </div>
              </div>

              {/* مشخصات استایل و لایه (نمایش بصری با آیکون) */}
              <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
                {/* لایه */}
                <div className="p-1.5 rounded-lg bg-slate-950/60 flex flex-col items-center justify-center gap-1 text-center" title="لایه">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-bold text-slate-300 truncate w-full">
                    {layers.find(l => l.id === selectedFeature.layerId)?.name || 'لایه'}
                  </span>
                </div>

                {/* رنگ عارضه */}
                <div className="p-1.5 rounded-lg bg-slate-950/60 flex flex-col items-center justify-center gap-1 text-center" title="رنگ">
                  <span 
                    className="w-4 h-4 rounded-full border border-white/40 shadow-sm" 
                    style={{ backgroundColor: selectedFeature.style?.strokeColor || selectedFeature.style?.fillColor || '#00D4FF' }} 
                  />
                  <span className="text-[9px] font-mono text-slate-400">
                    {selectedFeature.style?.strokeColor || '#00D4FF'}
                  </span>
                </div>

                {/* ضخامت خط */}
                <div className="p-1.5 rounded-lg bg-slate-950/60 flex flex-col items-center justify-center gap-1 text-center" title="ضخامت">
                  <div 
                    className="w-6 bg-cyan-400 rounded-full" 
                    style={{ height: `${Math.max(2, Math.min(selectedFeature.style?.strokeWidth || 2, 6))}px` }} 
                  />
                  <span className="text-[9px] font-mono text-slate-300">
                    {selectedFeature.style?.strokeWidth || 2}px
                  </span>
                </div>
              </div>

              {/* متریک‌های هندسی عارضه با آیکون‌های استاندارد */}
              <div className="grid grid-cols-2 gap-2">
                {/* مساحت */}
                {selectedFeature.type === 'POLYGON' && selectedFeature.properties?.area && (
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2" title="مساحت">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono font-black text-white text-xs block truncate">
                        {Math.round(selectedFeature.properties.area).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">m²</span>
                    </div>
                  </div>
                )}

                {/* طول */}
                {selectedFeature.type === 'POLYLINE' && selectedFeature.properties?.length && (
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2" title="طول کل">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                      <Ruler className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono font-black text-white text-xs block truncate">
                        {Math.round(selectedFeature.properties.length).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">m</span>
                    </div>
                  </div>
                )}

                {/* تراز ارتفاعی */}
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2" title="تراز ارتفاعی">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Mountain className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-white text-xs block truncate">
                      {selectedFeature.elevation || selectedFeature.coordinates?.[0]?.[2] || benchLevel}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">m (RL)</span>
                  </div>
                </div>

                {/* تعداد گره‌ها */}
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2" title="تعداد رئوس">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                    <Crosshair className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-black text-white text-xs block truncate">
                      {selectedFeature.coordinates?.length || 0}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">pts</span>
                  </div>
                </div>
              </div>

              {/* پارامترهای معدنی ساب‌بلوک */}
              {selectedFeature.category === 'SUB_BLOCK' && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  {/* عیار آهن با گیج بصری */}
                  {selectedFeature.properties?.feGrade !== undefined && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>Fe</span>
                        </div>
                        <span className="font-mono font-black text-emerald-400 text-xs">
                          {selectedFeature.properties.feGrade}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
                          style={{ width: `${Math.min(selectedFeature.properties.feGrade, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* تناژ و کانسنگ */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {selectedFeature.properties?.tonnage !== undefined && (
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center gap-1.5" title="تناژ">
                        <Scale className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-mono font-bold text-slate-200 text-[11px] truncate">
                          {selectedFeature.properties.tonnage.toLocaleString()} t
                        </span>
                      </div>
                    )}

                    {selectedFeature.properties?.destination && (
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center gap-1.5" title="مقصد">
                        <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-bold text-amber-300 text-[10px] truncate">
                          {selectedFeature.properties.destination}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* دکمه‌های عملیاتی فشرده با آیکون */}
              <div className="flex items-center gap-1.5 pt-1">
                {canEdit && onEditFeatureRequest && (
                  <button
                    onClick={() => onEditFeatureRequest(selectedFeature)}
                    title="ویرایش عارضه"
                    className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>ویرایش</span>
                  </button>
                )}

                {canEdit && onDeleteFeatureRequest && (
                  <button
                    onClick={() => onDeleteFeatureRequest(selectedFeature)}
                    title="حذف"
                    className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-all flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => onSelectFeature(null)}
                  title="لغو انتخاب"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <Crosshair className="w-6 h-6 animate-pulse text-cyan-400/80" />
              </div>

              {/* متریک‌های نقشه به صورت گرید ۴ تایی */}
              <div className="grid grid-cols-2 gap-2 text-right">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">پله</span>
                    <span className="font-mono font-bold text-xs text-white">{benchLevel} m</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">لایه‌ها</span>
                    <span className="font-mono font-bold text-xs text-white">{layers.length}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                  <Hexagon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">عوارض</span>
                    <span className="font-mono font-bold text-xs text-white">{totalFeaturesCount}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">مرجع</span>
                    <span className="font-mono font-bold text-[10px] text-slate-300">UTM 39N</span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* ======================= تب ۲: مدیریت لایه‌ها ======================= */}
        {activeTab === 'LAYERS' && (
          <div className="space-y-2.5">
            {/* استایل سریع */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsStyleExpanded(!isStyleExpanded)}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>استایل</span>
                </div>
                {isStyleExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </div>

              {isStyleExpanded && (
                <div className="space-y-2 pt-1 text-[11px]">
                  {/* پالت رنگ */}
                  <div className="grid grid-cols-6 gap-1">
                    {CAD_PALETTE.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setStyleColor(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                        className={`h-5 rounded border transition-all ${
                          styleColor.toLowerCase() === c.hex.toLowerCase()
                            ? 'ring-2 ring-cyan-400 scale-110 border-white'
                            : 'border-white/20 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={styleWidth}
                      onChange={(e) => setStyleWidth(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-[11px] focus:outline-none"
                    >
                      <option value={1}>1 px</option>
                      <option value={2}>2 px</option>
                      <option value={3}>3 px</option>
                      <option value={4}>4 px</option>
                      <option value={6}>6 px</option>
                    </select>

                    <select
                      value={styleDash}
                      onChange={(e) => setStyleDash(e.target.value as any)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none"
                    >
                      <option value="solid">ممتد</option>
                      <option value="dashed">خط‌چین</option>
                      <option value="dotted">نقطه‌چین</option>
                    </select>
                  </div>

                  <button
                    onClick={handleApplyStyle}
                    disabled={selectedLayerIds.length === 0}
                    className={`w-full py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                      selectedLayerIds.length > 0
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>اعمال</span>
                  </button>
                </div>
              )}
            </div>

            {/* جستجو */}
            <div className="relative">
              <input
                type="text"
                placeholder="جستجوی لایه..."
                value={searchLayer}
                onChange={(e) => setSearchLayer(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* لیست لایه‌ها */}
            <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
              {filteredLayers.map((layer) => {
                const isSelected = selectedLayerIds.includes(layer.id);
                return (
                  <div
                    key={layer.id}
                    className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleSelectLayerForStyle(layer)}
                    >
                      <span
                        style={{ backgroundColor: layer.color || '#00D4FF' }}
                        className="w-3 h-3 rounded shrink-0 border border-white/30"
                      />
                      <span className="font-bold text-white text-xs truncate">
                        {layer.name}
                      </span>
                    </div>

                    {/* دکمه‌های آیکونی کنترل لایه */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {onToggleLayerLabels && (
                        <button
                          onClick={() => onToggleLayerLabels(layer.id)}
                          className={`p-1 rounded-md transition-colors ${
                            layer.showLabels !== false
                              ? 'text-cyan-400 hover:bg-cyan-950/70'
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                          title="برچسب"
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onToggleLayerLock && (
                        <button
                          onClick={() => onToggleLayerLock(layer.id)}
                          className={`p-1 rounded-md transition-colors ${
                            layer.locked
                              ? 'text-amber-400 hover:bg-amber-950/70'
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                          title="قفل"
                        >
                          {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      <button
                        onClick={() => onToggleLayerVisibility(layer.id)}
                        className={`p-1 rounded-md transition-colors ${
                          layer.visible
                            ? 'text-emerald-400 hover:bg-emerald-950/70'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                        title="دید"
                      >
                        {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= تب ۳: تنظیمات نمایش (آیکون‌محور) ======================= */}
        {activeTab === 'VIEW' && (
          <div className="space-y-1.5 text-xs">
            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/40 cursor-pointer">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-200">شبکه CAD</span>
              </div>
              <input
                type="checkbox"
                checked={displaySettings.showCadGrid}
                onChange={(e) => onChangeDisplaySettings({ showCadGrid: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/40 cursor-pointer">
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-amber-400" />
                <span className="text-slate-200">منحنی تراز (Contours)</span>
              </div>
              <input
                type="checkbox"
                checked={displaySettings.showContourLines}
                onChange={(e) => onChangeDisplaySettings({ showContourLines: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/40 cursor-pointer">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-200">برچسب عمومی</span>
              </div>
              <input
                type="checkbox"
                checked={displaySettings.showLabels}
                onChange={(e) => onChangeDisplaySettings({ showLabels: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/40 cursor-pointer">
              <div className="flex items-center gap-2">
                <Hexagon className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-200">کد ساب‌بلوک</span>
              </div>
              <input
                type="checkbox"
                checked={displaySettings.showSubBlockLabels}
                onChange={(e) => onChangeDisplaySettings({ showSubBlockLabels: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/40 cursor-pointer">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-teal-400" />
                <span className="text-slate-200">عیار آهن (% Fe)</span>
              </div>
              <input
                type="checkbox"
                checked={displaySettings.showGradeValues}
                onChange={(e) => onChangeDisplaySettings({ showGradeValues: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
              />
            </label>
          </div>
        )}

      </div>
    </aside>
  );
};
