// src/modules/mine/presentation/components/LifecycleModals/DestinationModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { SubBlock, DestinationType } from '../../../../../core/domain/types/mine.types';
import { DESTINATION_LABELS } from '../../../../../core/domain/constants/mine.constants';
import { SubBlockLifecycleService } from '../../../services/SubBlockLifecycleService';

interface DestinationModalProps {
  subBlock: SubBlock;
  onClose: () => void;
  onSuccess: (updatedSubBlock: SubBlock) => void;
}

export function DestinationModal({ subBlock, onClose, onSuccess }: DestinationModalProps) {
  const fe = subBlock.labResults?.fe ?? 52;
  const isWaste = subBlock.isWaste || subBlock.gradeCategory === 'WASTE' || fe < 35;
  const isHigh = !isWaste && (subBlock.gradeCategory === 'HIGH' || fe >= 58);
  const isMedium = !isWaste && !isHigh && (subBlock.gradeCategory === 'MEDIUM' || fe >= 48);

  // پیشنهاد پیش‌فرض بر اساس طبقه‌بندی
  const defaultDest: DestinationType = isWaste
    ? (subBlock.wasteType === 'آبرفتی' ? 'WASTE_DUMP_ALLUVIAL' : 'WASTE_DUMP_ROCK')
    : isHigh
    ? 'CRUSHER_LINE_1'
    : isMedium
    ? 'CRUSHER_LINE_2'
    : 'LOW_GRADE_STOCKPILE';

  const [destination, setDestination] = useState<DestinationType>(defaultDest);
  const [destinationReason, setDestinationReason] = useState(
    isWaste
      ? 'انتقال باطله معدنی به دامپ مجاز جهت بازگشایی جبهه‌کار'
      : isHigh
      ? 'سنگ پرعیار با رطوبت و ناخالصی مجاز - انتقال مستقیم به خوراک خط ۱ سنگ‌شکن'
      : isMedium
      ? 'سنگ متوسط‌عیار - مناسب جهت خوراک خط ۲ یا اختلاط همگن‌سازی'
      : 'سنگ کم‌عیار - انتقال به دپوی کم‌عیار جهت فرآوری و پرعیارسازی آتی'
  );
  const [approvedBy, setApprovedBy] = useState('سرپرست فنی معدن و فرآوری');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = SubBlockLifecycleService.assignDestination(subBlock.id, {
        destination,
        destinationReason,
        destinationApprovedBy: approvedBy,
        changedBy: approvedBy,
      });

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
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <TruckIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">تعیین مقصد و برنامه دیسپاچینگ</h3>
                <p className="text-xs text-[#8A9DB0]">
                  ساب‌بلوک: <span className="font-mono text-[#00D4FF] font-bold">{subBlock.code}</span>
                  {' '}| عیار: <span className="font-mono text-white font-bold">{fe.toFixed(2)}% Fe</span>
                  {' '}| تناژ: <span className="font-mono text-white font-bold">{subBlock.tonnage?.toLocaleString() || subBlock.estimatedTonnage?.toLocaleString() || '-'} تن</span>
                </p>
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
            <div>
              <label className="block text-xs font-semibold text-[#8A9DB0] mb-2">انتخاب مقصد هدف</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value as DestinationType)}
                className="w-full px-3 py-2.5 bg-[#0A1628] border border-cyan-500/40 rounded-xl text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <optgroup label="🏭 خطوط خردایش و فرآوری مستقیم">
                  <option value="CRUSHER_LINE_1">خوراک خط ۱ خردایش (سنگ‌شکن فکی اولیه)</option>
                  <option value="CRUSHER_LINE_2">خوراک خط ۲ خردایش (سنگ‌شکن هیدروکن ثانویه)</option>
                  <option value="CRUSHER_FEED">خوراک مستقیم مدار خردایش مجتمع</option>
                  <option value="BENEFICIATION_PLANT">کارخانه پرعیارسازی مغناطیسی</option>
                </optgroup>
                <optgroup label="📦 دپوهای ذخیره و همگن‌سازی">
                  <option value="HIGH_GRADE_STOCKPILE">دپوی سنگ پرعیار (High Grade DSO)</option>
                  <option value="MEDIUM_GRADE_STOCKPILE">دپوی سنگ عیار متوسط (Medium Grade)</option>
                  <option value="LOW_GRADE_STOCKPILE">دپوی سنگ کم‌عیار (Low Grade)</option>
                  <option value="BLEND_STOCKPILE">دپوی اختلاط و همگن‌سازی (Blending)</option>
                  <option value="TEMPORARY_STOCKPILE">دپوی موقت جبهه‌کار</option>
                </optgroup>
                <optgroup label="⛰️ دامپ‌های باطله">
                  <option value="WASTE_DUMP_ROCK">دامپ باطله سنگی (Rock Waste)</option>
                  <option value="WASTE_DUMP_ALLUVIAL">دامپ باطله آبرفتی (Alluvial Waste)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#8A9DB0] mb-1">دلیل فنی و متالورژیکی تخصیص</label>
              <textarea
                value={destinationReason}
                onChange={(e) => setDestinationReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-[#8A9DB0] mb-1">سرپرست تاییدکننده مقصد</label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                required
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
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'در حال ثبت...' : 'تأیید نهایی مقصد و صدور مجوز حمل'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
