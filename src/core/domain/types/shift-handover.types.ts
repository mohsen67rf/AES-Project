// src/core/domain/types/shift-handover.types.ts

export type ShiftType = 'SHIFT_1_DAY' | 'SHIFT_2_NIGHT';

export type ShiftHandoverStatus = 
  | 'PLANNING_MEETING'    // جلسه هماهنگی حضوری ارکان پروژه در ابتدای شیفت
  | 'IN_PROGRESS'         // شیفت مصوب و در حال اجرا
  | 'READY_FOR_HANDOVER'  // پایان شیفت، رصد آیتم‌ها انجام شده و منتظر تکمیل امضاهای سه‌گانه
  | 'HANDED_OVER'         // امضای هر ۳ رکن ثبت و به شیفت بعد تحویل داده شد
  | 'DISPUTED';           // دارای عدم انطباق یا اختلاف نظر بین ارکان

// ۱. مشخصات نماینده ارکان سه‌گانه در جلسه حضوری معدن
export interface TripartiteRepresentative {
  role: 'CLIENT' | 'SUPERVISION' | 'CONTRACTOR';
  roleTitleFa: string;     // 'نماینده کارفرما' | 'دستگاه نظارت (مهندسین مشاور)' | 'سرپرست پیمانکار استخراج'
  organizationName: string;// نام شرکت/سازمان
  personName: string;      // نام نماینده
  personnelCode?: string;
  presentInMeeting: boolean;
  notes?: string;
}

// ۲. اولویت‌بندی حفاری بلوک‌ها
export interface DrillingPriorityItem {
  id: string;
  priorityOrder: number;   // اولویت ۱، ۲، ۳...
  blockCode: string;       // مثلا 1040-B-12
  benchLevel: number;      // تراز پله ۱۰۴۰
  rockTypeFa: string;      // نوع سنگ / سازند زمین‌شناسی
  patternGrid: string;     // شبکه حفاری مثلا ۳.۵ × ۴ متر
  targetHoleCount: number; // تعداد چال هدف
  targetDrillMeters: number;// متراژ حفاری هدف
  assignedDrillRig: string;// نام دستگاه دریل اختصاصی
  specialInstructions?: string;// دستورات فنی خاص ناظر
  
  // رصد پایان شیفت (Post-shift review)
  achievedDrillMeters?: number;
  achievedHoleCount?: number;
  fulfillmentPercent?: number;
  deviationReason?: string;
  verifiedByTripartite?: boolean;
}

// ۳. اولویت‌بندی بارگیری و استخراج بلوک‌ها
export interface LoadingPriorityItem {
  id: string;
  priorityOrder: number;   // اولویت ۱، ۲، ۳...
  blockCode: string;       // مثلا 1025-O-04
  benchLevel: number;      // تراز ۱۰۲۵
  materialType: 'HIGH_GRADE_ORE' | 'LOW_GRADE_ORE' | 'WASTE';
  materialTypeFa: string;  // سنگ‌آهن پرعیار، کم‌عیار، باطله
  targetTonnage: number;   // تناژ هدف
  assignedLoadingUnit: string; // شاول یا لودر
  allocatedTruckCount: number; // تعداد دامپتراک تخصیص‌یافته
  destination: string;     // سنگ‌شکن اولیه، دپوی میانی، باطله‌دان غربی
  specialInstructions?: string;

  // رصد پایان شیفت (Post-shift review)
  achievedTonnage?: number;
  achievedTripsCount?: number;
  fulfillmentPercent?: number;
  deviationReason?: string;
  verifiedByTripartite?: boolean;
}

// ۴. ثبت ماشین‌آلات فعال در نقشه (حفاری، بارگیری، پیکور، بلدوزر و...)
export interface ActiveEquipmentPlacement {
  id: string;
  code: string;            // SHV-01, TRK-108, DRL-01, PCK-01, BLD-03
  category: 'SHOVEL' | 'LOADER' | 'TRUCK' | 'DRILL' | 'HYDRAULIC_BREAKER' | 'DOZER' | 'GRADER' | 'WATER_TANKER';
  categoryFa: string;      // شاول، لودر، دامپتراک، دریل، پیکور هیدرولیکی، بلدوزر، گریدر، تانکر
  nameFa: string;
  currentBench: string;    // موقعیت پله روی نقشه (مثلاً پله ۱۰۴۰ شرقی)
  assignedZoneBlock: string;
  shiftMission: string;    // ماموریت شیفت
  operatorName: string;
  status: 'ACTIVE' | 'STANDBY' | 'RELOCATING';
  statusFa: string;

