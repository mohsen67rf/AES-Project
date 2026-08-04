// src/modules/mine/presentation/components/DailyDrillingForm.tsx

import { useState } from 'react';
import { CalendarIcon, UserIcon, ClipboardIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DailyDrillingFormProps {
  blockId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function DailyDrillingForm({ blockId, onSuccess, onClose }: DailyDrillingFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING');
  const [operator, setOperator] = useState('');
  const [meterage, setMeterage] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!operator.trim() || !meterage) {
      alert('لطفاً نام اپراتور و متراژ را وارد کنید');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0A1628] border border-[#AACCDD]/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">ثبت پیشرفت روزانه حفاری</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-[#8A9DB0] hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">تاریخ</label>
            <div className="relative">
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A6A8A]" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-lg text-white focus:outline-none focus:border-[#AACCDD]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">شیفت</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as 'MORNING' | 'EVENING' | 'NIGHT')}
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-lg text-white focus:outline-none focus:border-[#AACCDD]/30"
            >
              <option value="MORNING">صبح</option>
              <option value="EVENING">عصر</option>
              <option value="NIGHT">شب</option>
            </select>
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">اپراتور</label>
            <div className="relative">
              <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A6A8A]" />
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="نام اپراتور"
                className="w-full pr-10 pl-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-lg text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">متراژ حفاری امروز (متر)</label>
            <input
              type="number"
              value={meterage}
              onChange={(e) => setMeterage(e.target.value)}
              placeholder="مثال: 15.5"
              step="0.1"
              className="w-full px-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-lg text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30"
            />
          </div>

          <div>
            <label className="block text-[#8A9DB0] text-sm mb-1">توضیحات</label>
            <div className="relative">
              <ClipboardIcon className="absolute right-3 top-3 w-4 h-4 text-[#4A6A8A]" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ریزش، انحراف، شرایط زمین و..."
                rows={3}
                className="w-full pr-10 pl-4 py-2 bg-[#0A1628] border border-[#AACCDD]/10 rounded-lg text-white placeholder-[#4A6A8A] focus:outline-none focus:border-[#AACCDD]/30 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2.5 bg-[#AACCDD] text-[#1A2A3A] font-semibold rounded-lg hover:bg-[#8A9DB0] transition-colors disabled:opacity-50"
            >
              {loading ? 'در حال ثبت...' : 'ثبت پیشرفت'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}