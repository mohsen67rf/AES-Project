// src/modules/workspace/presentation/pages/UnitWorkspacePage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../../../shared/components/Sidebar/Sidebar';
import { AppHeader } from '../../../../shared/components/Header/AppHeader';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { UserRepository } from '../../../../core/infrastructure/repositories';
import { getRoleDefinition } from '../../../auth/domain/roles';
import { ROLE_WORKSPACES } from '../../domain/roleWorkspaceData';
import { RoleDeskHeader } from '../components/RoleDeskHeader';
import { UnitKpiGrid } from '../components/UnitKpiGrid';
import { UnitToolbox } from '../components/UnitToolbox';
import { UnitChecklistCard } from '../components/UnitChecklistCard';
import { UnitTasksList } from '../components/UnitTasksList';
import { UnitShiftNotes } from '../components/UnitShiftNotes';
import { TaskAssignmentModal } from '../../../tasks/presentation/components/TaskAssignmentModal';
import { UnitTasksDrawer } from '../../../tasks/presentation/components/UnitTasksDrawer';
import type { User } from '../../../../core/domain/types/mine.types';
import { 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  X,
  Send,
  RotateCcw
} from 'lucide-react';
import { ShiftHandoverModal } from '../components/ShiftHandover/ShiftHandoverModal';

