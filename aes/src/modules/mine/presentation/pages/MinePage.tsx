// src/modules/mine/presentation/pages/MinePage.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { 
  PlusIcon, 
  XMarkIcon, 
  MapIcon,
  CubeIcon,
  BeakerIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { 
  MineRepository, 
  PitRepository,
  BlockRepository,
  SubBlockRepository,
  SampleRepository
} from '../../../../core/infrastructure/repositories';
import type { Mine, Pit, SubBlock } from '../../../../core/domain/types/mine.types';
import { SubBlockLifecycleService } from '../../services/SubBlockLifecycleService';
import { PitProductionDetail } from '../components/PitProductionDetail';

// ============================================
// داده‌های فرضی برای فعالیت‌های اخیر
// ============================================

const generateMockRecentActivities = (): { code: string; status: string; updatedAt: string; icon: string; color: string }[] => {
  const activities = [
    { code: 'SB-1040-60-01', status: 'LAB_COMPLETED', icon: '🧪', color: 'text-purple-400' },
    { code: 'SB-1040-60-02', status: 'SAMPLING_COMPLETED', icon: '🔬', color: 'text-yellow-400' },
    { code: 'SB-1040-60-03', status: 'CLASSIFICATION_DONE', icon: '📊', color: 'text-blue-400' },
    { code: 'SB-1040-60-04', status: 'DESTINATION_APPROVED', icon: '🎯', color: 'text-cyan-400' },
    { code: 'SB-1040-60-05', status: 'LOADING_COMPLETED', icon: '🚛', color: 'text-orange-400' },
    { code: 'SB-1040-60-06', status: 'COMPLETED', icon: '✅', color: 'text-green-400' },
    { code: 'SB-1040-60-07', status: 'SAMPLING_IN_PROGRESS', icon: '🔬', color: 'text-yellow-400' },
    { code: 'SB-1040-60-08', status: 'LAB_IN_PROGRESS', icon: '🧪', color: 'text-purple-400' },
    { code: 'SB-1040-60-09', status: 'CLASSIFICATION_PENDING', icon: '📊', color: 'text-blue-400' },
    { code: 'SB-1040-60-10', status: 'DESTINATION_PENDING', icon: '🎯', color: 'text-cyan-400' },
  ];

  // انتخاب ۵ فعالیت تصادفی
  const shuffled = [...activities].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);

  // تولید زمان‌های تصادفی در ۲۴ ساعت گذشته
  return selected.map((activity, index) => {
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setHours(date.getHours() - hoursAgo);
    date.setMinutes(date.getMinutes() - minutesAgo);
    
    return {
      ...activity,
      updatedAt: date.toISOString(),
    };
  });
};

// ============================================
// کامپوننت Overview Card با هاور هماهنگ با داشبورد
// ============================================

function OverviewCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  isDark, 
  color = 'text-[#00D4FF]',
  change,
  loading
}: any) {
  const isPositive = change?.startsWith('+');

  return (
    <div className={`
      group relative overflow-hidden rounded-2xl transition-all duration-500 p-5
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
          <div className="flex-1">
            <p className={`text-xs ${isDark ? 'text-[#8A9DB0] group-hover:text-[#00D4FF]' : 'text-[#4A6A8A] group-hover:text-[#C9A227]'} transition-colors duration-300`}>
              {title}
            </p>
            {loading ? (
              <div className="h-8 w-20 bg-gray-700/20 rounded animate-pulse mt-1" />
            ) : (
              <p className={`text-2xl font-bold ${isDark ? 'text-white group-hover:text-[#00D4FF]' : 'text-[#1A2A3A] group-hover:text-[#C9A227]'} mt-1 transition-colors duration-300`}>
                {value}
              </p>
            )}
            {subtitle && (
              <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A] group-hover:text-[#00D4FF]/70' : 'text-gray-400 group-hover:text-[#C9A227]/70'} mt-0.5 transition-colors duration-300`}>
                {subtitle}
              </p>
            )}
            {change && (
              <div className={`text-xs font-medium mt-1 ${isPositive ? 'text-[#4ECDC4]' : 'text-[#FF6B6B]'} transition-colors duration-300`}>
                {change}
              </div>
            )}
          </div>
          <div className={`
            p-3 rounded-xl transition-all duration-300
            ${isDark 
              ? 'bg-[#2A3A5A]/30 text-[#C9A227] group-hover:bg-[#00D4FF]/20 group-hover:text-[#00D4FF]' 
              : 'bg-[#1A2A3A]/10 text-[#00D4FF] group-hover:bg-[#C9A227]/20 group-hover:text-[#C9A227]'
            }
          `}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// کامپوننت فعالیت‌های اخیر با داده‌های فرضی
