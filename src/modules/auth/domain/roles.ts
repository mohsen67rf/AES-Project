// src/modules/auth/domain/roles.ts

import React from 'react';
import {
  ShieldCheck,
  HardHat,
  Pickaxe,
  Compass,
  Truck,
  Shield,
  FlaskConical,
  Warehouse,
  AlertTriangle,
} from 'lucide-react';
import type { User } from '../../../core/domain/types/mine.types';

export interface RoleDefinition {
  id: string;
  nameFa: string;
  nameEn: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  department: string;
  departmentKey: 'MANAGEMENT' | 'MINING' | 'GEOLOGY' | 'SURVEY' | 'DISPATCH' | 'PIT_OPS' | 'LAB' | 'WAREHOUSE' | 'HSE';
  descriptionFa: string;
  descriptionEn: string;
  defaultPermissions: string[];
}

export const SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: 'Manager',
    nameFa: 'مدیر کل معدن و سرپرست سیستم',
    nameEn: 'Mine Director & System Admin',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    icon: ShieldCheck,
    department: 'مدیریت ارشد',
    departmentKey: 'MANAGEMENT',
    descriptionFa: 'نظارت بر کل عملیات، تایید نهایی بلوک‌ها، دسترسی کامل به تنظیمات، کاربران و شاخص‌های کلان',
    descriptionEn: 'Full administrative access, final block approval, KPI oversight & user governance',
    defaultPermissions: ['all', 'users_manage', 'blocks_approve', 'map_edit', 'mine_config', 'export_data', 'audit_view', 'tasks_manage']
  },
  {
    id: 'MiningEngineer',
    nameFa: 'مهندس استخراج و برنامه‌ریزی',
    nameEn: 'Mining & Planning Engineer',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: HardHat,
    department: 'مهندسی استخراج',
    departmentKey: 'MINING',
    descriptionFa: 'طراحی بلوک‌ها و ساب‌بلوک‌ها، پارامترهای حفاری و آتشباری، پیش‌بینی تولید و پیشروی پیت',
    descriptionEn: 'Block design, drilling patterns, blast planning & extraction scheduling',
    defaultPermissions: ['blocks_manage', 'map_edit', 'drilling_manage', 'haulage_view', 'export_data', 'audit_view', 'tasks_manage']
  },
  {
    id: 'Geologist',
    nameFa: 'زمین‌شناس و کنترل عیار',
    nameEn: 'Geologist & Grade Control',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: Pickaxe,
    department: 'زمین‌شناسی و اکتشاف',
    departmentKey: 'GEOLOGY',
    descriptionFa: 'تحلیل ژئوشیمیایی، تایید زون‌های کانسنگ و باطله، ثبت نمونه‌های لاگین و کنترل عیار Fe/SiO2/P/S',
    descriptionEn: 'Assay validation, geochemical zoning, ore/waste classification & sample logging',
    defaultPermissions: ['samples_manage', 'grade_classify', 'map_view', 'blocks_view', 'export_data', 'tasks_manage']
  },
  {
    id: 'Surveyor',
    nameFa: 'مهندس نقشه‌بردار و ژئودزی',
    nameEn: 'Mine Surveyor & Geodesy',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    icon: Compass,
    department: 'نقشه‌برداری و GIS',
    departmentKey: 'SURVEY',
    descriptionFa: 'بارگذاری لایه‌های DXF و GIS پیت و پله‌ها، نقشه‌برداری پهپادی، محاسبه احجام و مدل‌های سه‌بعدی',
    descriptionEn: 'DXF/GIS layer management, drone surveying, bench volume calculations & 3D models',
    defaultPermissions: ['map_edit', 'map_layers_manage', 'survey_upload', 'blocks_view', 'tasks_manage']
  },
  {
    id: 'DispatchSupervisor',
    nameFa: 'سرپرست دیسپاچینگ و ناوگان',
    nameEn: 'Dispatch & Fleet Supervisor',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    icon: Truck,
    department: 'ترابری و ماشین‌آلات سنگین',
    departmentKey: 'DISPATCH',
    descriptionFa: 'جانمایی ناوگان روی نقشه، تخصیص شاول‌ها و دامپتراک‌ها، پایش ساعات کارکرد و هشدارهای سرویس',
    descriptionEn: 'Fleet GIS placement, shovel-truck dispatching, machine hours & service tracking',
    defaultPermissions: ['dispatch_manage', 'equipment_manage', 'blocks_view', 'map_view', 'tasks_manage']
  },
  {
    id: 'PitSupervisor',
    nameFa: 'سرپرست عملیات صحرایی و پیت',
    nameEn: 'Pit Operations Supervisor',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Shield,
    department: 'عملیات صحرایی پیت',
    departmentKey: 'PIT_OPS',
    descriptionFa: 'نظارت بر بارگیری و باربری شیفت، ثبت گزارش‌های روزانه استخراج و تحویل شیفت کاری',
    descriptionEn: 'Field loading/haulage oversight, shift logs, pit safety check & shift handover',
    defaultPermissions: ['dispatch_manage', 'blocks_view', 'map_view', 'alerts_manage', 'tasks_manage']
  },
  {
    id: 'LabTechnician',
    nameFa: 'کارشناس آزمایشگاه و عیارسنجی',
    nameEn: 'Assay Lab Chemist',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: FlaskConical,
    department: 'آزمایشگاه کنترل کیفی',
    departmentKey: 'LAB',
    descriptionFa: 'ثبت و تایید نتایج آنالیز آزمایشگاهی (XRF / ICP)، تعیین درصد عناصر مفید و مزاحم',
    descriptionEn: 'XRF/ICP assay entry, chemical analysis verification & metallurgical testing',
    defaultPermissions: ['samples_manage', 'lab_results_entry', 'blocks_view', 'tasks_manage']
  },
  {
    id: 'WarehouseOfficer',
    nameFa: 'مسئول دپو و انبار محصول',
    nameEn: 'Stockpile & Warehouse Officer',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    icon: Warehouse,
    department: 'انبار و کنترل دپوها',
    departmentKey: 'WAREHOUSE',
    descriptionFa: 'مدیریت دپوهای باطله و عیار متوسط/بالا، ثبت حواله‌های ورود و خروج، باسکول و انبار ناریه',
    descriptionEn: 'Stockpile capacity tracking, weighbridge receipts, explosives & fuel warehouse',
    defaultPermissions: ['warehouse_manage', 'stockpile_manage', 'haulage_view', 'tasks_manage']
  },
  {
    id: 'HSEOfficer',
    nameFa: 'کارشناس ایمنی و HSE',
    nameEn: 'HSE & Safety Officer',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: AlertTriangle,
    department: 'ایمنی و HSE',
    departmentKey: 'HSE',
    descriptionFa: 'ثبت حوادث و رویدادهای ایمنی، بررسی شیب پله‌ها، خطرات جاده‌های معدنی و آلارم‌های شرایط بحرانی',
    descriptionEn: 'Safety incident logging, bench slope monitoring, haul road risk alerts & compliance',
    defaultPermissions: ['alerts_manage', 'map_view', 'blocks_view', 'safety_audit', 'tasks_manage']
  },
];

