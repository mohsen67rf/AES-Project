// src/modules/mine/presentation/pages/MiningLifecyclePage.tsx

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../../../dashboard/presentation/components/Header/Header';
import { BlockSubBlockLifecycleHub } from '../components/LifecycleHub/BlockSubBlockLifecycleHub';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export function MiningLifecyclePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBlockId = searchParams.get('blockId') || undefined;

  return (
    <div className="min-h-screen bg-[#070F1E] text-white flex flex-col font-sans selection:bg-[#00D4FF]/30">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* نوار ناوبری بالا */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/blocks-management')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8A9DB0] hover:text-white transition-colors cursor-pointer text-xs font-medium border border-white/10"
          >
            <ArrowRightIcon className="w-4 h-4" />
            <span>بازگشت به مدیریت بلوک‌ها</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8A9DB0] hover:text-white transition-colors cursor-pointer text-xs"
            >
              داشبورد اصلی
            </button>
          </div>
        </div>

        {/* کامپوننت هسته چرخه‌ی زندگی */}
        <BlockSubBlockLifecycleHub initialBlockId={initialBlockId} />
      </main>
    </div>
  );
}

export default MiningLifecyclePage;
