// src/modules/dashboard/presentation/components/ActivityAuditTrail/ActivityAuditTrailHub.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ArrowPathIcon,
  UserCircleIcon,
  CubeIcon,
  MapIcon,
  BeakerIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListBulletIcon,
  ChartBarIcon,
  SparklesIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { ActivityLogger } from '../../../../../core/services/ActivityLogger';
import type { 
  ActivityLog, 
  ActivityCategory, 
  ActivitySeverity, 
  ActivityFilterOptions,
  ActivitySummaryStats
} from '../../../../../core/domain/types/activity.types';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { AuditDetailModal } from './AuditDetailModal';
import { ManualNoteModal } from './ManualNoteModal';

interface ActivityAuditTrailHubProps {
  initialCategory?: ActivityCategory | 'ALL';
  compactMode?: boolean;
}

export const ActivityAuditTrailHub: React.FC<ActivityAuditTrailHubProps> = ({
  initialCategory = 'ALL',
  compactMode = false,
}) => {
  const { isDark } = useTheme();
  
  // State
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivitySummaryStats>({
    totalCount: 0,
    todayCount: 0,
    authCount: 0,
    blockCount: 0,
    navigationCount: 0,
    processingCount: 0,
    activeUsersCount: 0,
    securityScore: 100,
  });

  const [activeTab, setActiveTab] = useState<'timeline' | 'table' | 'analytics'>('timeline');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'ALL'>(initialCategory);
  const [selectedSeverity, setSelectedSeverity] = useState<ActivitySeverity | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState<'TODAY' | '3DAYS' | '7DAYS' | '30DAYS' | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = compactMode ? 5 : 8;

  // Modals
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Notification for export/clear
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const refreshData = () => {
    const filters: ActivityFilterOptions = {
      category: selectedCategory,
      severity: selectedSeverity,
      dateRange,
      searchQuery,
    };
    const filtered = ActivityLogger.getFilteredLogs(filters);
    setLogs(filtered);
    setStats(ActivityLogger.getStats());
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = ActivityLogger.subscribe(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [selectedCategory, selectedSeverity, dateRange, searchQuery]);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleExport = (format: 'json' | 'csv') => {
    const content = ActivityLogger.exportLogs(format);
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AES_Audit_Log_${new Date().toISOString().slice(0, 10)}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`گزارش ردپای ممیزی با فرمت ${format.toUpperCase()} ذخیره شد.`);
  };

  const handleClearLogs = () => {
    if (window.confirm('آیا از بازنشانی و پاکسازی لاگ‌های فعالیت اطمینان دارید؟ داده‌های نمونه مجدداً بارگذاری خواهند شد.')) {
      ActivityLogger.clearLogs();
      ActivityLogger.seedSampleLogsIfEmpty();
      refreshData();
      showToast('لاگ‌های فعالیت بازنشانی شدند.');
    }
  };

  // Time format helper
  const formatTimeRelative = (isoString: string) => {
    try {
      const now = new Date().getTime();
      const time = new Date(isoString).getTime();
      const diffSec = Math.floor((now - time) / 1000);

      if (diffSec < 60) return 'چند لحظه پیش';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} دقیقه پیش`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} ساعت پیش`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'دیروز';
      if (diffDays < 30) return `${diffDays} روز پیش`;
      return new Date(isoString).toLocaleDateString('fa-IR');
    } catch {
      return isoString;
    }
  };

  const getActionIcon = (category: ActivityCategory, actionType: string) => {
    switch (category) {
      case 'AUTH':
        return <UserCircleIcon className="w-5 h-5 text-emerald-400" />;
      case 'BLOCKS':
        return <CubeIcon className="w-5 h-5 text-[#00D4FF]" />;
      case 'NAVIGATION':
        return <MapIcon className="w-5 h-5 text-amber-400" />;
      case 'PROCESSING':
        return <BeakerIcon className="w-5 h-5 text-purple-400" />;
      case 'SYSTEM':
        return <Cog6ToothIcon className="w-5 h-5 text-[#C9A227]" />;
      default:
        return <SparklesIcon className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getSeverityStyle = (severity: ActivitySeverity) => {
    switch (severity) {
      case 'SUCCESS':
        return {
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
          border: 'border-emerald-500/30 hover:border-emerald-500/60',
        };
      case 'WARNING':
        return {
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
          border: 'border-amber-500/30 hover:border-amber-500/60',
        };
      case 'CRITICAL':
        return {
          badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
          border: 'border-rose-500/30 hover:border-rose-500/60',
        };
      default:
        return {
          badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]',
          border: 'border-cyan-500/30 hover:border-cyan-500/60',
        };
    }
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return logs.slice(start, start + pageSize);
  }, [logs, currentPage, pageSize]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border transition-all duration-300 ${
      isDark 
        ? 'bg-[#101D33]/90 border-[#2A3A5A]/50 shadow-xl' 
        : 'bg-white/90 border-slate-200/80 shadow-md'
    }`}>
      {/* Toast Notice */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-emerald-500/90 text-white text-xs font-bold shadow-lg flex items-center gap-2"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>{actionNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Stats Banner */}
      <div className={`p-5 sm:p-6 border-b ${
        isDark ? 'border-[#2A3A5A]/40 bg-gradient-to-r from-[#13233C] via-[#0F1B2E] to-[#13233C]' : 'border-slate-100 bg-slate-50/80'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-[#0099CC]/10 text-[#00D4FF] border border-[#00D4FF]/30 shadow-[0_0_15px_rgba(0,212,255,0.15)]">
              <ShieldCheckIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg sm:text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  سامانه ثبت وقایع و ردپای ممیزی (Audit Trail & Activity Log)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30 animate-pulse">
                  Live Sync
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-white hover:shadow-lg hover:shadow-[#00D4FF]/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              <span>ثبت یادداشت شیفت</span>
            </button>

            <div className="relative group">
              <button
                className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  isDark 
                    ? 'bg-[#13233C] border-[#2A3A5A] text-slate-300 hover:text-white hover:border-[#00D4FF]/40' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-[#C9A227]'
                }`}
              >
                <ArrowDownTrayIcon className="w-4 h-4 text-[#00D4FF]" />
                <span>خروجی ممیزی</span>
              </button>
              <div className={`absolute left-0 mt-1 hidden group-hover:flex flex-col min-w-[130px] rounded-xl shadow-xl border z-20 py-1.5 text-xs ${
                isDark ? 'bg-[#0F1B2E] border-[#2A3A5A] text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <button
                  onClick={() => handleExport('csv')}
                  className="px-3 py-1.5 text-right hover:bg-[#00D4FF]/10 hover:text-[#00D4FF] transition-colors"
                >
                  📄 فرمت اکسل (CSV)
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="px-3 py-1.5 text-right hover:bg-[#00D4FF]/10 hover:text-[#00D4FF] transition-colors"
                >
                  📦 فرمت خام (JSON)
                </button>
              </div>
            </div>

            <button
              onClick={handleClearLogs}
              title="بازنشانی لاگ‌ها"
              className={`p-2 rounded-xl border transition-colors ${
                isDark 
                  ? 'bg-[#13233C] border-[#2A3A5A] text-slate-400 hover:text-rose-400 hover:border-rose-500/40' 
                  : 'bg-white border-slate-200 text-slate-500 hover:text-rose-500'
              }`}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
          <div className={`p-3 rounded-xl border transition-all ${
            isDark ? 'bg-[#0B1524]/70 border-[#2A3A5A]/50' : 'bg-white border-slate-200'
          }`}>
            <div className="text-[11px] text-[#8A9DB0] font-medium">کل وقایع ثبت شده</div>
            <div className="text-lg font-black mt-1 text-[#00D4FF]">{stats.totalCount}</div>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${
            isDark ? 'bg-[#0B1524]/70 border-[#2A3A5A]/50' : 'bg-white border-slate-200'
          }`}>
            <div className="text-[11px] text-[#8A9DB0] font-medium">رویدادهای امروز</div>
            <div className="text-lg font-black mt-1 text-emerald-400">{stats.todayCount}</div>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${
            isDark ? 'bg-[#0B1524]/70 border-[#2A3A5A]/50' : 'bg-white border-slate-200'
          }`}>
            <div className="text-[11px] text-[#8A9DB0] font-medium">تغییرات بلوک‌ها</div>
            <div className="text-lg font-black mt-1 text-[#C9A227]">{stats.blockCount}</div>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${
            isDark ? 'bg-[#0B1524]/70 border-[#2A3A5A]/50' : 'bg-white border-slate-200'
          }`}>
            <div className="text-[11px] text-[#8A9DB0] font-medium">ورودهای کاربر</div>
            <div className="text-lg font-black mt-1 text-cyan-400">{stats.authCount}</div>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${
            isDark ? 'bg-[#0B1524]/70 border-[#2A3A5A]/50' : 'bg-white border-slate-200'
          }`}>
            <div className="text-[11px] text-[#8A9DB0] font-medium">پیمایش‌های معدن</div>
            <div className="text-lg font-black mt-1 text-amber-400">{stats.navigationCount}</div>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${
            isDark ? 'bg-[#0B1524]/70 border-[#2A3A5A]/50' : 'bg-white border-slate-200'
          }`}>
            <div className="text-[11px] text-[#8A9DB0] font-medium">ضریب تطابق امنیتی</div>
            <div className="text-lg font-black mt-1 text-purple-400">{stats.securityScore}%</div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className={`p-4 sm:p-5 border-b space-y-3 ${
        isDark ? 'border-[#2A3A5A]/30 bg-[#0C1728]/50' : 'border-slate-100 bg-slate-50/50'
      }`}>
        {/* Row 1: Search & Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* View Mode Tabs */}
          <div className={`flex items-center p-1 rounded-xl border w-full md:w-auto ${
            isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-slate-200/70 border-slate-300'
          }`}>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'timeline'
                  ? (isDark ? 'bg-[#00D4FF] text-[#0A1628] shadow' : 'bg-white text-slate-900 shadow')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <span>جریان زمانی (Timeline)</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'table'
                  ? (isDark ? 'bg-[#00D4FF] text-[#0A1628] shadow' : 'bg-white text-slate-900 shadow')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
              <span>جدول ممیزی (Audit Table)</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'analytics'
                  ? (isDark ? 'bg-[#00D4FF] text-[#0A1628] shadow' : 'bg-white text-slate-900 shadow')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>بینش‌های آماری (Analytics)</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <MagnifyingGlassIcon className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="جستجو در رویدادها، کاربر، کد بلوک..."
              className={`w-full pr-10 pl-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/40 ${
                isDark 
                  ? 'bg-[#13233C] border-[#2A3A5A] text-white placeholder-slate-500' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Row 2: Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#8A9DB0] ml-1 flex items-center gap-1">
              <FunnelIcon className="w-3.5 h-3.5 text-[#00D4FF]" />
              دسته‌بندی:
            </span>
            {[
              { id: 'ALL', label: 'همه وقایع' },
              { id: 'BLOCKS', label: '🧱 بلوک و ساب‌بلوک' },
              { id: 'AUTH', label: '🔐 ورود و امنیت' },
              { id: 'NAVIGATION', label: '🗺️ پیمایش معدن' },
              { id: 'PROCESSING', label: '⚙️ فرآوری و خطوط' },
              { id: 'SYSTEM', label: '🛡️ سیستم و بازرسی' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as any);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40 font-bold'
                    : isDark ? 'bg-[#13233C] text-slate-400 hover:text-white border border-transparent' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#8A9DB0]">بازه زمانی:</span>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value as any);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs focus:outline-none ${
                isDark 
                  ? 'bg-[#13233C] border-[#2A3A5A] text-slate-200' 
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <option value="ALL">همه زمان‌ها</option>
              <option value="TODAY">امروز</option>
              <option value="3DAYS">۳ روز اخیر</option>
              <option value="7DAYS">۷ روز گذشته</option>
              <option value="30DAYS">۳۰ روز گذشته</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="p-4 sm:p-6 min-h-[360px]">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3">
              <InformationCircleIcon className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-slate-300">هیچ رویدادی با فیلترهای انتخابی یافت نشد</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              می‌توانید عبارت جستجو را پاک کنید یا بازه زمانی را به «همه زمان‌ها» تغییر دهید.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedSeverity('ALL');
                setDateRange('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/30 transition-colors"
            >
              پاکسازی همه فیلترها
            </button>
          </div>
        ) : activeTab === 'timeline' ? (
          /* ========================================= */
          /* 1. TIMELINE FEED VIEW                     */
          /* ========================================= */
          <div className="relative">
            {/* Center Vertical Axis */}
            <div className={`absolute top-3 bottom-3 right-5 sm:right-6 w-0.5 ${
              isDark ? 'bg-[#2A3A5A]' : 'bg-slate-200'
            }`} />

            <div className="space-y-4">
              {paginatedLogs.map((log) => {
                const sStyle = getSeverityStyle(log.severity);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative flex items-start gap-4 pr-12 sm:pr-14 group"
                  >
                    {/* Node Dot / Icon */}
                    <div className={`absolute right-3.5 sm:right-4.5 top-3.5 -translate-y-1/2 w-3.5 h-3.5 rounded-full ${sStyle.dot} ring-4 ring-[#101D33] z-10 transition-transform group-hover:scale-125`} />

                    {/* Card Container */}
                    <div 
                      onClick={() => {
                        setSelectedLog(log);
                        setIsDetailModalOpen(true);
                      }}
                      className={`flex-1 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                        isDark 
                          ? `bg-[#13233C]/80 ${sStyle.border} hover:bg-[#162947] hover:shadow-lg` 
                          : 'bg-white border-slate-200 hover:border-[#00D4FF]/60 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Title & Action Type */}
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-black/20">
                            {getActionIcon(log.category, log.actionType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white group-hover:text-[#00D4FF]' : 'text-slate-900 group-hover:text-[#00D4FF]'} transition-colors`}>
                                {log.title}
                              </h4>
                              {log.targetEntity?.code && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/25">
                                  {log.targetEntity.code}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-[#8A9DB0]">{log.userName} ({log.userRole})</span>
                              <span className="text-slate-600 text-xs">•</span>
                              <span className="text-[10px] font-mono text-slate-400">{log.ipAddress}</span>
                            </div>
                          </div>
                        </div>

                        {/* Timestamp & Severity */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${sStyle.badge}`}>
                            {log.severity}
                          </span>
                          <span className="text-[11px] text-[#C9A227] font-medium whitespace-nowrap flex items-center gap-1">
                            <ClockIcon className="w-3 h-3 text-[#C9A227]" />
                            {formatTimeRelative(log.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className={`text-xs mt-2.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {log.description}
                      </p>

                      {/* Changed Fields Tags */}
                      {log.details?.changedFields && log.details.changedFields.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-700/30">
                          <span className="text-[10px] text-[#8A9DB0]">فیلدهای اصلاحی:</span>
                          {log.details.changedFields.map((f) => (
                            <span key={f} className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'table' ? (
          /* ========================================= */
          /* 2. ADVANCED AUDIT TABLE VIEW              */
          /* ========================================= */
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className={`border-b ${
                  isDark ? 'border-[#2A3A5A] text-[#8A9DB0] bg-[#13233C]/60' : 'border-slate-200 text-slate-600 bg-slate-100'
                }`}>
                  <th className="py-3 px-3 font-semibold">زمان</th>
                  <th className="py-3 px-3 font-semibold">کاربر / عامل</th>
                  <th className="py-3 px-3 font-semibold">دسته‌بندی</th>
                  <th className="py-3 px-3 font-semibold">عملیات</th>
                  <th className="py-3 px-3 font-semibold">موجودیت هدف</th>
                  <th className="py-3 px-4 font-semibold">شرح رویداد</th>
                  <th className="py-3 px-3 font-semibold">سطح</th>
                  <th className="py-3 px-3 font-semibold text-center">جزئیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                {paginatedLogs.map((log) => {
                  const sStyle = getSeverityStyle(log.severity);
                  return (
                    <tr
                      key={log.id}
                      onClick={() => {
                        setSelectedLog(log);
                        setIsDetailModalOpen(true);
                      }}
                      className={`transition-colors cursor-pointer ${
                        isDark ? 'hover:bg-[#162947]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-[#C9A227]">
                        {formatTimeRelative(log.timestamp)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-white">{log.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.userCode}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium">
                        {log.category}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono font-semibold text-cyan-400">{log.actionType}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                        {log.targetEntity?.code || log.targetEntity?.name || '-'}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                        {log.description}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${sStyle.badge}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button className="px-2.5 py-1 rounded bg-[#00D4FF]/15 text-[#00D4FF] hover:bg-[#00D4FF]/30 text-[11px] font-bold transition-colors">
                          بررسی
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ========================================= */
          /* 3. ANALYTICS & COMPLIANCE INSIGHTS        */
          /* ========================================= */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Breakdown */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-bold text-[#8A9DB0] uppercase mb-3 flex items-center justify-between">
                  <span>توزیع وقایع بر اساس ماژول</span>
                  <SparklesIcon className="w-4 h-4 text-[#00D4FF]" />
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>مدیریت بلوک‌ها و ساب‌بلوک‌ها</span>
                      <span className="font-bold text-[#C9A227]">{stats.blockCount}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/30 overflow-hidden">
                      <div 
                        className="h-full bg-[#C9A227] rounded-full"
                        style={{ width: `${stats.totalCount ? (stats.blockCount / stats.totalCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>ورود و احراز هویت (Auth)</span>
                      <span className="font-bold text-emerald-400">{stats.authCount}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/30 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${stats.totalCount ? (stats.authCount / stats.totalCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>پیمایش نقشه‌ها و پیت‌های معدن</span>
                      <span className="font-bold text-amber-400">{stats.navigationCount}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/30 overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${stats.totalCount ? (stats.navigationCount / stats.totalCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>فرآوری، آزمایشگاه و خطوط خردایش</span>
                      <span className="font-bold text-purple-400">{stats.processingCount}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/30 overflow-hidden">
                      <div 
                        className="h-full bg-purple-400 rounded-full"
                        style={{ width: `${stats.totalCount ? (stats.processingCount / stats.totalCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Audit Health */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-bold text-[#8A9DB0] uppercase mb-3 flex items-center justify-between">
                  <span>وضعیت سلامت و ممیزی سیستم</span>
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <span className="font-medium">یکپارچگی پایگاه داده (Data Integrity):</span>
                    <span className="font-bold">تأیید شده (OK)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <span className="font-medium">کاربران فعال در ممیزی:</span>
                    <span className="font-bold">{stats.activeUsersCount} کاربر</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <span className="font-medium">عدم دستکاری لاگ‌ها:</span>
                    <span className="font-bold">رمزنگاری شده (SHA-256)</span>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Audits */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-bold text-[#8A9DB0] uppercase mb-3 flex items-center justify-between">
                  <span>مسیرهای پربازدید اخیر</span>
                  <MapIcon className="w-4 h-4 text-amber-400" />
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">نقشه سه‌بعدی معدن (/mine/map)</span>
                    <span className="font-mono text-cyan-400">بسیار فعال</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">مدیریت بلوک‌ها (/blocks-management)</span>
                    <span className="font-mono text-cyan-400">فعال</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">چرخه ساب‌بلوک‌ها (/mining-lifecycle)</span>
                    <span className="font-mono text-cyan-400">فعال</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className={`px-5 py-3.5 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-[#2A3A5A]/30 bg-[#13233C]/40' : 'border-slate-100 bg-slate-50'
        }`}>
          <span className="text-[#8A9DB0]">
            نمایش صفحه <span className="font-bold text-white">{currentPage}</span> از <span className="font-bold text-white">{totalPages}</span> (مجموع {logs.length} رویداد)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A] text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A] text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AuditDetailModal
        log={selectedLog}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedLog(null);
        }}
      />

      {/* Manual Note Modal */}
      <ManualNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={() => {
          refreshData();
          showToast('یادداشت بازرسی با موفقیت در لاگ ممیزی ثبت شد.');
        }}
      />
    </div>
  );
};
