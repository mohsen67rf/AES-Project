// src/modules/dashboard/presentation/components/Header/Header.tsx

import { motion } from 'framer-motion';
import { LogoFull } from '../../../../shared/components/Logo/LogoFull';
import { ThemeToggle } from '../../../../shared/components/ThemeToggle/ThemeToggle';
import { LanguageToggle } from '../../../../shared/components/LanguageToggle/LanguageToggle';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/10 dark:bg-black/30 border-b border-white/10 dark:border-white/5"
    >
      {/* خط درخشش حرکت‌دهنده */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 -translate-x-full animate-shine bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
      </div>

      <div className="flex items-center justify-between px-6 py-4 relative">
        {/* لوگو */}
        <div className="flex items-center gap-4">
          <LogoFull size={36} variant="dark" />
        </div>

        {/* ابزارهای سمت راست */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative">
            <BellIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          <div className="flex items-center gap-2">
            <UserCircleIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              مدیر کل
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}