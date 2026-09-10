// src/modules/workspace/presentation/components/UnitToolbox.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { UnitToolAction } from '../../domain/workspace.types';
import { 
  ChartBar, 
  CheckCircle2, 
  Eye, 
  Users, 
  Layers, 
  Sparkles, 
  Truck, 
  Compass, 
  MapPin, 
  Warehouse, 
  Plus, 
  ClipboardCheck, 
  FileText, 
  AlertCircle,
  ExternalLink,
  Wrench,
  ChevronLeft
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ChartBar,
  CheckCircle2,
  Eye,
  Users,
  Layers,
  Sparkles,
  Truck,
  Compass,
  MapPin,
  Warehouse,
  Plus,
  ClipboardCheck,
  FileText,
  AlertCircle,
};

interface UnitToolboxProps {
  tools: UnitToolAction[];
  departmentTitle: string;
  onTriggerModal?: (actionId: string) => void;
}

export const UnitToolbox: React.FC<UnitToolboxProps> = ({ tools, onTriggerModal }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleActionClick = (action: UnitToolAction) => {
    if (action.actionType === 'NAVIGATE' && action.targetUrl) {
      navigate(action.targetUrl);
    } else if (onTriggerModal) {
      onTriggerModal(action.id);
    }
  };

  return (
    <div 
      className={`rounded-2xl sm:rounded-[22px] border p-3.5 sm:p-5 transition-all shadow-[0_12px_32px_rgba(7,11,26,0.5)] ${
        isDark
          ? 'bg-[#1A264F] border-[#24356B]/30 text-[#F1F5F9]'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#24356B]/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#00D2FF]/15 text-[#00D2FF] flex items-center justify-center font-black border border-[#00D2FF]/20">
            <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-black text-[#F1F5F9]">
            ابزارهای عملیاتی
          </h3>
        </div>

        <span className="text-[10px] sm:text-[11px] font-mono px-2 sm:px-2.5 py-0.5 rounded-full bg-[#141F42] text-[#8E9EB8] border border-[#24356B]/40">
          {tools.length} ابزار
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-3">
        {tools.map((tool) => {
          const IconComp = ICON_MAP[tool.iconName] || ExternalLink;

          return (
            <div
              key={tool.id}
              onClick={() => handleActionClick(tool)}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-[16px] border transition-all duration-200 cursor-pointer group flex items-center justify-between gap-2.5 sm:gap-3 ${
                tool.isPrimary
                  ? 'bg-[#141F42] border-[#00D2FF]/40 hover:border-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.15)]'
                  : isDark
                  ? 'bg-[#141F42] border-[#24356B]/30 hover:border-[#00D2FF]/40 hover:bg-[#1A264F]'
                  : 'bg-slate-50 border-slate-200 hover:border-indigo-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${
                  tool.isPrimary
                    ? 'bg-[#00D2FF]/20 border-[#00D2FF]/40 text-[#00D2FF]'
                    : 'bg-[#101935] border-[#24356B]/40 text-[#8E9EB8]'
                }`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-[#F1F5F9] group-hover:text-[#00D2FF] transition-colors truncate">
                    {tool.titleFa}
                  </h4>
                  <span className="text-[10px] text-[#8E9EB8] font-medium block truncate">
                    {tool.categoryFa}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {tool.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                    tool.isPrimary
                      ? 'bg-[#00D2FF]/15 text-[#00D2FF] border-[#00D2FF]/30'
                      : 'bg-[#101935] text-[#8E9EB8] border-[#24356B]/40'
                  }`}>
                    {tool.badge}
                  </span>
                )}
                <ChevronLeft className="w-4 h-4 text-[#8E9EB8] group-hover:text-[#00D2FF] group-hover:translate-x-[-3px] transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
