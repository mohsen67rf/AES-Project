// src/modules/tasks/presentation/components/TaskAssignmentModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { SYSTEM_ROLES } from '../../../auth/domain/roles';
import { UserRepository } from '../../../../core/infrastructure/repositories';
import { TaskService } from '../../services/TaskService';
import { TaskPriority, UnitTask, TaskMapLocation } from '../../../../core/domain/types/task.types';
import type { User } from '../../../../core/domain/types/mine.types';
import { TaskInteractiveMapSelector } from './TaskInteractiveMapSelector';
import { MINE_MAP_BLOCKS } from './taskMapConstants';
import {
  ClipboardList,
  X,
  Send,
  AlertCircle,
  Clock,
  HardHat,
  Link as LinkIcon,
  FileText,
  UserCheck,
  Building2,
  Sparkles,
  CheckCircle2,
  Flame,
  Truck,
  Layers,
  ShieldAlert,
  Archive,
  Compass,
  Check,
} from 'lucide-react';

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onTaskCreated?: (task: UnitTask) => void;
  defaultRelatedModule?: 'BLOCKS' | 'EQUIPMENT' | 'GIS' | 'LAB' | 'WAREHOUSE' | 'HSE' | 'GENERAL';
  defaultEntityId?: string;
  defaultEntityCode?: string;
  defaultBench?: string;
}

