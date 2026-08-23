// src/modules/mine/presentation/pages/MineMapPage/components/MapHeader.tsx

import { Pit } from '../../../../../../core/domain/types/mine.types';
import { PitMapSelector } from '../../../components/Map/components/PitMapSelector';
import {
  PaintBrushIcon,
  PencilIcon,
  TruckIcon,
  MapPinIcon,
  MinusIcon,
  SquaresPlusIcon,
  ArrowsPointingOutIcon,
  CursorArrowRippleIcon,  // ✅ اضافه شد
} from '@heroicons/react/24/outline';

interface MapHeaderProps {
  mineName: string;
  pits: Pit[];
  selectedPitId: string | null;
  onPitSelect: (pitId: string | null) => void;
  onUploadPitMap: (pitId: string) => void;
  onRefresh: () => void;
  onShowSettings: () => void;
  onBack: () => void;
  activeTool: string;
  isDrawing: boolean;
  onToolChange: (tool: string) => void;
  isDark: boolean;
  onShowDrawingModal: (type: 'point' | 'line' | 'polygon') => void;
  onShowMeasureModal: () => void;
  onToggleEdit: () => void;
  onToggleSelect: () => void;  // ✅ اضافه شد
}

export function MapHeader({
  mineName,
  pits,
  selectedPitId,
  onPitSelect,
  onUploadPitMap,
  onRefresh,
  onShowSettings,
  onBack,
  activeTool,
  isDrawing,
  onToolChange,
  isDark,
  onShowDrawingModal,
  onShowMeasureModal,
  onToggleEdit,
  onToggleSelect,  // ✅ اضافه شد
}: MapHeaderProps) {
  const toolButtons = [
    { id: 'point', label: 'نقطه', icon: MapPinIcon },
    { id: 'line', label: 'خط', icon: MinusIcon },
    { id: 'polygon', label: 'محدوده', icon: SquaresPlusIcon },
    { id: 'measure', label: 'اندازه‌گیری', icon: ArrowsPointingOutIcon },
    { id: 'haulRoute', label: 'فاصله حمل', icon: TruckIcon },
  ];

  const handleToolClick = (toolId: string) => {
    if (toolId === 'point' || toolId === 'line' || toolId === 'polygon') {
      onShowDrawingModal(toolId);
      return;
    }
    if (toolId === 'measure') {
      onShowMeasureModal();
      return;
    }
    if (toolId === 'haulRoute') {
      onToolChange(toolId);
      return;
    }
    onToolChange(toolId);
  };

  return (
    <div
      className={`flex-shrink-0 px-4 py-3 border-b flex items-center justify-between ${
        isDark
          ? 'border-[#AACCDD]/10 bg-[#0A1628]/95'
          : 'border-gray-200 bg-white/95'
      }`}
    >
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-bold text-white">🗺️ نقشه معدن</h1>
          <p className="text-[10px] text-[#4A6A8A]">
            {selectedPitId
              ? `${pits.find((p) => p.id === selectedPitId)?.name || ''} (${
                  pits.find((p) => p.id === selectedPitId)?.code || ''
                })`
              : mineName || 'معدن'}
          </p>
        </div>

        <PitMapSelector
          mineId={pits[0]?.mineId || ''}
          pits={pits}
          selectedPitId={selectedPitId}
          onPitSelect={onPitSelect}
          onUpload={onUploadPitMap}
          onRefresh={onRefresh}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {toolButtons.map((tool) => {
          const Icon = tool.icon;
          const isActive =
            (tool.id === 'measure' &&
              (activeTool === 'measureDistance' ||
                activeTool === 'measureArea')) ||
            (tool.id !== 'measure' && activeTool === tool.id);

          const isHaulRouteActive =
            tool.id === 'haulRoute' && (activeTool === 'haulRoute' || isDrawing);

          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                isActive || isHaulRouteActive
                  ? 'bg-[#C9A227] text-[#1A2A3A]'
                  : isDark
                  ? 'bg-[#AACCDD]/10 text-[#AACCDD] hover:bg-[#AACCDD]/20'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tool.label}
              {(isActive || isHaulRouteActive) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1A2A3A] animate-pulse" />
              )}
              {tool.id === 'haulRoute' && isDrawing && (
                <span className="text-[8px] bg-[#1A2A3A]/20 px-1 rounded">
                  ✏️
                </span>
              )}
            </button>
          );
        })}

        <div
          className={`w-px h-6 ${isDark ? 'bg-[#AACCDD]/10' : 'bg-gray-300'}`}
        />

        {/* ✅ دکمه انتخاب جدید */}
        <button
          onClick={onToggleSelect}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
            activeTool === 'select'
              ? 'bg-[#00D4FF] text-[#1A2A3A]'
              : isDark
              ? 'bg-[#AACCDD]/10 text-[#AACCDD] hover:bg-[#AACCDD]/20'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <CursorArrowRippleIcon className="w-3.5 h-3.5" />
          انتخاب
          {activeTool === 'select' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A2A3A] animate-pulse" />
          )}
        </button>

        {/* ✅ دکمه ویرایش */}
        <button
          onClick={onToggleEdit}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
            activeTool === 'edit'
              ? 'bg-[#C9A227] text-[#1A2A3A]'
              : isDark
              ? 'bg-[#AACCDD]/10 text-[#AACCDD] hover:bg-[#AACCDD]/20'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <PencilIcon className="w-3.5 h-3.5" />
          ویرایش
          {activeTool === 'edit' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A2A3A] animate-pulse" />
          )}
        </button>

        <div
          className={`w-px h-6 ${isDark ? 'bg-[#AACCDD]/10' : 'bg-gray-300'}`}
        />

        <button
          onClick={onShowSettings}
          className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
            isDark
              ? 'bg-[#AACCDD]/10 text-[#AACCDD] hover:bg-[#AACCDD]/20'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <PaintBrushIcon className="w-3.5 h-3.5" />
          تنظیمات
        </button>

        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-lg text-xs hover:bg-white/5 text-[#8A9DB0] hover:text-white transition-colors"
        >
          ← بازگشت
        </button>
      </div>
    </div>
  );
}

export default MapHeader;