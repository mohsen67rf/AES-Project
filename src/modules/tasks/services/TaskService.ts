// src/modules/tasks/services/TaskService.ts

import { UnitTask, TaskStatus, TaskPriority } from '../../../core/domain/types/task.types';
import { LocalStorageRepository } from '../../../core/infrastructure/repositories/LocalStorageRepository';
import type { User } from '../../../core/domain/types/mine.types';

export const TaskRepository = new LocalStorageRepository<UnitTask>('aes_unit_tasks');

const INITIAL_TASKS: UnitTask[] = [
  {
    id: 'tsk-001',
    code: 'TSK-101',
    title: 'بررسی شیب پله ۱۰۴۰ و طراحی چال‌های انفجاری بلوک B-12',
    description: 'با توجه به پیشروی شیفت قبل، هندسه بلوک B-12 در پله ۱۰۴۰ نیازمند تنظیم مجدد بارسنگ (Burden) و فاصله چال‌ها (Spacing) جهت کاهش بولدر در سنگ‌شکن است.',
    department: 'مهندسی استخراج',
    assignedRole: 'MiningEngineer',
    assignedUserId: 'AES-1002',
    assignedUserName: 'مهندس علی کریمی',
    createdByUserId: 'AES-1001',
    createdByUserName: 'مهندس محمدرضا رضایی (مدیر کل)',
    createdByUserRole: 'Manager',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    relatedModule: 'BLOCKS',
    relatedEntityId: 'blk-b12',
    relatedEntityCode: 'B-12',
    actionUrl: '/blocks-management',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        id: 'h-1',
        action: 'CREATED',
        byUserId: 'AES-1001',
        byUserName: 'مهندس محمدرضا رضایی',
        byUserRole: 'Manager',
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        comment: 'ارجاع اولیه از سوی مدیریت عملیات',
      },
      {
        id: 'h-2',
        action: 'STATUS_CHANGED',
        byUserId: 'AES-1002',
        byUserName: 'مهندس علی کریمی',
        byUserRole: 'MiningEngineer',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        comment: 'در حال اصلاح شبکه حفاری در نرم‌افزار مدلسازی',
      }
    ]
  },
  {
    id: 'tsk-002',
    code: 'TSK-102',
    title: 'تایید عیار نمونه‌های گمانه BH-44 و تفکیک مرز زون پرعیار',
    description: 'لاگین گمانه‌های اکتشافی پیت شماره ۲ پایان یافته است. لطفا مرز باطله و کانسنگ آهن بالای ۵۵ درصد را جهت استخراج ساب‌بلوک SB-04 نهایی کنید.',
    department: 'زمین‌شناسی و اکتشاف',
    assignedRole: 'Geologist',
    assignedUserId: 'AES-1003',
    assignedUserName: 'دکتر سارا مهدوی',
    createdByUserId: 'AES-1002',
    createdByUserName: 'مهندس علی کریمی (استخراج)',
    createdByUserRole: 'MiningEngineer',
    priority: 'URGENT',
    status: 'PENDING',
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
    relatedModule: 'LAB',
    relatedEntityId: 'SB-04',
    relatedEntityCode: 'SB-04',
    actionUrl: '/mining-lifecycle',
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        id: 'h-3',
        action: 'CREATED',
        byUserId: 'AES-1002',
        byUserName: 'مهندس علی کریمی',
        byUserRole: 'MiningEngineer',
        timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString(),
        comment: 'ارجاع نیاز به تایید زمین‌شناسی جهت شروع بارگیری',
      }
    ]
  },
  {
    id: 'tsk-003',
    code: 'TSK-103',
    title: 'تخصیص ۳ دستگاه دامپتراک ۱۰۰ تن به شاول هیدرولیکی SH-02',
    description: 'به دلیل افزایش دبی استخراج در جبهه‌کار شرقی، تعداد ناوگان حمل اختصاص یافته به شاول شماره ۲ از ۵ دستگاه به ۸ دستگاه ارتقا یابد.',
    department: 'ترابری و ماشین‌آلات سنگین',
    assignedRole: 'DispatchSupervisor',
    assignedUserId: 'AES-1005',
    assignedUserName: 'مهندس بهزاد رحمانی',
    createdByUserId: 'AES-1006',
    createdByUserName: 'مهندس رضا موسوی (سرپرست پیت)',
    createdByUserRole: 'PitSupervisor',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueDate: new Date(Date.now() + 86400000 * 0.5).toISOString(),
    relatedModule: 'EQUIPMENT',
    actionUrl: '/equipment',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        id: 'h-4',
        action: 'CREATED',
        byUserId: 'AES-1006',
        byUserName: 'مهندس رضا موسوی',
        byUserRole: 'PitSupervisor',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        comment: 'درخواست افزایش ظرفیت ناوگان باربری شیفت',
      }
    ]
  },
  {
    id: 'tsk-004',
    code: 'TSK-104',
    title: 'برداشت پهپادی و محاسبه احجام دپوی محصول پرعیار (Stockpile A)',
    description: 'نقشه‌برداری و تولید مدل سه‌بعدی ارتوفتو جهت محاسبه تناژ ذخیره شده در دپوی سنگ‌آهن قبل از تحویل به خط دانه‌بندی.',
    department: 'نقشه‌برداری و GIS',
    assignedRole: 'Surveyor',
    assignedUserId: 'AES-1004',
    assignedUserName: 'مهندس نوید صادقی',
    createdByUserId: 'AES-1008',
    createdByUserName: 'مهندس فرهاد کاظمی (انبار و دپو)',
    createdByUserRole: 'WarehouseOfficer',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    relatedModule: 'GIS',
    actionUrl: '/mine/map',
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        id: 'h-5',
        action: 'CREATED',
        byUserId: 'AES-1008',
        byUserName: 'مهندس فرهاد کاظمی',
        byUserRole: 'WarehouseOfficer',
        timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
        comment: 'موازنه ماهانه تناژ باسکول و حجم توپوگرافی دپو',
      }
    ]
  },
  {
    id: 'tsk-005',
    code: 'TSK-105',
    title: 'آنالیز سریع عنصری XRF نمونه‌های پودر حفاری چال‌های ۱۵ تا ۲۴',
    description: 'سنجش میزان گوگرد (S) و فسفر (P) در چال‌های انفجاری مرزی پله ۱۰۲۰ جهت جلوگیری از ورود ناخالصی به کوره کارفرما.',
    department: 'آزمایشگاه کنترل کیفی',
    assignedRole: 'LabTechnician',
    assignedUserId: 'AES-1007',
    assignedUserName: 'مهندس مریم اکبری',
    createdByUserId: 'AES-1003',
    createdByUserName: 'دکتر سارا مهدوی (زمین‌شناس)',
    createdByUserRole: 'Geologist',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    dueDate: new Date(Date.now() + 3600000 * 12).toISOString(),
    relatedModule: 'LAB',
    actionUrl: '/mining-lifecycle',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        id: 'h-6',
        action: 'CREATED',
        byUserId: 'AES-1003',
        byUserName: 'دکتر سارا مهدوی',
        byUserRole: 'Geologist',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        comment: 'نمونه‌ها به آزمایشگاه تحویل شد',
      }
    ]
  },
  {
    id: 'tsk-006',
    code: 'TSK-106',
    title: 'بازرسی ایمنی رمپ ورودی پیت و اصلاح شیب خاکریز حفاظتی (Berm)',
    description: 'ارتفاع خاکریز حفاظتی (برم ایمنی) در پیچ دوم رمپ ورودی کمتر از نصف قطر چرخ بزرگترین تراک است. بلافاصله با گریدر و بولدوزر اصلاح گردد.',
    department: 'ایمنی و HSE',
    assignedRole: 'HSEOfficer',
    assignedUserId: 'AES-1009',
    assignedUserName: 'مهندس الهام شریفی',
    createdByUserId: 'AES-1006',
    createdByUserName: 'مهندس رضا موسوی (سرپرست پیت)',
    createdByUserRole: 'PitSupervisor',
    priority: 'URGENT',
    status: 'PENDING',
    dueDate: new Date(Date.now() + 3600000 * 8).toISOString(),
    relatedModule: 'HSE',
    actionUrl: '/equipment',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        id: 'h-7',
        action: 'CREATED',
        byUserId: 'AES-1006',
        byUserName: 'مهندس رضا موسوی',
        byUserRole: 'PitSupervisor',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        comment: 'ثبت در چک‌لیست ایمنی روزانه پیت',
      }
    ]
  },
  {
    id: 'tsk-007',
    code: 'TSK-107',
    title: 'تکمیل فرم تحویل مواد ناریه و بارنامه باسکول دپوی باطله ۲',
    description: 'ثبت مغایرت ۳۰ تنی در بارنامه‌های خروجی باطله نسبت به آمار ماشین‌آلات باربری و بستن موازنه هفته جاری.',
    department: 'انبار و کنترل دپوها',
    assignedRole: 'WarehouseOfficer',
    assignedUserId: 'AES-1008',
    assignedUserName: 'مهندس فرهاد کاظمی',
    createdByUserId: 'AES-1001',
    createdByUserName: 'مهندس محمدرضا رضایی (مدیر کل)',
    createdByUserRole: 'Manager',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    dueDate: new Date(Date.now() - 3600000 * 10).toISOString(),
    relatedModule: 'WAREHOUSE',
    actionUrl: '/warehouse',
    completionNotes: 'رسیدهای باسکول بازشماری و سند موازنه باطله نهایی شد.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    history: [
      {
        id: 'h-8',
        action: 'COMPLETED',
        byUserId: 'AES-1008',
        byUserName: 'مهندس فرهاد کاظمی',
        byUserRole: 'WarehouseOfficer',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        comment: 'مغایرت رفع و سند ثبت گردید',
      }
    ]
  },
];

