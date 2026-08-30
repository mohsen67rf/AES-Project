// src/modules/warehouse/presentation/components/WarehouseOverviewTab.tsx

import React from 'react';
import { 
  WarehouseItem, 
  WarehouseTransaction, 
  FuelTank, 
  MagazineSafetyStatus 
} from '../../domain/types/warehouse.types';
import { 
  ArchiveBoxIcon, 
  FireIcon, 
  TruckIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface WarehouseOverviewTabProps {
  items: WarehouseItem[];
  transactions: WarehouseTransaction[];
  fuelTanks: FuelTank[];
  safetyStatus: MagazineSafetyStatus[];
  isDark: boolean;
  onOpenIntakeModal: () => void;
  onGoToCalculator: () => void;
  onOpenRefuelModal: () => void;
}

export const WarehouseOverviewTab: React.FC<WarehouseOverviewTabProps> = ({
  items,
  transactions,
  fuelTanks,
  safetyStatus,
  isDark,
  onOpenIntakeModal,
  onGoToCalculator,
  onOpenRefuelModal
}) => {
  // محاسبات شاخص‌های کلیدی انبار
  const explosives = items.filter(i => i.category === 'EXPLOSIVES');
  const totalAnfoStock = explosives.find(i => i.code === 'EXP-ANFO-01')?.currentStock || 0;
  const totalEmulsionStock = explosives.find(i => i.code === 'EXP-EMUL-BULK')?.currentStock || 0;
  const totalBoosters = (explosives.find(i => i.code === 'EXP-BST-500')?.currentStock || 0) + (explosives.find(i => i.code === 'EXP-BST-400')?.currentStock || 0);
  const totalNonelDetonators = (explosives.find(i => i.code === 'EXP-NONEL-IN')?.currentStock || 0) + (explosives.find(i => i.code === 'EXP-NONEL-SURF-25')?.currentStock || 0);

  const totalFuelLiters = fuelTanks.reduce((acc, t) => acc + t.currentLevelLiters, 0);
  const totalFuelCapacity = fuelTanks.reduce((acc, t) => acc + t.capacityLiters, 0);
  const fuelPct = totalFuelCapacity > 0 ? Math.round((totalFuelLiters / totalFuelCapacity) * 100) : 0;

  const lowStockItems = items.filter(i => i.currentStock <= i.minSafetyStock);

  // ارزش کل موجودی انبار
  const totalInventoryValueToman = items.reduce((acc, item) => acc + (item.currentStock * item.unitCostToman), 0);

  // داده‌های نمودار میله‌ای موجودی ناریه
  const explosiveChartData = [
    { name: 'آنفو صنعتی (kg)', stock: totalAnfoStock, max: 100000, color: '#f59e0b' },
    { name: 'امولسیون فله (kg)', stock: totalEmulsionStock, max: 60000, color: '#ef4444' },
    { name: 'امولایت کارتریج (kg)', stock: explosives.find(i => i.code === 'EXP-EMU-CART')?.currentStock || 0, max: 15000, color: '#ec4899' },
    { name: 'بوستر ۵۰۰g (عدد)', stock: explosives.find(i => i.code === 'EXP-BST-500')?.currentStock || 0, max: 4000, color: '#8b5cf6' },
    { name: 'چاشنی نانل (شاخه)', stock: explosives.find(i => i.code === 'EXP-NONEL-IN')?.currentStock || 0, max: 5000, color: '#06b6d4' },
    { name: 'کورتکس (متر)', stock: explosives.find(i => i.code === 'EXP-CORD-10G')?.currentStock || 0, max: 10000, color: '#10b981' }
  ];

  // آخرین مصارف ثبت شده برای بلوک‌ها
  const recentBlockDispatches = transactions
    .filter(t => t.type === 'CONSUMPTION_BLOCK')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ردیف دکمه‌های اقدام سریع و خلاصه آماری */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl border transition-all duration-300 shadow-sm"
        style={{
          background: isDark ? 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.7))' : 'linear-gradient(135deg, #ffffff, #f8fafc)',
          borderColor: isDark ? 'rgba(51,65,85,0.6)' : 'rgba(226,232,240,0.9)'
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              سامانه آنلاین پایش انبار مواد ناریه و لجستیک سوخت معدن
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            پایش لحظه‌ای موجودی زاغه‌ها، محاسبه خودکار خرج ویژه بلوک‌های معدنی و مدیریت سوخت ناوگان
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenIntakeModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>شارژ انبار ناریه / ورود محموله</span>
          </button>

          <button
            onClick={onGoToCalculator}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 active:scale-95 cursor-pointer"
          >
            <CalculatorIcon className="w-4 h-4" />
            <span>محاسبه مواد مصرفی بلوک معدنی</span>
          </button>

          <button
            onClick={onOpenRefuelModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
          >
            <TruckIcon className="w-4 h-4" />
            <span>ثبت سوخت‌گیری تجهیزات</span>
          </button>
        </div>
      </div>

      {/* کارت‌های شاخص کلیدی (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ۱. موجودی آنفو و امولسیون */}
        <div className={`p-4 rounded-2xl border transition-all duration-200 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">کل مواد منفجره اصلی</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <FireIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {(totalAnfoStock + totalEmulsionStock).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">کیلوگرم (kg)</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>آنفو: {totalAnfoStock.toLocaleString()} kg</span>
            <span>امولسیون: {totalEmulsionStock.toLocaleString()} kg</span>
          </div>
        </div>

        {/* ۲. بوسترها و چاشنی‌ها */}
        <div className={`p-4 rounded-2xl border transition-all duration-200 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">بوستر و سیستم‌های انفجار</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <BoltIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalBoosters.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">بوستر فعال</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>چاشنی نانل: {totalNonelDetonators.toLocaleString()} شاخه</span>
            <span className="text-emerald-500 font-bold">وضعیت: ایمن</span>
          </div>
        </div>

        {/* ۳. سوخت گازوئیل ناوگان */}
        <div className={`p-4 rounded-2xl border transition-all duration-200 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">موجودی گازوئیل معدن</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <TruckIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalFuelLiters.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">لیتر ({fuelPct}٪ مخازن)</span>
          </div>
          {/* پروگرس‌بار سوخت */}
          <div className="mt-2.5 w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${fuelPct > 30 ? 'bg-blue-500' : 'bg-red-500'}`}
              style={{ width: `${fuelPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>ظرفیت کل: {totalFuelCapacity.toLocaleString()} L</span>
            <span>۳ مخزن فعال</span>
          </div>
        </div>

        {/* ۴. ارزش ریالی و ممیزی اقلام */}
        <div className={`p-4 rounded-2xl border transition-all duration-200 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ارزش کل دارایی انبار</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CurrencyDollarIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {(totalInventoryValueToman / 1000000000).toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-500">میلیارد تومان</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
            {lowStockItems.length > 0 ? (
              <span className="text-amber-500 font-bold flex items-center gap-1">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                {lowStockItems.length} قلم در مرز نقطه سفارش
              </span>
            ) : (
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                تأمین ۱۰۰٪ کلیه اقلام
              </span>
            )}
            <span className="text-slate-400">ممیزی امروز</span>
          </div>
        </div>
      </div>

      {/* ردیف نمودار میله‌ای موجودی و پایش زاغه‌های مواد ناریه */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* نمودار موجودی اقلام ناریه */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                سطح موجودی اقلام انفجاری و ناریه (در برابر ظرفیت مجاز زاغه)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                پایش آنلاین ظرفیت ذخیره‌سازی مجاز مطابق استانداردهای وزارت صمت و سازمان ناریه
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              زاغه ۱ و ۲
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={explosiveChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: isDark ? '#f8fafc' : '#0f172a'
                  }}
                  formatter={(value) => [`${Number(value).toLocaleString()}`, 'موجودی فعلی']}
                />
                <Bar dataKey="stock" radius={[6, 6, 0, 0]}>
                  {explosiveChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* کارت پایش سنسورها و استانداردهای ایمنی زاغه‌ها */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                پایش ایمنی و حفاظت فیزیکی زاغه‌ها
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              وضعیت بلادرنگ سنسورهای محیطی و مجوزهای امنیتی انبارهای مهمات
            </p>

            <div className="space-y-3">
              {safetyStatus.map((mag) => (
                <div 
                  key={mag.magazineId}
                  className={`p-3 rounded-xl border ${
                    isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>{mag.nameFa}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px]">
                      فعال و ایمن
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between bg-white/40 dark:bg-slate-900/40 p-1.5 rounded-lg">
                      <span>دما:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{mag.currentTemperatureC}°C</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/40 dark:bg-slate-900/40 p-1.5 rounded-lg">
                      <span>رطوبت:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{mag.currentHumidityPct}٪</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>صاعقه‌گیر و ارت: تأیید</span>
                    <span>{mag.officerInCharge.split('/')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>کد مجوز حمل ناریه:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">MOI-ARM-1405/88</span>
          </div>
        </div>
      </div>

      {/* مخازن سوخت گازوئیل معدن و آخرین مصارف بلوک‌ها */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* مخازن سوخت */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                مخازن ذخیره سوخت گازوئیل
              </h3>
            </div>
            <button 
              onClick={onOpenRefuelModal}
              className="text-xs text-blue-500 hover:text-blue-400 font-bold cursor-pointer"
            >
              + سوخت‌گیری
            </button>
          </div>

          <div className="space-y-3.5">
            {fuelTanks.map((tank) => {
              const pct = Math.round((tank.currentLevelLiters / tank.capacityLiters) * 100);
              return (
                <div key={tank.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{tank.nameFa}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {tank.currentLevelLiters.toLocaleString()} / {tank.capacityLiters.toLocaleString()} L
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 40 ? 'bg-blue-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>مصرف روزانه: ~{tank.dailyConsumptionLiters.toLocaleString()} L</span>
                    <span>{pct}٪ پر است</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* آخرین حواله‌های خروج و آتشباری بلوک‌ها */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArchiveBoxIcon className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                آخرین مصارف مواد ناریه برای بلوک‌های استخراجی
              </h3>
            </div>
            <button 
              onClick={onGoToCalculator}
              className="text-xs text-amber-500 hover:text-amber-400 font-bold cursor-pointer"
            >
              محاسبه بلوک جدید ←
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">بلوک معدنی</th>
                  <th className="py-2.5 px-3 font-semibold">ماده مصرفی</th>
                  <th className="py-2.5 px-3 font-semibold">مقدار کسر شده</th>
                  <th className="py-2.5 px-3 font-semibold">شماره پروانه / صورتجلسه</th>
                  <th className="py-2.5 px-3 font-semibold">تأییدکننده</th>
                  <th className="py-2.5 px-3 font-semibold">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentBlockDispatches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      هنوز حواله مصرفی برای بلوک‌ها ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  recentBlockDispatches.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                        {tx.targetBlockCode || 'بلوک نامشخص'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {tx.itemName}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                        {tx.quantity.toLocaleString()} {tx.unit}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {tx.permitNumber || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                        {tx.authorizedBy}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {new Date(tx.timestamp).toLocaleDateString('fa-IR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
