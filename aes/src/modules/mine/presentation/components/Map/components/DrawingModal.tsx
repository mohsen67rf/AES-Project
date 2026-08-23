// src/modules/mine/presentation/components/Map/components/DrawingModal.tsx

import { useState } from 'react';
import { useTheme } from '../../../../../../shared/context/ThemeContext';
import { XMarkIcon, CheckIcon, MapPinIcon, MinusIcon, SquaresPlusIcon } from '@heroicons/react/24/outline';

export interface PointStyle {
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'diamond';
  size: number;
  color: string;
  icon?: string;
}

export interface LineStyle {
  color: string;
  weight: number;
  dashArray: string;
}

export interface PolygonStyle {
  color: string;
  weight: number;
  fillColor: string;
  fillOpacity: number;
  dashArray: string;
}

export interface DrawingSettings {
  point: PointStyle;
  line: LineStyle;
  polygon: PolygonStyle;
}

const DEFAULT_SETTINGS: DrawingSettings = {
  point: { shape: 'circle', size: 8, color: '#C9A227', icon: undefined },
  line: { color: '#4ECDC4', weight: 3, dashArray: '' },
  polygon: { color: '#FF6B6B', weight: 3, fillColor: '#FF6B6B', fillOpacity: 0.2, dashArray: '' },
};

const MACHINE_ICONS = [
  { id: 'excavator', label: 'بیل مکانیکی', emoji: '🚜' },
  { id: 'truck', label: 'کامیون', emoji: '🚛' },
  { id: 'drill', label: 'دستگاه حفاری', emoji: '⛰️' },
  { id: 'loader', label: 'لودر', emoji: '🛠️' },
  { id: 'crane', label: 'جرثقیل', emoji: '🏗️' },
  { id: 'bulldozer', label: 'بلدوزر', emoji: '🚧' },
  { id: 'dump', label: 'دامپ تراک', emoji: '🪨' },
  { id: 'conveyor', label: 'نوار نقاله', emoji: '⚙️' },
];

interface DrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tool: string, settings: any) => void;
  toolType: 'point' | 'line' | 'polygon';
}

