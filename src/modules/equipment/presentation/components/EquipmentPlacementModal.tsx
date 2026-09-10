// src/modules/equipment/presentation/components/EquipmentPlacementModal.tsx

import React, { useState } from 'react';
import { 
  EquipmentItem, 
  EquipmentCategory, 
  EquipmentStatus 
} from '../../domain/types/equipment.types';
import { ALL_EQUIPMENT_CATEGORIES } from './EquipmentPropertiesSidebar';
import { EquipmentVectorIcon } from './EquipmentVectorIcons';
import { 
  XMarkIcon, 
  MapPinIcon, 
  PlusIcon, 
  CheckIcon, 
  TruckIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';

interface EquipmentPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: EquipmentItem[];
  isDark: boolean;
  onConfirmPlacement: (item: EquipmentItem) => void;
  onAddNewAndPlace: (data: Partial<EquipmentItem> & { code: string; nameFa: string; category: EquipmentCategory }) => EquipmentItem;
}

export const EquipmentPlacementModal: React.FC<EquipmentPlacementModalProps> = ({
  isOpen,
  onClose,
  items,
  isDark,
  onConfirmPlacement,
  onAddNewAndPlace
}) => {
  const [activeTab, setActiveTab] = useState<'EXISTING' | 'NEW'>(items.length > 0 ? 'EXISTING' : 'NEW');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(items[0]?.id || null);

  // فیلدهای ماشین جدید
  const [newCategory, setNewCategory] = useState<EquipmentCategory>('EXCAVATOR');
  const [newCode, setNewCode] = useState('');
  const [newNameFa, setNewNameFa] = useState('');
  const [newOperator, setNewOperator] = useState('');
  const [newStatus, setNewStatus] = useState<EquipmentStatus>('ACTIVE');

  if (!isOpen) return null;

  // پیشنهاد خودکار کد ماشین بر اساس دسته انتخابی
  const handleSelectCategory = (cat: EquipmentCategory) => {
    setNewCategory(cat);
    const prefixMap: Record<EquipmentCategory, string> = {
      EXCAVATOR: 'EX',
      DUMP_TRUCK_100T: 'DT-100',
      DUMP_TRUCK_35T: 'DT-35',
      DRILL_RIG: 'DR',
      BULLDOZER: 'DZ',
      LOADER: 'LD',
      MOTOR_GRADER: 'GR',
      WATER_TRUCK: 'WT',
      SERVICE_FUEL_TRUCK: 'FT',
      DIESEL_GENERATOR: 'GN',
      PIT_WATER_PUMP: 'WP',
      LIGHT_VEHICLE: 'LV'
    };
    const prefix = prefixMap[cat] || 'EQ';
    const existingSame = items.filter(e => e.category === cat).length + 1;
    const suggestedCode = `${prefix}-${String(existingSame).padStart(2, '0')}`;
    setNewCode(suggestedCode);

    const catInfo = ALL_EQUIPMENT_CATEGORIES.find(c => c.id === cat);
    if (catInfo) {
      setNewNameFa(`${catInfo.labelFa} ${suggestedCode}`);
    }
  };

  const handleStartPlacement = () => {
    if (activeTab === 'EXISTING') {
      const found = items.find(e => e.id === selectedItemId);
      if (found) {
        onConfirmPlacement(found);
        onClose();
      }
    } else {
      const code = newCode.trim() || `EQ-${Date.now().toString().slice(-4)}`;
      const catInfo = ALL_EQUIPMENT_CATEGORIES.find(c => c.id === newCategory);
      const nameFa = newNameFa.trim() || `${catInfo?.labelFa || 'ماشین‌آلات'} ${code}`;
      
      const created = onAddNewAndPlace({
        code,
        nameFa,
        category: newCategory,
        status: newStatus,
        operatorName: newOperator.trim() || 'اپراتور شیفت',
        model: catInfo?.labelFa || '',
        brand: 'استاندارد معدن',
        capacityTonOrM3: '',
        currentActivityFa: 'آماده‌به‌کار در جبهه کار',
        totalEngineHours: 0
      });

      onConfirmPlacement(created);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div 
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDark ? 'bg-[#0B1323] border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
        }`}
      >
        {/* هدر مودال */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-[#0E172A]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <MapPinIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">جانمایی ماشین‌آلات روی نقشه مرجع</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                نوع یا دستگاه مورد نظر را انتخاب نموده و سپس با کلیک روی نقشه مرجع مستقر کنید.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* زبانه‌های انتخاب */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('EXISTING')}
            disabled={items.length === 0}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'EXISTING'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : items.length === 0
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TruckIcon className="w-4 h-4" />
            <span>انتخاب از ماشین‌آلات ناوگان ({items.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('NEW');
              if (!newCode) handleSelectCategory(newCategory);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'NEW'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusIcon className="w-4 h-4" />
            <span>انتخاب نوع و ایجاد دستگاه جدید</span>
          </button>
        </div>

        {/* محتوای زبانه */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'EXISTING' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                دستگاه مورد نظر جهت جانمایی روی نقشه را انتخاب فرمایید:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400'
                          : isDark
                            ? 'bg-[#0E172A] border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <EquipmentVectorIcon category={item.category} size={24} />
                        <div className="min-w-0">
                          <div className="text-xs font-mono font-black text-cyan-400">{item.code}</div>
                          <div className="text-[11px] font-medium truncate text-slate-300">{item.nameFa}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          item.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.status}
                        </span>
                        {isSelected && (
                          <CheckIcon className="w-4 h-4 text-cyan-400 stroke-[3]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* انتخاب نوع ماشین‌آلات */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  ۱. انتخاب نوع ماشین‌آلات:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {ALL_EQUIPMENT_CATEGORIES.map((cat) => {
                    const isSelected = newCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`p-2 rounded-xl border text-right transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400 font-bold'
                            : isDark
                              ? 'bg-[#0E172A] border-slate-800 text-slate-400 hover:text-slate-200'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <EquipmentVectorIcon category={cat.id} size={20} />
                        <span className="text-[11px] truncate">{cat.labelFa}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* مشخصات اولیه دستگاه */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    کد دستگاه (Code):
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="مثلا EX-101 یا DT-101"
                    className={`w-full text-xs font-mono py-2 px-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    نام کامل یا مدل:
                  </label>
                  <input
                    type="text"
                    value={newNameFa}
                    onChange={(e) => setNewNameFa(e.target.value)}
                    placeholder="مثلا بیل مکانیکی کوماتسو PC1250"
                    className={`w-full text-xs py-2 px-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    نام اپراتور یا راننده:
                  </label>
                  <input
                    type="text"
                    value={newOperator}
                    onChange={(e) => setNewOperator(e.target.value)}
                    placeholder="نام راننده یا مسئول"
                    className={`w-full text-xs py-2 px-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    وضعیت اولیه:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as EquipmentStatus)}
                    className={`w-full text-xs py-2 px-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-cyan-400 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  >
                    <option value="ACTIVE">فعال در جبهه کار (Active)</option>
                    <option value="HAULING">در حال باربری و حمل (Hauling)</option>
                    <option value="STANDBY">آماده‌به‌کار / استندبای (Standby)</option>
                    <option value="MAINTENANCE">تعمیرات و نگهداری (Maintenance)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* پیام راهنما */}
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-2">
            <CursorArrowRaysIcon className="w-5 h-5 flex-shrink-0 text-cyan-400" />
            <span>
              پس از فشردن دکمه زیر، نشانگر روی نقشه فعال می‌شود و می‌توانید با یک کلیک روی جبهه‌کار یا رمپ مورد نظر در نقشه مرجع، ماشین را مستقر فرمایید.
            </span>
          </div>
        </div>

        {/* فوتر مودال */}
        <div className={`p-3.5 border-t flex items-center justify-between gap-3 ${
          isDark ? 'border-slate-800 bg-[#0E172A]' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            انصراف
          </button>

          <button
            onClick={handleStartPlacement}
            className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <CursorArrowRaysIcon className="w-4 h-4 stroke-[2.5]" />
            <span>تأیید و انتخاب نقطه روی نقشه مرجع</span>
          </button>
        </div>
      </div>
    </div>
  );
};
