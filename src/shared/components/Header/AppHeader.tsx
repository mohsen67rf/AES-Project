// src/shared/components/Header/AppHeader.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { LogoFull } from '../Logo/LogoFull';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon, 
  BellIcon, 
  EnvelopeIcon, 
  SunIcon, 
  MoonIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  onSearch?: (query: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar, onSearch }) => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const isRtl = language === 'fa';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleSelectLanguage = (lang: 'fa' | 'en') => {
    setLanguage(lang);
    setShowLangMenu(false);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { lang } }));
  };

  return (
    <header 
      className={`h-16 px-6 flex items-center justify-between border-b transition-colors duration-300 z-30 sticky top-0 backdrop-blur-xl ${
        isDark 
          ? 'bg-[#0B0F19]/80 border-[#1B2333] text-white' 
          : 'bg-white/80 border-slate-200 text-slate-900'
      }`}
    >
      {/* Left side: Hamburger + Standard Logo + Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
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

        {/* لوگوی استاندارد سامانه در هدر */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="cursor-pointer flex-shrink-0"
          title="بازگشت به داشبورد اصلی سامانه مهندسی AES"
        >
          <LogoFull size={34} variant="header" />
        </div>

        <div className="relative w-full max-w-md hidden sm:block">
          <MagnifyingGlassIcon className={`w-4 h-4 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400`} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={isRtl ? 'جستجو در سامانه، بلوک‌ها، تجهیزات...' : 'Search anything...'}
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

      {/* Right side: Tools & Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with Badge 12 */}
        <div className="relative">
          <button 
            className={`p-2 rounded-xl border relative transition-colors ${
              isDark ? 'border-[#1F293D] hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title={isRtl ? 'اعلان‌ها' : 'Notifications'}
          >
            <BellIcon className="w-4 h-4" />
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7C3AED] text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-[#7C3AED]/50">
              12
            </span>
          </button>
        </div>

        {/* Messages / Mail Icon */}
        <button 
          className={`p-2 rounded-xl border transition-colors ${
            isDark ? 'border-[#1F293D] hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
          }`}
          title={isRtl ? 'پیام‌ها' : 'Messages'}
        >
          <EnvelopeIcon className="w-4 h-4" />
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isDark ? 'border-[#1F293D] hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>{language.toUpperCase()}</span>
            <ChevronDownIcon className="w-3 h-3 text-slate-400" />
          </button>

          {showLangMenu && (
            <div 
              className={`absolute top-full mt-1.5 ${isRtl ? 'left-0' : 'right-0'} w-28 rounded-xl border py-1 shadow-xl z-50 ${
                isDark ? 'bg-[#111726] border-[#1F293D] text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <button
                onClick={() => handleSelectLanguage('fa')}
                className={`w-full px-3 py-1.5 text-xs text-right hover:bg-[#7C3AED]/20 hover:text-[#A78BFA] transition-colors font-bold ${
                  language === 'fa' ? 'text-[#A78BFA] font-black' : ''
                }`}
              >
                فارسی (FA)
              </button>
              <button
                onClick={() => handleSelectLanguage('en')}
                className={`w-full px-3 py-1.5 text-xs text-left hover:bg-[#7C3AED]/20 hover:text-[#A78BFA] transition-colors font-bold ${
                  language === 'en' ? 'text-[#A78BFA] font-black' : ''
                }`}
              >
                English (EN)
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-colors ${
            isDark ? 'border-[#1F293D] hover:bg-slate-800 text-amber-400' : 'border-slate-200 hover:bg-slate-100 text-indigo-600'
          }`}
          title={isDark ? 'تغییر به روز' : 'تغییر به شب'}
        >
          {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
