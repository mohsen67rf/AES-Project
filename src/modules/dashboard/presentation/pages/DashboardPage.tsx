// src/modules/dashboard/presentation/pages/DashboardPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../../../shared/components/Sidebar/Sidebar';
import { AppHeader } from '../../../../shared/components/Header/AppHeader';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { DashboardKPIs } from '../components/DashboardKPIs';
import { ProductionTrendCard } from '../components/ProductionTrendCard';
import { ProductionByMineCard } from '../components/ProductionByMineCard';
import { RecentAlertsCard } from '../components/RecentAlertsCard';
import { MapOverviewCard } from '../components/MapOverviewCard';
import { ActivityAuditTrailHub } from '../components/ActivityAuditTrail/ActivityAuditTrailHub';
import { 
  CalendarDaysIcon, 
  FunnelIcon, 
  PlusIcon,
  SparklesIcon,
  CubeIcon,
  TruckIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  code: string;
  fullName: string;
  email: string;
  password?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface DashboardPageProps {
  user?: User;
  onLogout?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);

  const isRtl = language === 'fa';
  const userName = user?.fullName || 'John Smith';

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#0B0F19] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dashboard Inner Container */}
        <main className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Dashboard Title & Top Actions Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>{isRtl ? 'نمای کلی داشبورد' : 'Dashboard Overview'}</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
                {isRtl 
                  ? `خوش آمدید، ${userName}! وضعیت زنده معادن، تولید و شاخص‌های استخراج شما.` 
                  : `Welcome back, ${userName}! Here's what's happening in your mines.`
                }
              </p>
            </div>

            {/* Right Action Controls: Date Range, Filters, Executive KPI Board, Add Widget */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Warehouse & Explosives Button */}
              <button 
                onClick={() => navigate('/warehouse')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all duration-200"
              >
                <ArchiveBoxIcon className="w-4 h-4" />
                <span>{isRtl ? 'انبار و مواد ناریه' : 'Warehouse & Explosives'}</span>
              </button>

              {/* Executive Management Dashboard Button */}
              <button 
                onClick={() => navigate('/management-dashboard')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black text-indigo-400 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all duration-200"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>{isRtl ? 'میز کار مدیریت کارفرما (ویجت‌های سفارشی)' : 'Executive KPI Board'}</span>
              </button>

              {/* Date Range Picker Pill */}
              <div 
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors ${
                  isDark 
                    ? 'bg-[#111726] border-[#1F293D] text-slate-300' 
                    : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                }`}
              >
                <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                <span className="font-mono">{isRtl ? '۱۴۰۵/۰۲/۳۰ – ۱۴۰۵/۰۳/۰۶' : 'May 20 – May 27, 2026'}</span>
              </div>

              {/* Filters Button */}
              <button 
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors ${
                  isDark 
                    ? 'bg-[#111726] border-[#1F293D] text-slate-300 hover:text-white hover:border-slate-600' 
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 shadow-sm'
                }`}
              >
                <FunnelIcon className="w-4 h-4 text-slate-400" />
                <span>{isRtl ? 'فیلترها' : 'Filters'}</span>
              </button>

              {/* Add Widget Button */}
              <button 
                onClick={() => navigate('/management-dashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#6D28D9] hover:to-[#4F46E5] shadow-lg shadow-[#7C3AED]/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                <span>{isRtl ? 'شخصی‌سازی ویجت‌ها' : 'Customize Widgets'}</span>
              </button>
            </div>
          </div>

          {/* Row 1: KPI Cards (5 in a row) */}
          <DashboardKPIs />

          {/* Row 2: Production Trend + Production by Mine + Recent Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6">
              <ProductionTrendCard />
            </div>
            <div className="lg:col-span-3">
              <ProductionByMineCard />
            </div>
            <div className="lg:col-span-3">
              <RecentAlertsCard />
            </div>
          </div>

          {/* Row 3: Map Overview GIS Widget */}
          <div className="w-full">
            <MapOverviewCard />
          </div>

          {/* Quick Operations Strip */}
          <div 
            className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
              isDark ? 'bg-[#111726]/60 border-[#1E293B]' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center font-bold">
                <SparklesIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold">{isRtl ? 'عملیات سریع چرخه معدن' : 'Quick Mining Operations'}</h4>
                <p className="text-[11px] text-slate-400">{isRtl ? 'دسترسی فوری به مدیریت بلوک‌ها، آنالیز XRF و خطوط خردایش' : 'Direct access to block design, XRF assays & crusher feed'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/blocks-management')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <CubeIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isRtl ? 'طرح و بلوک‌ها' : 'Block Planning'}</span>
              </button>

              <button
                onClick={() => navigate('/mining-lifecycle')}
                className="px-3.5 py-1.5 rounded-xl border border-[#7C3AED]/50 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-xs font-bold text-[#A78BFA] flex items-center gap-1.5 transition-colors"
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>{isRtl ? 'چرخه ساب‌بلوک و خردایش' : 'Sub-Block Lifecycle'}</span>
              </button>

              <button
                onClick={() => navigate('/equipment')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <TruckIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{isRtl ? 'تجهیزات و بارگیرها' : 'Equipment'}</span>
              </button>
            </div>
          </div>

          {/* Row 4: Live Activity & Audit Trail History */}
          <div className="pt-2">
            <ActivityAuditTrailHub />
          </div>
        </main>
      </div>

      {/* Add Widget Modal */}
      {showAddWidgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'bg-[#111726] border-[#1E293B] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="text-base font-black mb-2">{isRtl ? 'افزودن ویجت سفارشی' : 'Add Custom Widget'}</h3>
            <p className="text-xs text-slate-400 mb-4">
              {isRtl ? 'ویجت مورد نظر خود را برای نمایش در داشبورد انتخاب کنید:' : 'Choose a widget to pin on your dashboard overview:'}
            </p>

            <div className="space-y-2 text-xs">
              {[
                { name: isRtl ? 'نمودار عیار متوسط آهن خوراک سنگ‌شکن' : 'Average Crusher Fe% Assay', desc: isRtl ? 'نمایش زنده عیار خروجی' : 'Live recovery tracking' },
                { name: isRtl ? 'وضعیت ناوگان دامپ‌تراک‌ها و شاول‌ها' : 'Fleet Dispatch & Payload', desc: isRtl ? 'تعداد بارهای تخلیه شده در شیفت' : 'Real-time hauls per shift' },
                { name: isRtl ? 'موجودی دپوهای باطله و کم‌عیار' : 'Low-Grade & Waste Stockpile', desc: isRtl ? 'حجم و تناژ انباشت' : 'Tonnage & volume' },
              ].map((w, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isDark ? 'bg-[#090D16] border-[#1E293B] hover:border-[#7C3AED]' : 'bg-slate-50 border-slate-200 hover:border-purple-400'
                  }`}
                >
                  <span className="font-bold block">{w.name}</span>
                  <span className="text-[10px] text-slate-400">{w.desc}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddWidgetModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold hover:bg-slate-800/40"
              >
                {isRtl ? 'بستن' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
