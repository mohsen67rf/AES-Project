// src/modules/auth/presentation/components/UserProfileModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme, THEME_OPTIONS } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { SYSTEM_ROLES, getRoleDefinition, PERMISSION_LIST } from '../../domain/roles';
import { TaskService } from '../../../tasks/services/TaskService';
import { UnitTask } from '../../../../core/domain/types/task.types';
import type { User } from '../../../../core/domain/types/mine.types';
import {
  User as UserIcon,
  X,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  ClipboardList,
  Key,
  ExternalLink,
  ChevronRight,
  UserCheck,
  RefreshCw,
  Plus,
  HardHat,
  Palette,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSwitchUser?: (newUser: User) => void;
  onOpenAssignModal?: () => void;
  onOpenTasksDrawer?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  onOpenAssignModal,
  onOpenTasksDrawer,
}) => {
  const { isDark, isCyber, theme, setTheme } = useTheme();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const isFa = lang === 'fa';

  const [unitTasks, setUnitTasks] = useState<UnitTask[]>([]);
  const [activeTab, setActiveTab] = useState<'TASKS' | 'PERMISSIONS' | 'SWITCH_ROLE' | 'THEME'>('TASKS');

  useEffect(() => {
    if (isOpen && currentUser) {
      const tasks = TaskService.getTasksForUser(currentUser);
      setUnitTasks(tasks);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const roleDef = getRoleDefinition(currentUser.role);
  const pendingTasks = unitTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden my-8 ${
            isDark ? 'bg-[#0E1524] border-[#1E293B] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
          dir={isFa ? 'rtl' : 'ltr'}
        >
          {/* Top Banner with Avatar & Role */}
          <div className="relative p-6 bg-gradient-to-r from-indigo-950 via-purple-950/80 to-slate-950 border-b border-slate-800 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-xl shadow-indigo-900/50"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" title="آنلاین" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">{currentUser.fullName}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleDef.badgeColor}`}>
                    {roleDef.nameFa}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-indigo-400" /> {currentUser.department || roleDef.department}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-400">کد پرسنلی: {currentUser.code}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs in Profile */}
          <div className="px-6 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('TASKS')}
              className={`py-3 border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'TASKS'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>تسک‌های ارجاعی به واحد من ({unitTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('PERMISSIONS')}
              className={`py-3 border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'PERMISSIONS'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>دسترسی‌ها و مجوزها ({roleDef.defaultPermissions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('SWITCH_ROLE')}
              className={`py-3 border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'SWITCH_ROLE'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>تغییر نقش سریع (Switch Unit)</span>
            </button>

            <button
              onClick={() => setActiveTab('THEME')}
              className={`py-3 border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'THEME'
                  ? 'border-cyan-400 text-cyan-400 font-black'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4 text-pink-400" />
              <span>پالت و تم ظاهری ({theme === 'cyber' ? '⚡ سایبر نئون' : theme === 'dark' ? '🌙 شب' : '☀️ روز'})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 max-h-[460px] overflow-y-auto custom-scrollbar">
            {activeTab === 'TASKS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300">
                      وظایف و دستورکارهای ارجاع شده به واحد {roleDef.department}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      تعداد {pendingTasks.length} تسک فعال در حال پیگیری
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenAssignModal && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAssignModal();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ارجاع تسک جدید</span>
                      </button>
                    )}

                    {onOpenTasksDrawer && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenTasksDrawer();
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors"
                      >
                        مشاهده کارتابل کامل
                      </button>
                    )}
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-2.5">
                  {unitTasks.length === 0 ? (
                    <div className="py-10 text-center text-slate-500 space-y-2">
                      <ClipboardList className="w-10 h-10 mx-auto text-slate-700" />
                      <p className="text-xs font-bold">هیچ تسکی برای این واحد ثبت نشده است.</p>
                    </div>
                  ) : (
                    unitTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isDark ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              {t.code}
                            </span>
                            <span className="text-[11px] font-bold text-slate-300">{t.title}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-400">مهلت: {new Date(t.dueDate).toLocaleDateString('fa-IR')}</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold ${
                              t.status === 'COMPLETED' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {t.status === 'COMPLETED' ? 'تکمیل شده' : 'در انتظار اقدام'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 mt-2 border-t border-slate-800/60">
                          <span>ارجاع‌دهنده: <strong className="text-slate-400">{t.createdByUserName}</strong></span>
                          {t.actionUrl && (
                            <button
                              onClick={() => {
                                onClose();
                                navigate(t.actionUrl!);
                              }}
                              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                            >
                              <span>ورود به صفحه عملیات</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'PERMISSIONS' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
                  <h4 className="text-xs font-bold text-indigo-300 mb-1">دسترسی‌های استاندارد نقش {roleDef.nameFa}</h4>
                  <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                    {roleDef.descriptionFa}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {PERMISSION_LIST.map((perm) => {
                    const hasPerm = roleDef.defaultPermissions.includes('all') || roleDef.defaultPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                          hasPerm
                            ? isDark
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : isDark
                            ? 'bg-slate-900/30 border-slate-800 text-slate-600 opacity-60'
                            : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                        }`}
                      >
                        <span>{perm.nameFa}</span>
                        {hasPerm ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span className="text-[10px] text-slate-500">عدم دسترسی</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'SWITCH_ROLE' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  جهت بررسی کارتابل تسک‌ها و دسترسی‌های هر یک از واحدهای ۹ گانه، می‌توانید نقش خود را به سرعت تغییر دهید:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SYSTEM_ROLES.map((r) => {
                    const isCurrent = r.id.toLowerCase() === currentUser.role.toLowerCase();
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          if (onSwitchUser) {
                            const updatedUser: User = {
                              ...currentUser,
                              role: r.id,
                              department: r.department,
                            };
                            onSwitchUser(updatedUser);
                            onClose();
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 ${
                          isCurrent
                            ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                            : isDark
                            ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${r.badgeColor}`}>
                            <r.icon className="w-4 h-4" />
                          </div>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500 text-white">
                              نقش فعلی
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-black">{r.nameFa}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{r.department}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'THEME' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>انتخاب حالت ظاهری و استایل سامانه</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    شما می‌توانید میان تم روز (کنتراست بالا)، تم شب استاندارد و تم سفارشی «سایبر نئون» (هولوگرافیک معدنی) سوییچ کنید.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {THEME_OPTIONS.map((opt) => {
                    const isSelected = theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 text-start relative overflow-hidden ${
                          isSelected
                            ? opt.id === 'cyber'
                              ? 'bg-[#080F2A] border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_25px_rgba(0,240,255,0.35)] text-white'
                              : opt.id === 'dark'
                                ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                                : 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/40 text-slate-900 shadow-md'
                            : isDark
                              ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                            opt.id === 'cyber'
                              ? 'bg-gradient-to-tr from-cyan-500 to-pink-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.7)]'
                              : opt.id === 'dark'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-amber-500 text-white'
                          }`}>
                            {opt.icon}
                          </div>

                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>فعال</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-black flex items-center gap-1.5">
                            <span>{isFa ? opt.nameFa : opt.nameEn}</span>
                            {opt.id === 'cyber' && (
                              <span className="text-[10px] font-mono text-pink-400 font-bold">CYBERPUNK</span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {opt.descriptionFa}
                          </p>
                        </div>

                        {/* Visual Palette Preview */}
                        <div className="pt-2 border-t border-slate-700/40 flex items-center gap-1.5">
                          {opt.id === 'cyber' ? (
                            <>
                              <span className="w-4 h-4 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" title="Cyan Neon" />
                              <span className="w-4 h-4 rounded-full bg-[#FF007F] shadow-[0_0_8px_#FF007F]" title="Pink Neon" />
                              <span className="w-4 h-4 rounded-full bg-[#FFB703] shadow-[0_0_8px_#FFB703]" title="Amber Glow" />
                              <span className="w-4 h-4 rounded-full bg-[#0A1128] border border-cyan-400/40" title="Cyber Blue" />
                            </>
                          ) : opt.id === 'dark' ? (
                            <>
                              <span className="w-4 h-4 rounded-full bg-[#0B0F19] border border-slate-700" />
                              <span className="w-4 h-4 rounded-full bg-[#6366F1]" />
                              <span className="w-4 h-4 rounded-full bg-[#10B981]" />
                              <span className="w-4 h-4 rounded-full bg-[#64748B]" />
                            </>
                          ) : (
                            <>
                              <span className="w-4 h-4 rounded-full bg-[#F8FAFC] border border-slate-300" />
                              <span className="w-4 h-4 rounded-full bg-[#F59E0B]" />
                              <span className="w-4 h-4 rounded-full bg-[#4F46E5]" />
                              <span className="w-4 h-4 rounded-full bg-[#0F172A]" />
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>شماره تماس: {currentUser.phone || '۰۹۱۲۱۱۱۰۰۰۱'}</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
            >
              بستن
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserProfileModal;
