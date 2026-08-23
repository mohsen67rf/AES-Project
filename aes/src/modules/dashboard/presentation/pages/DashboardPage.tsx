// src/modules/dashboard/presentation/pages/DashboardPage.tsx

import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header/Header';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
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
  CubeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { ProductionChart } from '../components/ProductionChart';
import { CostDistribution } from '../components/CostDistribution';

// ============================================
// پالت رنگی - با آبی نئونی
// ============================================

const COLORS = {
  gold: '#C9A227',
  goldLight: '#E8C84A',
  goldDark: '#A07A15',
  navy: '#1A2A3A',
  navyLight: '#2A3A5A',
  teal: '#00B8D9',
  coral: '#FF6B6B',
  white: '#FFFFFF',
  gray: '#8A9DB0',
  darkBg: '#0A1628',
  surface: '#13203A',
  green: '#4ECDC4',
  purple: '#A29BFE',
  orange: '#FF9F43',
  neonBlue: '#00D4FF',
  neonBlueDark: '#0099CC',
  neonBlueGlow: 'rgba(0, 212, 255, 0.3)',
};

// ============================================
// کامپوننت کارت آماری
// ============================================

function StatsCard({ title, value, change, icon: Icon, isDark, t }: any) {
  const isPositive = change.startsWith('+');

  return (
    <div className={`
      group relative overflow-hidden rounded-2xl transition-all duration-500 p-6
      ${isDark 
        ? 'bg-[#13203A]/80 border border-[#2A3A5A]/30 hover:border-[#00D4FF]/50 hover:shadow-lg hover:shadow-[#00D4FF]/20 hover:bg-[#13203A]/95' 
        : 'bg-white/80 border border-[#1A2A3A]/10 hover:border-[#C9A227]/50 hover:shadow-lg hover:shadow-[#C9A227]/20 hover:bg-white/95'
      }
    `}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute -inset-1 bg-gradient-to-r ${
          isDark 
            ? 'from-[#00D4FF]/20 via-[#00D4FF]/5 to-transparent blur-xl' 
            : 'from-[#C9A227]/20 via-[#C9A227]/5 to-transparent blur-xl'
        }`} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className={`${isDark ? 'text-[#8A9DB0] group-hover:text-[#00D4FF]' : 'text-[#4A6A8A] group-hover:text-[#C9A227]'} text-sm font-medium transition-colors duration-300`}>
              {title}
            </p>
            <p className={`${isDark ? 'text-white group-hover:text-[#00D4FF]' : 'text-[#1A2A3A] group-hover:text-[#C9A227]'} text-2xl font-bold mt-1 transition-colors duration-300`}>
              {value}
            </p>
          </div>
          <div className={`
            p-3 rounded-xl transition-all duration-300
            ${isDark 
              ? 'bg-[#2A3A5A]/30 text-[#C9A227] group-hover:bg-[#00D4FF]/20 group-hover:text-[#00D4FF]' 
              : 'bg-[#1A2A3A]/10 text-[#00D4FF] group-hover:bg-[#C9A227]/20 group-hover:text-[#C9A227]'
            }
          `}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className={`text-xs font-medium ${isPositive ? 'text-[#4ECDC4]' : 'text-[#FF6B6B]'} transition-colors duration-300`}>
            {change}
          </span>
          <span className={`text-xs ${isDark ? 'text-[#8A9DB0] group-hover:text-[#00D4FF]/70' : 'text-[#4A6A8A] group-hover:text-[#C9A227]/70'} transition-colors duration-300`}>
            {t('dashboard.vsLastWeek')}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// کامپوننت هشدارها
// ============================================

function RecentAlerts({ isDark }: { isDark: boolean }) {
  const { t } = useLanguage();
  
  const alerts = [
    { 
      title: t('alert.vibration'), 
      detail: t('alert.vibration.detail'),
      icon: '⚡',
      color: 'text-[#FF6B6B]'
    },
    { 
      title: t('alert.fuel'), 
      detail: t('alert.fuel.detail'),
      icon: '⛽',
      color: 'text-[#FF9F43]'
    },
    { 
      title: t('alert.maintenance'), 
      detail: t('alert.maintenance.detail'),
      icon: '🔧',
      color: isDark ? 'text-[#C9A227]' : 'text-[#00D4FF]'
    },
    { 
      title: t('alert.inspection'), 
      detail: t('alert.inspection.detail'),
      icon: '⚠️',
      color: 'text-[#00B8D9]'
    },
  ];

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div 
          key={index}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isDark 
              ? 'bg-[#0A1628]/50 hover:bg-[#0A1628]/80 hover:border-[#00D4FF]/30 hover:shadow-[#00D4FF]/10' 
              : 'bg-gray-50 hover:bg-white hover:border-[#C9A227]/30 hover:shadow-[#C9A227]/10'
          } border border-transparent hover:border-[#C9A227]/30 shadow-sm hover:shadow-[#C9A227]/20`}
        >
          <div className={`text-xl ${alert.color} transition-colors duration-300`}>{alert.icon}</div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-[#1A2A3A]'} transition-colors duration-300`}>
              {alert.title}
            </p>
            <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]'}`}>
              {alert.detail}
            </p>
          </div>
          <button className={`text-xs ${isDark ? 'text-[#8A9DB0] hover:text-[#00D4FF]' : 'text-[#4A6A8A] hover:text-[#C9A227]'} transition-colors duration-300`}>
            {t('alert.view')}
          </button>
        </div>
      ))}
      <button className={`w-full text-center text-sm font-medium py-2 rounded-xl transition-all duration-300 ${
        isDark 
          ? 'text-[#C9A227] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10' 
          : 'text-[#00D4FF] hover:text-[#C9A227] hover:bg-[#C9A227]/10'
      }`}>
        {t('dashboard.viewAll')}
      </button>
    </div>
  );
}

