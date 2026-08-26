// src/core/services/ActivityLogger.ts

import { LocalStorageRepository } from '../infrastructure/repositories/LocalStorageRepository';
import type { 
  ActivityLog, 
  ActivityCategory, 
  ActivityActionType, 
  ActivitySeverity,
  ActivityFilterOptions,
  ActivitySummaryStats
} from '../domain/types/activity.types';
import type { User, Block, SubBlock } from '../domain/types/mine.types';

const ActivityRepo = new LocalStorageRepository<ActivityLog>('aes_activity_logs');

type Listener = () => void;
const listeners = new Set<Listener>();

export class ActivityLogger {
  private static notifyListeners() {
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in ActivityLogger listener:', err);
      }
    });
  }

  /**
   * Subscribe to real-time activity changes
   */
  static subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  /**
   * Get all raw logs
   */
  static getAll(): ActivityLog[] {
    this.seedSampleLogsIfEmpty();
    return ActivityRepo.getAll().sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Save a generic activity log
   */
  static log(data: {
    category: ActivityCategory;
    actionType: ActivityActionType;
    severity?: ActivitySeverity;
    title: string;
    description: string;
    user?: Partial<User> | null;
    targetEntity?: ActivityLog['targetEntity'];
    details?: ActivityLog['details'];
    ipAddress?: string;
  }): ActivityLog {
    let currentUser: Partial<User> | null = data.user || null;
    if (!currentUser) {
      try {
        const saved = localStorage.getItem('aes_session');
        if (saved) currentUser = JSON.parse(saved);
      } catch {
        // fallback
      }
    }

    const logEntry: ActivityLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      category: data.category,
      actionType: data.actionType,
      severity: data.severity || 'INFO',
      title: data.title,
      description: data.description,
      userId: currentUser?.id || 'SYSTEM_USER',
      userCode: currentUser?.code || 'AES-SYS',
      userName: currentUser?.fullName || 'کاربر سیستم',
      userRole: currentUser?.role || 'Engineer',
      targetEntity: data.targetEntity,
      details: data.details,
      ipAddress: data.ipAddress || '192.168.1.104',
    };

    ActivityRepo.save(logEntry);
    this.notifyListeners();
    return logEntry;
  }

  // ============================================
  // ۱. رویدادهای ورود، خروج و حساب کاربری
  // ============================================

  static logLogin(user: Partial<User>, ip: string = '192.168.1.104') {
    return this.log({
      category: 'AUTH',
      actionType: 'USER_LOGIN',
      severity: 'SUCCESS',
      title: 'ورود موفق به سامانه',
      description: `کاربر ${user.fullName || user.code} با نقش ${user.role || 'کاربر'} وارد داشبورد عملیاتی شد.`,
      user,
      targetEntity: {
        type: 'USER',
        id: user.id,
        code: user.code,
        name: user.fullName,
      },
      details: {
        route: '/dashboard',
        metadata: {
          browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
          loginTime: new Date().toISOString(),
        },
      },
      ipAddress: ip,
    });
  }

  static logLogout(user: Partial<User>) {
    return this.log({
      category: 'AUTH',
      actionType: 'USER_LOGOUT',
      severity: 'INFO',
      title: 'خروج از سامانه',
      description: `کاربر ${user.fullName || user.code} از سیستم خارج شد.`,
      user,
      targetEntity: {
        type: 'USER',
        id: user.id,
        code: user.code,
        name: user.fullName,
      },
      details: {
        metadata: {
          logoutTime: new Date().toISOString(),
        },
      },
    });
  }

  // ============================================
  // ۲. رویدادهای پیمایش معدن و صفحات
  // ============================================

  static logNavigation(
    route: string, 
    pageTitle: string, 
    user?: Partial<User> | null, 
    targetEntity?: ActivityLog['targetEntity']
  ) {
    let entityType: 'MINE' | 'PIT' | 'BLOCK' | 'PAGE' = 'PAGE';
    if (route.includes('/mine/map')) entityType = 'MINE';
    else if (route.includes('/pits')) entityType = 'PIT';
    else if (route.includes('/block/')) entityType = 'BLOCK';

    return this.log({
      category: 'NAVIGATION',
      actionType: 'MINE_NAVIGATION',
      severity: 'INFO',
      title: `پیمایش: ${pageTitle}`,
      description: `مشاهده و بررسی بخش ${pageTitle} در آدرس ${route}`,
      user,
      targetEntity: targetEntity || {
        type: entityType,
        name: pageTitle,
      },
      details: {
        route,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  // ============================================
  // ۳. رویدادهای بلوک و ساب‌بلوک
  // ============================================

  static logBlockCreate(block: Partial<Block>, user?: Partial<User> | null) {
    return this.log({
      category: 'BLOCKS',
      actionType: 'BLOCK_CREATE',
      severity: 'SUCCESS',
      title: `ایجاد بلوک جدید: ${block.code}`,
      description: `بلوک معدنی شماره ${block.code} در تراز ${block.targetLevel ?? block.benchLevel} با وضعیت ${block.status || 'DEFINED'} ثبت گردید.`,
      user,
      targetEntity: {
        type: 'BLOCK',
        id: block.id,
        code: block.code,
        name: `بلوک ${block.code}`,
      },
      details: {
        newValue: block,
        metadata: {
          targetLevel: block.targetLevel ?? block.benchLevel,
          totalHoles: block.drillingParams?.totalHoles,
        },
      },
    });
  }

  static logBlockUpdate(
    block: Partial<Block>, 
    user: Partial<User> | null | undefined, 
    changedFields: string[], 
    oldValue?: any, 
    newValue?: any
  ) {
    return this.log({
      category: 'BLOCKS',
      actionType: 'BLOCK_UPDATE',
      severity: 'INFO',
      title: `ویرایش بلوک: ${block.code}`,
      description: `پارامترهای بلوک ${block.code} شامل (${changedFields.join(', ')}) توسط کاربر بروزرسانی شد.`,
      user,
      targetEntity: {
        type: 'BLOCK',
        id: block.id,
        code: block.code,
        name: `بلوک ${block.code}`,
      },
      details: {
        changedFields,
        oldValue,
        newValue,
      },
    });
  }

  static logBlockStatusChange(
    block: Partial<Block>,
    user: Partial<User> | null | undefined,
    oldStatus: string,
    newStatus: string,
    note?: string
  ) {
    const isApproval = newStatus === 'APPROVED' || newStatus === 'COMPLETED';
    const isRejection = newStatus === 'REJECTED';

    return this.log({
      category: 'BLOCKS',
      actionType: isApproval ? 'BLOCK_APPROVE' : isRejection ? 'BLOCK_REJECT' : 'BLOCK_STATUS_CHANGE',
      severity: isApproval ? 'SUCCESS' : isRejection ? 'WARNING' : 'INFO',
      title: `تغییر وضعیت بلوک: ${block.code}`,
      description: `وضعیت بلوک ${block.code} از "${oldStatus}" به "${newStatus}" تغییر یافت.${note ? ` (توضیح: ${note})` : ''}`,
      user,
      targetEntity: {
        type: 'BLOCK',
        id: block.id,
        code: block.code,
      },
      details: {
        oldValue: { status: oldStatus },
        newValue: { status: newStatus, note },
        changedFields: ['status', 'lifecycleStatus'],
      },
    });
  }

  static logBlockDelete(blockCode: string, user?: Partial<User> | null, details?: any) {
    return this.log({
      category: 'BLOCKS',
      actionType: 'BLOCK_DELETE',
      severity: 'CRITICAL',
      title: `حذف بلوک معدنی: ${blockCode}`,
      description: `بلوک ${blockCode} به صورت کامل از پایگاه داده و چرخه برنامه‌ریزی حذف شد.`,
      user,
      targetEntity: {
        type: 'BLOCK',
        code: blockCode,
      },
      details: {
        oldValue: details,
      },
    });
  }

  static logSubBlockAction(
    action: 'CREATE' | 'SAMPLING' | 'LAB' | 'CLASSIFICATION' | 'DESTINATION' | 'CRUSHER',
    subBlock: Partial<SubBlock>,
    user?: Partial<User> | null,
    details?: any
  ) {
    const actionTitles: Record<string, { title: string; category: ActivityCategory; actionType: ActivityActionType; severity: ActivitySeverity }> = {
      CREATE: {
        title: `تفکیک ساب‌بلوک: ${subBlock.code}`,
        category: 'BLOCKS',
        actionType: 'SUBBLOCK_CREATE',
        severity: 'INFO',
      },
      SAMPLING: {
        title: `ثبت نمونه‌برداری ساب‌بلوک: ${subBlock.code}`,
        category: 'PROCESSING',
        actionType: 'SAMPLING_RECORD',
        severity: 'INFO',
      },
      LAB: {
        title: `ثبت و صحه‌گذاری آنالیز آزمایشگاه: ${subBlock.code}`,
        category: 'PROCESSING',
        actionType: 'LAB_ASSAY_SUBMIT',
        severity: 'SUCCESS',
      },
      CLASSIFICATION: {
        title: `طبقه‌بندی زمین‌شناسی ساب‌بلوک: ${subBlock.code}`,
        category: 'BLOCKS',
        actionType: 'CLASSIFICATION_APPLY',
        severity: 'INFO',
      },
      DESTINATION: {
        title: `تخصیص مقصد بارگیری: ${subBlock.code}`,
        category: 'PROCESSING',
        actionType: 'DESTINATION_ASSIGN',
        severity: 'SUCCESS',
      },
      CRUSHER: {
        title: `ثبت مصرف در خط سنگ‌شکن: ${subBlock.code}`,
        category: 'PROCESSING',
        actionType: 'CRUSHER_FEED_RECORD',
        severity: 'SUCCESS',
      },
    };

    const cfg = actionTitles[action] || {
      title: `عملیات ساب‌بلوک: ${subBlock.code}`,
      category: 'PROCESSING',
      actionType: 'SUBBLOCK_CREATE',
      severity: 'INFO',
    };

    return this.log({
      category: cfg.category,
      actionType: cfg.actionType,
      severity: cfg.severity,
      title: cfg.title,
      description: `عملیات ${cfg.title} با وضعیت "${subBlock.status}" و تناژ ${subBlock.tonnage || subBlock.estimatedTonnage || '-'} تن ثبت گردید.`,
      user,
      targetEntity: {
        type: 'SUB_BLOCK',
        id: subBlock.id,
        code: subBlock.code,
      },
      details: {
        newValue: details || subBlock,
      },
    });
  }

  static logManualNote(note: string, user?: Partial<User> | null, severity: ActivitySeverity = 'INFO') {
    return this.log({
      category: 'SYSTEM',
      actionType: 'MANUAL_NOTE',
      severity,
      title: 'ثبت یادداشت بازرسی / شیفت کاری',
      description: note,
      user,
      details: {
        metadata: {
          manualEntry: true,
          recordedAt: new Date().toISOString(),
        },
      },
    });
  }

  // ============================================
  // ۴. فیلترها و آمارگیری
  // ============================================

  static getFilteredLogs(filters: ActivityFilterOptions): ActivityLog[] {
    let logs = this.getAll();

    if (filters.category && filters.category !== 'ALL') {
      logs = logs.filter((l) => l.category === filters.category);
    }

    if (filters.actionType && filters.actionType !== 'ALL') {
      logs = logs.filter((l) => l.actionType === filters.actionType);
    }

    if (filters.severity && filters.severity !== 'ALL') {
      logs = logs.filter((l) => l.severity === filters.severity);
    }

    if (filters.userId) {
      logs = logs.filter((l) => l.userId === filters.userId || l.userCode === filters.userId);
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      logs = logs.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q) ||
          l.userCode.toLowerCase().includes(q) ||
          (l.targetEntity?.code && l.targetEntity.code.toLowerCase().includes(q)) ||
          (l.targetEntity?.name && l.targetEntity.name.toLowerCase().includes(q)) ||
          (l.ipAddress && l.ipAddress.includes(q))
      );
    }

    if (filters.dateRange && filters.dateRange !== 'ALL') {
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      let threshold = 0;
      if (filters.dateRange === 'TODAY') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        threshold = startOfDay.getTime();
      } else if (filters.dateRange === '3DAYS') {
        threshold = now - 3 * oneDay;
      } else if (filters.dateRange === '7DAYS') {
        threshold = now - 7 * oneDay;
      } else if (filters.dateRange === '30DAYS') {
        threshold = now - 30 * oneDay;
      }

      if (threshold > 0) {
        logs = logs.filter((l) => new Date(l.timestamp).getTime() >= threshold);
      }
    }

    return logs;
  }

  static getStats(): ActivitySummaryStats {
    const all = this.getAll();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const todayLogs = all.filter((l) => new Date(l.timestamp).getTime() >= startOfToday);
    const authLogs = all.filter((l) => l.category === 'AUTH');
    const blockLogs = all.filter((l) => l.category === 'BLOCKS');
    const navLogs = all.filter((l) => l.category === 'NAVIGATION');
    const processingLogs = all.filter((l) => l.category === 'PROCESSING');

    const uniqueUsers = new Set(all.map((l) => l.userId || l.userCode));

    return {
      totalCount: all.length,
      todayCount: todayLogs.length,
      authCount: authLogs.length,
      blockCount: blockLogs.length,
      navigationCount: navLogs.length,
      processingCount: processingLogs.length,
      activeUsersCount: uniqueUsers.size,
      securityScore: 99.4,
    };
  }

  // ============================================
  // ۵. خروجی و صدور گزارشات
  // ============================================

  static exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getAll();
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = [
      'شناسه',
      'تاریخ و زمان',
      'دسته‌بندی',
      'نوع رویداد',
      'سطح اهمیت',
      'عنوان',
      'توضیحات',
      'کد کاربر',
      'نام کاربر',
      'نقش کاربر',
      'موجودیت هدف',
      'آدرس IP'
    ];

    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.category}"`,
      `"${l.actionType}"`,
      `"${l.severity}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.userCode}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.targetEntity?.code || l.targetEntity?.name || '-'}"`,
      `"${l.ipAddress || '-'}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  static clearLogs(): void {
    ActivityRepo.clear();
    this.notifyListeners();
  }

  // ============================================
  // ۶. ایجاد لاگ‌های نمونه اولیه برای ردپای ممیزی
  // ============================================

  static seedSampleLogsIfEmpty(): void {
    if (ActivityRepo.count() > 0) return;

    const now = new Date();
    const d = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString();

    const sampleAuditTrail: ActivityLog[] = [
      {
        id: crypto.randomUUID(),
        timestamp: d(0.3),
        category: 'AUTH',
        actionType: 'USER_LOGIN',
        severity: 'SUCCESS',
        title: 'ورود موفق به سامانه',
        description: 'کاربر مدیر سیستم با کد AES-1001 وارد داشبورد عملیاتی شد.',
        userId: '1',
        userCode: 'AES-1001',
        userName: 'مدیر سیستم',
        userRole: 'Manager',
        targetEntity: { type: 'USER', code: 'AES-1001', name: 'مدیر سیستم' },
        details: { route: '/dashboard' },
        ipAddress: '192.168.1.104',
      },
      {
        id: crypto.randomUUID(),
        timestamp: d(1.2),
        category: 'NAVIGATION',
        actionType: 'MINE_NAVIGATION',
        severity: 'INFO',
        title: 'پیمایش: نقشه سه‌بعدی معدن و مدل بلوکی',
        description: 'مشاهده ترازهای استخراجی و شبکه‌های چال در صفحه نقشه معدن (/mine/map)',
        userId: '1',
        userCode: 'AES-1001',
        userName: 'مدیر سیستم',
        userRole: 'Manager',
        targetEntity: { type: 'MINE', name: 'معدن سنگ آهن مرکزی' },
        details: { route: '/mine/map', metadata: { bench: 1040, viewMode: '3D' } },
        ipAddress: '192.168.1.104',
      },
      {
        id: crypto.randomUUID(),
        timestamp: d(2.5),
        category: 'PROCESSING',
        actionType: 'CRUSHER_FEED_RECORD',
        severity: 'SUCCESS',
        title: 'ثبت مصرف در خط سنگ‌شکن: 1040 B 60 - SB-01',
        description: 'تغذیه ۴۲۰۰ تن کانسنگ پرعیار مستقیم به خط ۱ خردایش و استحصال ۲۳۸۰ تن کلوخه و ۱۵۲۰ تن نرمه با راندمان ۹۴.۲٪',
        userId: '2',
        userCode: 'AES-1002',
        userName: 'مهندس رضایی',
        userRole: 'MiningEngineer',
        targetEntity: { type: 'CRUSHER', code: 'CRUSHER_LINE_1', name: 'خط ۱ خردایش فکی' },
        details: {
          newValue: {
            feedTonnage: 4200,
            inputFe: 61.2,
            lumpTonnage: 2380,
            finesTonnage: 1520,
            recovery: 94.2,
          },
        },
        ipAddress: '192.168.1.120',
      },
      {
        id: crypto.randomUUID(),
        timestamp: d(4.8),
        category: 'BLOCKS',
        actionType: 'BLOCK_UPDATE',
        severity: 'INFO',
        title: 'ویرایش بلوک: 1040 B 60',
        description: 'بروزرسانی متراژ حفاری و تعداد چال‌های انفجاری بلوک در تراز ۱۰۴۰ به تعداد ۳۸ چال.',
        userId: '2',
        userCode: 'AES-1002',
        userName: 'مهندس رضایی',
        userRole: 'MiningEngineer',
        targetEntity: { type: 'BLOCK', code: '1040 B 60', name: 'بلوک استخراجی ۱۰۴۰-B60' },
        details: {
          changedFields: ['totalHoles', 'targetLevel', 'tonnage'],
          oldValue: { totalHoles: 35, targetLevel: 1040 },
          newValue: { totalHoles: 38, targetLevel: 1040 },
        },
        ipAddress: '192.168.1.120',
      },
      {
        id: crypto.randomUUID(),
        timestamp: d(7.1),
        category: 'PROCESSING',
        actionType: 'LAB_ASSAY_SUBMIT',
        severity: 'SUCCESS',
        title: 'ثبت و صحه‌گذاری آنالیز آزمایشگاه: 1040 B 60 - SB-02',
        description: 'تأیید نتایج آنالیز XRF با عیار آهن Fe = 52.8% و اکسید آهن FeO = 16.5% توسط مسئول آزمایشگاه.',
        userId: '3',
        userCode: 'AES-1005',
        userName: 'دکتر علوی',
        userRole: 'Geologist',
        targetEntity: { type: 'SUB_BLOCK', code: '1040 B 60 - SB-02' },
        details: {
          newValue: { fe: 52.8, feo: 16.5, sio2: 8.2, al2o3: 2.1, s: 0.14, p: 0.082 },
        },
        ipAddress: '192.168.1.135',
      },
      {
        id: crypto.randomUUID(),
        timestamp: d(12.0),
        category: 'NAVIGATION',
        actionType: 'MINE_NAVIGATION',
        severity: 'INFO',
        title: 'پیمایش: پیت اصلی و زون‌بندی',
        description: 'بررسی وضعیت دیواره‌ها و رمپ‌های دسترسی در صفحه پیت‌ها (/mine/1/pits)',
        userId: '2',
        userCode: 'AES-1002',
        userName: 'مهندس رضایی',
        userRole: 'MiningEngineer',
        targetEntity: { type: 'PIT', name: 'پیت مرکزی شماره ۱' },
        details: { route: '/mine/1/pits' },
        ipAddress: '192.168.1.120',
      },
      {
        id: crypto.randomUUID(),
        timestamp: d(24.5),
        category: 'BLOCKS',
        actionType: 'BLOCK_APPROVE',
        severity: 'SUCCESS',
        title: 'تأیید و صدور مجوز حفاری بلوک: 1040 B 60',
        description: 'بررسی طرح آتشباری و صدور مجوز رسمی حفاری با کد PERMIT-1040-001 توسط ناظر ارشد.',
        userId: '1',
        userCode: 'AES-1001',
        userName: 'مدیر سیستم',
        userRole: 'Manager',
        targetEntity: { type: 'BLOCK', code: '1040 B 60' },
        details: {
          newValue: {
            status: 'APPROVED',
            permitNumber: 'PERMIT-1040-001',
            issuedAt: d(24.5),
          },
        },
        ipAddress: '192.168.1.104',
      },
      {
        id: crypto.randomUUID(),
        timestamp: d(36.0),
        category: 'BLOCKS',
        actionType: 'BLOCK_CREATE',
        severity: 'SUCCESS',
        title: 'ایجاد بلوک جدید: 1040 B 60',
        description: 'تعریف اولیه بلوک توسط دفتر فنی پیمانکار در پیت مرکزی با برآورد اولیه ۱۵,۰۰۰ تن کانسنگ.',
        userId: '2',
        userCode: 'AES-1002',
        userName: 'مهندس رضایی',
        userRole: 'MiningEngineer',
        targetEntity: { type: 'BLOCK', code: '1040 B 60' },
        details: {
          newValue: { code: '1040 B 60', targetLevel: 1040, blockNumber: 60, status: 'DEFINED' },
        },
        ipAddress: '192.168.1.120',
      },
      {
        id: crypto.randomUUID(),
        timestamp: d(48.0),
        category: 'SYSTEM',
        actionType: 'MANUAL_NOTE',
        severity: 'INFO',
        title: 'ثبت یادداشت بازرسی / شیفت کاری',
        description: 'بازرسی ایمنی روزانه انجام شد. پایداری پله‌های تراز ۱۰۴۰ مطلوب و بدون ریزش گزارش گردید.',
        userId: '1',
        userCode: 'AES-1001',
        userName: 'مدیر سیستم',
        userRole: 'Manager',
        details: { metadata: { shift: 'Morning Shift', inspector: 'واحد HSE' } },
        ipAddress: '192.168.1.104',
      }
    ];

    ActivityRepo.saveBatch(sampleAuditTrail);
  }
}
