// src/modules/equipment/presentation/components/EquipmentFormModal.tsx

import React, { useState, useEffect } from 'react';
import { 
  EquipmentItem, 
  EquipmentCategory, 
  EquipmentStatus 
} from '../../domain/types/equipment.types';
import { MINE_MAP_ZONES } from '../../services/EquipmentService';
import { ALL_EQUIPMENT_CATEGORIES, STATUS_CONFIG } from './EquipmentPropertiesSidebar';
import { EquipmentVectorIcon } from './EquipmentVectorIcons';
import { 
  XMarkIcon, 
  PlusIcon, 
  PencilSquareIcon,
  CheckIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface EquipmentFormModalProps {
  isOpen: boolean;
  itemToEdit: EquipmentItem | null;
  onClose: () => void;
  onSave: (data: Partial<EquipmentItem> & { code: string; nameFa: string; category: EquipmentCategory }) => void;
  isDark: boolean;
}

export const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave,
  isDark
}) => {
  const isEditing = !!itemToEdit;

  const [code, setCode] = useState('');
  const [nameFa, setNameFa] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('EXCAVATOR');
  const [brand, setBrand] = useState('Komatsu');
  const [model, setModel] = useState('PC1250-8R');
  const [capacityTonOrM3, setCapacityTonOrM3] = useState('6.7 m³');
  const [status, setStatus] = useState<EquipmentStatus>('ACTIVE');
  const [currentActivityFa, setCurrentActivityFa] = useState('در حال بارگیری پیت مرکزی');
  const [operatorName, setOperatorName] = useState('حسین مرادی');
  const [operatorPhone, setOperatorPhone] = useState('۰۹۱۲۳۴۵۶۷۸۹');
  const [contractor, setContractor] = useState('امانی کارفرما');
  const [benchLevel, setBenchLevel] = useState(1220);
  const [zoneId, setZoneId] = useState('pit-central');
  const [totalEngineHours, setTotalEngineHours] = useState(1450);
  const [operatingHoursToday, setOperatingHoursToday] = useState(4.5);
  const [fuelConsumedToday, setFuelConsumedToday] = useState(120);
  const [currentShift, setCurrentShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setCode(itemToEdit.code);
      setNameFa(itemToEdit.nameFa);
      setCategory(itemToEdit.category);
      setBrand(itemToEdit.brand);
      setModel(itemToEdit.model);
      setCapacityTonOrM3(itemToEdit.capacityTonOrM3 || '');
      setStatus(itemToEdit.status);
      setCurrentActivityFa(itemToEdit.currentActivityFa);
      setOperatorName(itemToEdit.operatorName);
      setOperatorPhone(itemToEdit.operatorPhone || '');
      setContractor(itemToEdit.contractor);
      setBenchLevel(itemToEdit.position.benchLevel);
      setZoneId(itemToEdit.position.zoneId);
      setTotalEngineHours(itemToEdit.totalEngineHours);
      setOperatingHoursToday(itemToEdit.dailyStats.operatingHoursToday);
      setFuelConsumedToday(itemToEdit.dailyStats.fuelConsumedLitersToday);
      setCurrentShift(itemToEdit.currentShift);
      setNotes(itemToEdit.notes || '');
    } else {
      // فرم جدید
      const randNum = Math.floor(100 + Math.random() * 900);
      setCode(`EX-${randNum}`);
      setNameFa('بیل مکانیکی جدید');
      setCategory('EXCAVATOR');
      setBrand('Komatsu');
      setModel('PC1250-8R');
      setCapacityTonOrM3('6.7 m³');
      setStatus('ACTIVE');
      setCurrentActivityFa('آماده‌به‌کار در پیت');
      setOperatorName('اپراتور شیفت');
      setOperatorPhone('۰۹۱۲۰۰۰۰۰۰۰');
      setContractor('امانی کارفرما');
      setBenchLevel(1220);
      setZoneId('pit-central');
      setTotalEngineHours(800);
      setOperatingHoursToday(1.0);
      setFuelConsumedToday(35);
      setCurrentShift('MORNING');
      setNotes('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleZoneChange = (zId: string) => {
    setZoneId(zId);
    const matched = MINE_MAP_ZONES.find(z => z.id === zId);
    if (matched) {
      setBenchLevel(matched.benchLevel);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !nameFa.trim()) return;

    const matchedZone = MINE_MAP_ZONES.find(z => z.id === zoneId);

    onSave({
      code: code.trim().toUpperCase(),
      nameFa: nameFa.trim(),
      category,
      brand,
      model,
      capacityTonOrM3,
      status,
      currentActivityFa,
      operatorName,
      operatorPhone,
      contractor,
      totalEngineHours: Number(totalEngineHours),
      currentShift,
      notes,
      position: {
        x: itemToEdit?.position.x ?? 50,
        y: itemToEdit?.position.y ?? 50,
        benchLevel: Number(benchLevel),
        zoneId,
        zoneNameFa: matchedZone ? matchedZone.nameFa : 'پله معدن',
        updatedAt: `1405/06/08 ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
        updatedBy: 'کاربر سیستم'
      },
      dailyStats: {
        shiftStartTime: itemToEdit?.dailyStats.shiftStartTime || '06:00',
        operatingHoursToday: Number(operatingHoursToday),
        idleHoursToday: itemToEdit?.dailyStats.idleHoursToday || 0.2,
        fuelConsumedLitersToday: Number(fuelConsumedToday),
        efficiencyPct: itemToEdit?.dailyStats.efficiencyPct || 88
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-8 ${
        isDark ? 'bg-[#0B1323] border-[#1E293B] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* هدر مودال */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-[#080E1B]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <EquipmentVectorIcon category={category} size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100">
                {isEditing ? `ویرایش مشخصات ماشین‌آلات: ${itemToEdit.code}` : 'افزودن ماشین‌آلات جدید به ناوگان معدن'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEditing ? 'تغییر مشخصات فنی، موقعیت یا اپراتور' : 'مشخصات دستگاه را وارد کرده و در ناوگان ثبت نمایید'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* فرم مشخصات */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* ردیف ۱: نوع ماشین‌آلات (وکتور) و کد منحصر به فرد */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع ماشین‌آلات (دسته‌بندی):</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-cyan-400 ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {ALL_EQUIPMENT_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.labelFa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">کد اختصاصی دستگاه (Unique Code):</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. EX-101, DT-100-02"
                className={`w-full p-2.5 rounded-xl text-xs font-mono font-black uppercase border focus:outline-none focus:border-cyan-400 ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-cyan-400' : 'bg-slate-50 border-slate-300 text-cyan-600'
                }`}
              />
            </div>
          </div>

          {/* ردیف ۲: نام فارسی و مدل */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نام فارسی دستگاه:</label>
              <input
                type="text"
                required
                value={nameFa}
                onChange={(e) => setNameFa(e.target.value)}
                placeholder="e.g. بیل مکانیکی کوماتسو PC1250"
                className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-400 ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">برند و مدل تجاری:</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="برند (Komatsu)"
                  className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-400 ${
                    isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="مدل (PC1250)"
                  className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-400 ${
                    isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ردیف ۳: وضعیت کاری و زون اولیه */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">وضعیت عملیاتی:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-cyan-400 ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {(Object.keys(STATUS_CONFIG) as EquipmentStatus[]).map(st => (
                  <option key={st} value={st}>
                    {STATUS_CONFIG[st].labelFa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">زون / پله استقرار اولیه:</label>
              <select
                value={zoneId}
                onChange={(e) => handleZoneChange(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:border-cyan-400 ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {MINE_MAP_ZONES.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.nameFa} (تراز {z.benchLevel}m)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ردیف ۴: اپراتور و شماره تماس */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نام راننده / اپراتور:</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="نام اپراتور"
                className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-400 ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">شماره تماس اپراتور:</label>
              <input
                type="text"
                value={operatorPhone}
                onChange={(e) => setOperatorPhone(e.target.value)}
                placeholder="۰۹۱۲..."
                className={`w-full p-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* ردیف ۵: کارکرد امروز و مصرف سوخت */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">ساعت کارکرد امروز (ساعت):</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={operatingHoursToday}
                onChange={(e) => setOperatingHoursToday(Number(e.target.value))}
                className={`w-full p-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">سوخت مصرفی امروز (لیتر):</label>
              <input
                type="number"
                step="1"
                min="0"
                value={fuelConsumedToday}
                onChange={(e) => setFuelConsumedToday(Number(e.target.value))}
                className={`w-full p-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">ساعت کل موتور (h):</label>
              <input
                type="number"
                step="10"
                min="0"
                value={totalEngineHours}
                onChange={(e) => setTotalEngineHours(Number(e.target.value))}
                className={`w-full p-2.5 rounded-xl text-xs font-mono border focus:outline-none focus:border-cyan-400 ${
                  isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* ردیف ۶: فعالیت فعلی و یادداشت */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">شرح فعالیت جاری:</label>
            <input
              type="text"
              value={currentActivityFa}
              onChange={(e) => setCurrentActivityFa(e.target.value)}
              placeholder="e.g. بارگیری سنگ‌آهن پرعیار در بلوک SA-04"
              className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-cyan-400 ${
                isDark ? 'bg-[#0E172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* دکمه‌های ثبت */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              انصراف
            </button>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg transition-all"
            >
              <CheckIcon className="w-4 h-4" />
              <span>{isEditing ? 'ذخیره تغییرات' : 'ثبت ماشین‌آلات در سامانه'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
