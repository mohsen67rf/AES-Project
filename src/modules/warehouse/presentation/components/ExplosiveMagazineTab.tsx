// src/modules/warehouse/presentation/components/ExplosiveMagazineTab.tsx

import React, { useState } from 'react';
import { WarehouseItem, MagazineSafetyStatus } from '../../domain/types/warehouse.types';
import { 
  ShieldCheckIcon, 
  FireIcon, 
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface ExplosiveMagazineTabProps {
  items: WarehouseItem[];
  safetyStatus: MagazineSafetyStatus[];
  isDark: boolean;
  onOpenIntakeForItem: (itemId: string) => void;
}

export const ExplosiveMagazineTab: React.FC<ExplosiveMagazineTabProps> = ({
  items,
  safetyStatus,
  isDark,
  onOpenIntakeForItem
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'BULK' | 'INITIATING' | 'DRILL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const explosiveItems = items.filter(i => i.category === 'EXPLOSIVES' || i.category === 'DRILL_CONSUMABLES');

  const filteredItems = explosiveItems.filter(item => {
    const matchesSearch = item.nameFa.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.storageLocation && item.storageLocation.includes(searchTerm));
    
    if (!matchesSearch) return false;

    if (selectedCategory === 'BULK') {
      return item.subCategory?.includes('فله') || item.code.includes('ANFO') || item.code.includes('EMUL');
    }
    if (selectedCategory === 'INITIATING') {
      return item.code.includes('BST') || item.code.includes('NONEL') || item.code.includes('CORD') || item.code.includes('ELEC');
    }
    if (selectedCategory === 'DRILL') {
      return item.category === 'DRILL_CONSUMABLES';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* پایش آنلاین شرایط محیطی زاغه‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safetyStatus.map((mag) => (
          <div
            key={mag.magazineId}
            className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{mag.nameFa}</h3>
                  <span className="text-[11px] text-slate-500">مسئول زاغه: {mag.officerInCharge}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                استاندارد تأیید شده
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">دما محیط</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">{mag.currentTemperatureC}°C</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">رطوبت نسبی</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">{mag.currentHumidityPct}٪</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">صاعقه‌گیر</span>
                <span className="text-xs font-bold text-emerald-500">سالم</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">دزدگیر / حراست</span>
                <span className="text-xs font-bold text-emerald-500">مسلح ۲۴h</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>آخرین بازرسی فیزیکی: {mag.lastSecurityCheck}</span>
              <span className="text-emerald-500 font-bold">بدون کانون حرارتی یا نشتی</span>
            </div>
          </div>
        ))}
      </div>

      {/* فیلترها و جستجوی اقلام زاغه */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              کارتابل موجودی و مشخصات فنی اقلام انفجاری و ادوات حفاری
            </h3>
          </div>

          {/* دسته‌بندی تب‌ها */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedCategory === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500'
              }`}
            >
              همه ({explosiveItems.length})
            </button>
            <button
              onClick={() => setSelectedCategory('BULK')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedCategory === 'BULK' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500'
              }`}
            >
              مواد فله و آنفو
            </button>
            <button
              onClick={() => setSelectedCategory('INITIATING')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedCategory === 'INITIATING' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500'
              }`}
            >
              بوستر و چاشنی‌ها
            </button>
            <button
              onClick={() => setSelectedCategory('DRILL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedCategory === 'DRILL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500'
              }`}
            >
              سرمته و ابزار حفاری
            </button>
          </div>
        </div>

        {/* فیلد جستجو */}
        <div>
          <input
            type="text"
            placeholder="جستجوی نام ماده، کد قلم، شماره پارت، موقعیت قفسه در زاغه..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* جدول جامع اقلام */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-3 font-semibold">کد قلم</th>
                <th className="py-3 px-3 font-semibold">شرح ماده ناریه / کالا</th>
                <th className="py-3 px-3 font-semibold">محل نگهداری در زاغه</th>
                <th className="py-3 px-3 font-semibold">کلاس خطر</th>
                <th className="py-3 px-3 font-semibold">موجودی فعلی</th>
                <th className="py-3 px-3 font-semibold">حداقل ایمنی</th>
                <th className="py-3 px-3 font-semibold">بهای واحد (تومان)</th>
                <th className="py-3 px-3 font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredItems.map((item) => {
                const isLow = item.currentStock <= item.minSafetyStock;
                const fillPct = Math.round((item.currentStock / item.maxCapacity) * 100);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-600 dark:text-slate-400 text-[11px]">
                      {item.code}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.nameFa}</div>
                      <div className="text-[10px] text-slate-400">{item.nameEn}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                      {item.storageLocation}
                    </td>
                    <td className="py-3 px-3">
                      {item.hazardClass ? (
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]">
                          {item.hazardClass}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-black text-slate-900 dark:text-white">
                        {item.currentStock.toLocaleString()} {item.unit}
                      </div>
                      {/* پروگرس موجودی */}
                      <div className="w-24 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, fillPct)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {item.minSafetyStock.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.unitCostToman.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onOpenIntakeForItem(item.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        شارژ انبار
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
