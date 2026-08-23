// src/modules/mine/presentation/components/Map/components/PitSelector.tsx

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../../../../shared/context/ThemeContext';
import { Pit } from '../../../../../../core/domain/types/mine.types';
import { 
  MapPinIcon, 
  ChevronDownIcon, 
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface PitSelectorProps {
  pits: Pit[];
  selectedPitId: string | null;
  onPitSelect: (pitId: string | null) => void;
  mineName?: string;
  className?: string;
}

export function PitSelector({ 
  pits, 
  selectedPitId, 
  onPitSelect, 
  mineName,
  className = ''
}: PitSelectorProps) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedPit = pits.find(p => p.id === selectedPitId);

  // بستن dropdown با کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (pitId: string | null) => {
    onPitSelect(pitId);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* دکمه اصلی */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
          ${isDark 
            ? 'bg-[#13203A]/80 border border-[#AACCDD]/20 hover:border-[#00D4FF]/40 text-[#8A9DB0] hover:text-white' 
            : 'bg-white/80 border border-gray-200 hover:border-[#C9A227]/40 text-gray-600 hover:text-gray-800'
          }
          ${selectedPitId ? (isDark ? 'border-[#00D4FF]/50 text-[#00D4FF]' : 'border-[#C9A227]/50 text-[#C9A227]') : ''}
        `}
      >
        <MapPinIcon className={`w-4 h-4 ${selectedPitId ? (isDark ? 'text-[#00D4FF]' : 'text-[#C9A227]') : ''}`} />
        <span className="truncate max-w-[120px]">
          {selectedPit ? `${selectedPit.name} (${selectedPit.code})` : (mineName || 'همه پیت‌ها')}
        </span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* منوی dropdown */}
      {isOpen && (
        <div className={`
          absolute top-full left-0 mt-2 w-64 max-h-60 overflow-y-auto rounded-xl shadow-2xl border z-50
          ${isDark 
            ? 'bg-[#13203A] border-[#AACCDD]/20' 
            : 'bg-white border-gray-200'
          }
        `}>
          {/* گزینه "همه پیت‌ها" */}
          <button
            onClick={() => handleSelect(null)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
              ${!selectedPitId 
                ? (isDark ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'bg-[#C9A227]/10 text-[#C9A227]')
                : (isDark ? 'hover:bg-white/5 text-[#8A9DB0]' : 'hover:bg-gray-50 text-gray-600')
              }
            `}
          >
            <MapPinIcon className="w-4 h-4" />
            <span className="flex-1 text-right">همه پیت‌ها</span>
            {!selectedPitId && <CheckIcon className="w-4 h-4 text-[#00D4FF]" />}
          </button>

          {/* جداکننده */}
          <div className={`border-t ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'}`} />

          {/* لیست پیت‌ها */}
          {pits.map((pit) => (
            <button
              key={pit.id}
              onClick={() => handleSelect(pit.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                ${selectedPitId === pit.id 
                  ? (isDark ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'bg-[#C9A227]/10 text-[#C9A227]')
                  : (isDark ? 'hover:bg-white/5 text-[#8A9DB0]' : 'hover:bg-gray-50 text-gray-600')
                }
              `}
            >
              <MapPinIcon className="w-4 h-4" />
              <div className="flex-1 text-right">
                <div className="font-medium">{pit.name}</div>
                <div className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                  {pit.code}
                </div>
              </div>
              {selectedPitId === pit.id && (
                <CheckIcon className={`w-4 h-4 ${isDark ? 'text-[#00D4FF]' : 'text-[#C9A227]'}`} />
              )}
            </button>
          ))}

          {/* اگر پیتی وجود نداشت */}
          {pits.length === 0 && (
            <div className={`p-4 text-center text-sm ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
              هیچ پیتی تعریف نشده است
            </div>
          )}
        </div>
      )}
    </div>
  );
}