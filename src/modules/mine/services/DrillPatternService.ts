// src/modules/mine/services/DrillPatternService.ts

import { 
  DrillPatternDesignRepository, 
  BlockRepository, 
  AuditLogRepository 
} from '../../../core/infrastructure/repositories';
import type { DrillPatternDesign, Block } from '../../../core/domain/types/mine.types';

export class DrillPatternService {
  /**
   * دریافت تمام الگوهای طراحی شبکه حفاری
   */
  static getAllPatterns(): DrillPatternDesign[] {
    return DrillPatternDesignRepository.getAll().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * دریافت الگو بر اساس بلوک
   */
  static getPatternByBlockId(blockId: string): DrillPatternDesign | null {
    const patterns = DrillPatternDesignRepository.findBy('blockId', blockId);
    return patterns.length > 0 ? patterns[0] : null;
  }

  /**
   * ثبت طراحی شبکه حفاری توسط دفتر فنی پیمانکار استخراج (مرحله ۳)
   */
  static submitDrillDesign(params: {
    blockId: string;
    bandId?: string;
    code: string;
    designerContractor: string;
    holeDiameterMm: number;
    burdenMeters: number;
    spacingMeters: number;
    subDrillingMeters: number;
    holeCount: number;
    avgDepthMeters: number;
    explosiveType?: string;
    powderFactorKgPerM3?: number;
  }): DrillPatternDesign {
    const block = BlockRepository.getById(params.blockId);
    if (!block) throw new Error('بلوک یافت نشد');

    const totalMetersDesign = params.holeCount * params.avgDepthMeters;

    const pattern: DrillPatternDesign = {
      id: crypto.randomUUID(),
      blockId: block.id,
      bandId: params.bandId,
      code: params.code,
      blockCode: block.code,
      designerContractor: params.designerContractor,
      holeDiameterMm: params.holeDiameterMm,
      burdenMeters: params.burdenMeters,
      spacingMeters: params.spacingMeters,
      subDrillingMeters: params.subDrillingMeters,
      holeCount: params.holeCount,
      avgDepthMeters: params.avgDepthMeters,
      totalMetersDesign,
      explosiveType: params.explosiveType || 'آنفو (ANFO) + بوستر ۵۰۰ گرمی Emulite',
      powderFactorKgPerM3: params.powderFactorKgPerM3 || 0.65,
      status: 'PENDING_SUPERVISION_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    DrillPatternDesignRepository.save(pattern);

    // به‌روزرسانی پارامترهای حفاری بلوک
    block.drillingParams = {
      totalHoles: params.holeCount,
      holeDiameter: params.holeDiameterMm,
      avgDesignDepth: params.avgDepthMeters,
      pattern: `شبکه ${params.burdenMeters}×${params.spacingMeters} متر`,
    };
    block.status = 'PENDING_APPROVAL';
    block.statusHistory.push({
      status: 'PENDING_APPROVAL',
      changedBy: params.designerContractor,
      changedAt: new Date().toISOString(),
      reason: `ارسال طرح شبکه حفاری (${params.holeCount} چال) به نظارت جهت بررسی و صدور مجوز`,
    });
    BlockRepository.save(block);

    AuditLogRepository.save({
      id: crypto.randomUUID(),
      entityType: 'BLOCK',
      entityId: block.id,
      entityCode: block.code,
      action: 'SUBMITTED',
      changedBy: params.designerContractor,
      changedByName: params.designerContractor,
      changedAt: new Date().toISOString(),
      description: `ثبت طرح شبکه حفاری ${pattern.code} برای بلوک ${block.code} توسط پیمانکار`,
      version: 1,
    });

    return pattern;
  }

  /**
   * بررسی و صدور مجوز حفاری توسط واحد نظارت (مرحله ۴)
   */
  static issueDrillingPermit(params: {
    patternId: string;
    supervisionReviewer: string;
    supervisionNotes?: string;
  }): DrillPatternDesign {
    const pattern = DrillPatternDesignRepository.getById(params.patternId);
    if (!pattern) throw new Error('طرح شبکه حفاری یافت نشد');

    const block = BlockRepository.getById(pattern.blockId);
    if (!block) throw new Error('بلوک یافت نشد');

    const permitNumber = `PERMIT-DRL-${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${block.blockNumber}`;

    pattern.status = 'PERMIT_ISSUED';
    pattern.supervisionReviewer = params.supervisionReviewer;
    pattern.supervisionNotes = params.supervisionNotes || 'طرح حفاری و فواصل ردیف بررسی و مورد تأیید است.';
    pattern.permitNumber = permitNumber;
    pattern.permitIssuedAt = new Date().toISOString();
    pattern.updatedAt = new Date().toISOString();

    DrillPatternDesignRepository.save(pattern);

    // تغییر وضعیت بلوک به APPROVED
    block.status = 'APPROVED';
    block.statusHistory.push({
      status: 'APPROVED',
      changedBy: params.supervisionReviewer,
      changedAt: new Date().toISOString(),
      reason: `صدور مجوز حفاری شماره ${permitNumber} توسط نظارت`,
    });
    BlockRepository.save(block);

    AuditLogRepository.save({
      id: crypto.randomUUID(),
      entityType: 'BLOCK',
      entityId: block.id,
      entityCode: block.code,
      action: 'APPROVED',
      changedBy: params.supervisionReviewer,
      changedByName: params.supervisionReviewer,
      changedAt: new Date().toISOString(),
      description: `صدور مجوز حفاری ${permitNumber} برای بلوک ${block.code} توسط واحد نظارت`,
      version: 2,
    });

    return pattern;
  }

  /**
   * بازگشت طرح حفاری جهت اصلاح (واحد نظارت)
   */
  static requestRevision(params: {
    patternId: string;
    supervisionReviewer: string;
    supervisionNotes: string;
  }): DrillPatternDesign {
    const pattern = DrillPatternDesignRepository.getById(params.patternId);
    if (!pattern) throw new Error('طرح شبکه حفاری یافت نشد');

    pattern.status = 'REVISION_REQUIRED';
    pattern.supervisionReviewer = params.supervisionReviewer;
    pattern.supervisionNotes = params.supervisionNotes;
    pattern.updatedAt = new Date().toISOString();

    DrillPatternDesignRepository.save(pattern);

    const block = BlockRepository.getById(pattern.blockId);
    if (block) {
      block.status = 'REJECTED';
      block.statusHistory.push({
        status: 'REJECTED',
        changedBy: params.supervisionReviewer,
        changedAt: new Date().toISOString(),
        reason: `درخواست اصلاح طرح حفاری: ${params.supervisionNotes}`,
      });
      BlockRepository.save(block);
    }

    return pattern;
  }

  /**
   * ثبت اتمام حفاری بلوک و آماده‌سازی برای درخواست نمونه‌گیری (مرحله ۵ و ۶)
   */
  static completeDrilling(blockId: string, operator: string, actualTotalMeters?: number): Block {
    const block = BlockRepository.getById(blockId);
    if (!block) throw new Error('بلوک یافت نشد');

    block.status = 'DRILLED';
    block.actualDrillingData = {
      holeDepths: Array(block.drillingParams.totalHoles).fill(block.drillingParams.avgDesignDepth),
      totalMeters: actualTotalMeters || (block.drillingParams.totalHoles * block.drillingParams.avgDesignDepth),
    };
    block.statusHistory.push({
      status: 'DRILLED',
      changedBy: operator,
      changedAt: new Date().toISOString(),
      reason: 'عملیات حفاری بلوک تکمیل شد - آماده ثبت درخواست نمونه‌گیری و ساب‌بندی',
    });
    block.updatedAt = new Date().toISOString();

    BlockRepository.save(block);

    const pattern = this.getPatternByBlockId(blockId);
    if (pattern) {
      pattern.status = 'DRILLING_COMPLETED';
      pattern.updatedAt = new Date().toISOString();
      DrillPatternDesignRepository.save(pattern);
    }

    AuditLogRepository.save({
      id: crypto.randomUUID(),
      entityType: 'BLOCK',
      entityId: block.id,
      entityCode: block.code,
      action: 'STATUS_CHANGED',
      changedBy: operator,
      changedByName: operator,
      changedAt: new Date().toISOString(),
      description: `اتمام عملیات حفاری بلوک ${block.code} و متراژ کل ${block.actualDrillingData.totalMeters} متر`,
      version: 3,
    });

    return block;
  }
}
