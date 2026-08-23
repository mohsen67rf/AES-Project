// src/core/domain/types/mine.types.ts

// ============================================
// نوع‌های پایه
// ============================================

export type BlockStatus = 
  | 'DEFINED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'DRILLING'
  | 'DRILLED'
  | 'REQUESTED_SAMPLING'
  | 'SAMPLING'
  | 'SAMPLING_COMPLETED'
  | 'COMPLETED';

// ============================================
// ✅ چرخه‌ی کامل زندگی ساب‌بلوک
// ============================================

export type SubBlockStatus = 
  // === فاز ۱: تعریف ===
  | 'DEFINED'                 // تعریف شده (تازه ایجاد شده)
  | 'SUB_BLOCKED'            // ساب‌بندی انجام شده
  
  // === فاز ۲: نمونه‌برداری ===
  | 'SAMPLING_REQUESTED'     // درخواست نمونه‌برداری
  | 'SAMPLING_SCHEDULED'     // برنامه‌ریزی نمونه‌برداری
  | 'SAMPLING_IN_PROGRESS'   // در حال نمونه‌برداری
  | 'SAMPLING_COMPLETED'     // نمونه‌برداری کامل شده
  
  // === فاز ۳: آزمایشگاه ===
  | 'LAB_SENT'              // ارسال به آزمایشگاه
  | 'LAB_IN_PROGRESS'       // در حال آنالیز
  | 'LAB_COMPLETED'         // نتایج آماده است
  
  // === فاز ۴: طبقه‌بندی ===
  | 'CLASSIFICATION_PENDING' // در انتظار طبقه‌بندی
  | 'CLASSIFICATION_DONE'    // طبقه‌بندی انجام شده
  
  // === فاز ۵: تصمیم‌گیری ===
  | 'DESTINATION_PENDING'    // در انتظار تصمیم مقصد
  | 'DESTINATION_APPROVED'   // تصمیم مقصد تأیید شده
  
  // === فاز ۶: اجرا ===
  | 'LOADING_IN_PROGRESS'    // در حال بارگیری
  | 'LOADING_COMPLETED'      // بارگیری کامل شده
  | 'TRANSPORTING'           // در حال حمل
  | 'DELIVERED'              // تحویل داده شده
  
  // === فاز ۷: فرآوری ===
  | 'PROCESSING'             // در حال فرآوری
  | 'BENEFICIATION'          // پرعیار‌سازی
  | 'SIZING'                 // دانه‌بندی
  
  // === فاز ۸: محصول نهایی ===
  | 'FINAL_PRODUCT'          // محصول نهایی
  | 'SOLD'                   // فروخته شده
  | 'COMPLETED';             // چرخه کامل شده

// ============================================
// تاریخچه‌ی وضعیت‌ها
// ============================================

export interface SubBlockStatusHistory {
  status: SubBlockStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
  duration?: number; // مدت زمان سپری شده در این وضعیت (بر حسب دقیقه)
}

// ============================================
// مراحل فرآوری
// ============================================

export interface ProcessingStage {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  operator?: string;
  notes?: string;
  parameters?: Record<string, any>;
}

// ============================================
// محصول نهایی
// ============================================

export interface FinalProduct {
  id: string;
  productName: string;
  grade: number;
  quantity: number;
  unit: 'TON' | 'KG' | 'GRAM';
  quality: 'HIGH' | 'MEDIUM' | 'LOW';
  buyer?: string;
  soldDate?: string;
  price?: number;
}

// ============================================
// ✅ ساب‌بلوک کامل با چرخه‌ی زندگی
// ============================================

export interface SubBlock {
  // === اطلاعات پایه ===
  id: string;
  blockId: string;
  code: string;
  sequence: number;
  
  // === اطلاعات هندسی ===
  geometry?: {
    coordinates: number[][][];
    area?: number;
    volume?: number;
  };
  
  // === فاز ۱: تعریف ===
  definedAt?: string;
  definedBy?: string;
  subBlockedAt?: string;
  subBlockedBy?: string;
  
  // === فاز ۲: نمونه‌برداری ===
  sampleId?: string;
  sampleDate?: string;
  sampler?: string;
  sampleDepth?: number;
  sampleWeight?: number;
  sampleNotes?: string;
  samplingRequestedAt?: string;
  samplingCompletedAt?: string;
  
  // === فاز ۳: آزمایشگاه ===
  labResults?: {
    fe: number;        // آهن
    feo: number;       // اکسید آهن
    sio2: number;      // سیلیس
    al2o3: number;     // آلومینا
    p: number;         // فسفر
    s: number;         // گوگرد
    moisture: number;  // رطوبت
    density: number;   // چگالی
    assay: number;     // عیار کل (محاسبه‌شده)
    labName?: string;
    labTechnician?: string;
    labReceivedAt?: string;
    labCompletedAt?: string;
  };
  
  // === فاز ۴: طبقه‌بندی ===
  materialClass?: string;
  rockType?: string;
  oreType?: string;
  gradeCategory?: 'HIGH' | 'MEDIUM' | 'LOW';
  economicClass?: string;
  classificationNotes?: string;
  classifiedAt?: string;
  classifiedBy?: string;
  
