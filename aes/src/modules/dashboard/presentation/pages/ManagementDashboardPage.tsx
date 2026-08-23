// src/modules/dashboard/presentation/pages/ManagementDashboardPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { Header } from '../components/Header/Header';
import { KPICard } from '../components/KPICard';
import { BlockStatusChart } from '../components/BlockStatusChart';
import { ProcessingEfficiencyChart } from '../components/ProcessingEfficiencyChart';
import AlertService from '../../../alert/services/AlertService';
import { SubBlockRepository } from '../../../../core/infrastructure/repositories';
import { 
  ArrowTrendingUpIcon, 
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const blockStatusData = [
  { status: 'تعریف شده', count: 12, color: '#6B7280' },
  { status: 'در حال حفاری', count: 8, color: '#F59E0B' },
  { status: 'نمونه‌برداری', count: 15, color: '#8B5CF6' },
  { status: 'آزمایشگاه', count: 10, color: '#3B82F6' },
  { status: 'طبقه‌بندی', count: 7, color: '#06B6D4' },
  { status: 'در حال اجرا', count: 20, color: '#F97316' },
  { status: 'فرآوری', count: 5, color: '#EC4899' },
  { status: 'تکمیل شده', count: 25, color: '#22C55E' },
];

const efficiencyData = [
  { week: 'هفته ۱', efficiency: 65, target: 80 },
  { week: 'هفته ۲', efficiency: 72, target: 80 },
  { week: 'هفته ۳', efficiency: 68, target: 80 },
  { week: 'هفته ۴', efficiency: 78, target: 80 },
  { week: 'هفته ۵', efficiency: 85, target: 80 },
  { week: 'هفته ۶', efficiency: 82, target: 80 },
  { week: 'هفته ۷', efficiency: 90, target: 80 },
];

export function ManagementDashboardPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [alertStats, setAlertStats] = useState({
    total: 0,
    unread: 0,
    unresolved: 0,
    critical: 0,
    warning: 0,
    info: 0,
    success: 0,
    byCategory: {} as Record<string, number>,
  });
  const [subBlockStats, setSubBlockStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    blocked: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const stats = AlertService.getAlertStats();
    setAlertStats(stats);

    const subBlocks = SubBlockRepository.getAll();
    const completed = subBlocks.filter(sb => 
      ['COMPLETED', 'SOLD', 'FINAL_PRODUCT'].includes(sb.status)
    ).length;
    const inProgress = subBlocks.filter(sb => 
      !['COMPLETED', 'SOLD', 'FINAL_PRODUCT'].includes(sb.status)
    ).length;

    setSubBlockStats({
      total: subBlocks.length,
      completed,
      inProgress,
      blocked: 0,
    });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} transition-colors duration-300`}>
      <Header />

      <div className="flex">
        <aside className={`w-20 lg:w-64 min-h-screen p-4 sticky top-16 transition-colors duration-500 ${
          isDark ? 'bg-[#0A1628]/50 backdrop-blur-xl border-l border-[#2A3A5A]/30' : 'bg-white/50 backdrop-blur-xl border-l border-[#1A2A3A]/10'
        }`}>
          <nav className="space-y-1">
            <button onClick={() => navigate('/dashboard')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 text-[#8A9DB0] hover:bg-[#00D4FF]/10 hover:text-[#00D4FF]`}>
              <ArrowTrendingUpIcon className="w-6 h-6" />
              <span className="hidden lg:block text-sm font-medium">داشبورد</span>
            </button>
            <button onClick={() => navigate('/management-dashboard')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${isDark ? 'bg-[#00D4FF]/20 text-[#00D4FF] border-r-2 border-[#00D4FF]' : 'bg-[#C9A227]/10 text-[#C9A227] border-r-2 border-[#C9A227]'}`}>
              <CubeIcon className="w-6 h-6" />
              <span className="hidden lg:block text-sm font-medium">مدیریت</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6 space-y-6 max-w-7xl">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#1A2A3A]'}`}>
            📊 داشبورد مدیریتی
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="کل ساب‌بلوک‌ها" value={subBlockStats.total} icon={<CubeIcon className="w-5 h-5 text-[#00D4FF]" />} isDark={isDark} />
            <KPICard title="تکمیل شده" value={subBlockStats.completed} change={`${subBlockStats.total > 0 ? Math.round(subBlockStats.completed / subBlockStats.total * 100) : 0}%`} icon={<CheckCircleIcon className="w-5 h-5 text-green-400" />} isDark={isDark} />
            <KPICard title="در حال انجام" value={subBlockStats.inProgress} icon={<ClockIcon className="w-5 h-5 text-yellow-400" />} isDark={isDark} />
            <KPICard title="هشدارهای فعال" value={alertStats.unresolved} change={alertStats.critical > 0 ? `⚠️ ${alertStats.critical} بحرانی` : undefined} icon={<ExclamationTriangleIcon className={`w-5 h-5 ${alertStats.critical > 0 ? 'text-red-500' : 'text-yellow-500'}`} />} isDark={isDark} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl h-[300px] ${isDark ? 'bg-[#13203A]/40 border border-[#2A3A5A]/30' : 'bg-white/70 border border-[#1A2A3A]/10'}`}>
              <h3 className={`text-sm font-semibold ${isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]'} mb-4`}>وضعیت بلوک‌ها</h3>
              <BlockStatusChart data={blockStatusData} isDark={isDark} />
            </div>
            <div className={`p-6 rounded-2xl h-[300px] ${isDark ? 'bg-[#13203A]/40 border border-[#2A3A5A]/30' : 'bg-white/70 border border-[#1A2A3A]/10'}`}>
              <h3 className={`text-sm font-semibold ${isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]'} mb-4`}>کارایی فرآوری</h3>
              <ProcessingEfficiencyChart data={efficiencyData} isDark={isDark} />
            </div>
          </div>

          <div className={`p-6 rounded-2xl ${isDark ? 'bg-[#13203A]/40 border border-[#2A3A5A]/30' : 'bg-white/70 border border-[#1A2A3A]/10'}`}>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]'} mb-4`}>دسته‌بندی هشدارها</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(alertStats.byCategory).map(([category, count]) => (
                <div key={category} className={`p-3 rounded-xl ${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>{category}</p>
                  <p className={`text-lg font-bold ${count > 0 ? (isDark ? 'text-[#00D4FF]' : 'text-[#C9A227]') : 'text-gray-400'}`}>{count}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ManagementDashboardPage;