// واحدهای سازمانی اصلی جهت ارجاع تسک
const TARGET_UNITS = [
  {
    roleId: 'MiningEngineer',
    title: 'مهندسی معدن و استخراج',
    department: 'مهندسی و طراحی پیت',
    icon: HardHat,
    color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    activeColor: 'border-cyan-400 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-400',
    module: 'BLOCKS' as const,
    defaultUrl: '/blocks-management',
  },
  {
    roleId: 'Geologist',
    title: 'زمین‌شناسی و عیارسنجی',
    department: 'اکتشاف و آزمایشگاه',
    icon: Layers,
    color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    activeColor: 'border-purple-400 bg-purple-500/20 text-purple-300 ring-2 ring-purple-400',
    module: 'LAB' as const,
    defaultUrl: '/mining-lifecycle',
  },
  {
    roleId: 'DispatchSupervisor',
    title: 'ماشین‌آلات و دیسپاچینگ',
    department: 'ترابری و ناوگان بارگیری',
    icon: Truck,
    color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    activeColor: 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400',
    module: 'EQUIPMENT' as const,
    defaultUrl: '/equipment',
  },
  {
    roleId: 'Surveyor',
    title: 'نقشه‌برداری، GIS و پهپاد',
    department: 'ژئودزی و فتوگرامتری',
    icon: Compass,
    color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    activeColor: 'border-blue-400 bg-blue-500/20 text-blue-300 ring-2 ring-blue-400',
    module: 'GIS' as const,
    defaultUrl: '/mine/map',
  },
  {
    roleId: 'HSEOfficer',
    title: 'ایمنی، بهداشت و بازرسی پیت',
    department: 'مدیریت بحران و پایش شیب',
    icon: ShieldAlert,
    color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    activeColor: 'border-rose-400 bg-rose-500/20 text-rose-300 ring-2 ring-rose-400',
    module: 'HSE' as const,
    defaultUrl: '/equipment',
  },
  {
    roleId: 'WarehouseOfficer',
    title: 'انبار، دپوها و مواد ناریه',
    department: 'لجستیک و مواد منفجره',
    icon: Archive,
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    activeColor: 'border-emerald-400 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-400',
    module: 'WAREHOUSE' as const,
    defaultUrl: '/warehouse',
  },
  {
    roleId: 'PitSupervisor',
    title: 'سرپرستی شیفت و کارگاه',
    department: 'عملیات پیت و آتشباری',
    icon: Flame,
    color: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
    activeColor: 'border-orange-400 bg-orange-500/20 text-orange-300 ring-2 ring-orange-400',
    module: 'BLOCKS' as const,
    defaultUrl: '/blocks-management',
  },
];

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onTaskCreated,
  defaultRelatedModule = 'GENERAL',
  defaultEntityId,
  defaultEntityCode,
  defaultBench = '1040',
}) => {
  const { isDark } = useTheme();
  const { lang } = useLanguage();
  const isFa = lang === 'fa';

  const [allUsers] = useState<User[]>(() => UserRepository.getAll());

  const getInitialActionUrl = (module: string) => {
    if (module === 'BLOCKS') return '/blocks-management';
    if (module === 'EQUIPMENT') return '/equipment';
    if (module === 'LAB') return '/mining-lifecycle';
    if (module === 'GIS') return '/mine/map';
    if (module === 'WAREHOUSE') return '/warehouse';
    if (module === 'HSE') return '/equipment';
    return '';
  };

  const getInitialMapLocation = (): TaskMapLocation | undefined => {
    if (!defaultEntityCode) return undefined;
    const found = MINE_MAP_BLOCKS.find(
      (b) => b.code.replace(/\s+/g, '') === defaultEntityCode.replace(/\s+/g, '')
    );
    if (found) {
      return {
        type: 'BENCH_ZONE',
        bench: found.bench,
        blockCode: found.code,
        blockId: found.id,
        zoneName: `محدوده پله ${found.bench} - بلوک ${found.code} (${found.gradeText})`,
        x: found.center[0],
        y: found.center[1],
        polygonPoints: found.polygon,
        areaM2: found.areaM2,
        eastingUTM: found.eastingUTM,
        northingUTM: found.northingUTM,
        elevation: parseInt(found.bench, 10),
        notes: `ارجاع مستقیم برای بلوک ${found.code}`,
        comment: `اقدام میدانی و نظارت بر بلوک ${found.code}`,
      };
    }
    return {
      type: 'BENCH_ZONE',
      bench: defaultBench || '1040',
      blockCode: defaultEntityCode,
      zoneName: `پله ${defaultBench || '1040'} - بلوک ${defaultEntityCode}`,
      x: 58,
      y: 54,
      areaM2: 1850,
      elevation: parseInt(defaultBench || '1040', 10),
      comment: `بررسی محدوده بلوک ${defaultEntityCode}`,
    };
  };

  const [title, setTitle] = useState(() => {
    if (defaultEntityCode) {
      return `اقدام میدانی و نظارت بر بلوک ${defaultEntityCode}`;
    }
    return '';
  });
  const [description, setDescription] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('MiningEngineer');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [dueDateDays, setDueDateDays] = useState<number>(2);
  const [relatedModule, setRelatedModule] = useState<'BLOCKS' | 'EQUIPMENT' | 'GIS' | 'LAB' | 'WAREHOUSE' | 'HSE' | 'GENERAL'>(defaultRelatedModule);
  const [customActionUrl, setCustomActionUrl] = useState(() => getInitialActionUrl(defaultRelatedModule));
  const [mapLocation, setMapLocation] = useState<TaskMapLocation | undefined>(() => getInitialMapLocation());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // لیست کاربران عضو واحد / نقش انتخاب شده
  const roleUsers = allUsers.filter((u) => u.role.toLowerCase() === selectedRole.toLowerCase());
  const selectedRoleDef =
    SYSTEM_ROLES.find((r) => r.id.toLowerCase() === selectedRole.toLowerCase()) || SYSTEM_ROLES[1];

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    const matched = allUsers.filter((u) => u.role.toLowerCase() === newRole.toLowerCase());
    if (matched.length > 0) {
      setSelectedUserId(matched[0].code || matched[0].id);
    } else {
      setSelectedUserId('');
    }

    const unitInfo = TARGET_UNITS.find((u) => u.roleId === newRole);
    if (unitInfo) {
      setRelatedModule(unitInfo.module);
      setCustomActionUrl(unitInfo.defaultUrl);
    }
  };

  // اضافه کردن کامنت نقشه به شرح کلی تسک
  const handleApplyCommentToDescription = (commentText: string) => {
    if (!commentText.trim()) return;
    setDescription((prev) => {
      if (!prev.trim()) return commentText.trim();
      if (prev.includes(commentText.trim())) return prev;
      return `${prev}\n\n[ملاحظات مکانی نقشه]: ${commentText.trim()}`;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    setIsSubmitting(true);

    const assignedUser = allUsers.find((u) => u.code === selectedUserId || u.id === selectedUserId);
    const dueDate = new Date(Date.now() + dueDateDays * 86400000).toISOString();

    // اگر توضیحات خالی بود، از کامنت نقشه یا عنوان استفاده شود
    const finalDescription =
      description.trim() ||
      mapLocation?.comment ||
      mapLocation?.notes ||
      `ارجاع اقدام برای ${title.trim()}`;

    try {
      const createdTask = TaskService.createTask(
        {
          title: title.trim(),
          description: finalDescription,
          department: selectedRoleDef.department,
          assignedRole: selectedRole,
          assignedUserId: assignedUser?.code || assignedUser?.id || undefined,
          assignedUserName: assignedUser?.fullName || selectedRoleDef.nameFa,
          priority,
          dueDate,
          relatedModule,
          relatedEntityId: defaultEntityId || mapLocation?.blockId,
          relatedEntityCode: defaultEntityCode || mapLocation?.blockCode,
          actionUrl: customActionUrl.trim() || undefined,
          mapLocation: mapLocation || undefined,
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
        // بازنشانی مقادیر فرم
        setTitle('');
        setDescription('');
        setMapLocation(undefined);
      }, 1000);
    } catch (err) {
      console.error('Failed to create task:', err);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden my-6 ${
            isDark ? 'bg-[#0B1222] border-[#1E2E52] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
          dir={isFa ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2E52] bg-gradient-to-r from-blue-950/60 via-[#0F1A36] to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <span>ارجاع تسک و دستور کار میدانی به واحدها</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Task Assignment & Referral
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ثبت روی نقشه مرجع مهندسی • ترسیم محدوده، خط یا نقطه • کامنت‌گذاری • انتخاب واحد • تعیین فوریت
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* پیام موفقیت */}
          {successMessage && (
            <div className="m-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">تسک با موفقیت صادر و به کارتابل واحد مربوطه ارجاع گردید!</p>
                <p className="text-[11px] text-emerald-300/80 mt-0.5">
                  هندسه ترسیم شده، کامنت‌ها و اولویت تسک در کارتابل و نقشه سامانه ثبت شد.
                </p>
              </div>
            </div>
          )}

          {/* بدنه فرم ارجاع تسک به ترتیب درخواست کاربر */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* گام ۱: نقشه مرجع آپلود شده، ابزار ترسیم (محدوده، خط، نقطه) و کامنت‌گذاری */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-black text-sm text-cyan-400 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                    ۱
                  </div>
                  <span>نقشه مرجع مهندسی، ترسیم محدوده/خط/نقطه و کامنت‌گذاری</span>
                  <span className="text-cyan-400 text-xs">*</span>
                </label>

                {mapLocation && (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>موقعیت مکانی ثبت شد</span>
                  </span>
                )}
              </div>

              {/* کامپوننت نقشه تعاملی با تصویر مرجع، ترسیم و کامنت‌گذاری */}
              <TaskInteractiveMapSelector
                value={mapLocation}
                onChange={setMapLocation}
                selectedBench={defaultBench || '1040'}
                isDark={isDark}
                onApplyCommentToDescription={handleApplyCommentToDescription}
              />
            </div>

            {/* گام ۲: مشخصات تسک و انتخاب واحد سازمانی گیرنده */}
            <div className="space-y-4 pt-2 border-t border-[#1E2E52]">
              <label className="font-black text-sm text-cyan-400 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                  ۲
                </div>
                <span>مشخصات تسک و انتخاب واحد گیرنده ارجاع</span>
                <span className="text-rose-400 text-xs">*</span>
              </label>

              {/* عنوان تسک */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>عنوان اقدام / دستور کار تسک <span className="text-rose-400">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">واضح و مشخص جهت پیگیری سریع واحدها</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: تسطیح پله ۱۰۴۰ و طراحی پترن چال‌های انفجاری محدوده شرقی"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-bold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                    isDark ? 'bg-slate-900/90 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* انتخاب واحد گیرنده (کارت‌های تعاملی دپارتمان‌ها) */}
              <div>
                <label className="block font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>واحد یا دپارتمان مورد نظر برای ارجاع تسک: <span className="text-rose-400">*</span></span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {TARGET_UNITS.map((unit, uIdx) => {
                    const UnitIcon = unit.icon;
                    const isSelected = selectedRole.toLowerCase() === unit.roleId.toLowerCase();
                    return (
                      <button
                        key={`unit-role-${unit.roleId}-${uIdx}`}
                        type="button"
                        onClick={() => handleRoleChange(unit.roleId)}
                        className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                          isSelected ? unit.activeColor : `${unit.color} hover:bg-white/5`
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <UnitIcon className="w-4 h-4" />
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-black text-xs text-white leading-tight">{unit.title}</div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">{unit.department}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* انتخاب فرد مشخص در آن واحد (اختیاری) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تخصیص به فرد مشخص در این واحد (اختیاری)</span>
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-bold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      isDark ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="">ارجاع عمومی به سرپرست و کارشناسان واحد</option>
                    {roleUsers.map((u, idx) => (
                      <option key={`u-${u.id}-${idx}`} value={u.code || u.id}>
                        {u.fullName} ({u.code}) - {u.role}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {roleUsers.length > 0
                      ? `${roleUsers.length} پرسنل تخصصی در این واحد آماده پیگیری هستند.`
                      : 'تسک در کارتابل عمومی این واحد نمایش داده خواهد شد.'}
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>لینک مستقیم صفحه جهت اقدام میدانی سریع</span>
                  </label>
                  <input
                    type="text"
                    value={customActionUrl}
                    onChange={(e) => setCustomActionUrl(e.target.value)}
                    placeholder="/blocks-management"
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-left transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      isDark ? 'bg-slate-900/90 border-slate-700 text-cyan-300 placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-cyan-700 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* شرح فنی و دستورالعمل اجرایی */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>شرح دستور کار فنی و دستورالعمل اجرایی تسک</span>
                  </label>
                  {mapLocation?.comment && (
                    <button
                      type="button"
                      onClick={() => handleApplyCommentToDescription(mapLocation.comment || '')}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>افزودن کامنت نقشه به شرح تسک</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="دستورالعمل تکمیلی، الزامات فنی، شیفت کاری، نوع ماشین‌آلات یا گزارش مورد نیاز را یادداشت نمایید..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                    isDark ? 'bg-slate-900/90 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* گام ۳: در انتها انتخاب فوریت و اولویت انجام تسک */}
            <div className="space-y-3 pt-2 border-t border-[#1E2E52]">
              <label className="font-black text-sm text-cyan-400 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                  ۳
                </div>
                <span>در انتها: انتخاب فوریت، اولویت و مهلت انجام تسک</span>
                <span className="text-amber-400 text-xs">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* اولویت و فوریت */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>فوریت و اولویت اقدام</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'LOW', label: 'عادی', color: 'border-slate-600 text-slate-300 hover:border-slate-400' },
                      { id: 'MEDIUM', label: 'متوسط', color: 'border-cyan-500/40 text-cyan-300 hover:border-cyan-400' },
                      { id: 'HIGH', label: 'بالا', color: 'border-amber-500/40 text-amber-300 hover:border-amber-400' },
                      { id: 'URGENT', label: 'فوری 🚨', color: 'border-rose-500/60 text-rose-300 hover:border-rose-400 font-black' },
                    ].map((p, pIdx) => (
                      <button
                        key={`task-prio-${p.id}-${pIdx}`}
                        type="button"
                        onClick={() => setPriority(p.id as TaskPriority)}
                        className={`py-2.5 px-1 rounded-xl border text-center font-bold text-xs transition-all ${
                          priority === p.id
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30 ring-2 ring-cyan-400'
                            : `${isDark ? 'bg-slate-900/70' : 'bg-slate-100'} ${p.color}`
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* مهلت اقدام */}
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
                    ].map((d, dIdx) => (
                      <button
                        key={`task-dead-${d.days}-${dIdx}`}
                        type="button"
                        onClick={() => setDueDateDays(d.days)}
                        className={`py-2.5 px-1 rounded-xl border text-center font-bold text-xs transition-all ${
                          dueDateDays === d.days
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30 ring-2 ring-cyan-400'
                            : `${isDark ? 'bg-slate-900/70 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ارجاع‌دهنده و امضا */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-[11px] ${
                isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-cyan-400" />
                <span>
                  ثبت توسط: <strong className="text-slate-200 font-bold">{currentUser?.fullName}</strong> ({currentUser?.role})
                </span>
              </div>
              <span className="font-mono text-slate-400">
                ارجاع به: <strong className="text-cyan-300 font-bold">{selectedRoleDef.nameFa}</strong>
              </span>
            </div>

            {/* دکمه‌های عملیاتی فرم */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2E52]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold transition-colors"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl font-black text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'در حال صدور و ارجاع...' : 'ثبت نهایی و ارجاع تسک به واحد'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskAssignmentModal;
