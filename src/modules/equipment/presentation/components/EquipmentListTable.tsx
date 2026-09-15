// src/modules/equipment/presentation/components/EquipmentListTable.tsx

import React, { useState } from 'react';
import { 
  EquipmentItem, 
  EquipmentCategory, 
  EquipmentStatus 
} from '../../domain/types/equipment.types';
import { EquipmentVectorIcon } from './EquipmentVectorIcons';
import { ALL_EQUIPMENT_CATEGORIES, STATUS_CONFIG } from './EquipmentPropertiesSidebar';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ClockIcon, 
  FireIcon, 
  PencilSquareIcon,
  WrenchScrewdriverIcon,
  FunnelIcon,
  TableCellsIcon,
  Squares2X2Icon,
  TrashIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';

interface EquipmentListTableProps {
  items: EquipmentItem[];
  onSelectEquipment: (item: EquipmentItem) => void;
  onEditEquipment: (item: EquipmentItem) => void;
  onDeleteEquipment?: (item: EquipmentItem) => void;
  onLocateOnMap: (item: EquipmentItem) => void;
  onStartPlacement: (item: EquipmentItem) => void;
  isDark: boolean;
  selectedCategories?: EquipmentCategory[];
  onToggleCategory?: (cat: EquipmentCategory) => void;
  statusFilter: EquipmentStatus | 'ALL';
  onSelectStatusFilter: (st: EquipmentStatus | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const EquipmentListTable: React.FC<EquipmentListTableProps> = ({
  items,
  onSelectEquipment,
  onEditEquipment,
  onDeleteEquipment,
  onLocateOnMap,
  onStartPlacement,
  isDark,
  selectedCategories = [],
  onToggleCategory,
  statusFilter,
  onSelectStatusFilter,
  searchQuery,
  onSearchChange
}) => {
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // فیلتر کردن آیتم‌ها
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

  return (
    <div className="space-y-4">
      {/* نوار جستجو و سوئیچ نمایش */}
      <div className={`p-4 rounded-3xl border shadow-sm ${
        isDark ? 'bg-[#0B1222] border-[#1B273D]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجو بر اساس کد ماشین (EX-101)، اپراتور، زون..."
              className={`w-full pr-10 pl-4 py-2 rounded-2xl border text-xs font-medium focus:outline-none focus:border-cyan-400 ${
                isDark 
                  ? 'bg-[#111A2E] border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 p-1 rounded-2xl border text-xs font-bold ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'GRID' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="نمایش کارت‌های شبکه‌ای"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'TABLE' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="نمایش جدولی"
              >
                <TableCellsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* نمایش کارتی یا جدولی */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item, idx) => (
            <div
              key={`equip-card-${item.id}-${idx}`}
              onClick={() => onSelectEquipment(item)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg ${
                isDark ? 'bg-[#0B1323] border-[#1E293B] hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-cyan-400'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center">
                      <EquipmentVectorIcon category={item.category} size={26} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-cyan-400 font-mono">{item.code}</span>
                        <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[item.status].dotClass}`} />
                      </div>
                      <h4 className="text-xs font-bold text-slate-200">{item.nameFa}</h4>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${STATUS_CONFIG[item.status].badgeClass}`}>
                    {STATUS_CONFIG[item.status].labelFa}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 my-3">
                  <div className="flex justify-between">
                    <span>موقعیت:</span>
                    <span className="font-bold text-slate-200">{item.position.zoneNameFa} ({item.position.benchLevel}m)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>کارکرد امروز:</span>
                    <span className="font-bold text-emerald-400">{item.dailyStats.operatingHoursToday} ساعت</span>
                  </div>
                  <div className="flex justify-between">
                    <span>اپراتور:</span>
                    <span className="text-slate-300">{item.operatorName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartPlacement(item);
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center gap-1 border border-cyan-500/30"
                >
                  <CursorArrowRaysIcon className="w-3.5 h-3.5" />
                  <span>جانمایی</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEquipment(item);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="ویرایش"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
                {onDeleteEquipment && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEquipment(item);
                    }}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    title="حذف"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`rounded-3xl border overflow-hidden ${
          isDark ? 'bg-[#0B1323] border-[#1E293B]' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className={`border-b ${isDark ? 'bg-[#080E1B] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="p-3">کد و نوع دستگاه</th>
                  <th className="p-3">نام و مدل</th>
                  <th className="p-3">وضعیت</th>
                  <th className="p-3">زون و تراز پله</th>
                  <th className="p-3">کارکرد امروز</th>
                  <th className="p-3">اپراتور</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredItems.map((item, idx) => (
                  <tr key={`equip-row-${item.id}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2 font-mono font-black text-cyan-400">
                        <EquipmentVectorIcon category={item.category} size={18} />
                        <span>{item.code}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-200">{item.nameFa}</div>
                      <div className="text-[10px] text-slate-500">{item.brand} {item.model}</div>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${STATUS_CONFIG[item.status].badgeClass}`}>
                        {STATUS_CONFIG[item.status].labelFa}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-300 font-bold">{item.position.zoneNameFa}</span>
                      <span className="text-amber-400 font-mono mr-1">({item.position.benchLevel}m)</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-emerald-400">{item.dailyStats.operatingHoursToday} ساعت</span>
                    </td>
                    <td className="p-3 text-slate-300">{item.operatorName}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onStartPlacement(item)}
                          className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          title="جانمایی"
                        >
                          <CursorArrowRaysIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditEquipment(item)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                          title="ویرایش"
                        >
                          <PencilSquareIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