export const PERMISSION_LIST = [
  { id: 'all', nameFa: 'دسترسی کامل مدیریت سیستم', nameEn: 'Full Administrator Access' },
  { id: 'map_view', nameFa: 'مشاهده نقشه و پیت‌ها', nameEn: 'View Mine GIS Map' },
  { id: 'map_edit', nameFa: 'ویرایش نقشه و ترسیمات', nameEn: 'Edit GIS Layers & Drawings' },
  { id: 'map_layers_manage', nameFa: 'مدیریت لایه‌ها و فایل‌های نقشه‌برداری', nameEn: 'Manage Map Layers & DXF' },
  { id: 'blocks_manage', nameFa: 'تعریف و مدیریت بلوک‌ها', nameEn: 'Manage Mining Blocks' },
  { id: 'blocks_approve', nameFa: 'تایید نهایی استخراج بلوک', nameEn: 'Approve Block Extraction' },
  { id: 'samples_manage', nameFa: 'مدیریت نمونه‌ها و عیارسنجی', nameEn: 'Manage Samples & Assay' },
  { id: 'grade_classify', nameFa: 'طبقه‌بندی و تعیین مرز کانسنگ', nameEn: 'Grade Classification' },
  { id: 'lab_results_entry', nameFa: 'ثبت و تایید نتایج آزمایشگاه', nameEn: 'Lab Results Entry' },
  { id: 'dispatch_manage', nameFa: 'دیسپاچینگ و تخصیص ناوگان', nameEn: 'Dispatch & Fleet Allocation' },
  { id: 'equipment_manage', nameFa: 'جانمایی و مدیریت ماشین‌آلات', nameEn: 'Equipment GIS Placement' },
  { id: 'warehouse_manage', nameFa: 'مدیریت انبار و ناریه', nameEn: 'Warehouse & Explosives' },
  { id: 'stockpile_manage', nameFa: 'مدیریت دپوها و باسکول', nameEn: 'Stockpiles & Weighbridge' },
  { id: 'safety_audit', nameFa: 'ثبت ممیزی و هشدارهای ایمنی', nameEn: 'Safety & HSE Audits' },
  { id: 'tasks_manage', nameFa: 'پیگیری و ارجاع تسک‌های واحد', nameEn: 'Task Assignment & Referral' },
  { id: 'users_manage', nameFa: 'مدیریت کاربران و دسترسی‌ها', nameEn: 'Manage Users & Permissions' },
  { id: 'audit_view', nameFa: 'مشاهده سوابق و ردپای تغییرات', nameEn: 'View System Audit Trail' },
  { id: 'export_data', nameFa: 'خروجی داده‌ها و گزارش‌ها', nameEn: 'Export Data & Reports' },
];

