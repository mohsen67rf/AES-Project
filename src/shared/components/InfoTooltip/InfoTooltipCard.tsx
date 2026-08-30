// src/shared/components/InfoTooltip/InfoTooltipCard.tsx

import React from 'react';
import { 
  MapPin, 
  User, 
  Activity, 
  Clock, 
  Tag, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Info, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import type { InfoTooltipMetadata, TooltipStatusVariant } from './types';

interface InfoTooltipCardProps {
  metadata: InfoTooltipMetadata;
  isDark?: boolean;
  onClose?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  style?: React.CSSProperties;
  className?: string;
  arrowPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

const getStatusBadgeConfig = (status?: string, variant?: TooltipStatusVariant) => {
  const norm = (status || variant || '').toLowerCase().trim();

  if (variant === 'active' || norm.includes('active') || norm.includes('فعال') || norm.includes('operational')) {
    return {
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
      icon: Activity,
      label: status || 'فعال'
    };
  }
  if (variant === 'standby' || norm.includes('standby') || norm.includes('آماده') || norm.includes('انتظار')) {
    return {
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
      icon: Clock,
      label: status || 'آماده‌به‌کار'
    };
  }
  if (variant === 'maintenance' || variant === 'danger' || variant === 'error' || norm.includes('maint') || norm.includes('تعمیر') || norm.includes('خراب')) {
    return {
      bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400',
      icon: Wrench,
      label: status || 'تعمیرات'
    };
  }
  if (variant === 'extracting' || norm.includes('extract') || norm.includes('استخراج')) {
    return {
      bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      dot: 'bg-cyan-400',
      icon: Sparkles,
      label: status || 'در حال استخراج'
    };
  }
  if (variant === 'completed' || norm.includes('complete') || norm.includes('تکمیل')) {
    return {
      bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      dot: 'bg-blue-400',
      icon: CheckCircle2,
      label: status || 'تکمیل‌شده'
    };
  }
  if (variant === 'warning' || norm.includes('هشدار')) {
    return {
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
      icon: AlertTriangle,
      label: status || 'هشدار'
    };
  }

  return {
    bg: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    dot: 'bg-slate-400',
    icon: Info,
    label: status || 'نامشخص'
  };
};

const getStatColorClass = (color?: string) => {
  switch (color) {
    case 'emerald': return 'text-emerald-400';
    case 'amber': return 'text-amber-400';
    case 'rose': return 'text-rose-400';
    case 'cyan': return 'text-cyan-400';
    case 'indigo': return 'text-indigo-400';
    case 'purple': return 'text-purple-400';
    default: return 'text-cyan-300';
  }
};

export const InfoTooltipCard: React.FC<InfoTooltipCardProps> = ({
  metadata,
  isDark = true,
  onClose,
  onMouseEnter,
  onMouseLeave,
  style,
  className = '',
  arrowPlacement
}) => {
  const statusConfig = metadata.status || metadata.statusVariant 
    ? getStatusBadgeConfig(metadata.status, metadata.statusVariant) 
    : null;

  const StatusIcon = statusConfig?.icon;

  return (
    <div
      role="tooltip"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
      className={`relative z-[9999] w-72 max-w-[90vw] rounded-2xl p-3 shadow-2xl backdrop-blur-xl border transition-all duration-200 pointer-events-auto select-text text-right ${
        isDark 
          ? 'bg-[#0B1323]/95 border-cyan-500/30 text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.6)]' 
          : 'bg-white/95 border-slate-300 text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.2)]'
      } ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-700/40 dark:border-slate-800">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {metadata.code && (
              <span className="font-mono text-xs font-black tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {metadata.code}
              </span>
            )}
            {statusConfig && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusConfig.dot}`} />
                {StatusIcon && <StatusIcon className="w-3 h-3" />}
                <span>{statusConfig.label}</span>
              </span>
            )}
          </div>

          {metadata.title && (
            <h4 className="text-xs font-bold mt-1 text-slate-900 dark:text-slate-100 truncate">
              {metadata.title}
            </h4>
          )}

          {metadata.subtitle && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {metadata.subtitle}
            </p>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            title="بستن"
            aria-label="Close tooltip"
          >
            ✕
          </button>
        )}
      </div>

      {/* Stats Grid */}
      {metadata.stats && metadata.stats.length > 0 && (
        <div className={`grid gap-1.5 my-2.5 ${metadata.stats.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {metadata.stats.map((stat, idx) => (
            <div 
              key={idx}
              className={`p-1.5 rounded-xl border text-center ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate">
                {stat.label}
              </span>
              <span className={`text-xs font-black font-mono block mt-0.5 ${getStatColorClass(stat.color)}`}>
                {stat.value} {stat.unit ? <span className="text-[9px] font-normal text-slate-400">{stat.unit}</span> : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Location, Bench, Operator Details */}
      <div className="space-y-1 my-2 text-[11px]">
        {metadata.location && (
          <div className="flex items-center justify-between py-0.5 border-b border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>موقعیت:</span>
            </span>
            <span className="font-semibold text-cyan-500 dark:text-cyan-300 truncate max-w-[140px]">
              {metadata.location}
            </span>
          </div>
        )}

        {metadata.benchLevel !== undefined && (
          <div className="flex items-center justify-between py-0.5 border-b border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" />
              <span>تراز پله:</span>
            </span>
            <span className="font-mono font-bold text-amber-500 dark:text-amber-300">
              {metadata.benchLevel} m
            </span>
          </div>
        )}

        {metadata.operator && (
          <div className="flex items-center justify-between py-0.5 border-b border-slate-200/50 dark:border-slate-800/50">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-400" />
              <span>اپراتور:</span>
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
              {metadata.operator}
            </span>
          </div>
        )}

        {metadata.category && (
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Tag className="w-3 h-3 text-indigo-400" />
              <span>دسته‌بندی:</span>
            </span>
            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
              {metadata.category}
            </span>
          </div>
        )}

        {/* Dynamic Key-Value Details */}
        {metadata.details && Object.entries(metadata.details).map(([key, val]) => {
          if (val === undefined || val === null || val === '') return null;
          return (
            <div key={key} className="flex items-center justify-between py-0.5 border-b border-slate-200/30 dark:border-slate-800/30">
              <span className="text-slate-500 dark:text-slate-400 truncate max-w-[100px]">{key}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{val}</span>
            </div>
          );
        })}
      </div>

      {/* Tags */}
      {metadata.tags && metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50">
          {metadata.tags.map((tag, idx) => (
            <span 
              key={idx} 
              className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Custom Extra Node */}
      {metadata.customContent && (
        <div className="mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50 text-xs">
          {metadata.customContent}
        </div>
      )}

      {/* Action Button */}
      {metadata.action && (
        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              if (metadata.action?.onClick) metadata.action.onClick();
              if (onClose) onClose();
            }}
            className="w-full py-1.5 px-2 rounded-xl text-xs font-black bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95"
          >
            <span>{metadata.action.label}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2-Second Delay Badge Footer Indicator */}
      <div className="mt-2 flex items-center justify-between text-[8px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/40">
        <span className="flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" />
          <span>پایش اطلاعات هوشمند</span>
        </span>
        <span className="font-mono">AES-Radar</span>
      </div>
    </div>
  );
};
