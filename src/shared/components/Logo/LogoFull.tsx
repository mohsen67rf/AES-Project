// src/shared/components/Logo/LogoFull.tsx

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import aesLogoImg from '../../../assets/images/aes_logo.jpg';

interface LogoFullProps {
  size?: number;
  variant?: 'auth' | 'dashboard' | 'header' | 'compact' | 'sidebar';
  className?: string;
  showSubtitle?: boolean;
  showText?: boolean;
  onClick?: () => void;
}

export const LogoFull: React.FC<LogoFullProps> = ({ 
  size = 38, 
  variant = 'dashboard',
  className = '',
  showSubtitle = true,
  showText = true,
  onClick
}) => {
  const { isDark } = useTheme();

  // در حالت لاگین (variant="auth"): نمایش پرچم و لوگوی سه‌بعدی شیشه‌ای با جلوه‌های نوری نئونی و هایپر-تک
  if (variant === 'auth') {
    return (
      <div 
        onClick={onClick}
        className={`flex flex-col items-center select-none group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        {/* قاب شیشه‌ای مدرن لوگو */}
        <div className="relative flex items-center justify-center">
          {/* هاله نور پس‌زمینه نئونی */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-indigo-500/20 to-amber-500/30 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative rounded-3xl p-1.5 bg-gradient-to-b from-cyan-400/40 via-slate-800/40 to-slate-950/80 border border-cyan-500/30 shadow-2xl backdrop-blur-md overflow-hidden">
            <img
              src={aesLogoImg}
              alt="AES Mining Engineering Assistant System Logo"
              referrerPolicy="no-referrer"
              className="w-32 h-32 md:w-36 md:h-36 object-contain rounded-2xl drop-shadow-[0_10px_25px_rgba(0,212,255,0.35)] transform transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                // فال‌بک به مسیر عمومی در صورت نیاز
                const target = e.currentTarget;
                if (!target.src.includes('/aes_logo.jpg')) {
                  target.src = '/aes_logo.jpg';
                }
              }}
            />
          </div>
        </div>

        {/* متن عنوان مهندسی AES */}
        {showText && (
          <div className="flex flex-col items-center mt-4 text-center">
            <div className="flex items-center gap-2">
              <span 
                className="text-3xl md:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-blue-300 font-sans drop-shadow-[0_2px_10px_rgba(0,212,255,0.4)]"
                style={{ letterSpacing: '0.15em' }}
              >
                AES
              </span>
            </div>
            {showSubtitle && (
              <div className="mt-1 flex flex-col items-center gap-0.5">
                <span 
                  className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-cyan-400/90 whitespace-nowrap"
                  style={{ letterSpacing: '0.22em' }}
                >
                  ASSISTANT ENGINEER SYSTEM
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  سامانه هوشمند و یکپارچه مهندسی و مدیریت معدن
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ابعاد استاندارد برای هدر و سایدبار (Header / Dashboard / Sidebar / Compact)
  const logoHeight = size || (variant === 'sidebar' ? 38 : 36);
  const logoWidth = logoHeight;

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* نشان شیشه‌ای لوگوی AES در ابعاد استاندارد */}
      <div 
        className="relative flex-shrink-0 flex items-center justify-center rounded-xl p-0.5 bg-slate-900/60 border border-cyan-500/30 shadow-md shadow-cyan-500/10 group-hover:border-cyan-400/60 transition-all duration-300 overflow-hidden"
        style={{ width: logoWidth + 4, height: logoHeight + 4 }}
      >
        <img
          src={aesLogoImg}
          alt="AES Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain rounded-lg drop-shadow-[0_2px_8px_rgba(0,212,255,0.25)] transform transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('/aes_logo.jpg')) {
              target.src = '/aes_logo.jpg';
            }
          }}
        />
      </div>

      {/* متن برند در هدر */}
      {showText && (
        <div className="flex flex-col justify-center text-right leading-tight">
          <div className="flex items-center gap-1.5">
            <span 
              className={`font-black tracking-wider text-base md:text-lg font-sans leading-none transition-colors ${
                isDark 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-100 group-hover:from-cyan-200 group-hover:to-white' 
                  : 'text-slate-900 group-hover:text-cyan-700'
              }`}
              style={{ letterSpacing: '0.08em' }}
            >
              AES
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 leading-none">
              MINING
            </span>
          </div>
          {showSubtitle && (
            <span 
              className={`text-[8.5px] font-bold tracking-wider uppercase mt-0.5 whitespace-nowrap leading-none ${
                isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700'
              }`}
              style={{ letterSpacing: '0.08em' }}
            >
              Assistant Engineer System
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default LogoFull;

