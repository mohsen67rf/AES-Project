// src/modules/dashboard/presentation/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
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
import { UnitTasksDashboardWidget } from '../../../tasks/presentation/components/UnitTasksDashboardWidget';
import { TaskAssignmentModal } from '../../../tasks/presentation/components/TaskAssignmentModal';
import { UnitTasksDrawer } from '../../../tasks/presentation/components/UnitTasksDrawer';
import { UserRepository } from '../../../../core/infrastructure/repositories';
import type { User } from '../../../../core/domain/types/mine.types';
import { 
  CalendarDays, 
  Plus,
  Sparkles,
  Briefcase,
  Archive,
  Layers,
  FlaskConical,
  Truck,
  MapPin
} from 'lucide-react';

interface DashboardPageProps {
  user?: User;
  onLogout?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user: propUser }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);

  // Active Session User
  const [currentUser, setCurrentUser] = useState<User | null>(propUser || null);

  // Modals for Task Assignment & Tracking
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTasksDrawerOpen, setIsTasksDrawerOpen] = useState(false);

  const isRtl = language === 'fa';

  const loadUser = () => {
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

  useEffect(() => {
    loadUser();
    const handleStorage = () => loadUser();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const userName = currentUser?.fullName || propUser?.fullName || 'دکتر علیرضا کاظمی';

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#101935] text-[#F1F5F9]' : 'bg-[#F8FAFC] text-slate-900'}`}>
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
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 text-[#F1F5F9]">
                <span>{isRtl ? 'داشبورد عملیات' : 'Operations Dashboard'}</span>
              </h1>
              <p className="text-xs text-[#8E9EB8] mt-0.5 font-medium">
                {userName}
              </p>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Specialized Unit Workspace Button */}
              <button 
                onClick={() => navigate('/workspace')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-[#00D2FF] bg-[#141F42] hover:bg-[#1E2D5C] border border-[#24356B]/40 transition-all cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>{isRtl ? 'میز کار واحدها' : 'Unit Desks'}</span>
              </button>

              {/* Task Assignment Quick Action */}
              <button 
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black text-slate-950 bg-gradient-to-r from-[#00D2FF] to-[#38BDF8] hover:brightness-110 shadow-[0_0_16px_rgba(0,210,255,0.35)] transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{isRtl ? 'ارجاع تسک' : 'Assign Task'}</span>
              </button>

              {/* Warehouse & Explosives Button */}
              <button 
                onClick={() => navigate('/warehouse')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-[#FFB020] bg-[#141F42] hover:bg-[#1E2D5C] border border-[#24356B]/40 transition-all cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                <span>{isRtl ? 'انبار ناریه' : 'Warehouse'}</span>
              </button>

              {/* Executive Management Dashboard Button */}
              <button 
                onClick={() => navigate('/management-dashboard')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-[#F1F5F9] bg-[#141F42] hover:bg-[#1E2D5C] border border-[#24356B]/40 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#00D2FF]" />
                <span>{isRtl ? 'مدیریت ارشد' : 'Executive'}</span>
              </button>

              {/* Date Range Picker Pill */}
              <div 
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold transition-colors ${
                  isDark 
                    ? 'bg-[#141F42] border-[#24356B]/40 text-[#8E9EB8]' 
                    : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                }`}
              >
                <CalendarDays className="w-4 h-4 text-[#00D2FF]" />
                <span className="font-mono text-[11px]">{isRtl ? '۱۴۰۵/۰۲/۳۰ – ۰۳/۰۶' : 'May 20 – 27'}</span>
              </div>
            </div>
          </div>

          {/* Dedicated Unit Tasks & Role Workspace Hub */}
          <UnitTasksDashboardWidget
            currentUser={currentUser}
            onOpenAssignModal={() => setIsAssignModalOpen(true)}
            onOpenTasksDrawer={() => setIsTasksDrawerOpen(true)}
          />

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
            className={`p-4 rounded-[22px] border flex flex-wrap items-center justify-between gap-4 ${
              isDark 
                ? 'bg-[#1A264F] border-[#24356B]/30 text-[#F1F5F9] shadow-[0_12px_32px_rgba(7,11,26,0.5)]' 
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/25 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-[#F1F5F9]">{isRtl ? 'عملیات سریع چرخه معدن' : 'Quick Operations'}</h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/blocks-management')}
                className="px-4 py-1.5 rounded-full border border-[#24356B]/40 bg-[#141F42] hover:bg-[#1E2D5C] text-xs font-bold flex items-center gap-1.5 text-[#F1F5F9] transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#00D2FF]" />
                <span>{isRtl ? 'طرح و بلوک‌ها' : 'Block Planning'}</span>
              </button>

              <button
                onClick={() => navigate('/mining-lifecycle')}
                className="px-4 py-1.5 rounded-full border border-[#00D2FF]/35 bg-[#00D2FF]/10 hover:bg-[#00D2FF]/20 text-xs font-bold text-[#00D2FF] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRtl ? 'چرخه ساب‌بلوک' : 'Lifecycle'}</span>
              </button>

              <button
                onClick={() => navigate('/equipment')}
                className="px-4 py-1.5 rounded-full border border-[#24356B]/40 bg-[#141F42] hover:bg-[#1E2D5C] text-xs font-bold flex items-center gap-1.5 text-[#F1F5F9] transition-all cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5 text-[#FFB020]" />
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
