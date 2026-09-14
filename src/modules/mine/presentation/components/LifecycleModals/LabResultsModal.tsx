// src/modules/mine/presentation/components/LifecycleModals/LabResultsModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, BeakerIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import type { SubBlock } from '../../../../../core/domain/types/mine.types';
import { SubBlockLifecycleService } from '../../../services/SubBlockLifecycleService';
import { BlockCodeDisplay } from '../../../../../shared/components/BlockCodeDisplay';

interface LabResultsModalProps {
  subBlock: SubBlock;
  onClose: () => void;
  onSuccess: (updatedSubBlock: SubBlock) => void;
}

export function LabResultsModal({ subBlock, onClose, onSuccess }: LabResultsModalProps) {
  const [fe, setFe] = useState<number>(subBlock.labResults?.fe ?? 56.4);
  const [feo, setFeo] = useState<number>(subBlock.labResults?.feo ?? 18.2);
  const [sio2, setSio2] = useState<number>(subBlock.labResults?.sio2 ?? 6.8);
  const [al2o3, setAl2o3] = useState<number>(subBlock.labResults?.al2o3 ?? 1.9);
  const [p, setP] = useState<number>(subBlock.labResults?.p ?? 0.08);
  const [s, setS] = useState<number>(subBlock.labResults?.s ?? 0.12);
  const [cao, setCao] = useState<number>(subBlock.labResults?.cao ?? 2.1);
  const [mgo, setMgo] = useState<number>(subBlock.labResults?.mgo ?? 1.4);
  const [moisture, setMoisture] = useState<number>(subBlock.labResults?.moisture ?? 3.0);
  const [density, setDensity] = useState<number>(subBlock.labResults?.density ?? 2.85);
  const [labName, setLabName] = useState(subBlock.labResults?.labName || 'آزمایشگاه مرکزی ژئوشیمی مجتمع');
  const [batchNumber, setBatchNumber] = useState(subBlock.labResults?.batchNumber || `BATCH-XRF-${Date.now().toString().slice(-4)}`);
  const [labTechnician, setLabTechnician] = useState(subBlock.labResults?.labTechnician || 'دکتر آزمایشگاه / مهندس شیمی');
  const [isVerified, setIsVerified] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = SubBlockLifecycleService.recordLabResults(subBlock.id, {
        fe,
        feo,
        sio2,
        al2o3,
        p,
        s,
        cao,
        mgo,
        moisture,
        density,
        labName,
        batchNumber,
        labTechnician,
        isVerified,
        changedBy: labTechnician,
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
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <BeakerIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">ثبت نتایج آنالیز آزمایشگاه (XRF / تیتراسیون)</h3>
                <div className="text-xs text-[#8A9DB0] flex items-center gap-1.5 mt-0.5">
                  <span>ساب‌بلوک:</span>
                  <BlockCodeDisplay code={subBlock.code} className="text-[#00D4FF] font-bold" />
                  {subBlock.sampleNumber && <span>| کد نمونه: {subBlock.sampleNumber}</span>}
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
            {/* شاخص‌های اصلی عیار آهن */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20">
              <div className="text-xs font-bold text-purple-300 mb-3 flex items-center gap-1.5">
                <span>عناصر کلیدی کانسار سنگ‌آهن</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1 font-semibold">Fe Total (آهن کل %)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fe}
                    onChange={(e) => setFe(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/40 rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1">FeO (اکسید آهن %)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={feo}
                    onChange={(e) => setFeo(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1">P (فسفر %)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={p}
                    onChange={(e) => setP(parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 bg-white/5 border rounded-xl font-mono text-sm focus:outline-none ${p > 0.15 ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-white/10 text-white'}`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1">S (گوگرد %)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={s}
                    onChange={(e) => setS(parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 bg-white/5 border rounded-xl font-mono text-sm focus:outline-none ${s > 0.20 ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-white/10 text-white'}`}
                  />
                </div>
              </div>
            </div>

            {/* گانگ و ناخالصی‌ها */}
            <div>
              <label className="block text-xs font-semibold text-[#8A9DB0] mb-2">آنالیز ترکیبات گانگ و فیزیکی</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1">SiO2 (سیلیس %)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sio2}
                    onChange={(e) => setSio2(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1">Al2O3 (آلومینا %)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={al2o3}
                    onChange={(e) => setAl2o3(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1">CaO (آهک %)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cao}
                    onChange={(e) => setCao(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8A9DB0] mb-1">MgO (منیزیم %)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={mgo}
                    onChange={(e) => setMgo(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>
            </div>

            {/* مشخصات فیزیکی و آزمایشگاه */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#8A9DB0] mb-1">رطوبت طبیعی (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={moisture}
                  onChange={(e) => setMoisture(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#8A9DB0] mb-1">چگالی کانسار (t/m³)</label>
                <input
                  type="number"
                  step="0.05"
                  value={density}
                  onChange={(e) => setDensity(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#8A9DB0] mb-1">شماره بچ / Batch</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#8A9DB0] mb-1">نام واحد آزمایشگاهی</label>
                <input
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#8A9DB0] mb-1">کارشناس آنالیزور</label>
                <input
                  type="text"
                  value={labTechnician}
                  onChange={(e) => setLabTechnician(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isVerified"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-white/10 border-white/20"
              />
              <label htmlFor="isVerified" className="text-xs text-[#8A9DB0] cursor-pointer flex items-center gap-1">
                <CheckBadgeIcon className="w-4 h-4 text-green-400 inline" />
                تاییدیه کنترل کیفی آزمایشگاه (QA/QC Verification) ضمیمه گردید
              </label>
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
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'در حال ثبت...' : 'ثبت قطعی نتایج آنالیز'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
