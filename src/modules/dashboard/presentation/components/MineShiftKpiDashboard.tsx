// src/modules/dashboard/presentation/components/MineShiftKpiDashboard.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { 
  MineRepository, 
  HaulageTripRepository,
  initializeRepositories
} from '../../../../core/infrastructure/repositories';
import type { Mine } from '../../../../core/domain/types/mine.types';
import { EquipmentService } from '../../../equipment/services/EquipmentService';
import { AlertService } from '../../../alert/services/AlertService';
import { ShiftHandoverService } from '../../../workspace/services/ShiftHandoverService';
import type { ShiftHandoverRecord } from '../../../../core/domain/types/shift-handover.types';
import type { Alert } from '../../../../core/domain/types/alert.types';
import { HaulageTallyService, BlockWorkingFaceProgress } from '../../../tally/services/HaulageTallyService';
import { BlockProgressVisualizer } from '../../../tally/presentation/components/BlockProgressVisualizer';

// Lucide Icons
import {
  Pickaxe,
  Truck,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Activity,
  Layers,
  Wrench,
  Fuel,
  Clock,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Flame,
  HardHat,
  ChevronDown
} from 'lucide-react';

export interface MineShiftKpiDashboardProps {
  mineId?: string;
  onMineChange?: (mineId: string) => void;
  className?: string;
}

type DashboardTab = 'overview' | 'production' | 'equipment' | 'safety';

