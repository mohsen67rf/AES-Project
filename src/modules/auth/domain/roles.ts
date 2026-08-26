// src/modules/auth/domain/roles.ts

import React from 'react';
import {
  ShieldCheck,
  HardHat,
  Pickaxe,
  Compass,
  Shield,
  FlaskConical,
} from 'lucide-react';
import type { User } from '../../../core/domain/types/mine.types';

export interface RoleDefinition {
  id: string;
  nameFa: string;
  nameEn: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  department: string;
  descriptionFa: string;
  descriptionEn: string;
  defaultPermissions: string[];
}

export const SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: 'Manager',
    nameFa: 'مدیر کل و سرپرست سیستم',
    nameEn: 'System Administrator / Mine Director',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    icon: ShieldCheck,
    department: 'مدیریت ارشد',
    descriptionFa: 'دسترسی کامل به تمامی بخش‌ها، داشبوردها، تنظیمات و مدیریت کاربران',
    descriptionEn: 'Full administrative access across all modules, settings & users',
    defaultPermissions: ['all', 'users_manage', 'blocks_approve', 'map_edit', 'mine_config', 'export_data', 'audit_view']
  },
  {
    id: 'MiningEngineer',
    nameFa: 'مهندس استخراج و برنامه‌ریزی',
    nameEn: 'Mining & Planning Engineer',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: HardHat,
    department: 'مهندسی استخراج',
    descriptionFa: 'طراحی و مدیریت بلوک‌ها، الگوهای حفاری، پایش پیشرفت پیت و خروجی استخراج',
    descriptionEn: 'Block design, drill pattern engineering, pit planning & production',
    defaultPermissions: ['blocks_manage', 'map_edit', 'drilling_manage', 'haulage_view', 'export_data', 'audit_view']
  },
  {
    id: 'Geologist',
    nameFa: 'زمین‌شناس و کنترل عیار',
    nameEn: 'Geologist & Grade Control',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: Pickaxe,
    department: 'زمین‌شناسی و اکتشاف',
    descriptionFa: 'بررسی ژئوشیمیایی، تایید نتایج عیار، طبقه‌بندی زون‌های کانسنگی و باطله',
    descriptionEn: 'Assay validation, geochemical zoning, ore/waste boundary definition',
    defaultPermissions: ['samples_manage', 'grade_classify', 'map_view', 'blocks_view', 'export_data']
  },
  {
    id: 'Surveyor',
    nameFa: 'مهندس نقشه‌بردار و ژئودزی',
    nameEn: 'Mine Surveyor & Geodesy',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    icon: Compass,
    department: 'نقشه‌برداری و GIS',
    descriptionFa: 'بارگذاری فایل‌های DXF/Shapefile، به‌روزرسانی پله‌ها، محاسبه احجام و مسیرهای حمل',
    descriptionEn: 'DXF/GIS uploads, bench volume calculation & haul road surveying',
    defaultPermissions: ['map_edit', 'map_layers_manage', 'survey_upload', 'blocks_view']
  },
  {
    id: 'PitSupervisor',
    nameFa: 'سرپرست عملیات پیت',
    nameEn: 'Pit Operations Supervisor',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Shield,
    department: 'عملیات صحرایی و پیت',
    descriptionFa: 'نظارت بر بارگیری شاول، تردد دامپتراک‌ها و اجرای برنامه‌های شیفت کاری',
    descriptionEn: 'Shovel/Truck dispatch control, shift monitoring & safety checks',
    defaultPermissions: ['dispatch_manage', 'blocks_view', 'map_view', 'alerts_manage']
  },
  {
    id: 'LabTechnician',
    nameFa: 'کارشناس آزمایشگاه و آنالیز',
    nameEn: 'Laboratory Chemist / Assay Tech',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: FlaskConical,
    department: 'آزمایشگاه کنترل کیفی',
    descriptionFa: 'ثبت نتایج آنالیز XRF/ICP، تایید نمونه‌های ژئومتالورژی و عیارسنجی',
    descriptionEn: 'Lab assay entry, elemental test validation & sample tracking',
    defaultPermissions: ['samples_manage', 'lab_results_entry', 'blocks_view']
  },
];

