// src/modules/mine/presentation/components/LifecycleHub/SubBlockSteppedProgress.tsx

import React from 'react';
import { 
  CheckCircle2, 
  FlaskConical, 
  Tag, 
  Truck, 
  CheckCheck,
  Layers
} from 'lucide-react';
import type { SubBlock } from '../../../../../core/domain/types/mine.types';

export interface LifecycleStageMeta {
  id: 'DEFINITION' | 'SAMPLING' | 'LAB' | 'CLASSIFICATION' | 'DESTINATION' | 'DELIVERY';
  stepNumber: number;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  actionType?: 'sample' | 'lab' | 'classify' | 'destination' | 'crush' | 'view';
}

export const LIFECYCLE_STAGES: LifecycleStageMeta[] = [
  {
    id: 'DEFINITION',
    stepNumber: 1,
    title: 'تفکیک و هندسه',
    shortTitle: 'تفکیک',
    description: 'تفکیک هندسی ساب‌بلوک و ثبت تناژ برآوردی',
    icon: Layers,
    actionType: 'view',
  },
  {
    id: 'SAMPLING',
    stepNumber: 2,
    title: 'نمونه‌برداری پودری',
    shortTitle: 'نمونه‌برداری',
    description: 'برداشت پودر چال‌های حفاری و ثبت بارکد',
    icon: FlaskConical,
    actionType: 'sample',
  },
  {
    id: 'LAB',
    stepNumber: 3,
    title: 'آنالیز آزمایشگاه XRF',
    shortTitle: 'آزمایشگاه',
    description: 'تعیین دقیق عیار آهن کل، فسفر، گوگرد و اکسیدها',
    icon: FlaskConical,
    actionType: 'lab',
  },
  {
    id: 'CLASSIFICATION',
    stepNumber: 4,
    title: 'طبقه‌بندی کانسار',
    shortTitle: 'طبقه‌بندی',
    description: 'تعیین کلاس کیفی ژئومتالورژی (پرعیار، متوسط، باطله)',
    icon: Tag,
    actionType: 'classify',
  },
  {
    id: 'DESTINATION',
    stepNumber: 5,
    title: 'تعیین مقصد و مجوز',
    shortTitle: 'تعیین مقصد',
    description: 'تخصیص به دپوی دپوبندی یا خط مستقیم خردایش',
    icon: Truck,
    actionType: 'destination',
  },
  {
    id: 'DELIVERY',
    stepNumber: 6,
    title: 'بارگیری و تحویل',
    shortTitle: 'تحویل نهایی',
    description: 'اعزام ناوگان شاول و دامپتراک و تخلیه در دپو',
    icon: CheckCheck,
    actionType: 'crush',
  },
];

export interface StageState {
  meta: LifecycleStageMeta;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING';
  valueSummary?: string;
  timestamp?: string;
  canTriggerAction: boolean;
}

/**
 * محاسبه دقیق موقعیت ساب‌بلوک در نوار پیشرفت ۶ مرحله‌ای
 */
