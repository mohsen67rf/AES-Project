// src/modules/mine/presentation/components/BlockTimeline.tsx

import React from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { CheckCircleIcon, ClockIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import type { FullBlock } from '../../../../core/domain/types/block.types';

interface BlockTimelineProps {
  block: FullBlock;
}

export const BlockTimeline: React.FC<BlockTimelineProps> = ({ block }) => {
  const { isDark } = useTheme();
  const timeline = block.timeline || [];

  return (
    <div className="space-y-4">
      {timeline.length === 0 ? (
        <div className="text-center py-6 text-xs text-[#8A9DB0]">
          رویدادی در تاریخچه این بلوک ثبت نشده است.
        </div>
      ) : (
        <div className="relative border-r-2 border-[#2A3A5A]/50 mr-3 space-y-6 pr-4">
          {timeline.map((event, idx) => (
            <div key={event.id || idx} className="relative">
              <div className={`absolute -right-[23px] top-0 w-3.5 h-3.5 rounded-full border-2 ${
                event.type === 'SUCCESS' ? 'bg-emerald-500 border-emerald-300' :
                event.type === 'WARNING' ? 'bg-amber-500 border-amber-300' :
                event.type === 'ERROR' ? 'bg-rose-500 border-rose-300' :
                'bg-[#00D4FF] border-cyan-200'
              }`} />

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white">{event.title}</h4>
                  <span className="text-[10px] text-[#8A9DB0] font-mono">
                    {new Date(event.timestamp).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <p className="text-xs text-[#8A9DB0] mt-1">{event.description}</p>
                <div className="text-[10px] text-[#C9A227] mt-1">توسط: {event.actor}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockTimeline;
