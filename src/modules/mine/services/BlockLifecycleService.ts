// src/modules/mine/services/BlockLifecycleService.ts

import { 
  BlockRepository, 
  SubBlockRepository, 
  DrillingPointRepository
} from '../../../core/infrastructure/repositories';
import { ActivityLogger } from '../../../core/services/ActivityLogger';
import type { Block } from '../../../core/domain/types/mine.types';
import type { FullBlock, BlockLifecycleStatus, BlockApproval, BlockTimelineEvent } from '../../../core/domain/types/block.types';

const APPROVALS_STORAGE_KEY = 'aes_block_approvals';

function getStoredApprovals(): BlockApproval[] {
  try {
    const raw = localStorage.getItem(APPROVALS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredApprovals(approvals: BlockApproval[]): void {
  try {
    localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(approvals));
  } catch (e) {
    console.error('Failed to save approvals', e);
  }
}

export class BlockLifecycleService {
  /**
   * تعریف بلوک جدید و ثبت لاگ
   */
  static defineBlock(data: {
    code: string;
    name: string;
    targetLevel: number;
    blockNumber: number;
    pitId?: string;
    drillingParams?: any;
    geometry?: any;
    createdBy?: string;
  }): Block {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      code: data.code,
      name: data.name || data.code,
      targetLevel: data.targetLevel,
      blockNumber: data.blockNumber,
      pitId: data.pitId || '',
      drillingParams: data.drillingParams || {
        totalHoles: 36,
        holeDiameter: 76,
        avgDesignDepth: 12.5,
        pattern: 'شبکه ۳×۳',
      },
      geometry: data.geometry || {
        type: 'Polygon',
        coordinates: [],
        drillingPoints: [],
      },
      status: 'APPROVED',
      statusHistory: [
        {
          status: 'DEFINED',
          changedAt: new Date().toISOString(),
          changedBy: data.createdBy || 'کاربر سیستم',
          note: 'تعریف اولیه بلوک استخراجی',
        },
      ],
      createdBy: data.createdBy || '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    BlockRepository.save(newBlock);

    // ثبت درخواست تأیید اولیه
    const initialApproval: BlockApproval = {
      id: crypto.randomUUID(),
      blockId: newBlock.id,
      type: 'CONTRACTOR_SUBMISSION',
      status: 'APPROVED',
      submittedBy: data.createdBy || 'دفتر فنی پیمانکار',
      submittedAt: new Date().toISOString(),
      reviewerName: 'واحد نظارت معدن',
      notes: 'بلوک استخراجی جدید با موفقیت ثبت شد',
    };

    const approvals = getStoredApprovals();
    approvals.push(initialApproval);
    saveStoredApprovals(approvals);

    return newBlock;
  }

  /**
   * دریافت اطلاعات تجمیعی کامل بلوک همراه ساب‌بلوک‌ها و تأییدیه‌ها
   */
  static getFullBlock(blockId: string): FullBlock | null {
    const block = BlockRepository.getById(blockId);
    if (!block) return null;

    const subBlocks = SubBlockRepository.findBy('blockId', block.id);
    const drillingPointsList = DrillingPointRepository.findBy('blockId', block.id);
    const allApprovals = getStoredApprovals();
    const approvals = allApprovals.filter((a) => a.blockId === block.id);

    // ساخت تایم‌لاین کامل
    const timeline: BlockTimelineEvent[] = [];

    // رویداد ایجاد
    timeline.push({
      id: crypto.randomUUID(),
      blockId: block.id,
      title: 'تعریف بلوک استخراجی',
      description: `بلوک ${block.code} با تراز ${block.targetLevel} ثبت شد.`,
      timestamp: block.createdAt,
      actor: block.createdBy || 'دفتر فنی',
      type: 'INFO',
      status: 'DEFINED',
    });

    // رویدادهای تغییر وضعیت
    if (block.statusHistory) {
      block.statusHistory.forEach((sh, idx) => {
        timeline.push({
          id: `sh-${idx}`,
          blockId: block.id,
          title: `تغییر وضعیت به ${sh.status}`,
          description: sh.note || `وضعیت به ${sh.status} تغییر یافت`,
          timestamp: sh.changedAt,
          actor: sh.changedBy,
          type: 'SUCCESS',
        });
      });
    }

    // بررسی پیشرفت ساب‌بلوک‌ها
    if (subBlocks.length > 0) {
      timeline.push({
        id: crypto.randomUUID(),
        blockId: block.id,
        title: 'ایجاد و طبقه‌بندی ساب‌بلوک‌ها',
        description: `${subBlocks.length} ساب‌بلوک برای این بلوک تعریف شده است.`,
        timestamp: subBlocks[0].createdAt || new Date().toISOString(),
        actor: 'واحد زمین‌شناسی و کنترل عیار',
        type: 'SUCCESS',
        status: 'SUB_BLOCKED',
      });
    }

    let lifecycleStatus: BlockLifecycleStatus = (block.status as any) || 'DEFINED';
    if (subBlocks.some(sb => sb.status === 'FINAL_PRODUCT')) {
      lifecycleStatus = 'COMPLETED';
    } else if (subBlocks.some(sb => sb.status === 'DESTINATION_APPROVED')) {
      lifecycleStatus = 'DESTINATION_SET';
    } else if (subBlocks.some(sb => sb.status === 'CLASSIFICATION_DONE')) {
      lifecycleStatus = 'CLASSIFIED';
    } else if (subBlocks.some(sb => sb.status === 'LAB_COMPLETED')) {
      lifecycleStatus = 'LAB_RESULTS_READY';
    } else if (subBlocks.some(sb => sb.status === 'SAMPLING_COMPLETED')) {
      lifecycleStatus = 'SAMPLING_COMPLETED';
    } else if (subBlocks.length > 0) {
      lifecycleStatus = 'SUB_BLOCKED';
    }

    return {
      ...block,
      lifecycleStatus,
      subBlocks,
      drillingPointsList,
      approvals,
      timeline,
    };
  }

  /**
   * تأیید بلوک توسط نظارت
   */
  static approveBlock(
    blockId: string,
    userId: string,
    userName: string,
    notes?: string
  ): BlockApproval | null {
    const block = BlockRepository.getById(blockId);
    if (!block) return null;

    block.status = 'APPROVED';
    block.statusHistory.push({
      status: 'APPROVED',
      changedAt: new Date().toISOString(),
      changedBy: userName,
      note: notes || 'تأیید طرح هندسه و چال‌های بلوک توسط نظارت',
    });
    block.updatedAt = new Date().toISOString();
    BlockRepository.save(block);

    const approval: BlockApproval = {
      id: crypto.randomUUID(),
      blockId,
      type: 'SUPERVISION_APPROVAL',
      status: 'APPROVED',
      submittedBy: block.createdBy || 'پیمانکار',
      submittedAt: block.createdAt,
      reviewedBy: userId,
      reviewedAt: new Date().toISOString(),
      reviewerName: userName,
      notes: notes || 'تأیید شد',
    };

    const approvals = getStoredApprovals();
    approvals.push(approval);
    saveStoredApprovals(approvals);

    ActivityLogger.log({
      action: 'BLOCK_UPDATE',
      module: 'MINE',
      entityId: block.id,
      entityType: 'BLOCK',
      title: `تأیید بلوک ${block.code}`,
      description: `بلوک ${block.code} توسط ${userName} تأیید شد.`,
      userName,
    });

    return approval;
  }

  /**
   * رد بلوک توسط نظارت با ذکر دلیل
   */
  static rejectBlock(
    blockId: string,
    userId: string,
    userName: string,
    reason: string,
    notes: string,
    geoData?: any
  ): BlockApproval | null {
    const block = BlockRepository.getById(blockId);
    if (!block) return null;

    block.status = 'REJECTED';
    block.statusHistory.push({
      status: 'REJECTED',
      changedAt: new Date().toISOString(),
      changedBy: userName,
      note: `علت رد: ${reason} - ${notes}`,
    });
    block.updatedAt = new Date().toISOString();
    BlockRepository.save(block);

    const approval: BlockApproval = {
      id: crypto.randomUUID(),
      blockId,
      type: 'SUPERVISION_REJECTION',
      status: 'REJECTED',
      submittedBy: block.createdBy || 'پیمانکار',
      submittedAt: block.createdAt,
      reviewedBy: userId,
      reviewedAt: new Date().toISOString(),
      reviewerName: userName,
      rejectionReason: reason,
      notes,
      geoData,
    };

    const approvals = getStoredApprovals();
    approvals.push(approval);
    saveStoredApprovals(approvals);

    ActivityLogger.log({
      action: 'BLOCK_UPDATE',
      module: 'MINE',
      entityId: block.id,
      entityType: 'BLOCK',
      title: `رد بلوک ${block.code}`,
      description: `بلوک ${block.code} به دلیل "${reason}" رد شد.`,
      userName,
    });

    return approval;
  }

  /**
   * صدور مجوز حفاری
   */
  static issueDrillingPermit(
    blockId: string,
    userId: string,
    userName: string,
    params?: any
  ): BlockApproval | null {
    const block = BlockRepository.getById(blockId);
    if (!block) return null;

    block.status = 'DRILLING';
    block.statusHistory.push({
      status: 'DRILLING',
      changedAt: new Date().toISOString(),
      changedBy: userName,
      note: 'صدور پروانه عملیات حفاری چال‌های انفجاری',
    });
    block.updatedAt = new Date().toISOString();
    BlockRepository.save(block);

    const approval: BlockApproval = {
      id: crypto.randomUUID(),
      blockId,
      type: 'DRILLING_PERMIT',
      status: 'APPROVED',
      submittedBy: 'واحد برنامه‌ریزی',
      submittedAt: new Date().toISOString(),
      reviewedBy: userId,
      reviewedAt: new Date().toISOString(),
      reviewerName: userName,
      notes: 'پروانه حفاری صادر گردید',
      geoData: params,
    };

    const approvals = getStoredApprovals();
    approvals.push(approval);
    saveStoredApprovals(approvals);

    return approval;
  }

  /**
   * حذف بلوک و ساب‌بلوک‌های وابسته
   */
  static deleteBlock(blockId: string): boolean {
    const block = BlockRepository.getById(blockId);
    if (!block) return false;

    // حذف ساب‌بلوک‌ها
    const subBlocks = SubBlockRepository.findBy('blockId', blockId);
    subBlocks.forEach((sb) => SubBlockRepository.delete(sb.id));

    // حذف نقاط حفاری
    const points = DrillingPointRepository.findBy('blockId', blockId);
    points.forEach((p) => DrillingPointRepository.delete(p.id));

    // حذف بلوک اصلی
    const deleted = BlockRepository.delete(blockId);

    if (deleted) {
      ActivityLogger.logBlockDelete(block);
    }
    return deleted;
  }
}

export default BlockLifecycleService;
