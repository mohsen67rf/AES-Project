// src/modules/dashboard/presentation/components/Header/Header.tsx

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoFull } from '../../../../../shared/components/Logo/LogoFull';
import { ThemeToggle } from '../../../../../shared/components/ThemeToggle/ThemeToggle';
import { LanguageToggle } from '../../../../../shared/components/LanguageToggle/LanguageToggle';
import { BellIcon, UserCircleIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../../../../shared/context/ThemeContext';

// ============================================
// تبدیل تاریخ میلادی به شمسی
// ============================================

function toPersianDate(date: Date): string {
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth();
  const gregorianDay = date.getDate();

  let jy = gregorianYear - 621;
  let jm = gregorianMonth + 1;
  let jd = gregorianDay;

  if (jm > 10 || (jm === 10 && jd > 22)) {
    jy += 1;
  }

  const dayOfYear = Math.floor((Date.UTC(gregorianYear, gregorianMonth, gregorianDay) - Date.UTC(gregorianYear, 0, 0)) / 86400000);
  let persianDayOfYear = dayOfYear - 21;
  if (persianDayOfYear < 0) {
    persianDayOfYear += 365;
  }

  let persianMonth = 0;
  let persianDay = 0;
  const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

  for (let i = 0; i < 12; i++) {
    if (persianDayOfYear < monthDays[i]) {
      persianMonth = i;
      persianDay = persianDayOfYear + 1;
      break;
    }
    persianDayOfYear -= monthDays[i];
  }

  return `${persianDay} ${persianMonths[persianMonth]} ${jy}`;
}

// ============================================
// کامپوننت هدر
// ============================================

export function Header() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [activeUserName, setActiveUserName] = useState('مدیر کل');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aes_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.fullName) {
          setActiveUserName(parsed.fullName);
        }
      }
    } catch {}
  }, []);

  // گوش دادن به تغییرات زبان
  useEffect(() => {
    const handleLanguageChange = (e: any) => {
      setLang(e.detail.lang);
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    
    // مقدار اولیه
    const savedLang = localStorage.getItem('aes_language') as 'fa' | 'en' | null;
    if (savedLang) {
      setLang(savedLang);
    }
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  // ساعت
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      
      // ساعت ایران (UTC+3:30)
      const iranTime = new Date(now.getTime() + (3.5 * 60 * 60 * 1000));
      
      const hours = String(iranTime.getUTCHours()).padStart(2, '0');
      const minutes = String(iranTime.getUTCMinutes()).padStart(2, '0');
      const seconds = String(iranTime.getUTCSeconds()).padStart(2, '0');
      
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      setCurrentDate(toPersianDate(now));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const textColor = isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]';
  const bgColor = isDark ? 'bg-[#0A1628]/80 border-b border-[#2A3A5A]/30' : 'bg-white/80 border-b border-gray-200';

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`sticky top-0 z-50 backdrop-blur-xl ${bgColor}`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 -translate-x-full animate-shine bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
      </div>

      <div className="flex items-center justify-between px-6 py-3 relative">
        {/* لوگو */}
        <div className="flex items-center gap-4">
          <LogoFull size={36} variant="dashboard" className="flex-shrink-0" />
        </div>

        {/* تاریخ و ساعت - وسط */}
        <div className="hidden md:flex flex-col items-center">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-mono font-medium text-[#C9A227]`}>
              {currentTime}
            </span>
            <span className={`text-xs ${textColor}`}>|</span>
            <span className={`text-sm ${textColor}`}>
              {currentDate}
            </span>
          </div>
          <div className={`text-[10px] text-[#4A6A8A]`}>
            به وقت تهران
          </div>
        </div>

        {/* ابزارهای سمت چپ */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <button className={`p-2 rounded-full hover:bg-white/10 transition-colors relative ${textColor}`}>
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B6B] rounded-full animate-pulse"></span>
          </button>
          <button 
            onClick={() => navigate('/users')}
            className={`flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer ${textColor}`}
            title="مدیریت کاربران و پرسنل"
          >
            <UserCircleIcon className={`w-8 h-8 ${textColor}`} />
            <span className={`text-sm font-medium ${textColor} hidden sm:block truncate max-w-[140px]`}>
              {activeUserName}
            </span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;