export function getSubBlockStageStates(subBlock: SubBlock): {
  currentStageIndex: number;
  progressPercent: number;
  currentStage: LifecycleStageMeta;
  stages: StageState[];
} {
  const isSampled = !!subBlock.sampleId || subBlock.samplingCompletedAt || [
    'SAMPLING_COMPLETED', 'LAB_SENT', 'LAB_IN_PROGRESS', 'LAB_COMPLETED',
    'CLASSIFICATION_PENDING', 'CLASSIFICATION_DONE', 'DESTINATION_PENDING',
    'DESTINATION_APPROVED', 'LOADING_IN_PROGRESS', 'LOADING_COMPLETED',
    'TRANSPORTING', 'DELIVERED', 'PROCESSING', 'FINAL_PRODUCT', 'COMPLETED', 'SOLD'
  ].includes(subBlock.status);

  const isLabAssayed = (subBlock.labResults?.fe !== undefined) || [
    'LAB_COMPLETED', 'CLASSIFICATION_PENDING', 'CLASSIFICATION_DONE',
    'DESTINATION_PENDING', 'DESTINATION_APPROVED', 'LOADING_IN_PROGRESS',
    'LOADING_COMPLETED', 'TRANSPORTING', 'DELIVERED', 'PROCESSING',
    'FINAL_PRODUCT', 'COMPLETED', 'SOLD'
  ].includes(subBlock.status);

  const isClassified = !!subBlock.materialClass || [
    'CLASSIFICATION_DONE', 'DESTINATION_PENDING', 'DESTINATION_APPROVED',
    'LOADING_IN_PROGRESS', 'LOADING_COMPLETED', 'TRANSPORTING',
    'DELIVERED', 'PROCESSING', 'FINAL_PRODUCT', 'COMPLETED', 'SOLD'
  ].includes(subBlock.status);

  const isDestinationAssigned = !!subBlock.destination || [
    'DESTINATION_APPROVED', 'LOADING_IN_PROGRESS', 'LOADING_COMPLETED',
    'TRANSPORTING', 'DELIVERED', 'PROCESSING', 'FINAL_PRODUCT', 'COMPLETED', 'SOLD'
  ].includes(subBlock.status);

  const isDelivered = [
    'DELIVERED', 'PROCESSING', 'FINAL_PRODUCT', 'COMPLETED', 'SOLD'
  ].includes(subBlock.status);

  // تشخیص اندیس مرحله جاری (۰ تا ۵)
  let currentStageIndex = 0;
  if (isDelivered) {
    currentStageIndex = 5;
  } else if (isDestinationAssigned) {
    currentStageIndex = 5; // در حال بارگیری و تحویل
  } else if (isClassified) {
    currentStageIndex = 4; // نیازمند تعیین مقصد
  } else if (isLabAssayed) {
    currentStageIndex = 3; // نیازمند طبقه‌بندی
  } else if (isSampled) {
    currentStageIndex = 2; // در انتظار یا نیازمند نتایج آزمایشگاه
  } else {
    currentStageIndex = 1; // نیازمند نمونه‌برداری
  }

  const stages: StageState[] = LIFECYCLE_STAGES.map((meta, idx) => {
    let status: 'COMPLETED' | 'CURRENT' | 'PENDING' = 'PENDING';
    let valueSummary: string | undefined;
    let timestamp: string | undefined;
    let canTriggerAction = false;

    if (idx === 0) {
      status = 'COMPLETED';
      valueSummary = subBlock.tonnage ? `${subBlock.tonnage.toLocaleString()} تن` : 'تفکیک شد';
      timestamp = subBlock.subBlockedAt || subBlock.definedAt;
    } else if (idx === 1) {
      if (isSampled) {
        status = currentStageIndex === 1 && !isLabAssayed ? 'CURRENT' : 'COMPLETED';
        valueSummary = subBlock.sampleNumber ? `کد: ${subBlock.sampleNumber}` : 'نمونه اخذ شد';
        timestamp = subBlock.samplingCompletedAt;
      } else if (currentStageIndex === 1) {
        status = 'CURRENT';
        valueSummary = 'در انتظار نمونه‌برداری';
        canTriggerAction = true;
      }
    } else if (idx === 2) {
      if (isLabAssayed) {
        status = currentStageIndex === 2 && !isClassified ? 'CURRENT' : 'COMPLETED';
        valueSummary = subBlock.labResults?.fe !== undefined 
          ? `${subBlock.labResults.fe.toFixed(1)}% Fe` 
          : 'آنالیز کامل';
        timestamp = subBlock.labResults?.labCompletedAt;
      } else if (currentStageIndex === 2) {
        status = 'CURRENT';
        valueSummary = 'ارسال به آزمایشگاه XRF';
        canTriggerAction = true;
      }
    } else if (idx === 3) {
      if (isClassified) {
        status = currentStageIndex === 3 && !isDestinationAssigned ? 'CURRENT' : 'COMPLETED';
        valueSummary = subBlock.materialClass || 'طبقه‌بندی شد';
        timestamp = subBlock.classifiedAt;
      } else if (currentStageIndex === 3) {
        status = 'CURRENT';
        valueSummary = 'آماده طبقه‌بندی عیار';
        canTriggerAction = true;
      }
    } else if (idx === 4) {
      if (isDestinationAssigned) {
        status = currentStageIndex === 4 && !isDelivered ? 'CURRENT' : 'COMPLETED';
        valueSummary = subBlock.destination || 'مقصد مشخص شد';
      } else if (currentStageIndex === 4) {
        status = 'CURRENT';
        valueSummary = 'در انتظار تعیین مقصد';
        canTriggerAction = true;
      }
    } else if (idx === 5) {
      if (isDelivered) {
        status = 'COMPLETED';
        valueSummary = subBlock.crusherFeedData ? 'تخلیه سنگ‌شکن' : 'تخلیه در دپو';
      } else if (currentStageIndex === 5) {
        status = 'CURRENT';
        valueSummary = 'بارگیری و اعزام تراک‌ها';
        canTriggerAction = true;
      }
    }

    return {
      meta,
      status,
      valueSummary,
      timestamp,
      canTriggerAction,
    };
  });

  // محاسبه درصد پیشرفت بر اساس مراحل تکمیل شده
  const completedCount = stages.filter(s => s.status === 'COMPLETED').length;
  // اگر مرحله جاری نهایی باشد، 100%
  const progressPercent = isDelivered 
    ? 100 
    : Math.round(((completedCount + (stages[currentStageIndex]?.status === 'CURRENT' ? 0.5 : 0)) / 6) * 100);

  return {
    currentStageIndex,
    progressPercent,
    currentStage: LIFECYCLE_STAGES[currentStageIndex],
    stages,
  };
}

