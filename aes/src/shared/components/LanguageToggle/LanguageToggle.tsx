// src/shared/components/LanguageToggle/LanguageToggle.tsx

import { useState } from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export function LanguageToggle() {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');

  const toggleLang = () => {
    const newLang = lang === 'fa' ? 'en' : 'fa';
    setLang(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('language', newLang);
  };

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/10 transition-colors text-sm"
    >
      <GlobeAltIcon className="w-4 h-4" />
      <span>{lang === 'fa' ? 'EN' : 'FA'}</span>
    </button>
  );
}