export const MineShiftKpiDashboard: React.FC<MineShiftKpiDashboardProps> = ({
  mineId: propMineId,
  onMineChange,
  className = '',
}) => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';
  const navigate = useNavigate();

  // Active Tab View
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Mines data from MineRepository
  const [mines, setMines] = useState<Mine[]>(() => {
    initializeRepositories();
    const all = MineRepository.getAll();
    return all.length > 0 ? all : [];
  });

  const [selectedMineId, setSelectedMineId] = useState<string>(() => {
    if (propMineId) return propMineId;
    const all = MineRepository.getAll();
    return all[0]?.id || 'mine-001';
  });

  // Current Active Shift Handover Data
  const [activeShift, setActiveShift] = useState<ShiftHandoverRecord | null>(() => {
    return ShiftHandoverService.getCurrentActiveHandover();
  });

  // Fleet Summary & Equipment List
  const [fleetSummary, setFleetSummary] = useState(() => EquipmentService.getFleetSummary());
  const [equipmentList, setEquipmentList] = useState(() => EquipmentService.getEquipmentList());

  // Dynamic Working Faces Progress from Haulage Tally Service
  const [facesProgress, setFacesProgress] = useState<BlockWorkingFaceProgress[]>(() => {
    try {
      return HaulageTallyService.getAllWorkingFacesProgress();
    } catch {
      return [];
    }
  });

  // Alerts
  const [alerts, setAlerts] = useState<Alert[]>(() => AlertService.getAllAlerts());
  const [safetyFilter, setSafetyFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');

  // Live Refresh State
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showMineDropdown, setShowMineDropdown] = useState<boolean>(false);

  // Sync data across repositories
  const refreshData = useCallback(() => {
    setIsRefreshing(true);
    try {
      initializeRepositories();
      const loadedMines = MineRepository.getAll();
      setMines(loadedMines);
      
      const currentShift = ShiftHandoverService.getCurrentActiveHandover();
      setActiveShift(currentShift);

      setFleetSummary(EquipmentService.getFleetSummary());
      setEquipmentList(EquipmentService.getEquipmentList());
      setAlerts(AlertService.getAllAlerts());
      try {
        setFacesProgress(HaulageTallyService.getAllWorkingFacesProgress());
      } catch (err) {
        console.warn('Could not refresh faces progress', err);
      }
      setLastSyncTime(new Date());
    } finally {
      setTimeout(() => setIsRefreshing(false), 450);
    }
  }, []);

  // Listen to cross-module storage and custom events
  useEffect(() => {
    const handleEvents = () => {
      refreshData();
    };

    window.addEventListener('storage', handleEvents);
    window.addEventListener('shiftHandoverUpdated', handleEvents);
    window.addEventListener('equipmentUpdated', handleEvents);
    window.addEventListener('alertCreated', handleEvents);
    window.addEventListener('haulageTripRecorded', handleEvents);
    window.addEventListener('blockProgressUpdated', handleEvents);

    // Auto periodic refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);

    return () => {
      window.removeEventListener('storage', handleEvents);
      window.removeEventListener('shiftHandoverUpdated', handleEvents);
      window.removeEventListener('equipmentUpdated', handleEvents);
      window.removeEventListener('alertCreated', handleEvents);
      window.removeEventListener('haulageTripRecorded', handleEvents);
      window.removeEventListener('blockProgressUpdated', handleEvents);
      clearInterval(interval);
    };
  }, [refreshData]);

  // Adjust state when propMineId changes from parent
  const [prevPropMineId, setPrevPropMineId] = useState<string | undefined>(propMineId);
  if (propMineId !== prevPropMineId) {
    setPrevPropMineId(propMineId);
    if (propMineId) {
      setSelectedMineId(propMineId);
    }
  }

  // Selected Mine Entity
  const selectedMine = useMemo(() => {
    return mines.find(m => m.id === selectedMineId) || mines[0] || {
      id: 'mine-001',
      name: isRtl ? 'معدن سنگ آهن مرکزی (چادرملو - بافق)' : 'Central Iron Ore Mine (Chadormalu)',
      code: 'MI-001',
      location: isRtl ? 'استان یزد، شهرستان بافق' : 'Yazd Province, Bafq',
      status: 'فعال' as const,
      createdAt: new Date().toISOString(),
    };
  }, [mines, selectedMineId, isRtl]);

  const handleSelectMine = (id: string) => {
    setSelectedMineId(id);
    setShowMineDropdown(false);
    if (onMineChange) onMineChange(id);
  };

  const haulTrips = useMemo(() => {
    return HaulageTripRepository.getAll();
  }, []);

  // Production Metrics Calculation for current shift
  const metrics = useMemo(() => {
    const extractionTons = activeShift?.totalExtractionTons || 14250;
    const wasteTons = activeShift?.totalWasteTons || 18400;
    const targetTons = 15000;
    const progressPercent = Math.min(100, Math.round((extractionTons / targetTons) * 100));
    const strippingRatio = (wasteTons / Math.max(1, extractionTons)).toFixed(2);
    const avgFe = activeShift?.averageFeGradePercent || 54.8;
    const haulTripsCount = activeShift?.totalHaulTrips || haulTrips.reduce((acc, t) => acc + (t.tripCount || 0), 0) || 342;
    const feedRateTph = 1180; // tons per hour

    return {
      extractionTons,
      wasteTons,
      totalMined: extractionTons + wasteTons,
      targetTons,
      progressPercent,
      strippingRatio,
      avgFe,
      haulTripsCount,
      feedRateTph
    };
  }, [activeShift, haulTrips]);

  // Safety & HSE alerts filtering
  const safetyAlerts = useMemo(() => {
    const base = alerts.filter(a => 
      a.department === 'HSE' || 
      a.severity === 'CRITICAL' || 
      a.severity === 'WARNING' || 
      a.title.includes('ایمنی') ||
      a.title.includes('دیواره') ||
      a.title.includes('ریزش') ||
      a.title.includes('ناریه')
    );

    if (safetyFilter === 'CRITICAL') {
      return base.filter(a => a.severity === 'CRITICAL');
    }
    if (safetyFilter === 'WARNING') {
      return base.filter(a => a.severity === 'WARNING');
    }
    return base;
  }, [alerts, safetyFilter]);

  const criticalCount = useMemo(() => {
    return alerts.filter(a => a.severity === 'CRITICAL').length;
  }, [alerts]);

  const warningCount = useMemo(() => {
    return alerts.filter(a => a.severity === 'WARNING').length;
  }, [alerts]);

  // Equipment categorization
  const equipmentBreakdown = useMemo(() => {
    const shovels = equipmentList.filter(e => e.category === 'SHOVEL' || e.category === 'EXCAVATOR');
    const trucks = equipmentList.filter(e => e.category === 'HAUL_TRUCK');
    const drills = equipmentList.filter(e => e.category === 'DRILL_RIG');
    const support = equipmentList.filter(e => e.category === 'LOADER' || e.category === 'DOZER' || e.category === 'GRADER' || e.category === 'WATER_TRUCK');

    return {
      shovels: {
        total: shovels.length,
        active: shovels.filter(s => s.status === 'OPERATIONAL').length,
        items: shovels
      },
      trucks: {
        total: trucks.length,
        active: trucks.filter(t => t.status === 'OPERATIONAL').length,
        items: trucks
      },
      drills: {
        total: drills.length,
        active: drills.filter(d => d.status === 'OPERATIONAL').length,
        items: drills
      },
      support: {
        total: support.length,
        active: support.filter(s => s.status === 'OPERATIONAL').length,
        items: support
      }
    };
  }, [equipmentList]);

  // Format time helper
  const formattedSyncTime = useMemo(() => {
    return lastSyncTime.toLocaleTimeString(isRtl ? 'fa-IR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [lastSyncTime, isRtl]);

  return (
    <div 
      className={`rounded-2xl sm:rounded-[26px] border transition-all duration-300 shadow-xl overflow-hidden ${
        isDark 
          ? 'bg-[#101935] border-[#24356B]/40 text-[#F1F5F9]' 
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      } ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 1. Header Banner & Mine Context Bar */}
      <div 
        className={`p-4 sm:p-6 border-b transition-colors ${
          isDark 
            ? 'bg-gradient-to-r from-[#141F42] via-[#101935] to-[#0D152D] border-[#24356B]/30' 
            : 'bg-gradient-to-r from-slate-50 via-white to-slate-100 border-slate-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Mine Identity & Switcher */}
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00D2FF]/20 to-[#0077FE]/15 border border-[#00D2FF]/30 text-[#00D2FF] flex items-center justify-center font-black flex-shrink-0 shadow-[0_0_16px_rgba(0,210,255,0.2)]">
              <Pickaxe className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded-full bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30">
                  {selectedMine.code}
                </span>

                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  selectedMine.status === 'فعال' || selectedMine.status === 'در حال بهره‌برداری'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {selectedMine.status}
                </span>

                <span className="text-xs text-[#8E9EB8] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#8E9EB8]" />
                  <span className="truncate">{selectedMine.location}</span>
                </span>
              </div>

              {/* Mine Name with Dropdown if multiple mines exist */}
              <div className="relative mt-1">
                <div 
                  onClick={() => setShowMineDropdown(!showMineDropdown)}
                  className="flex items-center gap-2 cursor-pointer group"
                  title="تغییر معدن مورد نظر از مخزن MineRepository"
                >
                  <h2 className="text-base sm:text-xl font-black tracking-tight text-[#F1F5F9] truncate group-hover:text-[#00D2FF] transition-colors">
                    {selectedMine.name}
                  </h2>
                  {mines.length > 1 && (
                    <ChevronDown className="w-4 h-4 text-[#8E9EB8] group-hover:text-[#00D2FF] transition-transform duration-200" />
                  )}
                </div>

                {/* Dropdown Menu */}
                {showMineDropdown && mines.length > 1 && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMineDropdown(false)} />
                    <div className="absolute top-full right-0 mt-2 w-72 rounded-xl border bg-[#141F42] border-[#24356B] shadow-2xl z-50 p-1.5 space-y-1">
                      <div className="px-3 py-1.5 text-[11px] text-[#8E9EB8] font-bold border-b border-[#24356B]/40">
                        {isRtl ? 'انتخاب معدن از MineRepository:' : 'Select Mine from Repository:'}
                      </div>
                      {mines.map((m, mIdx) => (
                        <button
                          key={`mine-select-${m.id || m.code || mIdx}-${mIdx}`}
                          onClick={() => handleSelectMine(m.id)}
                          className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
                            m.id === selectedMine.id
                              ? 'bg-[#00D2FF]/20 text-[#00D2FF]'
                              : 'text-slate-200 hover:bg-[#1E2D5C]'
                          }`}
                        >
                          <span className="truncate">{m.name}</span>
                          <span className="text-[10px] font-mono text-[#8E9EB8]">{m.code}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Current Shift Pill & Telemetry Sync Controls */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
            {/* Live Shift Pill */}
            <div 
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-2.5 transition-all shadow-sm ${
                isDark 
                  ? 'bg-[#141F42]/80 border-[#24356B]/50 text-[#F1F5F9]' 
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#00D2FF] animate-ping" />
              <div className="text-right">
                <div className="text-[10px] text-[#8E9EB8] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#00D2FF]" />
                  <span>{activeShift ? activeShift.shiftTitleFa.split('-')[0].trim() : (isRtl ? 'شیفت ۱ (روز)' : 'Shift 1 (Day)')}</span>
                </div>
                <div className="text-xs font-black font-mono text-[#00D2FF]">
                  {activeShift?.shiftDateJalali || '۱۴۰۵/۰۳/۱۸'} • ۰۷:۰۰ - ۱۹:۰۰
                </div>
              </div>
            </div>

            {/* Live Refresh Button */}
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                isRefreshing
                  ? 'bg-[#00D2FF]/20 border-[#00D2FF]/40 text-[#00D2FF]'
                  : isDark
                  ? 'bg-[#141F42] hover:bg-[#1E2D5C] border-[#24356B]/50 text-slate-200'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title={isRtl ? 'به‌روزرسانی آنی شاخص‌ها از مخزن داده معدن' : 'Sync real-time data from MineRepository'}
            >
              <RotateCcw className={`w-3.5 h-3.5 text-[#00D2FF] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRtl ? 'به‌روزرسانی زنده' : 'Live Sync'}</span>
              <span className="text-[10px] font-mono text-[#8E9EB8]">({formattedSyncTime})</span>
            </button>

            {/* Shift Handover Hub Link */}
            <button
              onClick={() => navigate('/shift-handover')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#38BDF8] text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-[0_0_16px_rgba(0,210,255,0.3)] hover:brightness-110 transition-all cursor-pointer"
              title="مشاهده دفتر تحویل و تحول کامل شیفت معدن"
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تحویل شیفت' : 'Shift Log'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-[#24356B]/30 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#00D2FF] text-slate-950 font-black shadow-[0_0_12px_rgba(0,210,255,0.35)]'
                : isDark
                ? 'bg-[#141F42]/60 text-[#8E9EB8] hover:text-[#F1F5F9] border border-[#24356B]/30'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isRtl ? 'نمای جامع شاخص‌ها' : 'Overview KPIs'}</span>
          </button>

          <button
            onClick={() => setActiveTab('production')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
              activeTab === 'production'
                ? 'bg-[#00D2FF] text-slate-950 font-black shadow-[0_0_12px_rgba(0,210,255,0.35)]'
                : isDark
                ? 'bg-[#141F42]/60 text-[#8E9EB8] hover:text-[#F1F5F9] border border-[#24356B]/30'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تولید و عیار شیفت' : 'Production & Assay'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-white font-bold">
              {metrics.extractionTons.toLocaleString('fa-IR')} t
            </span>
          </button>

          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
              activeTab === 'equipment'
                ? 'bg-[#00D2FF] text-slate-950 font-black shadow-[0_0_12px_rgba(0,210,255,0.35)]'
                : isDark
                ? 'bg-[#141F42]/60 text-[#8E9EB8] hover:text-[#F1F5F9] border border-[#24356B]/30'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{isRtl ? 'وضعیت ماشین‌آلات' : 'Fleet Status'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-white font-bold">
              {fleetSummary.activeCount}/{fleetSummary.totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
              activeTab === 'safety'
                ? 'bg-rose-500 text-white font-black shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : isDark
                ? 'bg-[#141F42]/60 text-[#8E9EB8] hover:text-[#F1F5F9] border border-[#24356B]/30'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{isRtl ? 'هشدارهای ایمنی و HSE' : 'Safety Alerts'}</span>
            {criticalCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-black animate-pulse">
                {criticalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Dashboard Content Body */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* =========================================================================
            OVERVIEW TAB OR PRIMARY KPI CARDS (Always visible or primary in overview)
           ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'production') && (
          <div className="space-y-4">
            {/* Top 4 Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {/* Card 1: Ore Extraction */}
              <div 
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                  isDark 
                    ? 'bg-[#141F42] border-[#24356B]/40 text-[#F1F5F9] shadow-[0_8px_24px_rgba(7,11,26,0.3)]' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30 flex items-center justify-center font-bold">
                      <Pickaxe className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-[#8E9EB8] font-bold">
                      {isRtl ? 'کانسنگ استخراجی' : 'Ore Extraction'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    {metrics.progressPercent}% هدف
                  </span>
                </div>

                <div className="mt-3.5 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#00D2FF]">
                      {metrics.extractionTons.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs text-[#8E9EB8] mr-1 font-bold">
                      {isRtl ? 'تن' : 'Tons'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8E9EB8] font-mono">
                    از {metrics.targetTons.toLocaleString('fa-IR')} تن
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 w-full bg-[#101935] h-2 rounded-full overflow-hidden border border-[#24356B]/30">
                  <div 
                    className="bg-gradient-to-r from-[#00D2FF] to-[#38BDF8] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,210,255,0.5)]"
                    style={{ width: `${metrics.progressPercent}%` }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8E9EB8]">
                  <span>{isRtl ? 'خوراک مستقیم سنگ‌شکن:' : 'Direct Crusher Feed:'}</span>
                  <span className="font-mono font-black text-slate-200">۷,۸۵۰ تن</span>
                </div>
              </div>

              {/* Card 2: Waste Stripping & Strip Ratio */}
              <div 
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                  isDark 
                    ? 'bg-[#141F42] border-[#24356B]/40 text-[#F1F5F9] shadow-[0_8px_24px_rgba(7,11,26,0.3)]' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30 flex items-center justify-center font-bold">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-[#8E9EB8] font-bold">
                      {isRtl ? 'باطله‌برداری پیت' : 'Waste Stripping'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/25">
                    SR: {metrics.strippingRatio}
                  </span>
                </div>

                <div className="mt-3.5 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#FFB020]">
                      {metrics.wasteTons.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs text-[#8E9EB8] mr-1 font-bold">
                      {isRtl ? 'تن' : 'Tons'}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center">
                    <ArrowUpRight className="w-3 h-3" />
                    +۶.۲٪
                  </span>
                </div>

                {/* Strip Ratio Progress Bar */}
                <div className="mt-3 w-full bg-[#101935] h-2 rounded-full overflow-hidden border border-[#24356B]/30">
                  <div 
                    className="bg-gradient-to-r from-[#FFB020] to-[#F97316] h-full rounded-full transition-all duration-500"
                    style={{ width: '62%' }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8E9EB8]">
                  <span>{isRtl ? 'مجموع جابجایی سنگ:' : 'Total Mined Rock:'}</span>
                  <span className="font-mono font-black text-slate-200">
                    {metrics.totalMined.toLocaleString('fa-IR')} تن
                  </span>
                </div>
              </div>

              {/* Card 3: Average Fe Grade */}
              <div 
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                  isDark 
                    ? 'bg-[#141F42] border-[#24356B]/40 text-[#F1F5F9] shadow-[0_8px_24px_rgba(7,11,26,0.3)]' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                      <Flame className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-[#8E9EB8] font-bold">
                      {isRtl ? 'میانگین عیار آهن (Fe)' : 'Average Fe Grade'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    کیفیت مطلوب
                  </span>
                </div>

                <div className="mt-3.5 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-cyan-400">
                      {metrics.avgFe.toFixed(1)}%
                    </span>
                    <span className="text-xs text-[#8E9EB8] mr-1 font-bold">
                      Fe
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8E9EB8] font-mono">
                    کات‌آف: ۵۲.۰٪
                  </span>
                </div>

                {/* Grade Meter */}
                <div className="mt-3 w-full bg-[#101935] h-2 rounded-full overflow-hidden border border-[#24356B]/30">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(metrics.avgFe / 65) * 100}%` }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8E9EB8]">
                  <span>SiO2: ۵.۸٪ | P: ۰.۰۵٪</span>
                  <span className="font-mono text-emerald-400 font-bold">XRF Verified</span>
                </div>
              </div>

              {/* Card 4: Haulage Trips & Crusher Rate */}
              <div 
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                  isDark 
                    ? 'bg-[#141F42] border-[#24356B]/40 text-[#F1F5F9] shadow-[0_8px_24px_rgba(7,11,26,0.3)]' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-[#8E9EB8] font-bold">
                      {isRtl ? 'سرویس‌های حمل شیفت' : 'Haulage Trips'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/25">
                    {metrics.feedRateTph} TPH
                  </span>
                </div>

                <div className="mt-3.5 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-purple-400">
                      {metrics.haulTripsCount}
                    </span>
                    <span className="text-xs text-[#8E9EB8] mr-1 font-bold">
                      {isRtl ? 'سرویس تراک' : 'Trips'}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center">
                    <ArrowUpRight className="w-3 h-3" />
                    ۲۸.۵ دور/ساعت
                  </span>
                </div>

                <div className="mt-3 w-full bg-[#101935] h-2 rounded-full overflow-hidden border border-[#24356B]/30">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-indigo-400 h-full rounded-full transition-all duration-500"
                    style={{ width: '84%' }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8E9EB8]">
                  <span>{isRtl ? 'ناوگان فعال:' : 'Active Fleet:'}</span>
                  <span className="font-mono font-black text-slate-200">
                    {fleetSummary.activeCount} از {fleetSummary.totalCount} دستگاه
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 1.5: DYNAMIC WORKING FACES PROGRESS & TALLY DEDUCTION
           ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'production') && facesProgress.length > 0 && (
          <div 
            className={`p-4 sm:p-5 rounded-2xl border ${
              isDark 
                ? 'bg-[#141F42]/80 border-[#24356B]/40 shadow-lg' 
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#24356B]/30 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black border border-amber-500/20">
                  <Pickaxe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#F1F5F9] flex items-center gap-2">
                    <span>{isRtl ? 'رصد پویای پیشرفت جبهه‌کارها (واحد کنترل‌چی و سرویس‌شمار)' : 'Dynamic Working Faces Extraction Progress'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                      Dynamic Tally
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#8E9EB8]">
                    {isRtl ? 'کسر خودکار حجم و تناژ بر اساس سرویس‌های ثبت‌شده ناوگان و افزایش به موجودی دپوها/دامپ‌های مقصد' : 'Atomic volume & tonnage deduction from blocks to destination dumps'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/tally-controller')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'میز ثبت سرویس‌شمار (کنترل‌چی)' : 'Tally Controller Desk'}</span>
                </button>
              </div>
            </div>

            {/* Grid of Working Faces Gauges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
              {facesProgress.map((face) => (
                <div 
                  key={`kpi-face-${face.blockId}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDark ? 'bg-[#0E172A]/90 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-xs font-black text-slate-200">{face.workingFaceName}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      تراز {face.benchLevel}m
                    </span>
                  </div>

                  <BlockProgressVisualizer
                    progressPercent={face.progressPercent}
                    totalVolumeM3={face.totalEstimatedVolumeM3}
                    hauledVolumeM3={face.totalHauledVolumeM3}
                    remainingVolumeM3={face.remainingVolumeM3}
                    totalTonnage={face.totalEstimatedTonnage}
                    hauledTonnage={face.totalHauledTonnage}
                    remainingTonnage={face.remainingTonnage}
                    blockCode={face.blockCode}
                    variant="both"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 2: EQUIPMENT STATUS BREAKDOWN
           ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'equipment') && (
          <div 
            className={`p-4 sm:p-5 rounded-2xl border ${
              isDark 
                ? 'bg-[#141F42]/70 border-[#24356B]/30' 
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {/* Sub-header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#24356B]/30 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00D2FF]/15 text-[#00D2FF] flex items-center justify-center font-black border border-[#00D2FF]/20">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#F1F5F9]">
                    {isRtl ? 'وضعیت ناوگان ماشین‌آلات در شیفت جاری' : 'Real-time Equipment Fleet Status'}
                  </h3>
                  <p className="text-[11px] text-[#8E9EB8]">
                    {isRtl ? 'پایش لحظه‌ای شاول‌ها، دامپتراک‌ها و دریل‌واگن‌های فعال در پیت' : 'Live telemetry and readiness across mining machinery'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101935] border border-[#24356B]/40 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 font-bold">{fleetSummary.activeCount} فعال</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101935] border border-[#24356B]/40 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-400 font-bold">{fleetSummary.standbyCount} استندبای</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101935] border border-[#24356B]/40 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-rose-400 font-bold">{fleetSummary.maintenanceCount} تعمیرگاه</span>
                </div>
                <button
                  onClick={() => navigate('/equipment')}
                  className="px-2.5 py-1 rounded-lg bg-[#00D2FF]/15 hover:bg-[#00D2FF]/25 border border-[#00D2FF]/30 text-[#00D2FF] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{isRtl ? 'نقشه ناوگان' : 'Fleet Map'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 4 Category Pill Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
              {/* Shovels & Excavators */}
              <div className="p-3.5 rounded-xl bg-[#101935]/80 border border-[#24356B]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-200">
                    {isRtl ? 'شاول‌ها و بیل‌های بارگیری' : 'Shovels & Excavators'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#00D2FF]">
                    {equipmentBreakdown.shovels.active} / {equipmentBreakdown.shovels.total}
                  </span>
                </div>
                <div className="text-[11px] text-[#8E9EB8] flex items-center justify-between">
                  <span>نرخ بارگیری میانگین:</span>
                  <span className="font-mono text-slate-300 font-bold">۶۸۰ تن/ساعت</span>
                </div>
                <div className="w-full bg-[#1A264F] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#00D2FF] h-full rounded-full" 
                    style={{ width: `${(equipmentBreakdown.shovels.active / Math.max(1, equipmentBreakdown.shovels.total)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Haul Trucks */}
              <div className="p-3.5 rounded-xl bg-[#101935]/80 border border-[#24356B]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-200">
                    {isRtl ? 'دامپتراک‌های سنگین' : 'Heavy Haul Trucks'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-400">
                    {equipmentBreakdown.trucks.active} / {equipmentBreakdown.trucks.total}
                  </span>
                </div>
                <div className="text-[11px] text-[#8E9EB8] flex items-center justify-between">
                  <span>میانگین زمان چرخه:</span>
                  <span className="font-mono text-slate-300 font-bold">۱۴.۲ دقیقه</span>
                </div>
                <div className="w-full bg-[#1A264F] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full" 
                    style={{ width: `${(equipmentBreakdown.trucks.active / Math.max(1, equipmentBreakdown.trucks.total)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Drill Rigs */}
              <div className="p-3.5 rounded-xl bg-[#101935]/80 border border-[#24356B]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-200">
                    {isRtl ? 'دریل‌واگن‌های چال‌زنی' : 'Blast Drill Rigs'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-purple-400">
                    {equipmentBreakdown.drills.active} / {equipmentBreakdown.drills.total}
                  </span>
                </div>
                <div className="text-[11px] text-[#8E9EB8] flex items-center justify-between">
                  <span>متراژ حفر شده در شیفت:</span>
                  <span className="font-mono text-slate-300 font-bold">۲۴۰ متر</span>
                </div>
                <div className="w-full bg-[#1A264F] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-400 h-full rounded-full" 
                    style={{ width: `${(equipmentBreakdown.drills.active / Math.max(1, equipmentBreakdown.drills.total)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Support & Road Maintenance */}
              <div className="p-3.5 rounded-xl bg-[#101935]/80 border border-[#24356B]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-200">
                    {isRtl ? 'ماشین‌آلات پشتیبانی و راه' : 'Support & Ancillary'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    {equipmentBreakdown.support.active} / {equipmentBreakdown.support.total}
                  </span>
                </div>
                <div className="text-[11px] text-[#8E9EB8] flex items-center justify-between">
                  <span>آمادگی فنی ناوگان (OEE):</span>
                  <span className="font-mono text-emerald-400 font-bold">۸۷.۵٪</span>
                </div>
                <div className="w-full bg-[#1A264F] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full rounded-full" 
                    style={{ width: `${(equipmentBreakdown.support.active / Math.max(1, equipmentBreakdown.support.total)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Active Key Machines Online Location & Shift Hours */}
            {activeShift?.equipmentStatuses && activeShift.equipmentStatuses.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#24356B]/30 space-y-2">
                <div className="text-xs font-bold text-[#8E9EB8] flex items-center justify-between">
                  <span>{isRtl ? 'موقعیت ناوگان روی نقشه و ساعات کارکرد در جبهه‌کارها:' : 'Equipment location on map & operating hours in working faces:'}</span>
                  <button 
                    onClick={() => navigate('/mine/map')}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{isRtl ? 'مشاهده نقشه آنلاین' : 'Live GIS Map'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {activeShift.equipmentStatuses.map((eq, eqIdx) => (
                    <div 
                      key={`shift-eq-loc-${eq.id || eq.code || eqIdx}-${eqIdx}`}
                      className="p-2.5 rounded-xl bg-[#0D152D] border border-[#24356B]/40 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-[#F1F5F9] truncate">{eq.code}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            eq.status === 'OPERATIONAL' 
                              ? 'bg-emerald-500/15 text-emerald-400' 
                              : eq.status === 'STANDBY'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}>
                            {eq.statusFa}
                          </span>
                        </div>
                        <p className="text-[10px] text-cyan-300 font-bold truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00D2FF]" />
                          <span>{eq.locationBench}</span>
                        </p>
                      </div>

                      <div className="text-left flex-shrink-0">
                        <div className="text-[11px] font-mono font-black text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{eq.operatingHours} ساعت</span>
                        </div>
                        <div className="text-[9px] text-[#8E9EB8] font-bold">
                          {isRtl ? 'فعالیت در شیفت' : 'Shift Active'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            SECTION 3: REAL-TIME SAFETY & HSE ALERTS FOR CURRENT SHIFT
           ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'safety') && (
          <div 
            className={`p-4 sm:p-5 rounded-2xl border ${
              isDark 
                ? 'bg-[#141F42]/70 border-[#24356B]/30' 
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {/* Header with Hazard Index */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#24356B]/30 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-black border border-rose-500/20">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#F1F5F9] flex items-center gap-2">
                    <span>{isRtl ? 'هشدارهای ایمنی، پایداری و HSE شیفت' : 'Real-time Safety & HSE Alerts'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {activeShift?.safetyLog?.hazardLevel === 'LOW' 
                        ? (isRtl ? 'سطح خطر: کم (سبز پایدار)' : 'Hazard Level: Low') 
                        : (isRtl ? 'سطح پایش: متوسط' : 'Hazard Level: Moderate')}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#8E9EB8]">
                    {isRtl ? 'رصد لحظه‌ای سنسورهای پایداری دیواره، شرایط جوی و رویدادهای ایمنی پیت' : 'Live geotechnical slope stability sensors, weather, and near-miss logs'}
                  </p>
                </div>
              </div>

              {/* Safety Filter Tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSafetyFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    safetyFilter === 'ALL'
                      ? 'bg-[#1E2D5C] text-[#00D2FF] border border-[#00D2FF]/40'
                      : 'text-[#8E9EB8] hover:bg-[#101935]'
                  }`}
                >
                  {isRtl ? 'همه هشدارها' : 'All'} ({alerts.length})
                </button>
                <button
                  onClick={() => setSafetyFilter('CRITICAL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    safetyFilter === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-[#8E9EB8] hover:bg-[#101935]'
                  }`}
                >
                  {isRtl ? 'بحرانی' : 'Critical'} ({criticalCount})
                </button>
                <button
                  onClick={() => setSafetyFilter('WARNING')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    safetyFilter === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-[#8E9EB8] hover:bg-[#101935]'
                  }`}
                >
                  {isRtl ? 'اخطار' : 'Warning'} ({warningCount})
                </button>
              </div>
            </div>

            {/* Shift Safety Status Cards */}
            {activeShift?.safetyLog && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 pb-3 border-b border-[#24356B]/20">
                <div className="p-3 rounded-xl bg-[#0D152D] border border-[#24356B]/30 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="text-[#8E9EB8] font-bold block">پایداری دیواره پیت:</span>
                    <span className="text-slate-200 font-medium leading-relaxed">
                      {activeShift.safetyLog.wallStabilityStatus}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0D152D] border border-[#24356B]/30 flex items-start gap-2.5">
                  <Radio className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="text-[#8E9EB8] font-bold block">آب‌وهوا و دید افقی:</span>
                    <span className="text-slate-200 font-medium leading-relaxed">
                      {activeShift.safetyLog.weatherCondition}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0D152D] border border-[#24356B]/30 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#FFB020] mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="text-[#8E9EB8] font-bold block">آتشباری شیفت بعد:</span>
                    <span className="text-amber-300 font-medium leading-relaxed">
                      {activeShift.safetyLog.nextShiftBlastNotice?.scheduledTime} (پله {activeShift.safetyLog.nextShiftBlastNotice?.benchLevel})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Safety Alerts List */}
            <div className="space-y-2 pt-3">
              {safetyAlerts.slice(0, 4).map((alert, aIdx) => {
                const isCritical = alert.severity === 'CRITICAL';
                const isWarning = alert.severity === 'WARNING';
                const isSuccess = alert.severity === 'SUCCESS';

                return (
                  <div
                    key={`kpi-safety-alert-${alert.id || aIdx}-${aIdx}`}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isCritical
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : isWarning
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : isSuccess
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : 'bg-[#101935] border-[#24356B]/30 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold flex-shrink-0 mt-0.5 ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-400'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-[#00D2FF]/20 text-[#00D2FF]'
                      }`}>
                        {isCritical ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-white truncate">
                            {alert.title}
                          </h4>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            isCritical ? 'bg-rose-600 text-white' : isWarning ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-200'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-[10px] text-[#8E9EB8] font-mono">
                            {new Date(alert.createdAt).toLocaleTimeString(isRtl ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E9EB8] mt-1 leading-relaxed line-clamp-2">
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    {/* Quick Action Button */}
                    {alert.actionUrl && (
                      <button
                        onClick={() => navigate(alert.actionUrl!)}
                        className="self-end sm:self-center px-3 py-1 rounded-lg text-xs font-bold bg-[#141F42] hover:bg-[#1E2D5C] text-[#00D2FF] border border-[#00D2FF]/30 transition-colors flex-shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <span>{alert.actionLabelFa || (isRtl ? 'بررسی' : 'Inspect')}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 4: ACTIVE BENCHES & SHIFT DIRECTIVE
           ========================================================================= */}
        {activeShift && activeShift.activeBenches && activeShift.activeBenches.length > 0 && (
          <div 
            className={`p-4 sm:p-5 rounded-2xl border ${
              isDark 
                ? 'bg-[#141F42]/70 border-[#24356B]/30' 
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#24356B]/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/20">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#F1F5F9]">
                    {isRtl ? 'جبهه‌کارهای فعال و تخصیص ناوگان در شیفت' : 'Active Mining Benches & Equipment Allocation'}
                  </h3>
                  <p className="text-[11px] text-[#8E9EB8]">
                    {isRtl ? 'وضعیت بارگیری در پله‌های ۱۰۴۰، ۱۰۲۵ و ۱۰۵۵ بر اساس داده‌های شیفت جاری' : 'Bench status, excavator assignment, and destination tracking'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-[#00D2FF] px-2.5 py-0.5 rounded-full bg-[#101935] border border-[#24356B]/40">
                {activeShift.activeBenches.length} جبهه‌کار فعال
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3.5">
              {activeShift.activeBenches.map((bench, bIdx) => (
                <div 
                  key={`shift-bench-${bench.id || bench.blockCode || bIdx}-${bIdx}`}
                  className="p-3.5 rounded-xl bg-[#0D152D] border border-[#24356B]/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#00D2FF] font-mono">
                      پله {bench.benchLevel} • {bench.blockCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                      {bench.faceConditionFa}
                    </span>
                  </div>

                  <div className="text-xs text-slate-200 font-bold truncate">
                    {bench.materialTypeFa}
                  </div>

                  <div className="text-[11px] text-[#8E9EB8] space-y-1">
                    <div className="flex items-center justify-between">
                      <span>شاول مستقر:</span>
                      <span className="text-slate-300 font-bold truncate max-w-[150px]">{bench.assignedExcavator}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>تعداد تراک فعال:</span>
                      <span className="font-mono text-cyan-400 font-bold">{bench.haulTruckCount} دستگاه</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>تناژ تحققی:</span>
                      <span className="font-mono text-emerald-400 font-black">
                        {bench.achievedTonnage.toLocaleString('fa-IR')} / {bench.targetTonnage.toLocaleString('fa-IR')} تن
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#24356B]/30 text-[10px] text-[#8E9EB8] truncate">
                    <span>مقصد: </span>
                    <span className="text-slate-300 font-bold">{bench.destination}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Shift Supervisor Golden Directive */}
            {activeShift.goldenShiftDirective && (
              <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#101935] to-amber-500/5 border border-amber-500/30 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FFB020] flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-[#FFB020] font-black block">دستورالعمل طلایی سرپرست شیفت:</span>
                  <p className="text-slate-300 leading-relaxed mt-0.5">
                    {activeShift.goldenShiftDirective}
                  </p>
                  <div className="mt-1 text-[10px] text-[#8E9EB8] font-mono">
                    امضاکننده: {activeShift.outgoingSupervisor?.fullName || 'مهندس رضایی (سرپرست کارگاه استخراج)'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MineShiftKpiDashboard;
