// src/core/domain/types/block.types.ts

import { Block, BlockStatus } from './mine.types';

// ============================================
// وضعیت‌های بلوک (تکمیل‌شده)
// ============================================

export type BlockLifecycleStatus = 
  | 'DEFINED'                 // تعریف شده توسط پیمانکار
  | 'PENDING_APPROVAL'        // در انتظار تأیید نظارت
  | 'REJECTED'                // رد شده توسط نظارت
  | 'APPROVED'                // تأیید شده توسط نظارت
  | 'DRILLING_PERMIT_ISSUED'  // مجوز حفاری صادر شده
  | 'DRILLING_IN_PROGRESS'    // در حال حفاری
  | 'DRILLING_COMPLETED'      // حفاری کامل شده
  | 'SUB_BLOCKING'            // در حال ساب‌بندی
  | 'SUB_BLOCKED'             // ساب‌بندی شده
  | 'SAMPLING_COMPLETED'      // نمونه‌برداری کامل
  | 'LAB_RESULTS_READY'       // نتایج آزمایشگاه آماده
  | 'CLASSIFIED'              // طبقه‌بندی شده
  | 'DESTINATION_SET'         // مقصد تعیین شده
  | 'COMPLETED';              // چرخه کامل شد

// ============================================
// موجودیت تأیید/رد بلوک
// ============================================

export interface BlockApproval {
  id: string;
  blockId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy: string;
  reviewedByName: string;
  reviewedAt: string;
  rejectionReason?: string;
  rejectionNotes?: string;
  // داده‌های ترسیم روی نقشه (نقاط، خطوط، اشکال)
  rejectionGeoData?: {
    type: 'FeatureCollection';
    features: any[];
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================
// موجودیت مجوز حفاری
// ============================================

export interface DrillingPermit {
  id: string;
  blockId: string;
  blockCode: string;
  permitNumber: string;
  issuedBy: string;
  issuedByName: string;
  issuedAt: string;
  validUntil: string;
  approvedDrillingParams: {
    totalHoles: number;
    holeDiameter: number;
    avgDesignDepth: number;
    pattern: string;
  };
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// موجودیت تاریخچه بلوک
// ============================================

export interface BlockHistoryEntry {
  id: string;
  blockId: string;
  blockCode: string;
  status: BlockLifecycleStatus;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  note?: string;
  metadata?: Record<string, any>;
}

// ============================================
// موجودیت بلوک کامل (تکمیل‌شده)
// ============================================

export interface FullBlock extends Block {
  lifecycleStatus: BlockLifecycleStatus;
  approvals: BlockApproval[];
  drillingPermit?: DrillingPermit;
  history: BlockHistoryEntry[];
  rejectionData?: {
    reason: string;
    notes: string;
    geoData: any;
    rejectedBy: string;
    rejectedAt: string;
  };
}