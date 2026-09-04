// src/modules/alert/services/AlertService.ts

import { Alert, AlertSeverity, AlertDepartment } from '../../../core/domain/types/alert.types';
import { LocalStorageRepository } from '../../../core/infrastructure/repositories/LocalStorageRepository';
import type { User } from '../../../core/domain/types/mine.types';

export const AlertRepository = new LocalStorageRepository<Alert>('aes_system_alerts');

const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-001',
    title: 'هشدار افت عیار در ساب‌بلوک SB-08',
    message: 'عیار آهن اندازه‌گیری شده در نتایج آزمایشگاه (Fe: 44.2%) کمتر از حد نصاب ۵۲٪ است. نیاز به تصمیم‌گیری جهت تغییر مقصد به دپوی عیار پایین.',
    severity: 'WARNING',
    department: 'GEOLOGY',
    targetRole: 'Geologist',
    sourceModule: 'LAB',
    entityId: 'SB-08',
    actionUrl: '/mining-lifecycle',
    actionLabelFa: 'بررسی در چرخه ساب‌بلوک',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'alt-002',
    title: 'نیاز به جانمایی دامپتراک ۱۰۰ تن (TR-102)',
    message: 'دستگاه TR-102 پس از پایان تعمیرات به چرخه عملیات بازگشته و در وضعیت آماده به کار قرار دارد. لطفاً جانمایی آن را روی نقشه به‌روزرسانی کنید.',
    severity: 'INFO',
    department: 'DISPATCH',
    targetRole: 'DispatchSupervisor',
    sourceModule: 'EQUIPMENT',
    entityId: 'eq-truck-102',
    actionUrl: '/equipment',
    actionLabelFa: 'مشاهده و جانمایی روی نقشه',
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: 'alt-003',
    title: 'خطر ریزش موضعی در دیواره پله پیت شماره ۱',
    message: 'سنسورهای ژئوتکنیکال جابجایی ۵ سانتی‌متری در دیواره شرقی پله ۱۰۴۰ ثبت کردند. تردد در این محدوده تا بررسی نهایی مهندسی محدود گردد.',
    severity: 'CRITICAL',
    department: 'HSE',
    targetRole: 'HSEOfficer',
    sourceModule: 'HSE',
    entityId: 'pit-1-bench-1040',
    actionUrl: '/mine/map',
    actionLabelFa: 'بررسی در نقشه سه‌بعدی پیت',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'alt-004',
    title: 'تأیید طرح آتشباری بلوک B-14',
    message: 'طرح الگوی چال‌های انفجاری بلوک B-14 توسط مهندسی استخراج نهایی شد و در انتظار تایید سرپرست سیستم می‌باشد.',
    severity: 'INFO',
    department: 'MANAGEMENT',
    targetRole: 'Manager',
    sourceModule: 'BLOCK',
    entityId: 'blk-b14',
    actionUrl: '/blocks-management',
    actionLabelFa: 'بررسی و تایید بلوک',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'alt-005',
    title: 'کاهش موجودی آنفو در انبار مواد ناریه',
    message: 'موجودی ماده منفجره آنفو به کمتر از ۲۰ تن (حداقل موجودی مجاز) رسیده است. درخواست صدور مجوز شارژ انبار صادر شود.',
    severity: 'WARNING',
    department: 'WAREHOUSE',
    targetRole: 'WarehouseOfficer',
    sourceModule: 'WAREHOUSE',
    entityId: 'exp-anfo',
    actionUrl: '/warehouse',
    actionLabelFa: 'مدیریت انبار ناریه',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'alt-006',
    title: 'آماده‌سازی ۷ نمونه جدید لاگین جهت آنالیز XRF',
    message: 'نمونه‌های برداشت شده از گمانه‌های پله ۱۰۴۰ تحویل واحد آزمایشگاه شد. نتایج حداکثر تا ۲۴ ساعت آینده ثبت گردد.',
    severity: 'INFO',
    department: 'LAB',
    targetRole: 'LabTechnician',
    sourceModule: 'LAB',
    actionUrl: '/mining-lifecycle',
    actionLabelFa: 'ورود نتایج عیار',
    createdAt: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
  },
  {
    id: 'alt-007',
    title: 'به‌روزرسانی فایل نقشه‌برداری پهپادی پله‌های ۱۰۲۰ تا ۱۰۶۰',
    message: 'فایل کاداستر و احجام محاسبه شده برای پیشروی هفتگی توسط واحد ژئودزی در پایگاه بارگذاری شد.',
    severity: 'SUCCESS',
    department: 'SURVEY',
    targetRole: 'Surveyor',
    sourceModule: 'MINE',
    actionUrl: '/mine/map',
    actionLabelFa: 'مشاهده لایه‌ها',
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
  {
    id: 'alt-008',
    title: 'تکمیل سقف بارگیری شیفت صبح در پیت ۲',
    message: 'تعداد ۶۴ سرویس حمل با مجموع تناژ ۴,۱۵۰ تن کانسنگ پرعیار با موفقیت به سنگ‌شکن اولیه تحویل داده شد.',
    severity: 'SUCCESS',
    department: 'PIT_OPS',
    targetRole: 'PitSupervisor',
    sourceModule: 'MINE',
    actionUrl: '/dashboard',
    actionLabelFa: 'مشاهده لاگ‌های شیفت',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export class AlertService {
  private static ensureInitialized() {
    if (AlertRepository.count() === 0) {
      AlertRepository.saveBatch(INITIAL_ALERTS);
    }
  }

  public static getAllAlerts(): Alert[] {
    this.ensureInitialized();
    return AlertRepository.getAll();
  }

  public static getAlertsForUser(user: User | null): Alert[] {
    this.ensureInitialized();
    const all = AlertRepository.getAll();
    if (!user) return all;

    if (user.role === 'Manager' || user.role === 'Admin' || user.role === 'Client') {
      return all;
    }

    // Role mapping
    return all.filter(alert => {
      if (alert.department === 'ALL') return true;
      if (alert.targetRole && alert.targetRole.toLowerCase() === user.role.toLowerCase()) return true;

      // Department matches
      const userDept = (user.department || '').toLowerCase();
      if (alert.department === 'MINING' && (user.role === 'MiningEngineer' || userDept.includes('استخراج'))) return true;
      if (alert.department === 'GEOLOGY' && (user.role === 'Geologist' || userDept.includes('زمین'))) return true;
      if (alert.department === 'SURVEY' && (user.role === 'Surveyor' || userDept.includes('نقشه'))) return true;
      if (alert.department === 'DISPATCH' && (user.role === 'DispatchSupervisor' || userDept.includes('ترابری') || userDept.includes('دیسپاچینگ'))) return true;
      if (alert.department === 'PIT_OPS' && (user.role === 'PitSupervisor' || userDept.includes('پیت'))) return true;
      if (alert.department === 'LAB' && (user.role === 'LabTechnician' || userDept.includes('آزمایشگاه'))) return true;
      if (alert.department === 'WAREHOUSE' && (user.role === 'WarehouseOfficer' || userDept.includes('انبار') || userDept.includes('دپو'))) return true;
      if (alert.department === 'HSE' && (user.role === 'HSEOfficer' || userDept.includes('ایمنی'))) return true;

      return false;
    });
  }

  public static getUnreadAlerts(user?: User | null): Alert[] {
    const alerts = user ? this.getAlertsForUser(user) : this.getAllAlerts();
    return alerts.filter(a => !a.readAt && (!user || !a.readBy?.includes(user.id)));
  }

  public static markAsRead(alertId: string, userId?: string): void {
    const alert = AlertRepository.getById(alertId);
    if (!alert) return;

    const readBy = alert.readBy || [];
    if (userId && !readBy.includes(userId)) {
      readBy.push(userId);
    }

    AlertRepository.update(alertId, {
      readAt: new Date().toISOString(),
      readBy,
    });
  }

  public static markAllAsRead(user: User | null): void {
    const userAlerts = this.getAlertsForUser(user);
    userAlerts.forEach(a => {
      this.markAsRead(a.id, user?.id);
    });
  }

  public static createAlert(alertData: Omit<Alert, 'id' | 'createdAt'>): Alert {
    const newAlert: Alert = {
      ...alertData,
      id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    AlertRepository.save(newAlert);
    return newAlert;
  }

  public static checkAndGenerateAlerts(): void {
    this.ensureInitialized();
  }
}

export default AlertService;