export const SEED_USERS: Omit<User, 'id'>[] = [
  {
    code: 'AES-1001',
    fullName: 'مهندس محمدرضا رضایی',
    email: 'admin@aes.com',
    password: 'admin',
    role: 'Manager',
    department: 'مدیریت ارشد',
    phone: '۰۹۱۲۱۱۱۰۰۰۱',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-01-10T08:00:00.000Z',
    lastLogin: '2026-08-30T10:00:00.000Z',
    permissions: ['all', 'users_manage', 'blocks_approve', 'map_edit', 'export_data', 'audit_view', 'tasks_manage'],
    notes: 'مدیر کل و سرپرست ارشد عملیات مجتمع معدنی'
  },
  {
    code: 'AES-1002',
    fullName: 'مهندس علی کریمی',
    email: 'karimi@aes.com',
    password: 'pass123',
    role: 'MiningEngineer',
    department: 'مهندسی استخراج',
    phone: '۰۹۱۲۲۲۲۰۰۰۲',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-01-15T09:30:00.000Z',
    lastLogin: '2026-08-30T09:45:00.000Z',
    permissions: ['blocks_manage', 'map_edit', 'drilling_manage', 'haulage_view', 'export_data', 'audit_view', 'tasks_manage'],
    notes: 'سرپرست طراحی و برنامه‌ریزی استخراج پیت ۱ و ۲'
  },
  {
    code: 'AES-1003',
    fullName: 'دکتر سارا مهدوی',
    email: 'mahdavi@aes.com',
    password: 'pass123',
    role: 'Geologist',
    department: 'زمین‌شناسی و اکتشاف',
    phone: '۰۹۱۲۳۳۳۰۰۰۳',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z',
    lastLogin: '2026-08-30T08:15:00.000Z',
    permissions: ['samples_manage', 'grade_classify', 'map_view', 'blocks_view', 'export_data', 'tasks_manage'],
    notes: 'مسئول مدل‌سازی ژئوشیمیایی، عیارسنجی و تفکیک زون کانسنگ'
  },
  {
    code: 'AES-1004',
    fullName: 'مهندس نوید صادقی',
    email: 'sadeghi@aes.com',
    password: 'pass123',
    role: 'Surveyor',
    department: 'نقشه‌برداری و GIS',
    phone: '۰۹۱۲۴۴۴۰۰۰۴',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-02-10T14:20:00.000Z',
    lastLogin: '2026-08-30T09:00:00.000Z',
    permissions: ['map_edit', 'map_layers_manage', 'survey_upload', 'blocks_view', 'tasks_manage'],
    notes: 'مسئول نقشه‌برداری پهپادی، کاداستر پله‌ها و بارگذاری فایل‌های DXF'
  },
  {
    code: 'AES-1005',
    fullName: 'مهندس بهزاد رحمانی',
    email: 'rahmani@aes.com',
    password: 'pass123',
    role: 'DispatchSupervisor',
    department: 'ترابری و ماشین‌آلات سنگین',
    phone: '۰۹۱۲۵۵۵۰۰۰۵',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-02-20T08:00:00.000Z',
    lastLogin: '2026-08-30T10:10:00.000Z',
    permissions: ['dispatch_manage', 'equipment_manage', 'blocks_view', 'map_view', 'tasks_manage'],
    notes: 'سرپرست دیسپاچینگ، جانمایی GIS ماشین‌آلات و رصد ساعات کارکرد ناوگان'
  },
  {
    code: 'AES-1006',
    fullName: 'مهندس رضا موسوی',
    email: 'mousavi@aes.com',
    password: 'pass123',
    role: 'PitSupervisor',
    department: 'عملیات صحرایی پیت',
    phone: '۰۹۱۲۶۶۶۰۰۰۶',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-03-05T07:15:00.000Z',
    lastLogin: '2026-08-30T07:30:00.000Z',
    permissions: ['dispatch_manage', 'blocks_view', 'map_view', 'alerts_manage', 'tasks_manage'],
    notes: 'سرپرست شیفت استخراج و بارگیری جبهه‌کارهای فعال'
  },
  {
    code: 'AES-1007',
    fullName: 'مهندس مریم اکبری',
    email: 'akbari@aes.com',
    password: 'pass123',
    role: 'LabTechnician',
    department: 'آزمایشگاه کنترل کیفی',
    phone: '۰۹۱۲۷۷۷۰۰۰۷',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-03-20T11:00:00.000Z',
    lastLogin: '2026-08-30T08:45:00.000Z',
    permissions: ['samples_manage', 'lab_results_entry', 'blocks_view', 'tasks_manage'],
    notes: 'مسئول آزمایشگاه آنالیز XRF/ICP و سنجش عناصر مزاحم سنگ آهن'
  },
  {
    code: 'AES-1008',
    fullName: 'مهندس فرهاد کاظمی',
    email: 'kazemi@aes.com',
    password: 'pass123',
    role: 'WarehouseOfficer',
    department: 'انبار و کنترل دپوها',
    phone: '۰۹۱۲۸۸۸۰۰۰۸',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-04-01T08:30:00.000Z',
    lastLogin: '2026-08-30T09:15:00.000Z',
    permissions: ['warehouse_manage', 'stockpile_manage', 'haulage_view', 'tasks_manage'],
    notes: 'مسئول کنترل ظرفیت دپوهای سنگ‌آهن، باسکول و انبار ناریه معدن'
  },
  {
    code: 'AES-1009',
    fullName: 'مهندس الهام شریفی',
    email: 'sharifi@aes.com',
    password: 'pass123',
    role: 'HSEOfficer',
    department: 'ایمنی و HSE',
    phone: '۰۹۱۲۹۹۹۰۰۰۹',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-04-10T09:00:00.000Z',
    lastLogin: '2026-08-30T09:50:00.000Z',
    permissions: ['alerts_manage', 'map_view', 'blocks_view', 'safety_audit', 'tasks_manage'],
    notes: 'کارشناس ارشد ایمنی، بهداشت، پایش شیب دیواره‌ها و محیط زیست'
  },
];

export function getRoleDefinition(roleId: string): RoleDefinition {
  const found = SYSTEM_ROLES.find(r => r.id.toLowerCase() === roleId.toLowerCase());
  if (found) return found;

  // Fallback for legacy role names
  if (roleId === 'Client') return SYSTEM_ROLES[0];
  if (roleId === 'Supervision') return SYSTEM_ROLES[1];
  if (roleId === 'MiningContractor') return SYSTEM_ROLES[5];
  if (roleId === 'CrushingContractor') return SYSTEM_ROLES[7];

  return SYSTEM_ROLES[0];
}

export function hasPermission(user: User | null, permissionId: string): boolean {
  if (!user) return false;
  if (user.role === 'Manager' || user.role === 'Admin' || user.role === 'Client') return true;
  if (user.permissions?.includes('all')) return true;
  if (user.permissions?.includes(permissionId)) return true;

  const roleDef = getRoleDefinition(user.role);
  if (roleDef.defaultPermissions.includes('all')) return true;
  return roleDef.defaultPermissions.includes(permissionId);
}
