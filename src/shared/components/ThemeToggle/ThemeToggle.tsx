// src/shared/components/ThemeToggle/ThemeToggle.tsx

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all ${
        isDark 
          ? 'bg-[#13233C] border-[#2A3A5A] text-[#C9A227] hover:bg-[#1A2E4E]' 
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
      }`}
      title={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
    >
      {isDark ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5 text-indigo-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
