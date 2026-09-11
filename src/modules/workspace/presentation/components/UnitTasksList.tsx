// src/modules/workspace/presentation/components/UnitTasksList.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { TaskService } from '../../../tasks/services/TaskService';
import { UnitTask, TaskPriority } from '../../../../core/domain/types/task.types';
import type { User } from '../../../../core/domain/types/mine.types';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  RotateCw, 
  Plus, 
  ExternalLink, 
  AlertCircle,
  ChevronRight,
  Filter
} from 'lucide-react';

interface UnitTasksListProps {
  roleId: string;
  currentUser: User | null;
  onOpenAssignModal: () => void;
  onOpenTasksDrawer: () => void;
}

export const UnitTasksList: React.FC<UnitTasksListProps> = ({
  roleId,
  currentUser,
  onOpenAssignModal,
  onOpenTasksDrawer,
}) => {
  const { isDark } = useTheme();

  const [updateTick, setUpdateTick] = useState(0);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  useEffect(() => {
    const handleUpdate = () => setUpdateTick(t => t + 1);
    window.addEventListener('taskUpdated', handleUpdate);
    return () => window.removeEventListener('taskUpdated', handleUpdate);
  }, []);

  const tasks = useMemo(() => {
    const all = TaskService.getAllTasks();
    return all.filter(
      t => t.assignedRole.toLowerCase() === roleId.toLowerCase() || 
           t.createdByUserRole?.toLowerCase() === roleId.toLowerCase()
    );
  }, [roleId, updateTick]);

  const handleUpdateStatus = (taskId: string, newStatus: 'IN_PROGRESS' | 'COMPLETED') => {
    if (!currentUser) return;
    TaskService.updateTaskStatus(taskId, newStatus, currentUser, `به‌روزرسانی مستقیم از میز کار واحد ${roleId}`);
    setUpdateTick(t => t + 1);
  };

  const filtered = tasks.filter(t => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">فوری 🚨</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">بالا</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">متوسط</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/40">عادی</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">تکمیل‌شده</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">در حال اقدام</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">در انتظار اقدام</span>;
    }
  };

  return (
    <div 
      className={`rounded-[22px] border p-5 transition-all shadow-[0_12px_32px_rgba(7,11,26,0.5)] ${
        isDark
          ? 'bg-[#1A264F] border-[#24356B]/30 text-[#F1F5F9]'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#24356B]/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00D2FF]/15 text-[#00D2FF] flex items-center justify-center font-black border border-[#00D2FF]/20">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black flex items-center gap-2 text-[#F1F5F9]">
            <span>کارتابل وظایف واحد</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-[#141F42] border border-[#24356B]/40 text-[11px]">
            {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === s 
                    ? 'bg-[#00D2FF] text-slate-950 shadow-sm' 
                    : 'text-[#8E9EB8] hover:text-white'
                }`}
              >
                {s === 'ALL' ? 'همه' : s === 'PENDING' ? 'انتظار' : s === 'IN_PROGRESS' ? 'جاری' : 'تکمیل'}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenAssignModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-950 bg-gradient-to-r from-[#00D2FF] to-[#38BDF8] hover:brightness-110 shadow-[0_0_12px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ارجاع</span>
          </button>

          <button
            onClick={onOpenTasksDrawer}
            className="px-3 py-1.5 rounded-full border border-[#24356B]/40 bg-[#141F42] hover:bg-[#1E2D5C] text-[#8E9EB8] hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            کارتابل کل
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="mt-3 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-1">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
            <p className="text-xs font-bold text-slate-300">وظیفه فعالی با این فیلتر برای این واحد وجود ندارد.</p>
            <p className="text-[11px] text-slate-500">تمامی وظایف ارجاعی در وضعیت مطلوب یا تکمیل قرار دارند.</p>
          </div>
        ) : (
          filtered.map(task => (
            <div
              key={task.id}
              className={`p-3.5 rounded-[18px] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isDark 
                  ? 'bg-[#141F42] border-[#24356B]/30 hover:border-[#00D2FF]/40 text-[#F1F5F9]' 
                  : 'bg-slate-50 border-slate-200 hover:border-indigo-300 shadow-sm'
              }`}
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-mono text-[11px] font-black text-[#00D2FF] bg-[#00D2FF]/10 px-2 py-0.5 rounded-full border border-[#00D2FF]/20">
                    {task.code}
                  </span>
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                  <span className="text-[11px] text-[#8E9EB8] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-[#8E9EB8]" />
                    <span>{new Date(task.dueDate).toLocaleDateString('fa-IR')}</span>
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#F1F5F9] leading-snug">
                  {task.title}
                </h4>

                <p className="text-[11px] text-[#8E9EB8] line-clamp-2">
                  {task.description}
                </p>

                <div className="text-[10px] text-[#8E9EB8] pt-1 flex items-center gap-3">
                  <span>ارجاع: <strong className="text-[#F1F5F9]">{task.createdByUserName}</strong></span>
                  {task.assignedUserName && (
                    <span>مسئول: <strong className="text-[#00D2FF]">{task.assignedUserName}</strong></span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                {task.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-1 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>شروع اقدام</span>
                  </button>
                )}

                {task.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تکمیل تسک</span>
                  </button>
                )}

                {task.actionUrl && (
                  <button
                    onClick={() => navigate(task.actionUrl!)}
                    className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="مشاهده در ماژول مربوطه"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