  // رصد پایان شیفت
  operatingHoursAchieved?: number;
  endShiftCondition?: string;
  notes?: string;
}

// ۵. توافق بر سر بلوک‌های در نوبت انفجار آتی
export interface UpcomingBlastAgreement {
  id: string;
  blockCode: string;       // مثلا 1055-B-18
  benchLevel: number;
  drillPatternStatus: 'DRILLING_COMPLETED' | 'CHARGING_IN_PROGRESS' | 'READY_FOR_BLAST' | 'AWAITING_CLEARANCE';
  drillPatternStatusFa: string;
  plannedBlastTime: string;// ساعت پیش‌بینی‌شده انفجار
  explosiveType: string;   // آنفو، امولشن، پنتولیت
  estimatedOreTonnage: number;
  safetyRadiusMeters: number; // حریم ایمنی تخلیه
  supervisionClearance: boolean;// موافقت ناظر
  clientClearance: boolean;// موافقت کارفرما
  contractorReady: boolean;// آمادگی پیمانکار آتشباری
  statusNote: string;

  // رصد پایان شیفت
  blastConducted?: boolean;
  actualConductedTime?: string;
  postBlastAssessment?: string;
}

// ۶. برنامه زمانی ادامه روز/شیفت
export interface IntraShiftScheduleItem {
  id: string;
  timeSlot: string;        // مثلا ۰۷:۰۰ الی ۰۹:۳۰
  actionTitle: string;     // شرح عملیات برنامه‌ریزی‌شده
  targetLocation: string;  // محل اجرای عملیات
  responsibleParty: string;// متولی اجرا
  status: 'PLANNED' | 'EXECUTED' | 'DELAYED' | 'CANCELLED';
  notes?: string;
}

// ۷. الزامات اجرایی و ایمنی در طول شیفت
export interface OperationalMandateItem {
  id: string;
  category: 'SAFETY_HSE' | 'GEOTECHNICAL' | 'GRADE_CONTROL' | 'SUPERVISION_DIRECTIVE';
  categoryFa: string;
  directiveText: string;   // شرح الزام
  issuedByRole: 'SUPERVISION' | 'CLIENT' | 'SAFETY_OFFICER';
  issuedByName: string;
  priority: 'MANDATORY' | 'HIGH' | 'CRITICAL';

  // رصد پایان شیفت
  complianceStatus: 'COMPLIED' | 'PARTIAL' | 'NOT_COMPLIED';
  complianceNotes?: string;
}

// ۸. ساختار امضای دیجیتال منفرد
export interface ShiftSupervisorSignature {
  userId: string;
  fullName: string;
  userCode: string;
  roleId: string;
  departmentFa: string;
  signedAt: string;
  digitalFingerprint: string;
  signatureNotes?: string;
}

// ۹. امضاهای سه‌گانه ارکان پروژه و ابلاغ به مدیران
export interface TripartiteSignatureBlock {
  clientSignature: {
    signed: boolean;
    name: string;
    organization: string;
    signedAt?: string;
    digitalFingerprint: string;
    comment?: string;
  };
  supervisionSignature: {
    signed: boolean;
    name: string;
    organization: string;
    signedAt?: string;
    digitalFingerprint: string;
    comment?: string;
  };
  contractorSignature: {
    signed: boolean;
    name: string;
    organization: string;
    signedAt?: string;
    digitalFingerprint: string;
    comment?: string;
  };
  incomingSupervisorAck?: {
    acknowledged: boolean;
    name: string;
    shiftCode: string;
    acknowledgedAt?: string;
    notes?: string;
  };
  notifiedManagers: {
    id: string;
    name: string;
    roleTitle: string;
    notifiedAt: string;
    viewed: boolean;
    viewedAt?: string;
    feedbackNote?: string;
  }[];
}

