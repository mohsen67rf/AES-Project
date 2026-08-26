// src/modules/mine/presentation/components/Map/components/MapLegend.tsx

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../../shared/context/LanguageContext';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  EyeOff,
  Filter,
  Flame,
  Truck,
  Pickaxe,
  Factory,
  ShieldAlert,
  Droplets,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FlaskConical,
  Compass,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';

export interface LegendItem {
  id: string;
  name: string;
  nameEn: string;
  category: 'zone' | 'status' | 'grade';
  color: string;
  borderColor?: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
  descriptionEn: string;
  count?: number;
  gradeRange?: string;
}

export const MINING_ZONES: LegendItem[] = [
  {
    id: 'zone-high-grade',
    name: 'محدوده کانسنگ پرعیار (High-Grade)',
    nameEn: 'High-Grade Ore Zone',
    category: 'zone',
    color: '#10B981',
    borderColor: '#059669',
    icon: Pickaxe,
    description: 'عیار بالای ۴۵٪ آهن / ماده معدنی اصلی برای تغذیه کارخانه',
    descriptionEn: 'Grade >45% Fe / Primary crusher feed material',
    gradeRange: '> 45% Fe'
  },
  {
    id: 'zone-medium-grade',
    name: 'محدوده کانسنگ متوسط‌عیار (Medium-Grade)',
    nameEn: 'Medium-Grade Ore Zone',
    category: 'zone',
    color: '#F59E0B',
    borderColor: '#D97706',
    icon: Pickaxe,
    description: 'عیار بین ۳۰٪ تا ۴۵٪ آهن / مناسب جهت اختلاط و پرعیارسازی',
    descriptionEn: 'Grade 30-45% Fe / Blending & beneficiation feed',
    gradeRange: '30% - 45% Fe'
  },
  {
    id: 'zone-low-grade',
    name: 'محدوده کانسنگ کم‌عیار (Low-Grade)',
    nameEn: 'Low-Grade Ore Zone',
    category: 'zone',
    color: '#F97316',
    borderColor: '#EA580C',
    icon: Pickaxe,
    description: 'عیار بین ۱۵٪ تا ۳۰٪ آهن / دپوی استراتژیک بلندمدت',
    descriptionEn: 'Grade 15-30% Fe / Long-term strategic stockpile',
    gradeRange: '15% - 30% Fe'
  },
  {
    id: 'zone-waste-dump',
    name: 'دپوی باطله و آبرفتی (Waste Dump)',
    nameEn: 'Waste & Alluvial Dump',
    category: 'zone',
    color: '#EF4444',
    borderColor: '#DC2626',
    icon: AlertTriangle,
    description: 'مواد غیرمعدنی و باطله حاصل از روبازکنی پیت',
    descriptionEn: 'Non-economic waste rock and overburden disposal',
    gradeRange: '< 15% Fe'
  },
  {
    id: 'zone-blasting',
    name: 'محدوده آتشباری و حریم ایمنی (Blast Zone)',
    nameEn: 'Blasting & Safety Zone',
    category: 'zone',
    color: '#A855F7',
    borderColor: '#9333EA',
    icon: Flame,
    description: 'محدوده تحت عملیات خرج‌گذاری، آتشباری یا تخلیه اضطراری',
    descriptionEn: 'Active blasting perimeter & high-risk exclusion area',
  },
  {
    id: 'zone-haul-road',
    name: 'مسیر حمل و رمپ دسترسی (Haul Road)',
    nameEn: 'Haul Roads & Ramps',
    category: 'zone',
    color: '#06B6D4',
    borderColor: '#0891B2',
    icon: Truck,
    description: 'شبکه شریانی تردد دامپتراک‌ها و شیب‌راه‌های انتقال بار',
    descriptionEn: 'Main heavy haulage routes, switchbacks and access ramps',
  },
  {
    id: 'zone-plant',
    name: 'تاسیسات فرآوری و سنگ‌شکن (Plant)',
    nameEn: 'Processing Plant & Crusher',
    category: 'zone',
    color: '#3B82F6',
    borderColor: '#2563EB',
    icon: Factory,
    description: 'واحد سنگ‌شکن اولیه، خردایش و تغذیه خط تولید',
    descriptionEn: 'Primary crushing facility, sizing plant & conveyor hubs',
  },
  {
    id: 'zone-blast-holes',
    name: 'الگوی چال‌های انفجاری (Blast Holes)',
    nameEn: 'Blast Holes Pattern',
    category: 'zone',
    color: '#EAB308',
    borderColor: '#CA8A04',
    icon: CircleDot,
    description: 'نقاط حفاری شده و آماده خرج‌گذاری مواد ناریه',
    descriptionEn: 'Drilled blast holes pattern ready for explosive charging',
  },
  {
    id: 'zone-drainage',
    name: 'حوضچه زهکشی و پمپاژ (Drainage/Sump)',
    nameEn: 'Drainage Basin & Sump',
    category: 'zone',
    color: '#0EA5E9',
    borderColor: '#0284C7',
    icon: Droplets,
    description: 'محل جمع‌آوری آب‌های سطحی کف پیت و تاسیسات پمپاژ',
    descriptionEn: 'Pit floor sump pump station and drainage runoff basin',
  },
];

