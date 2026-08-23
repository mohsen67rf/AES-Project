// src/modules/mine/presentation/components/BlockApprovalModal.tsx

import { useState } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { XMarkIcon, CheckIcon, XCircleIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface BlockApprovalModalProps {
  isOpen: boolean;
  blockCode: string;
  blockData: any;
  onApprove: (notes?: string) => void;
  onReject: (reason: string, notes: string, geoData?: any) => void;
  onClose: () => void;
  isDark: boolean;
}

export function BlockApprovalModal({
  isOpen,
  blockCode,
  blockData,
  onApprove,
  onReject,
  onClose,
  isDark,
}: BlockApprovalModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [drawOnMap, setDrawOnMap] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);

  if (!isOpen) return null;

  const reasons = [
    'مشکل در پارامترهای حفاری',
    'نقشه ناقص یا اشتباه',
    'چال‌های خارج از طرح',
    'تداخل با سایر بلوک‌ها',
    'مشکل در مختصات',
    'سایر موارد',
  ];

  const handleConfirm = () => {
    if (action === 'approve') {
      onApprove(notes);
    } else if (action === 'reject') {
      if (!reason) {
        alert('لطفاً دلیل رد را انتخاب کنید');
        return;
      }
      onReject(reason, notes, geoData);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border ${
            isDark ? 'bg-[#0A1628] border-[#AACCDD]/20' : 'bg-white border-gray-200/50'
          }`}>
            
            {/* هدر */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-[#C9A227]/20' : 'bg-[#C9A227]/10'
                }`}>
                  <MapPinIcon className={`w-4 h-4 ${isDark ? 'text-[#C9A227]' : 'text-[#C9A227]'}`} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    تأیید بلوک {blockCode}
                  </h3>
                  <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                    دفتر فنی نظارت
                  </p>
                </div>
              </div>
              <button onClick={onClose} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
                isDark ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
              }`}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* محتوا */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* انتخاب اقدام */}
              <div className="flex gap-3">
                <button
                  onClick={() => setAction('approve')}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    action === 'approve'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : isDark
                        ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <CheckIcon className="w-5 h-5 mx-auto mb-1" />
                  تأیید
                </button>
                <button
                  onClick={() => setAction('reject')}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    action === 'reject'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : isDark
                        ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <XCircleIcon className="w-5 h-5 mx-auto mb-1" />
                  رد
                </button>
              </div>

              {/* توضیحات */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>
                  یادداشت
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="توضیحات تکمیلی..."
                  rows={3}
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none resize-none ${
                    isDark 
                      ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white placeholder-[#4A6A8A] focus:border-[#00D4FF]/50' 
                      : 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#C9A227]/50'
                  }`}
                />
              </div>

              {/* دلیل رد (فقط در حالت رد) */}
              {action === 'reject' && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>
                    دلیل رد *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none ${
                      isDark 
                        ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white focus:border-[#00D4FF]/50' 
                        : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#C9A227]/50'
                    }`}
                  >
                    <option value="">انتخاب دلیل...</option>
                    {reasons.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* گزینه ترسیم روی نقشه */}
              {action === 'reject' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="drawOnMap"
                    checked={drawOnMap}
                    onChange={(e) => setDrawOnMap(e.target.checked)}
                    className="w-4 h-4 rounded border-[#AACCDD]/20 text-[#C9A227] focus:ring-[#C9A227]/30"
                  />
                  <label htmlFor="drawOnMap" className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>
                    ترسیم روی نقشه (نقاط مشکل‌دار)
                  </label>
                </div>
              )}

              {drawOnMap && (
                <div className={`p-4 rounded-xl text-center border-2 border-dashed ${
                  isDark ? 'border-[#AACCDD]/20 bg-[#0A1628]' : 'border-gray-300 bg-gray-50'
                }`}>
                  <p className={`text-sm ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
                    🗺️ روی نقشه کلیک کنید تا نقاط مشکل‌دار را مشخص کنید
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                    (پس از مشخص کردن، نقشه بسته می‌شود)
                  </p>
                </div>
              )}
            </div>

            {/* فوتر */}
            <div className={`px-6 py-4 border-t flex gap-3 ${
              isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'
            }`}>
              <button
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                انصراف
              </button>
              <button
                onClick={handleConfirm}
                disabled={!action || (action === 'reject' && !reason)}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  action === 'approve'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : action === 'reject'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : isDark
                        ? 'bg-white/5 text-[#8A9DB0]'
                        : 'bg-gray-200 text-gray-400'
                } disabled:opacity-50`}
              >
                {action === 'approve' ? 'تأیید بلوک' : action === 'reject' ? 'رد بلوک' : 'انتخاب اقدام'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}