export function DrawingModal({ isOpen, onClose, onConfirm, toolType }: DrawingModalProps) {
  const { isDark } = useTheme();
  const [settings, setSettings] = useState<DrawingSettings>(DEFAULT_SETTINGS);

  const toolConfigs = {
    point: { icon: MapPinIcon, label: 'نقطه', description: 'تنظیمات شکل و ظاهر نقطه', color: '#C9A227' },
    line: { icon: MinusIcon, label: 'خط', description: 'تنظیمات رنگ، ضخامت و نوع خط', color: '#4ECDC4' },
    polygon: { icon: SquaresPlusIcon, label: 'محدوده', description: 'تنظیمات رنگ خط، پرکننده و شفافیت', color: '#FF6B6B' },
  };

  const config = toolConfigs[toolType];
  const Icon = config.icon;

  const renderPointSettings = () => {
    const pointSettings = settings.point;
    const shapes = [
      { id: 'circle', label: 'دایره', icon: '⬤' },
      { id: 'square', label: 'مربع', icon: '▪️' },
      { id: 'triangle', label: 'مثلث', icon: '▲' },
      { id: 'star', label: 'ستاره', icon: '★' },
      { id: 'diamond', label: 'لوزی', icon: '◆' },
    ];

    return (
      <div className="space-y-4">
        <div>
          <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>شکل نقطه</label>
          <div className="flex flex-wrap gap-2">
            {shapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setSettings({ ...settings, point: { ...pointSettings, shape: shape.id as any } })}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${pointSettings.shape === shape.id ? 'bg-[#C9A227] text-[#1A2A3A]' : isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <span className="text-lg">{shape.icon}</span>
                <span className="text-[10px] block">{shape.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>اندازه: {pointSettings.size}px</label>
          <input type="range" min="4" max="24" value={pointSettings.size} onChange={(e) => setSettings({ ...settings, point: { ...pointSettings, size: parseInt(e.target.value) } })} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#AACCDD]/20" />
        </div>
        <div>
          <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>رنگ</label>
          <div className="flex items-center gap-3">
            <input type="color" value={pointSettings.color} onChange={(e) => setSettings({ ...settings, point: { ...pointSettings, color: e.target.value } })} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#AACCDD]/20 p-0.5 bg-transparent" />
            <span className={`text-xs font-mono ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>{pointSettings.color}</span>
          </div>
        </div>
        <div>
          <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>آیکون ماشین‌آلات</label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSettings({ ...settings, point: { ...pointSettings, icon: undefined } })} className={`px-3 py-2 rounded-lg text-sm transition-all ${!pointSettings.icon ? 'bg-[#C9A227] text-[#1A2A3A]' : isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <span>🔘</span>
              <span className="text-[10px] block">پیش‌فرض</span>
            </button>
            {MACHINE_ICONS.map((machine) => (
              <button key={machine.id} onClick={() => setSettings({ ...settings, point: { ...pointSettings, icon: machine.id } })} className={`px-3 py-2 rounded-lg text-sm transition-all ${pointSettings.icon === machine.id ? 'bg-[#C9A227] text-[#1A2A3A]' : isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <span className="text-lg">{machine.emoji}</span>
                <span className="text-[10px] block">{machine.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLineSettings = () => {
    const lineSettings = settings.line;
    const dashOptions = [
      { value: '', label: 'ممتد' },
      { value: '5,5', label: 'نقطه‌چین' },
      { value: '10,5', label: 'خط‌چین' },
      { value: '15,5,5,5', label: 'نقطه-خط' },
    ];

    return (
      <div className="space-y-4">
        <div>
          <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>رنگ خط</label>
          <div className="flex items-center gap-3">
            <input type="color" value={lineSettings.color} onChange={(e) => setSettings({ ...settings, line: { ...lineSettings, color: e.target.value } })} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#AACCDD]/20 p-0.5 bg-transparent" />
            <span className={`text-xs font-mono ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>{lineSettings.color}</span>
          </div>
        </div>
        <div>
          <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>ضخامت: {lineSettings.weight}px</label>
          <input type="range" min="1" max="10" value={lineSettings.weight} onChange={(e) => setSettings({ ...settings, line: { ...lineSettings, weight: parseInt(e.target.value) } })} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#AACCDD]/20" />
        </div>
        <div>
          <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>نوع خط</label>
          <div className="flex flex-wrap gap-2">
            {dashOptions.map((option) => (
              <button key={option.value} onClick={() => setSettings({ ...settings, line: { ...lineSettings, dashArray: option.value } })} className={`px-4 py-2 rounded-lg text-sm transition-all ${lineSettings.dashArray === option.value ? 'bg-[#C9A227] text-[#1A2A3A]' : isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-0.5" style={{ borderTop: `2px ${option.value ? 'dashed' : 'solid'} ${lineSettings.color}` }} />
                  <span className="text-[10px]">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPolygonSettings = () => {
    const polygonSettings = settings.polygon;
    const dashOptions = [
      { value: '', label: 'ممتد' },
      { value: '5,5', label: 'نقطه‌چین' },
      { value: '10,5', label: 'خط‌چین' },
      { value: '15,5,5,5', label: 'نقطه-خط' },
    ];

    return (
      <div className="space-y-4">
        <div>
          <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>رنگ خط</label>
          <div className="flex items-center gap-3">
            <input type="color" value={polygonSettings.color} onChange={(e) => setSettings({ ...settings, polygon: { ...polygonSettings, color: e.target.value } })} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#AACCDD]/20 p-0.5 bg-transparent" />
            <span className={`text-xs font-mono ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>{polygonSettings.color}</span>
          </div>
        </div>
        <div>
          <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>رنگ پرکننده</label>
          <div className="flex items-center gap-3">
            <input type="color" value={polygonSettings.fillColor} onChange={(e) => setSettings({ ...settings, polygon: { ...polygonSettings, fillColor: e.target.value } })} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-[#AACCDD]/20 p-0.5 bg-transparent" />
            <span className={`text-xs font-mono ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>{polygonSettings.fillColor}</span>
          </div>
        </div>
        <div>
          <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>شفافیت پرکننده: {Math.round(polygonSettings.fillOpacity * 100)}%</label>
          <input type="range" min="0" max="100" value={polygonSettings.fillOpacity * 100} onChange={(e) => setSettings({ ...settings, polygon: { ...polygonSettings, fillOpacity: parseInt(e.target.value) / 100 } })} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#AACCDD]/20" />
        </div>
        <div>
          <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>ضخامت خط: {polygonSettings.weight}px</label>
          <input type="range" min="1" max="8" value={polygonSettings.weight} onChange={(e) => setSettings({ ...settings, polygon: { ...polygonSettings, weight: parseInt(e.target.value) } })} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#AACCDD]/20" />
        </div>
        <div>
          <label className={`block text-xs mb-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>نوع خط</label>
          <div className="flex flex-wrap gap-2">
            {dashOptions.map((option) => (
              <button key={option.value} onClick={() => setSettings({ ...settings, polygon: { ...polygonSettings, dashArray: option.value } })} className={`px-4 py-2 rounded-lg text-sm transition-all ${polygonSettings.dashArray === option.value ? 'bg-[#C9A227] text-[#1A2A3A]' : isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-0.5" style={{ borderTop: `2px ${option.value ? 'dashed' : 'solid'} ${polygonSettings.color}` }} />
                  <span className="text-[10px]">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    switch (toolType) {
      case 'point': return renderPointSettings();
      case 'line': return renderLineSettings();
      case 'polygon': return renderPolygonSettings();
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
          <div className={`relative rounded-2xl shadow-2xl overflow-hidden border max-h-[90vh] flex flex-col ${isDark ? 'bg-[#0A1628] border-[#AACCDD]/20' : 'bg-white border-gray-200/50'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between flex-shrink-0 ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${config.color}20` }}>
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>تنظیمات رسم {config.label}</h3>
                  <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>{config.description}</p>
                </div>
              </div>
              <button onClick={onClose} className={`p-1.5 rounded-lg transition-all hover:scale-110 ${isDark ? 'hover:bg-white/5 text-[#8A9DB0] hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">{renderSettings()}</div>
            <div className={`px-6 py-4 border-t flex gap-3 flex-shrink-0 ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-100'}`}>
              <button onClick={onClose} className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isDark ? 'bg-white/5 text-[#8A9DB0] hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>انصراف</button>
              <button onClick={() => { const toolSettings = settings[toolType]; onConfirm(toolType, toolSettings); onClose(); }} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-[#C9A227] text-[#1A2A3A] hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2">
                <CheckIcon className="w-4 h-4" /> شروع رسم
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}