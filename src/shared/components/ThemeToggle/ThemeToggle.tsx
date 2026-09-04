// src/shared/components/ThemeToggle/ThemeToggle.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEME_OPTIONS } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { Sparkles, Zap, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeButtonIcon = () => {
    if (theme === 'cyber') {
      return <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400 animate-pulse drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />;
    }
    if (theme === 'dark') {
      return <MoonIcon className="w-4 h-4 text-indigo-400" />;
    }
    return <SunIcon className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
          theme === 'cyber'
            ? 'bg-[#090F26] border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.35)] hover:border-cyan-300'
            : isDark 
              ? 'bg-[#111726] border-[#1F293D] text-amber-400 hover:bg-slate-800' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
        }`}
        title={isRtl ? 'انتخاب تم سامانه (روز، شب، سایبر نئون)' : 'Switch Theme (Light, Dark, Cyber Neon)'}
      >
        {getThemeButtonIcon()}
      </button>

      {isOpen && (
        <div 
          className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} w-56 rounded-2xl border p-2 shadow-2xl z-50 space-y-1.5 backdrop-blur-xl ${
            theme === 'cyber'
              ? 'bg-[#080E24]/95 border-cyan-400/40 text-white shadow-[0_0_25px_rgba(0,240,255,0.25)]'
              : isDark 
                ? 'bg-[#0E1524]/95 border-slate-700 text-white shadow-xl' 
                : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
          }`}
        >
          <div className="px-2.5 py-1.5 border-b border-slate-700/40 text-[11px] font-bold text-slate-400 flex items-center justify-between">
            <span>{isRtl ? 'تم و ظاهر سامانه' : 'Theme Mode'}</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          {THEME_OPTIONS.map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? opt.id === 'cyber'
                      ? 'bg-gradient-to-r from-cyan-950/80 to-pink-950/80 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : opt.id === 'dark'
                        ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-200'
                        : 'bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300'
                    : isDark
                      ? 'hover:bg-slate-800/70 text-slate-300'
                      : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{opt.icon}</span>
                  <div className="text-right">
                    <span className="block leading-tight">{isRtl ? opt.nameFa : opt.nameEn}</span>
                    {opt.id === 'cyber' && (
                      <span className="text-[9px] text-pink-400 font-normal">Holographic Neon UI</span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Check className={`w-4 h-4 ${opt.id === 'cyber' ? 'text-cyan-400' : 'text-indigo-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;