// تایپ‌های پشتیبان برای سازگاری با کدهای موجود
export interface ActiveBenchStatus {
  id: string;
  benchLevel: number;
  blockCode: string;
  faceCondition: 'ACTIVE_LOADING' | 'BLAST_READY' | 'DRILLING' | 'STOPPED_HAZARD' | 'AWAITING_SURVEY';
  faceConditionFa: string;
  materialType: 'HIGH_GRADE_ORE' | 'LOW_GRADE_ORE' | 'WASTE';
  materialTypeFa: string;
  assignedExcavator: string;
  haulTruckCount: number;
  targetTonnage: number;
  achievedTonnage: number;
  destination: string;
  notes: string;
}

export interface EquipmentHandoverStatus {
  id: string;
  code: string;
  nameFa: string;
  category: 'SHOVEL' | 'TRUCK' | 'DRILL' | 'DOZER' | 'GRADER' | 'WATER_TANKER';
  status: 'OPERATIONAL' | 'BREAKDOWN' | 'MAINTENANCE_DUE' | 'STANDBY';
  statusFa: string;
  operatingHours: number;
  fuelLevelPercent: number;
  locationBench: string;
  issuesReported?: string;
}

export interface SafetyEnvironmentalLog {
  hazardLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  weatherCondition: string;
  roadCondition: string;
  wallStabilityStatus: string;
  nearMissCount: number;
  incidentsReported: string;
  nextShiftBlastNotice?: {
    scheduledTime: string;
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

// ۱۰. رکورد کلان تحویل و تحول هوشمند شیفت با پروتکل سه‌گانه
export interface ShiftHandoverRecord {
  id: string;
  handoverCode: string;          // مثلا HND-1405-03-D1
  mineId: string;
  mineNameFa: string;
  departmentKey: string;
  departmentNameFa: string;
  shiftType: ShiftType;
  shiftTitleFa: string;          // شیفت ۱ (روز) - ۰۷:۰۰ الی ۱۹:۰۰
  shiftDateJalali: string;       // ۱۴۰۵/۰۳/۱۸
  shiftDateGregorian: string;
  status: ShiftHandoverStatus;

  // اطلاعات جلسه حضوری اول شیفت در معدن
  meetingLocation: string;       // اتاق عملیات و دیسپچینگ پیت شماره ۳
  meetingTime: string;           // ساعت ۰۶:۴۵ صبح
  meetingNotes: string;          // خلاصه مباحث جلسه هماهنگی حضوری
  tripartiteReps: TripartiteRepresentative[];

  // دستورکارهای اصلی مصوب جلسه هماهنگی:
  drillingPriorities: DrillingPriorityItem[];
  loadingPriorities: LoadingPriorityItem[];
  activePlacements: ActiveEquipmentPlacement[];
  upcomingBlasts: UpcomingBlastAgreement[];
  intraShiftSchedule: IntraShiftScheduleItem[];
  operationalMandates: OperationalMandateItem[];

  // شاخص‌ها و آمار تجمعی تولیدی
  totalExtractionTons: number;
  totalWasteTons: number;
  totalHaulTrips: number;
  averageFeGradePercent: number;

  // رصد و ارزیابی کمی و کیفی پایان شیفت (Post-shift Realization Review)
  overallFulfillmentPercent: number; // درصد کل تحقق اهداف شیفت (مثلا ۸۹.۵٪)
  drillingFulfillmentPercent: number;
  loadingFulfillmentPercent: number;
  blastingFulfillmentPercent: number;
  mandatesCompliancePercent: number;
  endShiftReviewSummary: string;     // ارزیابی مشترک ارکان در پایان شیفت

  // امضاهای دیجیتال سه‌گانه و ابلاغ به سرپرستان و مدیران
  tripartiteSignatures: TripartiteSignatureBlock;

  // سازگاری با ماژول‌های قدیمی
  goldenShiftDirective: string;
  activeBenches: ActiveBenchStatus[];
  equipmentStatuses: EquipmentHandoverStatus[];
  safetyLog: SafetyEnvironmentalLog;
  pendingTasks: HandoverPendingTask[];
  outgoingSupervisor: ShiftSupervisorSignature;
  incomingSupervisor?: ShiftSupervisorSignature;

  createdAt: string;
  updatedAt: string;
}
