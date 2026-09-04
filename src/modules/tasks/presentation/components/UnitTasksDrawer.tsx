// src/modules/tasks/presentation/components/UnitTasksDrawer.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { TaskService } from '../../services/TaskService';
import { SYSTEM_ROLES, getRoleDefinition } from '../../../auth/domain/roles';
import { UserRepository } from '../../../../core/infrastructure/repositories';
import { UnitTask, TaskStatus, TaskPriority } from '../../../../core/domain/types/task.types';
import type { User } from '../../../../core/domain/types/mine.types';
import {
  ClipboardCheck,
  X,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRightLeft,
  ChevronRight,
  ExternalLink,
  User as UserIcon,
  HardHat,
  MessageSquare,
  Building2,
  Tag,
  Check,
  RotateCw,
} from 'lucide-react';

interface UnitTasksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenAssignModal?: () => void;
}

export const UnitTasksDrawer: React.FC<UnitTasksDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAssignModal,
}) => {
  const { isDark } = useTheme();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const isFa = lang === 'fa';

  const [tasks, setTasks] = useState<UnitTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<UnitTask | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'MY_UNIT' | 'ALL_TASKS'>('MY_UNIT');

  // Referral Modal
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [referTargetRole, setReferTargetRole] = useState('MiningEngineer');
  const [referTargetUserId, setReferTargetUserId] = useState('');
  const [referNote, setReferNote] = useState('');

  // Complete Note Modal
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completionComment, setCompletionComment] = useState('');

  const loadTasks = () => {
    if (activeTab === 'MY_UNIT') {
      setTasks(TaskService.getTasksForUser(currentUser));
    } else {
      setTasks(TaskService.getAllTasks());
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen, currentUser, activeTab]);

  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'ALL' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.code.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.department.toLowerCase().includes(q) ||
        (task.assignedUserName && task.assignedUserName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStatusChange = (taskId: string, newStatus: TaskStatus, comment?: string) => {
    if (!currentUser) return;
    const updated = TaskService.updateTaskStatus(taskId, newStatus, currentUser, comment);
    if (updated) {
      loadTasks();
      if (selectedTask?.id === taskId) {
        setSelectedTask(updated);
      }
    }
  };

  const handleReferTask = () => {
    if (!selectedTask || !currentUser || !referNote.trim()) return;

    const allUsers = UserRepository.getAll();
    const targetRoleDef = SYSTEM_ROLES.find(r => r.id.toLowerCase() === referTargetRole.toLowerCase()) || SYSTEM_ROLES[0];
    const targetUser = allUsers.find(u => u.code === referTargetUserId || u.id === referTargetUserId);
    const targetUserName = targetUser ? targetUser.fullName : targetRoleDef.nameFa;

    const updated = TaskService.referTask(
      selectedTask.id,
      referTargetRole,
      referTargetUserId || targetRoleDef.id,
      targetUserName,
      targetRoleDef.department,
      currentUser,
      referNote.trim()
    );

    if (updated) {
      loadTasks();
      setSelectedTask(updated);
      setIsReferModalOpen(false);
      setReferNote('');
    }
  };

  const handleCompleteTask = () => {
    if (!selectedTask || !currentUser) return;
    handleStatusChange(selectedTask.id, 'COMPLETED', completionComment.trim() || 'اقدام انجام شد و تسک بسته شد.');
    setIsCompleteModalOpen(false);
    setCompletionComment('');
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

  const getStatusBadge = (s: TaskStatus) => {
    switch (s) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1"><Check className="w-3 h-3" /> تکمیل شده</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center gap-1"><RotateCw className="w-3 h-3 animate-spin" /> در حال اقدام</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1"><Clock className="w-3 h-3" /> در انتظار اقدام</span>;
    }
  };

  const userRoleDef = currentUser ? getRoleDefinition(currentUser.role) : SYSTEM_ROLES[0];
  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`w-full max-w-4xl h-full flex flex-col shadow-2xl border-r ${
            isDark ? 'bg-[#0A101D] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
          dir={isFa ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700/60 bg-gradient-to-l from-indigo-950/40 via-purple-950/20 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black">کارتابل تسک‌ها و ارجاعات واحدها</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Unit Tasks Hub
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>واحد فعلی: <strong className="text-indigo-400 font-bold">{userRoleDef.department}</strong></span>
                  <span>•</span>
                  <span>نقش: <strong className="text-slate-300 font-bold">{userRoleDef.nameFa}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenAssignModal && (
                <button
                  onClick={onOpenAssignModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>ارجاع تسک جدید</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/30 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('MY_UNIT')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'MY_UNIT'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                تسک‌های واحد من ({tasks.length})
              </button>

              <button
                onClick={() => setActiveTab('ALL_TASKS')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'ALL_TASKS'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                همه ارجاعات معدن
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <strong>{pendingCount}</strong> در انتظار
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <strong>{inProgressCount}</strong> در حال اقدام
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <strong>{completedCount}</strong> تکمیل شده
              </span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در عنوان، کد تسک، واحد سازمانی..."
                className={`w-full pr-9 pl-3 py-2 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl border font-bold ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="ALL">همه وضعیت‌ها</option>
                <option value="PENDING">در انتظار اقدام</option>
                <option value="IN_PROGRESS">در حال انجام</option>
                <option value="COMPLETED">تکمیل شده</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl border font-bold ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="ALL">همه فوریت‌ها</option>
                <option value="URGENT">فوری 🚨</option>
                <option value="HIGH">بالا</option>
                <option value="MEDIUM">متوسط</option>
                <option value="LOW">عادی</option>
              </select>
            </div>
          </div>

          {/* Main Content: Tasks List & Detail Side */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-x divide-x-reverse divide-slate-800">
            {/* Task List */}
            <div className="md:col-span-5 overflow-y-auto p-4 space-y-2.5 custom-scrollbar max-h-[calc(100vh-220px)]">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <ClipboardCheck className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs font-bold">تسکی با این مشخصات یافت نشد.</p>
                </div>
              ) : (
                filteredTasks.map((t) => {
                  const isSelected = selectedTask?.id === t.id;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-950/50'
                          : isDark
                          ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-[11px] font-black text-indigo-400">{t.code}</span>
                        <div className="flex items-center gap-1.5">
                          {getPriorityBadge(t.priority)}
                          {getStatusBadge(t.status)}
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-relaxed mb-2">
                        {t.title}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-indigo-400" />
                          <span className="truncate max-w-[130px]">{t.department}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>مهلت: {new Date(t.dueDate).toLocaleDateString('fa-IR')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Task Detail Pane */}
            <div className="md:col-span-7 overflow-y-auto p-6 space-y-6 custom-scrollbar max-h-[calc(100vh-220px)] bg-slate-950/30">
              {selectedTask ? (
                <div className="space-y-6 text-xs">
                  {/* Title & Status */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                        {selectedTask.code}
                      </span>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(selectedTask.priority)}
                        {getStatusBadge(selectedTask.status)}
                      </div>
                    </div>

                    <h3 className="text-base font-black text-white leading-relaxed">
                      {selectedTask.title}
                    </h3>
                  </div>

                  {/* Quick Action Control Bar */}
                  <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {selectedTask.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(selectedTask.id, 'IN_PROGRESS', 'آغاز اقدام توسط مسئول واحد')}
                          className="px-3 py-1.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>شروع اقدام</span>
                        </button>
                      )}

                      {selectedTask.status !== 'COMPLETED' && (
                        <button
                          onClick={() => setIsCompleteModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تکمیل و بستن تسک</span>
                        </button>
                      )}

                      <button
                        onClick={() => setIsReferModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl font-bold bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>ارجاع به واحد دیگر</span>
                      </button>
                    </div>

                    {selectedTask.actionUrl && (
                      <button
                        onClick={() => {
                          onClose();
                          navigate(selectedTask.actionUrl!);
                        }}
                        className="px-3 py-1.5 rounded-xl font-bold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>ورود به صفحه عملیات</span>
                      </button>
                    )}
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">واحد و نقش مسئول:</span>
                      <strong className="text-slate-200 font-bold">{selectedTask.department}</strong>
                      <p className="text-[10px] text-indigo-400 mt-0.5">مسئول: {selectedTask.assignedUserName || 'عمومی واحد'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">صادرکننده / ارجاع‌دهنده:</span>
                      <strong className="text-slate-200 font-bold">{selectedTask.createdByUserName}</strong>
                      <p className="text-[10px] text-slate-500 mt-0.5">{selectedTask.createdByUserRole}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">مهلت اقدام (Deadline):</span>
                      <strong className="text-amber-400 font-bold">{new Date(selectedTask.dueDate).toLocaleString('fa-IR')}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">بخش مرتبط سامانه:</span>
                      <strong className="text-cyan-400 font-bold">{selectedTask.relatedModule || 'عمومی'}</strong>
                    </div>
                  </div>

                  {/* Technical Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>شرح و دستورالعمل اقدام</span>
                    </h4>
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                      {selectedTask.description}
                    </div>
                  </div>

                  {/* Completion Note (if any) */}
                  {selectedTask.completionNotes && (
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>گزارش نهایی تکمیل تسک:</span>
                      </div>
                      <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                        {selectedTask.completionNotes}
                      </p>
                    </div>
                  )}

                  {/* History / Audit Trail */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>سوابق گردش کار و ارجاعات (Audit Trail)</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedTask.history?.map((h) => (
                        <div
                          key={h.id}
                          className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start justify-between gap-3 text-[11px]"
                        >
                          <div className="space-y-0.5">
                            <p className="text-slate-300 font-medium">{h.comment}</p>
                            <p className="text-[10px] text-slate-500">
                              توسط: <strong className="text-indigo-400">{h.byUserName}</strong> ({h.byUserRole})
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap font-mono">
                            {new Date(h.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                  <ClipboardCheck className="w-12 h-12 text-slate-700" />
                  <p className="text-xs font-bold text-slate-400">یک تسک را از لیست انتخاب کنید تا جزئیات و گردش کار آن نمایش داده شود.</p>
                </div>
              )}
            </div>
          </div>

          {/* Referral Modal Overlay */}
          {isReferModalOpen && selectedTask && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${
                isDark ? 'bg-[#0E1524] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <h3 className="text-sm font-black flex items-center gap-2 text-purple-400">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>ارجاع مجدد تسک {selectedTask.code}</span>
                  </h3>
                  <button onClick={() => setIsReferModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-slate-300">واحد و نقش مقصد:</label>
                    <select
                      value={referTargetRole}
                      onChange={(e) => {
                        setReferTargetRole(e.target.value);
                        setReferTargetUserId('');
                      }}
                      className="w-full p-2.5 rounded-xl border font-bold bg-slate-900 border-slate-700 text-white"
                    >
                      {SYSTEM_ROLES.map(r => (
                        <option key={r.id} value={r.id}>{r.nameFa} ({r.department})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-300">علت ارجاع / دستور پیگیری:</label>
                    <textarea
                      rows={3}
                      value={referNote}
                      onChange={(e) => setReferNote(e.target.value)}
                      placeholder="توضیح دهید چرا این تسک به واحد مقصد ارجاع داده می‌شود..."
                      className="w-full p-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsReferModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleReferTask}
                    disabled={!referNote.trim()}
                    className="px-5 py-2 rounded-xl font-black text-white bg-purple-600 hover:bg-purple-500 text-xs disabled:opacity-50"
                  >
                    ثبت ارجاع
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Completion Modal Overlay */}
          {isCompleteModalOpen && selectedTask && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${
                isDark ? 'bg-[#0E1524] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <h3 className="text-sm font-black flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ثبت گزارش تکمیل تسک {selectedTask.code}</span>
                  </h3>
                  <button onClick={() => setIsCompleteModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-slate-300">توضیحات و اقدامات انجام شده:</label>
                    <textarea
                      rows={3}
                      value={completionComment}
                      onChange={(e) => setCompletionComment(e.target.value)}
                      placeholder="نتایج آزمایش، شماره سند، اصلاح پله یا وضعیت نهایی را ثبت کنید..."
                      className="w-full p-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsCompleteModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleCompleteTask}
                    className="px-5 py-2 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-500 text-xs"
                  >
                    تکمیل و بایگانی تسک
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UnitTasksDrawer;
