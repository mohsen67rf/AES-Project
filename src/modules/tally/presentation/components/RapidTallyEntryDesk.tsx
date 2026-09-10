// src/modules/tally/presentation/components/RapidTallyEntryDesk.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { 
  BlockRepository, 
  SubBlockRepository, 
  StockpileRepository 
} from '../../../../core/infrastructure/repositories';
import { EquipmentService } from '../../../equipment/services/EquipmentService';
import { HaulageTallyService, BlockWorkingFaceProgress } from '../../services/HaulageTallyService';
import type { SubBlock, Stockpile, Block } from '../../../../core/domain/types/mine.types';
import {
  TruckIcon,
  MapPinIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  PlusIcon,
  CalculatorIcon,
  SparklesIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface RapidTallyEntryDeskProps {
  initialBlockId?: string;
  initialSubBlockId?: string;
  onTripRecorded?: () => void;
  className?: string;
}

export const RapidTallyEntryDesk: React.FC<RapidTallyEntryDeskProps> = ({
  initialBlockId,
  initialSubBlockId,
  onTripRecorded,
  className = '',
}) => {
  const { isDark } = useTheme();

  // داده‌های پایه از ریپازیتوری‌ها
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [subBlocks, setSubBlocks] = useState<SubBlock[]>([]);
  const [stockpiles, setStockpiles] = useState<Stockpile[]>([]);
  
  // انتخاب‌های فرم
  const [selectedBlockId, setSelectedBlockId] = useState<string>(initialBlockId || '');
  const [selectedSubBlockId, setSelectedSubBlockId] = useState<string>(initialSubBlockId || '');
  const [selectedStockpileId, setSelectedStockpileId] = useState<string>('');
  
  // ناوگان حمل و بارگیری
  const [truckCode, setTruckCode] = useState<string>('DT-101');
  const [truckType, setTruckType] = useState<'TRUCK_100T' | 'TRUCK_60T' | 'TRUCK_35T' | 'TRUCK_15T' | 'CUSTOM'>('TRUCK_100T');
  const [nominalCapacity, setNominalCapacity] = useState<number>(100);
  const [loaderId, setLoaderId] = useState<string>('شاول هیتاچی EX-1200 #01');
  
  // متغیرهای سرویس
  const [tripCount, setTripCount] = useState<number>(1);
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING');
  const [materialType, setMaterialType] = useState<string>('کانسنگ پرعیار آهن (DSO)');
  const [notes, setNotes] = useState<string>('');
  
  // بازخورد و وضعیت عملیات
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastLoggedMessage, setLastLoggedMessage] = useState<string | null>(null);

  // بارگذاری اولیه داده‌ها
  const loadBaseData = () => {
    const loadedBlocks = BlockRepository.getAll();
    const loadedSubBlocks = SubBlockRepository.getAll();
    const loadedStockpiles = StockpileRepository.getAll();

    setBlocks(loadedBlocks);
    setSubBlocks(loadedSubBlocks);
    setStockpiles(loadedStockpiles);

    if (loadedBlocks.length > 0 && !selectedBlockId) {
      setSelectedBlockId(loadedBlocks[0].id);
    }
    if (loadedStockpiles.length > 0 && !selectedStockpileId) {
      setSelectedStockpileId(loadedStockpiles[0].id);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  // همگام‌سازی ساب‌بلوک‌های بلوک انتخاب‌شده
  const filteredSubBlocks = useMemo(() => {
    if (!selectedBlockId) return subBlocks;
    return subBlocks.filter(sb => sb.blockId === selectedBlockId);
  }, [selectedBlockId, subBlocks]);

  useEffect(() => {
    if (filteredSubBlocks.length > 0) {
      if (!selectedSubBlockId || !filteredSubBlocks.some(sb => sb.id === selectedSubBlockId)) {
        setSelectedSubBlockId(filteredSubBlocks[0].id);
      }
    } else {
      setSelectedSubBlockId('');
    }
  }, [filteredSubBlocks, selectedSubBlockId]);

  // دریافت اطلاعات جاری ساب‌بلوک انتخاب‌شده جهت نمایش حجم قبل از ثبت
  const currentSubBlock = useMemo(() => {
    return subBlocks.find(sb => sb.id === selectedSubBlockId);
  }, [subBlocks, selectedSubBlockId]);

  const currentBlock = useMemo(() => {
    return blocks.find(b => b.id === selectedBlockId);
  }, [blocks, selectedBlockId]);

  const currentStockpile = useMemo(() => {
    return stockpiles.find(st => st.id === selectedStockpileId);
  }, [stockpiles, selectedStockpileId]);

  // تنظیم خودکار جنس ماده بر اساس مقصد و ساب‌بلوک
  useEffect(() => {
    if (currentStockpile) {
      if (currentStockpile.type === 'WASTE_DUMP') {
        setMaterialType('باطله سنگی پیت');
      } else if (currentStockpile.type === 'CRUSHER_BIN') {
        setMaterialType('خوراک مستقیم سنگ‌شکن');
      } else if (currentStockpile.type === 'HIGH_GRADE_ROM') {
        setMaterialType('کانسنگ پرعیار مگنتیت (DSO)');
      } else {
        setMaterialType('کانسنگ متوسط‌عیار');
      }
    }
  }, [currentStockpile]);

  // تغییر ظرفیت تراک با تغییر نوع تراک
  const handleTruckTypeChange = (type: typeof truckType) => {
    setTruckType(type);
    switch (type) {
      case 'TRUCK_100T': setNominalCapacity(100); break;
      case 'TRUCK_60T': setNominalCapacity(60); break;
      case 'TRUCK_35T': setNominalCapacity(35); break;
      case 'TRUCK_15T': setNominalCapacity(15); break;
      default: break;
    }
  };

  // محاسبات آنی تناژ و حجم کسر شونده
  const calculatedTonnage = tripCount * nominalCapacity;
  const density = currentSubBlock?.density || currentBlock?.density || 2.95;
  const calculatedVolumeM3 = Number((calculatedTonnage / density).toFixed(1));

  // پیش‌نمایش باقی‌مانده ساب‌بلوک پس از ثبت
  const subBlockInitialTon = currentSubBlock?.estimatedTonnage || currentSubBlock?.tonnage || 5000;
  const subBlockCurrentHauled = currentSubBlock?.loadingData?.tonnage || 0;
  const subBlockRemainingNow = Math.max(0, subBlockInitialTon - subBlockCurrentHauled);
  const subBlockRemainingAfter = Math.max(0, subBlockRemainingNow - calculatedTonnage);
  const subBlockRemainingVolAfter = Number((subBlockRemainingAfter / density).toFixed(1));

  // ثبت فرم سرویس
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubBlockId || !selectedStockpileId) {
      alert('لطفاً جبهه‌کار/ساب‌بلوک مبدأ و مقصد بار را انتخاب کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = HaulageTallyService.recordHaulageService({
        subBlockId: selectedSubBlockId,
        stockpileId: selectedStockpileId,
        truckCode,
        truckType,
        nominalCapacity,
        tripCount,
        loaderId,
        shift,
        materialType,
        recordedBy: 'کنترل‌چی دیسپاچینگ شیفت',
        notes: notes.trim() || undefined,
      });

      // پیام تأیید موفقیت
      const msg = `سرویس با موفقیت ثبت شد: ${calculatedTonnage.toLocaleString('fa-IR')} تن (${calculatedVolumeM3} m³) از ${currentBlock?.code} ساب ${currentSubBlock?.code} کسر و به ${result.updatedStockpile.name} افزوده گردید.`;
      setLastLoggedMessage(msg);
      loadBaseData();
      if (onTripRecorded) onTripRecorded();

      // پنهان کردن پیام پس از چند ثانیه
      setTimeout(() => {
        setLastLoggedMessage(null);
      }, 7000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'خطا در ثبت سرویس باربری');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
    } ${className}`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
            <TruckIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
              <span>میز ثبت سریع سرویس‌شمار باربری (Tally Station)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                Real-time Sync
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              ثبت مستقیم هر سرویس حمل توسط واحد کنترل‌چی، کسر آنی از حجم جبهه‌کار و افزایش به دامپ مقصد
            </p>
          </div>
        </div>

        {/* Shift Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">شیفت:</span>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value as any)}
            className={`py-1 px-2.5 rounded-xl text-xs font-bold border ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="MORNING">شیفت صبح (۰۶:۰۰ الی ۱۴:۰۰)</option>
            <option value="EVENING">شیفت عصر (۱۴:۰۰ الی ۲۲:۰۰)</option>
            <option value="NIGHT">شیفت شب (۲۲:۰۰ الی ۰۶:۰۰)</option>
          </select>
        </div>
      </div>

      {/* Success Notification Alert */}
      {lastLoggedMessage && (
        <div className="p-3 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="font-bold">{lastLoggedMessage}</span>
        </div>
      )}

      {/* Main Entry Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
        {/* Row 1: مبدأ (جبهه‌کار، بلوک، ساب‌بلوک) و مقصد (دامپ یا دپو) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ستون مبدأ: جبهه‌کار و ساب‌بلوک */}
          <div className={`p-3.5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                <MapPinIcon className="w-4 h-4" />
                <span>۱. مبدأ بارگیری (جبهه‌کار و بلوک)</span>
              </span>
              {currentBlock && (
                <span className="text-[10px] font-mono text-slate-400">
                  تراز پله: {currentBlock.targetLevel}m
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">انتخاب بلوک استخراجی:</label>
                <select
                  value={selectedBlockId}
                  onChange={(e) => setSelectedBlockId(e.target.value)}
                  className={`w-full p-2 rounded-xl text-xs font-bold border ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  {blocks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name} (پله {b.targetLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">ساب‌بلوک جبهه‌کار:</label>
                <select
                  value={selectedSubBlockId}
                  onChange={(e) => setSelectedSubBlockId(e.target.value)}
                  className={`w-full p-2 rounded-xl text-xs font-black border ${
                    isDark ? 'bg-slate-900 border-slate-700 text-cyan-300' : 'bg-white border-slate-300 text-cyan-700'
                  }`}
                >
                  {filteredSubBlocks.map(sb => (
                    <option key={sb.id} value={sb.id}>
                      {sb.code} (باقی‌مانده: {Math.max(0, (sb.estimatedTonnage || 5000) - (sb.loadingData?.tonnage || 0)).toLocaleString('fa-IR')} تن)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* نوار وضعیت حجم و تناژ فعلی ساب‌بلوک */}
            {currentSubBlock && (
              <div className={`p-2.5 rounded-xl border text-[11px] ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>وضعیت حجم ساب‌بلوک {currentSubBlock.code}:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {subBlockRemainingNow.toLocaleString('fa-IR')} تن باقی‌مانده
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, (subBlockCurrentHauled / subBlockInitialTon) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ستون مقصد: دامپ باطله، دپوی کانسنگ یا سنگ‌شکن */}
          <div className={`p-3.5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <ArchiveBoxIcon className="w-4 h-4" />
                <span>۲. مقصد تخلیه (دامپ یا دپو)</span>
              </span>
              {currentStockpile && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                  {currentStockpile.type === 'WASTE_DUMP' ? 'دامپ باطله' : 'دپوی کانسنگ'}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">انتخاب دامپ / دپوی مقصد:</label>
              <select
                value={selectedStockpileId}
                onChange={(e) => setSelectedStockpileId(e.target.value)}
                className={`w-full p-2 rounded-xl text-xs font-bold border ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                {stockpiles.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} (موجودی فعلی: {(st.currentTonnage || 0).toLocaleString('fa-IR')} تن)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">نوع ماده استخراجی:</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className={`w-full p-2 rounded-xl text-xs font-bold border ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="کانسنگ پرعیار آهن (DSO)">کانسنگ پرعیار آهن (DSO - Fe &gt; 58%)</option>
                <option value="کانسنگ متوسط‌عیار مگنتیت">کانسنگ متوسط‌عیار مگنتیت (Fe 50-58%)</option>
                <option value="کانسنگ کم‌عیار خردایش">کانسنگ کم‌عیار خردایش (Fe 42-50%)</option>
                <option value="خوراک مستقیم سنگ‌شکن">خوراک مستقیم سنگ‌شکن فکی</option>
                <option value="باطله سنگی پیت">باطله سنگی پیت (Waste Rock)</option>
                <option value="باطله آبرفتی و خاک هوازده">باطله آبرفتی و روباره (Overburden)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: ماشین‌آلات (تراک و شاول) و تعداد سرویس */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
            <CalculatorIcon className="w-4 h-4 text-emerald-400" />
            <span>۳. مشخصات ناوگان و ثبت تعداد سرویس</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* تراک حمل */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">کد تراک حمل:</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={truckCode}
                  onChange={(e) => setTruckCode(e.target.value.toUpperCase())}
                  placeholder="مثال: DT-101"
                  className={`w-full p-2 rounded-xl text-xs font-black font-mono border ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              {/* دکمه‌های سریع تراک‌ها */}
              <div className="flex gap-1 mt-1.5">
                {['DT-101', 'DT-102', 'DT-103', 'DT-104'].map((tCode) => (
                  <button
                    key={tCode}
                    type="button"
                    onClick={() => setTruckCode(tCode)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${
                      truckCode === tCode
                        ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400'
                        : isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-700'
                    }`}
                  >
                    {tCode}
                  </button>
                ))}
              </div>
            </div>

            {/* ظرفیت اسمی ناوگان */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">ظرفیت تراک (تن):</label>
              <div className="grid grid-cols-3 gap-1">
                {(['TRUCK_100T', 'TRUCK_60T', 'TRUCK_35T'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTruckTypeChange(t)}
                    className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                      truckType === t
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {t === 'TRUCK_100T' ? '۱۰۰ تن' : t === 'TRUCK_60T' ? '۶۰ تن' : '۳۵ تن'}
                  </button>
                ))}
              </div>
              <div className="mt-1 text-[10px] text-slate-400 font-mono text-center">
                ظرفیت محاسبه: {nominalCapacity} تن در هر سرویس
              </div>
            </div>

            {/* شاول / بارگیر مستقر در جبهه‌کار */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">شاول / لودر بارگیر:</label>
              <select
                value={loaderId}
                onChange={(e) => setLoaderId(e.target.value)}
                className={`w-full p-2 rounded-xl text-xs font-bold border ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="شاول هیتاچی EX-1200 #01">شاول هیتاچی EX-1200 #01</option>
                <option value="بیل کوماتسو PC-1250 #02">بیل کوماتسو PC-1250 #02</option>
                <option value="لودر کوماتسو WA-600 #01">لودر کوماتسو WA-600 #01</option>
                <option value="شاول کاترپیلار CAT-390 #03">شاول کاترپیلار CAT-390 #03</option>
              </select>
            </div>

            {/* تعداد سرویس + دکمه‌های سریع */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">تعداد سرویس تخلیه:</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTripCount(Math.max(1, tripCount - 1))}
                  className={`w-8 h-8 rounded-xl font-black text-sm border flex items-center justify-center ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-200 border-slate-300 text-slate-800'
                  }`}
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={tripCount}
                  onChange={(e) => setTripCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-16 text-center p-1.5 rounded-xl font-mono font-black text-sm border ${
                    isDark ? 'bg-slate-900 border-slate-700 text-amber-300' : 'bg-white border-slate-300 text-amber-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setTripCount(tripCount + 1)}
                  className={`w-8 h-8 rounded-xl font-black text-sm border flex items-center justify-center ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-200 border-slate-300 text-slate-800'
                  }`}
                >
                  +
                </button>

                {/* دکمه‌های میانبر +۱, +۲, +۵ */}
                <div className="flex gap-1">
                  {[1, 2, 5].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTripCount(amt)}
                      className={`px-1.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                        tripCount === amt
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-700'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Calculation Strip before Submission */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDark ? 'bg-cyan-950/25 border-cyan-800/40' : 'bg-cyan-50 border-cyan-200'
        }`}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <SparklesIcon className="w-4 h-4 text-cyan-400" />
              <span>محاسبه دینامیک کسر از حجم جبهه‌کار:</span>
            </span>
            <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
              <span>تناژ محاسبه‌شده: <strong className="font-mono text-cyan-300">{calculatedTonnage.toLocaleString('fa-IR')} تن</strong></span>
              <span>حجم کسر شونده: <strong className="font-mono text-amber-300">{calculatedVolumeM3.toLocaleString('fa-IR')} m³</strong></span>
              <span>باقی‌مانده پس از ثبت: <strong className="font-mono text-emerald-300">{subBlockRemainingAfter.toLocaleString('fa-IR')} تن</strong></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>{isSubmitting ? 'در حال ثبت و کسر حجم...' : 'ثبت سرویس و کسر از حجم بلوک'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
