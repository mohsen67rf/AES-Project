// src/modules/mine/presentation/components/Map/components/PitMapSelector.tsx

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../../../../shared/context/ThemeContext';
import { Pit } from '../../../../../../core/domain/types/mine.types';
import { mapDatabase } from '../../../../../../core/infrastructure/database/MapDatabaseService';
import { 
  MapPinIcon, 
  ChevronDownIcon, 
  XMarkIcon,
  CheckIcon,
  DocumentArrowUpIcon,
  ArrowPathIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface PitMapData {
  pitId: string;
  pitName: string;
  pitCode: string;
  hasMap: boolean;
  mapName?: string;
  updatedAt?: string;
}

interface PitMapSelectorProps {
  mineId: string;
  pits: Pit[];
  selectedPitId: string | null;
  onPitSelect: (pitId: string | null) => void;
  onUpload: (pitId: string) => void;
  onRefresh: () => void;
  className?: string;
}

export function PitMapSelector({ 
  mineId,
  pits, 
  selectedPitId, 
  onPitSelect, 
  onUpload,
  onRefresh,
  className = ''
}: PitMapSelectorProps) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [pitMaps, setPitMaps] = useState<Record<string, PitMapData>>({});
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedPit = pits.find(p => p.id === selectedPitId);

  // ============================================
  // بارگذاری وضعیت نقشه‌های پیت‌ها
  // ============================================

  const loadPitMaps = async () => {
    if (!mineId) return;
    
    setLoading(true);
    try {
      const maps = await mapDatabase.getAllPitMaps(mineId);
      const mapStatus: Record<string, PitMapData> = {};
      
      pits.forEach((pit: Pit) => {
        const pitMap = maps.find(m => m.pitId === pit.id);
        mapStatus[pit.id] = {
          pitId: pit.id,
          pitName: pit.name,
          pitCode: pit.code,
          hasMap: !!pitMap,
          mapName: pitMap?.name,
          updatedAt: pitMap?.updatedAt,
        };
      });
      
      setPitMaps(mapStatus);
    } catch (error) {
      console.error('❌ خطا در بارگذاری نقشه‌های پیت:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mineId && pits.length > 0) {
      loadPitMaps();
    }
  }, [pits, mineId]);

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

  const handleRefresh = async () => {
    await loadPitMaps();
    onRefresh();
  };

  // تعداد پیت‌های دارای نقشه
  const mappedPitsCount = Object.values(pitMaps).filter(p => p.hasMap).length;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* دکمه اصلی */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative z-50
          ${isDark 
            ? 'bg-[#13203A]/80 border border-[#AACCDD]/20 hover:border-[#00D4FF]/40 text-[#8A9DB0] hover:text-white' 
            : 'bg-white/80 border border-gray-200 hover:border-[#C9A227]/40 text-gray-600 hover:text-gray-800'
          }
          ${selectedPitId ? (isDark ? 'border-[#00D4FF]/50 text-[#00D4FF]' : 'border-[#C9A227]/50 text-[#C9A227]') : ''}
        `}
      >
        <MapPinIcon className={`w-4 h-4 ${selectedPitId ? (isDark ? 'text-[#00D4FF]' : 'text-[#C9A227]') : ''}`} />
        <span className="truncate max-w-[120px]">
          {selectedPit 
            ? `${selectedPit.name} (${selectedPit.code})` 
            : `${pits.length} پیت`
          }
        </span>
        <div className="flex items-center gap-1">
          {selectedPitId && pitMaps[selectedPitId]?.hasMap && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          )}
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* منوی dropdown - ✅ از راست باز میشه */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className={`
            absolute top-full mt-2 w-72 max-h-80 overflow-y-auto rounded-xl shadow-2xl border z-[9999]
            ${isDark 
              ? 'bg-[#13203A] border-[#AACCDD]/20' 
              : 'bg-white border-gray-200'
            }
            right-0  // ✅ از راست باز میشه
          `}>
            {/* هدر منو */}
            <div className={`px-4 py-3 border-b flex items-center justify-between sticky top-0 ${
              isDark ? 'border-[#AACCDD]/10 bg-[#13203A]' : 'border-gray-100 bg-white'
            }`}>
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                نقشه‌های پیت‌ها
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  className={`p-1 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/5 text-[#8A9DB0]' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  title="بارگذاری مجدد"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/5 text-[#8A9DB0]' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* گزینه "همه پیت‌ها" (نمای معدن) */}
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
              <span className="flex-1 text-right">نمای کلی معدن</span>
              {!selectedPitId && <CheckIcon className="w-4 h-4 text-[#00D4FF]" />}
            </button>

            {/* جداکننده */}
            <div className={`border-t ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'}`} />

            {/* لیست پیت‌ها */}
            {pits.length === 0 ? (
              <div className={`p-4 text-center text-sm ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
                <p>هیچ پیتی برای این معدن تعریف نشده است</p>
                <p className="text-[10px] mt-1">لطفاً ابتدا در صفحه معدن پیت ایجاد کنید</p>
              </div>
            ) : (
              pits.map((pit: Pit) => {
                const pitMap = pitMaps[pit.id];
                const isSelected = selectedPitId === pit.id;
                
                return (
                  <div key={pit.id} className="group">
                    <button
                      onClick={() => handleSelect(pit.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                        ${isSelected 
                          ? (isDark ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'bg-[#C9A227]/10 text-[#C9A227]')
                          : (isDark ? 'hover:bg-white/5 text-[#8A9DB0]' : 'hover:bg-gray-50 text-gray-600')
                        }
                      `}
                    >
                      <MapPinIcon className="w-4 h-4" />
                      <div className="flex-1 text-right">
                        <div className="font-medium">{pit.name}</div>
                        <div className={`text-[10px] flex items-center justify-end gap-2 ${
                          isDark ? 'text-[#4A6A8A]' : 'text-gray-400'
                        }`}>
                          <span>{pit.code}</span>
                          {pitMap?.hasMap && (
                            <span className="flex items-center gap-1 text-green-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                              نقشه
                            </span>
                          )}
                          {!pitMap?.hasMap && (
                            <span className="text-gray-500">بدون نقشه</span>
                          )}
                        </div>
                      </div>
                      {isSelected && <CheckIcon className="w-4 h-4 text-[#00D4FF]" />}
                    </button>

                    {/* دکمه‌های actions برای هر پیت */}
                    <div className={`
                      flex items-center gap-1 px-4 pb-2 transition-all
                      ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
                    `}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpload(pit.id);
                          setIsOpen(false);
                        }}
                        className={`
                          flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-colors
                          ${isDark 
                            ? 'hover:bg-[#00D4FF]/10 text-[#00D4FF]' 
                            : 'hover:bg-[#C9A227]/10 text-[#C9A227]'
                          }
                        `}
                      >
                        <DocumentArrowUpIcon className="w-3 h-3" />
                        {pitMap?.hasMap ? 'آپدیت نقشه' : 'بارگذاری نقشه'}
                      </button>
                      {pitMap?.hasMap && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`آیا از حذف نقشه ${pit.name} اطمینان دارید؟`)) {
                              mapDatabase.deleteMap(`pit_${pit.id}`);
                              loadPitMaps();
                            }
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] transition-colors ${
                            isDark 
                              ? 'hover:bg-red-500/20 text-red-400' 
                              : 'hover:bg-red-100 text-red-500'
                          }`}
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* فوتر */}
            <div className={`px-4 py-2 border-t text-[10px] sticky bottom-0 ${
              isDark ? 'border-[#AACCDD]/10 text-[#4A6A8A] bg-[#13203A]' : 'border-gray-100 text-gray-400 bg-white'
            }`}>
              {pits.length > 0 ? (
                `${mappedPitsCount} از ${pits.length} پیت دارای نقشه`
              ) : (
                'هیچ پیتی وجود ندارد'
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PitMapSelector;