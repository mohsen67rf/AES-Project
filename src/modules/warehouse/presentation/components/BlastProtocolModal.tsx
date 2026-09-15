// src/modules/warehouse/presentation/components/BlastProtocolModal.tsx

import React from 'react';
import { WarehouseTransaction } from '../../domain/types/warehouse.types';
import { 
  DocumentTextIcon, 
  PrinterIcon 
} from '@heroicons/react/24/outline';
import { BlockCodeDisplay } from '../../../../shared/components/BlockCodeDisplay';

interface BlastProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: WarehouseTransaction | null;
  customData?: {
    permitNumber: string;
    blockCode: string;
    dateStr: string;
    anfoKg: number;
    emulsionKg: number;
    boostersCount: number;
    detonatorsCount: number;
    surfaceCount: number;
    cordMeters: number;
    drillingMeters: number;
    holeCount: number;
    powderFactor: number;
    tonnage: number;
    contractor: string;
    supervision: string;
    client: string;
  } | null;
  isDark: boolean;
}

export const BlastProtocolModal: React.FC<BlastProtocolModalProps> = ({
  isOpen,
  onClose,
  transaction,
  customData,
  isDark
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const blockCode = customData?.blockCode || transaction?.targetBlockCode || '1040 B 32';
  const permit = customData?.permitNumber || transaction?.permitNumber || 'BLAST-PERMIT-1405/03/32';
  const dateStr = customData?.dateStr || (transaction?.timestamp ? new Date(transaction.timestamp).toLocaleDateString('fa-IR') : '۱۴۰۵/۰۳/۱۰');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl transition-all my-8 ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* هدر مودال */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold">صورتجلسه رسمی تحویل و مصرف مواد ناریه (فرم استاندارد شماره ۱۲)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>چاپ صورتجلسه</span>
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-xs font-bold cursor-pointer px-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* برگه صورتجلسه رسمی چاپی */}
        <div className="mt-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-4 font-sans print:bg-white print:text-black">
          {/* سربرگ شرکت و معدن */}
          <div className="text-center border-b pb-3 border-slate-300 dark:border-slate-700">
            <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              سامانه جامع مدیریت و نظارت معادن (AES Mining Management System)
            </h2>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              صورتجلسه رسمی تحویل، خرج‌گذاری و آتشباری مواد منفجره بلوک‌های معدنی
            </h3>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 px-2">
              <span>شماره صورتجلسه: <b className="font-mono text-slate-800 dark:text-slate-200">{permit}</b></span>
              <span>تاریخ اجرا: <b className="text-slate-800 dark:text-slate-200">{dateStr}</b></span>
              <span>معدن: <b className="text-slate-800 dark:text-slate-200">سنگ آهن مرکزی (چادرملو - بافق)</b></span>
            </div>
          </div>

          {/* مشخصات بلوک و جبهه‌کار */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">کد بلوک:</span>
              <BlockCodeDisplay code={blockCode} className="font-bold text-slate-800 dark:text-slate-100 text-xs" />
            </div>
            <div className="bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">تراز پله:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{customData?.blockCode ? 'پله ۱۰۴۰' : 'پله ۱۰۴۰'}</span>
            </div>
            <div className="bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">تعداد چال‌ها:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{customData?.holeCount || 48} چال</span>
            </div>
            <div className="bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">تناژ برآورد سنگ:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{(customData?.tonnage || 19200).toLocaleString()} تن</span>
            </div>
          </div>

          {/* جدول مقادیر تحویل شده از انبار */}
          <div>
            <span className="font-bold block mb-1 text-slate-800 dark:text-slate-200 text-xs">
              جدول مواد ناریه و وسایل آتشباری تحویل شده از زاغه:
            </span>
            <table className="w-full text-right text-[11px] border border-slate-200 dark:border-slate-700">
              <thead className="bg-slate-200/70 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200">
                <tr>
                  <th className="p-2">ردیف</th>
                  <th className="p-2">شرح ماده یا وسیله انفجاری</th>
                  <th className="p-2">واحد</th>
                  <th className="p-2">مقدار مصرفی</th>
                  <th className="p-2">وضعیت کسر از انبار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                <tr>
                  <td className="p-2">۱</td>
                  <td className="p-2 font-semibold">آنفو استاندارد صنعتی (ANFO)</td>
                  <td className="p-2">کیلوگرم</td>
                  <td className="p-2 font-bold font-mono">{(customData?.anfoKg || 4200).toLocaleString()}</td>
                  <td className="p-2 text-emerald-500 font-bold">کسر شد (تأیید زاغه‌دار)</td>
                </tr>
                <tr>
                  <td className="p-2">۲</td>
                  <td className="p-2 font-semibold">بوستر پنتولیت ۵۰۰ گرمی (Booster 500g)</td>
                  <td className="p-2">عدد</td>
                  <td className="p-2 font-bold font-mono">{customData?.boostersCount || 48}</td>
                  <td className="p-2 text-emerald-500 font-bold">کسر شد</td>
                </tr>
                <tr>
                  <td className="p-2">۳</td>
                  <td className="p-2 font-semibold">چاشنی نانل درون‌چالی ۵۰۰ میلی‌ثانیه</td>
                  <td className="p-2">شاخه</td>
                  <td className="p-2 font-bold font-mono">{customData?.detonatorsCount || 48}</td>
                  <td className="p-2 text-emerald-500 font-bold">کسr شد</td>
                </tr>
                <tr>
                  <td className="p-2">۴</td>
                  <td className="p-2 font-semibold">رابط‌های سطحی نانل ۱۷/۲۵ms</td>
                  <td className="p-2">شاخه</td>
                  <td className="p-2 font-bold font-mono">{customData?.surfaceCount || 12}</td>
                  <td className="p-2 text-emerald-500 font-bold">کسر شد</td>
                </tr>
                <tr>
                  <td className="p-2">۵</td>
                  <td className="p-2 font-semibold">فیتیله انفجاری / کورتکس ۱۰ گرم</td>
                  <td className="p-2">متر</td>
                  <td className="p-2 font-bold font-mono">{customData?.cordMeters || 180}</td>
                  <td className="p-2 text-emerald-500 font-bold">کسر شد</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* تعهدات و امضای ارکان چهارگانه پروژه */}
          <div className="pt-2 border-t border-slate-300 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 block mb-3">
              بدینوسیله تأیید می‌گردد مواد فوق‌الذکر جهت چال‌های بلوک مذکور تحویل و تحت نظارت کامل فنی و حراستی با رعایت دقیق ضوابط ایمنی آتشباری گردید.
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
              {/* ۱. پیمانکار استخراج */}
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block">پیمانکار استخراج و آتشباری</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 block mt-1">مهندس رضایی</span>
                <span className="text-emerald-500 font-bold block mt-1 text-[9px]">✔ امضا و تأیید فنی</span>
              </div>

              {/* ۲. دستگاه نظارت */}
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block">سرپرست دستگاه نظارت</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 block mt-1">دکتر علوی</span>
                <span className="text-emerald-500 font-bold block mt-1 text-[9px]">✔ تأیید الگوی انفجار</span>
              </div>

              {/* ۳. حراست و زاغه */}
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block">مسئول زاغه و حراست ناریه</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 block mt-1">سرگرد احمدی</span>
                <span className="text-emerald-500 font-bold block mt-1 text-[9px]">✔ تأیید حواله خروج</span>
              </div>

              {/* ۴. مدیریت کارفرما */}
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block">مدیریت بهره‌برداری کارفرما</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 block mt-1">مهندس حسینی</span>
                <span className="text-emerald-500 font-bold block mt-1 text-[9px]">✔ تصویب نهایی</span>
              </div>
            </div>
          </div>
        </div>

        {/* دکمه بستن */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
