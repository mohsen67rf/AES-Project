// src/modules/mine/presentation/pages/MinePage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { Header } from '../../../dashboard/presentation/components/Header/Header';
import { 
  MineRepository, 
  PitRepository, 
  BlockRepository 
} from '../../../../core/infrastructure/repositories';
import { 
  MapIcon, 
  CubeIcon, 
  SparklesIcon, 
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface MinePageProps {
  mineId?: string;
}

export const MinePage: React.FC<MinePageProps> = ({ mineId }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const mines = MineRepository.getAll();
  const mine = (mineId ? MineRepository.getById(mineId) : null) || mines[0] || {
    id: '1',
    name: 'معدن سنگ آهن مرکزی',
    code: 'MINE-01',
    location: 'بافق - یزد',
    capacity: 2500000,
    currentProduction: 1850000,
  };

  const pits = PitRepository.getAll();
  const blocks = BlockRepository.getAll();

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#0A1628] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A] text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black">{mine.name}</h1>
              <p className="text-xs text-[#8A9DB0]">موقعیت: {mine.location || 'بخش معدنی مرکزی'} • کد: {mine.code}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/mine/map')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/30 border border-[#00D4FF]/40 flex items-center gap-1.5 transition-all"
            >
              <MapIcon className="w-4 h-4" />
              <span>نقشه سه‌بعدی معدن</span>
            </button>

            <button
              onClick={() => navigate('/blocks-management')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-white flex items-center gap-1.5 transition-all shadow-md hover:shadow-[#00D4FF]/25"
            >
              <CubeIcon className="w-4 h-4" />
              <span>مدیریت بلوک‌ها</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-white border-slate-200'}`}>
            <div className="text-xs text-[#8A9DB0]">ظرفیت اسمی سالانه</div>
            <div className="text-xl font-black text-[#00D4FF] mt-1">{(mine.capacity || 2500000).toLocaleString()} تن</div>
          </div>
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-white border-slate-200'}`}>
            <div className="text-xs text-[#8A9DB0]">تعداد پیت‌های فعال</div>
            <div className="text-xl font-black text-emerald-400 mt-1">{pits.length || 3} پیت استخراجی</div>
          </div>
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-white border-slate-200'}`}>
            <div className="text-xs text-[#8A9DB0]">بلوک‌های مدل معدن</div>
            <div className="text-xl font-black text-[#C9A227] mt-1">{blocks.length} بلوک فعال</div>
          </div>
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-white border-slate-200'}`}>
            <div className="text-xs text-[#8A9DB0]">ضریب پایش کیفیت عیار</div>
            <div className="text-xl font-black text-purple-400 mt-1">۹۸.۴٪ تطابق مدل</div>
          </div>
        </div>

        {/* Quick Links Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => navigate('/mine/map')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
              isDark ? 'bg-[#101D33] border-[#2A3A5A] hover:border-[#00D4FF]/50' : 'bg-white border-slate-200 hover:border-cyan-400'
            }`}
          >
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-3">
              <MapIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">نقشه سه‌بعدی و ترازهای استخراج</h3>
          </div>

          <div 
            onClick={() => navigate('/blocks-management')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
              isDark ? 'bg-[#101D33] border-[#2A3A5A] hover:border-[#C9A227]/50' : 'bg-white border-slate-200 hover:border-amber-400'
            }`}
          >
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-3">
              <CubeIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">مدیریت و صدور مجوز بلوک‌ها</h3>
          </div>

          <div 
            onClick={() => navigate('/mining-lifecycle')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
              isDark ? 'bg-[#101D33] border-[#2A3A5A] hover:border-purple-500/50' : 'bg-white border-slate-200 hover:border-purple-400'
            }`}
          >
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-3">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">چرخه ساب‌بلوک‌ها و خطوط خردایش</h3>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MinePage;