// ============================================
// کامپوننت تولید بر اساس معدن (نمودار میله‌ای افقی)
// ============================================

function ProductionByMine({ isDark }: { isDark: boolean }) {
  const { t } = useLanguage();
  
  const mines = [
    { name: t('mine.mineA'), percentage: 40 },
    { name: t('mine.mineB'), percentage: 30 },
    { name: t('mine.mineC'), percentage: 20 },
    { name: t('mine.mineD'), percentage: 10 },
  ];

  return (
    <div className="space-y-4">
      {mines.map((mine, index) => (
        <div key={index} className="space-y-1 group">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${isDark ? 'text-white group-hover:text-[#00D4FF]' : 'text-[#1A2A3A] group-hover:text-[#C9A227]'} transition-colors duration-300`}>
              {mine.name}
            </span>
            <span className={`text-sm font-bold ${isDark ? 'text-[#C9A227] group-hover:text-[#00D4FF]' : 'text-[#00D4FF] group-hover:text-[#C9A227]'} transition-colors duration-300`}>
              {mine.percentage}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#1A2A3A]' : 'bg-gray-200'}`}>
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_10px_rgba(0,212,255,0.5)]"
              style={{ 
                width: `${mine.percentage}%`,
                background: `linear-gradient(90deg, ${isDark ? '#C9A227' : '#00D4FF'}, ${isDark ? '#C9A227' : '#00D4FF'}dd)`
              }}
            />
          </div>
        </div>
      ))}
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
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const stats = [
    { title: t('dashboard.totalProduction'), value: '۱۲,۶۵۰ تن', change: '+۱۲.۳%', icon: ArrowTrendingUpIcon },
    { title: t('dashboard.equipmentAvailability'), value: '۸۷%', change: '+۵.۳%', icon: CheckBadgeIcon },
    { title: t('dashboard.activeMines'), value: '۷', change: '+۲', icon: MapPinIcon },
    { title: t('dashboard.safetyIndex'), value: '۹۸%', change: '+۲.۱%', icon: ExclamationTriangleIcon },
    { title: t('dashboard.totalRevenue'), value: '$۴.۲۶M', change: '+۱۵.۷%', icon: CurrencyDollarIcon },
  ];

  const bgGradient = isDark 
    ? 'bg-gradient-to-br from-[#0A1628] via-[#0F1F35] to-[#0A1628]'
    : 'bg-gradient-to-br from-[#F4F6F9] via-[#E8ECF1] to-[#F4F6F9]';
  
  const textPrimary = isDark ? 'text-white' : 'text-[#1A2A3A]';
  const textSecondary = isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]';

  // ============================================
  // ✅ آیتم‌های منو با نقشه معدن
  // ============================================

  const menuItems = [
    { icon: HomeIcon, label: 'داشبورد', path: '/dashboard', active: true },
    { icon: ChartBarIcon, label: 'مدیریت', path: '/management-dashboard', active: false },
    { icon: DocumentTextIcon, label: 'مدیریت بلوک‌ها', path: '/blocks-management', active: false },
    { icon: BuildingOffice2Icon, label: 'معدن', path: '/mine', active: false },
    { icon: MapIcon, label: 'نقشه معدن', path: '/mine/map', active: false },
    { icon: WrenchScrewdriverIcon, label: 'تجهیزات', path: '/equipment', active: false },
    { icon: UsersIcon, label: 'پرسنل', path: '/personnel', active: false },
    { icon: Cog6ToothIcon, label: 'تنظیمات', path: '/settings', active: false },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`min-h-screen ${bgGradient} transition-colors duration-500`}>
      
      {/* ===== هدر ===== */}
      <Header />

      {/* ===== محتوای اصلی ===== */}
      <div className="flex">
        {/* ===== سایدبار ===== */}
        <aside className={`w-20 lg:w-64 min-h-screen p-4 sticky top-16 transition-colors duration-500 ${
          isDark 
            ? 'bg-[#0A1628]/50 backdrop-blur-xl border-l border-[#2A3A5A]/30' 
            : 'bg-white/50 backdrop-blur-xl border-l border-[#1A2A3A]/10'
        }`}>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = item.path === window.location.pathname;
              const activeBg = isDark 
                ? 'bg-[#00D4FF]/20 text-[#00D4FF] border-r-2 border-[#00D4FF]' 
                : 'bg-[#C9A227]/20 text-[#C9A227] border-r-2 border-[#C9A227]';
              
              const inactiveBg = isDark 
                ? 'text-[#8A9DB0] hover:bg-[#00D4FF]/10 hover:text-[#00D4FF]' 
                : 'text-[#4A6A8A] hover:bg-[#C9A227]/10 hover:text-[#C9A227]';
              
              return (
                <button
                  key={item.label}
                  onClick={() => handleMenuClick(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                    isActive ? activeBg : inactiveBg
                  }`}
                >
                  <item.icon className={`w-6 h-6 flex-shrink-0 transition-all duration-300 ${
                    isActive 
                      ? (isDark ? 'text-[#00D4FF]' : 'text-[#C9A227]')
                      : (isDark ? 'text-[#8A9DB0] group-hover:text-[#00D4FF]' : 'text-[#4A6A8A] group-hover:text-[#C9A227]')
                  }`} />
                  <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <span className={`hidden lg:block mr-auto w-1.5 h-1.5 rounded-full ${
                      isDark ? 'bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.5)]' : 'bg-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.5)]'
                    }`}></span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className={`absolute bottom-4 left-4 right-4 p-4 rounded-xl text-center text-xs ${
            isDark ? 'bg-[#1A2A3A]/30 border border-[#2A3A5A]/30 text-[#8A9DB0]' : 'bg-[#1A2A3A]/5 border border-[#1A2A3A]/10 text-[#4A6A8A]'
          }`}>
            نسخه ۱.۰.۰
          </div>
        </aside>

        {/* ===== بخش محتوا ===== */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl">
          <div className="relative">
            <h1 className={`text-2xl font-bold ${textPrimary} transition-colors duration-500`}>
              👋 {t('dashboard.welcome')}، {user.fullName}!
              <span className={`block text-sm font-normal ${textSecondary} mt-1 transition-colors duration-500`}>
                {t('dashboard.subtitle')}
              </span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat) => (
              <StatsCard key={stat.title} {...stat} isDark={isDark} t={t} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 rounded-2xl p-6 transition-all duration-500 h-[320px] ${
              isDark 
                ? 'bg-[#13203A]/40 border border-[#2A3A5A]/30 hover:border-[#00D4FF]/40 hover:shadow-lg hover:shadow-[#00D4FF]/10' 
                : 'bg-white/70 border border-[#1A2A3A]/10 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/10'
            }`}>
              <h3 className={`${textSecondary} font-semibold mb-4 flex items-center gap-2 transition-colors duration-500`}>
                <span className={`w-1 h-4 rounded-full ${
                  isDark 
                    ? 'bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.5)]' 
                    : 'bg-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.5)]'
                }`}></span>
                {t('dashboard.productionTrend')}
              </h3>
              <ProductionChart isDark={isDark} />
            </div>
            
            <div className={`rounded-2xl p-6 transition-all duration-500 h-[320px] ${
              isDark 
                ? 'bg-[#13203A]/40 border border-[#2A3A5A]/30 hover:border-[#00D4FF]/40 hover:shadow-lg hover:shadow-[#00D4FF]/10' 
                : 'bg-white/70 border border-[#1A2A3A]/10 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/10'
            }`}>
              <h3 className={`${textSecondary} font-semibold mb-4 flex items-center gap-2 transition-colors duration-500`}>
                <span className={`w-1 h-4 rounded-full ${
                  isDark 
                    ? 'bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.5)]' 
                    : 'bg-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.5)]'
                }`}></span>
                {t('dashboard.productionByMine')}
              </h3>
              <ProductionByMine isDark={isDark} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`rounded-2xl p-6 transition-all duration-500 h-[320px] ${
              isDark 
                ? 'bg-[#13203A]/40 border border-[#2A3A5A]/30 hover:border-[#00D4FF]/40 hover:shadow-lg hover:shadow-[#00D4FF]/10' 
                : 'bg-white/70 border border-[#1A2A3A]/10 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/10'
            }`}>
              <h3 className={`${textSecondary} font-semibold mb-4 flex items-center gap-2 transition-colors duration-500`}>
                <span className={`w-1 h-4 rounded-full ${
                  isDark 
                    ? 'bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.5)]' 
                    : 'bg-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.5)]'
                }`}></span>
                {t('dashboard.costDistribution')}
              </h3>
              <CostDistribution isDark={isDark} />
            </div>
            
            <div className={`lg:col-span-2 rounded-2xl p-6 transition-all duration-500 ${
              isDark 
                ? 'bg-[#13203A]/40 border border-[#2A3A5A]/30 hover:border-[#00D4FF]/40 hover:shadow-lg hover:shadow-[#00D4FF]/10' 
                : 'bg-white/70 border border-[#1A2A3A]/10 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/10'
            }`}>
              <h3 className={`${textSecondary} font-semibold mb-4 flex items-center gap-2 transition-colors duration-500`}>
                <span className={`w-1 h-4 rounded-full ${
                  isDark 
                    ? 'bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.5)]' 
                    : 'bg-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.5)]'
                }`}></span>
                {t('dashboard.recentAlerts')}
              </h3>
              <RecentAlerts isDark={isDark} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;