  // === فاز ۵: تصمیم‌گیری ===
  destination?: DestinationType;
  destinationReason?: string;
  destinationApprovedBy?: string;
  destinationApprovedAt?: string;
  alternativeDestinations?: DestinationType[];
  
  // === فاز ۶: اجرا ===
  loadingData?: {
    truckCount: number;
    tonnage: number;
    dumpId: string;
    loadingStartAt?: string;
    loadingCompletedAt?: string;
    operator?: string;
  };
  transportData?: {
    truckId: string;
    driver: string;
    departureAt?: string;
    arrivalAt?: string;
    distance?: number;
  };
  deliveredTo?: string;
  deliveredAt?: string;
  
  // === فاز ۷: فرآوری ===
  processingStages?: ProcessingStage[];
  processingStartAt?: string;
  processingEndAt?: string;
  beneficiationData?: {
    method: string;
    recovery: number;
    finalGrade: number;
  };
  sizingData?: {
    meshSize: number;
    particleSize: number;
    distribution: Record<string, number>;
  };
  
  // === فاز ۸: محصول نهایی ===
  finalProduct?: FinalProduct;
  
  // === وضعیت و تاریخچه ===
  status: SubBlockStatus;
  statusHistory: SubBlockStatusHistory[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version?: number;
  
  // === متریک‌های عملکردی ===
  metrics?: {
    totalProcessingTime?: number;  // کل زمان فرآوری (دقیقه)
    totalCycleTime?: number;       // کل زمان چرخه (دقیقه)
    efficiency?: number;           // کارایی
    qualityScore?: number;         // امتیاز کیفیت
  };
}

// ============================================
// مقاصد (تکمیل شده)
// ============================================

export type DestinationType = 
  | 'WASTE_DUMP_ROCK'
  | 'WASTE_DUMP_ALLUVIAL'
  | 'HIGH_GRADE_STOCKPILE'
  | 'MEDIUM_GRADE_STOCKPILE'
  | 'LOW_GRADE_STOCKPILE'
  | 'CRUSHER_FEED'
  | 'TEMPORARY_STOCKPILE'
  | 'BLEND_STOCKPILE'
  | 'BENEFICIATION_PLANT'
  | 'SIZING_PLANT'
  | 'EXPORT';

// ============================================
// سایر موجودیت‌ها (بدون تغییر)
// ============================================

export interface Mine {
  id: string;
  name: string;
  code: string;
  location: string;
  status: 'فعال' | 'غیرفعال' | 'در حال بهره‌برداری' | 'متوقف';
  createdAt: string;
}

export interface Pit {
  id: string;
  mineId: string;
  name: string;
  code: string;
  status: 'فعال' | 'غیرفعال';
  geometry?: any;
  createdAt: string;
}

export interface Block {
  id: string;
  code: string;
  name: string;
  targetLevel: number;
  blockNumber: number;
  drillingParams: {
    totalHoles: number;
    holeDiameter: number;
    avgDesignDepth: number;
    pattern: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
    drillingPoints: number[][];
  };
  status: BlockStatus;
  statusHistory: StatusHistory[];
  actualDrillingData?: {
    holeDepths: number[];
    totalMeters: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DrillingPoint {
  id: string;
  blockId: string;
  number: number;
  designDepth: number;
  location: {
    x: number;
    y: number;
    z?: number;
  };
  dailyProgress: DailyDrillingProgress[];
  finalDepth?: number;
  status: 'PLANNED' | 'DRILLING' | 'COMPLETED' | 'COLLAPSED' | 'DEVIATED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyDrillingProgress {
  date: string;
  depth: number;
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  operator: string;
  notes?: string;
  meterage: number;
}

export interface Sample {
  id: string;
  subBlockId: string;
  sampleNumber: string;
  sampleDate: string;
  sampler: string;
  location?: string;
  depth?: number;
  weight?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialProfile {
  id: string;
  subBlockId: string;
  oreType: string;
  rockType: string;
  processingBehavior: string;
  gradeCategory: string;
  economicClass: string;
  mixingClass?: string;
  priority: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationDecision {
  id: string;
  subBlockId: string;
  destinationType: DestinationType;
  destinationId?: string;
  decisionReason: string;
  decisionBy: string;
  decisionDate: string;
  approvedBy?: string;
  approvedDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  status: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface AuditLogEntry {
  id: string;
  entityType: 'BLOCK' | 'SUB_BLOCK' | 'SAMPLE' | 'LAB_RESULT' | 'DESTINATION_DECISION';
  entityId: string;
  entityCode: string;
  action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'APPROVED' | 'REJECTED' | 'SUBMITTED' | 'EDITED';
  oldValue?: any;
  newValue?: any;
  changedFields?: string[];
  changedBy: string;
  changedByName: string;
  changedAt: string;
  description: string;
  version: number;
}

export interface User {
  id: string;
  code: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}