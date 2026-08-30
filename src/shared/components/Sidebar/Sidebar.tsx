// src/shared/components/Sidebar/Sidebar.tsx

import React from 'react';
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
  CubeIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const { isDark, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isRtl = language === 'fa';

  // Navigation Items matching the reference image + existing project modules
  const menuItems = [
    { id: 'dashboard', label: isRtl ? 'داشبورد' : 'Dashboard', path: '/dashboard', icon: Squares2X2Icon },
    { id: 'mines', label: isRtl ? 'معادن' : 'Mines', path: '/mine', icon: BuildingOffice2Icon },
    { id: 'production', label: isRtl ? 'تولید و عیار' : 'Production', path: '/management-dashboard', icon: ChartBarIcon },
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
  };

  if (!isOpen) return null;

  return (
    <aside
      className={`w-64 flex-shrink-0 flex flex-col justify-between select-none transition-all duration-300 z-40 ${
        isDark 
          ? 'bg-[#090D16] border-[#182030] text-slate-200' 
          : 'bg-white border-slate-200/80 text-slate-700 shadow-sm'
      } ${isRtl ? 'border-l' : 'border-r'}`}
      style={{ minHeight: '100vh' }}
    >
      {/* Top Section: Logo + Navigation Items */}
      <div className="p-5 flex flex-col gap-6">
        {/* Brand Header */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="cursor-pointer py-1"
        >
          <LogoFull size={38} variant="sidebar" />
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-250px)] pr-1 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) ||
              (item.path === '/mine' && location.pathname.startsWith('/pits')) ||
              (item.path === '/mining-lifecycle' && location.pathname.startsWith('/subblocks'));

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-white shadow-lg shadow-[#6366F1]/25 font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 transition-colors ${
                      isActive 
                        ? 'text-white' 
                        : isDark 
                        ? 'text-slate-400 group-hover:text-cyan-400' 
                        : 'text-slate-500 group-hover:text-purple-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && !isActive && (
                  <span className="w-5 h-5 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40 text-[10px] flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Theme Mode Pill & User Profile */}
      <div className="p-4 space-y-3 border-t border-slate-800/40 dark:border-slate-800/60">
        {/* Dark / Light Mode Toggle Switcher as shown in the reference image */}
        <div 
          onClick={toggleTheme}
          className={`flex items-center justify-between p-1.5 rounded-2xl cursor-pointer border transition-all ${
            isDark 
              ? 'bg-[#111726] border-[#1F293D] text-slate-300' 
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <div className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl text-xs font-bold transition-all ${
            !isDark 
              ? 'bg-white text-amber-500 shadow-sm' 
              : 'text-slate-400 hover:text-white'
          }`}>
            <SunIcon className="w-4 h-4" />
            <span className="text-[11px]">{isRtl ? 'روز' : 'Light'}</span>
          </div>

          <div className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isDark 
              ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30' 
              : 'text-slate-400 hover:text-slate-900'
          }`}>
            <MoonIcon className="w-4 h-4" />
            <span className="text-[11px]">{isRtl ? 'شب' : 'Dark'}</span>
          </div>
        </div>

        {/* User Card */}
        <div 
          onClick={() => navigate('/users')}
          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
            isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100'
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
  );
};

export default Sidebar;
