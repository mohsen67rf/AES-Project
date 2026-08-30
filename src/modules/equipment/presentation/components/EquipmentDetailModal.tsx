// src/modules/equipment/presentation/components/EquipmentDetailModal.tsx

import React, { useState } from 'react';
import { EquipmentItem, EquipmentStatus } from '../../domain/types/equipment.types';
import { MINE_MAP_ZONES } from '../../services/EquipmentService';
import { 
  XMarkIcon, 
  ClockIcon, 
  WrenchScrewdriverIcon, 
  MapPinIcon, 
  UserIcon, 
  CheckCircleIcon,
  FireIcon,
  ShieldCheckIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface EquipmentDetailModalProps {
  isOpen: boolean;
  item: EquipmentItem | null;
  onClose: () => void;
  onSave: (updated: EquipmentItem) => void;
  isDark: boolean;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  isDark
}) => {
  if (!isOpen || !item) return null;

  const [status, setStatus] = useState<EquipmentStatus>(item.status);
  const [operatorName, setOperatorName] = useState(item.operatorName);
  const [operatorPhone, setOperatorPhone] = useState(item.operatorPhone || '');
  const [currentActivityFa, setCurrentActivityFa] = useState(item.currentActivityFa);
  const [benchLevel, setBenchLevel] = useState(item.position.benchLevel);
  const [zoneId, setZoneId] = useState(item.position.zoneId);
  const [operatingHoursToday, setOperatingHoursToday] = useState(item.dailyStats.operatingHoursToday);
  const [fuelConsumedToday, setFuelConsumedToday] = useState(item.dailyStats.fuelConsumedLitersToday);
  const [shift, setShift] = useState(item.currentShift);
  const [notes, setNotes] = useState(item.notes || '');

  const handleZoneChange = (zId: string) => {
    setZoneId(zId);
    const matched = MINE_MAP_ZONES.find(z => z.id === zId);
    if (matched) {
      setBenchLevel(matched.benchLevel);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedZone = MINE_MAP_ZONES.find(z => z.id === zoneId);

    const updated: EquipmentItem = {
      ...item,
      status,
      operatorName,
      operatorPhone,
      currentActivityFa,
      currentShift: shift,
      notes,
      position: {
        ...item.position,
        benchLevel,
        zoneId,
        zoneNameFa: matchedZone ? matchedZone.nameFa : item.position.zoneNameFa,
        updatedAt: '1405/06/08 ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        updatedBy: 'سرپرست ماشین‌آلات'
      },
      dailyStats: {
        ...item.dailyStats,
        operatingHoursToday: Number(operatingHoursToday),
        fuelConsumedLitersToday: Number(fuelConsumedToday)
      }
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isDark ? 'bg-[#0D1527] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* هدر مودال */}
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 to-slate-900/40">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-indigo-500/20 border border-indigo-500/30">
              {item.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-cyan-400">{item.code}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {item.model}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-200">{item.nameFa}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* بدنه فرم ویرایش مشخصات */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* کارت برجسته کارکرد از ابتدای روز */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-500/30 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 mb-1">
                <ClockIcon className="w-4 h-4" />
                <span>کارکرد امروز (ساعت):</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={operatingHoursToday}
                onChange={(e) => setOperatingHoursToday(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-emerald-400 font-black text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1 mb-1">
                <FireIcon className="w-4 h-4 text-amber-400" />
                <span>مصرف گازوئیل امروز (L):</span>
              </label>
              <input
                type="number"
                value={fuelConsumedToday}
                onChange={(e) => setFuelConsumedToday(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-amber-400 font-black text-sm"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[11px] font-bold text-slate-300 mb-1 block">کنتور کل موتور:</label>
              <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 font-bold text-slate-200 text-sm">
                {item.totalEngineHours.toLocaleString('fa-IR')} ساعت
              </div>
            </div>
          </div>

          {/* وضعیت عملیاتی و شیفت */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">وضعیت عملیاتی ماشین:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-bold text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ACTIVE">🟢 فعال / در حال کار (Active)</option>
                <option value="HAULING">🔵 در حال تردد و حمل بار (Hauling)</option>
                <option value="STANDBY">🟡 آماده‌به‌کار / منتظر (Standby)</option>
                <option value="REFUELING">🟣 در حال سوخت‌گیری (Refueling)</option>
                <option value="MAINTENANCE">🔴 در حال تعمیرات و سرویس (Maintenance)</option>
                <option value="OFF">⚪ خاموش / پایان شیفت (Off)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">شیفت کاری فعال:</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as 'MORNING' | 'EVENING' | 'NIGHT')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-bold text-xs"
              >
                <option value="MORNING">شیفت صبح (۰۶:۰۰ الی ۱۴:۰۰)</option>
                <option value="EVENING">شیفت عصر (۱۴:۰۰ الی ۲۲:۰۰)</option>
                <option value="NIGHT">شیفت شب (۲۲:۰۰ الی ۰۶:۰۰)</option>
              </select>
            </div>
          </div>

          {/* موقعیت مکانی و زون */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <MapPinIcon className="w-4 h-4 text-cyan-400" />
                <span>زون و بخش عملیاتی معدن:</span>
              </label>
              <select
                value={zoneId}
                onChange={(e) => handleZoneChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-bold text-xs"
              >
                {MINE_MAP_ZONES.map(z => (
                  <option key={z.id} value={z.id}>{z.nameFa}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">تراز پله استخراجی (متر):</label>
              <input
                type="number"
                value={benchLevel}
                onChange={(e) => setBenchLevel(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-bold text-xs"
              />
            </div>
          </div>

          {/* شرح فعالیت جاری */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">شرح فعالیت جاری در شیفت:</label>
            <input
              type="text"
              value={currentActivityFa}
              onChange={(e) => setCurrentActivityFa(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-medium"
            />
          </div>

          {/* اپراتور و شماره تماس */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <span>نام اپراتور / راننده شیفت:</span>
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <PhoneIcon className="w-4 h-4 text-emerald-400" />
                <span>شماره تماس بی‌سیم یا موبایل:</span>
              </label>
              <input
                type="text"
                value={operatorPhone}
                onChange={(e) => setOperatorPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs"
              />
            </div>
          </div>

          {/* یادداشت‌های فنی و بازرسی */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">یادداشت فنی / وضعیت سرویس دوره‌ای:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="توضیحات تکمیلی پیرامون وضعیت سلامت دستگاه یا تعمیرات لازم..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs"
            />
          </div>

          {/* دکمه‌های اقدام */}
          <div className="pt-3 border-t border-slate-700/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>ذخیره تغییرات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
