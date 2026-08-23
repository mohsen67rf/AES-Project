// src/modules/mine/presentation/components/Map/components/MeasureModal.tsx

import { useState } from 'react';
import { useTheme } from '../../../../../../shared/context/ThemeContext';
import { XMarkIcon, CheckIcon, ArrowsPointingOutIcon, SquaresPlusIcon } from '@heroicons/react/24/outline';

interface MeasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tool: string) => void;
}

export function MeasureModal({ isOpen, onClose, onConfirm }: MeasureModalProps) {
  const { isDark } = useTheme();
  const [selectedTool, setSelectedTool] = useState<'measureDistance' | 'measureArea'>('measureDistance');

  const options = [
    {
      id: 'measureDistance' as const,
      label: 'اندازه‌گیری فاصله',
      icon: ArrowsPointingOutIcon,
      description: 'با کلیک متوالی، فاصله بین نقاط را اندازه بگیرید',
      color: '#FF6B6B',
    },
    {
      id: 'measureArea' as const,
      label: 'اندازه‌گیری مساحت',
      icon: SquaresPlusIcon,
      description: 'با کلیک متوالی، مساحت محدوده را محاسبه کنید',
      color: '#4ECDC4',
    },
  ];

  const selectedOption = options.find(o => o.id === selectedTool)!;
  const Icon = selectedOption.icon;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'bg-[#0A1628] border-[#AACCDD]/20' : 'bg-white border-gray-200/50'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#C9A227]/20' : 'bg-[#C9A227]/10'}`}>
                  <ArrowsPointingOutIcon className={`w-4 h-4 ${isDark ? 'text-[#C9A227]' : 'text-[#C9A227]'}`} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>📐 اندازه‌گیری</h3>
                  <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>نوع اندازه‌گیری را انتخاب کنید</p>
                </div>
              </div>
              <button onClick={onClose} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${isDark ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {options.map((option) => {
                const isSelected = selectedTool === option.id;
                const OptionIcon = option.icon;
                return (
                  <button key={option.id} onClick={() => setSelectedTool(option.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSelected ? isDark ? 'bg-[#C9A227]/20 border border-[#C9A227]/30' : 'bg-[#C9A227]/10 border border-[#C9A227]/30' : isDark ? 'hover:bg-white/5 border border-transparent' : 'hover:bg-gray-100 border border-transparent'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ backgroundColor: isSelected ? `${option.color}30` : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') }}>
                      <OptionIcon className={`w-4 h-4 ${isSelected ? '' : (isDark ? 'text-[#8A9DB0]' : 'text-gray-500')}`} style={{ color: isSelected ? option.color : undefined }} />
                    </div>
                    <div className="flex-1 text-right">
                      <p className={`text-sm font-medium ${isSelected ? isDark ? 'text-[#C9A227]' : 'text-[#1A2A3A]' : isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>{option.label}</p>
                      <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>{option.description}</p>
                    </div>
                    {isSelected && <CheckIcon className="w-4 h-4 text-[#C9A227]" />}
                  </button>
                );
              })}
            </div>
            <div className={`px-6 py-3 border-t text-xs ${isDark ? 'border-[#AACCDD]/10 text-[#4A6A8A]' : 'border-gray-100 text-gray-400'}`}>💡 نتیجه اندازه‌گیری به صورت خودکار نمایش داده می‌شود</div>
            <div className={`px-6 py-4 border-t flex gap-3 ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'}`}>
              <button onClick={onClose} className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>انصراف</button>
              <button onClick={() => { onConfirm(selectedTool); onClose(); }} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-[#C9A227] text-[#1A2A3A] hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2">
                <CheckIcon className="w-4 h-4" /> شروع اندازه‌گیری
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}