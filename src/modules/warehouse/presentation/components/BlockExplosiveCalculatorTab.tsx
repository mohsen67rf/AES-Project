// src/modules/warehouse/presentation/components/BlockExplosiveCalculatorTab.tsx

import React, { useState, useMemo } from 'react';
import { 
  WarehouseItem, 
  BlockBlastCalculationInput, 
  BlockBlastCalculationResult,
  ExplosiveType 
} from '../../domain/types/warehouse.types';
import { WarehouseService } from '../../services/WarehouseService';
import { BlockRepository } from '../../../../core/infrastructure/repositories';
import { BlockCodeDisplay, formatBlockCode } from '../../../../shared/components/BlockCodeDisplay';
import { 
  CalculatorIcon, 
  SparklesIcon, 
  CubeIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface BlockExplosiveCalculatorTabProps {
  items: WarehouseItem[];
  isDark: boolean;
  onDispatchSuccess: (permitNumber: string, blockCode: string, result: BlockBlastCalculationResult, input: BlockBlastCalculationInput) => void;
}

const ROCK_PRESETS = [
  {
    id: 'hard_magnetite',
    name: 'مگنتیت پرعیار متراکم و سخت (Hard Magnetite DSO)',
    density: 3.25,
    defaultPowderFactorKgTon: 0.42,
    recommendedBurden: 3.0,
    recommendedSpacing: 3.5,
    recommendedStemming: 2.6,
    recommendedExplosive: 'ANFO' as ExplosiveType
  },
  {
    id: 'skarn_waste',
    name: 'باطله سخت و اسکارت پیروکسن (Skarn / Waste Rock)',
    density: 2.85,
    defaultPowderFactorKgTon: 0.36,
    recommendedBurden: 3.2,
    recommendedSpacing: 3.8,
    recommendedStemming: 2.8,
    recommendedExplosive: 'ANFO' as ExplosiveType
  },
  {
    id: 'medium_grade',
    name: 'سنگ‌آهن متوسط‌عیار و نواری (Banded Iron Formation)',
    density: 3.05,
    defaultPowderFactorKgTon: 0.34,
    recommendedBurden: 3.0,
    recommendedSpacing: 3.6,
    recommendedStemming: 2.5,
    recommendedExplosive: 'ANFO' as ExplosiveType
  },
  {
    id: 'wet_bottom_pit',
    name: 'پله‌های آبدار کف پیت (Wet Bench / Ground Water)',
    density: 3.15,
    defaultPowderFactorKgTon: 0.45,
    recommendedBurden: 2.8,
    recommendedSpacing: 3.3,
    recommendedStemming: 2.4,
    recommendedExplosive: 'EMULSION_BULK' as ExplosiveType
  },
  {
    id: 'soft_overburden',
    name: 'روباره هوازده و آبرفت سست (Soft Overburden)',
    density: 2.40,
    defaultPowderFactorKgTon: 0.25,
    recommendedBurden: 3.5,
    recommendedSpacing: 4.2,
    recommendedStemming: 3.0,
    recommendedExplosive: 'ANFO' as ExplosiveType
  }
];

export const BlockExplosiveCalculatorTab: React.FC<BlockExplosiveCalculatorTabProps> = ({
  items,
  isDark,
  onDispatchSuccess
}) => {
  // بارگذاری بلوک‌های موجود در سیستم
  const existingBlocks = useMemo(() => {
    try {
      return BlockRepository.getAll();
    } catch {
      return [];
    }
  }, []);

  // وضعیت انتخاب بلوک و ورودی‌های محاسباتی
  const [selectedBlockId, setSelectedBlockId] = useState<string>(existingBlocks[0]?.id || 'custom');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('hard_magnetite');

  const [input, setInput] = useState<BlockBlastCalculationInput>({
    blockCode: '1040 B 32',
    benchLevel: 1040,
    rockType: 'مگنتیت پرعیار متراکم و سخت',
    rockDensityTonPerM3: 3.25,
    lengthMeters: 40,
    widthMeters: 25,
    benchHeightMeters: 12.5,
    holeDiameterMm: 76,
    burdenMeters: 3.0,
    spacingMeters: 3.5,
    subDrillingMeters: 1.0,
    stemmingLengthMeters: 2.6,
    holeCount: 48,
    explosiveType: 'ANFO',
    targetPowderFactorKgTon: 0.40,
    boostersPerHole: 1,
    detonatorDelayMs: 500,
    surfaceConnectorsCount: 12,
    detonatingCordMetersPerHole: 3
  });

  // جزئیات مجریان جهت صدور حواله
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [contractorName, setContractorName] = useState('پیمانکار استخراج و آتشباری (مهندس رضایی)');
  const [blasterName, setBlasterName] = useState('استادکار آتشباری (مهندس حیدری)');
  const [supervisionApprover, setSupervisionApprover] = useState('دکتر علوی (دفتر فنی نظارت)');
  const [clientApprover, setClientApprover] = useState('مهندس حسینی (مدیریت کارفرما)');
  const [customPermitNumber, setCustomPermitNumber] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);

  // همگام‌سازی با بلوک انتخابی
  const handleBlockChange = (blockId: string) => {
    setSelectedBlockId(blockId);
    if (blockId === 'custom') {
      setInput(prev => ({
        ...prev,
        blockCode: 'BLOCK-CUSTOM-' + Math.floor(100 + Math.random() * 900),
        benchLevel: 1020,
        holeCount: 36
      }));
      return;
    }

    const b = existingBlocks.find(item => item.id === blockId);
    if (b) {
      setInput(prev => ({
        ...prev,
        blockId: b.id,
        blockCode: b.code || b.name,
        benchLevel: b.targetLevel || 1040,
        holeCount: b.drillingParams?.totalHoles || 48,
        holeDiameterMm: b.drillingParams?.holeDiameter || 76,
        benchHeightMeters: (b.drillingParams?.avgDesignDepth || 12.5) - 1.0,
      }));
    }
  };

  // همگام‌سازی با پری‌ست جنس سنگ
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = ROCK_PRESETS.find(item => item.id === presetId);
    if (p) {
      setInput(prev => ({
        ...prev,
        rockType: p.name,
        rockDensityTonPerM3: p.density,
        targetPowderFactorKgTon: p.defaultPowderFactorKgTon,
        burdenMeters: p.recommendedBurden,
        spacingMeters: p.recommendedSpacing,
        stemmingLengthMeters: p.recommendedStemming,
        explosiveType: p.recommendedExplosive
      }));
    }
  };

  // محاسبه لحظه‌ای نتایج با موتور محاسباتی
  const calcResult: BlockBlastCalculationResult = useMemo(() => {
    return WarehouseService.calculateBlockBlastMaterials(input);
  }, [input]);

  // ثبت و صدور حواله خروج
  const handleConfirmDispatch = () => {
    setIsSubmittingDispatch(true);
    try {
      const res = WarehouseService.executeBlockBlastDispatch(input, calcResult, {
        contractorName,
        blasterName,
        supervisionApprover,
        clientApprover,
        permitNumber: customPermitNumber,
        notes: dispatchNotes
      });

      if (res.success) {
        setDispatchModalOpen(false);
        onDispatchSuccess(res.permitNumber, input.blockCode, calcResult, input);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'نامشخص';
      alert('خطا در صدور حواله: ' + errorMessage);
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* هدر بخش محاسبات */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CalculatorIcon className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                موتور محاسبات خودکار خرج ویژه و مصرف مواد ناریه بلوک‌های استخراجی
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              طراحی الگوی خرج‌گذاری، محاسبه حجم و تناژ سنگ، متراژ حفاری و تعیین دقیق سهمیه آنفو، امولسیون، بوستر و چاشنی‌ها
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">انتخاب بلوک معدن:</span>
            <select
              value={selectedBlockId}
              onChange={(e) => handleBlockChange(e.target.value)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {existingBlocks.map(b => (
                <option key={b.id} value={b.id}>
                  {b.code} - {b.name} (پله {b.targetLevel})
                </option>
              ))}
              <option value="custom">بلوک سفارشی جدید (Custom Block)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ستون ورودی‌های پارامتری مهندسی حفاری و انفجار (۵ ستون) */}
        <div className={`lg:col-span-5 p-5 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CubeIcon className="w-4 h-4 text-amber-500" />
              پارامترهای هندسی و ژئومکانیکی بلوک
            </span>
            <button 
              onClick={() => handlePresetChange(selectedPresetId)}
              className="text-[11px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" />
              بازنشانی مقادیر
            </button>
          </div>

          {/* نوع سنگ و شرایط ژئوتکنیکی */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              پری‌ست جنس سنگ و چگالی:
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
            >
              {ROCK_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.name} (ρ={p.density} t/m³)</option>
              ))}
            </select>
          </div>

          {/* ردیف کد بلوک و تراز پله */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">کد بلوک</label>
              <input
                type="text"
                value={input.blockCode}
                onChange={(e) => setInput({ ...input, blockCode: e.target.value })}
                dir="ltr"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 font-mono text-left"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">تراز پله (متر)</label>
              <input
                type="number"
                value={input.benchLevel}
                onChange={(e) => setInput({ ...input, benchLevel: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* ردیف تعداد چال و قطر چال */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">تعداد کل چال‌ها</label>
              <input
                type="number"
                min="1"
                value={input.holeCount}
                onChange={(e) => setInput({ ...input, holeCount: Math.max(1, Number(e.target.value)) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">قطر مته و چال (mm)</label>
              <select
                value={input.holeDiameterMm}
                onChange={(e) => setInput({ ...input, holeDiameterMm: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value={76}>76 mm (3 inch - دریل واگن)</option>
                <option value={89}>89 mm (3.5 inch)</option>
                <option value={102}>102 mm (4 inch)</option>
                <option value={115}>115 mm (4.5 inch)</option>
                <option value={152}>152 mm (6 inch - روتاری سنگین)</option>
              </select>
            </div>
          </div>

          {/* ردیف بار سنگ و فاصله چال‌ها (Burden & Spacing) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">بار سنگ - Burden (m)</label>
              <input
                type="number"
                step="0.1"
                value={input.burdenMeters}
                onChange={(e) => setInput({ ...input, burdenMeters: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">فاصله چال‌ها - Spacing (m)</label>
              <input
                type="number"
                step="0.1"
                value={input.spacingMeters}
                onChange={(e) => setInput({ ...input, spacingMeters: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* ردیف ارتفاع پله، اضافه‌حفاری و گل‌گذاری */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">ارتفاع پله (m)</label>
              <input
                type="number"
                step="0.5"
                value={input.benchHeightMeters}
                onChange={(e) => setInput({ ...input, benchHeightMeters: Number(e.target.value) })}
                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">اضافه‌حفاری (m)</label>
              <input
                type="number"
                step="0.1"
                value={input.subDrillingMeters}
                onChange={(e) => setInput({ ...input, subDrillingMeters: Number(e.target.value) })}
                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">گل‌گذاری (m)</label>
              <input
                type="number"
                step="0.1"
                value={input.stemmingLengthMeters}
                onChange={(e) => setInput({ ...input, stemmingLengthMeters: Number(e.target.value) })}
                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* نوع سیستم انفجاری */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              سیستم ماده منفجره اصلی:
            </label>
            <select
              value={input.explosiveType}
              onChange={(e) => setInput({ ...input, explosiveType: e.target.value as ExplosiveType })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
            >
              <option value="ANFO">آنفو استاندارد صنعتی (ANFO ۱۰۰٪) - چال‌های خشک</option>
              <option value="EMULSION_BULK">امولسیون فله ضدآب (Bulk Emulsion Matrix) - چال‌های آبدار</option>
              <option value="EMULITE_CARTRIDGE">کارتریج فشنگی امولایت (Heavy Charge Cartridge)</option>
            </select>
          </div>

          {/* خرج ویژه هدف (Powder Factor Target Slider) */}
          <div className="p-3 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-amber-900 dark:text-amber-300">خرج ویژه هدف (Powder Factor):</span>
              <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                {input.targetPowderFactorKgTon} kg/ton
              </span>
            </div>
            <input
              type="range"
              min="0.20"
              max="0.65"
              step="0.01"
              value={input.targetPowderFactorKgTon}
              onChange={(e) => setInput({ ...input, targetPowderFactorKgTon: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>۰.۲۰ (سنگ نرم)</span>
              <span>۰.۴۰ (استاندارد معدن)</span>
              <span>۰.۶۵ (سنگ بسیار سخت)</span>
            </div>
          </div>
        </div>

        {/* ستون خروجی محاسبات اتوماتیک و لیست اقلام مورد نیاز (۷ ستون) */}
        <div className="lg:col-span-7 space-y-4">
          {/* کارت نتایج جامع محاسبات */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <BlockCodeDisplay code={input.blockCode} prefix="خروجی هوشمند محاسبات ناریه برای بلوک" className="text-amber-500 font-bold" />
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                محاسبه آنلاین
              </span>
            </div>

            {/* کارت‌های ۴ گانه خلاصه هندسی و تناژ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-500 block">حجم کل آتشباری</span>
                <span className="text-base font-black text-slate-800 dark:text-slate-100">
                  {calcResult.totalVolumeM3.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mr-1">مترمکعب (m³)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-500 block">تناژ کل سنگ خردشده</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400">
                  {calcResult.totalTonnage.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mr-1">تن (Ton)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-500 block">مجموع متراژ حفاری</span>
                <span className="text-base font-black text-slate-800 dark:text-slate-100">
                  {calcResult.totalDrillingMeters.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 mr-1">متر ({input.holeCount} چال)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-500 block">بار ویژه حجمی</span>
                <span className="text-base font-black text-purple-600 dark:text-purple-400">
                  {calcResult.calculatedPowderFactorKgM3}
                </span>
                <span className="text-[10px] text-slate-400 mr-1">kg/m³</span>
              </div>
            </div>

            {/* جدول دقیق مواد ناریه مورد نیاز جهت کسر از انبار */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">قلم ناریه</th>
                    <th className="py-2.5 px-3 font-bold">مقدار مورد نیاز</th>
                    <th className="py-2.5 px-3 font-bold">موجودی فعلی زاغه</th>
                    <th className="py-2.5 px-3 font-bold">وضعیت تأمین</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {/* آنفو */}
                  {calcResult.totalAnfoKg > 0 && (
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        آنفو صنعتی فله (ANFO)
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                        {calcResult.totalAnfoKg.toLocaleString()} kg
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {(items.find(i => i.code === 'EXP-ANFO-01')?.currentStock || 0).toLocaleString()} kg
                      </td>
                      <td className="py-2.5 px-3">
                        {calcResult.stockAvailability.hasEnoughAnfo ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 text-[11px] font-bold">
                            <CheckCircleIcon className="w-4 h-4" /> موجود است
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500 text-[11px] font-bold">
                            <ExclamationCircleIcon className="w-4 h-4" /> کسری موجودی
                          </span>
                        )}
                      </td>
                    </tr>
                  )}

                  {/* امولسیون */}
                  {calcResult.totalEmulsionKg > 0 && (
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        امولسیون فله ضدآب (Bulk Emulsion)
                      </td>
                      <td className="py-2.5 px-3 font-bold text-red-600 dark:text-red-400">
                        {calcResult.totalEmulsionKg.toLocaleString()} kg
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {(items.find(i => i.code === 'EXP-EMUL-BULK')?.currentStock || 0).toLocaleString()} kg
                      </td>
                      <td className="py-2.5 px-3">
                        {calcResult.stockAvailability.hasEnoughEmulsion ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 text-[11px] font-bold">
                            <CheckCircleIcon className="w-4 h-4" /> موجود است
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500 text-[11px] font-bold">
                            <ExclamationCircleIcon className="w-4 h-4" /> کسری موجودی
                          </span>
                        )}
                      </td>
                    </tr>
                  )}

                  {/* بوستر */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      بوستر پنتولیت ۵۰۰ گرمی (Pentolite 500g)
                    </td>
                    <td className="py-2.5 px-3 font-bold text-purple-600 dark:text-purple-400">
                      {calcResult.totalBoostersCount} عدد
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {(items.find(i => i.code === 'EXP-BST-500')?.currentStock || 0).toLocaleString()} عدد
                    </td>
                    <td className="py-2.5 px-3">
                      {calcResult.stockAvailability.hasEnoughBoosters ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 text-[11px] font-bold">
                          <CheckCircleIcon className="w-4 h-4" /> موجود است
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 text-[11px] font-bold">
                          <ExclamationCircleIcon className="w-4 h-4" /> کسری موجودی
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* چاشنی درون‌چالی نانل */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      چاشنی نانل درون‌چالی ۵۰۰ms
                    </td>
                    <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                      {calcResult.totalInHoleDetonatorsCount} شاخه
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {(items.find(i => i.code === 'EXP-NONEL-IN')?.currentStock || 0).toLocaleString()} شاخه
                    </td>
                    <td className="py-2.5 px-3">
                      {calcResult.stockAvailability.hasEnoughDetonators ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 text-[11px] font-bold">
                          <CheckCircleIcon className="w-4 h-4" /> موجود است
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 text-[11px] font-bold">
                          <ExclamationCircleIcon className="w-4 h-4" /> کسری موجودی
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* رابط سطحی نانل */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      رابط‌های سطحی نانل ۱۷ms / ۲۵ms
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">
                      {calcResult.totalSurfaceConnectorsCount} عدد
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {(items.find(i => i.code === 'EXP-NONEL-SURF-25')?.currentStock || 0).toLocaleString()} عدد
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-500 text-[11px] font-bold">
                        <CheckCircleIcon className="w-4 h-4" /> موجود است
                      </span>
                    </td>
                  </tr>

                  {/* کورتکس */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      فیتیله انفجاری / کورتکس (۱۰g/m)
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">
                      {calcResult.totalDetonatingCordMeters} متر
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {(items.find(i => i.code === 'EXP-CORD-10G')?.currentStock || 0).toLocaleString()} متر
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-500 text-[11px] font-bold">
                        <CheckCircleIcon className="w-4 h-4" /> موجود است
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* برآورد ریالی و هزینه ویژه هر تن استخراج */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    برآورد بهای تمام شده ناریه این بلوک:
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    مجموع هزینه‌های آنفو، بوستر، نانل و ترانک‌لاین
                  </span>
                </div>
              </div>
              <div className="text-left">
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {calcResult.estimatedTotalCostToman.toLocaleString()} تومان
                </div>
                <div className="text-[11px] text-slate-500">
                  ({calcResult.costPerTonRockToman.toLocaleString()} تومان به ازای هر تن سنگ خردشده)
                </div>
              </div>
            </div>

            {/* دکمه صدور حواله خروج و کسر آنی از انبار */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldExclamationIcon className="w-4 h-4 text-amber-500" />
                <span>با صدور حواله، مقادیر فوق بلافاصله از موجودی زاغه کسر و صورتجلسه رسمی صادر می‌گردد.</span>
              </div>

              <button
                onClick={() => setDispatchModalOpen(true)}
                disabled={calcResult.stockAvailability.missingItemsText && calcResult.stockAvailability.missingItemsText.length > 0}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-600/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <DocumentCheckIcon className="w-4 h-4" />
                <span className="flex items-center gap-1.5">
                  <span>تأیید و صدور حواله خروج ناریه به نام بلوک</span>
                  <BlockCodeDisplay code={input.blockCode} className="text-white font-bold" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* مودال تأیید و ثبت صورتجلسه مصرف ناریه بلوک */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <DocumentCheckIcon className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold">صدور رسمی حواله و صورتجلسه مصرف مواد ناریه</h3>
              </div>
              <button 
                onClick={() => setDispatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200">
                <span className="font-bold block mb-1">خلاصه اقلام تحویلی جهت خرج‌گذاری:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {calcResult.totalAnfoKg > 0 && <li>آنفو صنعتی: {calcResult.totalAnfoKg.toLocaleString()} کیلوگرم</li>}
                  {calcResult.totalEmulsionKg > 0 && <li>امولسیون فله: {calcResult.totalEmulsionKg.toLocaleString()} کیلوگرم</li>}
                  <li>بوستر پنتولیت ۵۰۰g: {calcResult.totalBoostersCount} عدد</li>
                  <li>چاشنی نانل درون‌چالی: {calcResult.totalInHoleDetonatorsCount} شاخه</li>
                  <li>رابط سطحی و کورتکس: {calcResult.totalSurfaceConnectorsCount} عدد و {calcResult.totalDetonatingCordMeters} متر</li>
                </ul>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">پیمانکار استخراج و آتشباری:</label>
                <input
                  type="text"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">مسئول فنی و استادکار آتشبار:</label>
                <input
                  type="text"
                  value={blasterName}
                  onChange={(e) => setBlasterName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">ناظر فنی و ژئوتکنیک:</label>
                  <input
                    type="text"
                    value={supervisionApprover}
                    onChange={(e) => setSupervisionApprover(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">نماینده مدیریت کارفرما:</label>
                  <input
                    type="text"
                    value={clientApprover}
                    onChange={(e) => setClientApprover(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">شماره پروانه / مجوز آتشباری (اختیاری):</label>
                <input
                  type="text"
                  placeholder="پیش‌فرض: خودکار تولید می‌شود"
                  value={customPermitNumber}
                  onChange={(e) => setCustomPermitNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">توضیحات و ملاحظات آتشباری:</label>
                <textarea
                  rows={2}
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="مثال: رعایت حریم ایمنی ماشین‌آلات، هماهنگی با بیسیم پیت..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDispatchModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={isSubmittingDispatch}
                onClick={handleConfirmDispatch}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmittingDispatch ? 'در حال ثبت...' : 'کسر از انبار و صدور صورتجلسه'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
