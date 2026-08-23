// src/modules/mine/services/BlockLifecycleService.ts

import { 
  FullBlock, 
  BlockApproval, 
  DrillingPermit, 
  BlockLifecycleStatus,
  BlockHistoryEntry 
} from '../../../core/domain/types/block.types';
import { Block, BlockStatus } from '../../../core/domain/types/mine.types';
import { BlockRepository } from '../../../core/infrastructure/repositories';

const APPROVALS_KEY = 'aes_block_approvals';
const PERMITS_KEY = 'aes_drilling_permits';
const HISTORY_KEY = 'aes_block_history';

export class BlockLifecycleService {

  // ============================================
  // مرحله ۱: تعریف بلوک
  // ============================================

  static defineBlock(blockData: Partial<Block>): Block {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      code: blockData.code || '',
      name: blockData.name || '',
      targetLevel: blockData.targetLevel || 0,
      blockNumber: blockData.blockNumber || 0,
      drillingParams: blockData.drillingParams || {
        totalHoles: 0,
        holeDiameter: 0,
        avgDesignDepth: 0,
        pattern: '',
      },
      geometry: blockData.geometry || {
        type: 'Polygon',
        coordinates: [],
        drillingPoints: [],
      },
      status: 'DEFINED' as BlockStatus,
      statusHistory: [],
      createdBy: blockData.createdBy || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    BlockRepository.save(newBlock);
    
    // ثبت تاریخچه
    this.addHistory(newBlock.id, newBlock.code, 'DEFINED', blockData.createdBy || 'system', 'بلوک تعریف شد');

    return newBlock;
  }

  // ============================================
  // مراحل ۲-۳: درخواست تأیید و تأیید/رد
  // ============================================

