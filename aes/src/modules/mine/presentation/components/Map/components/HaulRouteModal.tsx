// src/modules/mine/presentation/components/Map/components/HaulRouteModal.tsx

import { useState, useEffect } from 'react';
import { useTheme } from '../../../../../../shared/context/ThemeContext';
import { SubBlock } from '../../../../../../core/domain/types/mine.types';
import { SubBlockRepository } from '../../../../../../core/infrastructure/repositories';
import { 
  XMarkIcon, 
  CheckIcon,
  TruckIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface HaulRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (subBlockId: string, destination: string) => void;
  distance: number;
  pointsCount: number;
}

export function HaulRouteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  distance, 
  pointsCount 
}: HaulRouteModalProps) {
  const { isDark } = useTheme();
  const [subBlocks, setSubBlocks] = useState<SubBlock[]>([]);
  const [selectedSubBlockId, setSelectedSubBlockId] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);

  const destinations = [
    { value: 'HIGH_GRADE_STOCKPILE', label: 'دپوی پرعیار' },
    { value: 'MEDIUM_GRADE_STOCKPILE', label: 'دپوی عیار متوسط' },
    { value: 'LOW_GRADE_STOCKPILE', label: 'دپوی کم‌عیار' },
    { value: 'CRUSHER_FEED', label: 'خوراک کارخانه' },
    { value: 'WASTE_DUMP_ROCK', label: 'دامپ باطله سنگی' },
    { value: 'WASTE_DUMP_ALLUVIAL', label: 'دامپ آبرفت' },
    { value: 'BENEFICIATION_PLANT', label: 'کارخانه پرعیار‌سازی' },
    { value: 'EXPORT', label: 'صادرات' },
  ];

  useEffect(() => {
    if (isOpen) {
      const allSubBlocks = SubBlockRepository.getAll();
      // فقط ساب‌بلوک‌هایی که مقصد ندارند یا در حال حمل هستند
      const available = allSubBlocks.filter(sb => 
        sb.status === 'DESTINATION_APPROVED' || 
        sb.status === 'LOADING_IN_PROGRESS' ||
        sb.status === 'CLASSIFICATION_DONE'
      );
      setSubBlocks(available);
      if (available.length > 0) {
        setSelectedSubBlockId(available[0].id);
      }
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selectedSubBlockId || !destination) {
      alert('لطفاً ساب‌بلوک و مقصد را انتخاب کنید');
      return;
    }
    setLoading(true);
    onConfirm(selectedSubBlockId, destination);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters.toFixed(0)} متر`;
    return `${(meters / 1000).toFixed(1)} کیلومتر`;
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
                  <TruckIcon className={`w-4 h-4 ${isDark ? 'text-[#C9A227]' : 'text-[#C9A227]'}`} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    🚛 تایید مسیر حمل
                  </h3>
                  <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                    {pointsCount} نقطه • {formatDistance(distance)}
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
            <div className="p-6 space-y-4">
              {/* اطلاعات مسیر */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-[#13203A]/40' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>فاصله</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-[#C9A227]' : 'text-[#C9A227]'}`}>
                      {formatDistance(distance)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>زمان تقریبی</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {Math.round(distance / 20 / 60)} دقیقه
                    </p>
                  </div>
                </div>
              </div>

              {/* انتخاب ساب‌بلوک */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>
                  <MapPinIcon className="w-4 h-4 inline-block ml-1" />
                  ساب‌بلوک مبدا
                </label>
                <select
                  value={selectedSubBlockId}
                  onChange={(e) => setSelectedSubBlockId(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none ${
                    isDark 
                      ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white focus:border-[#00D4FF]/50' 
                      : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#C9A227]/50'
                  }`}
                >
                  {subBlocks.length === 0 ? (
                    <option value="">هیچ ساب‌بلوکی موجود نیست</option>
                  ) : (
                    subBlocks.map(sb => (
                      <option key={sb.id} value={sb.id}>
                        {sb.code} - {sb.destination || 'بدون مقصد'}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* انتخاب مقصد */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-600'}`}>
                  🎯 مقصد حمل
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none ${
                    isDark 
                      ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white focus:border-[#00D4FF]/50' 
                      : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#C9A227]/50'
                  }`}
                >
                  <option value="">انتخاب مقصد...</option>
                  {destinations.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
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
                disabled={!selectedSubBlockId || !destination || loading}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-[#C9A227] text-[#1A2A3A] hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1A2A3A] border-t-transparent" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    تایید مسیر
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}