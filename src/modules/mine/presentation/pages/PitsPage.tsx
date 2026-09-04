// src/modules/mine/presentation/pages/PitsPage.tsx

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { Header } from '../../../dashboard/presentation/components/Header/Header';
import { PitRepository, MineRepository } from '../../../../core/infrastructure/repositories';
import { ArrowRightIcon, MapIcon, CubeIcon } from '@heroicons/react/24/outline';

export const PitsPage: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { mineId } = useParams<{ mineId: string }>();

  const mine = (mineId ? MineRepository.getById(mineId) : null) || MineRepository.getAll()[0];
  const pits = PitRepository.getAll();

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#0A1628] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
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
              <h1 className="text-xl font-black">پیت‌ها و جبهه‌کارهای معدنی {mine?.name || ''}</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pits.map((pit) => (
            <div
              key={pit.id}
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="font-bold text-base mb-2">{pit.name}</h3>
              <p className="text-xs text-[#8A9DB0] mb-4">کد پیت: {pit.code || pit.id}</p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/mine/map')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/30 transition-colors flex items-center gap-1"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>نقشه پیت</span>
                </button>
                <button
                  onClick={() => navigate('/blocks-management')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C9A227]/20 text-[#C9A227] hover:bg-[#C9A227]/30 transition-colors flex items-center gap-1"
                >
                  <CubeIcon className="w-3.5 h-3.5" />
                  <span>بلوک‌ها</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PitsPage;
