// src/modules/tally/presentation/pages/TallyControllerPage.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from '../../../../shared/components/Sidebar/Sidebar';
import { AppHeader } from '../../../../shared/components/Header/AppHeader';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { 
  HaulageTallyService, 
  BlockWorkingFaceProgress, 
  ShiftTallySummary 
} from '../../services/HaulageTallyService';
import { RapidTallyEntryDesk } from '../components/RapidTallyEntryDesk';
import { WorkingFaceProgressCard } from '../components/WorkingFaceProgressCard';
import { 
  StockpileRepository, 
  HaulageTripRepository,
  initializeRepositories 
} from '../../../../core/infrastructure/repositories';
import type { HaulageTrip, Stockpile } from '../../../../core/domain/types/mine.types';
import {
  ClipboardDocumentCheckIcon,
  TruckIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export const TallyControllerPage: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  // داده‌های پویا
  const [facesProgress, setFacesProgress] = useState<BlockWorkingFaceProgress[]>([]);
  const [shiftSummary, setShiftSummary] = useState<ShiftTallySummary>(() => HaulageTallyService.getShiftTallySummary());
  const [recentTrips, setRecentTrips] = useState<HaulageTrip[]>([]);
  const [stockpiles, setStockpiles] = useState<Stockpile[]>([]);
  
  // فیلترها و تب‌های صفحه
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WORKING_FACES' | 'DUMPS_BALANCE' | 'TRIP_LOG'>('OVERVIEW');
  const [tripSearch, setTripSearch] = useState('');
  const [selectedBlockForLog, setSelectedBlockForLog] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAllData = useCallback(() => {
    setIsRefreshing(true);
    try {
      initializeRepositories();
      const loadedFaces = HaulageTallyService.getAllWorkingFacesProgress();
      setFacesProgress(loadedFaces);
      setShiftSummary(HaulageTallyService.getShiftTallySummary());
      
      const allTrips = HaulageTripRepository.getAll().sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setRecentTrips(allTrips);
      setStockpiles(StockpileRepository.getAll());
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  }, []);

  useEffect(() => {
    refreshAllData();

    // گوش دادن به تغییرات سرویس‌شمار و جبهه‌کارها
    const handleUpdate = () => {
      refreshAllData();
    };

    window.addEventListener('haulageTripRecorded', handleUpdate);
    window.addEventListener('blockProgressUpdated', handleUpdate);
    window.addEventListener('stockpileUpdated', handleUpdate);

    return () => {
      window.removeEventListener('haulageTripRecorded', handleUpdate);
      window.removeEventListener('blockProgressUpdated', handleUpdate);
      window.removeEventListener('stockpileUpdated', handleUpdate);
    };
  }, [refreshAllData]);

  // فیلتر سفرهای اخیر
  const filteredTrips = useMemo(() => {
    return recentTrips.filter(t => {
      const matchSearch = !tripSearch || 
        t.truckCode?.toLowerCase().includes(tripSearch.toLowerCase()) ||
        t.subBlockCode?.toLowerCase().includes(tripSearch.toLowerCase()) ||
        t.stockpileName?.toLowerCase().includes(tripSearch.toLowerCase()) ||
        t.loaderId?.toLowerCase().includes(tripSearch.toLowerCase());
      return matchSearch;
    });
  }, [recentTrips, tripSearch]);

  const handleQuickLogFromCard = (blockId: string) => {
    setSelectedBlockForLog(blockId);
    // اسکرول نرم به فرم ثبت سرویس
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${
      isDark ? 'bg-[#070B1A] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* منوی کناری */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="tally-dispatch"
      />

      {/* محتوای اصلی */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Banner */}
          <div className={`p-5 rounded-3xl border relative overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-r from-[#141F42] via-[#0F172A] to-[#141F42] border-[#24356B]/40 shadow-lg' 
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black shadow-inner">
                  <ClipboardDocumentCheckIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-black text-slate-100">
                      {isRtl ? 'میز کار کنترل‌چی و سرویس‌شمار باربری' : 'Haulage Tally & Dispatch Controller Desk'}
                    </h1>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      شیفت جاری ({shiftSummary.shift === 'MORNING' ? 'صبح' : shiftSummary.shift === 'EVENING' ? 'عصر' : 'شب'})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    ثبت لحظه‌ای سرویس‌های تراک‌ها و بارگیرها، کسر خودکار حجم و تناژ از بلوک‌ها و ساب‌بلوک‌ها، و رصد پویای پیشرفت جبهه‌کارها در طول شیفت
                  </p>
                </div>
              </div>

              {/* Actions & Refresh */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={refreshAllData}
                  disabled={isRefreshing}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>{isRefreshing ? 'در حال همگام‌سازی...' : 'به‌روزرسانی داده‌ها'}</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Strip for Current Shift */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-800/60">
              <div className={`p-3 rounded-2xl border text-center ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 block font-bold">کل سرویس‌های شیفت</span>
                <span className="text-xl font-black font-mono text-amber-400 mt-0.5 block">
                  {shiftSummary.totalTrips.toLocaleString('fa-IR')}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">سرویس تراک</span>
              </div>

              <div className={`p-3 rounded-2xl border text-center ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 block font-bold">تناژ کل حمل‌شده</span>
                <span className="text-xl font-black font-mono text-cyan-400 mt-0.5 block">
                  {shiftSummary.totalTonnageHauled.toLocaleString('fa-IR')}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">تن سنگ و باطله</span>
              </div>

              <div className={`p-3 rounded-2xl border text-center ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 block font-bold">حجم کل کسرشده</span>
                <span className="text-xl font-black font-mono text-purple-400 mt-0.5 block">
                  {shiftSummary.totalVolumeM3Hauled.toLocaleString('fa-IR')}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">متر مکعب (m³)</span>
              </div>

              <div className={`p-3 rounded-2xl border text-center ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 block font-bold">کانسنگ استخراجی</span>
                <span className="text-xl font-black font-mono text-emerald-400 mt-0.5 block">
                  {shiftSummary.oreTonnage.toLocaleString('fa-IR')}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">تن به دپو/سنگ‌شکن</span>
              </div>

              <div className={`p-3 rounded-2xl border text-center ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 block font-bold">باطله‌برداری پیت</span>
                <span className="text-xl font-black font-mono text-orange-400 mt-0.5 block">
                  {shiftSummary.wasteTonnage.toLocaleString('fa-IR')}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">تن به دامپ‌های باطله</span>
              </div>

              <div className={`p-3 rounded-2xl border text-center ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 block font-bold">ناوگان فعال شیفت</span>
                <span className="text-xl font-black font-mono text-slate-200 mt-0.5 block">
                  {shiftSummary.activeTrucksCount}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">تراک در ۲ جبهه‌کار</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'OVERVIEW'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
              <span>میز ثبت سرویس و پیشرفت جبهه‌کارها</span>
            </button>

            <button
              onClick={() => setActiveTab('WORKING_FACES')}
              className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'WORKING_FACES'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPinIcon className="w-4 h-4" />
              <span>رصد پویای جبهه‌کارها ({facesProgress.length} جبهه‌کار)</span>
            </button>

            <button
              onClick={() => setActiveTab('DUMPS_BALANCE')}
              className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'DUMPS_BALANCE'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArchiveBoxIcon className="w-4 h-4" />
              <span>موجودی دامپ‌ها و دپوهای مقصد ({stockpiles.length} دپو)</span>
            </button>

            <button
              onClick={() => setActiveTab('TRIP_LOG')}
              className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'TRIP_LOG'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <span>دفتر ثبت سرویس‌شمار شیفت ({recentTrips.length} رکورد)</span>
            </button>
          </div>

          {/* Tab 1: OVERVIEW (Desk + Faces Cards) */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* بخش ۱: میز ثبت سریع سرویس‌شمار */}
              <RapidTallyEntryDesk
                initialBlockId={selectedBlockForLog}
                onTripRecorded={refreshAllData}
              />

              {/* بخش ۲: نمایش کارت‌های پیشرفت جبهه‌کارهای فعال با دایره و نوار پیشرفت */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <h2 className="text-sm font-black text-slate-200">
                      رصد پویای پیشرفت جبهه‌کارها در طول شیفت
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    به‌روزرسانی خودکار با هر سرویس ثبت‌شده
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {facesProgress.map(face => (
                    <WorkingFaceProgressCard
                      key={face.blockId}
                      progress={face}
                      onQuickLogTrip={handleQuickLogFromCard}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: WORKING FACES ONLY */}
          {activeTab === 'WORKING_FACES' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {facesProgress.map(face => (
                  <WorkingFaceProgressCard
                    key={face.blockId}
                    progress={face}
                    onQuickLogTrip={handleQuickLogFromCard}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: DUMPS & STOCKPILES BALANCE */}
          {activeTab === 'DUMPS_BALANCE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stockpiles.map(st => {
                  const isWaste = st.type === 'WASTE_DUMP';
                  return (
                    <div
                      key={st.id}
                      className={`p-4 rounded-2xl border space-y-3 ${
                        isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                            isWaste ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                          }`}>
                            <ArchiveBoxIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-200">{st.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">کد: {st.code}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isWaste ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                        }`}>
                          {isWaste ? 'دامپ باطله' : 'دپوی کانسنگ'}
                        </span>
                      </div>

                      {/* Numbers */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="text-[9px] text-slate-400 block">موجودی فعلی</span>
                          <span className="text-sm font-black font-mono text-cyan-400">
                            {(st.currentTonnage || 0).toLocaleString('fa-IR')} تن
                          </span>
                        </div>
                        <div className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="text-[9px] text-slate-400 block">ورودی تجمعی</span>
                          <span className="text-sm font-black font-mono text-emerald-400">
                            {(st.totalInflowTonnage || 0).toLocaleString('fa-IR')} تن
                          </span>
                        </div>
                      </div>

                      {/* Extra info if Ore Stockpile */}
                      {!isWaste && st.weightedAvgFe && (
                        <div className="text-[11px] text-slate-300 flex items-center justify-between pt-2 border-t border-slate-800">
                          <span>عیار میانگین وزنی:</span>
                          <span className="font-mono font-black text-emerald-400">{st.weightedAvgFe}% Fe</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: LIVE SHIFT TRIP LOG */}
          {activeTab === 'TRIP_LOG' && (
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-[#0E172A] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <h3 className="text-sm font-black text-slate-200">دفتر ثبت سرویس‌شمار باربری شیفت</h3>
                  <p className="text-[11px] text-slate-400">سوابق دقیق تمام سرویس‌های تخلیه‌شده همراه با مشخصات تراک، بارگیر و مقصد</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <MagnifyingGlassIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={tripSearch}
                    onChange={(e) => setTripSearch(e.target.value)}
                    placeholder="جستجو با کد تراک، ساب‌بلوک، شاول..."
                    className={`w-full pr-9 pl-3 py-1.5 rounded-xl text-xs border ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className={`text-slate-400 border-b ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <tr>
                      <th className="py-3 px-4">زمان ثبت</th>
                      <th className="py-3 px-4">کد تراک</th>
                      <th className="py-3 px-4">ظرفیت</th>
                      <th className="py-3 px-4">تعداد سرویس</th>
                      <th className="py-3 px-4">تناژ (تن)</th>
                      <th className="py-3 px-4">حجم (m³)</th>
                      <th className="py-3 px-4">جبهه‌کار / ساب‌بلوک</th>
                      <th className="py-3 px-4">مقصد (دامپ/دپو)</th>
                      <th className="py-3 px-4">بارگیر / شاول</th>
                      <th className="py-3 px-4">کنترل‌چی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTrips.map((trip) => (
                      <tr key={trip.id} className={`hover:bg-cyan-500/5 transition-colors ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {new Date(trip.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-cyan-400">{trip.truckCode || trip.driverOrFleetCode || 'DT-101'}</td>
                        <td className="py-3 px-4 font-mono">{trip.nominalCapacity} تن</td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{trip.tripCount}</td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-400">
                          {(trip.calculatedTonnage || 0).toLocaleString('fa-IR')}
                        </td>
                        <td className="py-3 px-4 font-mono text-purple-400">
                          {trip.volumeM3 || Math.round((trip.calculatedTonnage || 0) / 2.95)}
                        </td>
                        <td className="py-3 px-4 font-bold">{trip.subBlockCode}</td>
                        <td className="py-3 px-4 text-slate-200">{trip.stockpileName}</td>
                        <td className="py-3 px-4 text-slate-400">{trip.loaderId}</td>
                        <td className="py-3 px-4 text-slate-400">{trip.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
