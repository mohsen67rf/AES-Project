// src/modules/dashboard/presentation/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../../../shared/components/Sidebar/Sidebar';
import { AppHeader } from '../../../../shared/components/Header/AppHeader';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { DashboardKPIs } from '../components/DashboardKPIs';
import { MineShiftKpiDashboard } from '../components/MineShiftKpiDashboard';
import { ProductionTrendCard } from '../components/ProductionTrendCard';
import { ProductionByMineCard } from '../components/ProductionByMineCard';
import { RecentAlertsCard } from '../components/RecentAlertsCard';
import { DashboardEquipmentMapCard } from '../components/DashboardEquipmentMapCard';
import { UnitTasksDashboardWidget } from '../../../tasks/presentation/components/UnitTasksDashboardWidget';
import { TaskAssignmentModal } from '../../../tasks/presentation/components/TaskAssignmentModal';
import { UnitTasksDrawer } from '../../../tasks/presentation/components/UnitTasksDrawer';
import { UserRepository } from '../../../../core/infrastructure/repositories';
import type { User } from '../../../../core/domain/types/mine.types';
import { 
  CalendarDays, 
  Sparkles,
  Briefcase,
  Archive,
  Layers,
  Truck,
  Activity,
  TrendingUp,
  MapPin,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Radio
} from 'lucide-react';

interface DashboardPageProps {
  user?: User;
  onLogout?: () => void;
}

type DashboardViewTab = 'shift' | 'trends' | 'fleet' | 'tasks' | 'overview';

