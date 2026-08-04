// src/shared/components/DateRangePicker.tsx

import { useState } from 'react';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

interface DateRangePickerProps {
  value: {
    startDate?: string;
    endDate?: string;
    preset?: string;
  };
  onChange: (value: any) => void;
  onClear: () => void;
}

export function DateRangePicker({ value, onChange, onClear }: DateRangePickerProps) {
  const { isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempStart, setTempStart] = useState(value.startDate || '');
  const [tempEnd, setTempEnd] = useState(value.endDate || '');

  const presets = [
    { label: 'امروز', value: 'today' },
    { label: 'دیروز', value: 'yesterday' },
    { label: 'این هفته', value: 'thisWeek' },
    { label: 'این ماه', value: 'thisMonth' },
    { label: 'ماه گذشته', value: 'lastMonth' },
    { label: 'این سال', value: 'thisYear' },
    { label: 'سال گذشته', value: 'lastYear' },
  ];

  const applyPreset = (preset: string) => {
    const now = new Date();
    let start = new Date(), end = new Date();
    switch (preset) {
      case 'today': start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59); break;
      case 'yesterday': start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59); break;
      case 'thisWeek': const d = now.getDay(); start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d + 1); end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - d)); break;
      case 'thisMonth': start = new Date(now.getFullYear(), now.getMonth(), 1); end = new Date(now.getFullYear(), now.getMonth() + 1, 0); break;
      case 'lastMonth': start = new Date(now.getFullYear(), now.getMonth() - 1, 1); end = new Date(now.getFullYear(), now.getMonth(), 0); break;
      case 'thisYear': start = new Date(now.getFullYear(), 0, 1); end = new Date(now.getFullYear(), 11, 31); break;
      case 'lastYear': start = new Date(now.getFullYear() - 1, 0, 1); end = new Date(now.getFullYear() - 1, 11, 31); break;
      default: return;
    }
    onChange({ startDate: start.toISOString(), endDate: end.toISOString(), preset });
    setShowPicker(false);
  };

  const applyCustomRange = () => {
    if (tempStart && tempEnd) {
      onChange({
        startDate: new Date(tempStart).toISOString(),
        endDate: new Date(tempEnd).toISOString(),
        preset: 'custom',
      });
      setShowPicker(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'انتخاب تاریخ';
    return new Date(date).toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const hasValue = value.startDate || value.endDate;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm ${
          hasValue
            ? isDark
              ? 'border-[#AACCDD]/30 bg-[#AACCDD]/10 text-white'
              : 'border-[#1A2A3A]/30 bg-[#1A2A3A]/10 text-gray-800'
            : isDark
              ? 'border-[#AACCDD]/10 bg-white/5 text-[#8A9DB0] hover:border-[#AACCDD]/30'
              : 'border-gray-200 bg-gray-100 text-gray-600 hover:border-gray-400'
        }`}
      >
        <CalendarIcon className="w-4 h-4" />
        <span>{hasValue ? `${formatDate(value.startDate)} - ${formatDate(value.endDate)}` : 'انتخاب بازه زمانی'}</span>
        {hasValue && (
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="text-[#4A6A8A] hover:text-red-400">
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </button>

      {showPicker && (
        <div className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl z-50 p-4 border ${
          isDark
            ? 'bg-[#0A1628] border-[#AACCDD]/20'
            : 'bg-white border-gray-200'
        }`}>
          <div className="grid grid-cols-4 gap-1 mb-3">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => applyPreset(p.value)}
                className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${
                  value.preset === p.value
                    ? isDark
                      ? 'bg-[#AACCDD] text-[#1A2A3A]'
                      : 'bg-[#1A2A3A] text-white'
                    : isDark
                      ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>از تاریخ</label>
              <input
                type="date"
                value={tempStart}
                onChange={(e) => setTempStart(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none ${
                  isDark
                    ? 'bg-white/5 border-[#AACCDD]/10 text-white focus:border-[#AACCDD]/30'
                    : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#1A2A3A]/30'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>تا تاریخ</label>
              <input
                type="date"
                value={tempEnd}
                onChange={(e) => setTempEnd(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none ${
                  isDark
                    ? 'bg-white/5 border-[#AACCDD]/10 text-white focus:border-[#AACCDD]/30'
                    : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#1A2A3A]/30'
                }`}
              />
            </div>
            <button
              onClick={applyCustomRange}
              disabled={!tempStart || !tempEnd}
              className={`w-full py-1.5 rounded-lg transition-colors text-sm disabled:opacity-50 ${
                isDark
                  ? 'bg-[#AACCDD] text-[#1A2A3A] hover:bg-[#8A9DB0]'
                  : 'bg-[#1A2A3A] text-white hover:bg-[#2A3A4A]'
              }`}
            >
              اعمال بازه
            </button>
          </div>
        </div>
      )}
    </div>
  );
}