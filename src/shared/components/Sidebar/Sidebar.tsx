// src/shared/components/Sidebar/Sidebar.tsx

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { LogoFull } from '../Logo/LogoFull';
import { 
  Squares2X2Icon, 
  BuildingOffice2Icon, 
  ChartBarIcon, 
  TruckIcon, 
  ArchiveBoxIcon, 
  DocumentTextIcon, 
  MapIcon, 
  WrenchScrewdriverIcon, 
  BellAlertIcon, 
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ChevronUpDownIcon,
  SparklesIcon,
  CubeIcon,
  BriefcaseIcon,
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Zap } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { theme, setTheme, isDark } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isRtl = language === 'fa';

  // Close on Escape key press on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Navigation Items matching the reference image + existing project modules
  const menuItems = [
    { id: 'workspace', label: isRtl ? 'میز کار اختصاصی واحد' : 'Role & Unit Desk', path: '/workspace', icon: BriefcaseIcon, badge: isRtl ? 'تخصصی' : 'Live' },
    { id: 'tally-dispatch', label: isRtl ? 'کنترل‌چی و سرویس‌شمار' : 'Haulage Tally Desk', path: '/tally-controller', icon: ClipboardDocumentCheckIcon, badge: isRtl ? 'سرویس‌شمار' : 'Tally' },
    { id: 'shift-handover', label: isRtl ? 'تحویل و تحول شیفت' : 'Shift Handover', path: '/shift-handover', icon: ArrowPathIcon, badge: isRtl ? 'هوشمند' : 'Smart' },
    { id: 'dashboard', label: isRtl ? 'داشبورد عمومی' : 'General Dashboard', path: '/dashboard', icon: Squares2X2Icon },
    { id: 'management-kpi', label: isRtl ? 'مدیریت و شاخص‌ها (KPI)' : 'Executive Management (KPIs)', path: '/management-dashboard', icon: ChartBarIcon },
    { id: 'mines', label: isRtl ? 'معادن' : 'Mines', path: '/mine', icon: BuildingOffice2Icon },
    { id: 'lifecycle', label: isRtl ? 'چرخه ساب‌بلوک‌ها' : 'Mining Lifecycle', path: '/mining-lifecycle', icon: SparklesIcon },
    { id: 'blocks', label: isRtl ? 'مدیریت بلوک‌ها' : 'Blocks', path: '/blocks-management', icon: CubeIcon },
    { id: 'equipment', label: isRtl ? 'تجهیزات و ماشین‌آلات' : 'Equipment', path: '/equipment', icon: TruckIcon },
    { id: 'warehouse', label: isRtl ? 'انبار و مواد ناریه' : 'Warehouse', path: '/warehouse', icon: ArchiveBoxIcon },
    { id: 'reports', label: isRtl ? 'گزارش‌ها و ممیزی' : 'Reports', path: '/reports', icon: DocumentTextIcon },
    { id: 'gis', label: isRtl ? 'نقشه و GIS' : 'GIS', path: '/mine/map', icon: MapIcon },
    { id: 'maintenance', label: isRtl ? 'تعمیر و نگهداری' : 'Maintenance', path: '/maintenance', icon: WrenchScrewdriverIcon },
    { id: 'alerts', label: isRtl ? 'هشدارها' : 'Alerts', path: '/alerts', icon: BellAlertIcon, badge: 4 },
    { id: 'settings', label: isRtl ? 'تنظیمات سامانه' : 'Settings', path: '/settings', icon: Cog6ToothIcon },
  ];

  let currentUserName = 'John Smith';
  let currentUserRole = 'System Administrator';
  try {
    const saved = localStorage.getItem('aes_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.fullName) currentUserName = parsed.fullName;
      if (parsed.role) currentUserRole = parsed.role === 'SUPER_ADMIN' || parsed.role === 'ADMIN' ? (isRtl ? 'مدیر ارشد سامانه' : 'System Administrator') : parsed.role;
    }
  } catch (err) {
    console.warn('Session load warning', err);
  }

  const handleNav = (path: string) => {
    navigate(path);
    if (onClose && typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-label="بستن منوی جانبی"
        />
      )}

      <aside
        className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-72 lg:w-64 flex flex-col justify-between select-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen 
            ? 'translate-x-0 shadow-2xl lg:shadow-none' 
            : isRtl 
              ? 'translate-x-full lg:hidden' 
              : '-translate-x-full lg:hidden'
        } ${
          isDark 
            ? 'bg-[#0C132B] border-[#24356B]/30 text-[#8E9EB8]' 
            : 'bg-white border-slate-200/80 text-slate-700 shadow-sm'
        } ${isRtl ? 'border-l' : 'border-r'} h-full max-h-screen overflow-hidden`}
      >
        {/* Top Section: Logo + Close Button + Navigation Items */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 flex-1 min-h-0">
          {/* Brand Header with Mobile Close Button */}
          <div className="flex items-center justify-between py-1">
            <div 
              onClick={() => handleNav('/dashboard')}
              className="cursor-pointer"
              title="داشبورد اصلی سامانه مهندسی معدن AES"
            >
              <LogoFull size={36} variant="sidebar" />
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
                title="بستن منو"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

        {/* Navigation List */}
        <nav className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) ||
              (item.path === '/mine' && location.pathname.startsWith('/pits')) ||
              (item.path === '/mining-lifecycle' && location.pathname.startsWith('/subblocks'));

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-[#1A264F] border border-[#00D2FF]/30 text-[#00D2FF] shadow-[0_4px_16px_rgba(0,210,255,0.15)] font-bold'
                    : isDark
                    ? 'text-[#8E9EB8] hover:text-[#F1F5F9] hover:bg-[#141F42]'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 transition-colors ${
                      isActive 
                        ? 'text-[#00D2FF]' 
                        : isDark 
                        ? 'text-[#8E9EB8] group-hover:text-[#00D2FF]' 
                        : 'text-slate-500 group-hover:text-[#00D2FF]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && !isActive && (
                  <span className="w-5 h-5 rounded-full bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30 text-[10px] flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Theme Mode Pill & User Profile */}
      <div className="p-4 space-y-3 border-t border-[#24356B]/30">
        {/* 3-Way Theme Mode Switcher (Light | Dark | Cyber Neon) */}
        <div 
          className={`grid grid-cols-3 p-1 rounded-full border transition-all gap-1 ${
            theme === 'cyber'
              ? 'bg-[#080E24] border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
              : isDark 
                ? 'bg-[#141F42] border-[#24356B]/40 text-[#8E9EB8]' 
                : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-full text-xs font-bold transition-all ${
              theme === 'light'
                ? 'bg-white text-amber-500 shadow-sm' 
                : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="تم روز"
          >
            <SunIcon className="w-3.5 h-3.5" />
            <span className="text-[10px]">{isRtl ? 'روز' : 'Light'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-full text-xs font-bold transition-all ${
              theme === 'dark' 
                ? 'bg-[#1A264F] text-[#00D2FF] shadow-[0_0_10px_rgba(0,210,255,0.2)] border border-[#00D2FF]/30' 
                : 'text-[#8E9EB8] hover:text-white'
            }`}
            title="تم شب"
          >
            <MoonIcon className="w-3.5 h-3.5" />
            <span className="text-[10px]">{isRtl ? 'شب' : 'Dark'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('cyber')}
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-full text-xs font-black transition-all ${
              theme === 'cyber' 
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.6)] font-black' 
                : 'text-cyan-400/70 hover:text-cyan-300'
            }`}
            title="تم نئونی سایبر"
          >
            <Zap className={`w-3.5 h-3.5 ${theme === 'cyber' ? 'fill-slate-950' : 'fill-cyan-400'}`} />
            <span className="text-[10px]">{isRtl ? 'سایبر' : 'Cyber'}</span>
          </button>
        </div>

        {/* User Card */}
        <div 
          onClick={() => navigate('/users')}
          className={`flex items-center justify-between p-2 rounded-2xl cursor-pointer transition-colors ${
            isDark ? 'hover:bg-[#141F42] text-[#F1F5F9]' : 'hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-black text-white">
                {currentUserName.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentUserName}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                {currentUserRole}
              </span>
            </div>
          </div>
          <ChevronUpDownIcon className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </aside>
  </>
  );
};

export default Sidebar;
