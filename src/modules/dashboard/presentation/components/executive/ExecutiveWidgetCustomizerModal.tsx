// src/modules/dashboard/presentation/components/executive/ExecutiveWidgetCustomizerModal.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { 
  XMarkIcon, 
  CheckIcon, 
  SparklesIcon, 
  ArrowPathIcon, 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  RectangleGroupIcon,
  BriefcaseIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
  CircleStackIcon,
  FireIcon,
  ClipboardDocumentCheckIcon,
  GlobeAmericasIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { 
  EXECUTIVE_WIDGETS_CONFIG, 
  PRESET_PROFILES, 
  ExecutiveWidgetCategory, 
  ExecutiveWidgetConfig 
} from './executiveWidgets.types';

interface ExecutiveWidgetCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleWidgets: Record<string, boolean>;
  onToggleWidget: (id: string) => void;
  onApplyPreset: (widgetIds: string[]) => void;
  onSelectAll: () => void;
  onHideAll: () => void;
  onResetDefaults: () => void;
}

export const ExecutiveWidgetCustomizerModal: React.FC<ExecutiveWidgetCustomizerModalProps> = ({
  isOpen,
  onClose,
  visibleWidgets,
  onToggleWidget,
  onApplyPreset,
  onSelectAll,
  onHideAll,
  onResetDefaults
}) => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExecutiveWidgetCategory>('ALL');

  if (!isOpen) return null;

  const categories: { id: ExecutiveWidgetCategory; labelFa: string; labelEn: string }[] = [
    { id: 'ALL', labelFa: 'همه ویجت‌ها', labelEn: 'All Widgets' },
    { id: 'PROCESSING', labelFa: 'دپو، خردایش و عیار', labelEn: 'Stockpiles & Grades' },
    { id: 'EXTRACTION', labelFa: 'استخراج و لیتولوژی', labelEn: 'Extraction & Rocks' },
    { id: 'FLEET_WASTE', labelFa: 'باطله‌برداری و ناوگان', labelEn: 'Stripping & Fleet' },
    { id: 'FINANCE_PLAN', labelFa: 'مالی، بهای تمام‌شده و برنامه', labelEn: 'Cost & Planning' },
    { id: 'SAFETY_ENV', labelFa: 'ایمنی و محیط‌زیست', labelEn: 'Safety & Environment' },
  ];

  const getWidgetIcon = (id: string) => {
    switch (id) {
      case 'stockpile_inventory': return CircleStackIcon;
      case 'extraction_by_rock': return CubeTransparentIcon;
      case 'stripping_ratio_trend': return ArrowPathIcon;
      case 'crusher_feed_grade': return SparklesIcon;
      case 'fleet_oee_utilization': return TruckIcon;
      case 'unit_cost_revenue': return CurrencyDollarIcon;
      case 'slope_stability_safety': return ShieldCheckIcon;
      case 'drill_blast_broken_ore': return FireIcon;
      case 'mining_plan_compliance': return ClipboardDocumentCheckIcon;
      case 'tailings_environmental': return GlobeAmericasIcon;
      case 'shift_workforce_productivity': return UserGroupIcon;
      case 'strategic_manager_alerts': return SparklesIcon;
      default: return RectangleGroupIcon;
    }
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'briefcase': return BriefcaseIcon;
      case 'sparkles': return SparklesIcon;
      case 'truck': return TruckIcon;
      case 'currency': return CurrencyDollarIcon;
      case 'shield': return ShieldCheckIcon;
      default: return RectangleGroupIcon;
    }
  };

  const filteredWidgets = EXECUTIVE_WIDGETS_CONFIG.filter((w) => {
    const matchesCategory = selectedCategory === 'ALL' || w.category === selectedCategory;
    const matchesSearch = 
      w.titleFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.subtitleFa.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCount = Object.values(visibleWidgets).filter(Boolean).length;
  const totalCount = EXECUTIVE_WIDGETS_CONFIG.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-[#0E1424] border-[#1F293D] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#7C3AED] flex items-center justify-center text-white shadow-lg shadow-[#6366F1]/25">
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base md:text-lg font-black tracking-tight">
                  {isRtl ? 'مدیریت و سفارشی‌سازی ویجت‌های داشبورد کارفرما' : 'Customize Executive Management Widgets'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {activeCount} از {totalCount} فعال
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRtl ? 'ویجت‌های مدیریتی مورد نیاز برای تصمیم‌گیری را فعال یا غیرفعال کنید' : 'Show or hide key performance widgets for your executive mining overview'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Preset Profiles Bar */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-amber-400" />
                {isRtl ? 'پروفایل‌های آماده و سناریوهای مدیریتی:' : 'Management Preset Profiles:'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isRtl ? 'اعمال فوری چیدمان تخصصی تنها با یک کلیک' : 'One-click preset layouts'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {PRESET_PROFILES.map((preset) => {
                const IconComponent = getPresetIcon(preset.icon);
                const isPresetActive = preset.widgetIds.every(id => visibleWidgets[id]) && 
                  Object.keys(visibleWidgets).filter(k => visibleWidgets[k]).length === preset.widgetIds.length;

                return (
                  <button
                    key={preset.id}
                    onClick={() => onApplyPreset(preset.widgetIds)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 text-xs group ${
                      isPresetActive
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/40'
                        : isDark
                        ? 'bg-[#131B2E]/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 text-slate-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="font-black text-white text-[11px]">{isRtl ? preset.nameFa : preset.nameEn}</span>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        {preset.widgetIds.length} ویجت
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {isRtl ? preset.descFa : preset.nameEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search and Category Filter Strip */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <MagnifyingGlassIcon className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'جستجو در عنوان یا موضوع ویجت...' : 'Search widgets...'}
                className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={onSelectAll}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <EyeIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRtl ? 'نمایش همه' : 'Show All'}</span>
              </button>

              <button
                onClick={onHideAll}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <EyeSlashIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>{isRtl ? 'مخفی‌سازی همه' : 'Hide All'}</span>
              </button>

              <button
                onClick={onResetDefaults}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <ArrowPathIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isRtl ? 'پیش‌فرض' : 'Reset'}</span>
              </button>
            </div>
          </div>

          {/* Categories Pill Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white shadow-md'
                    : isDark
                    ? 'bg-[#131B2E] text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {isRtl ? cat.labelFa : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Widgets Grid with Interactive Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredWidgets.map((widget) => {
              const IconComponent = getWidgetIcon(widget.id);
              const isVisible = !!visibleWidgets[widget.id];

              return (
                <div
                  key={widget.id}
                  onClick={() => onToggleWidget(widget.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 group select-none ${
                    isVisible
                      ? isDark
                        ? 'bg-slate-900/80 border-indigo-500/50 shadow-lg shadow-indigo-500/5'
                        : 'bg-indigo-50/50 border-indigo-300 shadow-sm'
                      : isDark
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60 hover:opacity-100'
                      : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                        isVisible
                          ? 'bg-gradient-to-br from-[#6366F1]/20 to-[#7C3AED]/20 border-indigo-500/40 text-indigo-400 scale-105'
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors">
                          {isRtl ? widget.titleFa : widget.titleEn}
                        </h4>
                        {widget.badgeFa && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-indigo-400 border border-slate-700">
                            {widget.badgeFa}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {isRtl ? widget.subtitleFa : widget.titleEn}
                      </p>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <div 
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0 ${
                      isVisible ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div 
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        isVisible ? (isRtl ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/60 flex items-center justify-between bg-slate-950/40">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-emerald-400" />
            <span>{isRtl ? 'تنظیمات چیدمان ویجت‌ها به‌صورت خودکار در مرورگر ذخیره می‌شود.' : 'Layout preferences saved locally.'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] shadow-lg shadow-[#6366F1]/30 transition-all cursor-pointer"
          >
            {isRtl ? 'تأیید و بازگشت به داشبورد' : 'Done & Return'}
          </button>
        </div>
      </div>
    </div>
  );
};
