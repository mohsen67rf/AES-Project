import { BlockStatus, SubBlockStatus, DestinationType } from '../types/mine.types';

// ============================================
// وضعیت‌های بلوک
// ============================================

export const BLOCK_STATUS = {
  DEFINED: 'DEFINED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DRILLING: 'DRILLING',
  DRILLED: 'DRILLED',
  REQUESTED_SAMPLING: 'REQUESTED_SAMPLING',
  SAMPLING: 'SAMPLING',
  SAMPLING_COMPLETED: 'SAMPLING_COMPLETED',
  COMPLETED: 'COMPLETED',
} as const;

export const BLOCK_STATUS_LABELS: Record<BlockStatus, string> = {
  [BLOCK_STATUS.DEFINED]: 'تعریف شده',
  [BLOCK_STATUS.PENDING_APPROVAL]: 'در انتظار تأیید',
  [BLOCK_STATUS.APPROVED]: 'تأیید شده',
  [BLOCK_STATUS.REJECTED]: 'رد شده',
  [BLOCK_STATUS.DRILLING]: 'در حال حفاری',
  [BLOCK_STATUS.DRILLED]: 'حفاری شده',
  [BLOCK_STATUS.REQUESTED_SAMPLING]: 'درخواست نمونه',
  [BLOCK_STATUS.SAMPLING]: 'نمونه‌برداری',
  [BLOCK_STATUS.SAMPLING_COMPLETED]: 'نمونه‌برداری کامل',
  [BLOCK_STATUS.COMPLETED]: 'تکمیل شده',
};

// ============================================
// وضعیت‌های SubBlock
// ============================================

export const SUB_BLOCK_STATUS = {
  CREATED: 'CREATED',
  SAMPLED: 'SAMPLED',
  WAITING_LAB: 'WAITING_LAB',
  LAB_COMPLETED: 'LAB_COMPLETED',
  CLASSIFIED: 'CLASSIFIED',
  DESTINATION_ASSIGNED: 'DESTINATION_ASSIGNED',
  LOADING: 'LOADING',
  COMPLETED: 'COMPLETED',
  SURVEYED: 'SURVEYED',
} as const;

export const SUB_BLOCK_STATUS_LABELS: Record<SubBlockStatus, string> = {
  [SUB_BLOCK_STATUS.CREATED]: 'ایجاد شده',
  [SUB_BLOCK_STATUS.SAMPLED]: 'نمونه‌برداری شده',
  [SUB_BLOCK_STATUS.WAITING_LAB]: 'در انتظار آزمایشگاه',
  [SUB_BLOCK_STATUS.LAB_COMPLETED]: 'نتیجه آزمایشگاه',
  [SUB_BLOCK_STATUS.CLASSIFIED]: 'طبقه‌بندی شده',
  [SUB_BLOCK_STATUS.DESTINATION_ASSIGNED]: 'مقصد تعیین شده',
  [SUB_BLOCK_STATUS.LOADING]: 'در حال بارگیری',
  [SUB_BLOCK_STATUS.COMPLETED]: 'تکمیل شده',
  [SUB_BLOCK_STATUS.SURVEYED]: 'برداشت شده',
};

// ============================================
// وضعیت‌های چال حفاری
// ============================================

export const DRILLING_POINT_STATUS = {
  PLANNED: 'PLANNED',
  DRILLING: 'DRILLING',
  COMPLETED: 'COMPLETED',
  COLLAPSED: 'COLLAPSED',
  DEVIATED: 'DEVIATED',
} as const;

export const DRILLING_POINT_STATUS_LABELS: Record<string, string> = {
  [DRILLING_POINT_STATUS.PLANNED]: 'برنامه‌ریزی',
  [DRILLING_POINT_STATUS.DRILLING]: 'در حال حفاری',
  [DRILLING_POINT_STATUS.COMPLETED]: 'تکمیل',
  [DRILLING_POINT_STATUS.COLLAPSED]: 'ریزش',
  [DRILLING_POINT_STATUS.DEVIATED]: 'انحراف',
};

// ============================================
// مقاصد
// ============================================

export const DESTINATION_TYPES = {
  WASTE_DUMP_ROCK: 'WASTE_DUMP_ROCK',
  WASTE_DUMP_ALLUVIAL: 'WASTE_DUMP_ALLUVIAL',
  HIGH_GRADE_STOCKPILE: 'HIGH_GRADE_STOCKPILE',
  MEDIUM_GRADE_STOCKPILE: 'MEDIUM_GRADE_STOCKPILE',
  LOW_GRADE_STOCKPILE: 'LOW_GRADE_STOCKPILE',
  CRUSHER_FEED: 'CRUSHER_FEED',
  TEMPORARY_STOCKPILE: 'TEMPORARY_STOCKPILE',
  BLEND_STOCKPILE: 'BLEND_STOCKPILE',
} as const;

export const DESTINATION_LABELS: Record<DestinationType, string> = {
  [DESTINATION_TYPES.WASTE_DUMP_ROCK]: 'دامپ باطله سنگی',
  [DESTINATION_TYPES.WASTE_DUMP_ALLUVIAL]: 'دامپ آبرفت',
  [DESTINATION_TYPES.HIGH_GRADE_STOCKPILE]: 'دپوی پرعیار',
  [DESTINATION_TYPES.MEDIUM_GRADE_STOCKPILE]: 'دپوی عیار متوسط',
  [DESTINATION_TYPES.LOW_GRADE_STOCKPILE]: 'دپوی کم‌عیار',
  [DESTINATION_TYPES.CRUSHER_FEED]: 'خوراک کارخانه',
  [DESTINATION_TYPES.TEMPORARY_STOCKPILE]: 'دپوی موقت',
  [DESTINATION_TYPES.BLEND_STOCKPILE]: 'دپوی اختلاط',
};

// ============================================
// کلاس‌های عیار
// ============================================

export const GRADE_CLASSES = {
  HIGH: 'HIGH_GRADE',
  MEDIUM: 'MEDIUM_GRADE',
  LOW: 'LOW_GRADE',
} as const;

export const GRADE_THRESHOLDS = {
  HIGH: 25,
  MEDIUM: 15,
} as const;

export function getGradeClass(assay: number): string {
  if (assay >= GRADE_THRESHOLDS.HIGH) return GRADE_CLASSES.HIGH;
  if (assay >= GRADE_THRESHOLDS.MEDIUM) return GRADE_CLASSES.MEDIUM;
  return GRADE_CLASSES.LOW;
}

// ============================================
// شیفت‌ها
// ============================================

export const SHIFTS = {
  MORNING: 'MORNING',
  EVENING: 'EVENING',
  NIGHT: 'NIGHT',
} as const;

export const SHIFT_LABELS: Record<string, string> = {
  [SHIFTS.MORNING]: 'صبح',
  [SHIFTS.EVENING]: 'عصر',
  [SHIFTS.NIGHT]: 'شب',
};

// ============================================
// توابع کمکی
// ============================================

export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    'CREATED': 'bg-[#AACCDD]/10 text-[#AACCDD] border-[#AACCDD]/20',
    'SAMPLED': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'LAB_COMPLETED': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'CLASSIFIED': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'DESTINATION_ASSIGNED': 'bg-green-500/10 text-green-400 border-green-500/20',
    'COMPLETED': 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return colors[status] || colors['CREATED'];
}