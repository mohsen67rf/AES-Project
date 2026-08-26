// src/shared/components/Logo/LogoFull.tsx

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';

interface LogoFullProps {
  size?: number;
  variant?: 'auth' | 'dashboard' | 'compact';
  className?: string;
}

export const LogoFull: React.FC<LogoFullProps> = ({ size = 32, className = '' }) => {
  const { isDark } = useTheme();

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="rounded-xl bg-gradient-to-tr from-[#00D4FF] via-[#0099CC] to-[#C9A227] p-2 flex items-center justify-center shadow-lg shadow-[#00D4FF]/20"
        style={{ width: size + 8, height: size + 8 }}
      >
        <CubeTransparentIcon className="w-full h-full text-slate-950 stroke-[2]" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="font-black tracking-tight text-base bg-gradient-to-r from-[#00D4FF] via-[#38BDF8] to-[#C9A227] bg-clip-text text-transparent">
            AES MINE
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/30">
            PRO
          </span>
        </div>
        <span className={`text-[10px] font-medium leading-none ${isDark ? 'text-[#8A9DB0]' : 'text-slate-500'}`}>
          سامانه هوشمند مدیریت عملیات معدن
        </span>
      </div>
    </div>
  );
};

export default LogoFull;
