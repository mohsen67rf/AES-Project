// src/modules/mine/presentation/components/LifecycleModals/CrusherConsumptionModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, Cog6ToothIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { SubBlock } from '../../../../../core/domain/types/mine.types';
import { SubBlockLifecycleService } from '../../../services/SubBlockLifecycleService';
import { BlockCodeDisplay } from '../../../../../shared/components/BlockCodeDisplay';

interface CrusherConsumptionModalProps {
  subBlock: SubBlock;
  onClose: () => void;
  onSuccess: (updatedSubBlock: SubBlock) => void;
}

export function CrusherConsumptionModal({ subBlock, onClose, onSuccess }: CrusherConsumptionModalProps) {
  const fe = subBlock.labResults?.fe ?? 54.0;
  const initialTon = subBlock.tonnage || subBlock.estimatedTonnage || 3500;

  const defaultLine = subBlock.destination === 'CRUSHER_LINE_2' ? 'CRUSHER_LINE_2' : 'CRUSHER_LINE_1';

  const [crusherLine, setCrusherLine] = useState<'CRUSHER_LINE_1' | 'CRUSHER_LINE_2' | 'CRUSHER_FEED'>(defaultLine as any);
  const [feedTonnage, setFeedTonnage] = useState<number>(initialTon);
  const [feedRateTph, setFeedRateTph] = useState<number>(380);
  const [inputFeGrade, setInputFeGrade] = useState<number>(fe);

  // تخمین محصولات خردایش
  const [productLumpTonnage, setProductLumpTonnage] = useState<number>(Math.round(initialTon * 0.56));
  const [productLumpGrade, setProductLumpGrade] = useState<number>(Number((fe + 1.4).toFixed(2)));
  const [productFinesTonnage, setProductFinesTonnage] = useState<number>(Math.round(initialTon * 0.36));
  const [productFinesGrade, setProductFinesGrade] = useState<number>(Number((fe + 0.6).toFixed(2)));
  const [tailingsTonnage, setTailingsTonnage] = useState<number>(Math.round(initialTon * 0.08));

  const [operator, setOperator] = useState('مهندس بهره‌برداری خطوط خردایش');
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING');
  const [notes, setNotes] = useState('تنظیم گپ سنگ‌شکن روی ۹۰ میلی‌متر و سرند ۳ طبقه دانه‌بندی کلوخه و نرمه');
  const [loading, setLoading] = useState(false);

  // محاسبه خودکار درصد بازیابی متالورژیکی
  const totalProducedTon = productLumpTonnage + productFinesTonnage;
  const recoveryRate = feedTonnage > 0 && inputFeGrade > 0
    ? Number((((productLumpTonnage * productLumpGrade + productFinesTonnage * productFinesGrade) / (feedTonnage * inputFeGrade)) * 100).toFixed(1))
    : 92.5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = SubBlockLifecycleService.consumeInCrusher(subBlock.id, {
        crusherLine,
        feedTonnage,
        feedRateTph,
        inputFeGrade,
        productLumpTonnage,
        productLumpGrade,
        productFinesTonnage,
        productFinesGrade,
        tailingsTonnage,
        recoveryPercentage: recoveryRate,
        operator,
        shift,
        notes,
        changedBy: operator,
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
          className="w-full max-w-2xl bg-[#0D1B2E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-right my-8"
        >
          {/* هدر */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                <Cog6ToothIcon className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">مصرف و خوراک‌دهی در خطوط خردایش (Crushing Line Processing)</h3>
                <div className="text-xs text-[#8A9DB0] flex items-center gap-1.5 mt-0.5">
                  <span>ساب‌بلوک:</span>
                  <BlockCodeDisplay code={subBlock.code} className="text-[#00D4FF] font-bold" />
                  <span>| عیار ورودی:</span>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* انتخاب خط خردایش */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8A9DB0] mb-1">انتخاب خط خردایش</label>
                <select
                  value={crusherLine}
                  onChange={(e) => setCrusherLine(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#0A1628] border border-pink-500/40 rounded-xl text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="CRUSHER_LINE_1">خط ۱ خردایش (سنگ‌شکن فکی اولیه + سرند ارتعاشی)</option>
                  <option value="CRUSHER_LINE_2">خط ۲ خردایش (سنگ‌شکن هیدروکن ثانویه + دانه‌بندی ریز)</option>
                  <option value="CRUSHER_FEED">مدار پیوسته سنگ‌شکن مجتمع</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8A9DB0] mb-1">شیفت کاری</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#0A1628] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                >
                  <option value="MORNING">شیفت صبح (۰۶:۰۰ الی ۱۴:۰۰)</option>
                  <option value="EVENING">شیفت عصر (۱۴:۰۰ الی ۲۲:۰۰)</option>
                  <option value="NIGHT">شیفت شب (۲۲:۰۰ الی ۰۶:۰۰)</option>
                </select>
              </div>
            </div>

            {/* پارامترهای ورودی */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs font-bold text-[#00D4FF] mb-3">مشخصات خوراک ورودی به سنگ‌شکن (Feed)</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1">تناژ خوراک مصرفی (تن)</label>
                  <input
                    type="number"
                    value={feedTonnage}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setFeedTonnage(val);
                      setProductLumpTonnage(Math.round(val * 0.56));
                      setProductFinesTonnage(Math.round(val * 0.36));
                      setTailingsTonnage(Math.round(val * 0.08));
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-white font-mono text-sm font-bold focus:outline-none focus:border-[#00D4FF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1">نرخ خوراک‌دهی (تن بر ساعت)</label>
                  <input
                    type="number"
                    value={feedRateTph}
                    onChange={(e) => setFeedRateTph(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1">عیار آهن خوراک (Fe%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputFeGrade}
                    onChange={(e) => setInputFeGrade(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-white font-mono text-sm font-bold focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>
            </div>

            {/* بالانس خروجی و محصولات دانه‌بندی شده */}
            <div className="p-4 rounded-xl bg-pink-950/30 border border-pink-500/20">
              <div className="text-xs font-bold text-pink-300 mb-3 flex items-center justify-between">
                <span>محصولات خروجی مدار خردایش و دانه‌بندی</span>
                <span className="text-[11px] text-green-400 font-mono font-bold">
                  بازیابی کانسار (Recovery): {recoveryRate}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* کلوخه */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs font-bold text-[#AACCDD] mb-2">۱. کلوخه دانه‌بندی (Lump Ore: 10-30 mm)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#8A9DB0]">تناژ کلوخه (تن)</label>
                      <input
                        type="number"
                        value={productLumpTonnage}
                        onChange={(e) => setProductLumpTonnage(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 bg-white/10 border border-white/10 rounded-lg text-white font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8A9DB0]">عیار کلوخه (Fe%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={productLumpGrade}
                        onChange={(e) => setProductLumpGrade(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 bg-white/10 border border-white/10 rounded-lg text-green-400 font-mono text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* نرمه */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs font-bold text-[#AACCDD] mb-2">۲. نرمه دانه‌بندی (Fines Ore: 0-10 mm)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#8A9DB0]">تناژ نرمه (تن)</label>
                      <input
                        type="number"
                        value={productFinesTonnage}
                        onChange={(e) => setProductFinesTonnage(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 bg-white/10 border border-white/10 rounded-lg text-white font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8A9DB0]">عیار نرمه (Fe%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={productFinesGrade}
                        onChange={(e) => setProductFinesGrade(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 bg-white/10 border border-white/10 rounded-lg text-green-400 font-mono text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1">باطله دانه‌بندی و سرند (تن)</label>
                  <input
                    type="number"
                    value={tailingsTonnage}
                    onChange={(e) => setTailingsTonnage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white/10 border border-white/10 rounded-xl text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1">سرپرست خط خردایش</label>
                  <input
                    type="text"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white/10 border border-white/10 rounded-xl text-white text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#8A9DB0] mb-1">گزارش و توضیحات فنی مدار خردایش</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
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
                className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-pink-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'در حال ثبت...' : 'ثبت قطعی مصرف و تکمیل چرخه خردایش'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
