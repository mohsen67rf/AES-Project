// src/modules/auth/presentation/pages/UserManagementPage.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../../../dashboard/presentation/components/Header/Header';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';
import { UserRepository } from '../../../../core/infrastructure/repositories';
import type { User } from '../../../../core/domain/types/mine.types';
import {
  SYSTEM_ROLES,
  PERMISSION_LIST,
  SEED_USERS,
} from '../../domain/roles';
import { TaskService } from '../../../tasks/services/TaskService';
import { TaskAssignmentModal } from '../../../tasks/presentation/components/TaskAssignmentModal';
import { UnitTasksDrawer } from '../../../tasks/presentation/components/UnitTasksDrawer';
import { UnitTask } from '../../../../core/domain/types/task.types';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  Search,
  Edit2,
  Trash2,
  KeyRound,
  Clock,
  Phone,
  Download,
  RefreshCw,
  Eye,
  Check,
  X,
  Layers,
  ChevronLeft,
  AlertTriangle,
  Sparkles,
  ClipboardList,
  Send,
  ArrowRightLeft,
  RotateCw
} from 'lucide-react';
import {
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  MapIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export function UserManagementPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { lang } = useLanguage();
  const isFa = lang === 'fa';

  // Helper to load & auto-seed users
  const getInitialUsers = (): User[] => {
    let list = UserRepository.getAll();
    if (list.length <= 1) {
      const adminExists = list.some(u => u.code === 'AES-1001');
      const seedList = adminExists ? SEED_USERS.filter(u => u.code !== 'AES-1001') : SEED_USERS;
      seedList.forEach(seed => {
        UserRepository.save({
          id: crypto.randomUUID(),
          ...seed
        });
      });
      list = UserRepository.getAll();
    }
    return list;
  };

  const [users, setUsers] = useState<User[]>(() => getInitialUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'list' | 'roles' | 'matrix' | 'tasks'>('list');

  // Tasks state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isUnitTasksDrawerOpen, setIsUnitTasksDrawerOpen] = useState(false);
  const [assignTargetUser, setAssignTargetUser] = useState<User | null>(null);
  const [allTasks, setAllTasks] = useState<UnitTask[]>(() => TaskService.getAllTasks());
  const [taskFilterRole, setTaskFilterRole] = useState<string>('ALL');
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>('ALL');

  const refreshTasks = () => {
    setAllTasks(TaskService.getAllTasks());
  };

  useEffect(() => {
    const handleSync = () => refreshTasks();
    window.addEventListener('taskUpdated', handleSync);
    return () => window.removeEventListener('taskUpdated', handleSync);
  }, []);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [detailUser, setDetailUser] = useState<User | null>(null);

  // New user form state
  const [formData, setFormData] = useState({
    code: '',
    fullName: '',
    email: '',
    password: 'user123',
    role: 'MiningEngineer',
    department: 'مهندسی استخراج',
    phone: '',
    notes: '',
    isActive: true,
    permissions: ['blocks_manage', 'map_view'] as string[],
  });

  // Current session user
  const currentUser: User | null = useMemo(() => {
    try {
      const saved = localStorage.getItem('aes_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const loadUsers = () => {
    setUsers(UserRepository.getAll());
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.phone && user.phone.includes(searchQuery));

      const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && user.isActive) ||
        (selectedStatus === 'INACTIVE' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const inactive = total - active;
    const managers = users.filter(u => u.role === 'Manager').length;
    const engineers = users.filter(u => ['MiningEngineer', 'Geologist', 'Surveyor'].includes(u.role)).length;
    return { total, active, inactive, managers, engineers };
  }, [users]);

  // Toggle user status
  const handleToggleStatus = (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      alert(isFa ? 'نمی‌توانید وضعیت حساب کاربری فعال خود را تغییر دهید.' : 'Cannot deactivate currently active session account.');
      return;
    }
    const updated = { ...targetUser, isActive: !targetUser.isActive };
    UserRepository.save(updated);
    setUsers(UserRepository.getAll());
  };

  // Delete User
  const handleDeleteConfirm = () => {
    if (!deletingUser) return;
    if (deletingUser.id === currentUser?.id) {
      alert(isFa ? 'نمی‌توانید حسابی که با آن وارد شده‌اید را حذف کنید.' : 'Cannot delete currently logged-in account.');
      setDeletingUser(null);
      return;
    }
    UserRepository.delete(deletingUser.id);
    setDeletingUser(null);
    setUsers(UserRepository.getAll());
  };

  // Reset Password
  const handlePasswordResetConfirm = () => {
    if (!passwordResetUser || !newPassword.trim()) return;
    const updated = { ...passwordResetUser, password: newPassword.trim() };
    UserRepository.save(updated);
    setPasswordResetUser(null);
    setNewPassword('');
    setUsers(UserRepository.getAll());
    alert(isFa ? 'رمز عبور با موفقیت به‌روزرسانی شد.' : 'Password updated successfully.');
  };

  // Save Add/Edit
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.code.trim()) {
      alert(isFa ? 'لطفا نام و کد کاربری را وارد کنید.' : 'Please enter full name and user code.');
      return;
    }

    if (editingUser) {
      const updated: User = {
        ...editingUser,
        fullName: formData.fullName.trim(),
        code: formData.code.trim().toUpperCase(),
        email: formData.email.trim(),
        role: formData.role,
        department: formData.department.trim(),
        phone: formData.phone.trim(),
        notes: formData.notes.trim(),
        isActive: formData.isActive,
        permissions: formData.permissions,
      };
      UserRepository.save(updated);
      setEditingUser(null);
    } else {
      const existing = users.find(u => u.code.toLowerCase() === formData.code.trim().toLowerCase());
      if (existing) {
        alert(isFa ? 'این کد کاربری قبلاً ثبت شده است.' : 'User code already exists.');
        return;
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        fullName: formData.fullName.trim(),
        code: formData.code.trim().toUpperCase(),
        email: formData.email.trim() || `${formData.code.toLowerCase()}@aes.com`,
        password: formData.password || 'user123',
        role: formData.role,
        department: formData.department.trim(),
        phone: formData.phone.trim(),
        notes: formData.notes.trim(),
        isActive: formData.isActive,
        createdAt: new Date().toISOString(),
        permissions: formData.permissions,
      };
      UserRepository.save(newUser);
      setIsAddModalOpen(false);
    }

    setUsers(UserRepository.getAll());
  };

  // Open Edit Modal
  const handleOpenEdit = (targetUser: User) => {
    setEditingUser(targetUser);
    setFormData({
      code: targetUser.code,
      fullName: targetUser.fullName,
      email: targetUser.email,
      password: targetUser.password,
      role: targetUser.role,
      department: targetUser.department || '',
      phone: targetUser.phone || '',
      notes: targetUser.notes || '',
      isActive: targetUser.isActive,
      permissions: targetUser.permissions || [],
    });
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    const nextNum = users.length + 1001;
    setFormData({
      code: `AES-${nextNum}`,
      fullName: '',
      email: '',
      password: 'user123',
      role: 'MiningEngineer',
      department: 'مهندسی استخراج',
      phone: '',
      notes: '',
      isActive: true,
      permissions: ['blocks_manage', 'map_view', 'drilling_manage'],
    });
    setIsAddModalOpen(true);
  };

  // Export Users to CSV
  const handleExportCSV = () => {
    const headers = ['کد کاربری', 'نام و نام خانوادگی', 'ایمیل', 'نقش', 'بخش سازمانی', 'شماره تماس', 'وضعیت', 'تاریخ ایجاد'];
    const rows = users.map(u => [
      u.code,
      u.fullName,
      u.email,
      u.role,
      u.department || '-',
      u.phone || '-',
      u.isActive ? 'فعال' : 'غیرفعال',
      u.createdAt ? new Date(u.createdAt).toLocaleDateString('fa-IR') : '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AES_Users_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Menu items for sidebar
  const menuItems = [
    { icon: HomeIcon, label: isFa ? 'داشبورد' : 'Dashboard', path: '/dashboard' },
    { icon: ChartBarIcon, label: isFa ? 'مدیریت' : 'Management', path: '/management-dashboard' },
    { icon: DocumentTextIcon, label: isFa ? 'مدیریت بلوک‌ها' : 'Blocks', path: '/blocks-management' },
    { icon: BuildingOffice2Icon, label: isFa ? 'معدن' : 'Mine', path: '/mine' },
    { icon: MapIcon, label: isFa ? 'نقشه معدن' : 'Mine GIS', path: '/mine/map' },
    { icon: UsersIcon, label: isFa ? 'مدیریت کاربران' : 'User Management', path: '/personnel', active: true },
  ];

  const getRoleInfo = (roleKey: string) => {
    return SYSTEM_ROLES.find(r => r.id === roleKey) || {
      id: roleKey,
      nameFa: roleKey,
      nameEn: roleKey,
      badgeColor: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      icon: Shield,
      department: 'نامشخص',
      descriptionFa: '',
      descriptionEn: '',
      defaultPermissions: []
    };
  };

  const bgGradient = isDark
    ? 'bg-gradient-to-br from-[#0A1628] via-[#0F1F35] to-[#0A1628]'
    : 'bg-gradient-to-br from-[#F4F6F9] via-[#E8ECF1] to-[#F4F6F9]';

  return (
    <div className={`min-h-screen ${bgGradient} text-slate-200 transition-colors duration-500 font-sans`} dir={isFa ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-20 lg:w-64 min-h-[calc(100vh-64px)] p-4 sticky top-16 transition-colors duration-500 flex-shrink-0 ${
          isDark
            ? 'bg-[#0A1628]/50 backdrop-blur-xl border-l border-[#2A3A5A]/30'
            : 'bg-white/50 backdrop-blur-xl border-l border-[#1A2A3A]/10'
        }`}>
          <nav className="space-y-1">
            {menuItems.map(item => {
              const isActive = item.active || item.path === window.location.pathname;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? isDark
                        ? 'bg-[#00D4FF]/20 text-[#00D4FF] border-r-2 border-[#00D4FF]'
                        : 'bg-[#C9A227]/20 text-[#C9A227] border-r-2 border-[#C9A227]'
                      : isDark
                      ? 'text-[#8A9DB0] hover:bg-[#00D4FF]/10 hover:text-[#00D4FF]'
                      : 'text-[#4A6A8A] hover:bg-[#C9A227]/10 hover:text-[#C9A227]'
                  }`}
                >
                  <item.icon className="w-6 h-6 flex-shrink-0" />
                  <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
          
          {/* Top Page Title & Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-[#00D4FF]/15 text-[#00D4FF]' : 'bg-amber-500/15 text-amber-600'}`}>
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h1 className={`text-2xl lg:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {isFa ? 'مدیریت پرسنل و کاربران سامانه' : 'Personnel & User Access Control'}
                  </h1>
                  <p className={`text-xs lg:text-sm mt-0.5 ${isDark ? 'text-[#8A9DB0]' : 'text-slate-500'}`}>
                    {isFa
                      ? 'کنترل سطوح دسترسی، نقش‌های تخصصی معدن، صدور کد پرسنلی و پایش فعالیت‌ها'
                      : 'Role-Based Access Control (RBAC), mine team directories, security credentials'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportCSV}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white hover:border-[#00D4FF]/40'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                }`}
                title={isFa ? 'خروجی اکسل و CSV' : 'Export CSV'}
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'خروجی CSV' : 'Export CSV'}</span>
              </button>

              <button
                onClick={loadUsers}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-[#8A9DB0] hover:text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
                title={isFa ? 'تازه‌سازی لیست' : 'Refresh'}
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] via-[#0099CC] to-[#0077AA] text-white text-xs font-bold shadow-lg shadow-[#00D4FF]/25 hover:shadow-[#00D4FF]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isFa ? 'افزودن کاربر جدید' : 'Add New User'}</span>
              </button>
            </div>
          </div>

          {/* Quick Stat Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              isDark ? 'bg-[#13203A]/70 border-[#2A3A5A]/40' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${isDark ? 'text-[#8A9DB0]' : 'text-slate-500'}`}>
                  {isFa ? 'کل پرسنل و کاربران' : 'Total Personnel'}
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.total}</p>
              <span className="text-[11px] text-[#00D4FF] mt-1 block">
                {isFa ? 'ثبت‌شده در پایگاه داده' : 'Registered in database'}
              </span>
            </div>

            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              isDark ? 'bg-[#13203A]/70 border-[#2A3A5A]/40' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${isDark ? 'text-[#8A9DB0]' : 'text-slate-500'}`}>
                  {isFa ? 'کاربران فعال' : 'Active Users'}
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <p className={`text-2xl font-bold mt-2 text-emerald-400`}>{stats.active}</p>
              <span className="text-[11px] text-emerald-500/80 mt-1 block">
                {isFa ? 'دارای دسترسی معتبر' : 'Authorized active access'}
              </span>
            </div>

            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              isDark ? 'bg-[#13203A]/70 border-[#2A3A5A]/40' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${isDark ? 'text-[#8A9DB0]' : 'text-slate-500'}`}>
                  {isFa ? 'تیم مهندسی و نظارت' : 'Engineering Team'}
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.engineers}</p>
              <span className="text-[11px] text-amber-500/80 mt-1 block">
                {isFa ? 'استخراج، ژئودزی و زمین‌شناسی' : 'Mining, Survey & Geology'}
              </span>
            </div>

            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              isDark ? 'bg-[#13203A]/70 border-[#2A3A5A]/40' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${isDark ? 'text-[#8A9DB0]' : 'text-slate-500'}`}>
                  {isFa ? 'غیرفعال / تعلیق' : 'Inactive / Suspended'}
                </span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <UserX className="w-5 h-5" />
                </div>
              </div>
              <p className={`text-2xl font-bold mt-2 ${stats.inactive > 0 ? 'text-rose-400' : isDark ? 'text-white' : 'text-slate-900'}`}>
                {stats.inactive}
              </p>
              <span className="text-[11px] text-rose-500/80 mt-1 block">
                {isFa ? 'فاقد دسترسی ورود' : 'Revoked permissions'}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? isDark
                    ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                  : isDark
                  ? 'text-[#8A9DB0] hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{isFa ? 'لیست کاربران و پرسنل' : 'Users Directory'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 font-mono">
                {filteredUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'roles'
                  ? isDark
                    ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                  : isDark
                  ? 'text-[#8A9DB0] hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isFa ? 'نقش‌ها و شرح وظایف' : 'Roles & Responsibilities'}</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'matrix'
                  ? isDark
                    ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                  : isDark
                  ? 'text-[#8A9DB0] hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{isFa ? 'ماتریس دسترسی‌ها' : 'Permission Matrix'}</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'tasks'
                  ? isDark
                    ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                  : isDark
                  ? 'text-[#8A9DB0] hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-indigo-400" />
              <span>{isFa ? 'کارتابل و ارجاعات تسک‌های واحدها' : 'Tasks & Assignments Hub'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                {allTasks.filter(t => t.status !== 'Completed').length}
              </span>
            </button>
          </div>

          {/* TAB 1: USERS DIRECTORY & TABLE */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Search and Filters Bar */}
              <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-3 items-center justify-between ${
                isDark ? 'bg-[#13203A]/60 border-[#2A3A5A]/40' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="relative w-full md:w-80">
                  <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isFa ? 'right-3' : 'left-3'} text-slate-400`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={isFa ? 'جستجو نام، کد پرسنلی، ایمیل یا تلفن...' : 'Search by name, code, email...'}
                    className={`w-full text-xs py-2.5 rounded-xl border outline-none transition-all ${
                      isFa ? 'pr-9 pl-4' : 'pl-9 pr-4'
                    } ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-[#00D4FF]/50 focus:bg-white/10'
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:bg-white'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute top-1/2 -translate-y-1/2 ${isFa ? 'left-3' : 'right-3'} text-slate-400 hover:text-white`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                  {/* Role filter */}
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    className={`text-xs py-2 px-3 rounded-xl border outline-none ${
                      isDark ? 'bg-[#0A1628] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="ALL">{isFa ? 'همه نقش‌ها' : 'All Roles'}</option>
                    {SYSTEM_ROLES.map(r => (
                      <option key={r.id} value={r.id}>
                        {isFa ? r.nameFa : r.nameEn}
                      </option>
                    ))}
                  </select>

                  {/* Status filter */}
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className={`text-xs py-2 px-3 rounded-xl border outline-none ${
                      isDark ? 'bg-[#0A1628] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="ALL">{isFa ? 'همه وضعیت‌ها' : 'All Statuses'}</option>
                    <option value="ACTIVE">{isFa ? 'فقط فعال' : 'Active Only'}</option>
                    <option value="INACTIVE">{isFa ? 'فقط غیرفعال' : 'Inactive Only'}</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className={`rounded-2xl border overflow-hidden ${
                isDark ? 'bg-[#13203A]/60 border-[#2A3A5A]/40' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className={`border-b ${isDark ? 'bg-white/[0.03] border-white/10 text-[#8A9DB0]' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        <th className="p-4 font-semibold">{isFa ? 'کاربر / نام و نشان' : 'User'}</th>
                        <th className="p-4 font-semibold">{isFa ? 'کد پرسنلی' : 'Employee ID'}</th>
                        <th className="p-4 font-semibold">{isFa ? 'نقش و سمت سازمانی' : 'Role & Dept'}</th>
                        <th className="p-4 font-semibold">{isFa ? 'اطلاعات تماس' : 'Contact'}</th>
                        <th className="p-4 font-semibold">{isFa ? 'وضعیت دسترسی' : 'Status'}</th>
                        <th className="p-4 font-semibold text-center">{isFa ? 'عملیات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-slate-400">
                            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p>{isFa ? 'هیچ کاربری با این مشخصات یافت نشد.' : 'No users matching criteria.'}</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(user => {
                          const roleInfo = getRoleInfo(user.role);
                          const RoleIcon = roleInfo.icon;
                          const isCurrent = user.id === currentUser?.id;

                          return (
                            <tr
                              key={user.id}
                              className={`transition-colors duration-150 ${
                                isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'
                              } ${!user.isActive ? 'opacity-60' : ''}`}
                            >
                              {/* Name & Avatar */}
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D4FF]/20 to-[#A29BFE]/20 border border-[#00D4FF]/30 flex items-center justify-center font-bold text-sm text-[#00D4FF] flex-shrink-0">
                                    {user.fullName.slice(0, 2)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {user.fullName}
                                      </span>
                                      {isCurrent && (
                                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                          {isFa ? 'حساب شما' : 'You'}
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-[11px] ${isDark ? 'text-[#8A9DB0]' : 'text-slate-500'}`}>
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Code */}
                              <td className="p-4">
                                <span className="font-mono px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-semibold">
                                  {user.code}
                                </span>
                              </td>

                              {/* Role & Dept */}
                              <td className="p-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border ${roleInfo.badgeColor}`}>
                                      <RoleIcon size={12} />
                                      <span>{isFa ? roleInfo.nameFa : roleInfo.nameEn}</span>
                                    </span>
                                  </div>
                                  <span className={`text-[10px] ${isDark ? 'text-[#8A9DB0]' : 'text-slate-500'}`}>
                                    {user.department || roleInfo.department}
                                  </span>
                                </div>
                              </td>

                              {/* Contact */}
                              <td className="p-4">
                                <div className="flex flex-col gap-0.5 text-[11px] text-slate-300">
                                  {user.phone ? (
                                    <span className="flex items-center gap-1 font-mono">
                                      <Phone className="w-3 h-3 text-slate-400" />
                                      {user.phone}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">-</span>
                                  )}
                                  {user.lastLogin && (
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5" />
                                      {isFa ? 'آخرین ورود:' : 'Last:'} {new Date(user.lastLogin).toLocaleDateString('fa-IR')}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Active Status Switch */}
                              <td className="p-4">
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                                    user.isActive
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                                  }`}
                                  title={isFa ? 'کلیک جهت تغییر وضعیت' : 'Click to toggle status'}
                                >
                                  {user.isActive ? (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      <span>{isFa ? 'فعال' : 'Active'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                      <span>{isFa ? 'غیرفعال' : 'Inactive'}</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              {/* Action Buttons */}
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      setAssignTargetUser(user);
                                      setIsTaskModalOpen(true);
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isDark ? 'hover:bg-indigo-500/20 text-indigo-400' : 'hover:bg-indigo-100 text-indigo-600'
                                    }`}
                                    title={isFa ? 'ارجاع تسک جدید به این کاربر' : 'Assign Task'}
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      localStorage.setItem('aes_session', JSON.stringify(user));
                                      window.location.href = '/dashboard';
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isDark ? 'hover:bg-emerald-500/20 text-emerald-400' : 'hover:bg-emerald-100 text-emerald-600'
                                    }`}
                                    title={isFa ? 'ورود به میز کار این کاربر' : 'Switch Workspace'}
                                  >
                                    <ArrowRightLeft className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => setDetailUser(user)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isDark ? 'hover:bg-white/10 text-cyan-400' : 'hover:bg-slate-200 text-cyan-600'
                                    }`}
                                    title={isFa ? 'مشاهده جزئیات' : 'View Details'}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => handleOpenEdit(user)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isDark ? 'hover:bg-white/10 text-amber-400' : 'hover:bg-slate-200 text-amber-600'
                                    }`}
                                    title={isFa ? 'ویرایش اطلاعات' : 'Edit User'}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setPasswordResetUser(user);
                                      setNewPassword('');
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isDark ? 'hover:bg-white/10 text-purple-400' : 'hover:bg-slate-200 text-purple-600'
                                    }`}
                                    title={isFa ? 'تغییر رمز عبور' : 'Reset Password'}
                                  >
                                    <KeyRound className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => setDeletingUser(user)}
                                    disabled={isCurrent}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isCurrent
                                        ? 'opacity-30 cursor-not-allowed text-slate-500'
                                        : isDark
                                        ? 'hover:bg-rose-500/20 text-rose-400'
                                        : 'hover:bg-rose-100 text-rose-600'
                                    }`}
                                    title={isFa ? 'حذف کاربر' : 'Delete User'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className={`p-3 px-4 border-t flex items-center justify-between text-xs ${
                  isDark ? 'bg-black/20 border-white/10 text-[#8A9DB0]' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <span>{isFa ? `نمایش ${filteredUsers.length} از ${users.length} کاربر` : `Showing ${filteredUsers.length} of ${users.length} users`}</span>
                  <span className="text-[11px]">{isFa ? 'امنیت و کنترل دسترسی یکپارچه AES' : 'AES Enterprise Access Control'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROLES OVERVIEW */}
          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SYSTEM_ROLES.map(role => {
                const RoleIcon = role.icon;
                const membersCount = users.filter(u => u.role === role.id).length;

                return (
                  <div
                    key={role.id}
                    className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                      isDark
                        ? 'bg-[#13203A]/70 border-[#2A3A5A]/40 hover:border-[#00D4FF]/40'
                        : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl border ${role.badgeColor}`}>
                            <RoleIcon size={20} />
                          </div>
                          <div>
                            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {isFa ? role.nameFa : role.nameEn}
                            </h3>
                            <span className="text-[11px] text-[#00D4FF] block">
                              {role.department}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-white/10 text-slate-300">
                          {membersCount} {isFa ? 'نفر' : 'users'}
                        </span>
                      </div>

                      <p className={`text-xs mt-3 leading-relaxed ${isDark ? 'text-[#8A9DB0]' : 'text-slate-600'}`}>
                        {isFa ? role.descriptionFa : role.descriptionEn}
                      </p>

                      <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                          {isFa ? 'مجوزهای پیش‌فرض این نقش:' : 'Default Permissions:'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {role.defaultPermissions.map(perm => (
                            <span
                              key={perm}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                            >
                              {PERMISSION_LIST.find(p => p.id === perm)?.[isFa ? 'nameFa' : 'nameEn'] || perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedRole(role.id);
                          setActiveTab('list');
                        }}
                        className="text-xs text-[#00D4FF] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>{isFa ? 'مشاهده کاربران این گروه' : 'Filter by this role'}</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: PERMISSIONS MATRIX */}
          {activeTab === 'matrix' && (
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-[#13203A]/60 border-[#2A3A5A]/40' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="p-4 border-b border-white/10">
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isFa ? 'ماتریس جامع دسترسی‌های ماژول‌های سامانه' : 'System RBAC Permission Matrix'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isFa ? 'توزیع دسترسی‌ها بین نقش‌های مختلف استخراج، نقشه، کنترل کیفی و آزمایشگاه' : 'Module authorization per operational mining role'}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className={`border-b ${isDark ? 'bg-white/[0.03] border-white/10 text-[#8A9DB0]' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <th className="p-3.5 font-semibold">{isFa ? 'ماژول و سطح دسترسی' : 'Permission / Action'}</th>
                      {SYSTEM_ROLES.map(role => (
                        <th key={role.id} className="p-3.5 font-semibold text-center">
                          {isFa ? role.nameFa.split(' ')[0] : role.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {PERMISSION_LIST.map(perm => (
                      <tr key={perm.id} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}>
                        <td className="p-3.5 font-medium">
                          <span className={`block font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {isFa ? perm.nameFa : perm.nameEn}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{perm.id}</span>
                        </td>
                        {SYSTEM_ROLES.map(role => {
                          const hasPerm = role.defaultPermissions.includes('all') || role.defaultPermissions.includes(perm.id);
                          return (
                            <td key={role.id} className="p-3.5 text-center">
                              {hasPerm ? (
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-white/5 text-slate-600 flex items-center justify-center mx-auto">
                                  <X className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TASKS & ASSIGNMENTS HUB */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Task filters and action bar */}
              <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-3 items-center justify-between ${
                isDark ? 'bg-[#13203A]/60 border-[#2A3A5A]/40' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                  <select
                    value={taskFilterRole}
                    onChange={e => setTaskFilterRole(e.target.value)}
                    className={`text-xs px-3 py-2 rounded-xl border outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="ALL">{isFa ? 'تمام واحدهای سازمانی و نقش‌ها' : 'All Roles & Units'}</option>
                    {SYSTEM_ROLES.map(r => (
                      <option key={r.id} value={r.id}>
                        {isFa ? `${r.nameFa} (${r.department})` : r.nameEn}
                      </option>
                    ))}
                  </select>

                  <select
                    value={taskFilterStatus}
                    onChange={e => setTaskFilterStatus(e.target.value)}
                    className={`text-xs px-3 py-2 rounded-xl border outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="ALL">{isFa ? 'تمام وضعیت‌های تسک' : 'All Statuses'}</option>
                    <option value="Pending">{isFa ? 'در انتظار اقدام' : 'Pending'}</option>
                    <option value="In_Progress">{isFa ? 'در حال انجام' : 'In Progress'}</option>
                    <option value="Completed">{isFa ? 'تکمیل‌شده' : 'Completed'}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => setIsUnitTasksDrawerOpen(true)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-indigo-300' : 'bg-white border-slate-200 text-indigo-600'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>{isFa ? 'مشاهده در دراور اختصاصی' : 'View in Drawer'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setAssignTargetUser(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isFa ? 'ارجاع تسک جدید' : 'New Assignment'}</span>
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {allTasks
                  .filter(t => (taskFilterRole === 'ALL' || t.targetRole === taskFilterRole) && (taskFilterStatus === 'ALL' || t.status === taskFilterStatus))
                  .map(task => {
                    const roleInfo = SYSTEM_ROLES.find(r => r.id.toLowerCase() === task.targetRole.toLowerCase()) || SYSTEM_ROLES[0];
                    const priorityColor = task.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : task.priority === 'High' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-blue-500/20 text-blue-400 border-blue-500/40';
                    const statusColor = task.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : task.status === 'In_Progress' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-500/20 text-slate-300 border-slate-500/40';

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isDark ? 'bg-[#13203A]/70 border-[#2A3A5A]/50 hover:border-indigo-500/40' : 'bg-white border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityColor}`}>
                                {task.priority === 'Critical' ? 'بحرانی' : task.priority === 'High' ? 'فوری' : task.priority === 'Medium' ? 'متوسط' : 'عادی'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColor}`}>
                                {task.status === 'Completed' ? 'تکمیل‌شده' : task.status === 'In_Progress' ? 'در حال انجام' : 'در انتظار اقدام'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(task.createdAt).toLocaleDateString('fa-IR')}
                              </span>
                            </div>
                            <h4 className={`text-sm font-bold mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {task.title}
                            </h4>
                          </div>

                          <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 ${roleInfo.badgeColor}`}>
                            <roleInfo.icon className="w-3.5 h-3.5" />
                            <span>{roleInfo.nameFa}</span>
                          </span>
                        </div>

                        <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {task.description}
                        </p>

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs">
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <span>ارجاع‌دهنده:</span>
                            <span className="font-bold text-slate-300">{task.createdByName}</span>
                            {task.targetUserName && (
                              <>
                                <span className="mx-1">•</span>
                                <span>کاربر مستقیم:</span>
                                <span className="font-bold text-indigo-300">{task.targetUserName}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {task.status !== 'Completed' && (
                              <button
                                onClick={() => {
                                  TaskService.updateTaskStatus(task.id, 'Completed');
                                  refreshTasks();
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition-colors"
                              >
                                ثبت تکمیل
                              </button>
                            )}
                            {task.status === 'Pending' && (
                              <button
                                onClick={() => {
                                  TaskService.updateTaskStatus(task.id, 'In_Progress');
                                  refreshTasks();
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30 transition-colors"
                              >
                                شروع کار
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ===== MODAL 1: ADD / EDIT USER ===== */}
      <AnimatePresence>
        {(isAddModalOpen || editingUser) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-xl rounded-3xl p-6 border shadow-2xl overflow-hidden ${
                isDark ? 'bg-[#0A1628] border-[#AACCDD]/20 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#00D4FF]/20 text-[#00D4FF]">
                    {editingUser ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-base">
                      {editingUser
                        ? isFa ? `ویرایش کاربر: ${editingUser.fullName}` : `Edit User: ${editingUser.fullName}`
                        : isFa ? 'ثبت پرسنل و کاربر جدید' : 'Create New Personnel'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isFa ? 'مشخصات فردی، کد پرسنلی و نقش سازمانی' : 'Personal info, credentials & mining role'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isFa ? 'نام و نام خانوادگی *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={isFa ? 'مثال: مهندس کاظم رحیمی' : 'e.g. John Doe'}
                      className={`w-full text-xs p-2.5 rounded-xl border outline-none ${
                        isDark ? 'bg-white/5 border-white/10 focus:border-[#00D4FF]' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isFa ? 'کد کاربری / پرسنلی *' : 'Employee ID / Code *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      placeholder="AES-1008"
                      className={`w-full text-xs p-2.5 rounded-xl border outline-none font-mono ${
                        isDark ? 'bg-white/5 border-white/10 focus:border-[#00D4FF]' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isFa ? 'ایمیل کاری' : 'Work Email'}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@aes.com"
                      className={`w-full text-xs p-2.5 rounded-xl border outline-none ${
                        isDark ? 'bg-white/5 border-white/10 focus:border-[#00D4FF]' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isFa ? 'شماره تماس' : 'Phone Number'}
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="۰۹۱۲..."
                      className={`w-full text-xs p-2.5 rounded-xl border outline-none font-mono ${
                        isDark ? 'bg-white/5 border-white/10 focus:border-[#00D4FF]' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isFa ? 'نقش سازمانی *' : 'System Role *'}
                    </label>
                    <select
                      value={formData.role}
                      onChange={e => {
                        const selected = SYSTEM_ROLES.find(r => r.id === e.target.value);
                        setFormData({
                          ...formData,
                          role: e.target.value,
                          department: selected ? selected.department : formData.department,
                          permissions: selected ? selected.defaultPermissions : formData.permissions,
                        });
                      }}
                      className={`w-full text-xs p-2.5 rounded-xl border outline-none ${
                        isDark ? 'bg-[#0A1628] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      {SYSTEM_ROLES.map(role => (
                        <option key={role.id} value={role.id}>
                          {isFa ? `${role.nameFa} (${role.department})` : role.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isFa ? 'واحد سازمانی' : 'Department'}
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      placeholder={isFa ? 'واحد استخراج / ژئودزی' : 'Mining Operations'}
                      className={`w-full text-xs p-2.5 rounded-xl border outline-none ${
                        isDark ? 'bg-white/5 border-white/10 focus:border-[#00D4FF]' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isFa ? 'رمز عبور اولیه' : 'Initial Password'}
                    </label>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full text-xs p-2.5 rounded-xl border outline-none font-mono ${
                        isDark ? 'bg-white/5 border-white/10 focus:border-[#00D4FF]' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isFa ? 'یادداشت و توضیحات' : 'Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={isFa ? 'توضیحات تکمیلی، شیفت کاری، یا شماره پروانه مهندسی...' : 'Additional notes or shift...'}
                    className={`w-full text-xs p-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-white/5 border-white/10 focus:border-[#00D4FF]' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-slate-600 text-[#00D4FF] focus:ring-0"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-medium cursor-pointer">
                    {isFa ? 'حساب کاربری فعال باشد و اجازه ورود داشته باشد' : 'User account is active'}
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    {isFa ? 'انصراف' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-white text-xs font-bold shadow-lg shadow-[#00D4FF]/25 hover:shadow-[#00D4FF]/40"
                  >
                    {editingUser ? (isFa ? 'ذخیره تغییرات' : 'Save Changes') : (isFa ? 'ثبت کاربر' : 'Create User')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== MODAL 2: RESET PASSWORD ===== */}
      <AnimatePresence>
        {passwordResetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
                isDark ? 'bg-[#0A1628] border-[#AACCDD]/20 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {isFa ? 'تغییر رمز عبور کاربر' : 'Reset Password'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {passwordResetUser.fullName} ({passwordResetUser.code})
                  </p>
                </div>
              </div>

              <div className="space-y-3 my-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isFa ? 'رمز عبور جدید' : 'New Password'}
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full text-xs p-2.5 rounded-xl border outline-none font-mono ${
                      isDark ? 'bg-white/5 border-white/10 focus:border-purple-400' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const generated = 'AES@' + Math.floor(1000 + Math.random() * 9000);
                    setNewPassword(generated);
                  }}
                  className="text-[11px] text-[#00D4FF] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isFa ? 'تولید خودکار رمز عبور تصادفی' : 'Generate random secure password'}</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => setPasswordResetUser(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  {isFa ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  onClick={handlePasswordResetConfirm}
                  disabled={!newPassword.trim()}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg disabled:opacity-50"
                >
                  {isFa ? 'به‌روزرسانی رمز' : 'Update Password'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== MODAL 3: DELETE CONFIRMATION ===== */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
                isDark ? 'bg-[#0A1628] border-rose-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-rose-400">
                    {isFa ? 'حذف کاربر از سیستم' : 'Confirm User Deletion'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {deletingUser.fullName} ({deletingUser.code})
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed my-4">
                {isFa
                  ? 'آیا از حذف این کاربر اطمینان دارید؟ تمامی دسترسی‌های این کاربر قطع خواهد شد.'
                  : 'Are you sure you want to permanently delete this user account?'}
              </p>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  {isFa ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
                >
                  {isFa ? 'حذف قطعی' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== MODAL 4: USER DETAILS DRAWER ===== */}
      <AnimatePresence>
        {detailUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl ${
                isDark ? 'bg-[#0A1628] border-[#AACCDD]/20 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D4FF]/30 to-[#A29BFE]/30 border border-[#00D4FF]/40 flex items-center justify-center font-bold text-base text-[#00D4FF]">
                    {detailUser.fullName.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{detailUser.fullName}</h3>
                    <p className="text-xs text-[#00D4FF] font-mono">{detailUser.code}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailUser(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{isFa ? 'نقش:' : 'Role:'}</span>
                    <span className="font-semibold">{getRoleInfo(detailUser.role)[isFa ? 'nameFa' : 'nameEn']}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{isFa ? 'واحد:' : 'Department:'}</span>
                    <span className="font-semibold">{detailUser.department || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{isFa ? 'ایمیل:' : 'Email:'}</span>
                    <span className="font-mono">{detailUser.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{isFa ? 'تلفن:' : 'Phone:'}</span>
                    <span className="font-mono">{detailUser.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{isFa ? 'وضعیت:' : 'Status:'}</span>
                    <span className={detailUser.isActive ? 'text-emerald-400' : 'text-rose-400'}>
                      {detailUser.isActive ? (isFa ? 'فعال' : 'Active') : (isFa ? 'غیرفعال' : 'Inactive')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{isFa ? 'تاریخ ایجاد:' : 'Created:'}</span>
                    <span>{detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleDateString('fa-IR') : '-'}</span>
                  </div>
                </div>

                {detailUser.notes && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[10px] mb-1">{isFa ? 'یادداشت:' : 'Notes:'}</span>
                    <p className="text-slate-200">{detailUser.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-white/10">
                <button
                  onClick={() => setDetailUser(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                >
                  {isFa ? 'بستن' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Assignment Modal */}
      <TaskAssignmentModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setAssignTargetUser(null);
        }}
        preselectedUserId={assignTargetUser?.id}
        preselectedRole={assignTargetUser?.role}
        onTaskCreated={() => {
          refreshTasks();
        }}
      />

      {/* Unit Tasks Drawer */}
      <UnitTasksDrawer
        isOpen={isUnitTasksDrawerOpen}
        onClose={() => setIsUnitTasksDrawerOpen(false)}
      />
    </div>
  );
}

export default UserManagementPage;