// ============================================

function RecentActivities({ isDark }: { isDark: boolean }) {
  const { t } = useLanguage();
  
  // دریافت داده‌های فرضی
  const mockActivities = generateMockRecentActivities();

  // همچنین می‌تونیم از داده‌های واقعی هم استفاده کنیم (اگر وجود داشته باشن)
  const subBlocks = SubBlockRepository.getAll();
  const realActivities = subBlocks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)
    .map((sb: SubBlock) => ({
      code: sb.code,
      status: sb.status,
      updatedAt: sb.updatedAt,
      icon: sb.status === 'LAB_COMPLETED' ? '🧪' :
            sb.status === 'SAMPLING_COMPLETED' ? '🔬' :
            sb.status === 'CLASSIFICATION_DONE' ? '📊' :
            sb.status === 'DESTINATION_APPROVED' ? '🎯' :
            sb.status === 'LOADING_COMPLETED' ? '🚛' :
            sb.status === 'COMPLETED' ? '✅' : '📌',
      color: sb.status === 'LAB_COMPLETED' ? 'text-purple-400' :
             sb.status === 'SAMPLING_COMPLETED' ? 'text-yellow-400' :
             sb.status === 'CLASSIFICATION_DONE' ? 'text-blue-400' :
             sb.status === 'DESTINATION_APPROVED' ? 'text-cyan-400' :
             sb.status === 'LOADING_COMPLETED' ? 'text-orange-400' :
             sb.status === 'COMPLETED' ? 'text-green-400' : 'text-gray-400',
    }));

  // ترکیب داده‌های واقعی و فرضی - اولویت با داده‌های واقعی
  const activities = realActivities.length > 0 
    ? [...realActivities, ...mockActivities.slice(0, 5 - realActivities.length)]
    : mockActivities;

  if (activities.length === 0) {
    return (
      <div className={`text-center py-8 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
        <p className="text-sm">هیچ فعالیتی ثبت نشده است</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div 
          key={index}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isDark 
              ? 'bg-[#0A1628]/50 hover:bg-[#0A1628]/80 hover:border-[#00D4FF]/30 hover:shadow-[#00D4FF]/10' 
              : 'bg-gray-50 hover:bg-white hover:border-[#C9A227]/30 hover:shadow-[#C9A227]/10'
          } border border-transparent hover:border-[#C9A227]/30 shadow-sm hover:shadow-[#C9A227]/20`}
        >
          <span className="text-xl">{activity.icon}</span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-[#1A2A3A]'} transition-colors duration-300`}>
              {activity.code}
            </p>
            <p className={`text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]'}`}>
              {SubBlockLifecycleService.getStatusLabel(activity.status as any) || activity.status}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
              {new Date(activity.updatedAt).toLocaleTimeString('fa-IR')}
            </p>
            <span className={`text-[10px] ${activity.color}`}>
              {new Date(activity.updatedAt).toLocaleDateString('fa-IR')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// مودال افزودن پیت
// ============================================

function AddPitModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  mineId,
  isDark 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  mineId: string;
  isDark: boolean;
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'فعال' | 'غیرفعال'>('فعال');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !code.trim()) {
      alert('نام و کد پیت الزامی است');
      return;
    }

    setLoading(true);
    try {
      const newPit: Pit = {
        id: crypto.randomUUID(),
        mineId,
        name: name.trim(),
        code: code.trim(),
        status,
        createdAt: new Date().toISOString(),
      };
      PitRepository.save(newPit);
      onSuccess();
      onClose();
      setName('');
      setCode('');
      setStatus('فعال');
    } catch (error) {
      alert('خطا در افزودن پیت');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${
          isDark ? 'bg-[#13203A] border border-[#AACCDD]/20' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              افزودن پیت جدید
            </h3>
            <button onClick={onClose} className={`p-1 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/5 text-[#8A9DB0]' : 'hover:bg-gray-100 text-gray-500'
            }`}>
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                نام پیت *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: پیت شمالی"
                className={`w-full px-4 py-2 rounded-xl border focus:outline-none ${
                  isDark 
                    ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#00D4FF]/50' 
                    : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#C9A227]/50'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                کد پیت *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثال: PT-002"
                className={`w-full px-4 py-2 rounded-xl border focus:outline-none ${
                  isDark 
                    ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#00D4FF]/50' 
                    : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#C9A227]/50'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                وضعیت
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'فعال' | 'غیرفعال')}
                className={`w-full px-4 py-2 rounded-xl border focus:outline-none ${
                  isDark 
                    ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white focus:border-[#00D4FF]/50' 
                    : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#C9A227]/50'
                }`}
              >
                <option value="فعال">فعال</option>
                <option value="غیرفعال">غیرفعال</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-semibold transition-all ${
                isDark 
                  ? 'bg-[#00D4FF] text-[#1A2A3A] hover:bg-[#00D4FF]/80' 
                  : 'bg-[#C9A227] text-white hover:bg-[#C9A227]/80'
              } disabled:opacity-50`}
            >
              {loading ? 'در حال افزودن...' : 'افزودن پیت'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// کامپوننت اصلی MinePage
// ============================================

interface MinePageProps {
  mineId: string;
  onBack?: () => void;
}

export function MinePage({ mineId, onBack }: MinePageProps) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [mine, setMine] = useState<Mine | null>(null);
  const [pits, setPits] = useState<Pit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPit, setShowAddPit] = useState(false);

  // آمار
  const [stats, setStats] = useState({
    totalPits: 0,
    activePits: 0,
    totalBlocks: 0,
    completedSubBlocks: 0,
    inProgressSubBlocks: 0,
    totalSamples: 0,
  });

  // ============================================
  // بارگذاری داده
  // ============================================

  const loadData = () => {
    setLoading(true);
    const mineData = MineRepository.getById(mineId);
    setMine(mineData);
    
    if (mineData) {
      const pitsData = PitRepository.findBy('mineId', mineData.id);
      setPits(pitsData);

      // محاسبه آمار
      const activePits = pitsData.filter(p => p.status === 'فعال').length;
      
      // دریافت بلوک‌ها و ساب‌بلوک‌ها
      const allBlocks = BlockRepository.getAll();
      const allSubBlocks = SubBlockRepository.getAll();
      const allSamples = SampleRepository.getAll();

      // تعداد بلوک‌های این معدن (با فرض اینکه بلوک‌ها به معدن متصل هستن)
      // فعلاً از همه بلوک‌ها استفاده می‌کنیم
      const completed = allSubBlocks.filter(sb => 
        ['COMPLETED', 'SOLD', 'FINAL_PRODUCT'].includes(sb.status)
      ).length;
      const inProgress = allSubBlocks.filter(sb => 
        !['COMPLETED', 'SOLD', 'FINAL_PRODUCT'].includes(sb.status)
      ).length;

      setStats({
        totalPits: pitsData.length,
        activePits,
        totalBlocks: allBlocks.length,
        completedSubBlocks: completed,
        inProgressSubBlocks: inProgress,
        totalSamples: allSamples.length,
      });
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [mineId]);

  // ============================================
  // حذف پیت
  // ============================================

  const handleDeletePit = (pitId: string) => {
    if (window.confirm('آیا از حذف این پیت اطمینان دارید؟')) {
      PitRepository.delete(pitId);
      loadData();
    }
  };

  // ============================================
  // وضعیت بارگذاری
  // ============================================

  if (loading) {
    return (
      <div className={`${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} min-h-screen p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-[#8A9DB0]">در حال بارگذاری...</div>
        </div>
      </div>
    );
  }

  if (!mine) {
    return (
      <div className={`${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} min-h-screen p-6`}>
        <div className="flex items-center justify-center h-64 text-red-400">
          معدن مورد نظر یافت نشد!
        </div>
      </div>
    );
  }

  // ============================================
  // رنگ‌های وضعیت
  // ============================================

  const statusColors: Record<string, string> = {
    'فعال': 'text-green-400 bg-green-400/10 border-green-400/20',
    'غیرفعال': 'text-red-400 bg-red-400/10 border-red-400/20',
    'در حال بهره‌برداری': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'متوقف': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  };

  // ============================================
  // رندر اصلی
  // ============================================

  return (
    <div className={`${isDark ? 'bg-[#0A1628]' : 'bg-gray-50'} min-h-screen p-6 transition-colors duration-300`}>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* ===== هدر ===== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack} 
                className={`p-2 rounded-xl transition-colors ${
                  isDark 
                    ? 'bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD]' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <span className="text-lg">←</span>
              </button>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {mine.name}
                </h1>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[mine.status] || 'text-gray-400 border-gray-400/20 bg-gray-400/10'}`}>
                  {mine.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                  {mine.code} • {mine.location}
                </p>
                <span className={`text-xs ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                  ایجاد: {new Date(mine.createdAt).toLocaleDateString('fa-IR')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/mine/map')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 ${
             isDark 
             ? 'text-[#AACCDD] bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20' 
             : 'text-[#1A2A3A] bg-[#1A2A3A]/10 hover:bg-[#1A2A3A]/20'
             }`}
              >
              <MapIcon className="w-4 h-4" />
             نقشه معدن
            </button>
            
            <button
              onClick={() => setShowAddPit(true)}
              className="px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 bg-[#C9A227] text-[#1A2A3A] hover:bg-[#D4AF37]"
            >
              <PlusIcon className="w-4 h-4" />
              افزودن پیت
            </button>
          </div>
        </div>

        {/* ===== Overview Cards ===== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <OverviewCard 
            title="پیت‌ها" 
            value={stats.totalPits} 
            subtitle={`${stats.activePits} فعال`}
            icon={CubeIcon}
            isDark={isDark}
            loading={loading}
          />
          <OverviewCard 
            title="بلوک‌ها" 
            value={stats.totalBlocks} 
            icon={MapIcon}
            isDark={isDark}
            loading={loading}
            color="text-[#4ECDC4]"
          />
          <OverviewCard 
            title="ساب‌بلوک‌ها" 
            value={stats.inProgressSubBlocks + stats.completedSubBlocks} 
            subtitle={`${stats.completedSubBlocks} تکمیل`}
            icon={CheckCircleIcon}
            isDark={isDark}
            loading={loading}
            color="text-[#C9A227]"
          />
          <OverviewCard 
            title="در حال انجام" 
            value={stats.inProgressSubBlocks} 
            icon={ClockIcon}
            isDark={isDark}
            loading={loading}
            color="text-[#FF9F43]"
          />
          <OverviewCard 
            title="نمونه‌ها" 
            value={stats.totalSamples} 
            icon={BeakerIcon}
            isDark={isDark}
            loading={loading}
            color="text-[#8B5CF6]"
          />
          <OverviewCard 
            title="وضعیت" 
            value={stats.activePits > 0 ? 'فعال' : 'غیرفعال'} 
            subtitle={`${stats.activePits} پیت فعال`}
            icon={TruckIcon}
            isDark={isDark}
            loading={loading}
            color={stats.activePits > 0 ? 'text-[#4ECDC4]' : 'text-[#FF6B6B]'}
          />
        </div>

        {/* ===== ردیف دوم: تولید پیت‌ها و فعالیت‌های اخیر ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-2xl p-6 transition-all duration-500 ${
            isDark 
              ? 'bg-[#13203A]/40 border border-[#2A3A5A]/30 hover:border-[#00D4FF]/40 hover:shadow-lg hover:shadow-[#00D4FF]/10' 
              : 'bg-white/70 border border-[#1A2A3A]/10 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/10'
          }`}>
            <h3 className={`${isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]'} font-semibold mb-4 flex items-center gap-2 transition-colors duration-500`}>
              <span className={`w-1 h-4 rounded-full ${
                isDark 
                  ? 'bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.5)]' 
                  : 'bg-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.5)]'
              }`}></span>
              تولید پیت‌ها
            </h3>
            <PitProductionDetail mineId={mine.id} />
          </div>
          
          <div className={`rounded-2xl p-6 transition-all duration-500 ${
            isDark 
              ? 'bg-[#13203A]/40 border border-[#2A3A5A]/30 hover:border-[#00D4FF]/40 hover:shadow-lg hover:shadow-[#00D4FF]/10' 
              : 'bg-white/70 border border-[#1A2A3A]/10 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/10'
          }`}>
            <h3 className={`${isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]'} font-semibold mb-4 flex items-center gap-2 transition-colors duration-500`}>
              <span className={`w-1 h-4 rounded-full ${
                isDark 
                  ? 'bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.5)]' 
                  : 'bg-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.5)]'
              }`}></span>
              فعالیت‌های اخیر
            </h3>
            <RecentActivities isDark={isDark} />
          </div>
        </div>

        {/* ===== جدول پیت‌ها ===== */}
        <div className={`rounded-2xl p-6 transition-all duration-500 ${
          isDark 
            ? 'bg-[#13203A]/40 border border-[#2A3A5A]/30 hover:border-[#00D4FF]/40 hover:shadow-lg hover:shadow-[#00D4FF]/10' 
            : 'bg-white/70 border border-[#1A2A3A]/10 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/10'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`${isDark ? 'text-[#8A9DB0]' : 'text-[#4A6A8A]'} font-semibold flex items-center gap-2 transition-colors duration-500`}>
              <span className={`w-1 h-4 rounded-full ${
                isDark 
                  ? 'bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.5)]' 
                  : 'bg-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.5)]'
              }`}></span>
              لیست پیت‌ها
              <span className={`text-xs ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                ({pits.length} پیت)
              </span>
            </h3>
          </div>

          {pits.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
              <p>هیچ پیتی برای این معدن تعریف نشده است</p>
              <button
                onClick={() => setShowAddPit(true)}
                className={`mt-2 text-sm ${isDark ? 'text-[#00D4FF] hover:text-[#00D4FF]/80' : 'text-[#C9A227] hover:text-[#C9A227]/80'}`}
              >
                + افزودن پیت جدید
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-200'}`}>
                    <th className={`px-4 py-3 text-xs font-medium ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>نام</th>
                    <th className={`px-4 py-3 text-xs font-medium ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>کد</th>
                    <th className={`px-4 py-3 text-xs font-medium ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>وضعیت</th>
                    <th className={`px-4 py-3 text-xs font-medium ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>تاریخ ایجاد</th>
                    <th className={`px-4 py-3 text-xs font-medium ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {pits.map((pit) => (
                    <tr key={pit.id} className={`border-b ${isDark ? 'border-[#AACCDD]/5' : 'border-gray-100'} hover:bg-white/5 transition-colors`}>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{pit.name}</td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>{pit.code}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pit.status === 'فعال' 
                            ? 'text-green-400 bg-green-400/10 border border-green-400/20' 
                            : 'text-red-400 bg-red-400/10 border border-red-400/20'
                        }`}>
                          {pit.status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-xs ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                        {new Date(pit.createdAt).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/mine/${mine.id}/pit/${pit.id}`)}
                            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                              isDark 
                                ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' 
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            مشاهده
                          </button>
                          <button
                            onClick={() => handleDeletePit(pit.id)}
                            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                              isDark 
                                ? 'hover:bg-red-500/20 text-red-400' 
                                : 'hover:bg-red-100 text-red-500'
                            }`}
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===== مودال افزودن پیت ===== */}
      <AddPitModal
        isOpen={showAddPit}
        onClose={() => setShowAddPit(false)}
        onSuccess={loadData}
        mineId={mine.id}
        isDark={isDark}
      />
    </div>
  );
}

export default MinePage;