export const DashboardPage: React.FC<DashboardPageProps> = ({ user: propUser }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  // Active Tab Mode (Shift Monitoring, Trends & Economics, Fleet Map, Tasks, Unified Overview)
  const [activeTab, setActiveTab] = useState<DashboardViewTab>(() => {
    try {
      const saved = localStorage.getItem('aes_dashboard_tab');
      if (saved && ['shift', 'trends', 'fleet', 'tasks', 'overview'].includes(saved)) {
        return saved as DashboardViewTab;
      }
    } catch {
      // ignore
    }
    return 'shift';
  });

  // Collapsible sections for 'overview' mode to avoid visual drowning
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    tasks: false,
    shift: false,
    trends: false,
    fleet: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleTabChange = (tab: DashboardViewTab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('aes_dashboard_tab', tab);
    } catch {
      // ignore
    }
  };

  // Active Session User with lazy initialization
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (propUser) return propUser;
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('aes_session') : null;
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn(e);
    }
    const all = UserRepository.getAll();
    return all[1] || all[0] || null;
  });

  // Modals for Task Assignment & Tracking
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTasksDrawerOpen, setIsTasksDrawerOpen] = useState(false);
  const [showQuickNavMenu, setShowQuickNavMenu] = useState(false);

  const isRtl = language === 'fa';

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('aes_session');
        if (saved) {
          setCurrentUser(JSON.parse(saved));
          return;
        }
      } catch (e) {
        console.warn(e);
      }
      const all = UserRepository.getAll();
      setCurrentUser(all[1] || all[0]);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const userName = currentUser?.fullName || propUser?.fullName || 'دکتر علیرضا کاظمی';

  // Navigation tab definitions
  const tabs = [
    {
      id: 'shift' as const,
      labelFa: 'پایش زنده شیفت',
      labelEn: 'Shift Monitoring',
      icon: Activity,
      badge: isRtl ? 'لحظه‌ای' : 'Live',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    },
    {
      id: 'trends' as const,
      labelFa: 'روندها و آمار کلان',
      labelEn: 'Trends & Analytics',
      icon: TrendingUp,
    },
    {
      id: 'fleet' as const,
      labelFa: 'نقشه ناوگان و پیت',
      labelEn: 'Fleet & Pit Map',
      icon: MapPin,
    },
    {
      id: 'tasks' as const,
      labelFa: 'میز کار و کارتابل',
      labelEn: 'Tasks & Desk',
      icon: ClipboardList,
    },
    {
      id: 'overview' as const,
      labelFa: 'نمای تجمیعی کامل',
      labelEn: 'Full Overview',
      icon: LayoutGrid,
    },
  ];

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#0E162E] text-[#F1F5F9]' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dashboard Inner Container */}
        <main className="p-3.5 sm:p-5 md:p-6 lg:p-7 space-y-4 max-w-[1600px] mx-auto w-full">
          {/* Dashboard Title & Top Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-1 border-b border-slate-700/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
                  <span>{isRtl ? 'مرکز فرماندهی و پایش عملیات معدن' : 'Mining Operations Command Center'}</span>
                </h1>
                <p className="text-xs text-[#8E9EB8] font-medium flex items-center gap-2">
                  <span>{userName}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  <span className="text-[11px] text-emerald-400 font-bold">{isRtl ? 'اتصال زنده به شبکه تله‌متری' : 'Telemetry Online'}</span>
                </p>
              </div>
            </div>

            {/* Quick Context & Shortcuts */}
            <div className="flex items-center flex-wrap gap-2">
              {/* Date Indicator */}
              <div 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                  isDark 
                    ? 'bg-[#141F42] border-[#24356B]/40 text-[#8E9EB8]' 
                    : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-[11px]">{isRtl ? 'شیفت جاری • ۱۴۰۵/۰۳/۱۸' : 'Current Shift • Jun 07'}</span>
              </div>

              {/* Quick Navigation Dropdown to Avoid Cluttering Header */}
              <div className="relative">
                <button
                  onClick={() => setShowQuickNavMenu(!showQuickNavMenu)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-[#141F42] hover:bg-[#1C2A57] border-[#24356B]/50 text-slate-200' 
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isRtl ? 'ماژول‌های تخصصی' : 'Specialized Modules'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showQuickNavMenu ? 'rotate-180' : ''}`} />
                </button>

                {showQuickNavMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowQuickNavMenu(false)} />
                    <div className="absolute left-0 mt-1.5 w-56 rounded-xl border bg-[#141F42] border-[#24356B] shadow-2xl z-50 p-1.5 space-y-1">
                      <button
                        onClick={() => { setShowQuickNavMenu(false); navigate('/workspace'); }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-bold text-right flex items-center gap-2 hover:bg-[#1C2A57] text-slate-200 transition-colors cursor-pointer"
                      >
                        <Briefcase className="w-4 h-4 text-cyan-400" />
                        <span>{isRtl ? 'میز کار اختصاصی واحدها' : 'Unit Role Desks'}</span>
                      </button>
                      <button
                        onClick={() => { setShowQuickNavMenu(false); navigate('/warehouse'); }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-bold text-right flex items-center gap-2 hover:bg-[#1C2A57] text-slate-200 transition-colors cursor-pointer"
                      >
                        <Archive className="w-4 h-4 text-amber-400" />
                        <span>{isRtl ? 'انبار و ناریه معدن' : 'Explosives Warehouse'}</span>
                      </button>
                      <button
                        onClick={() => { setShowQuickNavMenu(false); navigate('/management-dashboard'); }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-bold text-right flex items-center gap-2 hover:bg-[#1C2A57] text-slate-200 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>{isRtl ? 'داشبورد مدیریت ارشد (KPI)' : 'Executive Management'}</span>
                      </button>
                      <button
                        onClick={() => { setShowQuickNavMenu(false); navigate('/mining-lifecycle'); }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-bold text-right flex items-center gap-2 hover:bg-[#1C2A57] text-slate-200 transition-colors cursor-pointer"
                      >
                        <Layers className="w-4 h-4 text-emerald-400" />
                        <span>{isRtl ? 'چرخه حیات ساب‌بلوک' : 'Sub-Block Lifecycle'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Clean Segmented View Mode Tabs to Prevent Clutter */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121D3B] border border-[#24356B]/40 overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                      : 'text-[#8E9EB8] hover:text-[#F1F5F9] hover:bg-[#1A2850]/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-cyan-400'}`} />
                  <span>{isRtl ? tab.labelFa : tab.labelEn}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-slate-950/20 text-slate-950 font-black' : tab.badgeColor
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Rendering */}
          {/* 1. SHIFT MONITORING (Clean, focused view of the active shift) */}
          {activeTab === 'shift' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <MineShiftKpiDashboard />

              {/* Quick Mining Cycle Operations Bar */}
              <div 
                className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                  isDark 
                    ? 'bg-[#141F42] border-[#24356B]/40 text-[#F1F5F9]' 
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black">{isRtl ? 'دسترسی سریع به چرخه عملیات معدن' : 'Quick Operations Cycle'}</h4>
                    <p className="text-[11px] text-[#8E9EB8]">{isRtl ? 'انتقال سریع به ماژول‌های طراحی، ساب‌بلوک و بارگیرها' : 'Direct jump to planning, lifecycle and equipment'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/blocks-management')}
                    className="px-3.5 py-1.5 rounded-xl border border-[#24356B]/50 bg-[#101935] hover:bg-[#1A264F] text-xs font-bold flex items-center gap-1.5 text-[#F1F5F9] transition-all cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isRtl ? 'طرح و بلوک‌ها' : 'Blocks'}</span>
                  </button>

                  <button
                    onClick={() => navigate('/mining-lifecycle')}
                    className="px-3.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-bold text-cyan-400 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'چرخه ساب‌بلوک' : 'Lifecycle'}</span>
                  </button>

                  <button
                    onClick={() => navigate('/equipment')}
                    className="px-3.5 py-1.5 rounded-xl border border-[#24356B]/50 bg-[#101935] hover:bg-[#1A264F] text-xs font-bold flex items-center gap-1.5 text-[#F1F5F9] transition-all cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isRtl ? 'ناوگان و تجهیزات' : 'Fleet'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. TRENDS & MACRO ANALYTICS (Charts & macroeconomic KPIs) */}
          {activeTab === 'trends' && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
              {/* Row 1: KPI Cards */}
              <DashboardKPIs />

              {/* Row 2: Production Trend + Production by Mine + Recent Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
                <div className="md:col-span-2 lg:col-span-6">
                  <ProductionTrendCard />
                </div>
                <div className="md:col-span-1 lg:col-span-3">
                  <ProductionByMineCard />
                </div>
                <div className="md:col-span-1 lg:col-span-3">
                  <RecentAlertsCard />
                </div>
              </div>
            </div>
          )}

          {/* 3. FLEET & PIT MAP (Dedicated map view) */}
          {activeTab === 'fleet' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="w-full">
                <DashboardEquipmentMapCard />
              </div>
            </div>
          )}

          {/* 4. TASKS & WORKSPACE (Role desk & assignments) */}
          {activeTab === 'tasks' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <UnitTasksDashboardWidget
                currentUser={currentUser}
                onOpenAssignModal={() => setIsAssignModalOpen(true)}
                onOpenTasksDrawer={() => setIsTasksDrawerOpen(true)}
              />
            </div>
          )}

          {/* 5. FULL OVERVIEW (All modules organized with collapsible headers) */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Section 1: Shift Operational Intelligence */}
              <div className="space-y-2">
                <div 
                  onClick={() => toggleSection('shift')}
                  className="flex items-center justify-between px-2 py-1 cursor-pointer select-none text-xs font-black text-cyan-400 hover:text-cyan-300"
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>{isRtl ? '۱. شاخص‌های پایش زنده شیفت و جبهه‌کارها' : '1. Real-time Shift & Face Bench Telemetry'}</span>
                  </span>
                  {collapsedSections.shift ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
                {!collapsedSections.shift && <MineShiftKpiDashboard />}
              </div>

              {/* Section 2: Macro KPIs & Trends */}
              <div className="space-y-3 pt-2 border-t border-slate-700/20">
                <div 
                  onClick={() => toggleSection('trends')}
                  className="flex items-center justify-between px-2 py-1 cursor-pointer select-none text-xs font-black text-amber-400 hover:text-amber-300"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{isRtl ? '۲. روند استخراج، عیار و توزیع معادن' : '2. Production Trends & Mine Share Distribution'}</span>
                  </span>
                  {collapsedSections.trends ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
                {!collapsedSections.trends && (
                  <div className="space-y-4">
                    <DashboardKPIs />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                      <div className="md:col-span-2 lg:col-span-6">
                        <ProductionTrendCard />
                      </div>
                      <div className="md:col-span-1 lg:col-span-3">
                        <ProductionByMineCard />
                      </div>
                      <div className="md:col-span-1 lg:col-span-3">
                        <RecentAlertsCard />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Live Pit Map */}
              <div className="space-y-2 pt-2 border-t border-slate-700/20">
                <div 
                  onClick={() => toggleSection('fleet')}
                  className="flex items-center justify-between px-2 py-1 cursor-pointer select-none text-xs font-black text-emerald-400 hover:text-emerald-300"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{isRtl ? '۳. نقشه مکان‌نمای ماهواره‌ای ناوگان و پیت' : '3. Satellite Fleet Location Map'}</span>
                  </span>
                  {collapsedSections.fleet ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
                {!collapsedSections.fleet && (
                  <div className="w-full">
                    <DashboardEquipmentMapCard />
                  </div>
                )}
              </div>

              {/* Section 4: Role Tasks & Workspace Hub */}
              <div className="space-y-2 pt-2 border-t border-slate-700/20">
                <div 
                  onClick={() => toggleSection('tasks')}
                  className="flex items-center justify-between px-2 py-1 cursor-pointer select-none text-xs font-black text-indigo-400 hover:text-indigo-300"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    <span>{isRtl ? '۴. کارتابل و ارجاعات سازمانی' : '4. Unit Tasks & Accountability'}</span>
                  </span>
                  {collapsedSections.tasks ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
                {!collapsedSections.tasks && (
                  <UnitTasksDashboardWidget
                    currentUser={currentUser}
                    onOpenAssignModal={() => setIsAssignModalOpen(true)}
                    onOpenTasksDrawer={() => setIsTasksDrawerOpen(true)}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Task Assignment Modal */}
      <TaskAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        currentUser={currentUser}
        onTaskCreated={() => {
          window.dispatchEvent(new Event('taskUpdated'));
        }}
      />

      {/* Unit Tasks Drawer */}
      <UnitTasksDrawer
        isOpen={isTasksDrawerOpen}
        onClose={() => setIsTasksDrawerOpen(false)}
        currentUser={currentUser}
        onOpenAssignModal={() => {
          setIsTasksDrawerOpen(false);
          setIsAssignModalOpen(true);
        }}
      />
    </div>
  );
};

export default DashboardPage;
