// src/modules/mine/presentation/components/StakeholderPerspectiveBar.tsx

import React from 'react';
import { 
  BuildingOffice2Icon, 
  ClipboardDocumentCheckIcon, 
  WrenchScrewdriverIcon, 
  Cog6ToothIcon, 
  Squares2X2Icon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import type { StakeholderRole } from '../../../../core/domain/types/mine.types';

interface StakeholderPerspectiveBarProps {
  activeRole: StakeholderRole;
  onRoleChange: (role: StakeholderRole) => void;
  pendingCounts?: {
    clientBands?: number;
    supervisionPermits?: number;
    miningDrilling?: number;
    crushingFeeds?: number;
  };
}

export const STAKEHOLDER_INFO: Record<StakeholderRole, {
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  icon: React.ElementType;
  duties: string[];
}> = {
  CLIENT: {
    title: '۱. واحد کارفرما',
    subtitle: 'مدیریت معدن، توسعه و بهره‌برداری، دفتر فنی، ایمنی و بازرگانی',
    badge: 'تصویب و حاکمیت کلان',
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/10 via-slate-900/80 to-slate-900',
    borderColor: 'border-amber-500/30',
    icon: BuildingOffice2Icon,
    duties: [
      'تأیید و ابلاغ باندهای استخراج ماهانه',
      'پایش شاخص‌های عملکردی کلان و ایمنی معدن',
      'تأیید مقاصد استراتژیک و برنامه فروش کانسنگ',
      'نظارت مالی، صورت‌وضعیت‌ها و بازرگانی',
    ],
  },
  SUPERVISION: {
    title: '۲. واحد نظارت',
    subtitle: 'سرپرستی، طراحی و برنامه‌ریزی، نقشه‌برداری، ژئولوژی و آزمایشگاه',
    badge: 'طراحی، کنترل و تأیید',
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-500/10 via-slate-900/80 to-slate-900',
    borderColor: 'border-cyan-500/30',
    icon: ClipboardDocumentCheckIcon,
    duties: [
      'تعریف و بارگذاری باندهای طراحی ماهانه (حجم و تناژ)',
      'بررسی شبکه چال‌زنی پیمانکار و صدور مجوز حفاری',
      'نظارت بر نمونه‌گیری و تأیید نتایج آنالیز XRF آزمایشگاه',
      'طبقه‌بندی زمین‌شناسی و تصویب مقصد نهایی هر ساب‌بلوک',
    ],
  },
  MINING_CONTRACTOR: {
    title: '۳. پیمانکار استخراج',
    subtitle: 'سرپرستی کارگاه، طراحی شبکه چال‌ها، حفاری، آتشباری و بارگیری/حمل',
    badge: 'عملیات پیت و دیسپاچینگ',
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/10 via-slate-900/80 to-slate-900',
    borderColor: 'border-emerald-500/30',
    icon: WrenchScrewdriverIcon,
    duties: [
      'طراحی شبکه چال‌ها بر اساس باند ماهانه و اخذ مجوز',
      'اجرای حفاری و ثبت پیشرفت روزانه شیفت‌ها و متراژ',
      'ثبت درخواست نمونه‌گیری و ساب‌بندی (SA, SB, SC, SD)',
      'بارگیری و ثبت سرویس‌های حمل ناوگان (تراک‌های ۱۰۰ت، ۶۰ت، ۳۵ت و کامیون ۱۵ت)',
    ],
  },
  CRUSHING_CONTRACTOR: {
    title: '۴. پیمانکار خردایش',
    subtitle: 'مدیریت خطوط خردایش، فیددهی، دانه‌بندی (Lump/Fines) و موجودی دپوها',
    badge: 'فرآوری و دپوسازی',
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/10 via-slate-900/80 to-slate-900',
    borderColor: 'border-purple-500/30',
    icon: Cog6ToothIcon,
    duties: [
      'فیددهی پیوسته به سنگ‌شکن‌های فکی و مخروطی',
      'ثبت تولید دانه‌بندی کلوخه (Lump) و نرمه (Fines)',
      'پایش دینامیک موجودی دپوهای پرعیار، متوسط و باطله',
      'بالانس متالورژیکی و راندمان بازیافت خطوط خردایش',
    ],
  },
  ALL: {
    title: 'چهار رکن یکپارچه',
    subtitle: 'نمای جامع مدیریتی با هماهنگی کامل بین کارفرما، نظارت و پیمانکاران',
    badge: 'مدیریت کلان زنجیره ارزش',
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/10 via-slate-900/80 to-slate-900',
    borderColor: 'border-blue-500/30',
    icon: Squares2X2Icon,
    duties: [
      'پایش چرخه ۱۳ مرحله‌ای از طراحی باند تا دپوی نهایی',
      'شفافیت داده‌های برخط و ممیزی تمام رویدادها',
      'اتصال ساب‌بلوک به عنوان اتم عملیاتی روی نقشه GIS',
    ],
  },
};

export function StakeholderPerspectiveBar({
  activeRole,
  onRoleChange,
  pendingCounts = {},
}: StakeholderPerspectiveBarProps) {
  const currentInfo = STAKEHOLDER_INFO[activeRole];

  return (
    <div className="mb-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 shadow-xl">
      {/* ردیف دکمه‌های سوئیچ نقش */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300">ارکان اصلی پروژه و تفکیک مسئولیت‌ها:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
          {(['ALL', 'CLIENT', 'SUPERVISION', 'MINING_CONTRACTOR', 'CRUSHING_CONTRACTOR'] as StakeholderRole[]).map((role) => {
            const info = STAKEHOLDER_INFO[role];
            const Icon = info.icon;
            const isActive = activeRole === role;

            return (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? info.color : 'text-slate-400'}`} />
                <span>{role === 'ALL' ? 'نمای جامع (همه ارکان)' : info.title.split('.')[1] || info.title}</span>

                {role === 'CLIENT' && (pendingCounts.clientBands || 0) > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500/20 px-1 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                    {pendingCounts.clientBands}
                  </span>
                )}
                {role === 'SUPERVISION' && (pendingCounts.supervisionPermits || 0) > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500/20 px-1 text-[10px] font-bold text-cyan-300 border border-cyan-500/40">
                    {pendingCounts.supervisionPermits}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* بنر وضعیت نقش فعال */}
      <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl bg-slate-800/80 border ${currentInfo.borderColor}`}>
            <currentInfo.icon className={`w-5 h-5 ${currentInfo.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">{currentInfo.title}</h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 border ${currentInfo.borderColor} ${currentInfo.color}`}>
                {currentInfo.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentInfo.subtitle}</p>
          </div>
        </div>

        {/* وظایف کلیدی */}
        <div className="flex flex-wrap items-center gap-2">
          {currentInfo.duties.slice(0, 2).map((duty, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
              <CheckCircleIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{duty}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
