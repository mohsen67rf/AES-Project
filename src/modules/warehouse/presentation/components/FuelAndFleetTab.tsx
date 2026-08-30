// src/modules/warehouse/presentation/components/FuelAndFleetTab.tsx

import React, { useState } from 'react';
import { FuelTank, EquipmentRefuelingLog } from '../../domain/types/warehouse.types';
import { 
  TruckIcon, 
  PlusCircleIcon, 
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface FuelAndFleetTabProps {
  fuelTanks: FuelTank[];
  refuelingLogs: EquipmentRefuelingLog[];
  isDark: boolean;
  onSaveRefuelLog: (log: Omit<EquipmentRefuelingLog, 'id' | 'timestamp'>) => void;
}

const FLEET_EQUIPMENT_LIST = [
  { code: 'TRUCK-01 (کوماتسو HD785-7)', type: 'DUMP_TRUCK' as const, standardConsumpLph: 55 },
  { code: 'TRUCK-02 (کوماتسو HD785-7)', type: 'DUMP_TRUCK' as const, standardConsumpLph: 55 },
  { code: 'TRUCK-03 (کاترپیلار 777D)', type: 'DUMP_TRUCK' as const, standardConsumpLph: 60 },
  { code: 'SHOVEL-01 (هیتاچی EX1200)', type: 'SHOVEL' as const, standardConsumpLph: 90 },
  { code: 'SHOVEL-02 (کوماتسو PC1250)', type: 'SHOVEL' as const, standardConsumpLph: 85 },
  { code: 'LOADER-01 (کوماتسو WA600)', type: 'LOADER' as const, standardConsumpLph: 45 },
  { code: 'DRILL-01 (سندیک DI550)', type: 'DRILL_RIG' as const, standardConsumpLph: 38 },
  { code: 'DOZER-01 (کاترپیلار D8R)', type: 'DOZER' as const, standardConsumpLph: 40 },
  { code: 'WATER-01 (تانکر آبپاش بنز)', type: 'WATER_TRUCK' as const, standardConsumpLph: 25 },
];

export const FuelAndFleetTab: React.FC<FuelAndFleetTabProps> = ({
  fuelTanks,
  refuelingLogs,
  isDark,
  onSaveRefuelLog
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState(FLEET_EQUIPMENT_LIST[0].code);
  const [litersFilled, setLitersFilled] = useState<number>(450);
  const [hourMeter, setHourMeter] = useState<number>(5200);
  const [selectedTankId, setSelectedTankId] = useState(fuelTanks[0]?.id || 'tank-main-1');
  const [operatorName, setOperatorName] = useState('علی رضایی (راننده)');
  const [driverName] = useState('مرتضی کریمی (تانکربان)');
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmitRefuel = (e: React.FormEvent) => {
    e.preventDefault();
    const equip = FLEET_EQUIPMENT_LIST.find(e => e.code === selectedEquipment) || FLEET_EQUIPMENT_LIST[0];

    onSaveRefuelLog({
      equipmentCode: equip.code,
      equipmentType: equip.type,
      litersFilled: Number(litersFilled),
      currentHourMeter: Number(hourMeter),
      fuelTankId: selectedTankId,
      operatorName,
      driverName,
      shift,
      consumptionPerOperatingHour: equip.standardConsumpLph
    });

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ردیف کارت مخازن سوخت گازوئیل */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fuelTanks.map((tank) => {
          const fillPct = Math.round((tank.currentLevelLiters / tank.capacityLiters) * 100);
          const isLow = tank.currentLevelLiters <= tank.minWarningLiters;

          return (
            <div
              key={tank.id}
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{tank.nameFa}</h3>
                  <span className="text-[11px] font-mono text-slate-400">{tank.tankCode}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isLow ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {fillPct}٪ پر
                </span>
              </div>

              {/* نمایشگر گرافیکی سطح مخزن */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {tank.currentLevelLiters.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-500">از {tank.capacityLiters.toLocaleString()} لیتر</span>
              </div>

              <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    fillPct > 40 ? 'bg-blue-500' : fillPct > 20 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${fillPct}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <div>دمای سوخت: <span className="font-bold text-slate-700 dark:text-slate-300">{tank.temperatureCelsius}°C</span></div>
                <div>مصرف روزانه: <span className="font-bold text-slate-700 dark:text-slate-300">~{tank.dailyConsumptionLiters.toLocaleString()} L</span></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* فرم ثبت سوخت‌گیری ناوگان (۴ ستون) */}
        <div className={`lg:col-span-4 p-5 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
            <PlusCircleIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              ثبت سوخت‌گیری ماشین‌آلات معدن
            </h3>
          </div>

          {showSuccessToast && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span>سوخت‌گیری با موفقیت ثبت و از مخزن کسر گردید.</span>
            </div>
          )}

          <form onSubmit={handleSubmitRefuel} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">دستگاه / ماشین معدنی:</label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
              >
                {FLEET_EQUIPMENT_LIST.map(eq => (
                  <option key={eq.code} value={eq.code}>{eq.code}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">حجم گازوئیل (لیتر):</label>
                <input
                  type="number"
                  min="10"
                  max="3000"
                  value={litersFilled}
                  onChange={(e) => setLitersFilled(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">ساعت‌کارکرد (Hour):</label>
                <input
                  type="number"
                  value={hourMeter}
                  onChange={(e) => setHourMeter(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">مخزن مبدا سوخت‌گیری:</label>
              <select
                value={selectedTankId}
                onChange={(e) => setSelectedTankId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                {fuelTanks.map(t => (
                  <option key={t.id} value={t.id}>{t.nameFa} (موجودی: {t.currentLevelLiters.toLocaleString()} L)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">راننده / اپراتور:</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">شیفت کاری:</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as 'MORNING' | 'EVENING' | 'NIGHT')}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="MORNING">شیفت صبح (۰۶:۰۰ الی ۱۴:۰۰)</option>
                  <option value="EVENING">شیفت عصر (۱۴:۰۰ الی ۲۲:۰۰)</option>
                  <option value="NIGHT">شیفت شب (۲۲:۰۰ الی ۰۶:۰۰)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/25 active:scale-95 cursor-pointer mt-2"
            >
              ثبت سوخت‌گیری و کسر از مخزن
            </button>
          </form>
        </div>

        {/* جدول لاگ سوخت‌گیری‌های اخیر ناوگان (۸ ستون) */}
        <div className={`lg:col-span-8 p-5 rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                تاریخچه سوخت‌گیری و پایش مصرف ویژه ناوگان معدن
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {refuelingLogs.length} تراکنش ثبت شده
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">کد ماشین</th>
                  <th className="py-2.5 px-3 font-semibold">مقدار (لیتر)</th>
                  <th className="py-2.5 px-3 font-semibold">ساعت‌کارکرد</th>
                  <th className="py-2.5 px-3 font-semibold">راننده / اپراتور</th>
                  <th className="py-2.5 px-3 font-semibold">شیفت</th>
                  <th className="py-2.5 px-3 font-semibold">تاریخ و زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {refuelingLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {log.equipmentCode}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {log.litersFilled.toLocaleString()} L
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {log.currentHourMeter.toLocaleString()} h
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 text-[11px]">
                      {log.operatorName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                        {log.shift === 'MORNING' ? 'صبح' : log.shift === 'EVENING' ? 'عصر' : 'شب'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })} - {new Date(log.timestamp).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
