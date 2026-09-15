// src/modules/tally/presentation/components/WorkingFaceProgressCard.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { BlockWorkingFaceProgress } from '../../services/HaulageTallyService';
import { BlockProgressVisualizer } from './BlockProgressVisualizer';
import { BlockCodeDisplay } from '../../../../shared/components/BlockCodeDisplay';
import { 
  MapPinIcon, 
  TruckIcon, 
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArchiveBoxIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface WorkingFaceProgressCardProps {
  progress: BlockWorkingFaceProgress;
  onQuickLogTrip?: (blockId: string, subBlockId?: string) => void;
  className?: string;
}

export const WorkingFaceProgressCard: React.FC<WorkingFaceProgressCardProps> = ({
  progress,
  onQuickLogTrip,
  className = '',
}) => {
  const { isDark } = useTheme();
  const [showSubBlocks, setShowSubBlocks] = useState(true);
  const [showEquipment, setShowEquipment] = useState(false);

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
      isDark ? 'bg-[#0E172A]/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
    } ${className}`}>
      {/* Top Banner: Face Name, Bench & Quick Log */}
      <div className={`p-4 border-b ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-black">
              <MapPinIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-100">
                  {progress.workingFaceName}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  تراز {progress.benchLevel}m
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>بلوک:</span>
                <BlockCodeDisplay code={progress.blockCode} className="text-slate-200 font-bold" />
                <span>({progress.blockName}) | دانسیته سنگ: {progress.density} t/m³</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onQuickLogTrip && (
              <button
                onClick={() => onQuickLogTrip(progress.blockId)}
                className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>ثبت سرویس برای این جبهه‌کار</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Gauge & KPI Section */}
      <div className="p-4 space-y-4">
        {/* Progress Gauge */}
        <BlockProgressVisualizer
          progressPercent={progress.progressPercent}
          totalVolumeM3={progress.totalEstimatedVolumeM3}
          hauledVolumeM3={progress.totalHauledVolumeM3}
          remainingVolumeM3={progress.remainingVolumeM3}
          totalTonnage={progress.totalEstimatedTonnage}
          hauledTonnage={progress.totalHauledTonnage}
          remainingTonnage={progress.remainingTonnage}
          blockCode={progress.blockCode}
          variant="both"
        />

        {/* Destination Dumps Inflow Pills */}
        {progress.destinationsSummary.length > 0 && (
          <div className={`p-3 rounded-xl border space-y-2 ${
            isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <ArchiveBoxIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>مقاصد تخلیه بار از این جبهه‌کار در شیفت جاری:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {progress.destinationsSummary.map((dest, dIdx) => (
                <div
                  key={`dest-${dest.stockpileId}-${dIdx}`}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                    dest.isWaste
                      ? isDark ? 'bg-amber-950/30 border-amber-800/50 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                      : isDark ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <span className="font-bold">{dest.stockpileName}</span>
                  <span className="font-mono font-black text-[11px]">
                    {dest.tonnage.toLocaleString('fa-IR')} تن ({dest.trips} سرویس)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Blocks Breakdown Accordion */}
        <div className="space-y-2">
          <button
            onClick={() => setShowSubBlocks(!showSubBlocks)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 py-1 hover:text-cyan-400 transition-colors"
          >
            <span>تفکیک و پیشرفت ساب‌بلوک‌های استخراجی ({progress.subBlocks.length} ساب‌بلوک)</span>
            {showSubBlocks ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </button>

          {showSubBlocks && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {progress.subBlocks.map((sb) => {
                const isComplete = sb.progressPercent >= 100;
                return (
                  <div
                    key={sb.id}
                    className={`p-3 rounded-xl border text-xs space-y-2 ${
                      isComplete 
                        ? isDark ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/50 border-emerald-200'
                        : isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <BlockCodeDisplay code={sb.code} className="font-bold text-slate-200" />
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {sb.progressPercent}٪ استخراج
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isComplete ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                        style={{ width: `${sb.progressPercent}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400">
                      <div>
                        <span>برداشت: </span>
                        <span className="text-slate-200 font-bold">{sb.hauledTonnage.toLocaleString('fa-IR')} تن</span>
                      </div>
                      <div>
                        <span>باقی‌مانده: </span>
                        <span className="text-amber-400 font-bold">{sb.remainingTonnage.toLocaleString('fa-IR')} تن</span>
                      </div>
                      <div>
                        <span>سرویس‌ها: </span>
                        <span className="text-slate-300 font-bold">{sb.truckCount} دور</span>
                      </div>
                      <div>
                        <span>حجم باقی: </span>
                        <span className="text-slate-300 font-bold">{sb.remainingVolumeM3} m³</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Machinery Assigned to this Face */}
        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          <button
            onClick={() => setShowEquipment(!showEquipment)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-400 py-1 hover:text-cyan-400 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <TruckIcon className="w-4 h-4 text-cyan-400" />
              <span>ماشین‌آلات فعال و ساعت کارکرد در این جبهه‌کار ({progress.activeEquipment.length} دستگاه)</span>
            </span>
            {showEquipment ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </button>

          {showEquipment && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {progress.activeEquipment.length > 0 ? (
                progress.activeEquipment.map((eq, eIdx) => (
                  <div
                    key={`eq-face-${eq.code}-${eIdx}`}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-black text-slate-200">{eq.code}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{eq.nameFa}</div>
                    </div>
                    <div className="text-left font-mono">
                      <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3 text-amber-400" />
                        <span>{eq.shiftHours}h</span>
                      </div>
                      <div className="text-[9px] text-emerald-400">شیفت جاری</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-2 text-xs text-slate-500">
                  ماشین‌آلات در حال تردد در جبهه‌کارهای پله ۱۰۴۰
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
