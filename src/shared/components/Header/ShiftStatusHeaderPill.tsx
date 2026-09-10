// src/shared/components/Header/ShiftStatusHeaderPill.tsx

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShiftHandoverService } from '../../../modules/workspace/services/ShiftHandoverService';
import { ShiftHandoverModal } from '../../../modules/workspace/presentation/components/ShiftHandover/ShiftHandoverModal';
import { ShiftHandoverRecord } from '../../../core/domain/types/shift-handover.types';
import type { User } from '../../../core/domain/types/mine.types';
import { RotateCcw } from 'lucide-react';

interface ShiftStatusHeaderPillProps {
  currentUser: User | null;
}

export const ShiftStatusHeaderPill: React.FC<ShiftStatusHeaderPillProps> = ({ currentUser }) => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const [activeHandover, setActiveHandover] = useState<ShiftHandoverRecord | null>(() => {
    return ShiftHandoverService.getCurrentActiveHandover();
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      setActiveHandover(ShiftHandoverService.getCurrentActiveHandover());
    };
    window.addEventListener('shiftHandoverUpdated', handler);
    return () => window.removeEventListener('shiftHandoverUpdated', handler);
  }, []);

  const isReady = activeHandover?.status === 'READY_FOR_HANDOVER';
  const isCompleted = activeHandover?.status === 'HANDED_OVER';

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm ${
          isReady
            ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30 animate-pulse'
            : isCompleted
            ? isDark
              ? 'bg-[#141F42] hover:bg-[#1E2D5C] border-[#24356B]/40 text-[#F1F5F9]'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            : isDark
            ? 'bg-cyan-950/30 hover:bg-cyan-900/40 border-cyan-500/30 text-cyan-300'
            : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-800'
        }`}
        title="مرکز تحویل و تحول هوشمند شیفت کاری معدن (Shift Handover)"
      >
        <div className="flex items-center gap-1.5">
          <RotateCcw className={`w-3.5 h-3.5 ${isReady ? 'text-amber-400 animate-spin' : 'text-[#00D2FF]'}`} style={{ animationDuration: '6s' }} />
          <span>{activeHandover ? activeHandover.shiftTitleFa.split('-')[0].trim() : (isRtl ? 'شیفت ۱ روز' : 'Shift 1')}</span>
        </div>

        <span className={`w-1.5 h-1.5 rounded-full ${
          isReady ? 'bg-amber-400' : isCompleted ? 'bg-emerald-400' : 'bg-[#00D2FF]'
        }`} />

        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-white font-black">
          {isReady ? (isRtl ? 'آماده تحویل' : 'Ready') : isCompleted ? (isRtl ? 'تحویل شد' : 'Handed Over') : (isRtl ? 'فعال' : 'Live')}
        </span>
      </button>

      <ShiftHandoverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        targetDepartmentKey={currentUser?.department || 'ALL_MINE'}
        targetDepartmentName={currentUser?.department || 'عملیات یکپارچه معدن'}
      />
    </>
  );
};
