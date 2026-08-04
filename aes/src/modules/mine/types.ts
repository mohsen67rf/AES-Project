// src/modules/mine/types.ts

// ============================================
// نوع‌های داده برای ماژول حفاری
// ============================================

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

// ============================================
// نوع‌های داده برای بلوک (تکمیل‌شده)
// ============================================

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

export interface StatusHistory {
  status: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

// ============================================
// نوع‌های داده برای SubBlock (تکمیل‌شده)
// ============================================

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

export interface SubBlock {
  id: string;
  blockId: string;
  code: string;
  sequence: number;
  sampleId?: string;
  sampleDate?: string;
  sampler?: string;
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
  destination?: string;
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
}