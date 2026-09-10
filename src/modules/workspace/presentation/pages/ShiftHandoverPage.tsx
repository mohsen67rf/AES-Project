// src/modules/workspace/presentation/pages/ShiftHandoverPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { AppHeader } from '../../../../shared/components/Header/AppHeader';
import { Sidebar } from '../../../../shared/components/Sidebar/Sidebar';
import { ShiftHandoverModal } from '../components/ShiftHandover/ShiftHandoverModal';
import { ShiftHandoverService } from '../../services/ShiftHandoverService';
import { ShiftHandoverRecord } from '../../../../core/domain/types/shift-handover.types';
import type { User } from '../../../../core/domain/types/mine.types';
import { 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Truck, 
  ShieldAlert, 
  Sparkles, 
  ArrowRightLeft
} from 'lucide-react';

export const ShiftHandoverPage: React.FC = () => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('aes_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [handovers, setHandovers] = useState<ShiftHandoverRecord[]>(() => ShiftHandoverService.getAll());
  const [selectedHandover, setSelectedHandover] = useState<ShiftHandoverRecord | null>(() => ShiftHandoverService.getCurrentActiveHandover());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('aes_session');
        if (saved) setCurrentUser(JSON.parse(saved));
      } catch {}
    };

    const loadData = () => {
      const list = ShiftHandoverService.getAll();
      setHandovers(list);
      const active = ShiftHandoverService.getCurrentActiveHandover();
      setSelectedHandover(active);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('shiftHandoverUpdated', loadData);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('shiftHandoverUpdated', loadData);
    };
  }, []);

  const current = selectedHandover || handovers[0];

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#0A0F1D] text-[#F1F5F9]' : 'bg-slate-100 text-slate-900'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Breadcrumb & Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span className="hover:text-white cursor-pointer" onClick={() => navigate('/workspace')}>میز کار واحدها</span>
                <span>/</span>
                <span className="text-[#00D2FF] font-bold">پروتکل هوشمند تحویل و تحول شیفت</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#00D2FF] to-indigo-600 p-0.5 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
                  <RotateCcw className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                </div>
                <span>مرکز تحویل و تحول هوشمند شیفت کاری معدن (Shift Handover)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                اتصال مستقیم انسان‌ها در زمان طلایی، ثبت یکباره داده‌ها و حذف گزارش‌نویسی‌های فرسایشی کاغذی
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#38BDF8] text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>گشایش کارتابل ثبت و امضای شیفت</span>
              </button>
            </div>
          </div>

          {current && (
            <>
              {/* Primary Active Shift Summary Card */}
              <div className={`p-6 rounded-3xl border transition-all ${
                isDark ? 'bg-[#101935] border-[#24356B]/50' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#24356B]/30">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#00D2FF]/15 text-[#00D2FF] font-bold border border-[#00D2FF]/30">
                        سند شماره: {current.handoverCode}
                      </span>
                      <h2 className="text-lg font-black text-white">{current.shiftTitleFa}</h2>
                    </div>
                    <p className="text-xs text-slate-400">
                      تاریخ شیفت: <strong className="text-slate-200 font-mono">{current.shiftDateJalali}</strong> | مجتمع: {current.mineNameFa}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {current.status === 'HANDED_OVER' ? (
                      <div className="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تحویل و تحول قطعی (امضای دوطرفه ثبت شد)</span>
                      </div>
                    ) : current.status === 'READY_FOR_HANDOVER' ? (
                      <div className="px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center gap-2 animate-pulse">
                        <Clock className="w-4 h-4" />
                        <span>آماده تحویل (منتظر تایید و امضای سرپرست ورودی)</span>
                      </div>
                    ) : (
                      <div className="px-4 py-2 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-black flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>شیفت جاری در حال اجرا</span>
                      </div>
                    )}

                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs text-slate-200 font-bold transition-colors cursor-pointer"
                    >
                      ویرایش / تایید
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
                  <div className="p-4 rounded-2xl bg-[#0B1226] border border-[#24356B]/30">
                    <span className="text-xs text-slate-400 block mb-1">استخراج سنگ‌آهن (Fe)</span>
                    <span className="text-2xl font-black text-white font-mono">{current.totalExtractionTons.toLocaleString('fa-IR')}</span>
                    <span className="text-[11px] text-emerald-400 block mt-1">تن خوراک پرعیار و کم‌عیار</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0B1226] border border-[#24356B]/30">
                    <span className="text-xs text-slate-400 block mb-1">باطله‌برداری پیت</span>
                    <span className="text-2xl font-black text-amber-400 font-mono">{current.totalWasteTons.toLocaleString('fa-IR')}</span>
                    <span className="text-[11px] text-slate-400 block mt-1">تن بارگیری به دپوهای باطله</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0B1226] border border-[#24356B]/30">
                    <span className="text-xs text-slate-400 block mb-1">تعداد سرویس دامپتراک‌ها</span>
                    <span className="text-2xl font-black text-cyan-400 font-mono">{current.totalHaulTrips.toLocaleString('fa-IR')}</span>
                    <span className="text-[11px] text-slate-400 block mt-1">سرویس چرخه باربری</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0B1226] border border-[#24356B]/30">
                    <span className="text-xs text-slate-400 block mb-1">عیار میانگین شیفت</span>
                    <span className="text-2xl font-black text-purple-400 font-mono">{current.averageFeGradePercent}٪</span>
                    <span className="text-[11px] text-emerald-400 block mt-1">Fe Total (انطباق با برنامه)</span>
                  </div>
                </div>
              </div>

              {/* Golden Directive Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-indigo-500/15 border border-amber-500/30 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-amber-400">دستور ویژه و پیام طلایی شیفت (Golden Directive)</h3>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {current.goldenShiftDirective}
                  </p>
                </div>
              </div>

              {/* Interactive Sections Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Active Benches */}
                <div className="p-5 rounded-2xl bg-[#101935] border border-[#24356B]/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#00D2FF]" />
                      <span>سینه‌کارها و پله‌های فعال ({current.activeBenches.length})</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {current.activeBenches.map(b => (
                      <div key={b.id} className="p-3.5 rounded-xl bg-[#0B1226] border border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <strong className="text-white font-mono">پله {b.benchLevel} ({b.blockCode})</strong>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">{b.materialTypeFa}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{b.assignedExcavator} - {b.haulTruckCount} تراک</p>
                        <p className="text-[11px] text-slate-400">مقصد: {b.destination}</p>
                        <p className="text-[10px] text-[#8E9EB8] pt-1 border-t border-slate-800">{b.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Critical Equipment */}
                <div className="p-5 rounded-2xl bg-[#101935] border border-[#24356B]/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-cyan-400" />
                      <span>ماشین‌آلات و پایش توقفات</span>
                    </h3>
                  </div>

                  <div className="space-y-2.5 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                    {current.equipmentStatuses.map(eq => (
                      <div key={eq.id} className="p-3 rounded-xl bg-[#0B1226] border border-slate-800 text-xs flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#00D2FF]">{eq.code}</span>
                            <span className="font-bold text-white truncate">{eq.nameFa}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">پله: {eq.locationBench} | سوخت: {eq.fuelLevelPercent}٪</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          eq.status === 'OPERATIONAL' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {eq.statusFa}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Safety & Tasks */}
                <div className="p-5 rounded-2xl bg-[#101935] border border-[#24356B]/40 space-y-4">
                  <h3 className="text-xs font-black text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    <span>ایمنی (HSE) و تعهدات بین‌واحدی</span>
                  </h3>

                  <div className="p-3.5 rounded-xl bg-[#0B1226] border border-slate-800 space-y-2 text-xs">
                    <p className="text-[11px] text-slate-300"><strong className="text-slate-400">وضعیت راه‌ها: </strong>{current.safetyLog.roadCondition}</p>
                    <p className="text-[11px] text-slate-300"><strong className="text-slate-400">پایداری دیواره: </strong>{current.safetyLog.wallStabilityStatus}</p>

                    {current.safetyLog.nextShiftBlastNotice && (
                      <div className="p-2 rounded bg-rose-950/30 border border-rose-500/30 text-[11px] text-rose-300">
                        <strong>اعلان انفجار: </strong>پله {current.safetyLog.nextShiftBlastNotice.benchLevel} در {current.safetyLog.nextShiftBlastNotice.scheduledTime}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-amber-400 block">تسک‌های منتقل‌شده به شیفت بعد:</span>
                    {current.pendingTasks.map(t => (
                      <div key={t.id} className="p-2.5 rounded-lg bg-[#0B1226] border border-slate-800 text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[#00D2FF]">{t.taskCode}</span>
                          <span className="text-[10px] text-rose-400 font-bold">{t.priority}</span>
                        </div>
                        <p className="font-bold text-slate-200">{t.title}</p>
                        <p className="text-[10px] text-slate-400">مهلت: {t.deadlineTime} | {t.targetDepartment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dual Digital Sign-off Strip */}
              <div className="p-5 rounded-2xl bg-[#101935] border border-[#24356B]/40 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2 p-4 rounded-xl bg-[#0B1226] border border-slate-800">
                  <span className="text-xs font-black text-cyan-400 block">۱. سرپرست تحویل‌دهنده (شیفت خروجی)</span>
                  <p className="font-bold text-white">{current.outgoingSupervisor.fullName} ({current.outgoingSupervisor.userCode})</p>
                  <p className="text-[11px] text-slate-400">{current.outgoingSupervisor.departmentFa}</p>
                  <p className="text-[10px] text-slate-400 font-mono">ثبت در: {new Date(current.outgoingSupervisor.signedAt).toLocaleString('fa-IR')}</p>
                  <p className="text-[10px] text-[#00D2FF] font-mono truncate">کد امضا: {current.outgoingSupervisor.digitalFingerprint}</p>
                </div>

                <div className="space-y-2 p-4 rounded-xl bg-[#0B1226] border border-slate-800">
                  <span className="text-xs font-black text-purple-400 block">۲. سرپرست تحویل‌گیرنده (شیفت ورودی)</span>
                  {current.incomingSupervisor ? (
                    <>
                      <p className="font-bold text-white">{current.incomingSupervisor.fullName} ({current.incomingSupervisor.userCode})</p>
                      <p className="text-[11px] text-slate-400">{current.incomingSupervisor.departmentFa}</p>
                      <p className="text-[10px] text-slate-400 font-mono">تایید در: {new Date(current.incomingSupervisor.signedAt).toLocaleString('fa-IR')}</p>
                      <p className="text-[10px] text-emerald-400 font-mono truncate">مهر تایید: {current.incomingSupervisor.digitalFingerprint}</p>
                    </>
                  ) : (
                    <div className="py-2">
                      <p className="text-[11px] text-amber-300 mb-2">در انتظار تایید و امضای رسمی سرپرست ورودی</p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        تایید و امضای رسمی تحویل شیفت
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <ShiftHandoverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};
