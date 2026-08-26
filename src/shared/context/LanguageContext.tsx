// src/shared/context/LanguageContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fa' | 'en';

const translations: Record<string, Record<string, string>> = {
  fa: {
    'dashboard.title': 'داشبورد عملیات معدن',
    'dashboard.productionByMine': 'تولید به تفکیک معادن و پیت‌ها',
    'dashboard.costDistribution': 'توزیع هزینه‌های استخراج و فرآوری',
    'dashboard.recentAlerts': 'هشدارهای بحرانی و پایش کیفیت',
    'dashboard.auditTrail': 'سامانه ممیزی و تاریخچه وقایع',
    'common.search': 'جستجو...',
    'common.filter': 'فیلتر',
    'common.save': 'ذخیره',
    'common.cancel': 'انصراف',
    'common.edit': 'ویرایش',
    'common.delete': 'حذف',
  },
  en: {
    'dashboard.title': 'Mining Operations Dashboard',
    'dashboard.productionByMine': 'Production by Mine & Pits',
    'dashboard.costDistribution': 'Mining & Processing Cost Distribution',
    'dashboard.recentAlerts': 'Critical Alerts & Quality Monitoring',
    'dashboard.auditTrail': 'Audit Trail & Activity Logging',
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
  },
};

interface LanguageContextType {
  language: Language;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('aes_language');
    return (saved as Language) || 'fa';
  });

  const dir = language === 'fa' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('aes_language', language);
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const langDict = translations[language] || translations.fa;
    if (langDict[key]) return langDict[key];
    const fallback = translations.fa[key];
    if (fallback) return fallback;
    const parts = key.split('.');
    return parts[parts.length - 1] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'fa',
      dir: 'rtl',
      setLanguage: () => {},
      t: (k: string) => k,
    };
  }
  return context;
};
