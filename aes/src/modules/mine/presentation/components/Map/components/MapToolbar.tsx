// src/modules/mine/presentation/components/Map/components/MapToolbar.tsx

import { useTheme } from '../../../../../../shared/context/ThemeContext';

interface MapToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
}

export function MapToolbar({ activeTool, onToolChange }: MapToolbarProps) {
  const { isDark } = useTheme();

  const tools = [
    { id: 'none', label: '🖱️ انتخاب' },
    { id: 'point', label: '📍 نقطه' },
    { id: 'line', label: '📏 خط' },
    { id: 'polygon', label: '🔷 محدوده' },
    { id: 'measureDistance', label: '📐 فاصله' },
    { id: 'measureArea', label: '📐 مساحت' },
  ];

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-1 p-1.5 rounded-xl shadow-2xl ${
      isDark 
        ? 'bg-[#0A1628]/95 backdrop-blur border border-[#AACCDD]/20' 
        : 'bg-white/95 backdrop-blur border border-gray-200'
    }`}>
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
            activeTool === tool.id
              ? isDark
                ? 'bg-[#C9A227] text-[#1A2A3A]'
                : 'bg-[#1A2A3A] text-white'
              : isDark
                ? 'text-[#8A9DB0] hover:bg-white/10 hover:text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
