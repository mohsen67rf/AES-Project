// src/modules/mine/services/MonthlyBandService.ts

import { 
  MonthlyBandRepository, 
  AuditLogRepository 
} from '../../../core/infrastructure/repositories';
import type { MonthlyBand } from '../../../core/domain/types/mine.types';

export class MonthlyBandService {
  /**
   * دریافت تمام باندهای استخراج ماهانه
   */
  static getAllBands(): MonthlyBand[] {
    return MonthlyBandRepository.getAll().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * ثبت باند جدید توسط واحد نظارت (مرحله ۱)
   */
  static createMonthlyBand(params: {
    mineId: string;
    code: string;
    title: string;
    month: string;
    year: number;
    benchLevel: number;
    volumeM3: number;
    tonnageOre: number;
    tonnageWaste: number;
    primaryRockType: string;
    estimatedFe: number;
    supervisionEngineer: string;
    attachedCadFile?: string;
    notes?: string;
  }): MonthlyBand {
    const band: MonthlyBand = {
      id: crypto.randomUUID(),
      mineId: params.mineId,
      code: params.code,
      title: params.title,
      month: params.month,
      year: params.year,
      benchLevel: params.benchLevel,
      volumeM3: params.volumeM3,
      tonnageOre: params.tonnageOre,
      tonnageWaste: params.tonnageWaste,
      primaryRockType: params.primaryRockType,
      estimatedFe: params.estimatedFe,
      status: 'SUBMITTED_BY_SUPERVISION',
      supervisionEngineer: params.supervisionEngineer,
      attachedCadFile: params.attachedCadFile,
      notes: params.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MonthlyBandRepository.save(band);

    AuditLogRepository.save({
      id: crypto.randomUUID(),
      entityType: 'BLOCK',
      entityId: band.id,
      entityCode: band.code,
      action: 'CREATED',
      changedBy: params.supervisionEngineer,
      changedByName: params.supervisionEngineer,
      changedAt: new Date().toISOString(),
      description: `ثبت باند طراحی ماهانه ${band.code} برای تراز پله ${band.benchLevel} (تناژ کانسنگ: ${band.tonnageOre.toLocaleString()} تن)`,
      version: 1,
    });

    return band;
  }

  /**
   * تأیید باند توسط دفتر فنی کارفرما (مرحله ۲)
   */
  static approveBandByClient(bandId: string, clientApprover: string, notes?: string): MonthlyBand {
    const band = MonthlyBandRepository.getById(bandId);
    if (!band) throw new Error('باند ماهانه یافت نشد');

    band.status = 'APPROVED_BY_CLIENT';
    band.clientApprover = clientApprover;
    band.approvalDate = new Date().toISOString();
    if (notes) band.notes = (band.notes ? band.notes + ' | ' : '') + `تأیید کارفرما: ${notes}`;
    band.updatedAt = new Date().toISOString();

    MonthlyBandRepository.save(band);

    AuditLogRepository.save({
      id: crypto.randomUUID(),
      entityType: 'BLOCK',
      entityId: band.id,
      entityCode: band.code,
      action: 'APPROVED',
      changedBy: clientApprover,
      changedByName: clientApprover,
      changedAt: new Date().toISOString(),
      description: `تأیید باند طراحی ماهانه ${band.code} توسط کارفرما و ابلاغ به پیمانکار استخراج`,
      version: 2,
    });

    return band;
  }

  /**
   * ارجاع باند جهت اصلاح (کارفرما)
   */
  static rejectOrReviseBand(bandId: string, rejecter: string, reason: string): MonthlyBand {
    const band = MonthlyBandRepository.getById(bandId);
    if (!band) throw new Error('باند ماهانه یافت نشد');

    band.status = 'REJECTED';
    band.rejectionReason = reason;
    band.updatedAt = new Date().toISOString();

    MonthlyBandRepository.save(band);

    AuditLogRepository.save({
      id: crypto.randomUUID(),
      entityType: 'BLOCK',
      entityId: band.id,
      entityCode: band.code,
      action: 'REJECTED',
      changedBy: rejecter,
      changedByName: rejecter,
      changedAt: new Date().toISOString(),
      description: `رد/درخواست اصلاح باند ماهانه ${band.code}: ${reason}`,
      version: 2,
    });

    return band;
  }
}
