// src/shared/components/LanguageToggle/LanguageToggle.tsx

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { LanguageIcon } from '@heroicons/react/24/outline';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { isDark } = useTheme();

  const handleToggle = () => {
    const nextLang = language === 'fa' ? 'en' : 'fa';
    setLanguage(nextLang);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { lang: nextLang } }));
  };

  return (
    <button
      onClick={handleToggle}
      className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
        isDark 
          ? 'bg-[#13233C] border-[#2A3A5A] text-slate-300 hover:text-white hover:bg-[#1A2E4E]' 
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
      }`}
      title="تغییر زبان"
    >
      <LanguageIcon className="w-4 h-4 text-[#00D4FF]" />
      <span>{language === 'fa' ? 'FA' : 'EN'}</span>
    </button>
  );
};

export default LanguageToggle;
