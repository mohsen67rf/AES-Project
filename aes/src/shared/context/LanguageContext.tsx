// src/shared/context/LanguageContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fa' | 'en';

interface LanguageContextType {
  lang: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

// ============================================
// دیکشنری ترجمه
// ============================================

const translations: Record<Language, Record<string, string>> = {
  fa: {
    // Header
    'header.time': 'به وقت تهران',
    'header.admin': 'مدیر کل',
    
    // Dashboard
    'dashboard.welcome': 'خوش برگشتی',
    'dashboard.subtitle': 'اینجا خلاصه‌ای از وضعیت معادن شماست',
    'dashboard.totalProduction': 'تولید کل',
    'dashboard.equipmentAvailability': 'دسترسی تجهیزات',
    'dashboard.activeMines': 'معادن فعال',
    'dashboard.safetyIndex': 'شاخص ایمنی',
    'dashboard.totalRevenue': 'درآمد کل',
    'dashboard.vsLastWeek': 'نسبت به هفته قبل',
    'dashboard.productionTrend': 'روند تولید',
    'dashboard.productionByMine': 'تولید بر اساس معدن',
    'dashboard.costDistribution': 'توزیع هزینه‌ها',
    'dashboard.recentAlerts': 'آخرین هشدارها',
    'dashboard.viewAll': 'مشاهده همه →',
    'dashboard.ton': 'تن',
    
    // Alerts
    'alert.vibration': 'لرزش شدید',
    'alert.vibration.detail': 'سنگ‌شکن #۲ - معدن A',
    'alert.fuel': 'سوخت پایین',
    'alert.fuel.detail': 'کامیون #۱۲ - معدن B',
    'alert.maintenance': 'نیاز به تعمیرات',
    'alert.maintenance.detail': 'بیل مکانیکی #۷ - معدن C',
    'alert.inspection': 'بازرسی ایمنی',
    'alert.inspection.detail': 'معدن D',
    'alert.view': 'مشاهده',
    
    // Mines
    'mine.extraction': 'استخراج',
    'mine.transport': 'حمل و نقل',
    'mine.repair': 'تعمیرات',
    'mine.other': 'سایر',
    'mine.mineA': 'معدن A',
    'mine.mineB': 'معدن B',
    'mine.mineC': 'معدن C',
    'mine.mineD': 'معدن D',
    
    // Common
    'common.loading': 'در حال بارگذاری...',
    'common.error': 'خطا',
    'common.success': 'موفقیت',
    'common.save': 'ذخیره',
    'common.cancel': 'انصراف',
    'common.delete': 'حذف',
    'common.edit': 'ویرایش',
    'common.back': 'بازگشت',
  },
  en: {
    // Header
    'header.time': 'Tehran Time',
    'header.admin': 'Admin',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.subtitle': 'Here\'s a summary of your mines',
    'dashboard.totalProduction': 'Total Production',
    'dashboard.equipmentAvailability': 'Equipment Availability',
    'dashboard.activeMines': 'Active Mines',
    'dashboard.safetyIndex': 'Safety Index',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.vsLastWeek': 'vs last week',
    'dashboard.productionTrend': 'Production Trend',
    'dashboard.productionByMine': 'Production by Mine',
    'dashboard.costDistribution': 'Cost Distribution',
    'dashboard.recentAlerts': 'Recent Alerts',
    'dashboard.viewAll': 'View All →',
    'dashboard.ton': 'Ton',
    
    // Alerts
    'alert.vibration': 'High Vibration',
    'alert.vibration.detail': 'Crusher #2 - Mine A',
    'alert.fuel': 'Low Fuel',
    'alert.fuel.detail': 'Haul Truck #12 - Mine B',
    'alert.maintenance': 'Maintenance Required',
    'alert.maintenance.detail': 'Excavator #7 - Mine C',
    'alert.inspection': 'Safety Inspection',
    'alert.inspection.detail': 'Mine D',
    'alert.view': 'View',
    
    // Mines
    'mine.extraction': 'Extraction',
    'mine.transport': 'Transport',
    'mine.repair': 'Repair',
    'mine.other': 'Other',
    'mine.mineA': 'Mine A',
    'mine.mineB': 'Mine B',
    'mine.mineC': 'Mine C',
    'mine.mineD': 'Mine D',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('aes_language') as Language | null;
    return saved || 'fa';
  });

  useEffect(() => {
    localStorage.setItem('aes_language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'fa' ? 'en' : 'fa');
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}