// src/modules/mine/presentation/components/LifecycleHub/SubBlockProgressCard.tsx

import React from 'react';
import { 
  SubBlockSteppedProgress, 
  getSubBlockStageStates 
} from './SubBlockSteppedProgress';
import type { SubBlock } from '../../../../../core/domain/types/mine.types';
import { 
  Beaker, 
  Sparkles, 
  Truck, 
  Scale, 
  ArrowLeft,
  Tag,
  Factory
} from 'lucide-react';
import { DESTINATION_LABELS } from '../../../../../core/domain/constants/mine.constants';
import { BlockCodeDisplay } from '../../../../../shared/components/BlockCodeDisplay';

interface SubBlockProgressCardProps {
  subBlock: SubBlock;
  onCardClick?: (subBlock: SubBlock) => void;
  onActionClick?: (subBlock: SubBlock, actionType: 'sample' | 'lab' | 'classify' | 'destination' | 'crush' | 'view') => void;
}

export const SubBlockProgressCard: React.FC<SubBlockProgressCardProps> = ({
  subBlock,
  onCardClick,
  onActionClick,
}) => {
  const { currentStageIndex, progressPercent } = getSubBlockStageStates(subBlock);
  const fe = subBlock.labResults?.fe;
  const feo = subBlock.labResults?.feo;
  const sio2 = subBlock.labResults?.sio2;

  // رنگ عیار
  const getGradeColor = (val: number | undefined) => {
    if (val === undefined) return 'text-slate-400 bg-slate-800/60 border-slate-700';
    if (val >= 58) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (val >= 48) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    if (val >= 35) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  // تعیین عنوان و آیکون دکمه اقدام بعدی
  const getNextActionConfig = () => {
    switch (currentStageIndex) {
      case 1:
        return {
          title: 'ثبت نمونه‌برداری پودری',
          icon: Beaker,
          type: 'sample' as const,
          color: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20',
        };
      case 2:
        return {
          title: 'ثبت نتایج آزمایشگاه XRF',
          icon: Beaker,
          type: 'lab' as const,
          color: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20',
        };
      case 3:
        return {
          title: 'طبقه‌بندی کیفی ژئومتالورژی',
          icon: Tag,
          type: 'classify' as const,
          color: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20',
        };
      case 4:
        return {
          title: 'تعیین مقصد و مجوز حمل',
          icon: Truck,
          type: 'destination' as const,
          color: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20',
        };
      case 5:
        return {
          title: 'ثبت تحویل در سنگ‌شکن / دپو',
          icon: Factory,
          type: 'crush' as const,
          color: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20',
        };
      default:
        return {
          title: 'مشاهده شناسنامه کامل',
          icon: ArrowLeft,
          type: 'view' as const,
          color: 'bg-slate-700 hover:bg-slate-600 text-white',
        };
    }
  };

  const nextAction = getNextActionConfig();

  return (
    <div 
      onClick={() => onCardClick && onCardClick(subBlock)}
      className="group relative p-5 rounded-2xl bg-gradient-to-br from-[#0B162C] via-[#0E1E3A] to-[#091326] border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 cursor-pointer flex flex-col justify-between gap-4"
      dir="rtl"
    >
      {/* سربرگ کارت: کد ساب‌بلوک، تراز، تناژ و درصد پیشرفت */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
            <h4 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
              <BlockCodeDisplay code={subBlock.code} className="text-white group-hover:text-cyan-300 font-bold" />
            </h4>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[11px] font-mono">
              تراز {subBlock.benchLevel || '۱۰۴۰'}m
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <Scale className="w-3.5 h-3.5 text-slate-500" />
              {subBlock.tonnage ? `${subBlock.tonnage.toLocaleString()} تن` : subBlock.estimatedTonnage ? `~${subBlock.estimatedTonnage.toLocaleString()} تن` : 'تناژ برآوردی'}
            </span>
            {subBlock.materialClass && (
              <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[11px] font-medium">
                {subBlock.materialClass}
              </span>
            )}
          </div>
        </div>

        {/* عیار آهن یا نشانگر درصد پیشرفت */}
        <div className="flex flex-col items-end gap-1.5">
          {fe !== undefined ? (
            <div className={`px-2.5 py-1 rounded-xl border font-mono font-bold text-xs flex items-center gap-1 ${getGradeColor(fe)}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{fe.toFixed(2)}% Fe</span>
            </div>
          ) : (
            <div className="px-2 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-[11px]">
              در انتظار آنالیز
            </div>
          )}

          <span className="text-[11px] font-mono text-cyan-400 font-bold">
            {progressPercent}٪ چرخه
          </span>
        </div>
      </div>

      {/* نوار پیشرفت مرحله‌ای مرکزی (The Stepped Progress Bar) */}
      <div className="p-3 rounded-xl bg-[#060D1A]/80 border border-slate-800/80">
        <SubBlockSteppedProgress 
          subBlock={subBlock} 
          variant="compact"
          interactive={true}
          onActionClick={onActionClick}
        />
      </div>

      {/* خلاصه اطلاعات مهندسی و پارامترها */}
      <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-800/70">
        {/* نمونه‌برداری */}
        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-slate-500 block text-[10px] mb-0.5">نمونه‌برداری</span>
          <span className="text-slate-300 font-mono font-medium truncate block">
            {subBlock.sampleNumber || (subBlock.sampleId ? 'اخذ شده' : '—')}
          </span>
        </div>

        {/* اکسید آهن و عیار */}
        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-slate-500 block text-[10px] mb-0.5">FeO / SiO2</span>
          <span className="text-slate-300 font-mono font-medium truncate block">
            {feo ? `${feo.toFixed(1)}%` : '—'} / {sio2 ? `${sio2.toFixed(1)}%` : '—'}
          </span>
        </div>

        {/* مقصد بارگیری */}
        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
          <span className="text-slate-500 block text-[10px] mb-0.5">مقصد حمل</span>
          <span className="text-slate-300 font-medium truncate block" title={subBlock.destination}>
            {subBlock.crusherFeedData 
              ? (subBlock.crusherFeedData.lineName || 'سنگ‌شکن') 
              : subBlock.destination 
              ? (DESTINATION_LABELS[subBlock.destination] || subBlock.destination) 
              : 'تعیین نشده'}
          </span>
        </div>
      </div>

      {/* دکمه هوشمند اقدام مرحله بعدی */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onActionClick) onActionClick(subBlock, nextAction.type);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${nextAction.color}`}
        >
          <nextAction.icon className="w-4 h-4" />
          <span>{nextAction.title}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onActionClick) onActionClick(subBlock, 'view');
          }}
          title="مشاهده جزئیات کامل"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/10 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SubBlockProgressCard;
