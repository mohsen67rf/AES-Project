// src/shared/components/Header/AppHeader.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { LogoFull } from '../Logo/LogoFull';
import { AlertBell } from '../AlertBell/AlertBell';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { TaskService } from '../../../modules/tasks/services/TaskService';
import { TaskAssignmentModal } from '../../../modules/tasks/presentation/components/TaskAssignmentModal';
import { UnitTasksDrawer } from '../../../modules/tasks/presentation/components/UnitTasksDrawer';
import { UserProfileModal } from '../../../modules/auth/presentation/components/UserProfileModal';
import { SYSTEM_ROLES, getRoleDefinition } from '../../../modules/auth/domain/roles';
import { UserRepository } from '../../../core/infrastructure/repositories';
import type { User } from '../../../core/domain/types/mine.types';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon, 
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import {
  ClipboardList,
  Plus,
  User as UserIcon,
  LogOut,
} from 'lucide-react';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  onSearch?: (query: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar, onSearch }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Active User & Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingTasksCount, setPendingTasksCount] = useState<number>(0);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTasksDrawerOpen, setIsTasksDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isRtl = language === 'fa';

  const loadSessionAndTasks = () => {
    let user: User | null = null;
    try {
      const saved = localStorage.getItem('aes_session');
      if (saved) {
        user = JSON.parse(saved);
      }
    } catch (e) {
      console.warn(e);
    }

    if (!user) {
      // Default to Mining Engineer or Admin
      const allUsers = UserRepository.getAll();
      user = allUsers[1] || allUsers[0] || {
        id: 'usr-02',
        code: 'ENG-201',
        fullName: 'دکتر علیرضا کاظمی',
        email: 'kazemi@aes-mining.ir',
        role: 'MiningEngineer',
        department: 'استخراج و فنی',
        isActive: true,
        phone: '09121110002',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('aes_session', JSON.stringify(user));
    }

    setCurrentUser(user);
    if (user) {
      const tasks = TaskService.getTasksForUser(user);
      const pending = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
      setPendingTasksCount(pending);
    }
  };

  useEffect(() => {
    loadSessionAndTasks();

    const handleStorage = () => loadSessionAndTasks();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('taskUpdated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('taskUpdated', handleStorage);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleSelectLanguage = (lang: 'fa' | 'en') => {
    setLanguage(lang);
    setShowLangMenu(false);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { lang } }));
  };

  const handleSwitchUser = (newUser: User) => {
    localStorage.setItem('aes_session', JSON.stringify(newUser));
    setCurrentUser(newUser);
    loadSessionAndTasks();
    setShowUserMenu(false);
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = () => {
    localStorage.removeItem('aes_session');
    navigate('/login');
  };

  const roleDef = currentUser ? getRoleDefinition(currentUser.role) : SYSTEM_ROLES[0];

  return (
    <>
      <header 
        className={`h-16 px-4 md:px-6 flex items-center justify-between border-b transition-colors duration-300 z-30 sticky top-0 backdrop-blur-xl ${
          isDark 
            ? 'bg-[#101935]/95 border-[#24356B]/30 text-[#F1F5F9]' 
            : 'bg-white/85 border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        {/* Left side: Hamburger + Standard Logo + Global Search */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'border-[#24356B]/40 hover:bg-[#141F42] text-[#8E9EB8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          )}

          {/* Logo */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer flex-shrink-0"
            title="بازگشت به داشبورد اصلی سامانه مهندسی AES"
          >
            <LogoFull size={34} variant="header" />
          </div>

          <div className="relative w-full max-w-md hidden sm:block">
            <MagnifyingGlassIcon className={`w-4 h-4 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-[#8E9EB8]`} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={isRtl ? 'جستجو در سامانه، بلوک‌ها، تجهیزات، تسک‌ها...' : 'Search anything...'}
              className={`w-full text-xs py-2 rounded-full border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#00D2FF]/40 ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              } ${
                isDark 
                  ? 'bg-[#141F42] border-[#24356B]/40 text-[#F1F5F9] placeholder-[#8E9EB8]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Right side: Task Assignment Button, Unit Inbox, Alert Bell, Language, Theme, User Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Assign Task Button */}
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black text-slate-950 bg-gradient-to-r from-[#00D2FF] to-[#38BDF8] hover:brightness-110 shadow-[0_0_12px_rgba(0,210,255,0.3)] transition-all active:scale-95 cursor-pointer"
            title="ارجاع تسک جدید به واحدها"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isRtl ? 'ارجاع تسک به واحدها' : 'Assign Task'}</span>
          </button>

          {/* Unit Tasks Inbox with live Badge */}
          <button
            onClick={() => setIsTasksDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border relative transition-all ${
              isDark 
                ? 'bg-[#141F42] border-[#24356B]/40 hover:bg-[#1E2D5C] text-[#00D2FF]' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-indigo-700 shadow-sm'
            }`}
            title="کارتابل تسک‌های ارجاعی واحد من"
          >
            <ClipboardList className="w-4 h-4 text-[#00D2FF]" />
            <span className="text-xs font-bold hidden sm:inline text-[#F1F5F9]">{isRtl ? 'کارتابل تسک‌ها' : 'Tasks'}</span>
            {pendingTasksCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#00D2FF] text-slate-950 text-[10px] font-black flex items-center justify-center shadow-sm">
                {pendingTasksCount}
              </span>
            )}
          </button>

          {/* System Alerts Bell */}
          <AlertBell />

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className={`px-2.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1 transition-colors ${
                isDark ? 'bg-[#141F42] border-[#24356B]/40 hover:bg-[#1E2D5C] text-[#8E9EB8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>{language.toUpperCase()}</span>
              <ChevronDownIcon className="w-3 h-3 text-[#8E9EB8]" />
            </button>

            {showLangMenu && (
              <div 
                className={`absolute top-full mt-1.5 ${isRtl ? 'left-0' : 'right-0'} w-28 rounded-2xl border py-1 shadow-xl z-50 ${
                  isDark ? 'bg-[#1A264F] border-[#24356B]/50 text-white shadow-[0_12px_32px_rgba(7,11,26,0.6)]' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <button
                  onClick={() => handleSelectLanguage('fa')}
                  className={`w-full px-3 py-1.5 text-xs text-right hover:bg-[#00D2FF]/20 hover:text-[#00D2FF] transition-colors font-bold ${
                    language === 'fa' ? 'text-[#00D2FF] font-black' : ''
                  }`}
                >
                  فارسی (FA)
                </button>
                <button
                  onClick={() => handleSelectLanguage('en')}
                  className={`w-full px-3 py-1.5 text-xs text-left hover:bg-[#00D2FF]/20 hover:text-[#00D2FF] transition-colors font-bold ${
                    language === 'en' ? 'text-[#00D2FF] font-black' : ''
                  }`}
                >
                  English (EN)
                </button>
              </div>
            )}
          </div>

          {/* Theme Selector (Light | Dark | Cyber Neon) */}
          <ThemeToggle />

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-full border transition-all ${
                isDark 
                  ? 'bg-[#141F42] border-[#24356B]/40 hover:border-[#00D2FF]/50' 
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00D2FF] to-[#38BDF8] p-0.5 shadow-sm">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser?.fullName || 'کاربر'}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <div className="text-right hidden md:block">
                <span className="text-xs font-black block leading-tight truncate max-w-[100px] text-[#F1F5F9]">
                  {currentUser?.fullName || 'کاربر سامانه'}
                </span>
                <span className="text-[10px] text-[#00D2FF] font-bold block truncate max-w-[100px]">
                  {roleDef.nameFa}
                </span>
              </div>

              <ChevronDownIcon className="w-3.5 h-3.5 text-[#8E9EB8]" />
            </button>

            {showUserMenu && (
              <div
                className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} w-64 rounded-[20px] border p-2 shadow-2xl z-50 space-y-1 ${
                  isDark ? 'bg-[#1A264F] border-[#24356B]/50 text-white shadow-[0_12px_32px_rgba(7,11,26,0.6)]' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {/* Profile Header Info */}
                <div className="p-3 rounded-xl bg-[#141F42] border border-[#24356B]/40 mb-1">
                  <p className="text-xs font-black text-[#F1F5F9]">{currentUser?.fullName}</p>
                  <p className="text-[10px] text-[#00D2FF] mt-0.5">{roleDef.department} • {currentUser?.code}</p>
                </div>

                {/* Profile & Tasks Action */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-right hover:bg-[#00D2FF]/15 hover:text-[#00D2FF] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-[#00D2FF]" />
                    <span>پروفایل من و تسک‌های واحد</span>
                  </div>
                  {pendingTasksCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#00D2FF] text-slate-950 font-black">
                      {pendingTasksCount}
                    </span>
                  )}
                </button>

                {/* Assign Task */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsAssignModalOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-right hover:bg-[#00D2FF]/15 hover:text-[#00D2FF] flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4 text-purple-400" />
                  <span>ارجاع تسک جدید (Task Assignment)</span>
                </button>

                {/* Switch Role Quick Links */}
                <div className="pt-2 border-t border-slate-700/50">
                  <p className="px-3 text-[10px] font-bold text-slate-400 mb-1">ورود سریع با نقش‌های سازمانی:</p>
                  <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-0.5">
                    {UserRepository.getAll().slice(0, 6).map((u) => {
                      const r = getRoleDefinition(u.role);
                      const isCurrent = currentUser?.id === u.id || currentUser?.code === u.code;
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSwitchUser(u)}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-[11px] text-right flex items-center justify-between transition-colors ${
                            isCurrent 
                              ? 'bg-indigo-600/30 text-indigo-300 font-black' 
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{u.fullName}</span>
                          <span className="text-[10px] text-slate-400">{r.nameFa}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Logout */}
                <div className="pt-1 border-t border-slate-700/50">
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 text-right flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>خروج از سامانه</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Task Assignment Modal */}
      <TaskAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          loadSessionAndTasks();
        }}
        currentUser={currentUser}
        onTaskCreated={() => {
          loadSessionAndTasks();
        }}
      />

      {/* Unit Tasks Drawer */}
      <UnitTasksDrawer
        isOpen={isTasksDrawerOpen}
        onClose={() => {
          setIsTasksDrawerOpen(false);
          loadSessionAndTasks();
        }}
        currentUser={currentUser}
        onOpenAssignModal={() => {
          setIsTasksDrawerOpen(false);
          setIsAssignModalOpen(true);
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          loadSessionAndTasks();
        }}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onOpenAssignModal={() => {
          setIsProfileModalOpen(false);
          setIsAssignModalOpen(true);
        }}
        onOpenTasksDrawer={() => {
          setIsProfileModalOpen(false);
          setIsTasksDrawerOpen(true);
        }}
      />
    </>
  );
};

export default AppHeader;