interface SubBlockSteppedProgressProps {
  subBlock: SubBlock;
  variant?: 'compact' | 'detailed' | 'minimal';
  interactive?: boolean;
  onActionClick?: (subBlock: SubBlock, actionType: 'sample' | 'lab' | 'classify' | 'destination' | 'crush' | 'view') => void;
}

export const SubBlockSteppedProgress: React.FC<SubBlockSteppedProgressProps> = ({
  subBlock,
  variant = 'compact',
  interactive = true,
  onActionClick,
}) => {
  const { currentStageIndex, progressPercent, currentStage, stages } = getSubBlockStageStates(subBlock);

  const handleStepClick = (e: React.MouseEvent, stage: StageState) => {
    e.stopPropagation();
    if (!interactive || !onActionClick) return;

    if (stage.meta.actionType) {
      onActionClick(subBlock, stage.meta.actionType);
    }
  };

  // ============================================
  // ۱. حالت فشرده (مخصوص ستون جدول)
  // ============================================
  if (variant === 'compact') {
    return (
      <div className="flex flex-col gap-1.5 min-w-[220px] max-w-[280px]" dir="rtl">
        {/* هدر کوتاه: نام مرحله جاری و درصد */}
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="font-bold text-slate-200 truncate">
              گام {currentStage.stepNumber} از ۶: {currentStage.shortTitle}
            </span>
          </div>
          <span className="font-mono font-bold text-xs text-cyan-400 shrink-0">
            {progressPercent}٪
          </span>
        </div>

        {/* خط لوله پیشرفت مرحله‌ای با گره‌های متصل */}
        <div className="relative flex items-center justify-between py-1">
          {/* خط اتصال زمینه خاکستری */}
          <div className="absolute top-1/2 left-2 right-2 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0" />
          
          {/* خط اتصال پر شده با گرادیان پیشرفت */}
          <div 
            className="absolute top-1/2 right-2 -translate-y-1/2 h-1 bg-gradient-to-l from-cyan-400 via-blue-500 to-emerald-400 rounded-full z-0 transition-all duration-500"
            style={{ 
              width: `${Math.max(4, Math.min(96, (currentStageIndex / 5) * 100))}%` 
            }}
          />

          {/* گره‌های ۶ مرحله */}
          {stages.map((stage, idx) => {
            const isCompleted = stage.status === 'COMPLETED';
            const isCurrent = stage.status === 'CURRENT';
            const isClickable = interactive && !!onActionClick;

            return (
              <div 
                key={stage.meta.id}
                onClick={(e) => isClickable && handleStepClick(e, stage)}
                title={`${stage.meta.stepNumber}. ${stage.meta.title} (${
                  isCompleted ? 'تکمیل شده: ' + (stage.valueSummary || '') :
                  isCurrent ? 'مرحله جاری: ' + (stage.valueSummary || '') : 'در انتظار اقدام'
                })`}
                className={`relative z-10 flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-mono font-bold transition-all duration-200 select-none ${
                  isCompleted
                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30 ring-2 ring-emerald-400/30 cursor-pointer hover:scale-110'
                    : isCurrent
                    ? `bg-slate-900 ring-2 ring-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/40 animate-pulse ${
                        isClickable ? 'cursor-pointer hover:scale-125' : ''
                      }`
                    : 'bg-slate-800 border border-slate-700 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <span>{stage.meta.stepNumber}</span>
                )}

                {/* نشانگر کوچک متنی مرحله جاری */}
                {isCurrent && (
                  <span className="absolute -bottom-4 font-sans text-[9px] font-bold text-cyan-300 whitespace-nowrap bg-[#0B1528] px-1 py-0.2 rounded border border-cyan-500/30">
                    {stage.meta.shortTitle}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* زیرنویس خلاصه‌ی آخرین اقدام */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <span className="truncate text-slate-400">
            {stages[currentStageIndex]?.valueSummary || 'در جریان است'}
          </span>
          {stages[currentStageIndex]?.canTriggerAction && (
            <span className="text-cyan-400 font-semibold text-[10px] hover:underline cursor-pointer shrink-0">
              اقدام کن ›
            </span>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // ۲. حالت مینی‌مال (ساده و باریک)
  // ============================================
  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2" dir="rtl">
        <div className="flex items-center gap-1">
          {stages.map((s, i) => (
            <span
              key={s.meta.id}
              title={`${s.meta.stepNumber}. ${s.meta.title}`}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                s.status === 'COMPLETED'
                  ? 'bg-emerald-400'
                  : s.status === 'CURRENT'
                  ? 'bg-cyan-400 ring-2 ring-cyan-400/40 animate-pulse'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-mono font-bold text-slate-300">
          {progressPercent}٪
        </span>
      </div>
    );
  }

  // ============================================
  // ۳. حالت کامل و تفصیلی (Detailed Stepped Pipeline)
  // ============================================
  return (
    <div className="p-4 rounded-2xl bg-[#091122]/90 border border-slate-800/80 shadow-inner space-y-3" dir="rtl">
      {/* ردیف فوقانی: وضعیت کلی و درصد پیشرفت */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
            مرحله جاری: {currentStage.title}
          </span>
          <span className="text-xs text-slate-400">
            (گام {currentStage.stepNumber} از ۶)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-l from-cyan-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-white">
            {progressPercent}٪ پیشرفت
          </span>
        </div>
      </div>

      {/* نوار افقی ۶ مرحله‌ای با کارتچه‌ها */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
        {stages.map((stage, idx) => {
          const isCompleted = stage.status === 'COMPLETED';
          const isCurrent = stage.status === 'CURRENT';
          const IconComp = stage.meta.icon;

          return (
            <div
              key={stage.meta.id}
              onClick={(e) => interactive && handleStepClick(e, stage)}
              className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                isCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer'
                  : isCurrent
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/15 cursor-pointer ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              <div>
                {/* شماره گام و آیکون */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950'
                      : isCurrent
                      ? 'bg-cyan-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isCompleted ? '✓' : stage.meta.stepNumber}
                  </span>
                  <IconComp className={`w-4 h-4 ${
                    isCompleted ? 'text-emerald-400' : isCurrent ? 'text-cyan-400' : 'text-slate-500'
                  }`} />
                </div>

                {/* عنوان گام */}
                <p className={`text-xs font-bold ${
                  isCompleted ? 'text-slate-200' : isCurrent ? 'text-cyan-300' : 'text-slate-400'
                }`}>
                  {stage.meta.shortTitle}
                </p>

                {/* مقدار ثبت شده یا وضعیت */}
                <p className="text-[11px] text-slate-400 mt-1 truncate">
                  {stage.valueSummary || (isCompleted ? 'انجام شد' : 'در انتظار')}
                </p>
              </div>

              {/* دکمه اقدام اگر در این مرحله متوقف است */}
              {isCurrent && stage.meta.actionType && (
                <div className="mt-2 pt-1.5 border-t border-cyan-500/20 text-center">
                  <span className="text-[10px] font-bold text-cyan-300 hover:text-white transition-colors block py-0.5 bg-cyan-500/20 rounded-md">
                    انجام مرحله ›
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubBlockSteppedProgress;
