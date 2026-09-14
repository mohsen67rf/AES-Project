// src/modules/mine/presentation/components/LifecycleModals/ClassificationModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TagIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { SubBlock } from '../../../../../core/domain/types/mine.types';
import { SubBlockLifecycleService } from '../../../services/SubBlockLifecycleService';
import { BlockCodeDisplay } from '../../../../../shared/components/BlockCodeDisplay';

interface ClassificationModalProps {
  subBlock: SubBlock;
  onClose: () => void;
  onSuccess: (updatedSubBlock: SubBlock) => void;
}

export function ClassificationModal({ subBlock, onClose, onSuccess }: ClassificationModalProps) {
  const fe = subBlock.labResults?.fe ?? 50;
  const p = subBlock.labResults?.p ?? 0;
  const s = subBlock.labResults?.s ?? 0;
  const sio2 = subBlock.labResults?.sio2 ?? 0;

  const [rockType, setRockType] = useState('مگنتیت - هماتیت متراکم');
  const [oreType, setOreType] = useState('سنگ‌آهن کانسار اصلی');
  const [isWaste, setIsWaste] = useState(fe < 35);
  const [wasteType, setWasteType] = useState<'سنگی' | 'آبرفتی' | 'خاک رویه' | 'شیل'>('سنگی');
  const [notes, setNotes] = useState('');
  const [classifierName, setClassifierName] = useState('واحد زمین‌شناسی و متالورژی');
  const [loading, setLoading] = useState(false);

  // تخمین خودکار کلاس بر اساس Cutoff
  const gradeCategory = isWaste || fe < 35 ? 'WASTE' : fe < 48 ? 'LOW' : fe < 58 ? 'MEDIUM' : 'HIGH';
  const categoryLabel = 
    gradeCategory === 'HIGH' ? 'پرعیار مستقیم (High Grade DSO - Fe ≥ 58%)' :
    gradeCategory === 'MEDIUM' ? 'متوسط‌عیار (Medium Grade - 48% ≤ Fe < 58%)' :
    gradeCategory === 'LOW' ? 'کم‌عیار (Low Grade - 35% ≤ Fe < 48%)' :
    'باطله معدنی (Waste Material - Fe < 35%)';

  const categoryColor =
    gradeCategory === 'HIGH' ? 'text-green-400 bg-green-500/10 border-green-500/30' :
    gradeCategory === 'MEDIUM' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' :
    gradeCategory === 'LOW' ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' :
    'text-red-400 bg-red-500/10 border-red-500/30';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = SubBlockLifecycleService.autoClassifySubBlock(
        subBlock.id,
        classifierName,
        {
          rockType,
          oreType,
          isWaste,
          wasteType: isWaste ? wasteType : undefined,
          notes,
        }
      );

      if (updated) {
        onSuccess(updated);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-[#0D1B2E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-right my-8"
        >
          {/* هدر */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <TagIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">طبقه‌بندی ژئومتالورژی کانسار</h3>
                <div className="text-xs text-[#8A9DB0] flex items-center gap-1.5 mt-0.5">
                  <span>ساب‌بلوک:</span>
                  <BlockCodeDisplay code={subBlock.code} className="text-[#00D4FF] font-bold" />
                  <span>| عیار:</span>
                  <span className="font-mono text-white font-bold">{fe.toFixed(2)}% Fe</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A9DB0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* فرم */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* کارت نتیجه هوشمند */}
            <div className={`p-4 rounded-xl border ${categoryColor}`}>
              <div className="flex items-center gap-2 mb-1">
                <SparklesIcon className="w-5 h-5" />
                <span className="font-bold text-sm">پیشنهاد موتور طبقه‌بندی هوشمند کانسار:</span>
              </div>
              <p className="text-xs font-semibold">{categoryLabel}</p>
              
              {/* هشدار ناخالصی‌ها */}
              {(p > 0.15 || s > 0.20 || sio2 > 10) && (
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-start gap-1.5 text-yellow-300 text-xs">
                  <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    {p > 0.15 && <span>• فسفر بیش از حد مجاز (P={p}%) </span>}
                    {s > 0.20 && <span>• گوگرد نامطلوب (S={s}%) </span>}
                    {sio2 > 10 && <span>• سیلیس بالا (SiO2={sio2}%) </span>}
                  </div>
                </div>
              )}
            </div>

            {/* سوییچ باطله / ماده معدنی */}
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
              <input
                type="checkbox"
                id="isWasteCheck"
                checked={isWaste}
                onChange={(e) => setIsWaste(e.target.checked)}
                className="w-4 h-4 rounded text-red-500 focus:ring-red-400 bg-white/10 border-white/20"
              />
              <label htmlFor="isWasteCheck" className="text-xs text-white cursor-pointer font-medium">
                علامت‌گذاری به عنوان باطله غیرقابل استفاده در خطوط خردایش (Waste Dump)
              </label>
            </div>

            {isWaste && (
              <div>
                <label className="block text-xs text-[#8A9DB0] mb-1">نوع باطله</label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0A1628] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                >
                  <option value="سنگی">باطله سنگی (Rock Waste)</option>
                  <option value="آبرفتی">باطله آبرفتی و خاک رویه (Alluvial / Overburden)</option>
                  <option value="شیل">شیل و زون‌های دگرسان (Shale / Altered)</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8A9DB0] mb-1">نوع سنگ میزبان (Lithology)</label>
                <input
                  type="text"
                  value={rockType}
                  onChange={(e) => setRockType(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8A9DB0] mb-1">تیپ کانه (Mineralogy)</label>
                <input
                  type="text"
                  value={oreType}
                  onChange={(e) => setOreType(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#8A9DB0] mb-1">مسئول تأیید طبقه‌بندی</label>
              <input
                type="text"
                value={classifierName}
                onChange={(e) => setClassifierName(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-[#8A9DB0] mb-1">یادداشت فنی و متالورژیکی</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="توضیحات اضافه در خصوص اختلاط یا ملاحظات فرآوری..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
              />
            </div>

            {/* دکمه‌ها */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-[#8A9DB0] hover:text-white transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'در حال ثبت...' : 'تأیید طبقه‌بندی ژئومتالورژی'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