  static requestApproval(blockId: string, requestedBy: string, requestedByName: string): BlockApproval {
    const approval: BlockApproval = {
      id: crypto.randomUUID(),
      blockId,
      status: 'PENDING',
      reviewedBy: '',
      reviewedByName: '',
      reviewedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const approvals = this.getApprovals();
    approvals.push(approval);
    localStorage.setItem(APPROVALS_KEY, JSON.stringify(approvals));

    // به‌روزرسانی وضعیت بلوک
    const block = BlockRepository.getById(blockId);
    if (block) {
      block.status = 'PENDING_APPROVAL' as BlockStatus;
      BlockRepository.save(block);
      this.addHistory(blockId, block.code, 'PENDING_APPROVAL', requestedBy, 'درخواست تأیید ارسال شد');
    }

    return approval;
  }

  static approveBlock(blockId: string, reviewerId: string, reviewerName: string): BlockApproval | null {
    const approvals = this.getApprovals();
    const pendingApproval = approvals.find(a => a.blockId === blockId && a.status === 'PENDING');
    
    if (!pendingApproval) return null;

    pendingApproval.status = 'APPROVED';
    pendingApproval.reviewedBy = reviewerId;
    pendingApproval.reviewedByName = reviewerName;
    pendingApproval.reviewedAt = new Date().toISOString();
    pendingApproval.updatedAt = new Date().toISOString();

    localStorage.setItem(APPROVALS_KEY, JSON.stringify(approvals));

    // به‌روزرسانی وضعیت بلوک
    const block = BlockRepository.getById(blockId);
    if (block) {
      block.status = 'APPROVED' as BlockStatus;
      BlockRepository.save(block);
      this.addHistory(blockId, block.code, 'APPROVED', reviewerId, 'بلوک تأیید شد');
    }

    return pendingApproval;
  }

  static rejectBlock(
    blockId: string, 
    reviewerId: string, 
    reviewerName: string, 
    reason: string, 
    notes?: string,
    geoData?: any
  ): BlockApproval | null {
    const approvals = this.getApprovals();
    const pendingApproval = approvals.find(a => a.blockId === blockId && a.status === 'PENDING');
    
    if (!pendingApproval) return null;

    pendingApproval.status = 'REJECTED';
    pendingApproval.reviewedBy = reviewerId;
    pendingApproval.reviewedByName = reviewerName;
    pendingApproval.reviewedAt = new Date().toISOString();
    pendingApproval.rejectionReason = reason;
    pendingApproval.rejectionNotes = notes;
    pendingApproval.rejectionGeoData = geoData;
    pendingApproval.updatedAt = new Date().toISOString();

    localStorage.setItem(APPROVALS_KEY, JSON.stringify(approvals));

    // به‌روزرسانی وضعیت بلوک
    const block = BlockRepository.getById(blockId);
    if (block) {
      block.status = 'REJECTED' as BlockStatus;
      BlockRepository.save(block);
      this.addHistory(blockId, block.code, 'REJECTED', reviewerId, `بلوک رد شد: ${reason}`);
    }

    return pendingApproval;
  }

  // ============================================
  // مرحله ۴: صدور مجوز حفاری
  // ============================================

  static issueDrillingPermit(
    blockId: string, 
    issuerId: string, 
    issuerName: string,
    permitNumber: string
  ): DrillingPermit | null {
    const block = BlockRepository.getById(blockId);
    if (!block) return null;

    // بررسی اینکه بلوک تأیید شده باشد
    if (block.status !== 'APPROVED') {
      console.error('❌ بلوک هنوز تأیید نشده است');
      return null;
    }

    const permit: DrillingPermit = {
      id: crypto.randomUUID(),
      blockId,
      blockCode: block.code,
      permitNumber,
      issuedBy: issuerId,
      issuedByName: issuerName,
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 روز اعتبار
      approvedDrillingParams: {
        totalHoles: block.drillingParams?.totalHoles || 0,
        holeDiameter: block.drillingParams?.holeDiameter || 0,
        avgDesignDepth: block.drillingParams?.avgDesignDepth || 0,
        pattern: block.drillingParams?.pattern || '',
      },
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const permits = this.getPermits();
    permits.push(permit);
    localStorage.setItem(PERMITS_KEY, JSON.stringify(permits));

    // به‌روزرسانی وضعیت بلوک
    block.status = 'DRILLING_PERMIT_ISSUED' as BlockStatus;
    BlockRepository.save(block);
    this.addHistory(blockId, block.code, 'DRILLING_PERMIT_ISSUED', issuerId, `مجوز حفاری ${permitNumber} صادر شد`);

    return permit;
  }

  // ============================================
  // متدهای کمکی
  // ============================================

  private static getApprovals(): BlockApproval[] {
    try {
      const data = localStorage.getItem(APPROVALS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static getPermits(): DrillingPermit[] {
    try {
      const data = localStorage.getItem(PERMITS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static addHistory(blockId: string, blockCode: string, status: BlockLifecycleStatus, changedBy: string, note?: string): void {
    const history = this.getHistory();
    const entry: BlockHistoryEntry = {
      id: crypto.randomUUID(),
      blockId,
      blockCode,
      status,
      changedBy,
      changedByName: changedBy,
      changedAt: new Date().toISOString(),
      note,
    };
    history.push(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  private static getHistory(): BlockHistoryEntry[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static getBlockHistory(blockId: string): BlockHistoryEntry[] {
    return this.getHistory().filter(h => h.blockId === blockId);
  }

  static getBlockApproval(blockId: string): BlockApproval | null {
    const approvals = this.getApprovals();
    return approvals.find(a => a.blockId === blockId) || null;
  }

  static getBlockPermit(blockId: string): DrillingPermit | null {
    const permits = this.getPermits();
    return permits.find(p => p.blockId === blockId) || null;
  }

  static getFullBlock(blockId: string): FullBlock | null {
    const block = BlockRepository.getById(blockId);
    if (!block) return null;

    return {
      ...block,
      lifecycleStatus: block.status as BlockLifecycleStatus,
      approvals: this.getApprovals().filter(a => a.blockId === blockId),
      drillingPermit: this.getBlockPermit(blockId) || undefined,
      history: this.getBlockHistory(blockId),
      rejectionData: (() => {
        const approval = this.getApprovals().find(a => a.blockId === blockId && a.status === 'REJECTED');
        if (!approval) return undefined;
        return {
          reason: approval.rejectionReason || '',
          notes: approval.rejectionNotes || '',
          geoData: approval.rejectionGeoData || null,
          rejectedBy: approval.reviewedBy,
          rejectedAt: approval.reviewedAt,
        };
      })(),
    };
  }
}