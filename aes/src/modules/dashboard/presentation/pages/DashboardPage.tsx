// src/modules/dashboard/presentation/pages/DashboardPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  BuildingOffice2Icon, 
  WrenchScrewdriverIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  MoonIcon,
  SunIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

// ============================================
// کامپوننت دکمه‌ی تغییر تم
// ============================================

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-xl transition-all duration-300 hover:bg-white/10"
      aria-label="تغییر تم"
    >
      {isDark ? (
        <SunIcon className="w-5 h-5 text-[#AACCDD] hover:text-[#C9A227] transition-colors" />
      ) : (
        <MoonIcon className="w-5 h-5 text-[#4A6A8A] hover:text-[#1A2A3A] transition-colors" />
      )}
    </button>
  );
}

// ============================================
// کامپوننت کارت آماری
// ============================================

function StatsCard({ title, value, change, icon: Icon, color, isDark }: any) {
  const isPositive = change.startsWith('+');
  const textColor = isDark ? 'text-[#E8EDF5]' : 'text-[#1A2A3A]';
  const labelColor = isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]';

  return (
    <div className={`
      group relative overflow-hidden rounded-2xl backdrop-blur-xl transition-all duration-500 p-6
      ${isDark 
        ? 'bg-[#13203A]/80 border border-[#AACCDD]/10 hover:border-[#AACCDD]/30 hover:shadow-lg hover:shadow-[#AACCDD]/5' 
        : 'bg-white/80 border border-[#1A2A3A]/10 hover:border-[#1A2A3A]/30 hover:shadow-lg hover:shadow-[#1A2A3A]/10'
      }
    `}>
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className={`${labelColor} text-sm`}>{title}</p>
            <p className={`${textColor} text-2xl font-bold mt-1`}>{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${isDark ? 'bg-[#AACCDD]/10' : 'bg-[#1A2A3A]/10'} ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className={`text-xs font-medium ${isPositive ? 'text-[#AACCDD]' : 'text-red-400'}`}>
            {change}
          </span>
          <span className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]'}`}>نسبت به ماه قبل</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// سایر کامپوننت‌ها
// ============================================

function ProductionChart({ isDark }: { isDark: boolean }) {
  const textColor = isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]';
  const borderColor = isDark ? 'border-[#AACCDD]/10' : 'border-[#1A2A3A]/10';

  return (
    <div className={`h-48 flex items-center justify-center ${textColor} border ${borderColor} rounded-xl`}>
      <div className="text-center">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-sm">نمودار تولید</p>
        <p className="text-xs mt-1">به زودی با داده‌های واقعی</p>
      </div>
    </div>
  );
}

