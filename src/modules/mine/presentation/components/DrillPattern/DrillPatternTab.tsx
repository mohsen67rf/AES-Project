// src/modules/mine/presentation/components/DrillPattern/DrillPatternTab.tsx

import React, { useState, useEffect } from 'react';
import { 
  WrenchScrewdriverIcon, 
  DocumentCheckIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  PlayIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';
import { 
  BlockRepository, 
  DrillPatternDesignRepository,
  MonthlyBandRepository 
} from '../../../../../core/infrastructure/repositories';
import { DrillPatternService } from '../../../services/DrillPatternService';
import type { DrillPatternDesign, Block, StakeholderRole } from '../../../../../core/domain/types/mine.types';
import { BlockCodeDisplay, formatBlockCode } from '../../../../../shared/components/BlockCodeDisplay';

interface DrillPatternTabProps {
  stakeholderRole?: StakeholderRole;
  onBlockSelect?: (block: Block) => void;
}

export function DrillPatternTab({ stakeholderRole = 'ALL', onBlockSelect }: DrillPatternTabProps) {
  const [patterns, setPatterns] = useState<DrillPatternDesign[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);

  // فرم طراحی شبکه حفاری پیمانکار
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [patternCode, setPatternCode] = useState('DP-1040-B32-V1');
  const [holeDiameterMm, setHoleDiameterMm] = useState(76);
  const [burdenMeters, setBurdenMeters] = useState(3.0);
  const [spacingMeters, setSpacingMeters] = useState(3.5);
  const [subDrillingMeters, setSubDrillingMeters] = useState(1.0);
  const [holeCount, setHoleCount] = useState(48);
  const [avgDepthMeters, setAvgDepthMeters] = useState(12.5);
  const [explosiveType, setExplosiveType] = useState('آنفو (ANFO) + بوستر ۵۰۰ گرمی Emulite');
  const [powderFactor, setPowderFactor] = useState(0.65);

  const loadData = () => {
    setPatterns(DrillPatternService.getAllPatterns());
    const allBlocks = BlockRepository.getAll();
    setBlocks(allBlocks);
    if (!selectedBlockId && allBlocks.length > 0) {
      setSelectedBlockId(allBlocks[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDesignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlockId) return;

    DrillPatternService.submitDrillDesign({
      blockId: selectedBlockId,
      code: patternCode,
      designerContractor: 'دفتر فنی پیمانکار استخراج (مهندس رضایی)',
      holeDiameterMm: Number(holeDiameterMm),
      burdenMeters: Number(burdenMeters),
      spacingMeters: Number(spacingMeters),
      subDrillingMeters: Number(subDrillingMeters),
      holeCount: Number(holeCount),
      avgDepthMeters: Number(avgDepthMeters),
      explosiveType,
      powderFactorKgPerM3: Number(powderFactor),
    });

    setIsDesignModalOpen(false);
    loadData();
  };

  const handleIssuePermit = (patternId: string) => {
    DrillPatternService.issueDrillingPermit({
      patternId,
      supervisionReviewer: 'دکتر علوی (دفتر فنی نظارت)',
      supervisionNotes: 'الگوی شبکه چال‌ها و بار سنگ بررسی شد؛ عملیات حفاری با رعایت الزامات ایمنی مجاز است.',
    });
    loadData();
  };

  const handleRevision = (patternId: string) => {
    const note = prompt('لطفاً دلیل درخواست اصلاح شبکه چال‌ها را وارد نمایید:', 'فواصل چال‌ها در زون مگنتیتی متراکم باید به ۳×۳ اصلاح شود.');
    if (note) {
      DrillPatternService.requestRevision({
        patternId,
        supervisionReviewer: 'دکتر علوی (نظارت)',
        supervisionNotes: note,
      });
      loadData();
    }
  };

  const handleCompleteDrilling = (blockId: string) => {
    DrillPatternService.completeDrilling(blockId, 'واحد حفاری پیمانکار (دریل واگن #03)');
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* سربرگ ماژول */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              مراحل ۳، ۴ و ۵ چرخه کاری
            </span>
            <h3 className="text-lg font-bold text-white">طراحی شبکه حفاری و صدور مجوز (Drill Pattern & Permit)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            طراحی الگوی چال‌ها توسط دفتر فنی پیمانکار، بررسی و صدور مجوز حفاری توسط واحد نظارت، و ثبت پیشرفت روزانه
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="بروزرسانی"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>

          {(stakeholderRole === 'ALL' || stakeholderRole === 'MINING_CONTRACTOR') && (
            <button
              onClick={() => setIsDesignModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all duration-200"
            >
              <DocumentPlusIcon className="w-4 h-4" />
              <span>طراحی شبکه چال جدید (پیمانکار)</span>
            </button>
          )}
        </div>
      </div>

      {/* لیست الگوها و گردش کار مجوز */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.map((p) => {
          const isPermitIssued = p.status === 'PERMIT_ISSUED';
          const isPending = p.status === 'PENDING_SUPERVISION_REVIEW';
          const isDrilled = p.status === 'DRILLING_COMPLETED';
          const isRevision = p.status === 'REVISION_REQUIRED';

          return (
            <div
              key={p.id}
              className={`p-5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:shadow-xl ${
                isPermitIssued || isDrilled
                  ? 'border-emerald-500/30 hover:border-emerald-500/60'
                  : isPending
                  ? 'border-cyan-500/30 hover:border-cyan-500/60'
                  : 'border-rose-500/30 hover:border-rose-500/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/50">
                      {p.code}
                    </span>
                    <span className="text-xs text-white font-bold flex items-center gap-1">
                      <span>بلوک:</span>
                      <BlockCodeDisplay code={p.blockCode} className="text-white font-bold" />
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">طراح: {p.designerContractor}</div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  isDrilled
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    : isPermitIssued
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : isPending
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {isDrilled ? 'حفاری تکمیل شد' : isPermitIssued ? 'مجوز حفاری صادر شد' : isPending ? 'در انتظار بررسی نظارت' : 'نیازمند اصلاح'}
                </span>
              </div>

              {/* مشخصات شبکه چال‌ها */}
              <div className="grid grid-cols-4 gap-2 mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                <div>
                  <div className="text-[10px] text-slate-500">تعداد چال</div>
                  <div className="text-sm font-bold text-white font-mono">{p.holeCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">قطر چال</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">{p.holeDiameterMm} mm</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">شبکه (B×S)</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">{p.burdenMeters}×{p.spacingMeters} m</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">متراژ کل</div>
                  <div className="text-sm font-bold text-amber-400 font-mono">{p.totalMetersDesign} m</div>
                </div>
              </div>

              {p.permitNumber && (
                <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                    <span>شماره مجوز نظارت: <strong className="font-mono">{p.permitNumber}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-400">تأیید: {p.supervisionReviewer}</span>
                </div>
              )}

              {p.supervisionNotes && (
                <p className="text-[11px] text-slate-400 mt-2 p-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  {p.supervisionNotes}
                </p>
              )}

              {/* اکشن‌های عملیاتی */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800">
                <div className="text-[10px] text-slate-500">
                  مرحله بعدی: {isPermitIssued ? 'اجرای حفاری و نمونه‌گیری' : isDrilled ? 'ساب‌بندی و آزمایشگاه' : 'بررسی دفتر فنی نظارت'}
                </div>

                <div className="flex items-center gap-2">
                  {isPending && (stakeholderRole === 'ALL' || stakeholderRole === 'SUPERVISION') && (
                    <>
                      <button
                        onClick={() => handleRevision(p.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-colors"
                      >
                        درخواست اصلاح
                      </button>
                      <button
                        onClick={() => handleIssuePermit(p.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs shadow-md transition-colors"
                      >
                        <DocumentCheckIcon className="w-3.5 h-3.5" />
                        <span>صدور مجوز حفاری (نظارت)</span>
                      </button>
                    </>
                  )}

                  {isPermitIssued && (stakeholderRole === 'ALL' || stakeholderRole === 'MINING_CONTRACTOR') && (
                    <button
                      onClick={() => handleCompleteDrilling(p.blockId)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-colors"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      <span>ثبت اتمام حفاری بلوک</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* مودال طراحی شبکه حفاری توسط پیمانکار */}
      {isDesignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-6 h-6 text-emerald-400" />
                <h3 className="text-base font-bold text-white">طراحی شبکه حفاری و چال‌زنی (دفتر فنی پیمانکار)</h3>
              </div>
              <button
                onClick={() => setIsDesignModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDesignSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">انتخاب بلوک اجرایی:</label>
                  <select
                    value={selectedBlockId}
                    onChange={(e) => setSelectedBlockId(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                  >
                    {blocks.map((b) => (
                      <option key={b.id} value={b.id} dir="ltr">
                        {formatBlockCode(b.code)} — تراز {b.targetLevel}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">کد طرح حفاری:</label>
                  <input
                    type="text"
                    value={patternCode}
                    onChange={(e) => setPatternCode(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">قطر مته (mm):</label>
                  <select
                    value={holeDiameterMm}
                    onChange={(e) => setHoleDiameterMm(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                  >
                    <option value={64}>64 mm (2.5")</option>
                    <option value={76}>76 mm (3.0")</option>
                    <option value={89}>89 mm (3.5")</option>
                    <option value={102}>102 mm (4.0")</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">بار سنگ - Burden (m):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={burdenMeters}
                    onChange={(e) => setBurdenMeters(Number(e.target.value))}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">فاصله ردیف - Spacing (m):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={spacingMeters}
                    onChange={(e) => setSpacingMeters(Number(e.target.value))}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">تعداد کل چال‌ها:</label>
                  <input
                    type="number"
                    value={holeCount}
                    onChange={(e) => setHoleCount(Number(e.target.value))}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">عمق متوسط طراحی (m):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={avgDepthMeters}
                    onChange={(e) => setAvgDepthMeters(Number(e.target.value))}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">اضافه‌حفاری - Subdrill (m):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={subDrillingMeters}
                    onChange={(e) => setSubDrillingMeters(Number(e.target.value))}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">متراژ تخمینی کل حفاری:</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  {(holeCount * avgDepthMeters).toLocaleString()} متر طول
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDesignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  ثبت طرح و ارسال جهت اخذ مجوز نظارت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