export const PIT_STATUSES: LegendItem[] = [
  {
    id: 'status-active',
    name: 'پیت فعال / در حال استخراج',
    nameEn: 'Active Extraction Pit',
    category: 'status',
    color: '#22C55E',
    borderColor: '#16A34A',
    icon: CheckCircle2,
    description: 'پیت با عملیات استخراج و بارگیری پیوسته در شیفت جاری',
    descriptionEn: 'Currently active excavation and loading operations',
  },
  {
    id: 'status-drilling',
    name: 'در حال عملیات حفاری (Drilling)',
    nameEn: 'Drilling in Progress',
    category: 'status',
    color: '#38BDF8',
    borderColor: '#0284C7',
    icon: Pickaxe,
    description: 'استقرار دکل‌های حفاری و ایجاد چال‌های الگوی آتشباری',
    descriptionEn: 'Drill rigs deployed on bench for pattern preparation',
  },
  {
    id: 'status-sampling',
    name: 'نمونه‌برداری و آزمایشگاه (Sampling)',
    nameEn: 'Sampling & Lab Assay',
    category: 'status',
    color: '#8B5CF6',
    borderColor: '#7C3AED',
    icon: FlaskConical,
    description: 'برداشت نمونه ژئوشیمیایی و پایش کنترل کیفی عیار',
    descriptionEn: 'Geochemical sampling and laboratory grade validation',
  },
  {
    id: 'status-haulage',
    name: 'آماده بارگیری و حمل (Haulage Ready)',
    nameEn: 'Haulage & Dispatching',
    category: 'status',
    color: '#F59E0B',
    borderColor: '#D97706',
    icon: Truck,
    description: 'بلوک‌های انفجاریافته و در حال بارگیری به مقاصد تعیین‌شده',
    descriptionEn: 'Blasted muckpile ready for shovel loading & dispatch',
  },
  {
    id: 'status-hold',
    name: 'متوقف / کنترل ایمنی و پایداری (Hold)',
    nameEn: 'Safety Hold / Monitoring',
    category: 'status',
    color: '#F43F5E',
    borderColor: '#E11D48',
    icon: ShieldAlert,
    description: 'توقف موقت به دلیل بازرسی پایداری دیواره یا شرایط جوی',
    descriptionEn: 'Temporary suspension due to wall stability or weather',
  },
  {
    id: 'status-completed',
    name: 'استخراج خاتمه‌یافته / بازسازی (Reclaimed)',
    nameEn: 'Completed & Reclaimed',
    category: 'status',
    color: '#64748B',
    borderColor: '#475569',
    icon: Clock,
    description: 'بلوک یا پله نهایی‌شده و در مرحله بازسازی محیطی',
    descriptionEn: 'Mined-out bench / environmental reclamation stage',
  },
];