function ActiveMachines({ isDark }: { isDark: boolean }) {
  const machines = [
    { name: 'بیل مکانیکی', count: 12, status: 'فعال' },
    { name: 'کامیون معدن', count: 34, status: 'فعال' },
    { name: 'دستگاه حفاری', count: 8, status: 'غیرفعال' },
    { name: 'نوار نقاله', count: 24, status: 'فعال' },
  ];

  const textColor = isDark ? 'text-[#E8EDF5]' : 'text-[#1A2A3A]';
  const labelColor = isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]';
  const bgHover = isDark ? 'hover:bg-[#AACCDD]/10' : 'hover:bg-[#1A2A3A]/10';

  return (
    <div className="space-y-3">
      {machines.map((machine) => (
        <div key={machine.name} className={`flex items-center justify-between p-3 rounded-xl transition-all ${bgHover}`}>
          <span className={`${labelColor} text-sm`}>{machine.name}</span>
          <div className="flex items-center gap-4">
            <span className={`${textColor} font-semibold`}>{machine.count}</span>
            <div className={`w-2 h-2 rounded-full ${machine.status === 'فعال' ? 'bg-[#AACCDD]' : 'bg-red-400'}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CostDistribution({ isDark }: { isDark: boolean }) {
  const textColor = isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]';
  const borderColor = isDark ? 'border-[#AACCDD]/10' : 'border-[#1A2A3A]/10';

  return (
    <div className={`h-48 flex items-center justify-center ${textColor} border ${borderColor} rounded-xl`}>
      <div className="text-center">
        <div className="text-4xl mb-2">🥧</div>
        <p className="text-sm">توزیع هزینه‌ها</p>
        <p className="text-xs mt-1">به زودی با داده‌های واقعی</p>
      </div>
    </div>
  );
}

// ============================================
// صفحه‌ی اصلی داشبورد
// ============================================

interface User {
  id: string;
  code: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

export function DashboardPage({ user, onLogout }: DashboardPageProps) {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('aes_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('aes_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const stats = [
    { title: 'تولید امروز', value: '۱۲,۶۵۰', change: '+۱۲.۵%', icon: ArrowTrendingUpIcon, color: 'text-[#AACCDD]' },
    { title: 'هزینه عملیاتی', value: '۳.۲۴ میلیارد', change: '-۸.۷%', icon: ArrowTrendingDownIcon, color: 'text-red-400' },
    { title: 'ایمنی کار', value: '۹۸%', change: '+۲.۱%', icon: CheckBadgeIcon, color: 'text-[#AACCDD]' },
    { title: 'بدون حادثه', value: '۳۷ روز', change: '+۵ روز', icon: ExclamationTriangleIcon, color: 'text-[#AACCDD]' },
  ];

  // رنگ‌های پویا بر اساس تم
  const bgGradient = isDark 
    ? 'bg-gradient-to-br from-[#0A1628] via-[#0F1F35] to-[#0A1628]'
    : 'bg-gradient-to-br from-[#F4F6F9] via-[#E8ECF1] to-[#F4F6F9]';
  
  const headerBg = isDark 
    ? 'bg-[#0A1628]/80 backdrop-blur-xl border-b border-[#AACCDD]/10'
    : 'bg-white/80 backdrop-blur-xl border-b border-[#1A2A3A]/10';
  
  const sidebarBg = isDark
    ? 'bg-[#0A1628]/50 backdrop-blur-xl border-l border-[#AACCDD]/10'
    : 'bg-white/50 backdrop-blur-xl border-l border-[#1A2A3A]/10';
  
  const textPrimary = isDark ? 'text-white' : 'text-[#1A2A3A]';
  const textSecondary = isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]';
  const logoText = isDark ? 'text-white' : 'text-[#1A2A3A]';
  const logoSub = isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]';

  // ===== آیتم‌های منو با مسیرهای درست =====
  const menuItems = [
    { icon: HomeIcon, label: 'داشبورد', path: '/dashboard', active: true },
    { icon: BuildingOffice2Icon, label: 'معدن', path: '/mine', active: false },
    { icon: CubeIcon, label: 'بلوک‌ها', path: '/blocks', active: false },  // ✅ مسیر درست
    { icon: WrenchScrewdriverIcon, label: 'تجهیزات', path: '/equipment', active: false },
    { icon: UsersIcon, label: 'پرسنل', path: '/personnel', active: false },
    { icon: ChartBarIcon, label: 'گزارشات', path: '/reports', active: false },
    { icon: Cog6ToothIcon, label: 'تنظیمات', path: '/settings', active: false },
  ];

  // ===== هندلر کلیک روی منو =====
  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`min-h-screen ${bgGradient} transition-colors duration-500`}>
      
      {/* ===== هدر ===== */}
      <header className={`sticky top-0 z-50 ${headerBg} transition-colors duration-500`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1A2A3A] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                A
              </div>
              <div>
                <span className={`${logoText} font-bold text-lg tracking-tight`}>AES</span>
                <span className={`${logoSub} text-xs block -mt-1`}>دستیار مهندس معدن</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            <div className={`text-sm ${textSecondary}`}>
              <span className={`${isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]'} font-semibold`}>{user.fullName}</span>
              <span className="mx-2 opacity-50">|</span>
              <span>{user.role}</span>
            </div>
            <button
              onClick={onLogout}
              className={`px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium ${
                isDark 
                  ? 'bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD] border border-[#AACCDD]/20' 
                  : 'bg-[#1A2A3A]/10 hover:bg-[#1A2A3A]/20 text-[#1A2A3A] border border-[#1A2A3A]/20'
              }`}
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* ===== محتوای اصلی ===== */}
      <div className="flex">
        {/* ===== سایدبار ===== */}
        <aside className={`w-20 lg:w-64 ${sidebarBg} min-h-screen p-4 sticky top-16 transition-colors duration-500`}>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = item.path === window.location.pathname;
              const activeBg = isDark ? 'bg-[#AACCDD]/10 text-[#AACCDD] border-[#AACCDD]/30' : 'bg-[#1A2A3A]/10 text-[#1A2A3A] border-[#1A2A3A]/30';
              const inactiveBg = isDark ? 'text-[#8A9DB0] hover:bg-[#AACCDD]/5 hover:text-[#E8EDF5]' : 'text-[#4A6A8A] hover:bg-[#1A2A3A]/5 hover:text-[#1A2A3A]';
              
              return (
                <button
                  key={item.label}
                  onClick={() => handleMenuClick(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                    isActive ? activeBg : inactiveBg
                  }`}
                >
                  <item.icon className={`w-6 h-6 flex-shrink-0 transition-all duration-300 ${
                    isActive ? (isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]') : (isDark ? 'text-[#8A9DB0] group-hover:text-[#E8EDF5]' : 'text-[#4A6A8A] group-hover:text-[#1A2A3A]')
                  }`} />
                  <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <span className="hidden lg:block mr-auto w-1.5 h-1.5 rounded-full bg-[#AACCDD] animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className={`absolute bottom-4 left-4 right-4 p-4 rounded-xl text-center text-xs ${
            isDark ? 'bg-[#AACCDD]/5 border border-[#AACCDD]/10 text-[#8A9DB0]' : 'bg-[#1A2A3A]/5 border border-[#1A2A3A]/10 text-[#4A6A8A]'
          }`}>
            نسخه ۱.۰.۰
          </div>
        </aside>

        {/* ===== بخش محتوا ===== */}
        <main className="flex-1 p-6 space-y-6">
          <div className="relative">
            <h1 className={`text-3xl font-bold ${textPrimary} transition-colors duration-500`}>
              خلاصه عملکرد
              <span className={`block text-sm font-normal ${textSecondary} mt-1 transition-colors duration-500`}>
                آخرین به‌روزرسانی: امروز، ۱۴:۳۰
              </span>
            </h1>
            <div className={`absolute -top-4 -right-4 w-32 h-32 rounded-full blur-3xl ${
              isDark ? 'bg-[#AACCDD]/5' : 'bg-[#1A2A3A]/5'
            }`}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatsCard key={stat.title} {...stat} isDark={isDark} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 rounded-2xl p-6 transition-all duration-500 ${
              isDark 
                ? 'bg-[#13203A]/40 border border-[#AACCDD]/10 hover:border-[#AACCDD]/20' 
                : 'bg-white/70 border border-[#1A2A3A]/10 hover:border-[#1A2A3A]/20'
            }`}>
              <h3 className={`${textSecondary} font-semibold mb-4 flex items-center gap-2 transition-colors duration-500`}>
                <span className="w-1 h-4 bg-[#AACCDD] rounded-full"></span>
                نمودار تولید
              </h3>
              <ProductionChart isDark={isDark} />
            </div>
            <div className={`rounded-2xl p-6 transition-all duration-500 ${
              isDark 
                ? 'bg-[#13203A]/40 border border-[#AACCDD]/10 hover:border-[#AACCDD]/20' 
                : 'bg-white/70 border border-[#1A2A3A]/10 hover:border-[#1A2A3A]/20'
            }`}>
              <h3 className={`${textSecondary} font-semibold mb-4 flex items-center gap-2 transition-colors duration-500`}>
                <span className="w-1 h-4 bg-[#AACCDD] rounded-full"></span>
                ماشین‌آلات فعال
              </h3>
              <ActiveMachines isDark={isDark} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`rounded-2xl p-6 transition-all duration-500 ${
              isDark 
                ? 'bg-[#13203A]/40 border border-[#AACCDD]/10 hover:border-[#AACCDD]/20' 
                : 'bg-white/70 border border-[#1A2A3A]/10 hover:border-[#1A2A3A]/20'
            }`}>
              <h3 className={`${textSecondary} font-semibold mb-4 flex items-center gap-2 transition-colors duration-500`}>
                <span className="w-1 h-4 bg-[#AACCDD] rounded-full"></span>
                توزیع هزینه‌ها
              </h3>
              <CostDistribution isDark={isDark} />
            </div>
            <div className={`rounded-2xl p-6 transition-all duration-500 ${
              isDark 
                ? 'bg-[#13203A]/40 border border-[#AACCDD]/10 hover:border-[#AACCDD]/20' 
                : 'bg-white/70 border border-[#1A2A3A]/10 hover:border-[#1A2A3A]/20'
            }`}>
              <h3 className={`${textSecondary} font-semibold mb-4 flex items-center gap-2 transition-colors duration-500`}>
                <span className="w-1 h-4 bg-[#AACCDD] rounded-full"></span>
                اطلاعات تکمیلی
              </h3>
              <div className={`${textSecondary} text-sm space-y-3 transition-colors duration-500`}>
                {[
                  { label: 'تعداد کل معادن', value: '۱۲۴', color: isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]' },
                  { label: 'معادن فعال', value: '۸۹', color: isDark ? 'text-[#E8EDF5]' : 'text-[#1A2A3A]' },
                  { label: 'پرسنل شاغل', value: '۳,۴۵۶', color: isDark ? 'text-[#AACCDD]' : 'text-[#1A2A3A]' },
                  { label: 'تجهیزات در حال کار', value: '۱,۲۴۷', color: isDark ? 'text-[#E8EDF5]' : 'text-[#1A2A3A]' },
                ].map((item) => (
                  <div key={item.label} className={`flex justify-between items-center p-2 rounded-lg ${
                    isDark ? 'bg-[#AACCDD]/5' : 'bg-[#1A2A3A]/5'
                  }`}>
                    <span className={isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]'}>{item.label}</span>
                    <span className={`font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}