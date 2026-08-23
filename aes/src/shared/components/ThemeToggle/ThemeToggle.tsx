// src/shared/components/ThemeToggle/ThemeToggle.tsx

import { useTheme } from '../../context/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300
        ${isDark 
          ? 'bg-[#1A2A3A]/80 text-[#C9A227] hover:bg-[#1A2A3A]' 
          : 'bg-gray-200/80 text-[#4A6A8A] hover:bg-gray-300/80'
        }
      `}
      aria-label="تغییر تم"
    >
      {/* آیکون */}
      {isDark ? (
        <MoonIcon className="w-4 h-4" />
      ) : (
        <SunIcon className="w-4 h-4" />
      )}

      {/* دایره توگل */}
      <div className={`
        relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0
        ${isDark ? 'bg-[#C9A227]/30' : 'bg-gray-400/50'}
      `}>
        <div
          className={`
            absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300
            ${isDark ? 'left-6' : 'left-0.5'}
          `}
          style={{ 
            transform: isDark ? 'translateX(0)' : 'translateX(0)',
          }}
        />
      </div>
    </button>
  );
}