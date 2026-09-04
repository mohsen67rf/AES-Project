// src/modules/tasks/presentation/components/UnitTasksDashboardWidget.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { TaskService } from '../../services/TaskService';
import { SYSTEM_ROLES, getRoleDefinition } from '../../../auth/domain/roles';
import { UnitTask, TaskPriority, TaskStatus } from '../../../../core/domain/types/task.types';
import type { User } from '../../../../core/domain/types/mine.types';
import {
  ClipboardCheck,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  RotateCw,
  ExternalLink,
  ChevronLeft,
  HardHat,
  Building2,
  Sparkles,
  AlertCircle,
  Briefcase
} from 'lucide-react';

interface UnitTasksDashboardWidgetProps {
  currentUser: User | null;
  onOpenAssignModal: () => void;
  onOpenTasksDrawer: () => void;
}

export const UnitTasksDashboardWidget: React.FC<UnitTasksDashboardWidgetProps> = ({
  currentUser,
  onOpenAssignModal,
  onOpenTasksDrawer,
}) => {
  const { isDark } = useTheme();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const isFa = lang === 'fa';

  const [unitTasks, setUnitTasks] = useState<UnitTask[]>([]);

  const loadTasks = () => {
    if (currentUser) {
      const userTasks = TaskService.getTasksForUser(currentUser);
      setUnitTasks(userTasks);
    } else {
      setUnitTasks(TaskService.getAllTasks().slice(0, 5));
    }
  };

  useEffect(() => {
    loadTasks();
  }, [currentUser]);

  const roleDef = currentUser ? getRoleDefinition(currentUser.role) : SYSTEM_ROLES[0];
  const pendingTasks = unitTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const urgentCount = unitTasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length;

  const handleQuickStatus = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    TaskService.updateTaskStatus(taskId, 'COMPLETED', currentUser, 'تکمیل سریع از طریق ویجت میز کار داشبورد');
    loadTasks();
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">فوری 🚨</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">بالا</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">متوسط</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/40">عادی</span>;
    }
  };

  return (
    <div 
      className={`rounded-[22px] border p-5.5 transition-all ${
        isDark 
          ? 'bg-[#1A264F] border-[#24356B]/30 text-[#F1F5F9] shadow-[0_12px_32px_rgba(7,11,26,0.5)]' 
          : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Header with Role Identity & Assign Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#24356B]/30">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border shadow-inner ${roleDef.badgeColor}`}>
            <roleDef.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black flex items-center gap-1.5 text-[#F1F5F9]">
                <span>کارتابل واحد {roleDef.department}</span>
              </h3>
              {urgentCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
                  {urgentCount} فوری
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8E9EB8] mt-0.5">
              <span className="text-[#00D2FF] font-bold">{roleDef.nameFa}</span>
              <span>•</span>
              <span>{pendingTasks.length} وظیفه فعال</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Open Unit Workspace */}
          <button
            onClick={() => navigate('/workspace')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#00D2FF] bg-[#141F42] hover:bg-[#1E2D5C] border border-[#24356B]/40 transition-all cursor-pointer"
            title="میز کار واحد"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>میز کار</span>
          </button>

          {/* Assign Task Button for Managers & Engineers */}
          <button
            onClick={onOpenAssignModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black text-slate-950 bg-gradient-to-r from-[#00D2FF] to-[#38BDF8] hover:brightness-110 shadow-[0_0_14px_rgba(0,210,255,0.35)] transition-all active:scale-95 cursor-pointer"
            title="ارجاع تسک جدید"
          >
            <Plus className="w-4 h-4" />
            <span>ارجاع</span>
          </button>

          {/* View All Tasks Drawer */}
          <button
            onClick={onOpenTasksDrawer}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-colors bg-[#141F42] hover:bg-[#1E2D5C] border-[#24356B]/40 text-[#8E9EB8]"
            title="مشاهده همه تسک‌ها"
          >
            <span>کارتابل ({unitTasks.length})</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="pt-4 space-y-2.5">
        {pendingTasks.length === 0 ? (
          <div className="py-6 text-center text-[#8E9EB8] space-y-1">
            <CheckCircle2 className="w-7 h-7 mx-auto text-[#00D2FF] mb-1 opacity-80" />
            <p className="text-xs font-bold text-[#F1F5F9]">وظیفه فعالی وجود ندارد</p>
          </div>
        ) : (
          pendingTasks.slice(0, 3).map((task, idx) => (
            <div
              key={`widget-task-${task.id}-${idx}`}
              onClick={onOpenTasksDrawer}
              className={`p-3.5 rounded-[16px] border cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isDark 
                  ? 'bg-[#141F42] border-[#24356B]/30 hover:border-[#00D2FF]/40 hover:bg-[#1A264F]' 
                  : 'bg-slate-50 border-slate-200 hover:border-indigo-300 shadow-sm'
              }`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-black text-[#00D2FF] bg-[#00D2FF]/10 px-2 py-0.5 rounded-full border border-[#00D2FF]/20">
                    {task.code}
                  </span>
                  {getPriorityBadge(task.priority)}
                  <span className="text-[11px] text-[#8E9EB8] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#8E9EB8]" />
                    مهلت: {new Date(task.dueDate).toLocaleDateString('fa-IR')}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#F1F5F9] line-clamp-1 leading-snug">
                  {task.title}
                </h4>

                <p className="text-[11px] text-[#8E9EB8] line-clamp-1">
                  {task.description}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {task.actionUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(task.actionUrl!);
                    }}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold text-[#00D2FF] bg-[#00D2FF]/10 hover:bg-[#00D2FF]/20 border border-[#00D2FF]/30 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>ورود به بخش</span>
                  </button>
                )}

                <button
                  onClick={(e) => handleQuickStatus(task.id, e)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                  title="تکمیل و بایگانی تسک"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>تکمیل</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UnitTasksDashboardWidget;
