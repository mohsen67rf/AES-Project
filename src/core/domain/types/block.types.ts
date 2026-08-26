// src/core/domain/types/block.types.ts

import type { Block, SubBlock, DrillingPoint } from './mine.types';

export type BlockLifecycleStatus = 
  | 'DEFINED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'DRILLING_PERMIT_ISSUED'
  | 'DRILLING_IN_PROGRESS'
  | 'DRILLING_COMPLETED'
  | 'SUB_BLOCKING'
  | 'SUB_BLOCKED'
  | 'SAMPLING_COMPLETED'
  | 'LAB_RESULTS_READY'
  | 'CLASSIFIED'
  | 'DESTINATION_SET'
  | 'COMPLETED';

export interface BlockApproval {
  id: string;
  blockId: string;
  type: 'CONTRACTOR_SUBMISSION' | 'SUPERVISION_APPROVAL' | 'SUPERVISION_REJECTION' | 'DRILLING_PERMIT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerName?: string;
  notes?: string;
  rejectionReason?: string;
  geoData?: any;
}

export interface BlockTimelineEvent {
  id: string;
  blockId: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  status?: BlockLifecycleStatus;
}

export interface FullBlock extends Block {
  lifecycleStatus?: BlockLifecycleStatus;
  subBlocks?: SubBlock[];
  drillingPointsList?: DrillingPoint[];
  approvals?: BlockApproval[];
  timeline?: BlockTimelineEvent[];
}