export const UnitWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, theme } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  // Lazy initialize user and role
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('aes_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    const all = UserRepository.getAll();
    return all[1] || all[0] || null;
  });

  // Selected Unit Role to inspect or operate (defaults to logged-in user's role)
  const [selectedRoleId, setSelectedRoleId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('aes_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) return parsed.role;
      }
    } catch {
      // fallback
    }
    return 'MiningEngineer';
  });

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTasksDrawerOpen, setIsTasksDrawerOpen] = useState(false);
  const [isQuickLogModalOpen, setIsQuickLogModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [quickLogTitle, setQuickLogTitle] = useState('');
  const [quickLogDesc, setQuickLogDesc] = useState('');
  const [quickLogSent, setQuickLogSent] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('aes_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          setCurrentUser(parsed);
          if (parsed.role) setSelectedRoleId(parsed.role);
        }
      } catch (e) {
        console.warn(e);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const activeRoleDef = getRoleDefinition(selectedRoleId);
  const unitData = ROLE_WORKSPACES[selectedRoleId] || ROLE_WORKSPACES['MiningEngineer'];

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLogTitle.trim()) return;

    setQuickLogSent(true);
    setTimeout(() => {
      setQuickLogSent(false);
      setQuickLogTitle('');
      setQuickLogDesc('');
      setIsQuickLogModalOpen(false);
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex ${
      theme === 'cyber'
        ? 'bg-[#050814] text-white'
        : isDark
        ? 'bg-[#0B0F19] text-white'
        : 'bg-[#F8FAFC] text-slate-900'
    }`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-3.5 sm:p-5 md:p-8 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Breadcrumb & Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <button 
                onClick={() => navigate('/dashboard')}
                className="hover:text-indigo-400 transition-colors"
              >
                معدن
              </button>
              <span>/</span>
              <span className="text-slate-200">میز کار</span>
              <span>/</span>
              <span className="text-indigo-400 font-black">{activeRoleDef.department}</span>
            </div>

            <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
              <button
                onClick={() => setIsHandoverModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#00D2FF]/40 bg-[#00D2FF]/10 hover:bg-[#00D2FF]/20 text-[#00D2FF] text-xs font-black transition-all shadow-sm cursor-pointer"
                title="پروتکل تحویل و تحول هوشمند شیفت (Shift Handover)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تحویل و تحول شیفت</span>
              </button>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>آنلاین</span>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors"
              >
                <span>داشبورد</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Unit Workspace Header */}
          <RoleDeskHeader
            currentUser={currentUser}
            selectedRoleId={selectedRoleId}
            onSelectRole={(rId) => setSelectedRoleId(rId)}
            unitData={unitData}
            onOpenAssignModal={() => setIsAssignModalOpen(true)}
            onOpenQuickLogModal={() => setIsQuickLogModalOpen(true)}
          />

          {/* 4 Specialized KPIs + Quick Stats for this Unit */}
          <UnitKpiGrid
            kpis={unitData.kpis}
            quickStats={unitData.quickStats}
          />

          {/* Shift Handover Live Banner */}
          <div className="p-4 rounded-2xl border border-[#24356B]/40 bg-gradient-to-r from-[#111933] via-[#142147] to-[#111933] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#00D2FF]/15 text-[#00D2FF] flex items-center justify-center font-black flex-shrink-0 border border-[#00D2FF]/30">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">پروتکل تحویل و تحول هوشمند شیفت:</span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">شیفت ۱ (روز)</span>
                  <span className="text-[10px] text-slate-400 font-mono">کد: HND-1405-03-D1</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                  دستور ویژه شیفت: حفظ نرخ خروجی سنگ‌شکن اولیه در حد ۱,۱۰۰ تن بر ساعت و کنترل سرعت در تقاطع رامپ ۳
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => setIsHandoverModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#38BDF8] hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <span>مشاهده، تایید و امضای رسمی شیفت</span>
              </button>
            </div>
          </div>

          {/* Core 2-Column Operational Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left Column (8 cols): Specialized Toolbox & Tasks List */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-6">
              {/* Specialized Unit Toolbox */}
              <UnitToolbox
                tools={unitData.tools}
                departmentTitle={activeRoleDef.department}
                onTriggerModal={(actionId) => {
                  if (actionId === 'tool-p3' || actionId === 'tool-l3') {
                    setIsAssignModalOpen(true);
                  } else if (actionId === 'tool-w3' || actionId === 'tool-h4') {
                    setIsQuickLogModalOpen(true);
                  }
                }}
              />

              {/* Unit Active Tasks & Action Items */}
              <UnitTasksList
                roleId={selectedRoleId}
                currentUser={currentUser}
                onOpenAssignModal={() => setIsAssignModalOpen(true)}
                onOpenTasksDrawer={() => setIsTasksDrawerOpen(true)}
              />
            </div>

            {/* Right Column (4 cols): Shift Checklist & Operational Log Notes */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-6">
              {/* Shift Interactive Checklist */}
              <UnitChecklistCard
                roleId={selectedRoleId}
                initialItems={unitData.liveChecklist}
              />

              {/* Unit Shift Handover & Operational Notes */}
              <UnitShiftNotes
                roleId={selectedRoleId}
                authorName={currentUser?.fullName || activeRoleDef.nameFa}
                authorCode={currentUser?.code || 'AES-ENG'}
              />
            </div>
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

      {/* Unit Tasks Full Drawer */}
      <UnitTasksDrawer
        isOpen={isTasksDrawerOpen}
        onClose={() => setIsTasksDrawerOpen(false)}
        currentUser={currentUser}
        onOpenAssignModal={() => {
          setIsTasksDrawerOpen(false);
          setIsAssignModalOpen(true);
        }}
      />

      {/* Quick Shift Event Log Modal */}
      {isQuickLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl transition-all ${
            isDark ? 'bg-[#0D1322] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black">
                  ثبت فوری واقعه / گزارش شیفت واحد {activeRoleDef.department}
                </h3>
              </div>
              <button
                onClick={() => setIsQuickLogModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {quickLogSent ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 animate-bounce" />
                <h4 className="text-sm font-black text-white">گزارش با موفقیت در لاگ شیفت ثبت گردید</h4>
                <p className="text-xs text-slate-400">به‌روزرسانی کارتابل واحد در حال اعمال است...</p>
              </div>
            ) : (
              <form onSubmit={handleQuickLogSubmit} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">عنوان گزارش یا رویداد</label>
                  <input
                    type="text"
                    value={quickLogTitle}
                    onChange={(e) => setQuickLogTitle(e.target.value)}
                    placeholder="مثلا: اتمام چالزنی بلوک B-14 یا ثبت توقف اضطراری شاول"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">شرح کامل واقعه و اقدامات اصلاحی</label>
                  <textarea
                    rows={4}
                    value={quickLogDesc}
                    onChange={(e) => setQuickLogDesc(e.target.value)}
                    placeholder="توضیح کامل وضعیت، تجهیزات درگیر، مختصات پله یا رامپ و توصیه‌های شیفت بعدی..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    ثبت با نام: <strong>{currentUser?.fullName || activeRoleDef.nameFa}</strong>
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsQuickLogModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ثبت رسمی</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Shift Handover Modal */}
      <ShiftHandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        currentUser={currentUser}
        targetDepartmentKey={selectedRoleId}
        targetDepartmentName={activeRoleDef.department}
      />
    </div>
  );
};

export default UnitWorkspacePage;
