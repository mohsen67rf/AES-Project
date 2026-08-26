// src/core/domain/types/activity.types.ts

export type ActivityCategory = 
  | 'AUTH'          // ورود، خروج، مدیریت دسترسی کاربران
  | 'BLOCKS'        // ایجاد، ویرایش، حذف، تایید بلوک و ساب‌بلوک
  | 'NAVIGATION'    // پیمایش نقشه‌ها، پیت‌ها، زون‌ها و صفحات معدن
  | 'PROCESSING'    // خطوط سنگ‌شکن، خوراک‌دهی، آزمایشگاه
  | 'SYSTEM';       // تنظیمات، صدور گزارش، عملیات سیستمی

export type ActivityActionType = 
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'MINE_NAVIGATION'
  | 'PAGE_VIEW'
  | 'BLOCK_CREATE'
  | 'BLOCK_UPDATE'
  | 'BLOCK_STATUS_CHANGE'
  | 'BLOCK_DELETE'
  | 'BLOCK_APPROVE'
  | 'BLOCK_REJECT'
  | 'SUBBLOCK_CREATE'
  | 'SAMPLING_RECORD'
  | 'LAB_ASSAY_SUBMIT'
  | 'CLASSIFICATION_APPLY'
  | 'DESTINATION_ASSIGN'
  | 'CRUSHER_FEED_RECORD'
  | 'MANUAL_NOTE'
  | 'SYSTEM_BACKUP'
  | 'DATA_EXPORT';

export type ActivitySeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';

export interface ActivityLog {
  id: string;
  timestamp: string;
  category: ActivityCategory;
  actionType: ActivityActionType;
  severity: ActivitySeverity;
  title: string;
  description: string;
  userId: string;
  userCode: string;
  userName: string;
  userRole: string;
  targetEntity?: {
    type: 'BLOCK' | 'SUB_BLOCK' | 'MINE' | 'PIT' | 'CRUSHER' | 'USER' | 'PAGE';
    id?: string;
    code?: string;
    name?: string;
  };
  details?: {
    route?: string;
    oldValue?: any;
    newValue?: any;
    changedFields?: string[];
    metadata?: Record<string, any>;
  };
  ipAddress?: string;
}

export interface ActivityFilterOptions {
  category?: ActivityCategory | 'ALL';
  actionType?: ActivityActionType | 'ALL';
  severity?: ActivitySeverity | 'ALL';
  userId?: string;
  searchQuery?: string;
  dateRange?: 'TODAY' | '3DAYS' | '7DAYS' | '30DAYS' | 'ALL';
  startDate?: string;
  endDate?: string;
}

export interface ActivitySummaryStats {
  totalCount: number;
  todayCount: number;
  authCount: number;
  blockCount: number;
  navigationCount: number;
  processingCount: number;
  activeUsersCount: number;
  securityScore: number;
}
