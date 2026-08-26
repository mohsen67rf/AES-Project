// src/modules/mine/presentation/components/LifecycleModals/SubBlockDetailModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BeakerIcon, 
  TagIcon, 
  TruckIcon, 
  Cog6ToothIcon, 
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import type { SubBlock } from '../../../../../core/domain/types/mine.types';
import { SUB_BLOCK_STATUS_LABELS, DESTINATION_LABELS } from '../../../../../core/domain/constants/mine.constants';
import { SUB_BLOCK_STATUS_COLORS } from '../../../../../core/domain/constants/subblock.constants';

interface SubBlockDetailModalProps {
  subBlock: SubBlock;
  onClose: () => void;
  onOpenAction?: (actionType: 'sample' | 'lab' | 'classify' | 'destination' | 'crush') => void;
}

export function SubBlockDetailModal({ subBlock, onClose, onOpenAction }: SubBlockDetailModalProps) {
  const fe = subBlock.labResults?.fe;
  const p = subBlock.labResults?.p;
  const s = subBlock.labResults?.s;
  const sio2 = subBlock.labResults?.sio2;
  const statusLabel = SUB_BLOCK_STATUS_LABELS[subBlock.status] || subBlock.status;
  const statusColor = SUB_BLOCK_STATUS_COLORS[subBlock.status] || 'bg-gray-500/20 text-gray-300';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl bg-[#0D1B2E] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-right my-8"
        >
          {/* هدر */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#00D4FF]/20 text-[#00D4FF]">
                <SparklesIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-lg font-mono">ساب‌بلوک {subBlock.code}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
                <p className="text-xs text-[#8A9DB0] mt-0.5">
                  پله/تراز: {subBlock.benchLevel || 'نامشخص'} | تناژ: {subBlock.tonnage?.toLocaleString() || subBlock.estimatedTonnage?.toLocaleString() || '-'} تن
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-[#8A9DB0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* کارت‌های خلاصه فازها */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* ۱. نمونه‌برداری */}
              <div className={`p-3.5 rounded-2xl border ${subBlock.sampleId ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-bold mb-1">
                  <BeakerIcon className="w-4 h-4" />
                  <span>۱. نمونه‌برداری</span>
                </div>
                {subBlock.sampleNumber ? (
                  <div className="text-xs space-y-0.5">
                    <p className="text-white font-mono font-bold truncate">{subBlock.sampleNumber}</p>
                    <p className="text-[#8A9DB0]">{subBlock.sampler}</p>
                  </div>
                ) : (
                  <p className="text-xs text-[#4A6A8A]">ثبت نشده</p>
                )}
              </div>

              {/* ۲. آزمایشگاه */}
              <div className={`p-3.5 rounded-2xl border ${subBlock.labResults ? 'bg-purple-500/10 border-purple-500/20' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold mb-1">
                  <BeakerIcon className="w-4 h-4" />
                  <span>۲. آنالیز عیار</span>
                </div>
                {fe !== undefined ? (
                  <div className="text-xs space-y-0.5">
                    <p className="text-white font-bold font-mono text-sm">{fe.toFixed(2)}% Fe</p>
                    <p className="text-[#8A9DB0] font-mono text-[11px]">P: {p || 0}% | S: {s || 0}%</p>
                  </div>
                ) : (
                  <p className="text-xs text-[#4A6A8A]">ثبت نشده</p>
                )}
              </div>

              {/* ۳. طبقه‌بندی و مقصد */}
              <div className={`p-3.5 rounded-2xl border ${subBlock.destination ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold mb-1">
                  <TruckIcon className="w-4 h-4" />
                  <span>۳. مقصد و ترابری</span>
                </div>
                {subBlock.destination ? (
                  <div className="text-xs space-y-0.5">
                    <p className="text-white font-bold truncate">{DESTINATION_LABELS[subBlock.destination] || subBlock.destination}</p>
                    <p className="text-[#8A9DB0]">{subBlock.materialClass || 'طبقه‌بندی شده'}</p>
                  </div>
                ) : (
                  <p className="text-xs text-[#4A6A8A]">ثبت نشده</p>
                )}
              </div>

              {/* ۴. مصرف در خردایش */}
              <div className={`p-3.5 rounded-2xl border ${subBlock.crusherFeedData ? 'bg-pink-500/10 border-pink-500/20' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-1.5 text-xs text-pink-400 font-bold mb-1">
                  <Cog6ToothIcon className="w-4 h-4" />
                  <span>۴. خطوط خردایش</span>
                </div>
                {subBlock.crusherFeedData ? (
                  <div className="text-xs space-y-0.5">
                    <p className="text-white font-bold">{subBlock.crusherFeedData.lineName || subBlock.crusherFeedData.crusherLine}</p>
                    <p className="text-green-400 font-mono font-bold">تولید: {subBlock.crusherFeedData.productLumpTonnage?.toLocaleString()} ت کلوخه</p>
                  </div>
                ) : (
                  <p className="text-xs text-[#4A6A8A]">مصرف نشده</p>
                )}
              </div>
            </div>

            {/* جزئیات کامل متالورژی و آزمایشگاه در صورت وجود */}
            {subBlock.labResults && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-[#00D4FF] flex items-center gap-1.5">
                  <BeakerIcon className="w-4 h-4" />
                  شناسنامه کامل ژئومتالورژی و آنالیز آزمایشگاهی
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <span className="text-[#8A9DB0] block">Fe Total</span>
                    <span className="text-white font-mono font-bold text-sm">{fe?.toFixed(2)}%</span>
                  </div>
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <span className="text-[#8A9DB0] block">FeO</span>
                    <span className="text-white font-mono font-bold">{subBlock.labResults.feo || 0}%</span>
                  </div>
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <span className="text-[#8A9DB0] block">SiO2</span>
                    <span className="text-white font-mono font-bold">{sio2 || 0}%</span>
                  </div>
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <span className="text-[#8A9DB0] block">Al2O3</span>
                    <span className="text-white font-mono font-bold">{subBlock.labResults.al2o3 || 0}%</span>
                  </div>
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <span className="text-[#8A9DB0] block">فسفر (P)</span>
                    <span className={`font-mono font-bold ${(p || 0) > 0.15 ? 'text-red-400' : 'text-white'}`}>{p || 0}%</span>
                  </div>
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <span className="text-[#8A9DB0] block">گوگرد (S)</span>
                    <span className={`font-mono font-bold ${(s || 0) > 0.20 ? 'text-red-400' : 'text-white'}`}>{s || 0}%</span>
                  </div>
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <span className="text-[#8A9DB0] block">چگالی کانسار</span>
                    <span className="text-white font-mono font-bold">{subBlock.density || 2.75} t/m³</span>
                  </div>
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <span className="text-[#8A9DB0] block">آزمایشگاه</span>
                    <span className="text-white truncate block">{subBlock.labResults.labName || 'مرکزی'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* گزارش خط خردایش در صورت مصرف */}
            {subBlock.crusherFeedData && (
              <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-500/20 space-y-3">
                <h4 className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                  <Cog6ToothIcon className="w-4 h-4" />
                  گزارش مصرف و راندمان خط خردایش
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-black/30 rounded-xl">
                    <span className="text-[#8A9DB0] block">خوراک ورودی</span>
                    <span className="text-white font-mono font-bold">{subBlock.crusherFeedData.feedTonnage?.toLocaleString()} تن</span>
                  </div>
                  <div className="p-2.5 bg-black/30 rounded-xl">
                    <span className="text-[#8A9DB0] block">کلوخه دانه‌بندی</span>
                    <span className="text-green-400 font-mono font-bold">{subBlock.crusherFeedData.productLumpTonnage?.toLocaleString()} تن ({subBlock.crusherFeedData.productLumpGrade}% Fe)</span>
                  </div>
                  <div className="p-2.5 bg-black/30 rounded-xl">
                    <span className="text-[#8A9DB0] block">نرمه دانه‌بندی</span>
                    <span className="text-green-400 font-mono font-bold">{subBlock.crusherFeedData.productFinesTonnage?.toLocaleString()} تن ({subBlock.crusherFeedData.productFinesGrade}% Fe)</span>
                  </div>
                  <div className="p-2.5 bg-black/30 rounded-xl">
                    <span className="text-[#8A9DB0] block">بازیابی متالورژیکی</span>
                    <span className="text-green-400 font-mono font-bold text-sm">{subBlock.crusherFeedData.recoveryPercentage || 92}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* تاریخچه کامل و لاگ تغییرات وضعیت */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#8A9DB0] flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                تاریخچه رویدادهای چرخه‌ی زندگی (Audit Trail)
              </h4>
              <div className="space-y-2 border-r-2 border-white/10 pr-4">
                {subBlock.statusHistory?.map((h, i) => (
                  <div key={i} className="relative pb-2 last:pb-0">
                    <div className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#00D4FF]" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{SUB_BLOCK_STATUS_LABELS[h.status] || h.status}</span>
                      <span className="text-[#4A6A8A] font-mono text-[11px]">{new Date(h.changedAt).toLocaleString('fa-IR')}</span>
                    </div>
                    {h.note && <p className="text-xs text-[#8A9DB0] mt-0.5">{h.note}</p>}
                    <p className="text-[10px] text-[#4A6A8A]">توسط: {h.changedBy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* فوتر با دکمه‌های اقدام سریع */}
          <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#8A9DB0] hover:text-white transition-colors cursor-pointer"
            >
              بستن
            </button>

            <div className="flex items-center gap-2">
              {onOpenAction && (
                <>
                  <button
                    onClick={() => { onClose(); onOpenAction('sample'); }}
                    className="px-3 py-1.5 text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-xl transition-colors cursor-pointer"
                  >
                    نمونه‌برداری
                  </button>
                  <button
                    onClick={() => { onClose(); onOpenAction('lab'); }}
                    className="px-3 py-1.5 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-xl transition-colors cursor-pointer"
                  >
                    ثبت آنالیز
                  </button>
                  <button
                    onClick={() => { onClose(); onOpenAction('classify'); }}
                    className="px-3 py-1.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-colors cursor-pointer"
                  >
                    طبقه‌بندی
                  </button>
                  <button
                    onClick={() => { onClose(); onOpenAction('destination'); }}
                    className="px-3 py-1.5 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl transition-colors cursor-pointer"
                  >
                    تعیین مقصد
                  </button>
                  <button
                    onClick={() => { onClose(); onOpenAction('crush'); }}
                    className="px-3 py-1.5 text-xs bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 rounded-xl transition-colors cursor-pointer font-bold"
                  >
                    خوراک خط خردایش
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
