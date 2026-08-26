// src/modules/mine/presentation/components/BlockApprovalModal.tsx

import React, { useState } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { FullBlock } from '../../../../core/domain/types/block.types';

interface BlockApprovalModalProps {
  isOpen: boolean;
  block: FullBlock | null;
  onClose: () => void;
  onApprove: (notes?: string) => void;
  onReject: (reason: string, notes: string, geoData?: any) => void;
}

export const BlockApprovalModal: React.FC<BlockApprovalModalProps> = ({
  isOpen,
  block,
  onClose,
  onApprove,
  onReject,
}) => {
  const { isDark } = useTheme();
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reason, setReason] = useState('خطای هندسه چال‌ها');
  const [notes, setNotes] = useState('');

  if (!isOpen || !block) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (decision === 'APPROVE') {
      onApprove(notes);
    } else {
      onReject(reason, notes);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
          isDark ? 'bg-[#13233C] border-[#2A3A5A] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#2A3A5A]/30">
          <div>
            <h3 className="font-black text-base">تأیید / رد طرح بلوک استخراجی</h3>
            <p className="text-xs text-[#8A9DB0] mt-0.5">بلوک {block.code} - تراز {block.targetLevel}m</p>
          </div>
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
          <div>
            <label className="block text-[#8A9DB0] mb-2 font-bold">تصمیم واحد نظارت و مهندسی معدن:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('APPROVE')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  decision === 'APPROVE'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/30'
                    : isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>تأیید بلوک و صدور مجوز</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECT')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  decision === 'REJECT'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 ring-2 ring-rose-500/30'
                    : isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <XCircleIcon className="w-5 h-5" />
                <span>رد طرح و ارجاع به اصلاح</span>
              </button>
            </div>
          </div>

          {decision === 'REJECT' && (
            <div>
              <label className="block text-[#8A9DB0] mb-1 font-bold">علت رد طرح:</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none ${
                  isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="تداخل با دیواره نهایی و شیب پله">تداخل با دیواره نهایی و شیب پله</option>
                <option value="خطای هندسه چال‌ها و شبکه بار سنگ">خطای هندسه چال‌ها و شبکه بار سنگ</option>
                <option value="عدم رعایت ایمنی ترانشه مجاور">عدم رعایت ایمنی ترانشه مجاور</option>
                <option value="نیاز به بازنگری داده‌های زمین‌شناسی">نیاز به بازنگری داده‌های زمین‌شناسی</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[#8A9DB0] mb-1 font-bold">توضیحات و دستورالعمل نظارت:</label>
            <textarea
              rows={3}
              value={notes}
              placeholder="دستورات ابلاغی به دفتر فنی پیمانکار..."
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
              className={`px-5 py-2 rounded-xl font-bold transition-all shadow-md ${
                decision === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
              }`}
            >
              ثبت تصمیم نظارت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlockApprovalModal;
