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

export type SubBlockStatus = 
  | 'CREATED'
  | 'SAMPLED'
  | 'WAITING_LAB'
  | 'LAB_COMPLETED'
  | 'CLASSIFIED'
  | 'DESTINATION_ASSIGNED'
  | 'LOADING'
  | 'COMPLETED'
  | 'SURVEYED';

export type DestinationType = 
  | 'WASTE_DUMP_ROCK'
  | 'WASTE_DUMP_ALLUVIAL'
  | 'HIGH_GRADE_STOCKPILE'
  | 'MEDIUM_GRADE_STOCKPILE'
  | 'LOW_GRADE_STOCKPILE'
  | 'CRUSHER_FEED'
  | 'TEMPORARY_STOCKPILE'
  | 'BLEND_STOCKPILE';

// ============================================
// اینترفیس‌های اصلی
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

export interface SubBlock {
  id: string;
  blockId: string;
  code: string;
  sequence: number;
  sampleId?: string;
  sampleDate?: string;
  sampler?: string;
  assay?: number;
  labResults?: {
    fe: number;
    feo: number;
    sio2: number;
    al2o3: number;
    p: number;
    s: number;
    moisture: number;
    density: number;
  };
  materialClass?: string;
  destination?: DestinationType;
  loadingData?: {
    truckCount: number;
    tonnage: number;
    dumpId: string;
  };
  surveyData?: {
    actualVolume: number;
    designVolume: number;
    difference: number;
  };
  status: SubBlockStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version?: number;  // ✅ اضافه شد
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