export const PERMISSION_LIST = [
  { id: 'map_view', nameFa: 'مشاهده نقشه و پیت‌ها', nameEn: 'View Mine GIS Map' },
  { id: 'map_edit', nameFa: 'ویرایش نقشه و ترسیمات', nameEn: 'Edit GIS Layers & Drawings' },
  { id: 'blocks_manage', nameFa: 'تعریف و مدیریت بلوک‌ها', nameEn: 'Manage Mining Blocks' },
  { id: 'blocks_approve', nameFa: 'تایید نهایی استخراج بلوک', nameEn: 'Approve Block Extraction' },
  { id: 'samples_manage', nameFa: 'مدیریت نمونه‌ها و عیارسنجی', nameEn: 'Manage Samples & Assay' },
  { id: 'dispatch_manage', nameFa: 'دیسپچینگ و ثبت ناوگان', nameEn: 'Dispatch & Fleet Control' },
  { id: 'users_manage', nameFa: 'مدیریت کاربران و دسترسی‌ها', nameEn: 'Manage Users & Permissions' },
  { id: 'audit_view', nameFa: 'مشاهده سوابق و لاگ سیستم', nameEn: 'View System Audit Trail' },
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
    isActive: true,
    createdAt: '2026-01-10T08:00:00.000Z',
    lastLogin: '2026-08-25T13:20:00.000Z',
    permissions: ['all', 'users_manage', 'blocks_approve', 'map_edit', 'export_data', 'audit_view'],
    notes: 'مدیر کل و سرپرست ارشد عملیات معدنی'
  },
  {
    code: 'AES-1002',
    fullName: 'مهندس علی کریمی',
    email: 'a.karimi@aes.com',
    password: 'user123',
    role: 'MiningEngineer',
    department: 'مهندسی استخراج',
    phone: '۰۹۱۲۲۲۲۰۰۰۲',
    isActive: true,
    createdAt: '2026-01-15T09:30:00.000Z',
    lastLogin: '2026-08-24T17:45:00.000Z',
    permissions: ['blocks_manage', 'map_edit', 'drilling_manage', 'export_data'],
    notes: 'سرپرست برنامه‌ریزی استخراج پیت شمالی'
  },
  {
    code: 'AES-1003',
    fullName: 'دکتر سارا مهدوی',
    email: 's.mahdavi@aes.com',
    password: 'user123',
    role: 'Geologist',
    department: 'زمین‌شناسی و اکتشاف',
    phone: '۰۹۱۲۳۳۳۰۰۰۳',
    isActive: true,
    createdAt: '2026-02-01T10:00:00.000Z',
    lastLogin: '2026-08-25T11:15:00.000Z',
    permissions: ['samples_manage', 'grade_classify', 'map_view', 'export_data'],
    notes: 'مسئول مدل‌سازی عیار و زون‌بندی کانسنگ'
  },
  {
    code: 'AES-1004',
    fullName: 'مهندس نوید صادقی',
    email: 'n.sadeghi@aes.com',
    password: 'user123',
    role: 'Surveyor',
    department: 'نقشه‌برداری و ژئودزی',
    phone: '۰۹۱۲۴۴۴۰۰۰۴',
    isActive: true,
    createdAt: '2026-02-10T14:20:00.000Z',
    lastLogin: '2026-08-25T09:00:00.000Z',
    permissions: ['map_edit', 'survey_upload', 'blocks_view'],
    notes: 'مسئول برداشت پهپادی و به‌روزرسانی مدل‌های سه‌بعدی پیت'
  },
  {
    code: 'AES-1005',
    fullName: 'مهندس رضا موسوی',
    email: 'r.mousavi@aes.com',
    password: 'user123',
    role: 'PitSupervisor',
    department: 'عملیات صحرایی و پیت',
    phone: '۰۹۱۲۵۵۵۰۰۰۵',
    isActive: true,
    createdAt: '2026-03-05T07:15:00.000Z',
    lastLogin: '2026-08-25T12:30:00.000Z',
    permissions: ['dispatch_manage', 'blocks_view', 'map_view'],
    notes: 'سرپرست شیفت الف استخراج و بارگیری'
  },
  {
    code: 'AES-1006',
    fullName: 'مهندس مریم اکبری',
    email: 'm.akbari@aes.com',
    password: 'user123',
    role: 'LabTechnician',
    department: 'آزمایشگاه کنترل کیفی',
    phone: '۰۹۱۲۶۶۶۰۰۰۶',
    isActive: true,
    createdAt: '2026-03-20T11:00:00.000Z',
    lastLogin: '2026-08-23T15:10:00.000Z',
    permissions: ['samples_manage', 'lab_results_entry'],
    notes: 'آنالیز روزانه عیار آهن و عناصر مزاحم'
  },
  {
    code: 'AES-1007',
    fullName: 'مهندس پویا نظری',
    email: 'p.nazari@aes.com',
    password: 'user123',
    role: 'MiningEngineer',
    department: 'مهندسی استخراج',
    phone: '۰۹۱۲۷۷۷۰۰۰۷',
    isActive: false,
    createdAt: '2026-04-01T08:30:00.000Z',
    lastLogin: '2026-07-15T16:00:00.000Z',
    permissions: ['blocks_manage', 'map_view'],
    notes: 'کاربر غیرفعال - پایان دوره ماموریت'
  },
];
