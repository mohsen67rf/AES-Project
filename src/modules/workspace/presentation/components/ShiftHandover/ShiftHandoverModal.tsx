// src/modules/workspace/presentation/components/ShiftHandover/ShiftHandoverModal.tsx

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../../shared/context/LanguageContext';
import { ShiftHandoverService } from '../../../services/ShiftHandoverService';
import { 
  ShiftHandoverRecord,
  DrillingPriorityItem,
  LoadingPriorityItem,
  ActiveEquipmentPlacement,
  UpcomingBlastAgreement,
  OperationalMandateItem
} from '../../../../../core/domain/types/shift-handover.types';
import type { User } from '../../../../../core/domain/types/mine.types';
import { 
  X, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  Users, 
  Building2, 
  Wrench, 
  PenTool, 
  Flame, 
  Activity, 
  Truck, 
  FileCheck2, 
  Printer, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  ShieldAlert, 
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  initialTab?: 'MEETING_DRAFT' | 'REVIEW_REALIZATION' | 'SIGN_TRIPARTITE' | 'PRINT';
  selectedHandover?: ShiftHandoverRecord;
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialTab = 'MEETING_DRAFT',
  selectedHandover
}) => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState<'MEETING_DRAFT' | 'REVIEW_REALIZATION' | 'SIGN_TRIPARTITE' | 'PRINT'>(initialTab);
  
  // پیش‌نویس داده‌ها
  const [draft, setDraft] = useState<ShiftHandoverRecord>(() => {
    if (selectedHandover) return JSON.parse(JSON.stringify(selectedHandover));
    return ShiftHandoverService.generateAutoDraft('ALL_MINE', 'ستاد هماهنگی پیت', currentUser);
  });

  const [signerRole, setSignerRole] = useState<'CLIENT' | 'SUPERVISION' | 'CONTRACTOR'>('CONTRACTOR');
  const [signerName, setSignerName] = useState(currentUser?.fullName || 'مهندس اکبری');
  const [signerOrg, setSignerOrg] = useState('شرکت پیمانکاری کوهساران');
  const [signerComment, setSignerComment] = useState('انطباق مصوبات شیفت با استانداردهای استخراج تایید می‌شود.');
  const [incomingName, setIncomingName] = useState('مهندس رضایی (سرپرست شیفت شب ورودی)');
  const [incomingNotes, setIncomingNotes] = useState('پله‌های ۱۰۲۵ و ۱۰۴۰ و ماشین‌آلات بازدید و تحویل گرفته شد.');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedHandover) {
      setDraft(JSON.parse(JSON.stringify(selectedHandover)));
    }
    setActiveTab(initialTab);
  }, [selectedHandover, initialTab, isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ۱. ذخیره جلسه هماهنگی
  const handleSaveMeetingPlan = () => {
    const toSave: ShiftHandoverRecord = {
      ...draft,
      status: draft.status === 'PLANNING_MEETING' ? 'IN_PROGRESS' : draft.status,
      updatedAt: new Date().toISOString()
    };
    ShiftHandoverService.saveHandover(toSave);
    setDraft(toSave);
    showToast('مصوبات جلسه هماهنگی حضوری ارکان پروژه با موفقیت ثبت و ابلاغ شد.');
  };

  // ۲. ذخیره رصد پایان شیفت
  const handleSaveRealizationReview = () => {
    // محاسبه درصد کلی تحقق
    let drillSum = 0;
    draft.drillingPriorities?.forEach(dp => {
      if (dp.targetDrillMeters > 0) {
        drillSum += Math.min(100, Math.round(((dp.achievedDrillMeters || 0) / dp.targetDrillMeters) * 100));
      }
    });
    const drillPercent = draft.drillingPriorities?.length ? Math.round(drillSum / draft.drillingPriorities.length) : 100;

    let loadSum = 0;
    draft.loadingPriorities?.forEach(lp => {
      if (lp.targetTonnage > 0) {
        loadSum += Math.min(100, Math.round(((lp.achievedTonnage || 0) / lp.targetTonnage) * 100));
      }
    });
    const loadPercent = draft.loadingPriorities?.length ? Math.round(loadSum / draft.loadingPriorities.length) : 100;

    const overall = Math.round((drillPercent * 0.4) + (loadPercent * 0.5) + (100 * 0.1));

    const toSave: ShiftHandoverRecord = {
      ...draft,
      drillingFulfillmentPercent: drillPercent,
      loadingFulfillmentPercent: loadPercent,
      overallFulfillmentPercent: overall,
      status: 'READY_FOR_HANDOVER',
      updatedAt: new Date().toISOString()
    };
    ShiftHandoverService.saveHandover(toSave);
    setDraft(toSave);
    showToast('ارزیابی و رصد تحقق اهداف در پایان شیفت ذخیره گردید و آماده امضاهای سه‌گانه است.');
  };

  // ۳. ثبت امضای یکی از ارکان سه‌گانه
  const handleSignTripartite = () => {
    const updated = ShiftHandoverService.signAsTripartite(
      draft.id,
      signerRole,
      signerName,
      signerOrg,
      signerComment
    );
    if (updated) {
      setDraft(JSON.parse(JSON.stringify(updated)));
      showToast(`امضای رسمی ${signerRole === 'CLIENT' ? 'کارفرما' : signerRole === 'SUPERVISION' ? 'دستگاه نظارت' : 'پیمانکار'} ثبت گردید.`);
    }
  };

  // ۴. ثبت تاییدیه سرپرست شیفت ورودی
  const handleAcknowledgeIncoming = () => {
    const updated = ShiftHandoverService.acknowledgeIncomingSupervisor(
      draft.id,
      incomingName,
      draft.shiftType === 'SHIFT_1_DAY' ? 'SHIFT-NIGHT-02' : 'SHIFT-DAY-01',
      incomingNotes
    );
    if (updated) {
      setDraft(JSON.parse(JSON.stringify(updated)));
      showToast('تاییدیه رسمی تحویل‌گیرنده شیفت ورودی با موفقیت ثبت و شیفت مختومه شد.');
    }
  };

  // ایجاد ردیف جدید در اولویت‌ها
  const addDrillingItem = () => {
    const newItem: DrillingPriorityItem = {
      id: `dp-new-${Date.now()}`,
      priorityOrder: (draft.drillingPriorities?.length || 0) + 1,
      blockCode: '1040-B-20',
      benchLevel: 1040,
      rockTypeFa: 'مگنتیت توده‌ای',
      patternGrid: '۳.۵ × ۴ متر',
      targetHoleCount: 30,
      targetDrillMeters: 360,
      assignedDrillRig: 'دریل DRL-01',
      achievedDrillMeters: 0,
      achievedHoleCount: 0,
      fulfillmentPercent: 0
    };
    setDraft({ ...draft, drillingPriorities: [...(draft.drillingPriorities || []), newItem] });
  };

  const addLoadingItem = () => {
    const newItem: LoadingPriorityItem = {
      id: `lp-new-${Date.now()}`,
      priorityOrder: (draft.loadingPriorities?.length || 0) + 1,
      blockCode: '1025-O-05',
      benchLevel: 1025,
      materialType: 'HIGH_GRADE_ORE',
      materialTypeFa: 'سنگ‌آهن پرعیار',
      targetTonnage: 7500,
      assignedLoadingUnit: 'شاول PC-1250',
      allocatedTruckCount: 6,
      destination: 'سنگ‌شکن ژیراتوری',
      achievedTonnage: 0,
      fulfillmentPercent: 0
    };
    setDraft({ ...draft, loadingPriorities: [...(draft.loadingPriorities || []), newItem] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`w-full max-w-5xl rounded-3xl border shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden ${
        isDark ? 'bg-[#0B1226] border-[#24356B]/70' : 'bg-white border-slate-300'
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-[#080E1F]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00D2FF] to-indigo-600 p-0.5 flex items-center justify-center text-slate-950 font-black">
              <RotateCcw className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>کارتابل جامع پروتکل سه‌گانه تحویل و تحول شیفت</span>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  {draft.handoverCode}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                هماهنگی کارفرما، نظارت و پیمانکار | اولویت‌های حفاری، بارگیری، نقشه ماشین‌آلات و پیکور، و رصد تحقق
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 border-b border-slate-800 bg-[#091124] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('MEETING_DRAFT')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'MEETING_DRAFT'
                ? 'text-[#00D2FF] border-[#00D2FF] bg-[#101A36]'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>۱. مصوبات جلسه هماهنگی اول شیفت</span>
          </button>

          <button
            onClick={() => setActiveTab('REVIEW_REALIZATION')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'REVIEW_REALIZATION'
                ? 'text-emerald-400 border-emerald-400 bg-[#101A36]'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>۲. رصد و ارزیابی پایان شیفت</span>
          </button>

          <button
            onClick={() => setActiveTab('SIGN_TRIPARTITE')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'SIGN_TRIPARTITE'
                ? 'text-purple-400 border-purple-400 bg-[#101A36]'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>۳. امضای سه‌گانه ارکان پروژه</span>
          </button>

          <button
            onClick={() => setActiveTab('PRINT')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'PRINT'
                ? 'text-amber-400 border-amber-400 bg-[#101A36]'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>۴. خروجی چاپی و رسمی صورت‌جلسه</span>
          </button>
        </div>

        {toastMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: Pre-Shift Coordination Meeting */}
          {activeTab === 'MEETING_DRAFT' && (
            <div className="space-y-5">
              {/* Meeting Info */}
              <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-3">
                <h3 className="text-xs font-black text-amber-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>اطلاعات جلسه هماهنگی حضوری ارکان سه‌گانه در معدن</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">زمان برگزاری جلسه:</label>
                    <input
                      type="text"
                      value={draft.meetingTime}
                      onChange={e => setDraft({ ...draft, meetingTime: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">مکان برگزاری در سایت:</label>
                    <input
                      type="text"
                      value={draft.meetingLocation}
                      onChange={e => setDraft({ ...draft, meetingLocation: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">دستور طلایی و پیام محوری شیفت:</label>
                    <input
                      type="text"
                      value={draft.goldenShiftDirective}
                      onChange={e => setDraft({ ...draft, goldenShiftDirective: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-xs font-bold">خلاصه مذاکرات و توافقات اولیه جلسه حضوری:</label>
                  <textarea
                    rows={2}
                    value={draft.meetingNotes}
                    onChange={e => setDraft({ ...draft, meetingNotes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-cyan-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* 1. Drilling Priorities Section */}
              <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-cyan-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>۱. اولویت‌بندی حفاری بلوک‌ها (حفاری کدام بلوک اولویت دارد)</span>
                  </h3>
                  <button
                    onClick={addDrillingItem}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن بلوک حفاری</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {draft.drillingPriorities?.map((dp, idx) => (
                    <div key={dp.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs items-center">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                          {dp.priorityOrder}
                        </span>
                        <input
                          type="text"
                          value={dp.blockCode}
                          onChange={e => {
                            const arr = [...(draft.drillingPriorities || [])];
                            arr[idx].blockCode = e.target.value;
                            setDraft({ ...draft, drillingPriorities: arr });
                          }}
                          placeholder="کد بلوک"
                          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={dp.benchLevel}
                          onChange={e => {
                            const arr = [...(draft.drillingPriorities || [])];
                            arr[idx].benchLevel = Number(e.target.value);
                            setDraft({ ...draft, drillingPriorities: arr });
                          }}
                          placeholder="تراز پله"
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={dp.assignedDrillRig}
                          onChange={e => {
                            const arr = [...(draft.drillingPriorities || [])];
                            arr[idx].assignedDrillRig = e.target.value;
                            setDraft({ ...draft, drillingPriorities: arr });
                          }}
                          placeholder="دستگاه دریل"
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-cyan-300 text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={dp.targetDrillMeters}
                          onChange={e => {
                            const arr = [...(draft.drillingPriorities || [])];
                            arr[idx].targetDrillMeters = Number(e.target.value);
                            setDraft({ ...draft, drillingPriorities: arr });
                          }}
                          placeholder="متراژ هدف"
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={dp.specialInstructions || ''}
                          onChange={e => {
                            const arr = [...(draft.drillingPriorities || [])];
                            arr[idx].specialInstructions = e.target.value;
                            setDraft({ ...draft, drillingPriorities: arr });
                          }}
                          placeholder="دستورات خاص نظارت..."
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 text-[11px]"
                        />
                        <button
                          onClick={() => {
                            const arr = draft.drillingPriorities.filter((_, i) => i !== idx);
                            setDraft({ ...draft, drillingPriorities: arr });
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Loading Priorities Section */}
              <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-emerald-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>۲. اولویت‌بندی بارگیری و استخراج (بارگیری کدام بلوک در اولویت است)</span>
                  </h3>
                  <button
                    onClick={addLoadingItem}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن بلوک بارگیری</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {draft.loadingPriorities?.map((lp, idx) => (
                    <div key={lp.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs items-center">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                          {lp.priorityOrder}
                        </span>
                        <input
                          type="text"
                          value={lp.blockCode}
                          onChange={e => {
                            const arr = [...(draft.loadingPriorities || [])];
                            arr[idx].blockCode = e.target.value;
                            setDraft({ ...draft, loadingPriorities: arr });
                          }}
                          placeholder="کد بلوک"
                          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <select
                          value={lp.materialType}
                          onChange={e => {
                            const arr = [...(draft.loadingPriorities || [])];
                            arr[idx].materialType = e.target.value as any;
                            arr[idx].materialTypeFa = e.target.value === 'HIGH_GRADE_ORE' ? 'پرعیار' : e.target.value === 'LOW_GRADE_ORE' ? 'کم‌عیار' : 'باطله';
                            setDraft({ ...draft, loadingPriorities: arr });
                          }}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-emerald-300 text-xs"
                        >
                          <option value="HIGH_GRADE_ORE">سنگ‌آهن پرعیار</option>
                          <option value="LOW_GRADE_ORE">سنگ‌آهن کم‌عیار</option>
                          <option value="WASTE">باطله</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={lp.assignedLoadingUnit}
                          onChange={e => {
                            const arr = [...(draft.loadingPriorities || [])];
                            arr[idx].assignedLoadingUnit = e.target.value;
                            setDraft({ ...draft, loadingPriorities: arr });
                          }}
                          placeholder="شاول یا لودر"
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={lp.targetTonnage}
                          onChange={e => {
                            const arr = [...(draft.loadingPriorities || [])];
                            arr[idx].targetTonnage = Number(e.target.value);
                            setDraft({ ...draft, loadingPriorities: arr });
                          }}
                          placeholder="تناژ هدف"
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={lp.destination}
                          onChange={e => {
                            const arr = [...(draft.loadingPriorities || [])];
                            arr[idx].destination = e.target.value;
                            setDraft({ ...draft, loadingPriorities: arr });
                          }}
                          placeholder="مقصد تخلیه (سنگ‌شکن/دپو)"
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 text-xs"
                        />
                        <button
                          onClick={() => {
                            const arr = draft.loadingPriorities.filter((_, i) => i !== idx);
                            setDraft({ ...draft, loadingPriorities: arr });
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Active Fleet on Map (Including Hydraulic Breaker / Pikour) */}
              <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-3">
                <h3 className="text-xs font-black text-indigo-400 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>۳. ثبت ماشین‌آلات فعال روی نقشه (حفاری، بارگیری، پیکور، بلدوزر و تراک‌ها)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {draft.activePlacements?.map((eq, idx) => (
                    <div key={eq.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-cyan-400 font-bold">{eq.code} - {eq.nameFa}</span>
                        <span className="text-[10px] text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/20">{eq.categoryFa}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={eq.currentBench}
                          onChange={e => {
                            const arr = [...(draft.activePlacements || [])];
                            arr[idx].currentBench = e.target.value;
                            setDraft({ ...draft, activePlacements: arr });
                          }}
                          placeholder="پله روی نقشه"
                          className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white text-[11px]"
                        />
                        <input
                          type="text"
                          value={eq.operatorName}
                          onChange={e => {
                            const arr = [...(draft.activePlacements || [])];
                            arr[idx].operatorName = e.target.value;
                            setDraft({ ...draft, activePlacements: arr });
                          }}
                          placeholder="نام اپراتور"
                          className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white text-[11px]"
                        />
                      </div>
                      <input
                        type="text"
                        value={eq.shiftMission}
                        onChange={e => {
                          const arr = [...(draft.activePlacements || [])];
                          arr[idx].shiftMission = e.target.value;
                          setDraft({ ...draft, activePlacements: arr });
                        }}
                        placeholder="مأموریت در شیفت..."
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSaveMeetingPlan}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D2FF] to-indigo-600 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg cursor-pointer"
                >
                  ثبت رسمی مصوبات جلسه هماهنگی
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Post-Shift Realization Review */}
          {activeTab === 'REVIEW_REALIZATION' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed">
                <strong className="text-emerald-400 block mb-1">دستورالعمل رصد پایان شیفت: </strong>
                در پایان شیفت و قبل از تحویل به شیفت ورودی، نمایندگان کارفرما، نظارت و پیمانکار میزان محقق‌شدن هر یک از آیتم‌های حفاری، بارگیری، عملکرد پیکور و ماشین‌آلات را ارزیابی و ثبت می‌نمایند.
              </div>

              {/* 1. Review Drilling Achievement */}
              <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-cyan-400">رصد تحقق متراژ و چال‌های حفاری</h4>
                {draft.drillingPriorities?.map((dp, idx) => (
                  <div key={dp.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-white font-mono">بلوک {dp.blockCode} (هدف: {dp.targetDrillMeters} متر)</strong>
                      <span className="text-cyan-400 font-mono font-bold">
                        محقق‌شده: {dp.achievedDrillMeters || 0} متر ({Math.round(((dp.achievedDrillMeters || 0) / (dp.targetDrillMeters || 1)) * 100)}٪)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">متراژ محقق‌شده نهایی (متر):</label>
                        <input
                          type="number"
                          value={dp.achievedDrillMeters || 0}
                          onChange={e => {
                            const val = Number(e.target.value);
                            const arr = [...(draft.drillingPriorities || [])];
                            arr[idx].achievedDrillMeters = val;
                            arr[idx].fulfillmentPercent = Math.min(100, Math.round((val / (arr[idx].targetDrillMeters || 1)) * 100));
                            setDraft({ ...draft, drillingPriorities: arr });
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">توضیح دلایل انحراف یا موانع در صورت وجود:</label>
                        <input
                          type="text"
                          value={dp.deviationReason || ''}
                          onChange={e => {
                            const arr = [...(draft.drillingPriorities || [])];
                            arr[idx].deviationReason = e.target.value;
                            setDraft({ ...draft, drillingPriorities: arr });
                          }}
                          placeholder="مثلاً سختی غیرمنتظره سنگ یا نیاز به تعویض سرمته..."
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. Review Loading Achievement */}
              <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-emerald-400">رصد تحقق تناژ استخراج و بارگیری</h4>
                {draft.loadingPriorities?.map((lp, idx) => (
                  <div key={lp.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-white font-mono">بلوک {lp.blockCode} (هدف: {lp.targetTonnage.toLocaleString('fa-IR')} تن)</strong>
                      <span className="text-emerald-400 font-mono font-bold">
                        محقق‌شده: {lp.achievedTonnage ? lp.achievedTonnage.toLocaleString('fa-IR') : 0} تن ({Math.round(((lp.achievedTonnage || 0) / (lp.targetTonnage || 1)) * 100)}٪)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">تناژ محقق‌شده نهایی (باسکول/تخمینی):</label>
                        <input
                          type="number"
                          value={lp.achievedTonnage || 0}
                          onChange={e => {
                            const val = Number(e.target.value);
                            const arr = [...(draft.loadingPriorities || [])];
                            arr[idx].achievedTonnage = val;
                            arr[idx].fulfillmentPercent = Math.min(100, Math.round((val / (arr[idx].targetTonnage || 1)) * 100));
                            setDraft({ ...draft, loadingPriorities: arr });
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">توضیحات عملکرد بارگیری و تفکیک عیار:</label>
                        <input
                          type="text"
                          value={lp.deviationReason || ''}
                          onChange={e => {
                            const arr = [...(draft.loadingPriorities || [])];
                            arr[idx].deviationReason = e.target.value;
                            setDraft({ ...draft, loadingPriorities: arr });
                          }}
                          placeholder="توضیحات پیرامون توقف، ترافیک یا جداسازی باطله..."
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* End Shift Review Summary Note */}
              <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-2">
                <label className="block text-xs text-slate-300 font-bold">جمع‌بندی تحلیلی رصد مشترک ارکان در پایان شیفت:</label>
                <textarea
                  rows={3}
                  value={draft.endShiftReviewSummary}
                  onChange={e => setDraft({ ...draft, endShiftReviewSummary: e.target.value })}
                  placeholder="گزارش تحلیلی وضعیت تحقق اهداف و نکات مهم جهت اطلاع سرپرست شیفت بعد..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSaveRealizationReview}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg cursor-pointer"
                >
                  ثبت نهایی رصد پایان شیفت
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Tripartite Digital Signatures */}
          {activeTab === 'SIGN_TRIPARTITE' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs text-slate-200 leading-relaxed">
                <strong className="text-purple-400 block mb-1">امضای الکترونیک ارکان سه‌گانه پروژه: </strong>
                جهت رسمیت یافتن پروتکل شیفت، ثبت امضای دیجیتال هر سه نماینده (کارفرما، دستگاه نظارت و پیمانکار) الزامی است. پس از تکمیل امضاها، سند برای مدیران و سرپرستان ارشد ابلاغ و ثبت نهایی می‌گردد.
              </div>

              {/* Signature Form */}
              <div className="p-5 rounded-2xl bg-[#091124] border border-slate-800 space-y-4">
                <h4 className="text-xs font-black text-white flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-purple-400" />
                  <span>ثبت امضا به نمایندگی از یکی از ارکان سه‌گانه:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-bold">سمت و رکن امضاکننده:</label>
                    <select
                      value={signerRole}
                      onChange={e => {
                        const r = e.target.value as any;
                        setSignerRole(r);
                        if (r === 'CLIENT') {
                          setSignerName('مهندس محمودی');
                          setSignerOrg('شرکت کارفرما (ناظر عالیه معدن)');
                        } else if (r === 'SUPERVISION') {
                          setSignerName('مهندس حسینی');
                          setSignerOrg('دستگاه نظارت مهندسین مشاور فراکاوش');
                        } else {
                          setSignerName(currentUser?.fullName || 'مهندس اکبری');
                          setSignerOrg('شرکت پیمانکاری کوهساران البرز');
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="CLIENT">۱. نماینده کارفرما (Client)</option>
                      <option value="SUPERVISION">۲. دستگاه نظارت مشاور (Supervision)</option>
                      <option value="CONTRACTOR">۳. پیمانکار استخراج (Contractor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-bold">نام و نام خانوادگی نماینده:</label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={e => setSignerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-bold">سازمان / شرکت:</label>
                    <input
                      type="text"
                      value={signerOrg}
                      onChange={e => setSignerOrg(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">توضیحات و یادداشت تاییدیه:</label>
                  <input
                    type="text"
                    value={signerComment}
                    onChange={e => setSignerComment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={handleSignTripartite}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>ثبت امضای دیجیتال و صدور هش SHA-256</span>
                  </button>
                </div>
              </div>

              {/* Status of 3 Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  draft.tripartiteSignatures?.clientSignature?.signed
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">امضای کارفرما</span>
                    {draft.tripartiteSignatures?.clientSignature?.signed && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="font-mono text-white text-xs">{draft.tripartiteSignatures?.clientSignature?.name || 'در انتظار امضا'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{draft.tripartiteSignatures?.clientSignature?.digitalFingerprint}</p>
                </div>

                <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  draft.tripartiteSignatures?.supervisionSignature?.signed
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">امضای دستگاه نظارت</span>
                    {draft.tripartiteSignatures?.supervisionSignature?.signed && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="font-mono text-white text-xs">{draft.tripartiteSignatures?.supervisionSignature?.name || 'در انتظار امضا'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{draft.tripartiteSignatures?.supervisionSignature?.digitalFingerprint}</p>
                </div>

                <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  draft.tripartiteSignatures?.contractorSignature?.signed
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">امضای پیمانکار</span>
                    {draft.tripartiteSignatures?.contractorSignature?.signed && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="font-mono text-white text-xs">{draft.tripartiteSignatures?.contractorSignature?.name || 'در انتظار امضا'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{draft.tripartiteSignatures?.contractorSignature?.digitalFingerprint}</p>
                </div>
              </div>

              {/* Incoming Shift Supervisor Handover Section */}
              <div className="p-4 rounded-2xl bg-[#091124] border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-white">تاییدیه و تحویل نهایی توسط سرپرست شیفت ورودی (Incoming Handover Ack):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">نام سرپرست شیفت ورودی:</label>
                    <input
                      type="text"
                      value={incomingName}
                      onChange={e => setIncomingName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">ملاحظات تحویل گرفتن پله‌ها و تجهیزات:</label>
                    <input
                      type="text"
                      value={incomingNotes}
                      onChange={e => setIncomingNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={handleAcknowledgeIncoming}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg cursor-pointer"
                  >
                    تایید رسمی تحویل‌گیرنده و بایگانی شیفت
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Printable Official Report */}
          {activeTab === 'PRINT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">پیش‌نمایش سند رسمی جهت چاپ یا ارجاع به بایگانی مهندسی</span>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#00D2FF] hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپگر / ذخیره PDF</span>
                </button>
              </div>

              {/* Print Document Paper Simulation */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white text-slate-900 shadow-xl space-y-6 text-xs print:p-0 print:shadow-none" dir="rtl">
                {/* Official Letterhead */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h1 className="text-base font-black text-slate-900">صورت‌جلسه رسمی و پروتکل هوشمند تحویل و تحول شیفت معدن</h1>
                    <p className="text-[11px] text-slate-600">مجتمع معدنی و سنگ‌آهن گل‌گهر (پیت مرکزی شماره ۳)</p>
                  </div>
                  <div className="text-left font-mono text-[11px] space-y-0.5 text-slate-700">
                    <p>شماره سند: <strong>{draft.handoverCode}</strong></p>
                    <p>تاریخ: {draft.shiftDateJalali}</p>
                    <p>شیفت: {draft.shiftTitleFa}</p>
                  </div>
                </div>

                {/* Meeting metadata strip */}
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 text-[11px] space-y-1">
                  <p><strong>مکان جلسه هماهنگی: </strong>{draft.meetingLocation} | <strong>زمان جلسه: </strong>{draft.meetingTime}</p>
                  <p><strong>نمایندگان حاضر: </strong>{draft.tripartiteReps?.map(r => `${r.roleTitleFa}: ${r.personName} (${r.organizationName})`).join(' | ')}</p>
                </div>

                {/* Summary Table 1: Drilling Priorities */}
                <div className="space-y-1.5">
                  <h3 className="font-black text-slate-900 text-xs">۱. اولویت‌های حفاری بلوک‌ها و رصد تحقق پایان شیفت</h3>
                  <table className="w-full border-collapse border border-slate-300 text-[10px] text-center">
                    <thead className="bg-slate-200 text-slate-800">
                      <tr>
                        <th className="border border-slate-300 p-1">اولویت</th>
                        <th className="border border-slate-300 p-1">بلوک و تراز</th>
                        <th className="border border-slate-300 p-1">سازند / سنگ</th>
                        <th className="border border-slate-300 p-1">دستگاه دریل</th>
                        <th className="border border-slate-300 p-1">متراژ هدف</th>
                        <th className="border border-slate-300 p-1">متراژ محقق‌شده</th>
                        <th className="border border-slate-300 p-1">درصد تحقق</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draft.drillingPriorities?.map(dp => (
                        <tr key={dp.id} className="border-b border-slate-200">
                          <td className="border border-slate-300 p-1 font-bold">{dp.priorityOrder}</td>
                          <td className="border border-slate-300 p-1 font-mono">{dp.blockCode} (پله {dp.benchLevel})</td>
                          <td className="border border-slate-300 p-1">{dp.rockTypeFa}</td>
                          <td className="border border-slate-300 p-1">{dp.assignedDrillRig}</td>
                          <td className="border border-slate-300 p-1 font-mono">{dp.targetDrillMeters} م</td>
                          <td className="border border-slate-300 p-1 font-mono font-bold text-emerald-800">{dp.achievedDrillMeters || 0} م</td>
                          <td className="border border-slate-300 p-1 font-mono font-bold">{dp.fulfillmentPercent || 0}٪</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Table 2: Loading Priorities */}
                <div className="space-y-1.5">
                  <h3 className="font-black text-slate-900 text-xs">۲. اولویت‌های بارگیری و استخراج و رصد تحقق تناژ</h3>
                  <table className="w-full border-collapse border border-slate-300 text-[10px] text-center">
                    <thead className="bg-slate-200 text-slate-800">
                      <tr>
                        <th className="border border-slate-300 p-1">اولویت</th>
                        <th className="border border-slate-300 p-1">بلوک و تراز</th>
                        <th className="border border-slate-300 p-1">نوع ماده</th>
                        <th className="border border-slate-300 p-1">دستگاه بارگیری</th>
                        <th className="border border-slate-300 p-1">مقصد</th>
                        <th className="border border-slate-300 p-1">تناژ هدف</th>
                        <th className="border border-slate-300 p-1">تناژ محقق‌شده</th>
                        <th className="border border-slate-300 p-1">درصد تحقق</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draft.loadingPriorities?.map(lp => (
                        <tr key={lp.id} className="border-b border-slate-200">
                          <td className="border border-slate-300 p-1 font-bold">{lp.priorityOrder}</td>
                          <td className="border border-slate-300 p-1 font-mono">{lp.blockCode} ({lp.benchLevel})</td>
                          <td className="border border-slate-300 p-1">{lp.materialTypeFa}</td>
                          <td className="border border-slate-300 p-1">{lp.assignedLoadingUnit}</td>
                          <td className="border border-slate-300 p-1">{lp.destination}</td>
                          <td className="border border-slate-300 p-1 font-mono">{lp.targetTonnage.toLocaleString('fa-IR')}</td>
                          <td className="border border-slate-300 p-1 font-mono font-bold text-emerald-800">{lp.achievedTonnage?.toLocaleString('fa-IR')}</td>
                          <td className="border border-slate-300 p-1 font-mono font-bold">{lp.fulfillmentPercent || 0}٪</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 3 Pillars Formal Signatures Box */}
                <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 border border-slate-300 rounded-xl space-y-1">
                    <span className="font-bold block text-slate-700">نماینده کارفرما</span>
                    <p className="font-bold text-slate-900">{draft.tripartiteSignatures?.clientSignature?.name || 'مهندس محمودی'}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{draft.tripartiteSignatures?.clientSignature?.digitalFingerprint || 'امضا ثبت شد'}</p>
                  </div>

                  <div className="p-3 border border-slate-300 rounded-xl space-y-1">
                    <span className="font-bold block text-slate-700">دستگاه نظارت (مهندسین مشاور)</span>
                    <p className="font-bold text-slate-900">{draft.tripartiteSignatures?.supervisionSignature?.name || 'مهندس حسینی'}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{draft.tripartiteSignatures?.supervisionSignature?.digitalFingerprint || 'امضا ثبت شد'}</p>
                  </div>

                  <div className="p-3 border border-slate-300 rounded-xl space-y-1">
                    <span className="font-bold block text-slate-700">پیمانکار استخراج و باربری</span>
                    <p className="font-bold text-slate-900">{draft.tripartiteSignatures?.contractorSignature?.name || 'مهندس اکبری'}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{draft.tripartiteSignatures?.contractorSignature?.digitalFingerprint || 'امضا ثبت شد'}</p>
                  </div>
                </div>

                <p className="text-[9px] text-slate-400 text-center">
                  این سند طبق پروتکل هوشمند مدیریت معدن AES با حضور ارکان سه‌گانه و کد رهگیری دیجیتال صادر گردیده است.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
