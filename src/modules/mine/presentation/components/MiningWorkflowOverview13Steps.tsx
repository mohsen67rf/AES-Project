// src/modules/mine/presentation/components/MiningWorkflowOverview13Steps.tsx

import React, { useState } from 'react';
import { 
  FolderIcon, 
  CheckBadgeIcon, 
  WrenchScrewdriverIcon, 
  DocumentCheckIcon, 
  PlayCircleIcon, 
  BeakerIcon, 
  SparklesIcon, 
  TagIcon, 
  MapPinIcon, 
  TruckIcon, 
  ArchiveBoxIcon, 
  CubeTransparentIcon, 
  GlobeAltIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface MiningWorkflowOverviewProps {
  onStepSelect?: (stepNumber: number) => void;
  activeStep?: number;
}

export const WORKFLOW_STAGES = [
  {
    step: 1,
    title: '۱. باندهای طراحی ماهانه',
    subtitle: 'تعریف حجم، تناژ جنس سنگ و تراز پله توسط واحد نظارت',
    pillar: 'نظارت',
    icon: FolderIcon,
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/40',
    textColor: 'text-cyan-400',
    details: 'واحد نظارت بر اساس طرح استخراج معدن، باندهای طراحی ماهانه را همراه با حجم، تناژ و جنس سنگ در سامانه بارگذاری می‌نماید.',
  },
  {
    step: 2,
    title: '۲. تأیید و اشتراک‌گذاری باندها',
    subtitle: 'بررسی و تصویب کارفرما و ابلاغ برخط به پیمانکار استخراج',
    pillar: 'کارفرما',
    icon: CheckBadgeIcon,
    color: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    details: 'دفتر فنی کارفرما باندها را بررسی و در صورت انطباق با برنامه تولید ماهانه تأیید کرده و در سامانه با پیمانکار استخراج به اشتراک می‌گذارد.',
  },
  {
    step: 3,
    title: '۳. طراحی شبکه چال‌ها',
    subtitle: 'محاسبه بار سنگ، فاصله ردیف، قطر مته و متراژ کل توسط پیمانکار',
    pillar: 'پیمانکار استخراج',
    icon: WrenchScrewdriverIcon,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    details: 'دفتر فنی پیمانکار استخراج بر اساس باند مصوب، الگوی چال‌ها (قطر، بار سنگ، فاصله، عمق و زاویه) را طراحی و ارسال می‌کند.',
  },
  {
    step: 4,
    title: '۴. بررسی و صدور مجوز حفاری',
    subtitle: 'کنترل شبکه توسط نظارت و صدور پروانه رسمی حفاری',
    pillar: 'نظارت',
    icon: DocumentCheckIcon,
    color: 'from-cyan-500 to-sky-600',
    borderColor: 'border-cyan-500/40',
    textColor: 'text-cyan-400',
    details: 'واحد نظارت طرح چال‌زنی را ممیزی کرده و پس از احراز ایمنی و الگوی بهینه آتشباری، مجوز رسمی حفاری با کد پیگیری صادر می‌نماید.',
  },
  {
    step: 5,
    title: '۵. اجرای حفاری و پیشرفت روزانه',
    subtitle: 'ثبت متراژ واقعی شیفت‌ها، عملکرد دریل‌واگن‌ها و اتمام بلوک',
    pillar: 'پیمانکار استخراج',
    icon: PlayCircleIcon,
    color: 'from-emerald-500 to-green-600',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    details: 'پیمانکار حفاری را در پیت اجرا کرده و متراژ روزانه هر اپراتور و دستگاه را در سامانه ثبت می‌کند.',
  },
  {
    step: 6,
    title: '۶. درخواست نمونه‌گیری و ساب‌بندی',
    subtitle: 'تفکیک بلوک به ساب‌های SA, SB, SC, SD و درخواست نمونه‌گیری',
    pillar: 'پیمانکار / نظارت',
    icon: BeakerIcon,
    color: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-500/40',
    textColor: 'text-pink-400',
    details: 'پس از اتمام حفاری، بلوک به ساب‌بلوک‌های استاندارد (مانند 1040 B 32 – SA/SB/SC/SD) تفکیک شده و درخواست رسمی نمونه‌گیری ثبت می‌گردد.',
  },
  {
    step: 7,
    title: '۷. آنالیز آزمایشگاه (XRF)',
    subtitle: 'ثبت برخط عیار عناصر Fe, FeO, SiO2, Al2O3, P, S',
    pillar: 'واحد نظارت (آزمایشگاه)',
    icon: SparklesIcon,
    color: 'from-violet-500 to-purple-600',
    borderColor: 'border-violet-500/40',
    textColor: 'text-violet-400',
    details: 'نمونه‌های پودر حفاری به آزمایشگاه ارسال و عیار عناصر اصلی و مضر بلافاصله در شناسنامه دیجیتال ساب‌بلوک ثبت می‌شود.',
  },
  {
    step: 8,
    title: '۸. طبقه‌بندی سنگ‌شناسی و تیپ',
    subtitle: 'تفکیک کانسنگ پرعیار، متوسط، کم‌عیار و باطله بر اساس عیار حد',
    pillar: 'نظارت و ژئولوژی',
    icon: TagIcon,
    color: 'from-indigo-500 to-blue-600',
    borderColor: 'border-indigo-500/40',
    textColor: 'text-indigo-400',
    details: 'بر اساس نتایج آزمایشگاه و فاکتورهای کانی‌شناسی، نوع سنگ و رده کیفی (High/Medium/Low Grade/Waste) تعیین می‌شود.',
  },
  {
    step: 9,
    title: '۹. تعیین مقصد نهایی ساب‌بلوک',
    subtitle: 'تصویب مقصد دقیق (دپوی پرعیار، کم‌عیار، باطله یا خط سنگ‌شکن)',
    pillar: 'نظارت و کارفرما',
    icon: MapPinIcon,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    details: 'مقصد تخلیه هر ساب‌بلوک با هماهنگی نظارت و کارفرما مشخص شده و مجوز بارگیری به پیمانکار استخراج ابلاغ می‌گردد.',
  },
  {
    step: 10,
    title: '۱۰. برآورد تناژ با سرویس‌شمار ناوگان',
    subtitle: 'محاسبه تناژ با تعداد سرویس × میانگین ظرفیت تراک‌ها (۱۰۰ت، ۶۰ت، ۳۵ت، ۱۵ت)',
    pillar: 'پیمانکار استخراج (دیسپاچینگ)',
    icon: TruckIcon,
    color: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    details: 'پیمانکار در پیت با ثبت تعداد سرویس هر تیپ ماشین‌آلات (تراک ۱۰۰، ۶۰، ۳۵ یا کامیون ۱۵ تنی)، تناژ بارگیری هر ساب را به صورت دینامیک محاسبه می‌کند.',
  },
  {
    step: 11,
    title: '۱۱. مدیریت دینامیک موجودی دپوها',
    subtitle: 'محاسبه (موجودی اولیه + بارریزی ساب‌ها - فید به سنگ‌شکن) با عیار میانگین وزنی',
    pillar: 'پیمانکار خردایش و نظارت',
    icon: ArchiveBoxIcon,
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500/40',
    textColor: 'text-purple-400',
    details: 'اگر ۵ ساب مختلف در یک دپو تخلیه شوند، موجودی کل و میانگین وزنی عیار به صورت هوشمند و برخط بازمحاسبه و در داشبورد سنگ‌شکن نمایش داده می‌شود.',
  },
  {
    step: 12,
    title: '۱۲. ساب‌بلوک به عنوان اتم عملیاتی',
    subtitle: 'ردیابی کامل شناسنامه، وضعیت و رخدادها از پله تا دپو',
    pillar: 'تمام ارکان',
    icon: CubeTransparentIcon,
    color: 'from-teal-500 to-emerald-600',
    borderColor: 'border-teal-500/40',
    textColor: 'text-teal-400',
    details: 'کوچک‌ترین واحد عملیاتی در کل سامانه، ساب‌بلوک است که تاریخچه کامل آن به صورت یک زنجیره شفاف و غیرقابل تغییر ثبت می‌گردد.',
  },
  {
    step: 13,
    title: '۱۳. نقشه تعاملی و آنلاین معدن',
    subtitle: 'نمایش زنده پیت، پله‌ها، ساب‌ها، مسیرهای حمل و دپوها روی نقشه GIS',
    pillar: 'تمام ارکان',
    icon: GlobeAltIcon,
    color: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-500/40',
    textColor: 'text-blue-400',
    details: 'سامانه بر بستر نقشه آنلاین معدن قرار دارد؛ کاربران می‌توانند روی نقشه کلیک کرده و تمام اطلاعات بلوک‌ها، ساب‌ها و دپوها را مشاهده و پیگیری نمایند.',
  },
];

export function MiningWorkflowOverview13Steps({ onStepSelect, activeStep = 1 }: MiningWorkflowOverviewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(activeStep - 1);
  const currentStage = WORKFLOW_STAGES[currentStepIndex];

  const handleStepClick = (idx: number) => {
    setCurrentStepIndex(idx);
    if (onStepSelect) {
      onStepSelect(idx + 1);
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl space-y-4">
      {/* سربرگ جریان کاری */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/40">
              13
            </span>
            <h3 className="text-base font-bold text-white">جریان کاری جامع ۱۳ مرحله‌ای مدیریت دیجیتال معدن</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            یکپارچه‌سازی فرآیندها بین کارفرما، نظارت، پیمانکار استخراج و پیمانکار خردایش از طراحی باند تا دپو و نقشه GIS
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>مرحله فعال:</span>
          <span className="font-bold text-cyan-400">{currentStepIndex + 1} از {WORKFLOW_STAGES.length}</span>
        </div>
      </div>

      {/* اسکرول افقی مراحل ۱۳ گانه */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="flex items-center gap-2 min-w-max">
          {WORKFLOW_STAGES.map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = idx === currentStepIndex;

            return (
              <button
                key={st.step}
                onClick={() => handleStepClick(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all duration-200 border ${
                  isCurrent
                    ? `bg-slate-800/90 text-white ${st.borderColor} shadow-lg shadow-cyan-500/10 font-bold scale-105`
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isCurrent ? `bg-gradient-to-br ${st.color} text-white` : 'bg-slate-900 text-slate-400'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{st.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* کارت تشریح مرحله انتخاب شده */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentStage.color} text-white shadow-xl shadow-cyan-500/20`}>
              <currentStage.icon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">{currentStage.title}</h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border ${currentStage.borderColor} ${currentStage.textColor}`}>
                  رکن متولی: {currentStage.pillar}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">{currentStage.subtitle}</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-3xl">{currentStage.details}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              disabled={currentStepIndex === 0}
              onClick={() => handleStepClick(currentStepIndex - 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs flex items-center gap-1 transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
              <span>مرحله قبلی</span>
            </button>
            <button
              disabled={currentStepIndex === WORKFLOW_STAGES.length - 1}
              onClick={() => handleStepClick(currentStepIndex + 1)}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <span>مرحله بعدی</span>
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
