// src/modules/mine/presentation/components/MonthlyBands/MonthlyBandsTab.tsx

import React, { useState, useEffect } from 'react';
import { 
  FolderPlusIcon, 
  CheckBadgeIcon, 
  XCircleIcon, 
  MapIcon, 
  DocumentArrowUpIcon,
  SparklesIcon,
  ArrowsPointingOutIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { MonthlyBandRepository } from '../../../../../core/infrastructure/repositories';
import { MonthlyBandService } from '../../../services/MonthlyBandService';
import type { MonthlyBand, StakeholderRole } from '../../../../../core/domain/types/mine.types';

interface MonthlyBandsTabProps {
  stakeholderRole?: StakeholderRole;
  onSelectBand?: (band: MonthlyBand) => void;
}

export function MonthlyBandsTab({ stakeholderRole = 'ALL', onSelectBand }: MonthlyBandsTabProps) {
  const [bands, setBands] = useState<MonthlyBand[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBand, setSelectedBand] = useState<MonthlyBand | null>(null);

  // فرم ایجاد باند جدید توسط نظارت
  const [newCode, setNewCode] = useState('BAND-1405-04-B50');
  const [newTitle, setNewTitle] = useState('باند استخراجی پله ۱۰۶۰ - زون غربی');
  const [newMonth, setNewMonth] = useState('تیر ۱۴۰۵');
  const [newBenchLevel, setNewBenchLevel] = useState(1060);
  const [newVolumeM3, setNewVolumeM3] = useState(38000);
  const [newTonnageOre, setNewTonnageOre] = useState(72000);
  const [newTonnageWaste, setNewTonnageWaste] = useState(25000);
  const [newRockType, setNewRockType] = useState('مگنتیت پرعیار و شیلی');
  const [newEstimatedFe, setNewEstimatedFe] = useState(57.2);
  const [newNotes, setNewNotes] = useState('');

  const loadBands = () => {
    setBands(MonthlyBandService.getAllBands());
  };

  useEffect(() => {
    loadBands();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    MonthlyBandService.createMonthlyBand({
      mineId: 'mine-001',
      code: newCode,
      title: newTitle,
      month: newMonth,
      year: 1405,
      benchLevel: Number(newBenchLevel),
      volumeM3: Number(newVolumeM3),
      tonnageOre: Number(newTonnageOre),
      tonnageWaste: Number(newTonnageWaste),
      primaryRockType: newRockType,
      estimatedFe: Number(newEstimatedFe),
      supervisionEngineer: 'دکتر علوی (دفتر فنی نظارت)',
      notes: newNotes,
    });
    setIsCreateOpen(false);
    loadBands();
  };

  const handleApprove = (bandId: string) => {
    MonthlyBandService.approveBandByClient(
      bandId,
      'مهندس حسینی (مدیریت کارفرما)',
      'بررسی احجام و تناژ مصوب شد؛ جهت طراحی شبکه حفاری به پیمانکار ابلاغ گردد.'
    );
    loadBands();
  };

  const handleReject = (bandId: string) => {
    const reason = prompt('لطفاً دلیل درخواست اصلاح باند را وارد کنید:', 'نیاز به بازنگری نسبت باطله‌برداری در تراز اعلامی');
    if (reason) {
      MonthlyBandService.rejectOrReviseBand(bandId, 'مهندس حسینی (کارفرما)', reason);
      loadBands();
    }
  };

  return (
    <div className="space-y-6">
      {/* سربرگ ماژول */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              مرحله ۱ و ۲ چرخه کاری
            </span>
            <h3 className="text-lg font-bold text-white">باندهای طراحی ماهانه (Monthly Mining Bands)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ثبت باندهای استخراجی توسط واحد نظارت، تفکیک جنس سنگ و احجام، و گردش کار تأیید و اشتراک با کارفرما و پیمانکار استخراج
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadBands}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="بروزرسانی"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>

          {(stakeholderRole === 'ALL' || stakeholderRole === 'SUPERVISION') && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all duration-200"
            >
              <FolderPlusIcon className="w-4 h-4" />
              <span>ثبت باند جدید (واحد نظارت)</span>
            </button>
          )}
        </div>
      </div>

      {/* لیست باندهای ماهانه */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bands.map((band) => {
          const isApproved = band.status === 'APPROVED_BY_CLIENT';
          const isPending = band.status === 'SUBMITTED_BY_SUPERVISION';
          const isRejected = band.status === 'REJECTED';

          return (
            <div
              key={band.id}
              className={`p-5 rounded-2xl bg-slate-900/90 border transition-all duration-300 hover:shadow-xl ${
                isApproved 
                  ? 'border-emerald-500/30 hover:border-emerald-500/60' 
                  : isPending 
                  ? 'border-amber-500/30 hover:border-amber-500/60' 
                  : 'border-rose-500/30 hover:border-rose-500/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-800/50">
                      {band.code}
                    </span>
                    <span className="text-xs text-slate-400">{band.month}</span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1.5">{band.title}</h4>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  isApproved 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : isPending 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {isApproved ? 'تأیید شده کارفرما' : isPending ? 'در انتظار تأیید کارفرما' : 'نیازمند اصلاح'}
                </span>
              </div>

              {/* متریک‌های باند */}
              <div className="grid grid-cols-3 gap-2.5 mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                <div>
                  <div className="text-[10px] text-slate-500">تراز پله</div>
                  <div className="text-sm font-bold text-white font-mono">{band.benchLevel} m</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">تناژ کانسنگ</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">{band.tonnageOre.toLocaleString()} t</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">تناژ باطله</div>
                  <div className="text-sm font-bold text-amber-400 font-mono">{band.tonnageWaste.toLocaleString()} t</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-300">
                <div className="flex items-center gap-1 text-slate-400">
                  <span>جنس سنگ:</span>
                  <span className="text-slate-200 font-medium truncate">{band.primaryRockType}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <span>عیار تخمینی Fe:</span>
                  <span className="text-cyan-300 font-bold font-mono">{band.estimatedFe}%</span>
                </div>
              </div>

              {band.notes && (
                <p className="text-[11px] text-slate-400 mt-3 p-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  {band.notes}
                </p>
              )}

              {/* بخش اکشن‌ها برای کارفرما / نظارت / پیمانکار */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800">
                <div className="text-[10px] text-slate-500">
                  ثبت‌کننده: {band.supervisionEngineer}
                </div>

                <div className="flex items-center gap-2">
                  {isPending && (stakeholderRole === 'ALL' || stakeholderRole === 'CLIENT') && (
                    <>
                      <button
                        onClick={() => handleReject(band.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-colors"
                      >
                        درخواست اصلاح
                      </button>
                      <button
                        onClick={() => handleApprove(band.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-colors"
                      >
                        <CheckBadgeIcon className="w-3.5 h-3.5" />
                        <span>تأیید و ابلاغ کارفرما</span>
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckBadgeIcon className="w-4 h-4" />
                      <span>ابلاغ شده به پیمانکار استخراج</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* مودال ثبت باند جدید توسط واحد نظارت */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlusIcon className="w-6 h-6 text-cyan-400" />
                <h3 className="text-base font-bold text-white">ثبت باند استخراجی ماهانه (واحد نظارت)</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">کد شناسایی باند:</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ماه استخراجی:</label>
                  <input
                    type="text"
                    value={newMonth}
                    onChange={(e) => setNewMonth(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">عنوان / موقعیت باند در پیت:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">تراز پله (متر):</label>
                  <input
                    type="number"
                    value={newBenchLevel}
                    onChange={(e) => setNewBenchLevel(Number(e.target.value))}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">حجم کل (متر مکعب):</label>
                  <input
                    type="number"
                    value={newVolumeM3}
                    onChange={(e) => setNewVolumeM3(Number(e.target.value))}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">عیار تخمینی Fe (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newEstimatedFe}
                    onChange={(e) => setNewEstimatedFe(Number(e.target.value))}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">تناژ تخمینی کانسنگ (تن):</label>
                  <input
                    type="number"
                    value={newTonnageOre}
                    onChange={(e) => setNewTonnageOre(Number(e.target.value))}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-emerald-400 font-mono focus:border-cyan-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">تناژ تخمینی باطله (تن):</label>
                  <input
                    type="number"
                    value={newTonnageWaste}
                    onChange={(e) => setNewTonnageWaste(Number(e.target.value))}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-amber-400 font-mono focus:border-cyan-500 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">جنس سنگ و تیپ کانی‌سازی:</label>
                <input
                  type="text"
                  value={newRockType}
                  onChange={(e) => setNewRockType(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">توضیحات و الزامات فنی نظارت:</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-500 outline-none"
                  placeholder="نکات مربوط به شیب پله، ایمنی و هدایت جریان آب..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20"
                >
                  ثبت و ارجاع به کارفرما
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
