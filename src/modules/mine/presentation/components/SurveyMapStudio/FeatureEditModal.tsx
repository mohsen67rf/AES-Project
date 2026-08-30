// src/modules/mine/presentation/components/SurveyMapStudio/FeatureEditModal.tsx

import React, { useState } from 'react';
import type { MapFeature } from '../../../../../core/domain/types/survey-map.types';
import type { StakeholderRole } from '../../../../../core/domain/types/mine.types';
import { DESTINATION_LABELS } from '../../../../../core/domain/constants/mine.constants';
import { XMarkIcon, CheckIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

interface FeatureEditModalProps {
  feature: MapFeature;
  mapId: string;
  activeRole: StakeholderRole;
  userName: string;
  onClose: () => void;
  onSave: (updates: Partial<MapFeature>) => void;
}

export function FeatureEditModal({
  feature,
  mapId,
  activeRole,
  userName,
  onClose,
  onSave
}: FeatureEditModalProps) {
  const [name, setName] = useState<string>(feature.name);
  const [code, setCode] = useState<string>(feature.properties?.code || feature.name);
  const [tonnage, setTonnage] = useState<number>(feature.properties?.tonnage || 4000);
  const [feGrade, setFeGrade] = useState<number>(feature.properties?.feGrade || 58.0);
  const [feoGrade, setFeoGrade] = useState<number>(feature.properties?.feoGrade || 20.0);
  const [sio2Grade, setSio2Grade] = useState<number>(feature.properties?.sio2Grade || 6.5);
  const [rockType, setRockType] = useState<string>(feature.properties?.rockType || 'مگنتیت پرعیار');
  const [destination, setDestination] = useState<string>(feature.properties?.destination || 'سنگ‌شکن خط ۱');
  const [notes, setNotes] = useState<string>(feature.properties?.notes || '');
  
  // استایل‌ها
  const [strokeColor, setStrokeColor] = useState<string>(feature.style.strokeColor || '#10B981');
  const [fillColor, setFillColor] = useState<string>(feature.style.fillColor || '#10B981');
  const [fillOpacity, setFillOpacity] = useState<number>(feature.style.fillOpacity ?? 0.35);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      properties: {
        ...feature.properties,
        code,
        tonnage: Number(tonnage),
        feGrade: Number(feGrade),
        feoGrade: Number(feoGrade),
        sio2Grade: Number(sio2Grade),
        rockType,
        destination,
        notes
      },
      style: {
        ...feature.style,
        strokeColor,
        fillColor,
        fillOpacity: Number(fillOpacity)
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 text-right shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        {/* هدر */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <PaintBrushIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-white">ویرایش مشخصات المان نقشه</h3>
              <p className="text-xs text-slate-400">شناسه: {feature.id} | نوع: {feature.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">عنوان / نام المان:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">کد ساب‌بلوک / شناسه:</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {feature.category === 'SUB_BLOCK' && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <h4 className="font-bold text-cyan-400 text-xs">پارامترهای زمین‌شناسی و عیار کانسنگ</h4>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">عیار آهن (% Fe):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={feGrade}
                    onChange={(e) => setFeGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">% FeO:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={feoGrade}
                    onChange={(e) => setFeoGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">% SiO2:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sio2Grade}
                    onChange={(e) => setSio2Grade(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">تناژ برآوردی (تن):</label>
                  <input
                    type="number"
                    value={tonnage}
                    onChange={(e) => setTonnage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">نوع کانسنگ / باطله:</label>
                  <select
                    value={rockType}
                    onChange={(e) => setRockType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="مگنتیت پرعیار">مگنتیت پرعیار (High-Grade)</option>
                    <option value="مگنتیت-هماتیتی">مگنتیت-هماتیتی (Medium-Grade)</option>
                    <option value="کانسنگ کم‌عیار">کانسنگ کم‌عیار سیلیکاته</option>
                    <option value="اسکارن باطله">اسکارن باطله (Waste Skarn)</option>
                    <option value="آبرفت باطله">آبرفت و خاک باطله</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">مقصد تخلیه / بارگیری:</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="سنگ‌شکن خط ۱">سنگ‌شکن خط ۱ (فید مستقیم)</option>
                  <option value="سنگ‌شکن خط ۲">سنگ‌شکن خط ۲</option>
                  <option value="دپوی همگن‌سازی پرعیار">دپوی همگن‌سازی پرعیار (High-Grade)</option>
                  <option value="دپوی متوسط‌عیار پیت">دپوی متوسط‌عیار پیت</option>
                  <option value="دپوی کم‌عیار باطله">دپوی کم‌عیار</option>
                  <option value="دامپ باطله غربی">دامپ باطله غربی</option>
                </select>
              </div>
            </div>
          )}

          {/* استایل و رنگ‌آمیزی المان در نقشه */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="font-bold text-purple-400 text-xs">رنگ و نحوه نمایش در نقشه</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">رنگ خط مرزی:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-[11px]">{strokeColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">رنگ پس‌زمینه:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-[11px]">{fillColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">شفافیت پر کردن:</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={fillOpacity}
                  onChange={(e) => setFillOpacity(Number(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">یادداشت فنی / توضیحات:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
              placeholder="توضیحات تکمیلی..."
            />
          </div>

          {/* دکمه‌ها */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <CheckIcon className="w-4 h-4" />
              <span>ذخیره تغییرات در نقشه</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
