// src/modules/mine/presentation/components/LifecycleModals/SamplingModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, DocumentTextIcon, BeakerIcon } from '@heroicons/react/24/outline';
import type { SubBlock } from '../../../../../core/domain/types/mine.types';
import { SubBlockLifecycleService } from '../../../services/SubBlockLifecycleService';

interface SamplingModalProps {
  subBlock: SubBlock;
  onClose: () => void;
  onSuccess: (updatedSubBlock: SubBlock) => void;
}

export function SamplingModal({ subBlock, onClose, onSuccess }: SamplingModalProps) {
  const [sampleNumber, setSampleNumber] = useState(`SMP-${subBlock.code}-${Date.now().toString().slice(-4)}`);
  const [sampler, setSampler] = useState('مهندس نمونه‌بردار');
  const [sampleType, setSampleType] = useState<'POWDER_BLASTHOLE' | 'CORE_DRILL' | 'TRENCH' | 'GRAB'>('POWDER_BLASTHOLE');
  const [sampleDate, setSampleDate] = useState(new Date().toISOString().split('T')[0]);
  const [sampleDepth, setSampleDepth] = useState(12.0);
  const [sampleWeight, setSampleWeight] = useState(5.5);
  const [sampleNotes, setSampleNotes] = useState('نمونه‌برداری از پودر چال‌های انفجاری با رعایت استاندارد کوارترینگ');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = SubBlockLifecycleService.recordSampling(subBlock.id, {
        sampleNumber,
        sampler,
        sampleType,
        sampleDate,
        sampleDepth,
        sampleWeight,
        sampleNotes,
        changedBy: sampler,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-[#0D1B2E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-right"
        >
          {/* هدر */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400">
                <BeakerIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">ثبت پروتکل نمونه‌برداری</h3>
                <p className="text-xs text-[#8A9DB0]">ساب‌بلوک: <span className="font-mono text-[#00D4FF] font-bold">{subBlock.code}</span></p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8A9DB0] mb-1">کد شناسایی نمونه</label>
                <input
                  type="text"
                  value={sampleNumber}
                  onChange={(e) => setSampleNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-[#8A9DB0] mb-1">مسئول نمونه‌برداری</label>
                <input
                  type="text"
                  value={sampler}
                  onChange={(e) => setSampler(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8A9DB0] mb-1">روش نمونه‌برداری</label>
                <select
                  value={sampleType}
                  onChange={(e) => setSampleType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0A1628] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                >
                  <option value="POWDER_BLASTHOLE">پودری چال‌های آتشباری (Blasthole)</option>
                  <option value="CORE_DRILL">مغزه حفاری اکتشافی (Core Drill)</option>
                  <option value="TRENCH">ترانشه / کانال (Trench)</option>
                  <option value="GRAB">نمونه‌برداری تصادفی (Grab Sample)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#8A9DB0] mb-1">تاریخ برداشت</label>
                <input
                  type="date"
                  value={sampleDate}
                  onChange={(e) => setSampleDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#8A9DB0] mb-1">عمق برداشت (متر)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sampleDepth}
                  onChange={(e) => setSampleDepth(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8A9DB0] mb-1">وزن نمونه (کیلوگرم)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sampleWeight}
                  onChange={(e) => setSampleWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#8A9DB0] mb-1">توضیحات و مشاهدات صحرایی</label>
              <textarea
                value={sampleNotes}
                onChange={(e) => setSampleNotes(e.target.value)}
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
                className="px-6 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-yellow-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'در حال ثبت...' : 'تأیید و ارسال نمونه به آزمایشگاه'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
