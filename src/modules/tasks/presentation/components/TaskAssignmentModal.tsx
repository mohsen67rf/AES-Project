// src/modules/tasks/presentation/components/TaskAssignmentModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { SYSTEM_ROLES } from '../../../auth/domain/roles';
import { UserRepository } from '../../../../core/infrastructure/repositories';
import { TaskService } from '../../services/TaskService';
import { TaskPriority, UnitTask } from '../../../../core/domain/types/task.types';
import type { User } from '../../../../core/domain/types/mine.types';
import {
  ClipboardList,
  X,
  Send,
  AlertCircle,
  Clock,
  HardHat,
  Tag,
  Link as LinkIcon,
  FileText,
  UserCheck,
  Building2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onTaskCreated?: (task: UnitTask) => void;
  defaultRelatedModule?: 'BLOCKS' | 'EQUIPMENT' | 'GIS' | 'LAB' | 'WAREHOUSE' | 'HSE' | 'GENERAL';
  defaultEntityId?: string;
  defaultEntityCode?: string;
}

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onTaskCreated,
  defaultRelatedModule = 'GENERAL',
  defaultEntityId,
  defaultEntityCode,
}) => {
  const { isDark } = useTheme();
  const { lang } = useLanguage();
  const isFa = lang === 'fa';

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('MiningEngineer');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [dueDateDays, setDueDateDays] = useState<number>(2);
  const [relatedModule, setRelatedModule] = useState<'BLOCKS' | 'EQUIPMENT' | 'GIS' | 'LAB' | 'WAREHOUSE' | 'HSE' | 'GENERAL'>(defaultRelatedModule);
  const [customActionUrl, setCustomActionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAllUsers(UserRepository.getAll());
      setSuccessMessage(false);
      
      // Preset action URL based on module
      if (defaultRelatedModule === 'BLOCKS') setCustomActionUrl('/blocks-management');
      else if (defaultRelatedModule === 'EQUIPMENT') setCustomActionUrl('/equipment');
      else if (defaultRelatedModule === 'LAB') setCustomActionUrl('/mining-lifecycle');
      else if (defaultRelatedModule === 'GIS') setCustomActionUrl('/mine/map');
      else if (defaultRelatedModule === 'WAREHOUSE') setCustomActionUrl('/warehouse');
      else if (defaultRelatedModule === 'HSE') setCustomActionUrl('/equipment');
    }
  }, [isOpen, defaultRelatedModule]);

  // Filter users matching selected role
  const roleUsers = allUsers.filter(u => u.role.toLowerCase() === selectedRole.toLowerCase());
  const selectedRoleDef = SYSTEM_ROLES.find(r => r.id.toLowerCase() === selectedRole.toLowerCase()) || SYSTEM_ROLES[1];

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    const matched = allUsers.filter(u => u.role.toLowerCase() === newRole.toLowerCase());
    if (matched.length > 0) {
      setSelectedUserId(matched[0].code || matched[0].id);
    } else {
      setSelectedUserId('');
    }

    // Auto suggest related module based on role
    if (newRole === 'MiningEngineer') {
      setRelatedModule('BLOCKS');
      setCustomActionUrl('/blocks-management');
    } else if (newRole === 'Geologist') {
      setRelatedModule('LAB');
      setCustomActionUrl('/mining-lifecycle');
    } else if (newRole === 'Surveyor') {
      setRelatedModule('GIS');
      setCustomActionUrl('/mine/map');
    } else if (newRole === 'DispatchSupervisor' || newRole === 'PitSupervisor') {
      setRelatedModule('EQUIPMENT');
      setCustomActionUrl('/equipment');
    } else if (newRole === 'LabTechnician') {
      setRelatedModule('LAB');
      setCustomActionUrl('/mining-lifecycle');
    } else if (newRole === 'WarehouseOfficer') {
      setRelatedModule('WAREHOUSE');
      setCustomActionUrl('/warehouse');
    } else if (newRole === 'HSEOfficer') {
      setRelatedModule('HSE');
      setCustomActionUrl('/equipment');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !currentUser) return;

    setIsSubmitting(true);

    const assignedUser = allUsers.find(u => u.code === selectedUserId || u.id === selectedUserId);
    const dueDate = new Date(Date.now() + dueDateDays * 86400000).toISOString();

    try {
      const createdTask = TaskService.createTask(
        {
          title: title.trim(),
          description: description.trim(),
          department: selectedRoleDef.department,
          assignedRole: selectedRole,
          assignedUserId: assignedUser?.code || assignedUser?.id || undefined,
          assignedUserName: assignedUser?.fullName || selectedRoleDef.nameFa,
          priority,
          dueDate,
          relatedModule,
          actionUrl: customActionUrl.trim() || undefined,
        },
        currentUser
      );

      setSuccessMessage(true);
      if (onTaskCreated) {
        onTaskCreated(createdTask);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
      }, 1000);
    } catch (err) {
      console.error('Failed to create task:', err);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-8 ${
            isDark ? 'bg-[#0E1524] border-[#1E293B] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
          dir={isFa ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <span>ارجاع تسک و اقدام جدید به واحدها</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Task Assignment
                  </span>
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="m-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">تسک با موفقیت صادر و به کارتابل واحد مربوطه ارجاع شد!</p>
                <p className="text-[11px] text-emerald-300/80 mt-0.5">مسئول مربوطه اعلان اقدام فوری دریافت خواهد کرد.</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Task Title */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>عنوان اقدام / تسک <span className="text-rose-400">*</span></span>
                <span className="text-[10px] text-slate-500 font-normal">واضح و مشخص جهت پیگیری سریع</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: بررسی شیب پله ۱۰۴۰ و طراحی چال‌های انفجاری بلوک B-12"
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isDark ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Target Role & Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>واحد و نقش سازمانی گیرنده <span className="text-rose-400">*</span></span>
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  {SYSTEM_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameFa} ({r.department})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-indigo-400 mt-1 font-medium">
                  {selectedRoleDef.descriptionFa}
                </p>
              </div>

              {/* Specific Assignee User (Optional) */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تخصیص به فرد مشخص (اختیاری)</span>
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="">همه کارشناسان این واحد (عمومی)</option>
                  {roleUsers.map((u) => (
                    <option key={u.id} value={u.code || u.id}>
                      {u.fullName} ({u.code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  {roleUsers.length > 0 
                    ? `تعداد ${roleUsers.length} پرسنل فعال در این نقش یافت شد.` 
                    : 'ارجاع به صورت عمومی به سرپرست واحد خواهد بود.'}
                </p>
              </div>
            </div>

            {/* Priority & Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>اولویت و فوریت اقدام</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'LOW', label: 'عادی', color: 'border-slate-600 text-slate-300 hover:border-slate-400' },
                    { id: 'MEDIUM', label: 'متوسط', color: 'border-cyan-500/40 text-cyan-300 hover:border-cyan-400' },
                    { id: 'HIGH', label: 'بالا', color: 'border-amber-500/40 text-amber-300 hover:border-amber-400' },
                    { id: 'URGENT', label: 'فوری 🚨', color: 'border-rose-500/60 text-rose-300 hover:border-rose-400 font-black' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id as TaskPriority)}
                      className={`py-2 px-1 rounded-xl border text-center font-bold text-[11px] transition-all ${
                        priority === p.id 
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40' 
                          : `${isDark ? 'bg-slate-900/60' : 'bg-slate-100'} ${p.color}`
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>مهلت اقدام (Deadline)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { days: 0.5, label: '۱۲ ساعت' },
                    { days: 1, label: '۲۴ ساعت' },
                    { days: 2, label: '۲ روز' },
                    { days: 5, label: '۵ روز' },
                  ].map((d) => (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setDueDateDays(d.days)}
                      className={`py-2 px-1 rounded-xl border text-center font-bold text-[11px] transition-all ${
                        dueDateDays === d.days
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                          : `${isDark ? 'bg-slate-900/60 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description & Technical Instructions */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>شرح فنی، الزامات و دستورالعمل اجرایی <span className="text-rose-400">*</span></span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیحات تکمیلی، موقعیت پیت یا پله، پارامترهای فنی، شماره چال یا گزارش مورد نیاز..."
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isDark ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Module Connection & Action Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span>بخش مرتبط در سامانه</span>
                </label>
                <select
                  value={relatedModule}
                  onChange={(e) => setRelatedModule(e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="BLOCKS">طراحی و مدیریت بلوک‌ها (Blocks)</option>
                  <option value="LAB">آزمایشگاه و عیارسنجی (Assay & Lab)</option>
                  <option value="EQUIPMENT">ماشین‌آلات و ترابری (Equipment)</option>
                  <option value="GIS">نقشه، توپوگرافی و پهپاد (GIS Map)</option>
                  <option value="WAREHOUSE">انبار، دپوها و ناریه (Warehouse)</option>
                  <option value="HSE">ایمنی و بازرسی پیت (HSE)</option>
                  <option value="GENERAL">عمومی و ستادی (General)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>لینک مستقیم صفحه جهت اقدام سریع</span>
                </label>
                <input
                  type="text"
                  value={customActionUrl}
                  onChange={(e) => setCustomActionUrl(e.target.value)}
                  placeholder="/blocks-management"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-cyan-300 placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-cyan-700 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Sender Footprint */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-[11px] ${
              isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-indigo-400" />
                <span>ارجاع دهنده: <strong className="text-slate-200 font-bold">{currentUser?.fullName}</strong> ({currentUser?.role})</span>
              </div>
              <span className="font-mono text-slate-500">تاریخ: امروز</span>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold transition-colors"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'در حال صدور و ارجاع...' : 'ثبت و ارجاع تسک به واحد'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskAssignmentModal;
