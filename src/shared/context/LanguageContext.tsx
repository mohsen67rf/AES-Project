// src/shared/context/LanguageContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fa' | 'en';

const translations: Record<Language, Record<string, string>> = {
  fa: {
    // Navigation
    'nav.dashboard': 'داشبورد',
    'nav.mines': 'معادن و پیت‌ها',
    'nav.production': 'تولید و عیار',
    'nav.lifecycle': 'چرخه ساب‌بلوک‌ها',
    'nav.blocks': 'مدیریت بلوک‌ها',
    'nav.equipment': 'تجهیزات و ماشین‌آلات',
    'nav.warehouse': 'انبار و مواد ناریه',
    'nav.reports': 'گزارش‌ها و ممیزی',
    'nav.gis': 'نقشه و GIS',
    'nav.maintenance': 'تعمیر و نگهداری',
    'nav.alerts': 'هشدارها و رخدادها',
    'nav.settings': 'تنظیمات سامانه',
    'nav.users': 'مدیریت کاربران',

    // Dashboard
    'dashboard.title': 'داشبورد عملیات معدن',
    'dashboard.subtitle': 'وضعیت زنده معادن، تولید و شاخص‌های استخراج',
    'dashboard.welcome': 'خوش آمدید',
    'dashboard.overview': 'نمای کلی داشبورد',
    'dashboard.productionByMine': 'تولید به تفکیک معادن و پیت‌ها',
    'dashboard.costDistribution': 'توزیع هزینه‌های استخراج و فرآوری',
    'dashboard.recentAlerts': 'هشدارهای بحرانی و پایش کیفیت',
    'dashboard.auditTrail': 'سامانه ممیزی و تاریخچه وقایع',
    'dashboard.productionTrend': 'روند تولید استخراجی',
    'dashboard.mapOverview': 'نقشه پراکندگی معادن و پیت‌ها',
    'dashboard.kpi.totalProduction': 'مجموع تولید',
    'dashboard.kpi.equipmentAvailability': 'آمادگی تجهیزات',
    'dashboard.kpi.activeMines': 'معادن فعال',
    'dashboard.kpi.safetyIndex': 'شاخص ایمنی (HSE)',
    'dashboard.kpi.totalRevenue': 'درآمد تخمینی کل',
    'dashboard.viewAll': 'مشاهده همه',

    // Mine & Map Studio
    'map.title': 'مدیریت نقشه',
    'map.subtitle': '',
    'map.tab.studio': 'استودیو نقشه',
    'map.tab.import': 'بارگذاری نقشه',
    'map.tab.schematic': 'نمای شماتیک بلوک‌ها و دپوها',
    'map.benchLevel': 'تراز پله',
    'map.coordSystem': 'سیستم مختصات',
    'map.surveyor': 'نقشه‌بردار',
    'map.status.approved': 'نسخه رسمی مصوب',
    'map.status.pending': 'در انتظار بررسی',
    'map.role.active': 'نقش فعال',
    'map.permissions': 'سطوح دسترسی',
    'map.tools.title': 'ابزارهای ترسیم و ویرایش',
    'map.tools.select': 'انتخاب و بازرسی',
    'map.tools.polygon': 'ترسیم ساب‌بلوک',
    'map.tools.polyline': 'ترسیم رمپ / لبه پله',
    'map.tools.point': 'ثبت نقطه بنچ‌مارک',
    'map.tools.annotation': 'درج یادداشت مهندسی',
    'map.tools.measure': 'خط‌کش اندازه‌گیری',
    'map.inspector.title': 'مشخصات فنی و ژئومتری',
    'map.inspector.feGrade': 'عیار آهن (% Fe)',
    'map.inspector.tonnage': 'تناژ تخمینی',
    'map.inspector.rockType': 'نوع کانسنگ',
    'map.inspector.destination': 'مقصد تخلیه',
    'map.inspector.createdBy': 'ایجاد توسط',
    'map.layers.title': 'مدیریت لایه‌ها',
    'map.audit.title': 'تاریخچه ممیزی نقشه',
    'map.fullscreen.enter': 'نمای تمام صفحه',
    'map.fullscreen.exit': 'خروج از تمام صفحه',

    // Mining Lifecycle
    'lifecycle.title': 'چرخه ۱۳ مرحله‌ای استخراج و فرآوری',
    'lifecycle.subtitle': 'از طراحی هندسی بلوک تا خردایش و پایش کیفیت کارخانه',
    'lifecycle.block': 'بلوک',
    'lifecycle.subblock': 'ساب‌بلوک',
    'lifecycle.status': 'وضعیت جاری',

    // Common UI
    'common.search': 'جستجو...',
    'common.filter': 'فیلترها',
    'common.save': 'ذخیره',
    'common.cancel': 'انصراف',
    'common.edit': 'ویرایش',
    'common.delete': 'حذف',
    'common.back': 'بازگشت',
    'common.create': 'ایجاد جدید',
    'common.export': 'خروجی اکسل/PDF',
    'common.import': 'ورود داده‌ها',
    'common.refresh': 'بروزرسانی',
    'common.actions': 'عملیات',
    'common.status': 'وضعیت',
    'common.date': 'تاریخ',
    'common.time': 'زمان',
    'common.unit.ton': 'تن',
    'common.unit.meter': 'متر',
    'common.unit.percent': '٪',
    'common.theme.dark': 'حالت تاریک',
    'common.theme.light': 'حالت روشن',
    'common.language': 'زبان',
    'common.logout': 'خروج از سامانه',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.mines': 'Mines & Pits',
    'nav.production': 'Production & Grade',
    'nav.lifecycle': 'Mining Lifecycle',
    'nav.blocks': 'Block Management',
    'nav.equipment': 'Equipment & Fleet',
    'nav.warehouse': 'Explosives & Warehouse',
    'nav.reports': 'Reports & Audits',
    'nav.gis': 'Mine GIS & Maps',
    'nav.maintenance': 'Maintenance (PM)',
    'nav.alerts': 'Alerts & Events',
    'nav.settings': 'Settings',
    'nav.users': 'User Management',

    // Dashboard
    'dashboard.title': 'Mining Operations Dashboard',
    'dashboard.subtitle': 'Live mine overview, production KPIs, and mining telemetry',
    'dashboard.welcome': 'Welcome back',
    'dashboard.overview': 'Dashboard Overview',
    'dashboard.productionByMine': 'Production by Mine & Pits',
    'dashboard.costDistribution': 'Mining & Processing Cost Distribution',
    'dashboard.recentAlerts': 'Critical Alerts & Quality Monitoring',
    'dashboard.auditTrail': 'Audit Trail & Activity Logging',
    'dashboard.productionTrend': 'Production Trend',
    'dashboard.mapOverview': 'Mines & Pits Distribution Map',
    'dashboard.kpi.totalProduction': 'Total Production',
    'dashboard.kpi.equipmentAvailability': 'Equipment Availability',
    'dashboard.kpi.activeMines': 'Active Mines',
    'dashboard.kpi.safetyIndex': 'Safety Index (HSE)',
    'dashboard.kpi.totalRevenue': 'Estimated Revenue',
    'dashboard.viewAll': 'View All',

    // Mine & Map Studio
    'map.title': 'Map Management',
    'map.subtitle': '',
    'map.tab.studio': 'Map Studio',
    'map.tab.import': 'Upload Map',
    'map.tab.schematic': 'Schematic Blocks & Stockpiles',
    'map.benchLevel': 'Bench Level',
    'map.coordSystem': 'Coordinate System',
    'map.surveyor': 'Surveyor',
    'map.status.approved': 'Official Approved Version',
    'map.status.pending': 'Pending Review',
    'map.role.active': 'Active Role',
    'map.permissions': 'Permissions Matrix',
    'map.tools.title': 'Draw & Edit Tools',
    'map.tools.select': 'Select & Inspect',
    'map.tools.polygon': 'Draw Sub-Block',
    'map.tools.polyline': 'Draw Ramp / Crest',
    'map.tools.point': 'Add Benchmark Point',
    'map.tools.annotation': 'Add Engineering Note',
    'map.tools.measure': 'Measure Distance/Area',
    'map.inspector.title': 'Feature Parameters & Geometry',
    'map.inspector.feGrade': 'Iron Grade (% Fe)',
    'map.inspector.tonnage': 'Estimated Tonnage',
    'map.inspector.rockType': 'Rock Type',
    'map.inspector.destination': 'Destination',
    'map.inspector.createdBy': 'Created By',
    'map.layers.title': 'Layers Management',
    'map.audit.title': 'Map Audit Trail',
    'map.fullscreen.enter': 'Full Screen',
    'map.fullscreen.exit': 'Exit Full Screen',

    // Mining Lifecycle
    'lifecycle.title': '13-Step Mining & Processing Lifecycle',
    'lifecycle.subtitle': 'From geometric block design to crushing and quality control',
    'lifecycle.block': 'Block',
    'lifecycle.subblock': 'Sub-Block',
    'lifecycle.status': 'Current Status',

    // Common UI
    'common.search': 'Search...',
    'common.filter': 'Filters',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.back': 'Back',
    'common.create': 'Create New',
    'common.export': 'Export Excel/PDF',
    'common.import': 'Import Data',
    'common.refresh': 'Refresh',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.unit.ton': 'Ton',
    'common.unit.meter': 'm',
    'common.unit.percent': '%',
    'common.theme.dark': 'Dark Mode',
    'common.theme.light': 'Light Mode',
    'common.language': 'Language',
    'common.logout': 'Sign Out',
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

