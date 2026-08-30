// src/modules/mine/presentation/components/Stockpiles/DynamicStockpileTab.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TruckIcon, 
  ArchiveBoxIcon, 
  ArrowPathIcon, 
  PlusCircleIcon, 
  ChartBarIcon, 
  SparklesIcon,
  CalculatorIcon,
  Cog6ToothIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  StockpileRepository, 
  SubBlockRepository, 
  HaulageTripRepository 
} from '../../../../../core/infrastructure/repositories';
import { StockpileService } from '../../../services/StockpileService';
import type { Stockpile, HaulageTrip, SubBlock, StakeholderRole } from '../../../../../core/domain/types/mine.types';

interface DynamicStockpileTabProps {
  stakeholderRole?: StakeholderRole;
}

export function DynamicStockpileTab({ stakeholderRole = 'ALL' }: DynamicStockpileTabProps) {
  const [stockpiles, setStockpiles] = useState<Stockpile[]>([]);
  const [trips, setTrips] = useState<HaulageTrip[]>([]);
  const [subBlocks, setSubBlocks] = useState<SubBlock[]>([]);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isCrusherFeedOpen, setIsCrusherFeedOpen] = useState(false);

  // فرم ثبت سرویس‌های حمل ماشین‌آلات
  const [selectedSubBlockId, setSelectedSubBlockId] = useState('');
  const [selectedStockpileId, setSelectedStockpileId] = useState('');
  const [truckType, setTruckType] = useState<'TRUCK_100T' | 'TRUCK_60T' | 'TRUCK_35T' | 'TRUCK_15T' | 'CUSTOM'>('TRUCK_100T');
  const [customCapacity, setCustomCapacity] = useState(100);
  const [tripCount, setTripCount] = useState(25);
  const [loaderId, setLoaderId] = useState('شاول هیتاچی EX-1200 #01');
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING');
  const [notes, setNotes] = useState('');

  // فرم فید سنگ‌شکن (خروجی دپو)
  const [feedStockpileId, setFeedStockpileId] = useState('');
  const [feedTonnage, setFeedTonnage] = useState(3000);
  const [crusherLine, setCrusherLine] = useState('خط ۱ سنگ‌شکن فکی اولیه');

  const loadData = () => {
    const stks = StockpileService.getAllStockpiles();
    setStockpiles(stks);
    setTrips(StockpileService.getAllHaulageTrips());
    const allSbs = SubBlockRepository.getAll();
    setSubBlocks(allSbs);

    if (stks.length > 0 && !selectedStockpileId) {
      setSelectedStockpileId(stks[0].id);
      setFeedStockpileId(stks[0].id);
    }
    if (allSbs.length > 0 && !selectedSubBlockId) {
      setSelectedSubBlockId(allSbs[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // محاسبه ظرفیت فعلی انتخابی برای فرم
  const currentCapacity = useMemo(() => {
    switch (truckType) {
      case 'TRUCK_100T': return 100;
      case 'TRUCK_60T': return 60;
      case 'TRUCK_35T': return 35;
      case 'TRUCK_15T': return 15;
      default: return customCapacity;
    }
  }, [truckType, customCapacity]);

  // ثبت سرویس حمل
  const handleRecordTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubBlockId || !selectedStockpileId) return;

    StockpileService.recordHaulageTrip({
      subBlockId: selectedSubBlockId,
      stockpileId: selectedStockpileId,
      truckType,
      nominalCapacity: currentCapacity,
      tripCount: Number(tripCount),
      loaderId,
      shift,
      recordedBy: 'پیمانکار استخراج (دیسپاچینگ)',
      notes,
    });

    setIsTripModalOpen(false);
    loadData();
  };

  // ثبت فید سنگ‌شکن (کسر از دپو)
  const handleRecordFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedStockpileId) return;

    StockpileService.recordCrusherFeedOutflow({
      stockpileId: feedStockpileId,
      tonnage: Number(feedTonnage),
      crusherLine,
      operator: 'پیمانکار خردایش (مسئول فید سنگ‌شکن)',
    });

    setIsCrusherFeedOpen(false);
    loadData();
  };

  // خلاصه کل موجودی دپوها
  const totalInventory = useMemo(() => {
    const totalTons = stockpiles.reduce((sum, s) => sum + s.currentTonnage, 0);
    const totalInflow = stockpiles.reduce((sum, s) => sum + (s.totalInflowTonnage || 0), 0);
    const totalOutflow = stockpiles.reduce((sum, s) => sum + (s.totalOutflowTonnage || 0), 0);
    return { totalTons, totalInflow, totalOutflow };
  }, [stockpiles]);

  return (
    <div className="space-y-6">
      {/* سربرگ ماژول */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              مراحل ۱۰ و ۱۱ چرخه کاری
            </span>
            <h3 className="text-lg font-bold text-white">برآورد تناژ با سرویس‌شمار و مدیریت دینامیک دپوها</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            محاسبه خودکار تناژ بر اساس (تعداد سرویس‌ها × میانگین تناژ تراک‌های ۱۰۰، ۶۰، ۳۵ و ۱۵ تنی) و بالانس زنده موجودی دپوها
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="بروزرسانی"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>

          {(stakeholderRole === 'ALL' || stakeholderRole === 'MINING_CONTRACTOR') && (
            <button
              onClick={() => setIsTripModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all duration-200"
            >
              <TruckIcon className="w-4 h-4" />
              <span>ثبت سرویس حمل تراک (پیمانکار استخراج)</span>
            </button>
          )}

          {(stakeholderRole === 'ALL' || stakeholderRole === 'CRUSHING_CONTRACTOR') && (
            <button
              onClick={() => setIsCrusherFeedOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all duration-200"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              <span>ثبت فید به سنگ‌شکن (کسر از دپو)</span>
            </button>
          )}
        </div>
      </div>

      {/* خلاصه کل موجودی */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex items-center gap-3 shadow-lg">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ArchiveBoxIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">کل موجودی دپوهای فعال</div>
            <div className="text-xl font-black text-white font-mono mt-0.5">
              {totalInventory.totalTons.toLocaleString()} <span className="text-xs font-normal text-slate-400">تن</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex items-center gap-3 shadow-lg">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <TruckIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">مجموع بارریزی ماهانه (Inflow)</div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
              +{totalInventory.totalInflow.toLocaleString()} <span className="text-xs font-normal text-slate-400">تن</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex items-center gap-3 shadow-lg">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Cog6ToothIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">مجموع فید به سنگ‌شکن (Outflow)</div>
            <div className="text-xl font-black text-purple-400 font-mono mt-0.5">
              -{totalInventory.totalOutflow.toLocaleString()} <span className="text-xs font-normal text-slate-400">تن</span>
            </div>
          </div>
        </div>
      </div>

      {/* کارت‌های دپوهای فعال و عیار متوسط وزنی */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stockpiles.map((stk) => {
          const fillPercentage = Math.min(100, Math.round((stk.currentTonnage / stk.capacityTonnage) * 100));

          return (
            <div
              key={stk.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 hover:shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-800/50">
                    {stk.code}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{stk.name}</h4>
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-cyan-300 font-mono">Fe: {stk.weightedAvgFe}%</span>
                  <div className="text-[10px] text-slate-500">میانگین وزنی</div>
                </div>
              </div>

              {/* نوار ظرفیت */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>موجودی فعلی: <strong className="text-white font-mono">{stk.currentTonnage.toLocaleString()}</strong> تن</span>
                  <span>ظرفیت: {stk.capacityTonnage.toLocaleString()} تن</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>
              </div>

              {/* معادله بالانس دینامیک */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] space-y-1">
                <div className="text-slate-500 font-semibold">بالانس دینامیک موجودی:</div>
                <div className="flex items-center justify-between text-slate-300 font-mono">
                  <span>موجودی پایه:</span>
                  <span>{stk.initialTonnage.toLocaleString()} t</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 font-mono">
                  <span>+ بارریزی ساب‌ها ({stk.activeSubBlocksCount} ساب):</span>
                  <span>+{(stk.totalInflowTonnage || 0).toLocaleString()} t</span>
                </div>
                <div className="flex items-center justify-between text-purple-400 font-mono">
                  <span>- فید به سنگ‌شکن:</span>
                  <span>-{(stk.totalOutflowTonnage || 0).toLocaleString()} t</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* جدول آخرین سرویس‌های ماشین‌آلات حمل */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TruckIcon className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-white">آخرین رکوردهای سرویس‌شمار دیسپاچینگ و بارریزی</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">{trips.length} رکورد ثبت شده</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">ساب‌بلوک مبدأ</th>
                <th className="p-3">دپوی مقصد</th>
                <th className="p-3">نوع ناوگان</th>
                <th className="p-3">ظرفیت میانگین</th>
                <th className="p-3">تعداد سرویس</th>
                <th className="p-3">تناژ کل تخلیه شده</th>
                <th className="p-3">لودر / شاول</th>
                <th className="p-3">شیفت</th>
                <th className="p-3">زمان ثبت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {trips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-cyan-400">{t.subBlockCode}</td>
                  <td className="p-3 text-white">{t.stockpileName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-amber-500/20 font-mono">
                      {t.truckType === 'TRUCK_100T' ? 'تراک ۱۰۰ تنی' : t.truckType === 'TRUCK_60T' ? 'تراک ۶۰ تنی' : t.truckType === 'TRUCK_35T' ? 'تراک ۳۵ تنی' : 'کامیون ۱۵ تنی'}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{t.nominalCapacity} تن</td>
                  <td className="p-3 font-mono font-bold text-white">{t.tripCount} سرویس</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{t.calculatedTonnage.toLocaleString()} تن</td>
                  <td className="p-3 text-slate-400">{t.loaderId}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                      {t.shift === 'MORNING' ? 'صبح' : t.shift === 'EVENING' ? 'عصر' : 'شب'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">
                    {new Date(t.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال ثبت سرویس حمل ماشین‌آلات */}
      {isTripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-amber-500/30 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TruckIcon className="w-6 h-6 text-amber-400" />
                <h3 className="text-base font-bold text-white">ثبت سرویس‌های ناوگان حمل (مرحله ۱۰)</h3>
              </div>
              <button onClick={() => setIsTripModalOpen(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleRecordTrip} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">انتخاب ساب‌بلوک مبدأ:</label>
                  <select
                    value={selectedSubBlockId}
                    onChange={(e) => setSelectedSubBlockId(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-cyan-400 font-mono font-bold focus:border-amber-500 outline-none"
                  >
                    {subBlocks.map((sb) => (
                      <option key={sb.id} value={sb.id}>
                        {sb.code} (عیار Fe: {sb.labResults?.fe || 'نامشخص'}%)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">دپوی مقصد تخلیه:</label>
                  <select
                    value={selectedStockpileId}
                    onChange={(e) => setSelectedStockpileId(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 outline-none"
                  >
                    {stockpiles.map((stk) => (
                      <option key={stk.id} value={stk.id}>
                        {stk.name} ({stk.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* انتخاب نوع ماشین‌آلات حمل */}
              <div>
                <label className="block text-slate-400 mb-1">تیپ و ظرفیت ماشین‌آلات حمل:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'TRUCK_100T', label: 'تراک ۱۰۰ تنی', cap: 100 },
                    { id: 'TRUCK_60T', label: 'تراک ۶۰ تنی', cap: 60 },
                    { id: 'TRUCK_35T', label: 'تراک ۳۵ تنی', cap: 35 },
                    { id: 'TRUCK_15T', label: 'کامیون ۱۵ تنی', cap: 15 },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTruckType(t.id as any)}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        truckType === t.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="text-[11px]">{t.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{t.cap} تن میانگین</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">تعداد کل سرویس‌ها:</label>
                  <input
                    type="number"
                    min="1"
                    value={tripCount}
                    onChange={(e) => setTripCount(Number(e.target.value))}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono text-sm font-bold focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">شاول / لودر بارگیری:</label>
                  <input
                    type="text"
                    value={loaderId}
                    onChange={(e) => setLoaderId(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">شیفت کاری:</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-amber-500 outline-none"
                  >
                    <option value="MORNING">صبح</option>
                    <option value="EVENING">عصر</option>
                    <option value="NIGHT">شب</option>
                  </select>
                </div>
              </div>

              {/* محاسبه تناژ خودکار */}
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalculatorIcon className="w-5 h-5 text-amber-400" />
                  <span className="text-slate-300">محاسبه تناژ تخمینی بارریزی:</span>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-amber-400 font-mono">
                    {(tripCount * currentCapacity).toLocaleString()} تن
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {tripCount} سرویس × {currentCapacity} تن
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTripModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  ثبت سرویس و بازمحاسبه دپو
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال فید سنگ‌شکن */}
      {isCrusherFeedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-purple-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cog6ToothIcon className="w-6 h-6 text-purple-400" />
                <h3 className="text-base font-bold text-white">ثبت فید سنگ‌شکن (کسر از دپو - مرحله ۱۱)</h3>
              </div>
              <button onClick={() => setIsCrusherFeedOpen(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleRecordFeed} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">انتخاب دپوی منبع خوراک:</label>
                <select
                  value={feedStockpileId}
                  onChange={(e) => setFeedStockpileId(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-purple-500 outline-none"
                >
                  {stockpiles.map((stk) => (
                    <option key={stk.id} value={stk.id}>
                      {stk.name} (موجودی فعلی: {stk.currentTonnage.toLocaleString()} تن)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">تناژ برداشتی (تن):</label>
                  <input
                    type="number"
                    value={feedTonnage}
                    onChange={(e) => setFeedTonnage(Number(e.target.value))}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-purple-400 font-mono font-bold text-sm focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">خط سنگ‌شکن مقصد:</label>
                  <input
                    type="text"
                    value={crusherLine}
                    onChange={(e) => setCrusherLine(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCrusherFeedOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20"
                >
                  ثبت خروجی و اعمال در موجودی دپو
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