interface MapLegendProps {
  onFilterChange?: (activeIds: string[]) => void;
  onItemClick?: (item: LegendItem) => void;
  geoData?: any;
  defaultExpanded?: boolean;
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function MapLegend({
  onFilterChange,
  onItemClick,
  geoData,
  defaultExpanded = false,
  className = '',
  position = 'top-left'
}: MapLegendProps) {
  const { isDark } = useTheme();
  const { lang } = useLanguage();
  const isFa = lang === 'fa';

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'all' | 'zone' | 'status'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Combine items and calculate counts if geoData contains relevant properties
  const allItems = useMemo(() => {
    const combined = [...MINING_ZONES, ...PIT_STATUSES];

    if (!geoData || !geoData.features) {
      return combined;
    }

    // Attempt to match feature names, types, or layer names with legend items
    const counts: Record<string, number> = {};
    geoData.features.forEach((feature: any) => {
      const props = feature.properties || {};
      const text = `${props.name || ''} ${props.layer || ''} ${props.description || ''} ${props.color || ''}`.toLowerCase();

      combined.forEach(item => {
        const matchName = item.name.toLowerCase();
        const matchNameEn = item.nameEn.toLowerCase();
        const matchColor = item.color.toLowerCase();

        if (
          text.includes(matchColor) ||
          (props.color && props.color.toLowerCase() === matchColor) ||
          (props.layer && (props.layer.toLowerCase().includes(item.id) || matchName.includes(props.layer.toLowerCase()))) ||
          (props.name && (matchName.includes(props.name.toLowerCase()) || matchNameEn.includes(props.name.toLowerCase())))
        ) {
          counts[item.id] = (counts[item.id] || 0) + 1;
        }
      });
    });

    return combined.map(item => ({
      ...item,
      count: counts[item.id] || undefined
    }));
  }, [geoData]);

  // Filter items by active tab and search query
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesTab;

      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.nameEn.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.descriptionEn.toLowerCase().includes(query) ||
        (item.gradeRange && item.gradeRange.toLowerCase().includes(query));

      return matchesTab && matchesSearch;
    });
  }, [allItems, activeTab, searchQuery]);

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (onFilterChange) {
        const visibleIds = allItems.map(i => i.id).filter(itemI => !next.has(itemI));
        onFilterChange(visibleIds);
      }
      return next;
    });
  };

  const handleSelectAll = (visible: boolean) => {
    if (visible) {
      setHiddenIds(new Set());
      if (onFilterChange) {
        onFilterChange(allItems.map(i => i.id));
      }
    } else {
      const allIds = new Set(allItems.map(i => i.id));
      setHiddenIds(allIds);
      if (onFilterChange) {
        onFilterChange([]);
      }
    }
  };

  const handleItemClick = (item: LegendItem) => {
    const nextSelected = selectedItemId === item.id ? null : item.id;
    setSelectedItemId(nextSelected);
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }[position];

  return (
    <div
      id="map-interactive-legend"
      className={`absolute ${positionClasses} z-[1000] transition-all duration-300 font-sans pointer-events-auto select-none ${className}`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Minimized Pill Button when collapsed */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl shadow-xl backdrop-blur-md border transition-all duration-200 hover:scale-105 active:scale-95 ${
            isDark
              ? 'bg-[#0A1628]/90 hover:bg-[#0A1628] text-white border-[#AACCDD]/20 shadow-black/40 hover:border-[#AACCDD]/40'
              : 'bg-white/95 hover:bg-white text-slate-800 border-slate-200 shadow-slate-300/50 hover:border-slate-300'
          }`}
          title={isFa ? 'نمایش راهنمای نقشه و زون‌های معدنی' : 'Show Map Legend & Mining Zones'}
        >
          <div className="relative">
            <Layers className={`w-4 h-4 ${isDark ? 'text-[#C9A227]' : 'text-amber-600'}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>
          <span className="text-xs font-semibold tracking-wide">
            {isFa ? 'راهنمای نقشه' : 'Map Legend'}
          </span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
        </button>
      ) : (
        /* Full Expanded Interactive Legend Card */
        <div
          className={`w-80 md:w-96 rounded-2xl shadow-2xl backdrop-blur-xl border flex flex-col overflow-hidden transition-all duration-300 max-h-[80vh] ${
            isDark
              ? 'bg-[#0A1628]/95 border-[#AACCDD]/25 shadow-black/60 text-white'
              : 'bg-white/95 border-slate-200 shadow-slate-400/30 text-slate-800'
          }`}
        >
          {/* Header */}
          <div
            className={`p-3.5 px-4 flex items-center justify-between border-b ${
              isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-[#C9A227]/20 text-[#C9A227]' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">
                  {isFa ? 'راهنمای زون‌ها و وضعیت پیت' : 'Mining Zones & Pit Status'}
                </h4>
                <p
                  className={`text-[10px] ${
                    isDark ? 'text-[#8A9DB0]' : 'text-slate-500'
                  }`}
                >
                  {isFa ? 'تفکیک رنگی کانسنگ و لایه‌ها' : 'Interactive Color-Coded Markers'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-white/10 text-[#8A9DB0] hover:text-white'
                    : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
                }`}
                title={isFa ? 'بستن' : 'Close'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search & Global Controls */}
          <div className="p-3 pb-2 space-y-2">
            <div className="relative">
              <Search
                className={`w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 ${
                  isFa ? 'right-2.5' : 'left-2.5'
                } ${isDark ? 'text-[#8A9DB0]' : 'text-slate-400'}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={
                  isFa
                    ? 'جستجوی زون، عیار، یا وضعیت...'
                    : 'Search zone, grade, or status...'
                }
                className={`w-full text-xs py-1.5 rounded-lg border outline-none transition-all ${
                  isFa ? 'pr-8 pl-7' : 'pl-8 pr-7'
                } ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-[#8A9DB0] focus:border-[#AACCDD]/40 focus:bg-white/10'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:bg-white'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute top-1/2 -translate-y-1/2 ${
                    isFa ? 'left-2' : 'right-2'
                  } p-0.5 rounded text-slate-400 hover:text-white`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div
              className={`flex rounded-lg p-0.5 border text-[11px] font-medium ${
                isDark ? 'bg-black/20 border-white/5' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 px-2 rounded-md transition-all text-center ${
                  activeTab === 'all'
                    ? isDark
                      ? 'bg-[#C9A227] text-slate-900 font-bold shadow'
                      : 'bg-white text-slate-900 font-bold shadow-sm'
                    : isDark
                    ? 'text-[#8A9DB0] hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isFa ? 'همه' : 'All'} ({allItems.length})
              </button>
              <button
                onClick={() => setActiveTab('zone')}
                className={`flex-1 py-1 px-2 rounded-md transition-all text-center ${
                  activeTab === 'zone'
                    ? isDark
                      ? 'bg-[#C9A227] text-slate-900 font-bold shadow'
                      : 'bg-white text-slate-900 font-bold shadow-sm'
                    : isDark
                    ? 'text-[#8A9DB0] hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isFa ? 'زون‌های معدن' : 'Zones'} ({MINING_ZONES.length})
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-1 px-2 rounded-md transition-all text-center ${
                  activeTab === 'status'
                    ? isDark
                      ? 'bg-[#C9A227] text-slate-900 font-bold shadow'
                      : 'bg-white text-slate-900 font-bold shadow-sm'
                    : isDark
                    ? 'text-[#8A9DB0] hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isFa ? 'وضعیت پیت' : 'Statuses'} ({PIT_STATUSES.length})
              </button>
            </div>

            {/* Sub-actions toolbar */}
            <div className="flex items-center justify-between text-[10px] px-1 text-slate-400">
              <span className="flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#C9A227]" />
                {isFa ? `${filteredItems.length} مورد نمایش داده شده` : `${filteredItems.length} items`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSelectAll(true)}
                  className="hover:text-[#C9A227] transition-colors underline"
                >
                  {isFa ? 'فعال‌سازی همه' : 'Show All'}
                </button>
                <span>|</span>
                <button
                  onClick={() => handleSelectAll(false)}
                  className="hover:text-rose-400 transition-colors underline"
                >
                  {isFa ? 'پنهان‌سازی همه' : 'Hide All'}
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Legend List */}
          <div className="px-3 pb-3 space-y-1.5 overflow-y-auto max-h-[46vh] custom-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-xs opacity-60">
                {isFa ? 'موردی یافت نشد' : 'No items found'}
              </div>
            ) : (
              filteredItems.map(item => {
                const isHidden = hiddenIds.has(item.id);
                const isSelected = selectedItemId === item.id;
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`group relative rounded-xl p-2.5 transition-all duration-200 border cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-white/10 border-[#C9A227] shadow-lg ring-1 ring-[#C9A227]/50'
                          : 'bg-amber-50 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                        : isDark
                        ? 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5 hover:border-white/15'
                        : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200/70 hover:border-slate-300'
                    } ${isHidden ? 'opacity-40 grayscale' : 'opacity-100'}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Color Badge / Icon */}
                      <div className="relative mt-0.5 flex-shrink-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shadow-inner transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: `${item.color}25`,
                            border: `1.5px solid ${item.color}`,
                          }}
                        >
                          <IconComponent size={14} style={{ color: item.color }} />
                        </div>
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 shadow-sm"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-semibold truncate ${
                              isSelected
                                ? isDark
                                  ? 'text-[#C9A227]'
                                  : 'text-amber-700'
                                : isDark
                                ? 'text-white'
                                : 'text-slate-800'
                            }`}
                          >
                            {isFa ? item.name : item.nameEn}
                          </span>

                          {/* Grade Badge or Count */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {item.gradeRange && (
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium"
                                style={{
                                  backgroundColor: `${item.color}20`,
                                  color: item.color,
                                }}
                              >
                                {item.gradeRange}
                              </span>
                            )}
                            {item.count !== undefined && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300 font-mono">
                                {item.count}
                              </span>
                            )}
                          </div>
                        </div>

                        <p
                          className={`text-[10px] mt-0.5 line-clamp-2 leading-relaxed ${
                            isDark ? 'text-[#8A9DB0]' : 'text-slate-500'
                          }`}
                        >
                          {isFa ? item.description : item.descriptionEn}
                        </p>
                      </div>

                      {/* Visibility Toggle Button */}
                      <button
                        onClick={e => toggleVisibility(item.id, e)}
                        className={`p-1 rounded-md transition-colors flex-shrink-0 ${
                          isDark
                            ? 'hover:bg-white/10 text-[#8A9DB0] hover:text-white'
                            : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
                        }`}
                        title={
                          isHidden
                            ? isFa
                              ? 'نمایش این لایه'
                              : 'Show this layer'
                            : isFa
                            ? 'پنهان‌سازی این لایه'
                            : 'Hide this layer'
                        }
                      >
                        {isHidden ? (
                          <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-emerald-400 opacity-70 group-hover:opacity-100" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Quick Status Summary */}
          <div
            className={`p-2 px-3 border-t flex items-center justify-between text-[10px] ${
              isDark
                ? 'border-white/10 bg-black/30 text-[#8A9DB0]'
                : 'border-slate-100 bg-slate-50 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isFa ? 'پایش زنده نقشه‌برداری' : 'Live Mine GIS'}</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs hover:text-[#C9A227] transition-colors"
            >
              {isFa ? 'جمع‌کردن ▲' : 'Collapse ▲'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default MapLegend;
