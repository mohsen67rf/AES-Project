// src/modules/reports/presentation/pages/ReportsAndAuditPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { AppHeader } from '../../../../shared/components/Header/AppHeader';
import { Sidebar } from '../../../../shared/components/Sidebar/Sidebar';
import { ActivityLogger } from '../../../../core/services/ActivityLogger';
import { ActivityLog, ActivityCategory, ActivitySeverity, ActivityFilterOptions } from '../../../../core/domain/types/activity.types';
import { ShiftHandoverService } from '../../../workspace/services/ShiftHandoverService';
import { EquipmentService } from '../../../equipment/services/EquipmentService';
import { 
  FileText, 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Database, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Eye, 
  RotateCcw,
  Sparkles,
  BarChart3,
  TrendingUp,
  Truck,
  Building2,
  ChevronLeft,
  X
} from 'lucide-react';

export const ReportsAndAuditPage: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  const [activeTab, setActiveTab] = useState<'AUDIT_LOGS' | 'OPERATIONAL_REPORTS' | 'EXPORT_OFFICIAL'>('AUDIT_LOGS');
  const [logs, setLogs] = useState<ActivityLog[]>(() => ActivityLogger.getAll());

  // فیلترها
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<ActivitySeverity | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState<'ALL' | 'TODAY' | '3DAYS' | '7DAYS'>('ALL');

  // مدال جزئیات یک لاگ
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<ActivityLog | null>(null);

  // پیام اعلان
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = ActivityLogger.subscribe(() => {
      setLogs(ActivityLogger.getAll());
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // فیلترسازی زنده لاگ‌ها
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter(log => {
      // جستجو
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = log.title?.toLowerCase().includes(q);
        const matchDesc = log.description?.toLowerCase().includes(q);
        const matchUser = log.userName?.toLowerCase().includes(q) || log.userCode?.toLowerCase().includes(q);
        const matchEntity = log.targetEntity?.name?.toLowerCase().includes(q) || log.targetEntity?.code?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchUser && !matchEntity) return false;
      }

      // رده
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) return false;

      // شدت
      if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) return false;

      // بازه زمانی
      if (dateRange !== 'ALL') {
        const logTime = new Date(log.timestamp).getTime();
        const diffHours = (now - logTime) / (1000 * 3600);
        if (dateRange === 'TODAY' && diffHours > 24) return false;
        if (dateRange === '3DAYS' && diffHours > 72) return false;
        if (dateRange === '7DAYS' && diffHours > 168) return false;
      }

      return true;
    });
  }, [logs, searchQuery, selectedCategory, selectedSeverity, dateRange]);

  // آمار خلاصه ممیزی
  const stats = useMemo(() => {
    const now = Date.now();
    const todayLogs = logs.filter(l => (now - new Date(l.timestamp).getTime()) / (1000 * 3600) <= 24);
    const criticalLogs = logs.filter(l => l.severity === 'CRITICAL' || l.severity === 'WARNING');
    const blockLogs = logs.filter(l => l.category === 'BLOCKS');
    const userLogins = logs.filter(l => l.actionType === 'USER_LOGIN');

    return {
      total: logs.length,
      today: todayLogs.length,
      critical: criticalLogs.length,
      blocks: blockLogs.length,
      logins: userLogins.length
    };
  }, [logs]);

  // خروجی CSV از لاگ‌های فیلترشده
  const handleExportCSV = () => {
    const headers = ['شناسه', 'تاریخ و ساعت', 'رده', 'نوع اقدام', 'شدت', 'عنوان', 'توضیحات', 'کاربر', 'کد پرسنلی', 'نقش', 'آی‌پی'];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${new Date(l.timestamp).toLocaleString('fa-IR')}"`,
      `"${l.category}"`,
      `"${l.actionType}"`,
      `"${l.severity}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.userName}"`,
      `"${l.userCode}"`,
      `"${l.userRole}"`,
      `"${l.ipAddress || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AES_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('فایل اکسل/CSV ممیزی با موفقیت ذخیره و دانلود گردید.');
  };

  const getSeverityBadge = (severity: ActivitySeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">بحرانی (CRITICAL)</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">هشدار (WARNING)</span>;
      case 'SUCCESS':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">موفق (SUCCESS)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">اطلاع (INFO)</span>;
    }
  };

  const getCategoryLabel = (category: ActivityCategory) => {
    switch (category) {
      case 'AUTH': return 'احراز هویت و دسترسی';
      case 'BLOCKS': return 'مدیریت بلوک‌ها و مدل';
      case 'NAVIGATION': return 'پیمایش صفحات و GIS';
      case 'PROCESSING': return 'فرآوری و سنگ‌شکن';
      case 'SYSTEM': return 'سیستم و صدور گزارش';
      default: return category;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#080D1A] text-[#F1F5F9]' : 'bg-slate-100 text-slate-900'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb & Title */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                <span className="hover:text-white cursor-pointer" onClick={() => navigate('/dashboard')}>داشبورد</span>
                <span>/</span>
                <span className="text-[#00D2FF] font-bold">گزارش‌ها و ممیزی سامانه</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
                  <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                </div>
                <span>سامانه جامع گزارش‌ها، ردگیری رویدادها و ممیزی معدن (Audit Trail)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                ثبت کلیه وقایع امنیتی و عملیاتی، رهگیری تغییر وضعیت بلوک‌ها و ساب‌بلوک‌ها، گزارش عملکرد ناوگان و بارگیری، و صدور اسناد رسمی ممیزی.
              </p>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center flex-wrap gap-2.5">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2.5 rounded-xl bg-[#162244] hover:bg-[#1f305e] text-[#00D2FF] border border-[#00D2FF]/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>خروجی اکسل / CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ کارنامه ممیزی</span>
              </button>
            </div>
          </div>

          {toastMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Metric KPI Cards Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#0E1731] border border-[#22356B]/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">کل رویدادهای ممیزی</span>
                <Database className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{stats.total.toLocaleString('fa-IR')}</p>
              <span className="text-[10px] text-cyan-400">ثبت‌شده در حافظه ایمن سیستم</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0E1731] border border-[#22356B]/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">فعالیت‌های ۲۴ ساعت اخیر</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400 font-mono">{stats.today.toLocaleString('fa-IR')}</p>
              <span className="text-[10px] text-emerald-400/80">تعاملات آنلاین کاربران</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0E1731] border border-[#22356B]/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">تغییرات بلوک‌ها و استخراج</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-indigo-300 font-mono">{stats.blocks.toLocaleString('fa-IR')}</p>
              <span className="text-[10px] text-slate-400">ردگیری مدل زمین‌شناسی</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0E1731] border border-[#22356B]/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">هشدارها و رخدادهای حساس</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400 font-mono">{stats.critical.toLocaleString('fa-IR')}</p>
              <span className="text-[10px] text-amber-400/80">نیازمند نظارت دوره‌ای</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
            <button
              onClick={() => setActiveTab('AUDIT_LOGS')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'AUDIT_LOGS'
                  ? 'bg-[#162244] text-[#00D2FF] border border-[#00D2FF]/40 shadow-sm font-black'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>۱. دفتر ممیزی و رویدادهای زنده سیستم (Audit Trail)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                {filteredLogs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('OPERATIONAL_REPORTS')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'OPERATIONAL_REPORTS'
                  ? 'bg-[#162244] text-[#00D2FF] border border-[#00D2FF]/40 shadow-sm font-black'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>۲. گزارش‌های تحلیلی و آماری عملیات معدن</span>
            </button>

            <button
              onClick={() => setActiveTab('EXPORT_OFFICIAL')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'EXPORT_OFFICIAL'
                  ? 'bg-[#162244] text-[#00D2FF] border border-[#00D2FF]/40 shadow-sm font-black'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>۳. صدور و استخراج گزارش‌های رسمی</span>
            </button>
          </div>

          {/* TAB 1: Audit Logs View */}
          {activeTab === 'AUDIT_LOGS' && (
            <div className="space-y-4">
              {/* Filter Controls Bar */}
              <div className="p-4 rounded-2xl bg-[#0E1731] border border-[#22356B]/60 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="جستجو در رویدادها، کاربر، کد یا بلوک..."
                      className="w-full pr-9 pl-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Category Filter */}
                  <div>
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="ALL">همه رده‌های موضوعی</option>
                      <option value="AUTH">احراز هویت و ورود/خروج</option>
                      <option value="BLOCKS">بلوک‌ها و مدل استخراج</option>
                      <option value="NAVIGATION">پیمایش صفحات و نقشه‌ها</option>
                      <option value="PROCESSING">فرآوری و سنگ‌شکن</option>
                      <option value="SYSTEM">سیستم و پیکربندی</option>
                    </select>
                  </div>

                  {/* Severity Filter */}
                  <div>
                    <select
                      value={selectedSeverity}
                      onChange={e => setSelectedSeverity(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="ALL">همه سطوح اهمیت</option>
                      <option value="INFO">اطلاع‌رسانی (INFO)</option>
                      <option value="SUCCESS">موفقیت‌آمیز (SUCCESS)</option>
                      <option value="WARNING">هشدار (WARNING)</option>
                      <option value="CRITICAL">بحرانی (CRITICAL)</option>
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <select
                      value={dateRange}
                      onChange={e => setDateRange(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="ALL">همه زمان‌ها (کل تاریخچه)</option>
                      <option value="TODAY">امروز (۲۴ ساعت گذشته)</option>
                      <option value="3DAYS">۳ روز اخیر</option>
                      <option value="7DAYS">هفته جاری (۷ روز اخیر)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>تعداد رویدادهای منطبق با فیلتر: <strong className="text-cyan-400 font-mono">{filteredLogs.length}</strong> از <span className="font-mono">{logs.length}</span></span>
                  {(searchQuery || selectedCategory !== 'ALL' || selectedSeverity !== 'ALL' || dateRange !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('ALL');
                        setSelectedSeverity('ALL');
                        setDateRange('ALL');
                      }}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      پاک کردن فیلترها
                    </button>
                  )}
                </div>
              </div>

              {/* Logs Table */}
              <div className="rounded-3xl bg-[#0E1731] border border-[#22356B]/60 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#091124] text-slate-400 border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="p-3.5 font-bold">زمان و تاریخ شمسی</th>
                        <th className="p-3.5 font-bold">سطح اهمیت</th>
                        <th className="p-3.5 font-bold">رده رویداد</th>
                        <th className="p-3.5 font-bold">عنوان رخداد و شرح</th>
                        <th className="p-3.5 font-bold">کاربر و نقش سازمانی</th>
                        <th className="p-3.5 font-bold">موجودیت هدف</th>
                        <th className="p-3.5 font-bold text-center">جزئیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500">
                            هیچ رویدادی با شرایط فیلتر انتخاب‌شده یافت نشد.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.slice(0, 50).map((log) => (
                          <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-3.5 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              <span className="block text-[10px] text-slate-500 font-sans">
                                {new Date(log.timestamp).toLocaleDateString('fa-IR')}
                              </span>
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              {getSeverityBadge(log.severity)}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="text-[11px] text-slate-300">
                                {getCategoryLabel(log.category)}
                              </span>
                            </td>
                            <td className="p-3.5 max-w-xs sm:max-w-md">
                              <strong className="text-white block text-xs font-bold truncate">{log.title}</strong>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{log.description}</p>
                            </td>
                            <td className="p-3.5 whitespace-nowrap text-xs">
                              <span className="text-white font-bold block">{log.userName}</span>
                              <span className="text-[10px] text-indigo-400 font-mono">{log.userCode} ({log.userRole})</span>
                            </td>
                            <td className="p-3.5 whitespace-nowrap text-[11px]">
                              {log.targetEntity ? (
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                  {log.targetEntity.type}: {log.targetEntity.code || log.targetEntity.name || log.targetEntity.id}
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="p-3.5 text-center whitespace-nowrap">
                              <button
                                onClick={() => setSelectedLogForDetails(log)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#00D2FF] transition-colors cursor-pointer"
                                title="مشاهده جزئیات کامل لاگ"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredLogs.length > 50 && (
                  <div className="p-3 text-center text-xs text-slate-400 border-t border-slate-800 bg-[#091124]">
                    نمایش ۵۰ رویداد اول از مجموع {filteredLogs.length} لاگ ممیزی. جهت دسترسی به کل آرشیو از دکمه خروجی اکسل استفاده فرمایید.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Operational Analytics Reports */}
          {activeTab === 'OPERATIONAL_REPORTS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Report Card 1 */}
                <div className="p-5 rounded-3xl bg-[#0E1731] border border-[#22356B]/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>گزارش تجمیعی تولید و استخراج شیفت‌های اخیر</span>
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      به‌روزرسانی هفتگی
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                      <span className="text-slate-400">استخراج کانسنگ پرعیار مگنتیتی:</span>
                      <strong className="text-emerald-400 font-mono font-bold">۲۹,۱۰۰ تن</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                      <span className="text-slate-400">حجم باطله‌برداری سخت:</span>
                      <strong className="text-amber-400 font-mono font-bold">۳۳,۸۵۰ تن</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                      <span className="text-slate-400">میانگین عیار آهن (Fe):</span>
                      <strong className="text-cyan-400 font-mono font-bold">۵۵.۳٪</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                      <span className="text-slate-400">تعداد سرویس‌های باربری ثبت‌شده:</span>
                      <strong className="text-white font-mono font-bold">۶۴۵ سرویس</strong>
                    </div>
                  </div>
                </div>

                {/* Report Card 2 */}
                <div className="p-5 rounded-3xl bg-[#0E1731] border border-[#22356B]/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-cyan-400" />
                      <span>گزارش آماده‌به‌کاری و راندمان ماشین‌آلات</span>
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                      پایش آنلاین
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                      <span className="text-slate-400">شاول‌های هیدرولیکی بارگیری:</span>
                      <strong className="text-cyan-400 font-mono font-bold">۹۵.۲٪ آماده‌به‌کار</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                      <span className="text-slate-400">پیکور هیدرولیکی خردایش ثانویه:</span>
                      <strong className="text-emerald-400 font-mono font-bold">۱۰۰٪ فعال و موثر</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                      <span className="text-slate-400">دریل‌های حفاری چال‌های انفجاری:</span>
                      <strong className="text-white font-mono font-bold">۹۲.۱٪ راندمان</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                      <span className="text-slate-400">ناوگان دامپتراک‌های معدنی:</span>
                      <strong className="text-indigo-400 font-mono font-bold">۱۸ دستگاه فعال</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tripartite Shift Handover Compliance Report */}
              <div className="p-5 rounded-3xl bg-[#0E1731] border border-[#22356B]/60 space-y-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-indigo-400" />
                  <span>شاخص انطباق پروتکل تحویل شیفت سه‌گانه (کارفرما، نظارت، پیمانکار)</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  طبق بازرسی‌های ممیزی سیستم، ۹۷.۴٪ از شیفت‌های ثبت‌شده دارای امضای رسمی هر سه رکن پروژه بوده و درصد تحقق اهداف بارگیری و حفاری با کمترین انحراف مستند گردیده است.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Export & Official Reports */}
          {activeTab === 'EXPORT_OFFICIAL' && (
            <div className="p-6 rounded-3xl bg-[#0E1731] border border-[#22356B]/60 space-y-5">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00D2FF]" />
                  <span>صدور اسناد و کارنامه‌های رسمی ممیزی معدن</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تولید گزارش‌های قابل استناد جهت ارائه به هیئت مدیره، سازمان صمت و دستگاه نظارت مقیم
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-white">کارنامه جامع ممیزی امنیتی و دسترسی‌ها</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    شامل لاگ‌های ورود، تغییر سطح اختیارات، رویدادهای بحرانی و آی‌پی کاربران.
                  </p>
                  <button
                    onClick={handleExportCSV}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer transition-all"
                  >
                    دریافت فایل اکسل
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-white">گزارش ممیزی پروتکل‌های شیفت سه‌گانه</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    صورت‌جلسات تحویل و تحول شیفت، متراژ حفاری محقق‌شده، و امضاهای دیجیتال ارکان سه‌گانه.
                  </p>
                  <button
                    onClick={() => navigate('/shift-handover')}
                    className="w-full py-2 bg-[#00D2FF] hover:brightness-110 text-slate-950 rounded-xl font-black cursor-pointer transition-all"
                  >
                    مشاهده کارتابل شیفت
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-white">کارنامه هفتگی تلی و باسکول باربری</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    آمار تناژهای ورودی به سنگ‌شکن ژیراتوری، تعداد سرویس‌ها و تفکیک جبهه‌کارها.
                  </p>
                  <button
                    onClick={() => navigate('/tally-controller')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer transition-all"
                  >
                    ورود به میز کنترل‌چی
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal for Log Details */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#0E1731] border border-[#22356B]/80 p-5 space-y-4 shadow-2xl text-xs" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00D2FF]" />
                <h3 className="font-bold text-white">جزئیات رویداد ممیزی سیستم</h3>
              </div>
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400 text-[11px] block">عنوان رویداد:</span>
                <strong className="text-white text-xs">{selectedLogForDetails.title}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">شرح کامل:</span>
                <p className="text-slate-200 text-xs leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  {selectedLogForDetails.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">کاربر:</span>
                  <span className="text-white font-bold">{selectedLogForDetails.userName} ({selectedLogForDetails.userCode})</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">نقش سازمانی:</span>
                  <span className="text-indigo-300 font-bold">{selectedLogForDetails.userRole}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">زمان ثبت:</span>
                  <span className="text-white font-mono">{new Date(selectedLogForDetails.timestamp).toLocaleString('fa-IR')}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">آدرس IP:</span>
                  <span className="text-cyan-400 font-mono">{selectedLogForDetails.ipAddress || '192.168.1.104'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
