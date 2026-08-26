// src/modules/mine/presentation/components/DailyDrillingForm.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface DailyDrillingFormProps {
  blockId: string;
  onSuccess: (data: any) => void;
  onClose: () => void;
}

export const DailyDrillingForm: React.FC<DailyDrillingFormProps> = ({
  blockId,
  onSuccess,
  onClose,
}) => {
  const { isDark } = useTheme();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'روز' | 'شب'>('روز');
  const [operator, setOperator] = useState('');
  const [rigNumber, setRigNumber] = useState('RIG-01');
  const [completedHoles, setCompletedHoles] = useState<number>(4);
  const [drilledMeterage, setDrilledMeterage] = useState<number>(48);
  const [collapsedHoles, setCollapsedHoles] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      blockId,
      date,
      shift,
      operator: operator || 'اپراتور دستگاه حفاری',
      rigNumber,
      completedHoles: Number(completedHoles),
      drilledMeterage: Number(drilledMeterage),
      collapsedHoles: Number(collapsedHoles),
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
          isDark ? 'bg-[#13233C] border-[#2A3A5A] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#2A3A5A]/30">
          <h3 className="font-black text-base">ثبت گزارش پیشرفت روزانه حفاری</h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8A9DB0] mb-1">تاریخ عملیات</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
            <div>
              <label className="block text-[#8A9DB0] mb-1">شیفت کاری</label>
              <select
                value={shift}
                onChange={(e: any) => setShift(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="روز">شیفت روز</option>
                <option value="شب">شیفت شب</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8A9DB0] mb-1">دستگاه حفاری (Rig)</label>
              <input
                type="text"
                value={rigNumber}
                onChange={(e) => setRigNumber(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
            <div>
              <label className="block text-[#8A9DB0] mb-1">اپراتور حفار</label>
              <input
                type="text"
                value={operator}
                placeholder="نام اپراتور"
                onChange={(e) => setOperator(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#8A9DB0] mb-1">چال‌های تکمیل</label>
              <input
                type="number"
                value={completedHoles}
                onChange={(e) => setCompletedHoles(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
            <div>
              <label className="block text-[#8A9DB0] mb-1">متراژ کل (m)</label>
              <input
                type="number"
                step="0.5"
                value={drilledMeterage}
                onChange={(e) => setDrilledMeterage(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
            <div>
              <label className="block text-[#8A9DB0] mb-1">چال‌های ریزشی</label>
              <input
                type="number"
                value={collapsedHoles}
                onChange={(e) => setCollapsedHoles(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8A9DB0] mb-1">توضیحات و گزارش شیفت</label>
            <textarea
              rows={2}
              value={notes}
              placeholder="نکات فنی، وضعیت مته و راد، سختی سنگ..."
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none resize-none ${
                isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-white' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A3A5A]/30">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl border font-bold transition-colors ${
                isDark ? 'border-[#2A3A5A] text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-700'
              }`}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-white font-bold shadow-md shadow-[#00D4FF]/20 flex items-center gap-1.5"
            >
              <CheckIcon className="w-4 h-4" />
              <span>ثبت گزارش</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyDrillingForm;
