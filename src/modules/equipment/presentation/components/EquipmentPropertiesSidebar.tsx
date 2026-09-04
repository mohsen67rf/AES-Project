// src/modules/equipment/presentation/components/EquipmentPropertiesSidebar.tsx

import React, { useState } from 'react';
import { 
  EquipmentItem, 
  EquipmentCategory, 
  EquipmentStatus,
  EquipmentPosition
} from '../../domain/types/equipment.types';
import { MINE_MAP_ZONES } from '../../services/EquipmentService';
import { EquipmentVectorIcon } from './EquipmentVectorIcons';
import { 
  XMarkIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  MapPinIcon,
  CursorArrowRaysIcon,
  ClockIcon,
  FireIcon,
  BoltIcon,
  PhoneIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  FunnelIcon,
  CheckIcon,
  ChartBarIcon,
  ListBulletIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

export const ALL_EQUIPMENT_CATEGORIES: Array<{ id: EquipmentCategory; labelFa: string; color: string; group: string }> = [
  { id: 'EXCAVATOR', labelFa: 'بیل مکانیکی و شاول', color: '#F59E0B', group: 'بارگیری' },
  { id: 'LOADER', labelFa: 'لودر چرخ‌لاستیکی', color: '#EAB308', group: 'بارگیری' },
  { id: 'HYDRAULIC_BREAKER', labelFa: 'چکش هیدرولیکی (پیکور)', color: '#EF4444', group: 'بارگیری' },
  { id: 'DUMP_TRUCK_100T', labelFa: 'تراک ۱۰۰ تن', color: '#F97316', group: 'حمل' },
  { id: 'DUMP_TRUCK_60T', labelFa: 'تراک ۶۰ تن', color: '#EA580C', group: 'حمل' },
  { id: 'DUMP_TRUCK_35T', labelFa: 'تراک ۳۵ تن', color: '#FB923C', group: 'حمل' },
  { id: 'DRILL_RIG', labelFa: 'دستگاه حفاری و دریل', color: '#06B6D4', group: 'حفاری' },
  { id: 'BULLDOZER', labelFa: 'بولدوزر سنگین', color: '#CA8A04', group: 'پشتیبانی' },
  { id: 'MOTOR_GRADER', labelFa: 'گریدر تسطیح جاده', color: '#F59E0B', group: 'پشتیبانی' },
  { id: 'WATER_TRUCK', labelFa: 'تانکر آب‌پاش', color: '#0284C7', group: 'پشتیبانی' },
  { id: 'COMPACTOR', labelFa: 'غلطک راه‌سازی', color: '#EAB308', group: 'پشتیبانی' },
  { id: 'SERVICE_FUEL_TRUCK', labelFa: 'سوخت‌رسان و سرویس', color: '#D946EF', group: 'پشتیبانی' },
  { id: 'DIESEL_GENERATOR', labelFa: 'دیزل ژنراتور', color: '#10B981', group: 'پشتیبانی' },
  { id: 'PIT_WATER_PUMP', labelFa: 'پمپ تخلیه آب', color: '#06B6D4', group: 'پشتیبانی' }
];

export const CATEGORY_GROUP_PRESETS: Array<{ id: string; labelFa: string; categories: EquipmentCategory[] }> = [
  { id: 'LOADING', labelFa: 'بارگیری', categories: ['EXCAVATOR', 'LOADER', 'HYDRAULIC_BREAKER'] },
  { id: 'HAULING', labelFa: 'ناوگان حمل', categories: ['DUMP_TRUCK_100T', 'DUMP_TRUCK_60T', 'DUMP_TRUCK_35T'] },
  { id: 'DRILLING', labelFa: 'حفاری', categories: ['DRILL_RIG'] },
  { id: 'SUPPORT', labelFa: 'پشتیبانی و راه‌سازی', categories: ['BULLDOZER', 'MOTOR_GRADER', 'WATER_TRUCK', 'COMPACTOR', 'SERVICE_FUEL_TRUCK', 'DIESEL_GENERATOR', 'PIT_WATER_PUMP'] }
];

export const STATUS_CONFIG: Record<EquipmentStatus, { labelFa: string; badgeClass: string; dotClass: string }> = {
  ACTIVE: { 
    labelFa: 'در حال کار', 
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400 animate-pulse' 
  },
  HAULING: { 
    labelFa: 'در حال حمل بار', 
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dotClass: 'bg-cyan-400' 
  },
  STANDBY: { 
    labelFa: 'آماده‌به‌کار', 
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-400' 
  },
  REFUELING: { 
    labelFa: 'سوخت‌گیری/سرویس', 
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dotClass: 'bg-purple-400' 
  },
  MAINTENANCE: { 
    labelFa: 'توقف فنی/تعمیر', 
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-400' 
  },
  OFF: { 
    labelFa: 'خاموش/پایان شیفت', 
    badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    dotClass: 'bg-slate-400' 
  }
};

interface EquipmentPropertiesSidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  selectedItem: EquipmentItem | null;
  items: EquipmentItem[];
  isDark: boolean;
  selectedCategories: EquipmentCategory[];
  onToggleCategory: (cat: EquipmentCategory) => void;
  onSelectAllCategories: () => void;
  onClearCategories: () => void;
  onSetCategories?: (cats: EquipmentCategory[]) => void;
  statusFilter: EquipmentStatus | 'ALL';
  onSelectStatusFilter: (status: EquipmentStatus | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectEquipment: (item: EquipmentItem) => void;
  onStartPlacement: (item: EquipmentItem) => void;
  onEditEquipment: (item: EquipmentItem) => void;
  onDeleteEquipment: (item: EquipmentItem) => void;
  onAddNewEquipment: () => void;
  onStatusChange: (id: string, newStatus: EquipmentStatus) => void;
  isPlacementMode: boolean;
  activePlacementItemId: string | null;
  fleetSummary: {
    totalCount: number;
    activeCount: number;
    standbyCount: number;
    maintenanceCount: number;
    offCount: number;
    totalOperatingHoursToday: number;
    totalFuelToday: number;
    avgEfficiency: number;
    availabilityRatePct: number;
  };
}

export const EquipmentPropertiesSidebar: React.FC<EquipmentPropertiesSidebarProps> = ({
  isOpen,
  onToggleOpen,
  selectedItem,
  items,
  isDark,
  selectedCategories,
  onToggleCategory,
  onSelectAllCategories,
  onClearCategories,
  onSetCategories,
  statusFilter,
  onSelectStatusFilter,
  searchQuery,
  onSearchChange,
  onSelectEquipment,
  onStartPlacement,
  onEditEquipment,
  onDeleteEquipment,
  onAddNewEquipment,
  onStatusChange,
  isPlacementMode,
  activePlacementItemId,
  fleetSummary
}) => {
  const [activeTab, setActiveTab] = useState<'PROPERTIES' | 'FLEET_LIST' | 'KPIS'>('PROPERTIES');
  const [categorySearch, setCategorySearch] = useState('');

  // کنترل تغییر گروهی فیلترها (Preset Group Toggle)
  const handleToggleGroupPreset = (preset: typeof CATEGORY_GROUP_PRESETS[0]) => {
    const allInPresetSelected = preset.categories.every(cat => selectedCategories.includes(cat));
    
    if (allInPresetSelected) {
      // حذف دسته‌های این گروه از انتخاب‌های جاری
      const next = selectedCategories.filter(cat => !preset.categories.includes(cat));
      if (onSetCategories) {
        onSetCategories(next);
      } else {
        preset.categories.forEach(cat => onToggleCategory(cat));
      }
    } else {
      // افزودن دسته‌های این گروه به انتخاب‌های جاری (Union)
      const next = Array.from(new Set([...selectedCategories, ...preset.categories]));
      if (onSetCategories) {
        onSetCategories(next);
      } else {
        preset.categories.forEach(cat => {
          if (!selectedCategories.includes(cat)) {
            onToggleCategory(cat);
          }
        });
      }
    }
  };

  // فیلتر کردن لیست ماشین‌آلات
  const filteredItems = items.filter(item => {
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

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center justify-start py-4 px-1.5 border-l border-slate-800 bg-[#0B1323] z-20 w-11 h-full shadow-xl flex-shrink-0">
        <button
          onClick={onToggleOpen}
          className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/40 transition-all shadow-md"
          title="باز کردن پنل مشخصات و موقعیت ناوگان"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <div className="mt-10 [writing-mode:vertical-rl] text-[11px] font-black tracking-widest text-slate-400 flex items-center gap-2 opacity-85 hover:opacity-100 cursor-pointer" onClick={onToggleOpen}>
          <span>مشخصات و وضعیت ناوگان</span>
        </div>
      </div>
    );
  }

  return (
    <aside 
      className={`w-72 sm:w-80 flex-shrink-0 flex flex-col h-full border-l z-20 shadow-2xl transition-all duration-200 ${
        isDark ? 'bg-[#0B1323] border-[#1E293B] text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* سربرگ سایدبار با دکمه بستن/جمع شدن */}
      <div className={`p-3 border-b flex items-center justify-between ${
        isDark ? 'border-slate-800 bg-[#080E1B]' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex-shrink-0">
            <IdentificationIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-black text-slate-100 truncate">مشخصات و وضعیت ناوگان</h2>
            <p className="text-[10px] text-slate-400">فعال: {fleetSummary.activeCount} از {fleetSummary.totalCount} دستگاه</p>
          </div>
        </div>

        <button
          onClick={onToggleOpen}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex-shrink-0"
          title="جمع کردن پنل سایدبار"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* زبانه‌های سایدبار */}
      <div className={`grid grid-cols-3 p-1 gap-1 border-b text-[11px] font-bold ${
        isDark ? 'bg-[#0A101D] border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          onClick={() => setActiveTab('PROPERTIES')}
          className={`py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
            activeTab === 'PROPERTIES'
              ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <IdentificationIcon className="w-3 h-3" />
          <span>مشخصات</span>
        </button>

        <button
          onClick={() => setActiveTab('FLEET_LIST')}
          className={`py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
            activeTab === 'FLEET_LIST'
              ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ListBulletIcon className="w-3 h-3" />
          <span>تجهیزات ({filteredItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('KPIS')}
          className={`py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
            activeTab === 'KPIS'
              ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ChartBarIcon className="w-3 h-3" />
          <span>خلاصه وضعیت</span>
        </button>
      </div>

      {/* محتوای زبانه فعال */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {/* ======================================================== */}
        {/* زبانه ۱: مشخصات کامل دستگاه انتخاب شده */}
        {/* ======================================================== */}
        {activeTab === 'PROPERTIES' && (
          <>
            {selectedItem ? (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* کارت هدر دستگاه با وکتور زیبا */}
                <div className={`p-2.5 rounded-2xl border ${
                  isDark ? 'bg-[#0E172A] border-slate-700/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700 shadow-inner flex items-center justify-center flex-shrink-0">
                        <EquipmentVectorIcon category={selectedItem.category} size={24} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-cyan-400">{selectedItem.code}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${
                            STATUS_CONFIG[selectedItem.status].badgeClass
                          }`}>
                            {STATUS_CONFIG[selectedItem.status].labelFa}
                          </span>
                        </div>
                        <h3 className="text-[11px] font-bold text-slate-200 mt-0.5 truncate">{selectedItem.nameFa}</h3>
                        <p className="text-[9px] text-slate-400 truncate">{selectedItem.brand} - {selectedItem.model}</p>
                      </div>
                    </div>
                  </div>

                  {/* دکمه‌های اکشن سریع جانمایی / ویرایش / حذف */}
                  <div className="grid grid-cols-3 gap-1 mt-2.5 pt-2 border-t border-slate-700/50">
                    <button
                      onClick={() => onStartPlacement(selectedItem)}
                      className={`py-1 px-1 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 border transition-all ${
                        isPlacementMode && activePlacementItemId === selectedItem.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm animate-pulse'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30'
                      }`}
                      title="جانمایی مکان این دستگاه روی نقشه معدن"
                    >
                      <CursorArrowRaysIcon className="w-3 h-3" />
                      <span>{isPlacementMode && activePlacementItemId === selectedItem.id ? 'در حال جانمایی' : 'جانمایی'}</span>
                    </button>

                    <button
                      onClick={() => onEditEquipment(selectedItem)}
                      className="py-1 px-1 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      title="ویرایش مشخصات"
                    >
                      <PencilSquareIcon className="w-3 h-3 text-slate-300" />
                      <span>ویرایش</span>
                    </button>

                    <button
                      onClick={() => onDeleteEquipment(selectedItem)}
                      className="py-1 px-1 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                      title="حذف دستگاه"
                    >
                      <TrashIcon className="w-3 h-3" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>

                {/* تغییر وضعیت کاری سریع */}
                <div className={`p-2.5 rounded-2xl border ${
                  isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">وضعیت فعالیت دستگاه:</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(Object.keys(STATUS_CONFIG) as EquipmentStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => onStatusChange(selectedItem.id, st)}
                        className={`py-1 px-1 rounded-lg text-[9px] font-bold border transition-all text-center truncate ${
                          selectedItem.status === st
                            ? STATUS_CONFIG[st].badgeClass + ' ring-1 ring-cyan-400 font-black'
                            : isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {STATUS_CONFIG[st].labelFa}
                      </button>
                    ))}
                  </div>
                </div>

                {/* کارکرد امروز و شاخص‌های روزانه */}
                <div className={`p-2.5 rounded-2xl border ${
                  isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className="text-[11px] font-bold text-cyan-400 mb-2 flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    <span>میزان کارکرد و فعالیت امروز</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className={`p-1.5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <span className="text-[9px] text-slate-400 block">کارکرد از صبح</span>
                      <span className="text-xs font-black text-emerald-400">{selectedItem.dailyStats.operatingHoursToday} ساعت</span>
                    </div>
                    <div className={`p-1.5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <span className="text-[9px] text-slate-400 block">مصرف سوخت</span>
                      <span className="text-xs font-black text-amber-400">{selectedItem.dailyStats.fuelConsumedLitersToday} لیتر</span>
                    </div>
                    <div className={`p-1.5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <span className="text-[9px] text-slate-400 block">راندمان کاری</span>
                      <span className="text-xs font-black text-cyan-400">{selectedItem.dailyStats.efficiencyPct}%</span>
                    </div>
                    <div className={`p-1.5 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <span className="text-[9px] text-slate-400 block">کل ساعت کارکرد</span>
                      <span className="text-xs font-black text-slate-300">{selectedItem.totalEngineHours} h</span>
                    </div>
                  </div>
                </div>

                {/* اطلاعات موقعیت مکانی و زون */}
                <div className={`p-2.5 rounded-2xl border ${
                  isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>موقعیت مکانی روی نقشه</span>
                  </h4>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                      <span className="text-slate-400">بخش / زون:</span>
                      <span className="font-bold text-cyan-300 truncate max-w-[120px]">{selectedItem.position.zoneNameFa}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                      <span className="text-slate-400">تراز پله:</span>
                      <span className="font-mono font-bold text-amber-300">{selectedItem.position.benchLevel} m</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                      <span className="text-slate-400">مختصات:</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {selectedItem.position.x.toFixed(1)}% , {selectedItem.position.y.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">آخرین جانمایی:</span>
                      <span className="text-[10px] text-slate-400">{selectedItem.position.updatedAt}</span>
                    </div>
                  </div>
                </div>

                {/* اطلاعات راننده و اپراتور */}
                <div className={`p-2.5 rounded-2xl border ${
                  isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>راننده و اپراتور</span>
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">نام:</span>
                      <span className="font-bold text-slate-200">{selectedItem.operatorName}</span>
                    </div>
                    {selectedItem.operatorPhone && (
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-400">تماس:</span>
                        <a href={`tel:${selectedItem.operatorPhone}`} className="text-cyan-400 font-mono flex items-center gap-1">
                          <PhoneIcon className="w-2.5 h-2.5" />
                          <span>{selectedItem.operatorPhone}</span>
                        </a>
                      </div>
                    )}
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">پیمانکار:</span>
                      <span className="text-slate-300">{selectedItem.contractor}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-3 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                  <IdentificationIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-300">هیچ ماشینی انتخاب نشده است</h3>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  روی یک ماشین در نقشه یا از زبانه «تجهیزات» کلیک کنید تا مشخصات و وضعیت آن مشاهده شود.
                </p>
              </div>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* زبانه ۲: لیست کامل ناوگان + فیلتر چندگانه (Multi-select) */}
        {/* ======================================================== */}
        {activeTab === 'FLEET_LIST' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* دکمه افزودن دستگاه جدید */}
            <button
              onClick={onAddNewEquipment}
              className="w-full py-2 px-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              <span>افزودن ماشین‌آلات جدید</span>
            </button>

            {/* کادر جستجو */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="جستجوی کد (EX-101)، اپراتور..."
                className={`w-full pr-9 pl-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-cyan-400 ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* فیلتر چندگانه دسته‌بندی‌ها (Multi-Select Filter) */}
            <div className={`p-2.5 rounded-2xl border ${
              isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* سربرگ فیلتر و دکمه‌های کنترل کلی */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FunnelIcon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="text-[11px] font-black text-slate-200 truncate">
                    فیلتر چندگانه انواع ناوگان
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                    selectedCategories.length > 0 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {selectedCategories.length === 0 ? 'همه' : `${selectedCategories.length}/${ALL_EQUIPMENT_CATEGORIES.length}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] flex-shrink-0">
                  <button 
                    onClick={onSelectAllCategories}
                    className="text-cyan-400 hover:underline px-1 font-bold"
                    title="انتخاب همزمان تمام دسته‌ها"
                  >
                    همه
                  </button>
                  <span className="text-slate-600">|</span>
                  <button 
                    onClick={onClearCategories}
                    className="text-rose-400 hover:underline px-1 font-bold"
                    title="لغو انتخاب تمام دسته‌ها"
                  >
                    پاکسازی
                  </button>
                </div>
              </div>

              {/* پیش‌تنظیم‌های دسته‌ای سریع (Quick Group Presets) */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-1.5 border-b border-slate-800/80">
                {CATEGORY_GROUP_PRESETS.map((preset) => {
                  const allSelected = preset.categories.every(cat => selectedCategories.includes(cat));
                  const someSelected = preset.categories.some(cat => selectedCategories.includes(cat));
                  
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleToggleGroupPreset(preset)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap transition-all border flex items-center gap-1 ${
                        allSelected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm font-black'
                          : someSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                      title={`انتخاب / حذف گروه ${preset.labelFa}`}
                    >
                      <span>{preset.labelFa}</span>
                      {allSelected && <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {/* شبکه انتخاب چندگانه تکی ماشین‌آلات (Multi-Select Items Grid) */}
              <div className="grid grid-cols-2 gap-1 max-h-44 overflow-y-auto pr-0.5">
                {ALL_EQUIPMENT_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  const count = items.filter(e => e.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onToggleCategory(cat.id)}
                      className={`text-[10px] font-bold p-1.5 rounded-lg border transition-all flex items-center justify-between gap-1 text-right ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400/80 text-cyan-200 shadow-sm ring-1 ring-cyan-500/30'
                          : isDark 
                            ? 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700' 
                            : 'bg-white border-slate-200 text-slate-600'
                      }`}
                      title={`کلیک برای فعال/غیرفعال کردن فیلتر ${cat.labelFa}`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* آیکون وضعیت چک‌باکس چندگانه */}
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 transition-colors border ${
                          isSelected 
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950' 
                            : 'border-slate-700 bg-slate-800/50'
                        }`}>
                          {isSelected && <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                        
                        <EquipmentVectorIcon category={cat.id} size={14} className="flex-shrink-0" />
                        <span className="truncate text-[10px]">{cat.labelFa}</span>
                      </div>
                      <span className="text-[9px] opacity-75 font-mono px-1 rounded bg-slate-800/60 flex-shrink-0">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* فیلتر وضعیت */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <button
                onClick={() => onSelectStatusFilter('ALL')}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap border ${
                  statusFilter === 'ALL'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200'
                }`}
              >
                همه ({items.length})
              </button>
              <button
                onClick={() => onSelectStatusFilter('ACTIVE')}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap border ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200'
                }`}
              >
                فعال ({fleetSummary.activeCount})
              </button>
              <button
                onClick={() => onSelectStatusFilter('MAINTENANCE')}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap border ${
                  statusFilter === 'MAINTENANCE'
                    ? 'bg-rose-500 text-slate-950 border-rose-400'
                    : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200'
                }`}
              >
                تعمیر ({fleetSummary.maintenanceCount})
              </button>
            </div>

            {/* لیست فشرده ماشین‌آلات با اکشن‌های سریع */}
            <div className="space-y-1.5 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectEquipment(item);
                      setActiveTab('PROPERTIES');
                    }}
                    data-hover-info={JSON.stringify({
                      code: item.code,
                      title: item.nameFa,
                      subtitle: `${item.brand} ${item.model}`,
                      status: STATUS_CONFIG[item.status].labelFa,
                      statusVariant: item.status.toLowerCase(),
                      location: item.position.zoneNameFa,
                      benchLevel: item.position.benchLevel,
                      operator: item.operatorName,
                      category: item.category,
                      stats: [
                        { label: 'کارکرد امروز', value: item.dailyStats.operatingHoursToday, unit: 'h', color: 'emerald' },
                        { label: 'سوخت مصرفی', value: item.dailyStats.fuelConsumedLitersToday, unit: 'L', color: 'amber' },
                        { label: 'راندمان', value: item.dailyStats.efficiencyPct, unit: '%', color: 'cyan' }
                      ]
                    })}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400 shadow-sm'
                        : isDark ? 'bg-[#0E172A] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0">
                        <EquipmentVectorIcon category={item.category} size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-cyan-400">{item.code}</span>
                          <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[item.status].dotClass}`} />
                        </div>
                        <p className="text-[11px] font-bold text-slate-300 truncate">{item.nameFa}</p>
                        <p className="text-[10px] text-slate-500 truncate">تراز {item.position.benchLevel}m • {item.dailyStats.operatingHoursToday}h کارکرد</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onStartPlacement(item)}
                        className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
                        title="جانمایی روی نقشه"
                      >
                        <CursorArrowRaysIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEquipment(item)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                        title="حذف ماشین"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  هیچ ماشینی با این فیلترها یافت نشد.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* زبانه ۳: شاخص‌های کلی و خلاصه عملکرد ناوگان */}
        {/* ======================================================== */}
        {activeTab === 'KPIS' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className="text-xs font-bold text-cyan-400 mb-2">نرخ آماده‌به‌کاری و دسترسی</h4>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black text-emerald-400">{fleetSummary.availabilityRatePct}%</span>
                <span className="text-[11px] text-slate-400">هدف شیفت: بالای ۸۵٪</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all"
                  style={{ width: `${fleetSummary.availabilityRatePct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 block">مجموع کارکرد امروز</span>
                <span className="text-base font-black text-cyan-400">{fleetSummary.totalOperatingHoursToday} ساعت</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 block">کل سوخت مصرفی</span>
                <span className="text-base font-black text-amber-400">{fleetSummary.totalFuelToday} لیتر</span>
              </div>
            </div>

            {/* تفکیک ماشین‌آلات بر اساس زون‌های معدن */}
            <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className="text-xs font-bold text-slate-300 mb-2">توزیع ماشین‌آلات در زون‌های معدن</h4>
              <div className="space-y-1.5 text-xs">
                {MINE_MAP_ZONES.map((zone) => {
                  const count = items.filter(e => e.position.zoneId === zone.id).length;
                  return (
                    <div key={zone.id} className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
                        <span className="text-slate-300 text-[11px]">{zone.nameFa}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-cyan-300">{count} دستگاه</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