export class TaskService {
  private static ensureInitialized() {
    if (TaskRepository.count() === 0) {
      TaskRepository.saveBatch(INITIAL_TASKS);
    }
  }

  public static getAllTasks(): UnitTask[] {
    this.ensureInitialized();
    return TaskRepository.getAll();
  }

  public static getTasksForUser(user: User | null): UnitTask[] {
    this.ensureInitialized();
    const all = TaskRepository.getAll();
    if (!user) return all;

    if (user.role === 'Manager' || user.role === 'Admin' || user.role === 'Client') {
      return all;
    }

    return all.filter(t => {
      if (t.assignedUserId === user.id || t.assignedUserId === user.code) return true;
      if (t.assignedRole.toLowerCase() === user.role.toLowerCase()) return true;
      if (t.createdByUserId === user.id || t.createdByUserId === user.code) return true;

      const userDept = (user.department || '').toLowerCase();
      if (t.department.toLowerCase().includes(userDept) || userDept.includes(t.department.toLowerCase())) return true;

      return false;
    });
  }

  public static updateTaskStatus(
    taskId: string, 
    newStatus: TaskStatus, 
    user: User, 
    comment?: string,
    completionNotes?: string
  ): UnitTask | null {
    const task = TaskRepository.getById(taskId);
    if (!task) return null;

    const actionLog = {
      id: `act-${Date.now()}`,
      action: newStatus === 'COMPLETED' ? 'COMPLETED' as const : 'STATUS_CHANGED' as const,
      byUserId: user.id || user.code,
      byUserName: user.fullName,
      byUserRole: user.role,
      timestamp: new Date().toISOString(),
      comment: comment || `تغییر وضعیت تسک به ${newStatus}`,
    };

    const updatedTask: UnitTask = {
      ...task,
      status: newStatus,
      completionNotes: completionNotes || task.completionNotes,
      updatedAt: new Date().toISOString(),
      history: [actionLog, ...(task.history || [])],
    };

    TaskRepository.update(taskId, updatedTask);
    return updatedTask;
  }

