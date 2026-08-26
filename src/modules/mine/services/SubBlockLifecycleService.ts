// src/modules/mine/services/SubBlockLifecycleService.ts

import { SubBlock, SubBlockStatus, SubBlockStatusHistory } from '../../../core/domain/types/mine.types';
import { SUB_BLOCK_STATUS_LABELS, STATUS_TRANSITIONS, isFinalStatus } from '../../../core/domain/constants/subblock.constants';
import { SubBlockRepository } from '../../../core/infrastructure/repositories';
import { ActivityLogger } from '../../../core/services/ActivityLogger';

export class SubBlockLifecycleService {
  
  // ============================================
  // ۱. ایجاد و تفکیک ساب‌بلوک‌ها برای بلوک
  // ============================================

  static createSubBlocksForBlock(
    blockId: string,
    count: number,
    blockCode: string,
    targetLevel: number,
    totalBlockTonnage: number = 15000,
    createdBy: string = 'مهندس معدن'
  ): SubBlock[] {
    const existing = SubBlockRepository.findBy('blockId', blockId);
    const existingCount = existing.length;
    const subBlocks: SubBlock[] = [];
    const avgTonnagePerSub = Math.round(totalBlockTonnage / count);

    for (let i = 1; i <= count; i++) {
      const seq = existingCount + i;
      const subBlockCode = `${blockCode}-S${seq}`;
      const now = new Date().toISOString();

      const newSubBlock: SubBlock = {
        id: crypto.randomUUID(),
        blockId,
        code: subBlockCode,
        sequence: seq,
        benchLevel: targetLevel,
        tonnage: avgTonnagePerSub,
        estimatedTonnage: avgTonnagePerSub,
        density: 2.75, // چگالی متوسط کانسار
        status: 'SUB_BLOCKED',
        definedAt: now,
        definedBy: createdBy,
        subBlockedAt: now,
        subBlockedBy: createdBy,
        statusHistory: [
          {
            status: 'DEFINED',
            changedAt: now,
            changedBy: createdBy,
            note: 'تعریف اولیه ساب‌بلوک بر اساس زون‌بندی مدل بلوکی',
            duration: 0,
          },
          {
            status: 'SUB_BLOCKED',
            changedAt: now,
            changedBy: createdBy,
            note: `تفکیک ساب‌بلوک با تناژ تخمینی ${avgTonnagePerSub.toLocaleString()} تن`,
            duration: 0,
          }
        ],
        createdBy,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      SubBlockRepository.save(newSubBlock);
      subBlocks.push(newSubBlock);
      ActivityLogger.logSubBlockAction('CREATE', newSubBlock);
    }

    return subBlocks;
  }

  // ============================================
  // ۲. ثبت نمونه‌برداری
  // ============================================

  static recordSampling(
    subBlockId: string,
    data: {
      sampleNumber?: string;
      sampler: string;
      sampleType?: 'POWDER_BLASTHOLE' | 'CORE_DRILL' | 'TRENCH' | 'GRAB';
      sampleDate?: string;
      sampleDepth?: number;
      sampleWeight?: number;
      sampleNotes?: string;
      changedBy: string;
    }
  ): SubBlock | null {
    const subBlock = SubBlockRepository.getById(subBlockId);
    if (!subBlock) return null;

    const now = new Date().toISOString();
    const sampleCode = data.sampleNumber || `SMP-${subBlock.code}-${Date.now().toString().slice(-4)}`;

    const historyEntry: SubBlockStatusHistory = {
      status: 'SAMPLING_COMPLETED',
      changedAt: now,
      changedBy: data.changedBy,
      note: `ثبت نمونه‌برداری ${sampleCode} توسط ${data.sampler}`,
      duration: this.calculateDuration(subBlock),
    };

    const updated: SubBlock = {
      ...subBlock,
      sampleId: crypto.randomUUID(),
      sampleNumber: sampleCode,
      sampler: data.sampler,
      sampleType: data.sampleType || 'POWDER_BLASTHOLE',
      sampleDate: data.sampleDate || now.split('T')[0],
      sampleDepth: data.sampleDepth || 12,
      sampleWeight: data.sampleWeight || 5.0,
      sampleNotes: data.sampleNotes,
      samplingRequestedAt: subBlock.samplingRequestedAt || now,
      samplingCompletedAt: now,
      status: 'SAMPLING_COMPLETED',
      statusHistory: [...(subBlock.statusHistory || []), historyEntry],
      updatedAt: now,
      version: (subBlock.version || 0) + 1,
    };

    SubBlockRepository.save(updated);
    ActivityLogger.logSubBlockAction('SAMPLING', updated, undefined, data);
    return updated;
  }

  // ============================================
  // ۳. ارسال به آزمایشگاه و ثبت نتایج آنالیز عیار
  // ============================================

  static recordLabResults(
    subBlockId: string,
    data: {
      fe: number;
      feo?: number;
      sio2?: number;
      al2o3?: number;
      p?: number;
      s?: number;
      cao?: number;
      mgo?: number;
      moisture?: number;
      density?: number;
      labName?: string;
      batchNumber?: string;
      labTechnician?: string;
      isVerified?: boolean;
      changedBy: string;
    }
  ): SubBlock | null {
    const subBlock = SubBlockRepository.getById(subBlockId);
    if (!subBlock) return null;

    const now = new Date().toISOString();
    const assayValue = Number(data.fe.toFixed(2));

    const historyEntry: SubBlockStatusHistory = {
      status: 'LAB_COMPLETED',
      changedAt: now,
      changedBy: data.changedBy,
      note: `نتایج آنالیز آزمایشگاه ثبت شد: Fe=${assayValue}% | P=${data.p || 0}% | S=${data.s || 0}%`,
      duration: this.calculateDuration(subBlock),
    };

    const updated: SubBlock = {
      ...subBlock,
      labResults: {
        fe: assayValue,
        feo: data.feo || 0,
        sio2: data.sio2 || 0,
        al2o3: data.al2o3 || 0,
        p: data.p || 0,
        s: data.s || 0,
        cao: data.cao || 0,
        mgo: data.mgo || 0,
        moisture: data.moisture || 3.2,
        density: data.density || subBlock.density || 2.75,
        assay: assayValue,
        labName: data.labName || 'آزمایشگاه مرکزی مجتمع',
        batchNumber: data.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
        labTechnician: data.labTechnician || 'کارشناس آنالیز',
        labReceivedAt: subBlock.labResults?.labReceivedAt || now,
        labCompletedAt: now,
        isVerified: data.isVerified ?? true,
      },
      status: 'LAB_COMPLETED',
      statusHistory: [...(subBlock.statusHistory || []), historyEntry],
      updatedAt: now,
      version: (subBlock.version || 0) + 1,
    };

    SubBlockRepository.save(updated);
    ActivityLogger.logSubBlockAction('LAB', updated, undefined, data);
    return updated;
  }

  // ============================================
  // ۴. طبقه‌بندی هوشمند و ژئومتالورژی (Auto-Classification)
  // ============================================

  static autoClassifySubBlock(
    subBlockId: string,
    changedBy: string = 'سیستم هوشمند طبقه‌بندی',
    manualOverrides?: {
      rockType?: string;
      oreType?: string;
      isWaste?: boolean;
      wasteType?: 'سنگی' | 'آبرفتی' | 'خاک رویه' | 'شیل';
      notes?: string;
    }
  ): SubBlock | null {
    const subBlock = SubBlockRepository.getById(subBlockId);
    if (!subBlock) return null;

    const fe = subBlock.labResults?.fe ?? 0;
    const p = subBlock.labResults?.p ?? 0;
    const s = subBlock.labResults?.s ?? 0;
    const sio2 = subBlock.labResults?.sio2 ?? 0;

    let gradeCategory: 'HIGH' | 'MEDIUM' | 'LOW' | 'WASTE';
    let materialClass: string;
    let economicClass: string;
    let defaultOreType: string;
    let defaultRockType: string;
    let isWaste = manualOverrides?.isWaste ?? false;
    let wasteType = manualOverrides?.wasteType;

    // منطق طبقه‌بندی عیاری کانسار
    if (isWaste || fe < 35) {
      gradeCategory = 'WASTE';
      isWaste = true;
      materialClass = 'باطله معدنی (Waste Material)';
      economicClass = 'غیرقابل مصرف در مدار خردایش - انتقال به دامپ';
      defaultRockType = 'شیل و گرانودیوریت دگرسان';
      defaultOreType = 'باطله توده‌ای';
      if (!wasteType) {
        wasteType = (manualOverrides?.rockType?.includes('آبرفت') || defaultRockType.includes('آبرفت')) ? 'آبرفتی' : 'سنگی';
      }
    } else if (fe < 48) {
      gradeCategory = 'LOW';
      materialClass = 'سنگ‌آهن کم‌عیار (Low-Grade Ore)';
      economicClass = 'نیازمند پرعیارسازی مغناطیسی / دپوی عیار پایین';
      defaultRockType = 'اسکارن مگنتیت‌دار';
      defaultOreType = 'مگنتیت کم‌عیار';
    } else if (fe < 58) {
      gradeCategory = 'MEDIUM';
      materialClass = 'سنگ‌آهن متوسط‌عیار (Medium-Grade Ore)';
      economicClass = 'خوراک خط ۲ خردایش و اختلاط همگن‌سازی';
      defaultRockType = 'هماتیت-مگنتیت متراکم';
      defaultOreType = 'هماتیت / مگنتیت';
    } else {
      gradeCategory = 'HIGH';
      materialClass = 'سنگ‌آهن پرعیار مستقیم (High-Grade DSO)';
      economicClass = 'خوراک مستقیم ممتاز خط ۱ سنگ‌شکن و دپوی پرعیار';
      defaultRockType = 'مگنتیت پرعیار توده‌ای';
      defaultOreType = 'مگنتیت غنی';
    }

    const contaminants = {
      highPhosphorus: p > 0.15,
      highSulfur: s > 0.20,
      highSilica: sio2 > 10.0,
    };

    let notes = manualOverrides?.notes || '';
    if (contaminants.highPhosphorus) notes += ' [هشدار فسفر بالا: P > 0.15%]';
    if (contaminants.highSulfur) notes += ' [هشدار گوگرد بالا: S > 0.20%]';
    if (contaminants.highSilica) notes += ' [سیلیس بالا: SiO2 > 10%]';

    const now = new Date().toISOString();
    const historyEntry: SubBlockStatusHistory = {
      status: 'CLASSIFICATION_DONE',
      changedAt: now,
      changedBy,
      note: `طبقه‌بندی انجام شد: ${materialClass} (${gradeCategory})`,
      duration: this.calculateDuration(subBlock),
    };

    const updated: SubBlock = {
      ...subBlock,
      materialClass,
      rockType: manualOverrides?.rockType || defaultRockType,
      oreType: manualOverrides?.oreType || defaultOreType,
      gradeCategory,
      economicClass,
      isWaste,
      wasteType,
      contaminants,
      classificationNotes: notes.trim(),
      classifiedAt: now,
      classifiedBy: changedBy,
      status: 'CLASSIFICATION_DONE',
      statusHistory: [...(subBlock.statusHistory || []), historyEntry],
      updatedAt: now,
      version: (subBlock.version || 0) + 1,
    };

    SubBlockRepository.save(updated);
    ActivityLogger.logSubBlockAction('CLASSIFICATION', updated, undefined, { materialClass, gradeCategory });
    return updated;
  }

  // ============================================
  // ۵. تعیین مقصد و تخصیص استراتژیک
  // ============================================

  static assignDestination(
    subBlockId: string,
    data: {
      destination: DestinationType;
      destinationReason: string;
      destinationApprovedBy?: string;
      alternativeDestinations?: DestinationType[];
      changedBy: string;
    }
  ): SubBlock | null {
    const subBlock = SubBlockRepository.getById(subBlockId);
    if (!subBlock) return null;

    const now = new Date().toISOString();
    const historyEntry: SubBlockStatusHistory = {
      status: 'DESTINATION_APPROVED',
      changedAt: now,
      changedBy: data.changedBy,
      note: `تعیین و تأیید مقصد: ${SUB_BLOCK_STATUS_LABELS[data.destination as any] || data.destination} - دلیل: ${data.destinationReason}`,
      duration: this.calculateDuration(subBlock),
    };

    const updated: SubBlock = {
      ...subBlock,
      destination: data.destination,
      destinationReason: data.destinationReason,
      destinationApprovedBy: data.destinationApprovedBy || data.changedBy,
      destinationApprovedAt: now,
      alternativeDestinations: data.alternativeDestinations || [],
      status: 'DESTINATION_APPROVED',
      statusHistory: [...(subBlock.statusHistory || []), historyEntry],
      updatedAt: now,
      version: (subBlock.version || 0) + 1,
    };

    SubBlockRepository.save(updated);
    ActivityLogger.logSubBlockAction('DESTINATION', updated, undefined, data);
    return updated;
  }

  // ============================================
  // ۶. ثبت بارگیری، حمل و دیسپاچینگ
  // ============================================

  static recordLoadingAndHaulage(
    subBlockId: string,
    data: {
      truckCount: number;
      tonnage: number;
      loaderId?: string;
      truckId?: string;
      driver?: string;
      dumpId?: string;
      distance?: number;
      scaleTicketNumber?: string;
      operator?: string;
      changedBy: string;
    }
  ): SubBlock | null {
    const subBlock = SubBlockRepository.getById(subBlockId);
    if (!subBlock) return null;

    const now = new Date().toISOString();
    const historyEntry: SubBlockStatusHistory = {
      status: 'DELIVERED',
      changedAt: now,
      changedBy: data.changedBy,
      note: `بارگیری و حمل ${data.tonnage.toLocaleString()} تن با ${data.truckCount} سرویس دامپتراک به مقصد`,
      duration: this.calculateDuration(subBlock),
    };

    const updated: SubBlock = {
      ...subBlock,
      loadingData: {
        truckCount: data.truckCount,
        tonnage: data.tonnage,
        dumpId: data.dumpId || subBlock.destination || '',
        loaderId: data.loaderId || 'لودر کوماتسو WA600',
        loadingStartAt: now,
        loadingCompletedAt: now,
        operator: data.operator || data.changedBy,
      },
      transportData: {
        truckId: data.truckId || 'دامپتراک ۱۰۰ تن HD785',
        driver: data.driver || 'راننده شیفت',
        departureAt: now,
        arrivalAt: now,
        distance: data.distance || 3.8,
        scaleTicketNumber: data.scaleTicketNumber || `TIC-${Date.now().toString().slice(-6)}`,
      },
      deliveredTo: data.dumpId || subBlock.destination,
      deliveredAt: now,
      status: 'DELIVERED',
      statusHistory: [...(subBlock.statusHistory || []), historyEntry],
      updatedAt: now,
      version: (subBlock.version || 0) + 1,
    };

    SubBlockRepository.save(updated);
    return updated;
  }

  // ============================================
  // ۷. مصرف در خطوط خردایش و دانه‌بندی (Crushing Consumption)
  // ============================================

  static consumeInCrusher(
    subBlockId: string,
    data: {
      crusherLine: 'CRUSHER_LINE_1' | 'CRUSHER_LINE_2' | 'CRUSHER_FEED' | string;
      lineName?: string;
      feedTonnage: number;
      feedRateTph?: number;
      inputFeGrade?: number;
      productLumpTonnage?: number;
      productLumpGrade?: number;
      productFinesTonnage?: number;
      productFinesGrade?: number;
      tailingsTonnage?: number;
      recoveryPercentage?: number;
      operator?: string;
      shift?: 'MORNING' | 'EVENING' | 'NIGHT';
      notes?: string;
      changedBy: string;
    }
  ): SubBlock | null {
    const subBlock = SubBlockRepository.getById(subBlockId);
    if (!subBlock) return null;

    const now = new Date().toISOString();
    const inputFe = data.inputFeGrade || subBlock.labResults?.fe || 54;
    const feedTon = data.feedTonnage || subBlock.tonnage || 3000;
    
    // محاسبه خودکار بالانس جرمی و دانه‌بندی در صورت خالی بودن
    const lumpTon = data.productLumpTonnage ?? Math.round(feedTon * 0.55);
    const finesTon = data.productFinesTonnage ?? Math.round(feedTon * 0.38);
    const tailTon = data.tailingsTonnage ?? Math.max(0, feedTon - lumpTon - finesTon);
    const lumpGrade = data.productLumpGrade ?? Number((inputFe + 1.2).toFixed(2));
    const finesGrade = data.productFinesGrade ?? Number((inputFe + 0.8).toFixed(2));
    const recovery = data.recoveryPercentage ?? Number((((lumpTon * lumpGrade + finesTon * finesGrade) / (feedTon * inputFe)) * 100).toFixed(1));

    const lineLabel = data.crusherLine === 'CRUSHER_LINE_1' 
      ? 'خط ۱ خردایش (سنگ‌شکن فکی اولیه)' 
      : data.crusherLine === 'CRUSHER_LINE_2' 
      ? 'خط ۲ خردایش (سنگ‌شکن هیدروکن ثانویه)' 
      : 'مدار خردایش مجتمع';

    const historyEntry: SubBlockStatusHistory = {
      status: 'FINAL_PRODUCT',
      changedAt: now,
      changedBy: data.changedBy,
      note: `مصرف در ${lineLabel}: ${feedTon.toLocaleString()} تن خوراک | تولید ${lumpTon.toLocaleString()} تن کلوخه (Fe=${lumpGrade}%) و ${finesTon.toLocaleString()} تن نرمه (Fe=${finesGrade}%)`,
      duration: this.calculateDuration(subBlock),
    };

    const updated: SubBlock = {
      ...subBlock,
      crusherFeedData: {
        crusherLine: data.crusherLine,
        lineName: lineLabel,
        feedDate: now.split('T')[0],
        feedTonnage: feedTon,
        feedRateTph: data.feedRateTph || 350,
        inputFeGrade: inputFe,
        productLumpTonnage: lumpTon,
        productLumpGrade: lumpGrade,
        productFinesTonnage: finesTon,
        productFinesGrade: finesGrade,
        tailingsTonnage: tailTon,
        recoveryPercentage: recovery,
        operator: data.operator || 'اپراتور اتاق کنترل خردایش',
        shift: data.shift || 'MORNING',
        notes: data.notes || 'فرآیند خردایش و سرند با راندمان مطلوب انجام شد',
      },
      finalProduct: {
        id: crypto.randomUUID(),
        productName: `سنگ‌آهن دانه‌بندی شده (${subBlock.code})`,
        grade: lumpGrade,
        quantity: lumpTon + finesTon,
        unit: 'TON',
        quality: lumpGrade >= 60 ? 'HIGH' : lumpGrade >= 52 ? 'MEDIUM' : 'LOW',
        soldDate: now,
      },
      status: 'FINAL_PRODUCT',
      statusHistory: [...(subBlock.statusHistory || []), historyEntry],
      updatedAt: now,
      version: (subBlock.version || 0) + 1,
    };

    SubBlockRepository.save(updated);
    ActivityLogger.logSubBlockAction('CRUSHER', updated, undefined, updated.crusherFeedData);
    return updated;
  }
  
  // ============================================
  // انتقال به وضعیت جدید
  // ============================================

  static transitionStatus(
    subBlock: SubBlock,
    newStatus: SubBlockStatus,
    changedBy: string,
    note?: string
  ): SubBlock | null {
    // بررسی آیا انتقال مجاز است
    const allowedTransitions = STATUS_TRANSITIONS[subBlock.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      console.error(`❌ انتقال غیرمجاز: از ${subBlock.status} به ${newStatus}`);
      console.log(`📋 انتقال‌های مجاز: ${allowedTransitions.join(', ')}`);
      return null;
    }

    // ایجاد تاریخچه
    const historyEntry: SubBlockStatusHistory = {
      status: newStatus,
      changedAt: new Date().toISOString(),
      changedBy,
      note,
      duration: this.calculateDuration(subBlock),
    };

    // به‌روزرسانی ساب‌بلوک
    const updatedSubBlock: SubBlock = {
      ...subBlock,
      status: newStatus,
      statusHistory: [...(subBlock.statusHistory || []), historyEntry],
      updatedAt: new Date().toISOString(),
      version: (subBlock.version || 0) + 1,
    };

    // ذخیره در دیتابیس
    SubBlockRepository.save(updatedSubBlock);
    
    console.log(`✅ وضعیت ساب‌بلوک ${subBlock.code} از ${subBlock.status} به ${newStatus} تغییر کرد`);
    
    return updatedSubBlock;
  }

  // ============================================
  // محاسبه مدت زمان در هر وضعیت
  // ============================================

  private static calculateDuration(subBlock: SubBlock): number {
    if (!subBlock.statusHistory || subBlock.statusHistory.length === 0) {
      return 0;
    }
    
    const lastHistory = subBlock.statusHistory[subBlock.statusHistory.length - 1];
    if (!lastHistory) return 0;
    
    const startTime = new Date(lastHistory.changedAt).getTime();
    const endTime = new Date().getTime();
    
    return Math.floor((endTime - startTime) / 60000); // بازگشت به دقیقه
  }

  // ============================================
  // دریافت وضعیت فعلی و اطلاعات پیشرفت
  // ============================================

  static getProgress(subBlock: SubBlock): {
    currentPhase: string;
    phaseIndex: number;
    totalPhases: number;
    percentComplete: number;
    isComplete: boolean;
    nextStatuses: SubBlockStatus[];
  } {
    const allPhases = ['DEFINITION', 'SAMPLING', 'LABORATORY', 'CLASSIFICATION', 'DECISION', 'EXECUTION', 'PROCESSING', 'FINAL'];
    const currentPhase = this.getPhase(subBlock.status);
    const phaseIndex = allPhases.indexOf(currentPhase);
    const totalPhases = allPhases.length;
    
    return {
      currentPhase,
      phaseIndex: phaseIndex + 1,
      totalPhases,
      percentComplete: Math.round(((phaseIndex + 1) / totalPhases) * 100),
      isComplete: isFinalStatus(subBlock.status),
      nextStatuses: STATUS_TRANSITIONS[subBlock.status] || [],
    };
  }

  // ============================================
  // دریافت فاز وضعیت
  // ============================================

  static getPhase(status: SubBlockStatus): string {
    const phaseMap: Record<SubBlockStatus, string> = {
      'DEFINED': 'DEFINITION',
      'SUB_BLOCKED': 'DEFINITION',
      'SAMPLING_REQUESTED': 'SAMPLING',
      'SAMPLING_SCHEDULED': 'SAMPLING',
      'SAMPLING_IN_PROGRESS': 'SAMPLING',
      'SAMPLING_COMPLETED': 'SAMPLING',
      'LAB_SENT': 'LABORATORY',
      'LAB_IN_PROGRESS': 'LABORATORY',
      'LAB_COMPLETED': 'LABORATORY',
      'CLASSIFICATION_PENDING': 'CLASSIFICATION',
      'CLASSIFICATION_DONE': 'CLASSIFICATION',
      'DESTINATION_PENDING': 'DECISION',
      'DESTINATION_APPROVED': 'DECISION',
      'LOADING_IN_PROGRESS': 'EXECUTION',
      'LOADING_COMPLETED': 'EXECUTION',
      'TRANSPORTING': 'EXECUTION',
      'DELIVERED': 'EXECUTION',
      'PROCESSING': 'PROCESSING',
      'BENEFICIATION': 'PROCESSING',
      'SIZING': 'PROCESSING',
      'FINAL_PRODUCT': 'FINAL',
      'SOLD': 'FINAL',
      'COMPLETED': 'FINAL',
    };
    return phaseMap[status] || 'DEFINITION';
  }

  // ============================================
  // دریافت برچسب وضعیت
  // ============================================

  static getStatusLabel(status: SubBlockStatus): string {
    return SUB_BLOCK_STATUS_LABELS[status] || status;
  }

  // ============================================
  // دریافت تاریخچه‌ی کامل
  // ============================================

  static getFullHistory(subBlock: SubBlock): SubBlockStatusHistory[] {
    return subBlock.statusHistory || [];
  }

  // ============================================
  // بررسی آیا وضعیت قابل تغییر است
  // ============================================

  static canTransition(subBlock: SubBlock, newStatus: SubBlockStatus): boolean {
    if (isFinalStatus(subBlock.status)) {
      return false;
    }
    const allowedTransitions = STATUS_TRANSITIONS[subBlock.status] || [];
    return allowedTransitions.includes(newStatus);
  }

  // ============================================
  // دریافت زمان سپری شده در وضعیت فعلی
  // ============================================

  static getTimeInCurrentStatus(subBlock: SubBlock): number {
    if (!subBlock.statusHistory || subBlock.statusHistory.length === 0) {
      return 0;
    }
    
    const lastHistory = subBlock.statusHistory[subBlock.statusHistory.length - 1];
    if (!lastHistory) return 0;
    
    const startTime = new Date(lastHistory.changedAt).getTime();
    const endTime = new Date().getTime();
    
    return Math.floor((endTime - startTime) / 60000); // دقیقه
  }

  // ============================================
  // دریافت رنگ وضعیت
  // ============================================

  static getStatusColor(status: SubBlockStatus): string {
    const colorMap: Record<SubBlockStatus, string> = {
      'DEFINED': '#6B7280',
      'SUB_BLOCKED': '#6B7280',
      'SAMPLING_REQUESTED': '#F59E0B',
      'SAMPLING_SCHEDULED': '#F59E0B',
      'SAMPLING_IN_PROGRESS': '#F59E0B',
      'SAMPLING_COMPLETED': '#F59E0B',
      'LAB_SENT': '#8B5CF6',
      'LAB_IN_PROGRESS': '#8B5CF6',
      'LAB_COMPLETED': '#8B5CF6',
      'CLASSIFICATION_PENDING': '#3B82F6',
      'CLASSIFICATION_DONE': '#3B82F6',
      'DESTINATION_PENDING': '#06B6D4',
      'DESTINATION_APPROVED': '#06B6D4',
      'LOADING_IN_PROGRESS': '#F97316',
      'LOADING_COMPLETED': '#F97316',
      'TRANSPORTING': '#F97316',
      'DELIVERED': '#F97316',
      'PROCESSING': '#EC4899',
      'BENEFICIATION': '#EC4899',
      'SIZING': '#EC4899',
      'FINAL_PRODUCT': '#22C55E',
      'SOLD': '#22C55E',
      'COMPLETED': '#22C55E',
    };
    return colorMap[status] || '#6B7280';
  }
}