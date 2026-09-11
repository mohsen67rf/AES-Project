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
  Truck, 
  Sparkles, 
  Users, 
  FileCheck2, 
  Flame, 
  Calendar, 
  MapPin, 
  Activity, 
  ChevronLeft,
  Eye,
  MessageSquare,
  Building2,
  Wrench,
  PenTool,
  Printer
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
  const [selectedHandoverId, setSelectedHandoverId] = useState<string>(() => {
    const active = ShiftHandoverService.getCurrentActiveHandover();
    return active ? active.id : (handovers[0]?.id || '');
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'MEETING_DRAFT' | 'REVIEW_REALIZATION' | 'SIGN_TRIPARTITE' | 'PRINT'>('MEETING_DRAFT');
  const [activeSectionTab, setActiveSectionTab] = useState<'DRILLING' | 'LOADING' | 'FLEET_MAP' | 'BLASTING' | 'SCHEDULE' | 'MANDATES'>('DRILLING');

  // بازخورد و یادداشت مدیران ارشد
  const [managerFeedbackInput, setManagerFeedbackInput] = useState('');
  const [isAddingFeedback, setIsAddingFeedback] = useState(false);
  const [feedbackSuccessToast, setFeedbackSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('aes_session');
        if (saved) setCurrentUser(JSON.parse(saved));
      } catch (err) {
        console.warn('Session parse error in ShiftHandoverPage:', err);
      }
    };

    const loadData = () => {
      const list = ShiftHandoverService.getAll();
      setHandovers(list);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('shiftHandoverUpdated', loadData);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('shiftHandoverUpdated', loadData);
    };
  }, []);

  const current = handovers.find(h => h.id === selectedHandoverId) || handovers[0];

  const handleOpenModal = (tab: 'MEETING_DRAFT' | 'REVIEW_REALIZATION' | 'SIGN_TRIPARTITE' | 'PRINT') => {
    setModalInitialTab(tab);
    setIsModalOpen(true);
  };

  const handleManagerSubmitFeedback = () => {
    if (!current || !managerFeedbackInput.trim()) return;
    const authorName = currentUser?.fullName ? `${currentUser.fullName} (${currentUser.role})` : 'مهندس کمالی (مدیریت ارشد)';
    const roleTitle = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' ? 'مدیریت ارشد مجتمع معدنی' : 'سرپرست ناظر';
    
    ShiftHandoverService.notifyManager(current.id, authorName, roleTitle, managerFeedbackInput.trim());
    setManagerFeedbackInput('');
    setIsAddingFeedback(false);
    setFeedbackSuccessToast('دستور و رهنمود مدیریتی با موفقیت در سند شیفت ثبت و ابلاغ گردید.');
    setTimeout(() => setFeedbackSuccessToast(null), 3500);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#080D1A] text-[#F1F5F9]' : 'bg-slate-100 text-slate-900'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb & Navigation Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                <span className="hover:text-white cursor-pointer" onClick={() => navigate('/workspace')}>میز کار واحدها</span>
                <span>/</span>
                <span className="text-[#00D2FF] font-bold">پروتکل سه‌گانه تحویل و تحول شیفت</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00D2FF] via-indigo-600 to-purple-600 p-0.5 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
                  <RotateCcw className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                </div>
                <span>پروتکل هوشمند تحویل و تحول شیفت با ارکان سه‌گانه پروژه</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
                هماهنگی رسمی بین <strong>کارفرما</strong>، <strong>دستگاه نظارت (مشاور)</strong> و <strong>پیمانکار</strong> در جلسه حضوری معدن، اولویت‌بندی حفاری و بارگیری، ثبت ناوگان و پیکور روی نقشه، و رصد تحقق اهداف در پایان شیفت.
              </p>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center flex-wrap gap-2.5">
              <button
                onClick={() => handleOpenModal('MEETING_DRAFT')}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#38BDF8] text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Users className="w-4 h-4 stroke-[2.5]" />
                <span>جلسه هماهنگی اول شیفت</span>
              </button>

              <button
                onClick={() => handleOpenModal('REVIEW_REALIZATION')}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>رصد و ارزیابی پایان شیفت</span>
              </button>

              <button
                onClick={() => handleOpenModal('SIGN_TRIPARTITE')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>امضای سه‌گانه شیفت</span>
              </button>

              <button
                onClick={() => handleOpenModal('PRINT')}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
                title="چاپ رسمی و خروجی صورت‌جلسه"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {feedbackSuccessToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackSuccessToast}</span>
            </div>
          )}

          {/* Shift Selector Selector Tabs */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold ml-2">شیفت‌های اخیر:</span>
              {handovers.map(h => {
                const isSelected = h.id === selectedHandoverId;
                const isHandedOver = h.status === 'HANDED_OVER';
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHandoverId(h.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                      isSelected 
                        ? 'bg-[#162244] text-[#00D2FF] border border-[#00D2FF]/40 shadow-sm' 
                        : 'bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{h.shiftTitleFa}</span>
                    <span className="text-[10px] font-mono text-slate-400">({h.shiftDateJalali})</span>
                    {isHandedOver ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="تحویل قطعی" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="در حال اقدام" />
                    )}
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              سند شماره: <strong className="text-cyan-400">{current.handoverCode}</strong>
            </span>
          </div>

          {current && (
            <>
              {/* Top Banner: Tripartite Pre-Shift Coordination Meeting Box */}
              <div className={`p-6 rounded-3xl border transition-all ${
                isDark ? 'bg-[#0E1731] border-[#22356B]/60 shadow-xl shadow-cyan-950/20' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs font-black border border-indigo-500/30">
                        {current.handoverCode}
                      </span>
                      <h2 className="text-lg font-black text-white flex items-center gap-2">
                        <span>جلسه هماهنگی حضوری اول شیفت: {current.shiftTitleFa}</span>
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> تاریخ: <strong className="text-slate-200">{current.shiftDateJalali}</strong></span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> زمان جلسه: <strong className="text-slate-200">{current.meetingTime}</strong></span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> مکان: <strong className="text-slate-200">{current.meetingLocation}</strong></span>
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-3">
                    {current.status === 'HANDED_OVER' ? (
                      <div className="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>امضای سه‌گانه تکمیل و تحویل قطعی شد</span>
                      </div>
                    ) : current.status === 'READY_FOR_HANDOVER' ? (
                      <div className="px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center gap-2 animate-pulse">
                        <Clock className="w-4 h-4" />
                        <span>پایان شیفت - منتظر نهایی‌سازی امضاهای سه‌گانه</span>
                      </div>
                    ) : (
                      <div className="px-4 py-2 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-black flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>شیفت در حال اجرای مصوبات جلسه هماهنگی</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tripartite Pillars 3-Column Card Strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
                  {/* Pillar 1: Client */}
                  {(() => {
                    const client = current.tripartiteReps?.find(r => r.role === 'CLIENT');
                    const isSigned = current.tripartiteSignatures?.clientSignature?.signed;
                    return (
                      <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 relative overflow-hidden space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-amber-400 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>رکن اول: کارفرما</span>
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isSigned ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300'
                          }`}>
                            {isSigned ? 'امضا ثبت شد' : 'حاضر در جلسه'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{client?.personName || 'مهندس محمودی'}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{client?.organizationName || 'شرکت کارفرما'}</p>
                        </div>
                        {client?.notes && (
                          <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 leading-relaxed">
                            <strong className="text-amber-400/90">تاکید جلسه: </strong>{client.notes}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Pillar 2: Supervision */}
                  {(() => {
                    const sup = current.tripartiteReps?.find(r => r.role === 'SUPERVISION');
                    const isSigned = current.tripartiteSignatures?.supervisionSignature?.signed;
                    return (
                      <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 relative overflow-hidden space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-cyan-400 flex items-center gap-1.5">
                            <PenTool className="w-3.5 h-3.5 text-cyan-400" />
                            <span>رکن دوم: دستگاه نظارت</span>
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isSigned ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/15 text-cyan-300'
                          }`}>
                            {isSigned ? 'امضا ثبت شد' : 'ناظر مقیم حاضر'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{sup?.personName || 'مهندس حسینی'}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{sup?.organizationName || 'مهندسین مشاور فراکاوش'}</p>
                        </div>
                        {sup?.notes && (
                          <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 leading-relaxed">
                            <strong className="text-cyan-400/90">دستور فنی: </strong>{sup.notes}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Pillar 3: Contractor */}
                  {(() => {
                    const ctr = current.tripartiteReps?.find(r => r.role === 'CONTRACTOR');
                    const isSigned = current.tripartiteSignatures?.contractorSignature?.signed;
                    return (
                      <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 relative overflow-hidden space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-indigo-400 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                            <span>رکن سوم: پیمانکار استخراج</span>
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isSigned ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/15 text-indigo-300'
                          }`}>
                            {isSigned ? 'امضا ثبت شد' : 'مدیر کارگاه حاضر'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{ctr?.personName || 'مهندس اکبری'}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{ctr?.organizationName || 'شرکت پیمانکاری کوهساران'}</p>
                        </div>
                        {ctr?.notes && (
                          <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 leading-relaxed">
                            <strong className="text-indigo-400/90">تعهد اجرایی: </strong>{ctr.notes}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Golden Directive Banner */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-cyan-500/15 border border-amber-500/30 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-amber-400">دستورکار طلایی مصوب جلسه هماهنگی حضوری:</h3>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      {current.goldenShiftDirective}
                    </p>
                  </div>
                </div>
              </div>

              {/* End-of-Shift Realization Scorecard Strip */}
              <div className="p-5 rounded-3xl bg-[#0E1731] border border-[#22356B]/60 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-black text-white">رصد میزان برآورده شدن اهداف در پایان شیفت (Post-Shift Realization)</h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-xl border border-emerald-500/30 font-black">
                    تحقق کلی اهداف: {current.overallFulfillmentPercent || 96.8}٪
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-[#091124] border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">تحقق متراژ حفاری</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-white font-mono">{current.drillingFulfillmentPercent || 94.3}٪</span>
                      <span className="text-[10px] text-cyan-400 font-mono">۴۹۲ / ۵۰۴ متر</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${current.drillingFulfillmentPercent || 94.3}%` }} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#091124] border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">تحقق تناژ بارگیری کانسنگ</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-white font-mono">{current.loadingFulfillmentPercent || 97.2}٪</span>
                      <span className="text-[10px] text-emerald-400 font-mono">۸,۳۵۰ / ۸,۵۰۰ تن</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${current.loadingFulfillmentPercent || 97.2}%` }} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#091124] border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">آمادگی آتشباری آتی</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-white font-mono">{current.blastingFulfillmentPercent || 100}٪</span>
                      <span className="text-[10px] text-purple-400 font-mono">تایید ۳ رکن</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-400 h-full rounded-full" style={{ width: `${current.blastingFulfillmentPercent || 100}%` }} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#091124] border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400">انطباق با الزامات HSE و عیار</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-white font-mono">{current.mandatesCompliancePercent || 100}٪</span>
                      <span className="text-[10px] text-amber-400 font-mono">عیار: {current.averageFeGradePercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${current.mandatesCompliancePercent || 100}%` }} />
                    </div>
                  </div>
                </div>

                {current.endShiftReviewSummary && (
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-emerald-400 ml-1">جمع‌بندی رصد مشترک ارکان در پایان شیفت: </strong>
                    {current.endShiftReviewSummary}
                  </div>
                )}
              </div>

              {/* 6 Core Functional Directives Tab Strip */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setActiveSectionTab('DRILLING')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                      activeSectionTab === 'DRILLING' 
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25' 
                        : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>۱. اولویت‌بندی حفاری بلوک‌ها</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/30 text-white font-mono">
                      {current.drillingPriorities?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSectionTab('LOADING')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                      activeSectionTab === 'LOADING' 
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/25' 
                        : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>۲. اولویت‌بندی بارگیری و استخراج</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/30 text-white font-mono">
                      {current.loadingPriorities?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSectionTab('FLEET_MAP')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                      activeSectionTab === 'FLEET_MAP' 
                        ? 'bg-indigo-500 text-white font-black shadow-lg shadow-indigo-500/25' 
                        : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>۳. ثبت ناوگان و پیکور روی نقشه</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/30 text-white font-mono">
                      {current.activePlacements?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSectionTab('BLASTING')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                      activeSectionTab === 'BLASTING' 
                        ? 'bg-purple-500 text-white font-black shadow-lg shadow-purple-500/25' 
                        : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>۴. توافق بلوک‌های انفجار آتی</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/30 text-white font-mono">
                      {current.upcomingBlasts?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSectionTab('SCHEDULE')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                      activeSectionTab === 'SCHEDULE' 
                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25' 
                        : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>۵. برنامه ادامه روز/شیفت</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/30 text-white font-mono">
                      {current.intraShiftSchedule?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSectionTab('MANDATES')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                      activeSectionTab === 'MANDATES' 
                        ? 'bg-rose-500 text-white font-black shadow-lg shadow-rose-500/25' 
                        : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>۶. الزامات اجرایی و ایمنی</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/30 text-white font-mono">
                      {current.operationalMandates?.length || 0}
                    </span>
                  </button>
                </div>

                {/* Tab Content 1: Drilling Priorities */}
                {activeSectionTab === 'DRILLING' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {current.drillingPriorities?.map(dp => (
                      <div key={dp.id} className="p-5 rounded-3xl bg-[#0E1731] border border-[#22356B]/60 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-black flex items-center justify-center border border-cyan-500/30">
                              #{dp.priorityOrder}
                            </span>
                            <strong className="text-white text-sm font-black font-mono">بلوک {dp.blockCode}</strong>
                            <span className="text-[11px] text-slate-400 font-mono">(پله {dp.benchLevel})</span>
                          </div>
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30">
                            اولویت {dp.priorityOrder} حفاری
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">نوع سازند:</span>
                            <span className="text-slate-200 font-bold text-[11px] truncate block">{dp.rockTypeFa}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">شبکه حفاری:</span>
                            <span className="text-slate-200 font-bold text-[11px] font-mono">{dp.patternGrid}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">دستگاه دریل اختصاصی:</span>
                            <span className="text-cyan-300 font-bold text-[11px]">{dp.assignedDrillRig}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">متراژ هدف شیفت:</span>
                            <span className="text-white font-black text-xs font-mono">{dp.targetDrillMeters} متر ({dp.targetHoleCount} چال)</span>
                          </div>
                        </div>

                        {dp.specialInstructions && (
                          <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                            <strong className="text-cyan-400">دستور ویژه فنی: </strong>{dp.specialInstructions}
                          </p>
                        )}

                        {/* Post-shift review box */}
                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">رصد تحقق در پایان شیفت:</span>
                            <span className="text-emerald-400 font-mono font-bold">
                              {dp.achievedDrillMeters || 0} از {dp.targetDrillMeters} متر ({dp.fulfillmentPercent || 0}٪)
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${dp.fulfillmentPercent || 0}%` }} />
                          </div>
                          {dp.deviationReason && (
                            <p className="text-[10px] text-amber-300/90 pt-1">
                              <strong>علت انحراف/ملاحظات: </strong>{dp.deviationReason}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab Content 2: Loading Priorities */}
                {activeSectionTab === 'LOADING' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {current.loadingPriorities?.map(lp => (
                      <div key={lp.id} className="p-5 rounded-3xl bg-[#0E1731] border border-[#22356B]/60 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black flex items-center justify-center border border-emerald-500/30">
                              #{lp.priorityOrder}
                            </span>
                            <strong className="text-white text-sm font-black font-mono">بلوک {lp.blockCode}</strong>
                            <span className="text-[11px] text-slate-400 font-mono">(پله {lp.benchLevel})</span>
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                            lp.materialType === 'HIGH_GRADE_ORE' 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {lp.materialTypeFa}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">دستگاه بارگیری:</span>
                            <span className="text-emerald-300 font-bold text-[11px] truncate block">{lp.assignedLoadingUnit}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">ناوگان باربری:</span>
                            <span className="text-white font-bold text-[11px] font-mono">{lp.allocatedTruckCount} دستگاه دامپتراک</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">مقصد تخلیه:</span>
                            <span className="text-slate-200 font-bold text-[11px] truncate block">{lp.destination}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">تناژ هدف مصوب:</span>
                            <span className="text-white font-black text-xs font-mono">{lp.targetTonnage.toLocaleString('fa-IR')} تن</span>
                          </div>
                        </div>

                        {lp.specialInstructions && (
                          <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                            <strong className="text-emerald-400">دستور اجرایی: </strong>{lp.specialInstructions}
                          </p>
                        )}

                        {/* Post-shift review box */}
                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">رصد تحقق بارگیری:</span>
                            <span className="text-emerald-400 font-mono font-bold">
                              {lp.achievedTonnage ? lp.achievedTonnage.toLocaleString('fa-IR') : 0} تن ({lp.fulfillmentPercent || 0}٪)
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${lp.fulfillmentPercent || 0}%` }} />
                          </div>
                          {lp.deviationReason && (
                            <p className="text-[10px] text-amber-300/90 pt-1">
                              <strong>توضیحات انحراف: </strong>{lp.deviationReason}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab Content 3: Active Fleet & Hydraulic Breakers on Map */}
                {activeSectionTab === 'FLEET_MAP' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-indigo-300">
                        <Truck className="w-4 h-4" />
                        <span>جانمایی ماشین‌آلات فعال در نقشه معدن (شاول‌ها، لودرها، دریل‌ها، <strong>پیکورهای خردایش ثانویه</strong> و بولدوزرها)</span>
                      </div>
                      <button
                        onClick={() => navigate('/mine/map')}
                        className="text-[11px] font-bold text-[#00D2FF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>مشاهده استودیو نقشه GIS</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {current.activePlacements?.map(eq => (
                        <div key={eq.id} className="p-4 rounded-2xl bg-[#0E1731] border border-[#22356B]/60 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-[#00D2FF]/20 text-[#00D2FF] font-mono font-bold text-xs border border-[#00D2FF]/30">
                                {eq.code}
                              </span>
                              <span className="text-xs font-black text-white">{eq.nameFa}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                              {eq.statusFa}
                            </span>
                          </div>

                          <div className="text-xs space-y-1">
                            <p className="text-slate-400"><strong className="text-slate-300">پله و موقعیت نقشه: </strong>{eq.currentBench}</p>
                            <p className="text-slate-400"><strong className="text-slate-300">مأموریت محوله: </strong>{eq.shiftMission}</p>
                            <p className="text-slate-400"><strong className="text-slate-300">اپراتور: </strong>{eq.operatorName}</p>
                          </div>

                          {eq.operatingHoursAchieved !== undefined && (
                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">ساعت کارکرد مفید:</span>
                              <span className="text-white font-mono font-bold">{eq.operatingHoursAchieved} ساعت</span>
                            </div>
                          )}

                          {eq.endShiftCondition && (
                            <div className="text-[10px] text-emerald-400 bg-emerald-950/30 p-2 rounded-xl border border-emerald-500/20">
                              وضعیت پایان شیفت: {eq.endShiftCondition}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab Content 4: Upcoming Blast Blocks Agreement */}
                {activeSectionTab === 'BLASTING' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {current.upcomingBlasts?.map(ub => (
                      <div key={ub.id} className="p-5 rounded-3xl bg-[#0E1731] border border-[#22356B]/60 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-purple-400" />
                            <strong className="text-white text-sm font-black font-mono">بلوک {ub.blockCode}</strong>
                            <span className="text-[11px] text-slate-400 font-mono">(پله {ub.benchLevel})</span>
                          </div>
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                            {ub.drillPatternStatusFa}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">زمان برنامه‌ریزی انفجار:</span>
                            <span className="text-purple-300 font-bold text-[11px]">{ub.plannedBlastTime}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">حریم ایمنی و تخلیه:</span>
                            <span className="text-rose-400 font-bold text-[11px] font-mono">{ub.safetyRadiusMeters} متر</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">نوع ماده ناریه مصوب:</span>
                            <span className="text-slate-200 font-bold text-[11px]">{ub.explosiveType}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#091124] border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">تناژ خردایش برآوردی:</span>
                            <span className="text-white font-black text-xs font-mono">{ub.estimatedOreTonnage.toLocaleString('fa-IR')} تن</span>
                          </div>
                        </div>

                        {/* Tripartite Clearances Check */}
                        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">موافقت ارکان سه‌گانه:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                              کارفرما ✓
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                              نظارت ✓
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                              پیمانکار ✓
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          <strong className="text-purple-400">ملاحظات و تمهیدات: </strong>{ub.statusNote}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab Content 5: Intra-Shift Schedule */}
                {activeSectionTab === 'SCHEDULE' && (
                  <div className="p-5 rounded-3xl bg-[#0E1731] border border-[#22356B]/60 space-y-4">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>برنامه زمانی ادامه روز / ادامه شیفت کاری</span>
                    </h3>

                    <div className="space-y-3">
                      {current.intraShiftSchedule?.map((item) => (
                        <div key={item.id} className="p-3.5 rounded-2xl bg-[#091124] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                                {item.timeSlot}
                              </span>
                              <strong className="text-white text-xs font-bold">{item.actionTitle}</strong>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              محل: <span className="text-slate-200">{item.targetLocation}</span> | متولی اجرا: <span className="text-amber-300">{item.responsibleParty}</span>
                            </p>
                            {item.notes && <p className="text-[10px] text-emerald-400 mt-0.5">وضعیت اجرا: {item.notes}</p>}
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold self-start sm:self-center ${
                            item.status === 'EXECUTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {item.status === 'EXECUTED' ? 'انجام شد ✓' : 'برنامه‌ریزی‌شده'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab Content 6: Operational & Safety Mandates */}
                {activeSectionTab === 'MANDATES' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {current.operationalMandates?.map(om => (
                      <div key={om.id} className="p-5 rounded-3xl bg-[#0E1731] border border-[#22356B]/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-rose-400">{om.categoryFa}</span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            om.complianceStatus === 'COMPLIED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {om.complianceStatus === 'COMPLIED' ? 'رعایت کامل ✓' : 'نیازمند مراقبت'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          {om.directiveText}
                        </p>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                          <span>صادرکننده: <strong className="text-slate-300">{om.issuedByName}</strong></span>
                          <span className="font-mono text-rose-400 font-bold">{om.priority}</span>
                        </div>

                        {om.complianceNotes && (
                          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[10px] text-slate-300">
                            <strong>گزارش رصد پایان شیفت: </strong>{om.complianceNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Digital Tripartite Sign-off Strip */}
              <div className="p-6 rounded-3xl bg-[#0E1731] border border-[#22356B]/60 space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <span>امضاهای دیجیتال رسمی ارکان سه‌گانه پروژه و تحویل به شیفت بعد</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تاییدیه نهایی عملکرد شیفت توسط نمایندگان رسمی کارفرما، نظارت و پیمانکار
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenModal('SIGN_TRIPARTITE')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    ثبت یا تکمیل امضا
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Client Signature Card */}
                  <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-400 text-xs">۱. امضای نماینده کارفرما</span>
                      {current.tripartiteSignatures?.clientSignature?.signed && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    {current.tripartiteSignatures?.clientSignature?.signed ? (
                      <>
                        <p className="font-bold text-white">{current.tripartiteSignatures.clientSignature.name}</p>
                        <p className="text-[10px] text-slate-400">{current.tripartiteSignatures.clientSignature.organization}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ثبت در: {new Date(current.tripartiteSignatures.clientSignature.signedAt || '').toLocaleTimeString('fa-IR')}</p>
                        <p className="text-[9px] text-[#00D2FF] font-mono truncate">{current.tripartiteSignatures.clientSignature.digitalFingerprint}</p>
                        {current.tripartiteSignatures.clientSignature.comment && (
                          <p className="text-[10px] text-slate-300 italic pt-1 border-t border-slate-800">«{current.tripartiteSignatures.clientSignature.comment}»</p>
                        )}
                      </>
                    ) : (
                      <p className="text-amber-300 text-[11px] py-2">در انتظار امضای دیجیتال نماینده کارفرما</p>
                    )}
                  </div>

                  {/* Supervision Signature Card */}
                  <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-cyan-400 text-xs">۲. امضای دستگاه نظارت (مشاور)</span>
                      {current.tripartiteSignatures?.supervisionSignature?.signed && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    {current.tripartiteSignatures?.supervisionSignature?.signed ? (
                      <>
                        <p className="font-bold text-white">{current.tripartiteSignatures.supervisionSignature.name}</p>
                        <p className="text-[10px] text-slate-400">{current.tripartiteSignatures.supervisionSignature.organization}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ثبت در: {new Date(current.tripartiteSignatures.supervisionSignature.signedAt || '').toLocaleTimeString('fa-IR')}</p>
                        <p className="text-[9px] text-[#00D2FF] font-mono truncate">{current.tripartiteSignatures.supervisionSignature.digitalFingerprint}</p>
                        {current.tripartiteSignatures.supervisionSignature.comment && (
                          <p className="text-[10px] text-slate-300 italic pt-1 border-t border-slate-800">«{current.tripartiteSignatures.supervisionSignature.comment}»</p>
                        )}
                      </>
                    ) : (
                      <p className="text-cyan-300 text-[11px] py-2">در انتظار امضای دستگاه نظارت مهندسین مشاور</p>
                    )}
                  </div>

                  {/* Contractor Signature Card */}
                  <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-indigo-400 text-xs">۳. امضای پیمانکار استخراج</span>
                      {current.tripartiteSignatures?.contractorSignature?.signed && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    {current.tripartiteSignatures?.contractorSignature?.signed ? (
                      <>
                        <p className="font-bold text-white">{current.tripartiteSignatures.contractorSignature.name}</p>
                        <p className="text-[10px] text-slate-400">{current.tripartiteSignatures.contractorSignature.organization}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ثبت در: {new Date(current.tripartiteSignatures.contractorSignature.signedAt || '').toLocaleTimeString('fa-IR')}</p>
                        <p className="text-[9px] text-[#00D2FF] font-mono truncate">{current.tripartiteSignatures.contractorSignature.digitalFingerprint}</p>
                        {current.tripartiteSignatures.contractorSignature.comment && (
                          <p className="text-[10px] text-slate-300 italic pt-1 border-t border-slate-800">«{current.tripartiteSignatures.contractorSignature.comment}»</p>
                        )}
                      </>
                    ) : (
                      <p className="text-indigo-300 text-[11px] py-2">در انتظار امضای مدیر کارگاه پیمانکار</p>
                    )}
                  </div>
                </div>

                {/* Managerial Oversight and Delivery Feed */}
                <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#00D2FF]" />
                      <h4 className="text-xs font-black text-white">ابلاغ به سمع و نظر مدیران و سرپرستان ارشد (Managerial Oversight)</h4>
                    </div>
                    {!isAddingFeedback && (
                      <button
                        onClick={() => setIsAddingFeedback(true)}
                        className="text-[11px] font-bold text-[#00D2FF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>ثبت دستور یا رهنمود مدیریتی</span>
                      </button>
                    )}
                  </div>

                  {isAddingFeedback && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2 animate-fadeIn">
                      <label className="text-[11px] text-slate-300 font-bold block">دستور یا رهنمود مدیر ارشد جهت درج در صورت‌جلسه شیفت:</label>
                      <textarea
                        value={managerFeedbackInput}
                        onChange={(e) => setManagerFeedbackInput(e.target.value)}
                        placeholder="مثال: نرخ خوراک‌دهی سنگ‌شکن مطلوب است؛ مراقبت ویژه از عدم آلودگی کانسنگ با باطله دیواره شمالی به عمل آید."
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setIsAddingFeedback(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                        >
                          انصراف
                        </button>
                        <button
                          onClick={handleManagerSubmitFeedback}
                          className="px-4 py-1.5 rounded-lg bg-[#00D2FF] hover:brightness-110 text-slate-950 text-xs font-black cursor-pointer"
                        >
                          ثبت و ابلاغ به شیفت
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {current.tripartiteSignatures?.notifiedManagers?.map(mgr => (
                      <div key={mgr.id} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-white">{mgr.name}</strong>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            mgr.viewed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {mgr.viewed ? 'رویت شد ✓' : 'ارسال شد'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{mgr.roleTitle}</p>
                        {mgr.feedbackNote && (
                          <p className="text-[10px] text-cyan-300 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 mt-1">
                            «{mgr.feedbackNote}»
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal for Interactive Tripartite Workflow */}
      <ShiftHandoverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        initialTab={modalInitialTab}
        selectedHandover={current}
      />
    </div>
  );
};
