// src/modules/mine/presentation/components/SurveyMapStudio/AutoCadPropertiesPanel.tsx

import React, { useState, useMemo } from 'react';
import type { 
  MapLayer, 
  MapFeature, 
  FeatureCategory 
} from '../../../../../core/domain/types/survey-map.types';
import type { DisplayOverlaySettings } from './MapLayersControlPanel';
import {
  Square2StackIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  TagIcon,
  PaintBrushIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  SwatchIcon,
  ArrowsPointingOutIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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
  { name: 'سایان', hex: '#00D4FF' },
  { name: 'آبی آسمانی', hex: '#38BDF8' },
  { name: 'آبی کبالت', hex: '#3B82F6' },
  { name: 'زمردی', hex: '#10B981' },
  { name: 'سبز روشن', hex: '#22C55E' },
  { name: 'زرد', hex: '#EAB308' },
  { name: 'نارنجی', hex: '#F59E0B' },
  { name: 'قرمز', hex: '#EF4444' },
  { name: 'سرخابی', hex: '#EC4899' },
  { name: 'بنفش', hex: '#A855F7' },
  { name: 'سفید', hex: '#F8FAFC' },
  { name: 'خاکستری', hex: '#94A3B8' }
];

export const AutoCadPropertiesPanel: React.FC<AutoCadPropertiesPanelProps> = ({
  layers,
  selectedFeature,
  displaySettings,
  benchLevel,
  totalFeaturesCount,
  activeRole,
  canEdit,
  onSelectFeature,
  onEditFeatureRequest,
  onDeleteFeatureRequest,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onToggleLayerLabels,
  onChangeLayerOpacity,
  onBatchToggleLayers,
  onSetLayersLabelsVisibility,
  onUpdateLayersStyle,
  onChangeDisplaySettings,
  onClose,
  activeTabDefault = 'PROPERTIES'
}) => {
  const [activeTab, setActiveTab] = useState<'PROPERTIES' | 'LAYERS' | 'VIEW'>(
    selectedFeature ? 'PROPERTIES' : activeTabDefault
  );

  // لایه‌های انتخاب‌شده برای استایل‌دهی گروهی
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [searchLayer, setSearchLayer] = useState<string>('');
  const [isStyleExpanded, setIsStyleExpanded] = useState<boolean>(true);

  // مقادیر استایل انتخابی
  const [styleColor, setStyleColor] = useState<string>('#00D4FF');
  const [styleWidth, setStyleWidth] = useState<number>(2);
  const [styleDash, setStyleDash] = useState<'solid' | 'dashed' | 'dotted' | 'dashdot'>('solid');
  const [styleOpacity, setStyleOpacity] = useState<number>(0.85);
  const [applyToExisting, setApplyToExisting] = useState<boolean>(true);

  // اگر المانی انتخاب شد به تب مشخصات سوییچ شود
  React.useEffect(() => {
    if (selectedFeature) {
      setActiveTab('PROPERTIES');
    }
  }, [selectedFeature]);

  // فیلتر لایه‌ها
  const filteredLayers = useMemo(() => {
    if (!searchLayer.trim()) return layers;
    const q = searchLayer.toLowerCase();
    return layers.filter(l => l.name.toLowerCase().includes(q) || (l.description && l.description.toLowerCase().includes(q)));
  }, [layers, searchLayer]);

  // انتخاب لایه برای ویرایش استایل
  const handleSelectLayerForStyle = (layer: MapLayer) => {
    setSelectedLayerIds([layer.id]);
    setStyleColor(layer.color || '#00D4FF');
    setStyleWidth(layer.strokeWidth || 2);
    setStyleDash(layer.strokeDash || 'solid');
    setStyleOpacity(layer.opacity ?? 0.85);
    setIsStyleExpanded(true);
  };

  // اعمال استایل
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

  return (
    <aside 
      className="w-80 h-full flex flex-col bg-[#070F1E]/95 backdrop-blur-xl border-l border-slate-800/90 text-slate-200 select-none shadow-2xl z-20 shrink-0"
      dir="rtl"
    >
      {/* هدر بالایی پنل مشخصات CAD (AutoCAD Properties Palette Header) */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-950/90 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-xs font-mono">
            P
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5 font-mono">
              <span>PROPERTIES</span>
              <span className="text-[10px] font-sans text-slate-400 font-normal">| مشخصات و لایه‌ها</span>
            </h3>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="بستن پنل"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* سربرگ‌های ناوبری داخل پنل مشخصات */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-1 gap-1 shrink-0 text-[11px]">
        <button
          onClick={() => setActiveTab('PROPERTIES')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'PROPERTIES'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <InformationCircleIcon className="w-3.5 h-3.5" />
          <span>مشخصات المان</span>
          {selectedFeature && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('LAYERS')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'LAYERS'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Square2StackIcon className="w-3.5 h-3.5" />
          <span>لایه‌ها ({layers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('VIEW')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'VIEW'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
          <span>دید و بوم</span>
        </button>
      </div>

      {/* بدنه محتوا بر اساس تب فعال */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-xs">
        
        {/* ======================= تب ۱: مشخصات المان انتخاب شده ======================= */}
        {activeTab === 'PROPERTIES' && (
          selectedFeature ? (
            <div className="space-y-3">
              {/* کارت هدر عارضه انتخابی */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {selectedFeature.category === 'SUB_BLOCK' ? 'ساب‌بلوک معدنی' :
                     selectedFeature.category === 'HAUL_ROAD' ? 'خط مسیر / رمپ' :
                     selectedFeature.category === 'BENCH_CREST' ? 'خط لبه پله (Crest)' :
                     selectedFeature.category === 'BENCH_TOE' ? 'خط پای پله (Toe)' :
                     selectedFeature.category === 'SURVEY_BENCHMARK' ? 'بنچ‌مارک نقشه‌برداری' :
                     selectedFeature.category === 'ANNOTATION' ? 'یادداشت متنی' : 'عارضه هندسی'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {selectedFeature.type}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <h4 className="font-bold text-white text-sm">
                    {selectedFeature.name}
                  </h4>
                  {selectedFeature.properties?.code && (
                    <span className="text-[11px] font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                      {selectedFeature.properties.code}
                    </span>
                  )}
                </div>
              </div>

              {/* بخش مشخصات عمومی و لایه در AutoCAD */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-1">
                  GENERAL (مشخصات لایه و رنگ)
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">لایه (Layer):</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {layers.find(l => l.id === selectedFeature.layerId)?.name || 'پیش‌فرض'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">رنگ ترسیم:</span>
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-white/40" 
                      style={{ backgroundColor: selectedFeature.style?.strokeColor || selectedFeature.style?.fillColor || '#00D4FF' }} 
                    />
                    <span className="font-mono text-[10px] text-slate-300">
                      {selectedFeature.style?.strokeColor || '#00D4FF'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">ضخامت خط (LineWeight):</span>
                  <span className="font-mono text-slate-200">
                    {selectedFeature.style?.strokeWidth || 2} px
                  </span>
                </div>
              </div>

              {/* بخش مختصات و ژئومتری CAD */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-1">
                  GEOMETRY (هندسه و مختصات)
                </div>

                {/* اگر ساب‌بلوک یا چندضلعی است: مساحت و محیط */}
                {selectedFeature.type === 'POLYGON' && selectedFeature.properties?.area && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">مساحت (Area):</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {Math.round(selectedFeature.properties.area).toLocaleString()} m²
                    </span>
                  </div>
                )}

                {/* اگر خط یا رمپ است: طول کل */}
                {selectedFeature.type === 'POLYLINE' && selectedFeature.properties?.length && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">طول کل (Length):</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {Math.round(selectedFeature.properties.length).toLocaleString()} m
                    </span>
                  </div>
                )}

                {/* تراز Z */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">تراز ارتفاعی (Elevation):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {selectedFeature.elevation || selectedFeature.coordinates?.[0]?.[2] || benchLevel} m
                  </span>
                </div>

                {/* تعداد رئوس مختصاتی */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">تعداد گره‌ها (Vertices):</span>
                  <span className="font-mono text-slate-300 font-bold">
                    {selectedFeature.coordinates?.length || 0} نقطه
                  </span>
                </div>
              </div>

              {/* بخش پارامترهای کیفی و معدنی ساب‌بلوک */}
              {selectedFeature.category === 'SUB_BLOCK' && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-1">
                    MINING ATTRIBUTES (پارامترهای معدنی)
                  </div>

                  {selectedFeature.properties?.feGrade !== undefined && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">عیار آهن (% Fe):</span>
                      <span className="font-bold text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50">
                        {selectedFeature.properties.feGrade}%
                      </span>
                    </div>
                  )}

                  {selectedFeature.properties?.tonnage !== undefined && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">تناژ تخمینی:</span>
                      <span className="font-bold text-cyan-300 font-mono">
                        {selectedFeature.properties.tonnage.toLocaleString()} تن
                      </span>
                    </div>
                  )}

                  {selectedFeature.properties?.rockType && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">نوع کانسنگ:</span>
                      <span className="text-slate-200 font-semibold">
                        {selectedFeature.properties.rockType}
                      </span>
                    </div>
                  )}

                  {selectedFeature.properties?.destination && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">مقصد تخلیه:</span>
                      <span className="text-amber-300 font-semibold">
                        {selectedFeature.properties.destination}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* دکمه‌های عملیاتی برای عارضه انتخابی */}
              {canEdit && (
                <div className="flex items-center gap-2 pt-1">
                  {onEditFeatureRequest && (
                    <button
                      onClick={() => onEditFeatureRequest(selectedFeature)}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      <span>ویرایش مشخصات</span>
                    </button>
                  )}

                  {onDeleteFeatureRequest && (
                    <button
                      onClick={() => onDeleteFeatureRequest(selectedFeature)}
                      className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-all flex items-center justify-center"
                      title="حذف المان"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => onSelectFeature(null)}
                className="w-full py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] font-bold transition-all text-center"
              >
                لغو انتخاب المان (Deselect)
              </button>
            </div>
          ) : (
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <InformationCircleIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-300">عنصری انتخاب نشده است</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  جهت مشاهده، بازرسی و ویرایش ویژگی‌ها، یک ساب‌بلوک، خط یا بنچ‌مارک را روی نقشه کلیک کنید.
                </p>
              </div>

              {/* خلاصه وضعیت کلی نقشه در حالت بدون انتخاب */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-right text-[11px]">
                <div className="text-[10px] font-bold text-cyan-400 font-mono border-b border-slate-800 pb-1">
                  MAP SUMMARY (خلاصه نقشه)
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">تراز استخراج پله:</span>
                  <span className="font-mono font-bold text-amber-400">{benchLevel} متر</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">تعداد کل لایه‌ها:</span>
                  <span className="font-mono font-bold text-white">{layers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">تعداد کل ترسیمات:</span>
                  <span className="font-mono font-bold text-cyan-400">{totalFeaturesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">سیستم مختصات:</span>
                  <span className="font-mono text-[10px] text-slate-300">UTM Zone 39N</span>
                </div>
              </div>
            </div>
          )
        )}

        {/* ======================= تب ۲: مدیریت لایه‌ها و تغییر استایل ======================= */}
        {activeTab === 'LAYERS' && (
          <div className="space-y-3">
            {/* ابزار استایل‌دهی سریع لایه‌ها (Layer Style Editor) */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2.5">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsStyleExpanded(!isStyleExpanded)}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <PaintBrushIcon className="w-4 h-4" />
                  <span>تغییر استایل لایه‌ها</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedLayerIds.length > 0 ? `${selectedLayerIds.length} لایه` : 'انتخاب کنید'}
                  </span>
                  {isStyleExpanded ? <ChevronUpIcon className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </div>

              {isStyleExpanded && (
                <div className="space-y-2.5 pt-1 text-[11px]">
                  {/* انتخاب رنگ از پالت */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">رنگ لایه (Color):</label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {CAD_PALETTE.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => setStyleColor(c.hex)}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                          className={`h-5 rounded-md border transition-all ${
                            styleColor.toLowerCase() === c.hex.toLowerCase()
                              ? 'ring-2 ring-cyan-400 scale-110 border-white'
                              : 'border-white/20 hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ضخامت خط و الگوی خط‌چین */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">ضخامت خط:</label>
                      <select
                        value={styleWidth}
                        onChange={(e) => setStyleWidth(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                      >
                        <option value={1}>1 px (باریک)</option>
                        <option value={2}>2 px (استاندارد)</option>
                        <option value={3}>3 px (برجسته)</option>
                        <option value={4}>4 px (ضخیم)</option>
                        <option value={6}>6 px (خیلی ضخیم)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">الگوی خط:</label>
                      <select
                        value={styleDash}
                        onChange={(e) => setStyleDash(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none focus:border-cyan-400"
                      >
                        <option value="solid">ممتد (Solid)</option>
                        <option value="dashed">خط‌چین (Dashed)</option>
                        <option value="dotted">نقطه‌چین (Dotted)</option>
                        <option value="dashdot">خط و نقطه</option>
                      </select>
                    </div>
                  </div>

                  {/* اسلایدر شفافیت (Opacity) */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span>شفافیت (Opacity):</span>
                      <span className="font-mono text-cyan-300">{Math.round(styleOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={styleOpacity}
                      onChange={(e) => setStyleOpacity(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* چک‌باکس اعمال روی المان‌های موجود */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-300 pt-0.5">
                    <input
                      type="checkbox"
                      checked={applyToExisting}
                      onChange={(e) => setApplyToExisting(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
                    />
                    <span>اعمال روی تمام ترسیم‌ها و عوارض لایه</span>
                  </label>

                  {/* دکمه اعمال استایل */}
                  <button
                    onClick={handleApplyStyle}
                    disabled={selectedLayerIds.length === 0}
                    className={`w-full py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      selectedLayerIds.length > 0
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>اعمال استایل روی {selectedLayerIds.length || '...'} لایه</span>
                  </button>
                </div>
              )}
            </div>

            {/* کادر جستجوی لایه‌ها */}
            <div className="relative">
              <input
                type="text"
                placeholder="جستجوی لایه..."
                value={searchLayer}
                onChange={(e) => setSearchLayer(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* نوار اقدامات دسته‌جمعی لایه‌ها */}
            <div className="flex items-center justify-between text-[11px] px-1 text-slate-400 font-bold">
              <span>فهرست لایه‌ها ({filteredLayers.length})</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onBatchToggleLayers(layers.map(l => l.id), true)}
                  className="hover:text-cyan-300 transition-colors"
                >
                  نمایش همه
                </button>
                <span>|</span>
                <button
                  onClick={() => onBatchToggleLayers(layers.map(l => l.id), false)}
                  className="hover:text-rose-400 transition-colors"
                >
                  مخفی‌سازی همه
                </button>
              </div>
            </div>

            {/* فهرست کارت‌های لایه */}
            <div className="space-y-1.5">
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
                    {/* انتخاب لایه و رنگ */}
                    <div 
                      className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleSelectLayerForStyle(layer)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectLayerForStyle(layer);
                        }}
                        style={{ backgroundColor: layer.color || '#00D4FF' }}
                        className="w-3.5 h-3.5 rounded-md shrink-0 border border-white/30 hover:scale-110 transition-transform"
                        title="انتخاب برای تغییر استایل"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-xs truncate">
                          {layer.name}
                        </div>
                        {layer.description && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {layer.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* دکمه‌های کنترل لایه (چشم، برچسب، قفل) */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* نمایش/مخفی برچسب */}
                      {onToggleLayerLabels && (
                        <button
                          onClick={() => onToggleLayerLabels(layer.id)}
                          className={`p-1 rounded-md transition-colors ${
                            layer.showLabels !== false
                              ? 'text-cyan-400 bg-cyan-950/40 hover:bg-cyan-950/70'
                              : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                          }`}
                          title={layer.showLabels !== false ? 'برچسب‌های لایه فعال است' : 'برچسب‌های لایه خاموش است'}
                        >
                          <TagIcon className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* قفل لایه */}
                      {onToggleLayerLock && (
                        <button
                          onClick={() => onToggleLayerLock(layer.id)}
                          className={`p-1 rounded-md transition-colors ${
                            layer.locked
                              ? 'text-amber-400 bg-amber-950/40 hover:bg-amber-950/70'
                              : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                          }`}
                          title={layer.locked ? 'لایه قفل است' : 'لایه قابل ویرایش است'}
                        >
                          {layer.locked ? <LockClosedIcon className="w-3.5 h-3.5" /> : <LockOpenIcon className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {/* مرئی/نامرئی بودن لایه */}
                      <button
                        onClick={() => onToggleLayerVisibility(layer.id)}
                        className={`p-1 rounded-md transition-colors ${
                          layer.visible
                            ? 'text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/70'
                            : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                        }`}
                        title={layer.visible ? 'لایه مرئی است' : 'لایه پنهان است'}
                      >
                        {layer.visible ? <EyeIcon className="w-3.5 h-3.5" /> : <EyeSlashIcon className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= تب ۳: تنظیمات دید و بوم نقشه ======================= */}
        {activeTab === 'VIEW' && (
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-[10px] font-bold text-cyan-400 uppercase font-mono border-b border-slate-800 pb-1">
                CAD GRID & CONTOURS (شبکه و ترازها)
              </div>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 cursor-pointer">
                <span className="text-slate-300">شبکه شطرنجی CAD (Grid):</span>
                <input
                  type="checkbox"
                  checked={displaySettings.showCadGrid}
                  onChange={(e) => onChangeDisplaySettings({ showCadGrid: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 cursor-pointer">
                <span className="text-slate-300">منحنی‌های میزان تراز پیت (Contours):</span>
                <input
                  type="checkbox"
                  checked={displaySettings.showContourLines}
                  onChange={(e) => onChangeDisplaySettings({ showContourLines: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
                />
              </label>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-[10px] font-bold text-cyan-400 uppercase font-mono border-b border-slate-800 pb-1">
                LABELS & VALUES (برچسب‌ها و مقادیر)
              </div>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 cursor-pointer">
                <span className="text-slate-300">برچسب کلی عوارض:</span>
                <input
                  type="checkbox"
                  checked={displaySettings.showLabels}
                  onChange={(e) => onChangeDisplaySettings({ showLabels: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 cursor-pointer">
                <span className="text-slate-300">برچسب ساب‌بلوک‌ها:</span>
                <input
                  type="checkbox"
                  checked={displaySettings.showSubBlockLabels}
                  onChange={(e) => onChangeDisplaySettings({ showSubBlockLabels: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 cursor-pointer">
                <span className="text-slate-300">برچسب خطوط و رمپ‌ها:</span>
                <input
                  type="checkbox"
                  checked={displaySettings.showLineLabels}
                  onChange={(e) => onChangeDisplaySettings({ showLineLabels: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 cursor-pointer">
                <span className="text-slate-300">برچسب بنچ‌مارک‌ها و نقاط:</span>
                <input
                  type="checkbox"
                  checked={displaySettings.showPointLabels}
                  onChange={(e) => onChangeDisplaySettings({ showPointLabels: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 cursor-pointer">
                <span className="text-slate-300">نمایش عیار آهن روی ساب‌بلوک:</span>
                <input
                  type="checkbox"
                  checked={displaySettings.showGradeValues}
                  onChange={(e) => onChangeDisplaySettings({ showGradeValues: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-400 focus:ring-0"
                />
              </label>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
