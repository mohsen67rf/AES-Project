// src/modules/dashboard/presentation/components/Header/Header.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoFull } from '../../../../../shared/components/Logo/LogoFull';
import { ThemeToggle } from '../../../../../shared/components/ThemeToggle/ThemeToggle';
import { LanguageToggle } from '../../../../../shared/components/LanguageToggle/LanguageToggle';
import { 
  BellIcon, 
  UserCircleIcon, 
  EnvelopeIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [activeUserName, setActiveUserName] = useState('John Smith');
  const [activeUserRole, setActiveUserRole] = useState('System Administrator');
  const [searchQuery, setSearchQuery] = useState('');

  const isRtl = language === 'fa';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aes_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.fullName) {
          setActiveUserName(parsed.fullName);
        }
        if (parsed?.role) {
          setActiveUserRole(parsed.role === 'SUPER_ADMIN' || parsed.role === 'ADMIN' ? (isRtl ? 'مدیر ارشد سامانه' : 'System Administrator') : parsed.role);
        }
      }
    } catch {}
  }, [isRtl]);

  const bgColor = isDark ? 'bg-[#090D16]/90 border-b border-[#182030] text-white' : 'bg-white/90 border-b border-slate-200 text-slate-900';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300 ${bgColor}`}>
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Side: Logo + Sidebar Toggle + Global Search */}
        <div className="flex items-center gap-3.5 flex-1 max-w-xl">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'border-[#1F293D] hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          )}

          <div 
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer flex-shrink-0"
            title="سامانه مهندسی AES - داشبورد اصلی"
          >
            <LogoFull size={34} variant="header" />
          </div>

          {/* Search Box */}
          <div className="relative w-full max-w-sm hidden sm:block">
            <MagnifyingGlassIcon className={`w-4 h-4 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'جستجو در سامانه...' : 'Search anything...'}
              className={`w-full text-xs py-2 rounded-xl border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              } ${
                isDark 
                  ? 'bg-[#111726] border-[#1F293D] text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Center: Quick Module Navigation */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors font-medium"
          >
            داشبورد
          </button>
          <button
            onClick={() => navigate('/mining-lifecycle')}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 transition-colors font-bold flex items-center gap-1"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>چرخه ۱۳ مرحله‌ای معدن</span>
          </button>
          <button
            onClick={() => navigate('/blocks-management')}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors font-medium"
          >
            مدیریت بلوک‌ها
          </button>
          <button
            onClick={() => navigate('/mine/map')}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors font-medium"
          >
            نقشه تعاملی GIS
          </button>
        </div>

        {/* Right Side: Tools & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Dashboard link if on subpages */}
          <button
            onClick={() => navigate('/dashboard')}
            className={`p-2 rounded-xl border transition-colors ${
              isDark ? 'border-[#1F293D] hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title={isRtl ? 'داشبورد اصلی' : 'Dashboard'}
          >
            <Squares2X2Icon className="w-4 h-4" />
          </button>

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Bell */}
          <button 
            className={`p-2 rounded-xl border relative transition-colors ${
              isDark ? 'border-[#1F293D] hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title={isRtl ? 'اعلان‌ها' : 'Notifications'}
          >
            <BellIcon className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#7C3AED] text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-[#7C3AED]/50">
              12
            </span>
          </button>

          {/* User Profile Capsule */}
          <button 
            onClick={() => navigate('/users')}
            className={`flex items-center gap-2 p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isDark ? 'border-[#1F293D] hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
            }`}
            title="پروفایل کاربر"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 p-0.5">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-white">
                {activeUserName.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="hidden md:flex flex-col text-right">
              <span className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeUserName}
              </span>
              <span className="text-[9px] text-slate-400">
                {activeUserRole}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
