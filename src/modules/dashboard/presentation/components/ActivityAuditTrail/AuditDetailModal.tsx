// src/modules/dashboard/presentation/components/ActivityAuditTrail/AuditDetailModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ClockIcon, 
  UserCircleIcon, 
  CubeIcon, 
  MapIcon, 
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import type { ActivityLog } from '../../../../../core/domain/types/activity.types';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface AuditDetailModalProps {
  log: ActivityLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !log) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = () => {
    switch (log.severity) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            موفقیت (Success)
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
            هشدار (Warning)
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircleIcon className="w-3.5 h-3.5" />
            بحرانی / حذف (Critical)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <InformationCircleIcon className="w-3.5 h-3.5" />
            اطلاعات (Info)
          </span>
        );
    }
  };

  const getCategoryLabel = () => {
    switch (log.category) {
      case 'AUTH':
        return '🔐 ورود و احراز هویت';
      case 'BLOCKS':
        return '🧱 مدیریت بلوک‌ها و ساب‌بلوک‌ها';
      case 'NAVIGATION':
        return '🗺️ پیمایش و نقشه‌برداری معدن';
      case 'PROCESSING':
        return '⚙️ فرآوری، خردایش و آزمایشگاه';
      case 'SYSTEM':
        return '🛡️ عملیات و ممیزی سیستم';
      default:
        return log.category;
    }
  };

  const formatPersianDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const handleEntityJump = () => {
    if (log.targetEntity?.type === 'BLOCK' && log.targetEntity.id) {
      navigate(`/block/${log.targetEntity.id}`);
      onClose();
    } else if (log.details?.route) {
      navigate(log.details.route);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden z-10 ${
            isDark 
              ? 'bg-[#0F1B2E] border-[#2A3A5A] text-white' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-[#2A3A5A] bg-[#13233C]' : 'border-slate-100 bg-slate-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#8A9DB0]">{getCategoryLabel()}</span>
                  <span className="text-xs text-[#8A9DB0]">•</span>
                  <span className="text-xs font-mono text-[#00D4FF]">{log.actionType}</span>
                </div>
                <h3 className="text-base font-bold mt-0.5">{log.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSeverityBadge()}
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                }`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-5 text-sm">
            {/* Description Card */}
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-[#16253E] border-[#2A3A5A]' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className="leading-relaxed text-sm font-medium">{log.description}</p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Information */}
              <div className={`p-4 rounded-xl border space-y-2.5 ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold text-[#8A9DB0] uppercase tracking-wider">
                  <UserCircleIcon className="w-4 h-4 text-[#00D4FF]" />
                  <span>مشخصات کاربر و عامل</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A9DB0]">نام و نام خانوادگی:</span>
                  <span className="font-semibold text-sm">{log.userName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A9DB0]">کد پرسنلی / سیستمی:</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/20 text-[#00D4FF]">
                    {log.userCode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A9DB0]">نقش سازمانی:</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {log.userRole}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A9DB0]">آدرس IP:</span>
                  <span className="font-mono text-xs text-slate-400">{log.ipAddress || '192.168.1.104'}</span>
                </div>
              </div>

              {/* Time & Target Information */}
              <div className={`p-4 rounded-xl border space-y-2.5 ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold text-[#8A9DB0] uppercase tracking-wider">
                  <ClockIcon className="w-4 h-4 text-[#C9A227]" />
                  <span>زمان‌بندی و موقعیت هدف</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A9DB0]">تاریخ و زمان ثبت:</span>
                  <span className="font-medium text-xs text-[#C9A227]">
                    {formatPersianDate(log.timestamp)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A9DB0]">موجودیت تحت اقدام:</span>
                  <span className="text-xs font-medium">
                    {log.targetEntity?.type || 'سیستم'} {log.targetEntity?.code ? `(${log.targetEntity.code})` : ''}
                  </span>
                </div>
                {log.details?.route && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8A9DB0]">مسیر URL:</span>
                    <span className="font-mono text-xs text-cyan-400 truncate max-w-[180px]">
                      {log.details.route}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A9DB0]">شناسه رویداد:</span>
                  <span className="font-mono text-[10px] text-slate-500 truncate max-w-[160px]">
                    {log.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Changed Fields / Diff Visualizer if present */}
            {log.details?.changedFields && log.details.changedFields.length > 0 && (
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-bold text-[#8A9DB0] uppercase flex items-center gap-2">
                  <span>🔄 فیلدهای تغییر یافته</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-400">
                    {log.details.changedFields.length} مورد
                  </span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {log.details.changedFields.map((field) => (
                    <span
                      key={field}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                    >
                      {field}
                    </span>
                  ))}
                </div>

                {log.details.oldValue && log.details.newValue && (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#2A3A5A]">
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <div className="text-[11px] font-bold text-rose-400 mb-1">مقدار قبلی (Old Value)</div>
                      <pre className="text-[11px] font-mono text-rose-300/80 overflow-x-auto">
                        {JSON.stringify(log.details.oldValue, null, 2)}
                      </pre>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-[11px] font-bold text-emerald-400 mb-1">مقدار جدید (New Value)</div>
                      <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto">
                        {JSON.stringify(log.details.newValue, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Raw Details / JSON Inspector */}
            {log.details && (
              <div className={`p-4 rounded-xl border space-y-2 ${
                isDark ? 'bg-[#0B1524] border-[#2A3A5A]' : 'bg-slate-100 border-slate-300'
              }`}>
                <div className="flex items-center justify-between text-xs text-[#8A9DB0]">
                  <span className="font-bold">جزئیات فنی و پارامترهای رویداد (JSON Schema)</span>
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 text-[11px] text-[#00D4FF] hover:underline"
                  >
                    <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                    {copied ? 'کپی شد!' : 'کپی کل لاگ'}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-black/40 text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-40 leading-normal">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className={`px-6 py-3.5 border-t flex items-center justify-between ${
            isDark ? 'border-[#2A3A5A] bg-[#13233C]' : 'border-slate-100 bg-slate-50'
          }`}>
            <div className="flex items-center gap-2">
              {(log.targetEntity?.id || log.details?.route) && (
                <button
                  onClick={handleEntityJump}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/30 font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  <span>انتقال به بخش مربوطه</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isDark 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              بستن پنجره
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
