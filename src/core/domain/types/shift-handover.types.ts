// src/core/domain/types/shift-handover.types.ts

export type ShiftType = 'SHIFT_1_DAY' | 'SHIFT_2_NIGHT';

export type ShiftHandoverStatus = 
  | 'IN_PROGRESS'        // شیفت در حال کار
  | 'READY_FOR_HANDOVER' // سرپرست خروجی تکمیل و امضا کرده، منتظر شیفت ورودی
  | 'HANDED_OVER'        // تایید دوطرفه انجام و ثبت نهایی شد
  | 'DISPUTED';          // دارای عدم انطباق یا نیاز به بازبینی

export interface ActiveBenchStatus {
  id: string;
  benchLevel: number;        // مثلا ۱۰۴۰
  blockCode: string;         // مثلا 1040 B 33
  faceCondition: 'ACTIVE_LOADING' | 'BLAST_READY' | 'DRILLING' | 'STOPPED_HAZARD' | 'AWAITING_SURVEY';
  faceConditionFa: string;
  materialType: 'HIGH_GRADE_ORE' | 'LOW_GRADE_ORE' | 'WASTE';
  materialTypeFa: string;
  assignedExcavator: string; // مثلا شاول PC-1250 شماره ۱
  haulTruckCount: number;    // تعداد تراک اختصاص‌یافته
  targetTonnage: number;     // تناژ هدف شیفت
  achievedTonnage: number;   // تناژ محقق‌شده شیفت
  destination: string;       // مثلا سنگ‌شکن اولیه یا دپوی باطله غربی
  notes: string;
}

export interface EquipmentHandoverStatus {
  id: string;
  code: string;              // مثلا SHV-01 یا TRK-108
  nameFa: string;
  category: 'SHOVEL' | 'TRUCK' | 'DRILL' | 'DOZER' | 'GRADER' | 'WATER_TANKER';
  status: 'OPERATIONAL' | 'BREAKDOWN' | 'MAINTENANCE_DUE' | 'STANDBY';
  statusFa: string;
  operatingHours: number;    // ساعت کارکرد در این شیفت
  fuelLevelPercent: number;  // سطح سوخت
  locationBench: string;     // موقعیت در پله
  issuesReported?: string;   // خرابی یا نیاز به سرویس در شیفت بعد
}

export interface SafetyEnvironmentalLog {
  hazardLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  weatherCondition: string;  // مثلا آفتابی و گردوغبار ملایم / باد شدید
  roadCondition: string;     // وضعیت جاده‌های باربری (آب‌پاشی شده، لغزنده، بدون دست‌انداز)
  wallStabilityStatus: string;// پایش ترک‌های دیواره پیت
  nearMissCount: number;     // شبه حوادث
  incidentsReported: string; // حوادث یا خطرات اعلامی
  nextShiftBlastNotice?: {
    scheduledTime: string;   // ساعت انفجار برنامه‌ریزی‌شده
    benchLevel: number;
    exclusionRadiusMeters: number;
    safetyOfficerApproved: boolean;
  };
}

export interface HandoverPendingTask {
  id: string;
  taskCode: string;
  title: string;
  targetDepartment: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS';
  deadlineTime: string;
  notesForNextShift: string;
}

export interface ShiftSupervisorSignature {
  userId: string;
  fullName: string;
  userCode: string;
  roleId: string;
  departmentFa: string;
  signedAt: string;
  digitalFingerprint: string; // شناسه رمزنگاری لاگ امضا
  signatureNotes?: string;
}

export interface ShiftHandoverRecord {
  id: string;
  handoverCode: string;      // مثلا HND-1405-03-D1
  mineId: string;
  mineNameFa: string;
  departmentKey: string;     // مثلا 'MINING' | 'DISPATCH' | 'SURVEY' | 'ALL_MINE'
  departmentNameFa: string;
  shiftType: ShiftType;
  shiftTitleFa: string;      // مثلا شیفت ۱ (روز) - ۰۷:۰۰ الی ۱۹:۰۰
  shiftDateJalali: string;   // مثلا ۱۴۰۵/۰۳/۱۸
  shiftDateGregorian: string;// ISO string
  status: ShiftHandoverStatus;

  // ۱. شاخص‌های تولیدی کلان شیفت
  totalExtractionTons: number;
  totalWasteTons: number;
  totalHaulTrips: number;
  averageFeGradePercent: number;

  // ۲. وضعیت سینه‌کارها و پله‌ها
  activeBenches: ActiveBenchStatus[];

  // ۳. وضعیت ماشین‌آلات و ناوگان
  equipmentStatuses: EquipmentHandoverStatus[];

  // ۴. پایش ایمنی، بهداشت و محیط زیست (HSE)
  safetyLog: SafetyEnvironmentalLog;

  // ۵. تعهدات و تسک‌های در جریان تحویل به شیفت بعد
  pendingTasks: HandoverPendingTask[];

  // ۶. دستورات ویژه شیفت و پیام طلایی (Golden Directive)
  goldenShiftDirective: string;

  // ۷. امضای دیجیتال سرپرست خروجی (Outgoing)
  outgoingSupervisor: ShiftSupervisorSignature;

  // ۸. امضای دیجیتال سرپرست ورودی (Incoming) - وقتی تحویل گرفته شد
  incomingSupervisor?: ShiftSupervisorSignature;

  createdAt: string;
  updatedAt: string;
}
