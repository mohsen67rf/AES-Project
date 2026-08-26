// src/modules/dashboard/presentation/components/ActivityAuditTrail/ManualNoteModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PencilSquareIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { ActivityLogger } from '../../../../../core/services/ActivityLogger';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import type { ActivitySeverity } from '../../../../../core/domain/types/activity.types';

interface ManualNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ManualNoteModal: React.FC<ManualNoteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isDark } = useTheme();
  const [note, setNote] = useState('');
  const [severity, setSeverity] = useState<ActivitySeverity>('INFO');
  const [shift, setShift] = useState('روزکار (Morning Shift)');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setLoading(true);
    try {
      const formattedText = `[شیفت: ${shift}] ${note.trim()}`;
      ActivityLogger.logManualNote(formattedText, undefined, severity);
      setNote('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to log manual note:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden z-10 ${
            isDark 
              ? 'bg-[#0F1B2E] border-[#2A3A5A] text-white' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-[#2A3A5A] bg-[#13233C]' : 'border-slate-100 bg-slate-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/20">
                <PencilSquareIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold">ثبت رویداد و یادداشت نظارتی شیفت</h3>
                <p className="text-xs text-[#8A9DB0]">ثبت گزارش دستی در زنجیره ممیزی امن سامانه</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
              }`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-[#8A9DB0] mb-1.5">
                شیفت کاری و نوع گزارش
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/40 ${
                  isDark 
                    ? 'bg-[#13233C] border-[#2A3A5A] text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="شیفت روزکار (Morning Shift)">شیفت صبح (Day Shift - ۰۶:۰۰ تا ۱۴:۰۰)</option>
                <option value="شیفت عصرکار (Evening Shift)">شیفت عصر (Evening Shift - ۱۴:۰۰ تا ۲۲:۰۰)</option>
                <option value="شیفت شب‌کار (Night Shift)">شیفت شب (Night Shift - ۲۲:۰۰ تا ۰۶:۰۰)</option>
                <option value="بازرسی دوره‌ای HSE">بازرسی دوره‌ای واحد ایمنی و بهداشت (HSE)</option>
                <option value="ممیزی سرپرست استخراج">ممیزی سرپرست استخراج و فنی معدن</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8A9DB0] mb-1.5">
                سطح اهمیت و حساسیت رویداد
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSeverity('INFO')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    severity === 'INFO'
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-sm'
                      : isDark ? 'bg-[#13233C] border-[#2A3A5A] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <InformationCircleIcon className="w-4 h-4" />
                  اطلاعاتی (Info)
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('SUCCESS')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    severity === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                      : isDark ? 'bg-[#13233C] border-[#2A3A5A] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  موفقیت (Success)
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('WARNING')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    severity === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                      : isDark ? 'bg-[#13233C] border-[#2A3A5A] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  هشدار (Warning)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8A9DB0] mb-1.5">
                شرح وقایع و اقدامات صورت گرفته *
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="توضیحات مربوط به پیشرفت شیفت، وضعیت بازرسی پله‌های استخراج، بازبینی تجهیزات بارگیری یا نکات زمین‌شناسی..."
                rows={4}
                required
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/40 ${
                  isDark 
                    ? 'bg-[#13233C] border-[#2A3A5A] text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              isDark ? 'bg-[#16253E] border-[#2A3A5A] text-[#8A9DB0]' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              <InformationCircleIcon className="w-4 h-4 text-[#00D4FF] flex-shrink-0" />
              <span>این یادداشت بلافاصله با هویت کاربر جاری به لاگ‌های ممیزی داشبورد الصاق خواهد شد.</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading || !note.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-white hover:shadow-lg hover:shadow-[#00D4FF]/30 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'در حال ثبت...' : 'ثبت رسمی در لاگ ممیزی'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
