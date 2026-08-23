// src/shared/components/LanguageToggle/LanguageToggle.tsx

import { useLanguage } from '../../context/LanguageContext';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-white/10 transition-colors text-sm text-gray-700 dark:text-gray-300"
      aria-label="تغییر زبان"
    >
      <GlobeAltIcon className="w-4 h-4" />
      <span className="font-medium">{lang === 'fa' ? 'فارسی' : 'English'}</span>
    </button>
  );
}