  public static referTask(
    taskId: string,
    targetRole: string,
    targetUserId: string,
    targetUserName: string,
    targetDepartment: string,
    user: User,
    referralNote: string
  ): UnitTask | null {
    const task = TaskRepository.getById(taskId);
    if (!task) return null;

    const actionLog = {
      id: `act-${Date.now()}`,
      action: 'REFERRED' as const,
      byUserId: user.id || user.code,
      byUserName: user.fullName,
      byUserRole: user.role,
      timestamp: new Date().toISOString(),
      comment: `ارجاع به ${targetUserName} (${targetDepartment}): ${referralNote}`,
    };

    const updatedTask: UnitTask = {
      ...task,
      assignedRole: targetRole,
      assignedUserId: targetUserId,
      assignedUserName: targetUserName,
      department: targetDepartment,
      status: 'PENDING',
      updatedAt: new Date().toISOString(),
      history: [actionLog, ...(task.history || [])],
    };

    TaskRepository.update(taskId, updatedTask);
    return updatedTask;
  }

  public static createTask(
    data: {
      title: string;
      description: string;
      department: string;
      assignedRole: string;
      assignedUserId?: string;
      assignedUserName?: string;
      priority: TaskPriority;
      dueDate: string;
      relatedModule?: 'BLOCKS' | 'EQUIPMENT' | 'GIS' | 'LAB' | 'WAREHOUSE' | 'HSE' | 'GENERAL';
      actionUrl?: string;
    },
    user: User
  ): UnitTask {
    this.ensureInitialized();
    const count = TaskRepository.count() + 1;
    const newTask: UnitTask = {
      id: `tsk-${Date.now()}`,
      code: `TSK-${100 + count}`,
      title: data.title,
      description: data.description,
      department: data.department,
      assignedRole: data.assignedRole,
      assignedUserId: data.assignedUserId,
      assignedUserName: data.assignedUserName,
      createdByUserId: user.id || user.code,
      createdByUserName: user.fullName,
      createdByUserRole: user.role,
      priority: data.priority,
      status: 'PENDING',
      dueDate: data.dueDate,
      relatedModule: data.relatedModule || 'GENERAL',
      actionUrl: data.actionUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `act-${Date.now()}`,
          action: 'CREATED',
          byUserId: user.id || user.code,
          byUserName: user.fullName,
          byUserRole: user.role,
          timestamp: new Date().toISOString(),
          comment: 'ایجاد و ارجاع تسک به واحد مربوطه',
        }
      ]
    };

    TaskRepository.save(newTask);
    return newTask;
  }
}

export default TaskService;
