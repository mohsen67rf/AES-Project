// src/modules/workspace/presentation/components/ShiftHandover/ShiftHandoverModal.tsx

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { ShiftHandoverService } from '../../../services/ShiftHandoverService';
import { ShiftHandoverRecord } from '../../../../../core/domain/types/shift-handover.types';
import type { User } from '../../../../../core/domain/types/mine.types';
import { 
  X, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ShieldAlert, 
  Truck, 
  Layers, 
  Sparkles, 
  Send, 
  Printer, 
  ArrowRightLeft, 
  Calendar, 
  UserCheck, 
  Flame, 
  Plus, 
  Check, 
  ChevronRight,
  Info
} from 'lucide-react';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  targetDepartmentKey?: string;
  targetDepartmentName?: string;
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetDepartmentKey = 'ALL_MINE',
  targetDepartmentName = 'عملیات یکپارچه معدن'
}) => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'NEW' | 'HISTORY' | 'PRINT'>('ACTIVE');
  const [handovers, setHandovers] = useState<ShiftHandoverRecord[]>(() => ShiftHandoverService.getAll());
  const [selectedHandover, setSelectedHandover] = useState<ShiftHandoverRecord | null>(() => ShiftHandoverService.getCurrentActiveHandover());

  // فرم ثبت یا ویرایش
  const [draft, setDraft] = useState<ShiftHandoverRecord | null>(null);
  const [incomingSignNotes, setIncomingSignNotes] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // رویداد رفرش در صورت آپدیت
  useEffect(() => {
    const handler = () => {
      const list = ShiftHandoverService.getAll();
      setHandovers(list);
      const active = ShiftHandoverService.getCurrentActiveHandover();
      setSelectedHandover(active);
    };
    window.addEventListener('shiftHandoverUpdated', handler);
    return () => window.removeEventListener('shiftHandoverUpdated', handler);
  }, []);

  if (!isOpen) return null;

  const handleStartNewDraft = () => {
    const newDraft = ShiftHandoverService.generateAutoDraft(
      targetDepartmentKey, 
      targetDepartmentName, 
      currentUser
    );
    setDraft(newDraft);
    setActiveTab('NEW');
  };

  const handleSaveDraft = (statusToSet: 'IN_PROGRESS' | 'READY_FOR_HANDOVER') => {
    if (!draft) return;
    const toSave: ShiftHandoverRecord = {
      ...draft,
      status: statusToSet,
      outgoingSupervisor: {
        ...draft.outgoingSupervisor,
        userId: currentUser?.id || draft.outgoingSupervisor.userId,
        fullName: currentUser?.fullName || draft.outgoingSupervisor.fullName,
        signedAt: new Date().toISOString()
      }
    };
    ShiftHandoverService.saveHandover(toSave);
    setSelectedHandover(toSave);
    setActiveTab('ACTIVE');
    setSuccessToast(statusToSet === 'READY_FOR_HANDOVER' ? 'شیفت با موفقیت ثبت و آماده تحویل به شیفت ورودی شد.' : 'پیش‌نویس ذخیره گردید.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleAcknowledgeAndSign = () => {
    if (!selectedHandover || !currentUser) return;
    setIsSigning(true);
    setTimeout(() => {
      const updated = ShiftHandoverService.acknowledgeIncomingHandover(
        selectedHandover.id,
        currentUser,
        incomingSignNotes.trim() || 'تمامی جبهه‌کارها و ماشین‌آلات بازدید و تحویل گرفته شد.'
      );
      if (updated) {
        setSelectedHandover(updated);
        setSuccessToast('تحویل و تحول رسمی شیفت با امضای دوطرفه ثبت قطعی شد.');
        setTimeout(() => setSuccessToast(null), 4000);
      }
      setIsSigning(false);
    }, 600);
  };

  const currentView = selectedHandover || handovers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md transition-all duration-300 animate-fadeIn" dir={isRtl ? 'rtl' : 'ltr'}>
      <div 
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-200 ${
          isDark 
            ? 'bg-[#0D1429] border-[#24356B]/60 text-[#F1F5F9]' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header Bar */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 ${
          isDark ? 'bg-[#111B38] border-[#24356B]/40' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00D2FF] to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center text-slate-950">
              <RotateCcw className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  پروتکل هوشمند تحویل و تحول شیفت (Shift Handover)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30">
                  اتصال انسان‌ها و حذف کارهای تکراری
                </span>
              </div>
              <p className="text-xs text-[#8E9EB8]">
                گردش لحظه‌ای و رسمی اطلاعات جبهه‌کارها، ناوگان، ایمنی و تعهدات بین شیفت‌ها در زمان طلایی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-700/40 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successToast && (
          <div className="px-6 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className={`px-5 pt-2 border-b flex items-center justify-between gap-2 overflow-x-auto ${
          isDark ? 'border-[#24356B]/40 bg-[#0E1730]' : 'border-slate-200 bg-slate-100/70'
        }`}>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-4 py-2 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'ACTIVE'
                  ? 'border-[#00D2FF] text-[#00D2FF] bg-[#142145]/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>شیفت فعال و کارتابل تحویل</span>
              {currentView?.status === 'READY_FOR_HANDOVER' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={handleStartNewDraft}
              className={`px-4 py-2 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'NEW'
                  ? 'border-[#00D2FF] text-[#00D2FF] bg-[#142145]/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ثبت تحویل شیفت جدید (پیش‌پر خودکار)</span>
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-4 py-2 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'HISTORY'
                  ? 'border-[#00D2FF] text-[#00D2FF] bg-[#142145]/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>آرشیو شیفت‌ها ({handovers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('PRINT')}
              className={`px-4 py-2 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                activeTab === 'PRINT'
                  ? 'border-[#00D2FF] text-[#00D2FF] bg-[#142145]/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>صورت‌جلسه رسمی و چاپ</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 pb-1">
            <Clock className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span>نوبت کاری: {currentView?.shiftTitleFa.split('-')[0]}</span>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: ACTIVE HANDOVER VIEW */}
          {/* ========================================================================= */}
          {activeTab === 'ACTIVE' && currentView && (
            <div className="space-y-6">
              {/* Primary Shift Overview Card */}
              <div className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#131D3D] border-[#24356B]/50' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#24356B]/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#00D2FF]/15 text-[#00D2FF] font-bold border border-[#00D2FF]/30">
                        کد سند: {currentView.handoverCode}
                      </span>
                      <h3 className="text-sm font-black text-[#F1F5F9] flex items-center gap-2">
                        <span>{currentView.shiftTitleFa}</span>
                      </h3>
                    </div>
                    <p className="text-xs text-[#8E9EB8]">
                      تاریخ: <strong className="text-white font-mono">{currentView.shiftDateJalali}</strong> | مجتمع: {currentView.mineNameFa}
                    </p>
                  </div>

                  {/* Status & Dual Sign State Badge */}
                  <div className="flex items-center gap-3">
                    {currentView.status === 'HANDED_OVER' ? (
                      <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تحویل و تحول قطعی (امضای دوطرفه کامل)</span>
                      </div>
                    ) : currentView.status === 'READY_FOR_HANDOVER' ? (
                      <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center gap-2 animate-pulse">
                        <Clock className="w-4 h-4" />
                        <span>آماده تحویل (منتظر امضای سرپرست ورودی)</span>
                      </div>
                    ) : (
                      <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-black flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>شیفت در حال کار</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4 Shift Production & Operation Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  <div className="p-3 rounded-xl bg-[#0E162F] border border-[#24356B]/30">
                    <span className="text-[11px] text-[#8E9EB8] block mb-1">استخراج کانسنگ آهن</span>
                    <span className="text-lg font-black text-white font-mono">{currentView.totalExtractionTons.toLocaleString('fa-IR')}</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">تن سنگ آهن</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0E162F] border border-[#24356B]/30">
                    <span className="text-[11px] text-[#8E9EB8] block mb-1">حجم باطله‌برداری</span>
                    <span className="text-lg font-black text-amber-400 font-mono">{currentView.totalWasteTons.toLocaleString('fa-IR')}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">تن باطله به دپو</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0E162F] border border-[#24356B]/30">
                    <span className="text-[11px] text-[#8E9EB8] block mb-1">سرویس‌های باربری ناوگان</span>
                    <span className="text-lg font-black text-cyan-400 font-mono">{currentView.totalHaulTrips.toLocaleString('fa-IR')}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">سرویس دامپتراک</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0E162F] border border-[#24356B]/30">
                    <span className="text-[11px] text-[#8E9EB8] block mb-1">عیار میانگین شیفت (Fe)</span>
                    <span className="text-lg font-black text-purple-400 font-mono">{currentView.averageFeGradePercent}٪</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">مطابق تارگت کارخانه</span>
                  </div>
                </div>
              </div>

              {/* Golden Shift Directive Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-indigo-500/15 border border-amber-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-400 mb-1">دستور ویژه شیفت و اولویت طلایی (Golden Directive)</h4>
                  <p className="text-xs text-[#F1F5F9] leading-relaxed font-medium">
                    {currentView.goldenShiftDirective}
                  </p>
                </div>
              </div>

              {/* Active Faces & Benches Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#00D2FF]" />
                    <span>وضعیت سینه‌کارها، پله‌ها و جبهه‌های فعال ({currentView.activeBenches.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">به‌روزرسانی خودکار از سامانه نقشه‌برداری و دیسپچ</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentView.activeBenches.map((bench) => (
                    <div 
                      key={bench.id}
                      className="p-4 rounded-xl bg-[#111933] border border-[#24356B]/40 space-y-2.5 hover:border-[#00D2FF]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white bg-slate-800/80 px-2 py-0.5 rounded font-mono">
                          پله {bench.benchLevel} | {bench.blockCode}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          bench.materialType === 'HIGH_GRADE_ORE' ? 'bg-emerald-500/20 text-emerald-300' :
                          bench.materialType === 'LOW_GRADE_ORE' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {bench.materialTypeFa}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-slate-300">
                        <p className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">دستگاه بارگیری:</span>
                          <strong className="text-white">{bench.assignedExcavator}</strong>
                        </p>
                        <p className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">تراک‌های تخصیصی:</span>
                          <strong className="text-cyan-400 font-mono">{bench.haulTruckCount} دستگاه</strong>
                        </p>
                        <p className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">عملکرد شیفت:</span>
                          <span className="font-mono text-emerald-400">{bench.achievedTonnage.toLocaleString('fa-IR')} از {bench.targetTonnage.toLocaleString('fa-IR')} تن</span>
                        </p>
                        <p className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">مقصد باربری:</span>
                          <span className="text-slate-300 truncate max-w-[170px]">{bench.destination}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[11px] text-[#8E9EB8] leading-tight">
                        <strong className="text-slate-300">نکته سرپرست: </strong>{bench.notes}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment & Safety 2-Column Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Critical Equipment Status */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    <span>وضعیت ماشین‌آلات کلیدی و توقفات</span>
                  </h4>

                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {currentView.equipmentStatuses.map((eq) => (
                      <div 
                        key={eq.id}
                        className="p-3 rounded-xl bg-[#111933] border border-[#24356B]/30 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-[#00D2FF]">{eq.code}</span>
                            <span className="font-bold text-white truncate">{eq.nameFa}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            موقعیت: {eq.locationBench} | سوخت: {eq.fuelLevelPercent}٪ | کارکرد: {eq.operatingHours} ساعت
                          </p>
                          {eq.issuesReported && (
                            <p className="text-[10px] text-amber-300/90 mt-0.5">
                              {eq.issuesReported}
                            </p>
                          )}
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                          eq.status === 'OPERATIONAL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          eq.status === 'STANDBY' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {eq.statusFa}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety, Geotechnical & Weather */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    <span>پایش ایمنی (HSE)، ژئوتکنیک و محیط پیت</span>
                  </h4>

                  <div className="p-4 rounded-xl bg-[#111933] border border-[#24356B]/30 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-slate-400">شاخص ریسک شیفت:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-[11px]">
                        ریسک پایین (ایمن)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300">
                      <strong className="text-slate-400">وضعیت راه‌ها: </strong>{currentView.safetyLog.roadCondition}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      <strong className="text-slate-400">پایداری دیواره‌ها: </strong>{currentView.safetyLog.wallStabilityStatus}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      <strong className="text-slate-400">شبه حوادث: </strong>{currentView.safetyLog.nearMissCount} مورد ثبت گردید.
                    </p>

                    {currentView.safetyLog.nextShiftBlastNotice && (
                      <div className="mt-3 p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 flex items-start gap-2.5 text-rose-200">
                        <Flame className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div className="text-[11px]">
                          <strong className="block text-rose-300 font-black">اعلان آتشباری شیفت بعد:</strong>
                          پله {currentView.safetyLog.nextShiftBlastNotice.benchLevel} در {currentView.safetyLog.nextShiftBlastNotice.scheduledTime} - شعاع حریم ایمنی: {currentView.safetyLog.nextShiftBlastNotice.exclusionRadiusMeters} متر.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pending Cross-Departmental Tasks to Next Shift */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>تعهدات باز و تسک‌های در جریان بین واحدها (انتقال خودکار به شیفت ورودی)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">تسک‌های نیمه‌تمام بدون اتلاف وقت به کارتابل شیفت بعد متصل شدند</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentView.pendingTasks.map((t) => (
                    <div key={t.id} className="p-3.5 rounded-xl bg-[#111933] border border-[#24356B]/30 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-[#00D2FF] font-bold">
                          {t.taskCode}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          {t.priority === 'URGENT' ? 'فوری' : 'مهم'}
                        </span>
                      </div>
                      <p className="font-bold text-white text-xs">{t.title}</p>
                      <p className="text-[11px] text-slate-400">
                        واحد پیگیری: <strong className="text-slate-300">{t.targetDepartment}</strong> | مهلت: {t.deadlineTime}
                      </p>
                      <p className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800/60">
                        یادداشت تحویل: {t.notesForNextShift}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dual Digital Sign-off Section */}
              <div className={`p-5 rounded-2xl border ${
                currentView.status === 'HANDED_OVER'
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-[#121B38] border-[#24356B]/60'
              }`}>
                <h4 className="text-xs font-black text-white flex items-center gap-2 mb-4">
                  <UserCheck className="w-4 h-4 text-[#00D2FF]" />
                  <span>پروتکل امضای دیجیتال دوطرفه (Dual Digital Sign-off)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Outgoing Supervisor Signature */}
                  <div className="p-4 rounded-xl bg-[#0C132B] border border-[#24356B]/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-cyan-400">۱. سرپرست تحویل‌دهنده (شیفت خروجی)</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        ثبت و امضا شده
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-300 pt-1">
                      <p><strong className="text-white">{currentView.outgoingSupervisor.fullName}</strong> ({currentView.outgoingSupervisor.userCode})</p>
                      <p className="text-[11px] text-slate-400">{currentView.outgoingSupervisor.departmentFa}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        زمان امضا: {new Date(currentView.outgoingSupervisor.signedAt).toLocaleString('fa-IR')}
                      </p>
                      <p className="text-[10px] text-[#00D2FF] font-mono truncate">
                        شناسه لاگ: {currentView.outgoingSupervisor.digitalFingerprint}
                      </p>
                      {currentView.outgoingSupervisor.signatureNotes && (
                        <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800">
                          «{currentView.outgoingSupervisor.signatureNotes}»
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Incoming Supervisor Signature or Action */}
                  <div className="p-4 rounded-xl bg-[#0C132B] border border-[#24356B]/40 space-y-2 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-purple-400">۲. سرپرست تحویل‌گیرنده (شیفت ورودی)</span>
                        {currentView.incomingSupervisor ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            تایید و ثبت نهایی شد
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                            در انتظار تایید
                          </span>
                        )}
                      </div>

                      {currentView.incomingSupervisor ? (
                        <div className="space-y-1 text-slate-300 pt-2">
                          <p><strong className="text-white">{currentView.incomingSupervisor.fullName}</strong> ({currentView.incomingSupervisor.userCode})</p>
                          <p className="text-[11px] text-slate-400">{currentView.incomingSupervisor.departmentFa}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            زمان پذیرش: {new Date(currentView.incomingSupervisor.signedAt).toLocaleString('fa-IR')}
                          </p>
                          <p className="text-[10px] text-emerald-400 font-mono truncate">
                            مهر تایید: {currentView.incomingSupervisor.digitalFingerprint}
                          </p>
                          {currentView.incomingSupervisor.signatureNotes && (
                            <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800">
                              «{currentView.incomingSupervisor.signatureNotes}»
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3 pt-2">
                          <p className="text-[11px] text-slate-300">
                            سرپرست ورودی موظف است پس از بررسی میدانی جبهه‌کارها و تطبیق ناوگان، صورت‌جلسه را تایید نماید.
                          </p>
                          <input
                            type="text"
                            value={incomingSignNotes}
                            onChange={(e) => setIncomingSignNotes(e.target.value)}
                            placeholder="یادداشت تکمیلی تحویل شیفت (اختیاری)..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00D2FF]"
                          />
                        </div>
                      )}
                    </div>

                    {!currentView.incomingSupervisor && (
                      <div className="pt-3">
                        <button
                          onClick={handleAcknowledgeAndSign}
                          disabled={isSigning}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 text-white font-black text-xs shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>{isSigning ? 'در حال تایید و صدور امضا...' : 'تایید رسمی و پذیرش تحویل شیفت (Acknowledge & Sign)'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: NEW HANDOVER (AUTO-POPULATED - ZERO REDUNDANT WORK) */}
          {/* ========================================================================= */}
          {activeTab === 'NEW' && draft && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-cyan-300">پیش‌پر کردن کاملاً خودکار (Zero Redundant Work)</h4>
                    <p className="text-[11px] text-slate-300">
                      تمام داده‌های پله‌ها، دیسپچ ماشین‌آلات و تسک‌های باز مستقیماً از سامانه استخراج شدند. نیازی به تایپ مجدد نیست.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveDraft('IN_PROGRESS')}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold"
                  >
                    ذخیره موقت
                  </button>
                  <button
                    onClick={() => handleSaveDraft('READY_FOR_HANDOVER')}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#00D2FF] to-indigo-600 text-slate-950 font-black text-xs hover:brightness-110 shadow-lg shadow-cyan-500/30 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>نهایی‌سازی و امضا جهت تحویل شیفت</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">کد رهگیری شیفت</label>
                  <input
                    type="text"
                    value={draft.handoverCode}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-xl text-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">نوبت شیفت</label>
                  <input
                    type="text"
                    value={draft.shiftTitleFa}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-xl text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">تاریخ شمسی</label>
                  <input
                    type="text"
                    value={draft.shiftDateJalali}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-xl text-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">سرپرست تحویل‌دهنده</label>
                  <input
                    type="text"
                    value={currentUser?.fullName || draft.outgoingSupervisor.fullName}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              {/* Production Totals Editable */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">تناژ سنگ آهن (تن)</label>
                  <input
                    type="number"
                    value={draft.totalExtractionTons}
                    onChange={(e) => setDraft({ ...draft, totalExtractionTons: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">تناژ باطله (تن)</label>
                  <input
                    type="number"
                    value={draft.totalWasteTons}
                    onChange={(e) => setDraft({ ...draft, totalWasteTons: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">تعداد سرویس تراک</label>
                  <input
                    type="number"
                    value={draft.totalHaulTrips}
                    onChange={(e) => setDraft({ ...draft, totalHaulTrips: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">عیار میانگین Fe (٪)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={draft.averageFeGradePercent}
                    onChange={(e) => setDraft({ ...draft, averageFeGradePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              {/* Golden Directive Textarea */}
              <div>
                <label className="block text-[11px] font-bold text-amber-400 mb-1">
                  دستور ویژه شیفت و اولویت طلایی برای سرپرست ورودی (Golden Directive)
                </label>
                <textarea
                  rows={3}
                  value={draft.goldenShiftDirective}
                  onChange={(e) => setDraft({ ...draft, goldenShiftDirective: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  placeholder="مهم‌ترین اولویت‌های عملیاتی، نقاط بحرانی پله‌ها، یا دستورات مدیریتی برای شیفت بعد..."
                />
              </div>

              {/* Preview of Linked Active Benches */}
              <div>
                <h5 className="text-xs font-bold text-slate-300 mb-2">سینه‌کارها و پله‌های فعال الصاق‌شده به صورت‌جلسه:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {draft.activeBenches.map((b) => (
                    <div key={b.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div>
                        <strong className="text-white">پله {b.benchLevel} ({b.blockCode})</strong>
                        <p className="text-[10px] text-slate-400 mt-0.5">{b.assignedExcavator} - {b.destination}</p>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400">{b.achievedTonnage} تن</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ARCHIVE & HISTORY */}
          {/* ========================================================================= */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white">آرشیو صورت‌جلسات تحویل و تحول شیفت معدن</h4>
                <span className="text-[11px] text-slate-400">قابلیت ممیزی کامل و ردیابی تصمیمات تاریخی</span>
              </div>

              <div className="space-y-2.5">
                {handovers.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedHandover(item);
                      setActiveTab('ACTIVE');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      selectedHandover?.id === item.id
                        ? 'bg-[#18254D] border-[#00D2FF] shadow-lg shadow-cyan-500/10'
                        : 'bg-[#111933] border-[#24356B]/40 hover:bg-[#152042]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#00D2FF]">{item.handoverCode}</span>
                        <h5 className="text-xs font-black text-white">{item.shiftTitleFa}</h5>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        تاریخ: <strong className="text-slate-300 font-mono">{item.shiftDateJalali}</strong> | تحویل‌دهنده: {item.outgoingSupervisor.fullName} | تحویل‌گیرنده: {item.incomingSupervisor?.fullName || 'منتظر تایید'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left text-xs font-mono">
                        <span className="text-emerald-400 font-bold block">{item.totalExtractionTons.toLocaleString('fa-IR')} تن سنگ</span>
                        <span className="text-slate-400 text-[10px] block">{item.totalWasteTons.toLocaleString('fa-IR')} تن باطله</span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                        item.status === 'HANDED_OVER' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.status === 'READY_FOR_HANDOVER' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {item.status === 'HANDED_OVER' ? 'تایید نهایی دوطرفه' : item.status === 'READY_FOR_HANDOVER' ? 'منتظر تایید' : 'در حال کار'}
                      </span>

                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: OFFICIAL PRINTABLE MINUTES */}
          {/* ========================================================================= */}
          {activeTab === 'PRINT' && currentView && (
            <div className="space-y-4">
              <div className="flex items-center justify-between no-print">
                <span className="text-xs text-slate-400">فرم استاندارد صورت‌جلسه تحویل شیفت مطابق الزامات نظام مهندسی معدن و HSE</span>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ / ذخیره PDF صورت‌جلسه</span>
                </button>
              </div>

              {/* Formal Sheet */}
              <div className="p-8 rounded-2xl bg-white text-slate-900 shadow-xl space-y-6 font-sans border border-slate-300 text-xs" dir="rtl">
                {/* Formal Header */}
                <div className="pb-4 border-b-2 border-slate-900 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-base font-black text-slate-950">مجتمع معدنی و صنعتی سنگ‌آهن (سهامی عام)</h2>
                    <h3 className="text-sm font-bold text-slate-700">صورت‌جلسه رسمی تحویل و تحول شیفت عملیات معدن</h3>
                  </div>
                  <div className="text-left font-mono text-[11px] space-y-0.5">
                    <p>شماره سند: <strong>{currentView.handoverCode}</strong></p>
                    <p>تاریخ: <strong>{currentView.shiftDateJalali}</strong></p>
                    <p>نوبت: <strong>{currentView.shiftTitleFa.split('-')[0]}</strong></p>
                  </div>
                </div>

                {/* Section 1: Summary Table */}
                <div>
                  <h4 className="font-black text-xs text-slate-900 mb-2">۱. آمار کلان تولید و عملیات شیفت</h4>
                  <table className="w-full border-collapse border border-slate-300 text-center text-xs">
                    <thead>
                      <tr className="bg-slate-100 font-black">
                        <th className="border border-slate-300 p-2">استخراج سنگ آهن (تن)</th>
                        <th className="border border-slate-300 p-2">باطله‌برداری (تن)</th>
                        <th className="border border-slate-300 p-2">مجموع سرویس تراک</th>
                        <th className="border border-slate-300 p-2">عیار میانگین Fe</th>
                        <th className="border border-slate-300 p-2">وضعیت ایمنی پیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2 font-mono font-bold">{currentView.totalExtractionTons.toLocaleString('fa-IR')}</td>
                        <td className="border border-slate-300 p-2 font-mono font-bold">{currentView.totalWasteTons.toLocaleString('fa-IR')}</td>
                        <td className="border border-slate-300 p-2 font-mono font-bold">{currentView.totalHaulTrips}</td>
                        <td className="border border-slate-300 p-2 font-mono font-bold">{currentView.averageFeGradePercent}٪</td>
                        <td className="border border-slate-300 p-2 font-bold text-emerald-700">بدون حادثه (ایمن)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 2: Active Faces */}
                <div>
                  <h4 className="font-black text-xs text-slate-900 mb-2">۲. جبهه‌کارهای فعال و دستگاه‌های بارگیری</h4>
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 font-black text-center">
                        <th className="border border-slate-300 p-1.5">پله و بلوک</th>
                        <th className="border border-slate-300 p-1.5">ماده معدنی</th>
                        <th className="border border-slate-300 p-1.5">شاول / بیل</th>
                        <th className="border border-slate-300 p-1.5">تعداد تراک</th>
                        <th className="border border-slate-300 p-1.5">مقصد باربری</th>
                        <th className="border border-slate-300 p-1.5">ملاحظات پله</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentView.activeBenches.map(b => (
                        <tr key={b.id}>
                          <td className="border border-slate-300 p-1.5 text-center font-bold">پله {b.benchLevel} ({b.blockCode})</td>
                          <td className="border border-slate-300 p-1.5 text-center">{b.materialTypeFa}</td>
                          <td className="border border-slate-300 p-1.5 text-center">{b.assignedExcavator}</td>
                          <td className="border border-slate-300 p-1.5 text-center font-mono">{b.haulTruckCount}</td>
                          <td className="border border-slate-300 p-1.5">{b.destination}</td>
                          <td className="border border-slate-300 p-1.5 text-[11px]">{b.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 3: Golden Directive */}
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950">
                  <strong className="font-black text-amber-900 block mb-1">۳. دستور ویژه شیفت (Golden Directive):</strong>
                  <p className="leading-relaxed">{currentView.goldenShiftDirective}</p>
                </div>

                {/* Section 4: Dual Signatures Table */}
                <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-center text-xs">
                  <div className="space-y-2">
                    <p className="font-black text-slate-800">سرپرست تحویل‌دهنده (شیفت خروجی)</p>
                    <p className="font-bold text-slate-900">{currentView.outgoingSupervisor.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">شناسه دیجیتال: {currentView.outgoingSupervisor.digitalFingerprint}</p>
                    <div className="h-12 border-b border-dashed border-slate-400 flex items-center justify-center text-[10px] text-emerald-600 font-bold">
                      [امضای دیجیتال سیستمی ثبت گردید]
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-black text-slate-800">سرپرست تحویل‌گیرنده (شیفت ورودی)</p>
                    <p className="font-bold text-slate-900">{currentView.incomingSupervisor?.fullName || 'در انتظار تحویل'}</p>
                    <p className="text-[10px] text-slate-500 font-mono">شناسه دیجیتال: {currentView.incomingSupervisor?.digitalFingerprint || '---'}</p>
                    <div className="h-12 border-b border-dashed border-slate-400 flex items-center justify-center text-[10px] text-emerald-600 font-bold">
                      {currentView.incomingSupervisor ? '[امضای دیجیتال سیستمی ثبت گردید]' : '[محل مهر و امضای سرپرست ورودی]'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
          isDark ? 'bg-[#111B38] border-[#24356B]/40 text-[#8E9EB8]' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#00D2FF]" />
            <span>پروتکل تحویل شیفت متصل به پایگاه داده و ممیزی سامانه AES Mining</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
