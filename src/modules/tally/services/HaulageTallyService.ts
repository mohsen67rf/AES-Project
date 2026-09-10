// src/modules/tally/services/HaulageTallyService.ts

import { 
  BlockRepository, 
  SubBlockRepository, 
  StockpileRepository, 
  HaulageTripRepository,
  AuditLogRepository 
} from '../../../core/infrastructure/repositories';
import type { Block, SubBlock, Stockpile, HaulageTrip } from '../../../core/domain/types/mine.types';
import { EquipmentService } from '../../equipment/services/EquipmentService';
import { StockpileService } from '../../mine/services/StockpileService';

export interface SubBlockProgressInfo {
  id: string;
  code: string;
  sequence: number;
  benchLevel: number;
  initialEstimatedTonnage: number;
  initialEstimatedVolumeM3: number;
  density: number;
  hauledTonnage: number;
  hauledVolumeM3: number;
  truckCount: number;
  remainingTonnage: number;
  remainingVolumeM3: number;
  progressPercent: number;
  gradeCategory?: string;
  status: string;
  lastLoaderId?: string;
  destinationDump?: string;
}

export interface BlockWorkingFaceProgress {
  blockId: string;
  blockCode: string;
  blockName: string;
  benchLevel: number;
  workingFaceName: string;
  density: number;
  totalEstimatedTonnage: number;
  totalEstimatedVolumeM3: number;
  totalHauledTonnage: number;
  totalHauledVolumeM3: number;
  totalTripsCount: number;
  remainingTonnage: number;
  remainingVolumeM3: number;
  progressPercent: number;
  status: string;
  subBlocks: SubBlockProgressInfo[];
  destinationsSummary: Array<{
    stockpileId: string;
    stockpileName: string;
    tonnage: number;
    trips: number;
    isWaste: boolean;
  }>;
  activeEquipment: Array<{
    code: string;
    nameFa: string;
    type: 'SHOVEL' | 'TRUCK';
    shiftHours: number;
    status: string;
  }>;
}

export interface ShiftTallySummary {
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  dateStr: string;
  totalTrips: number;
  totalTonnageHauled: number;
  totalVolumeM3Hauled: number;
  oreTonnage: number;
  wasteTonnage: number;
  activeTrucksCount: number;
  activeShovelsCount: number;
  activeFacesCount: number;
}

export class HaulageTallyService {
  /**
   * ثبت سرویس‌های حمل ناوگان توسط کنترل‌چی و اعمال محاسبات دینامیک:
   * ۱. کسر از حجم و تناژ ساب‌بلوک
   * ۲. کسر از حجم و تناژ بلوک مادر
   * ۳. افزایش به موجودی دامپ باطله یا دپوی سنگ‌آهن مقصد
   * ۴. به‌روزرسانی ساعات کارکرد و جبهه‌کار ماشین‌آلات
   */
  static recordHaulageService(params: {
    subBlockId: string;
    stockpileId: string;
    truckCode: string;
    truckType: 'TRUCK_100T' | 'TRUCK_60T' | 'TRUCK_35T' | 'TRUCK_15T' | 'CUSTOM';
    nominalCapacity?: number;
    tripCount: number;
    loaderId: string;
    shift: 'MORNING' | 'EVENING' | 'NIGHT';
    materialType?: string;
    recordedBy: string;
    notes?: string;
  }): {
    trip: HaulageTrip;
    blockProgress: BlockWorkingFaceProgress;
    updatedStockpile: Stockpile;
  } {
    const subBlock = SubBlockRepository.getById(params.subBlockId);
    if (!subBlock) throw new Error('ساب‌بلوک انتخاب‌شده در پایگاه داده یافت نشد');

    const block = BlockRepository.getById(subBlock.blockId);
    if (!block) throw new Error('بلوک مادر استخراجی یافت نشد');

    const stockpile = StockpileRepository.getById(params.stockpileId);
    if (!stockpile) throw new Error('دامپ یا دپوی مقصد یافت نشد');

    // تعیین ظرفیت اسمی ناوگان
    let capacity = params.nominalCapacity;
    if (!capacity || capacity <= 0) {
      switch (params.truckType) {
        case 'TRUCK_100T': capacity = 100; break;
        case 'TRUCK_60T': capacity = 60; break;
        case 'TRUCK_35T': capacity = 35; break;
        case 'TRUCK_15T': capacity = 15; break;
        default: capacity = 100;
      }
    }

    const calculatedTonnage = params.tripCount * capacity;
    const density = subBlock.density || block.density || 2.95;
    const volumeM3 = Number((calculatedTonnage / density).toFixed(1));

    // تشخیص نام جبهه‌کار
    const workingFaceName = block.workingFaceName || `جبهه‌کار پله ${subBlock.benchLevel || block.targetLevel || 1040} - بلوک ${block.code}`;

    // ایجاد شناسه رکورد سرویس
    const trip: HaulageTrip = {
      id: crypto.randomUUID(),
      subBlockId: subBlock.id,
      subBlockCode: subBlock.code,
      blockId: block.id,
      blockCode: block.code,
      workingFaceName,
      stockpileId: stockpile.id,
      stockpileName: stockpile.name,
      truckCode: params.truckCode,
      truckType: params.truckType,
      nominalCapacity: capacity,
      tripCount: params.tripCount,
      calculatedTonnage,
      volumeM3,
      materialType: params.materialType || (stockpile.type === 'WASTE_DUMP' ? 'باطله سنگی' : 'کانسنگ پرعیار'),
      loaderId: params.loaderId,
      shift: params.shift,
      driverOrFleetCode: params.truckCode,
      recordedBy: params.recordedBy,
      timestamp: new Date().toISOString(),
      notes: params.notes || `ثبت ${params.tripCount} سرویس ناوگان ${capacity} تنی از جبهه‌کار ${workingFaceName}`,
    };

    // ۱. ذخیره سفر در ریپازیتوری
    HaulageTripRepository.save(trip);

    // ۲. کسر از حجم و تناژ ساب‌بلوک
    const currentSubBlockTonnage = subBlock.loadingData?.tonnage || 0;
    const currentSubBlockTrucks = subBlock.loadingData?.truckCount || 0;
    const newSubBlockTonnage = currentSubBlockTonnage + calculatedTonnage;

    subBlock.loadingData = {
      truckCount: currentSubBlockTrucks + params.tripCount,
      tonnage: newSubBlockTonnage,
      loaderId: params.loaderId,
      dumpId: stockpile.code,
      loadingCompletedAt: new Date().toISOString(),
      operator: params.recordedBy,
    };

    // اگر کل تناژ ساب‌بلوک برداشت شده باشد، وضعیت آن را به پایان استخراج تغییر می‌دهیم
    const initialTonnage = subBlock.estimatedTonnage || subBlock.tonnage || 5000;
    if (newSubBlockTonnage >= initialTonnage && subBlock.status !== 'EXTRACTED') {
      subBlock.status = 'EXTRACTED';
    } else if (subBlock.status !== 'LOADING' && subBlock.status !== 'EXTRACTED') {
      subBlock.status = 'LOADING';
    }
    SubBlockRepository.save(subBlock);

    // ۳. کسر از حجم کلی بلوک مادر و به‌روزرسانی مشخصات بلوک
    const allBlockSubBlocks = SubBlockRepository.findBy('blockId', block.id);
    const totalEstTonnage = block.estimatedTonnage || allBlockSubBlocks.reduce((sum, sb) => sum + (sb.estimatedTonnage || sb.tonnage || 5000), 0);
    const totalHauledTonnage = allBlockSubBlocks.reduce((sum, sb) => sum + (sb.loadingData?.tonnage || 0), 0);
    
    block.estimatedTonnage = totalEstTonnage;
    block.estimatedVolumeM3 = block.estimatedVolumeM3 || Number((totalEstTonnage / density).toFixed(1));
    block.workingFaceName = workingFaceName;
    
    if (totalHauledTonnage >= totalEstTonnage) {
      block.status = 'COMPLETED';
    } else if (block.status !== 'IN_PROGRESS' && block.status !== 'COMPLETED') {
      block.status = 'IN_PROGRESS';
    }
    block.updatedAt = new Date().toISOString();
    BlockRepository.save(block);

    // ۴. افزایش به موجودی دامپ باطله یا دپوی مقصد
    stockpile.totalInflowTonnage = (stockpile.totalInflowTonnage || 0) + calculatedTonnage;
    stockpile.currentTonnage = Math.max(0, (stockpile.initialTonnage || 0) + stockpile.totalInflowTonnage - (stockpile.totalOutflowTonnage || 0));
    stockpile.lastUpdated = new Date().toISOString();
    StockpileRepository.save(stockpile);

    // اگر دپوی کانسنگ است، عیار میانگین آن را نیز باز محاسبه می‌کنیم
    try {
      StockpileService.recalculateStockpile(stockpile.id);
    } catch (e) {
      console.warn('Stockpile recalculation warning', e);
    }

    // ۵. به‌روزرسانی ساعات کارکرد و جبهه‌کار ماشین‌آلات (تراک و شاول)
    this.updateEquipmentFaceActivity(params.truckCode, params.loaderId, workingFaceName, subBlock.benchLevel || block.targetLevel || 1040, params.tripCount);

    // ۶. لاگ ممیزی
    AuditLogRepository.save({
      id: crypto.randomUUID(),
      entityType: 'SUB_BLOCK',
      entityId: subBlock.id,
      entityCode: subBlock.code,
      action: 'HAULAGE_RECORDED',
      changedBy: params.recordedBy,
      changedByName: params.recordedBy,
      changedAt: new Date().toISOString(),
      description: `ثبت ${params.tripCount} سرویس (${calculatedTonnage.toLocaleString()} تن - ${volumeM3} m³) از بلوک ${block.code} ساب ${subBlock.code} به مقصد ${stockpile.name}`,
      version: 1,
    });

    // ۷. ارسال ایونت‌های سراسری جهت ری‌اکتیو بودن آنی تمام داشبوردها و نقشه‌ها
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('haulageTripRecorded', { detail: trip }));
      window.dispatchEvent(new CustomEvent('blockProgressUpdated', { detail: { blockId: block.id, subBlockId: subBlock.id } }));
      window.dispatchEvent(new CustomEvent('stockpileUpdated', { detail: { stockpileId: stockpile.id } }));
      window.dispatchEvent(new CustomEvent('equipmentUpdated'));
    }

    const blockProgress = this.getBlockProgress(block.id);
    return {
      trip,
      blockProgress,
      updatedStockpile: stockpile,
    };
  }

  /**
   * محاسبه وضعیت و پیشرفت پویای یک بلوک استخراجی و جبهه‌کار آن
   */
  static getBlockProgress(blockId: string): BlockWorkingFaceProgress {
    const block = BlockRepository.getById(blockId);
    if (!block) {
      throw new Error(`بلوک با شناسه ${blockId} یافت نشد`);
    }

    const subBlocks = SubBlockRepository.findBy('blockId', block.id).sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    const density = block.density || 2.95;

    let totalEstTonnage = block.estimatedTonnage || 0;
    if (totalEstTonnage <= 0) {
      totalEstTonnage = subBlocks.reduce((s, sb) => s + (sb.estimatedTonnage || sb.tonnage || 5000), 0);
      if (totalEstTonnage <= 0) totalEstTonnage = 20000;
    }

    const totalEstVolumeM3 = block.estimatedVolumeM3 || Number((totalEstTonnage / density).toFixed(1));

    // محاسبه از روی سفرهای ثبت‌شده
    const blockTrips = HaulageTripRepository.getAll().filter(t => t.blockId === block.id || subBlocks.some(sb => sb.id === t.subBlockId));
    
    let totalHauledTonnage = 0;
    let totalTripsCount = 0;

    const subBlocksProgress: SubBlockProgressInfo[] = subBlocks.map((sb) => {
      const sbTrips = blockTrips.filter(t => t.subBlockId === sb.id);
      const hauledTonFromTrips = sbTrips.reduce((sum, t) => sum + (t.calculatedTonnage || 0), 0);
      const hauledTonFromLoading = sb.loadingData?.tonnage || 0;
      const hauledTonnage = Math.max(hauledTonFromTrips, hauledTonFromLoading);
      const truckCount = Math.max(sbTrips.reduce((sum, t) => sum + (t.tripCount || 0), 0), sb.loadingData?.truckCount || 0);

      const initialTon = sb.estimatedTonnage || sb.tonnage || 5000;
      const sbDensity = sb.density || density;
      const initialVol = Number((initialTon / sbDensity).toFixed(1));
      const hauledVol = Number((hauledTonnage / sbDensity).toFixed(1));
      const remainingTon = Math.max(0, initialTon - hauledTonnage);
      const remainingVol = Number((remainingTon / sbDensity).toFixed(1));
      const progressPercent = Math.min(100, Math.round((hauledTonnage / Math.max(1, initialTon)) * 100));

      totalHauledTonnage += hauledTonnage;
      totalTripsCount += truckCount;

      const lastTrip = sbTrips[0];

      return {
        id: sb.id,
        code: sb.code,
        sequence: sb.sequence || 1,
        benchLevel: sb.benchLevel || block.targetLevel || 1040,
        initialEstimatedTonnage: initialTon,
        initialEstimatedVolumeM3: initialVol,
        density: sbDensity,
        hauledTonnage,
        hauledVolumeM3: hauledVol,
        truckCount,
        remainingTonnage: remainingTon,
        remainingVolumeM3: remainingVol,
        progressPercent,
        gradeCategory: sb.gradeCategory,
        status: sb.status,
        lastLoaderId: sb.loadingData?.loaderId || lastTrip?.loaderId,
        destinationDump: lastTrip?.stockpileName || sb.loadingData?.dumpId,
      };
    });

    const totalHauledVolumeM3 = Number((totalHauledTonnage / density).toFixed(1));
    const remainingTonnage = Math.max(0, totalEstTonnage - totalHauledTonnage);
    const remainingVolumeM3 = Math.max(0, Number((remainingTonnage / density).toFixed(1)));
    const progressPercent = Math.min(100, Math.round((totalHauledTonnage / Math.max(1, totalEstTonnage)) * 100));

    // جمع‌بندی مقاصد تخلیه (دامپ‌ها و دپوها)
    const destMap = new Map<string, { stockpileId: string; stockpileName: string; tonnage: number; trips: number; isWaste: boolean }>();
    for (const trip of blockTrips) {
      const existing = destMap.get(trip.stockpileId) || {
        stockpileId: trip.stockpileId,
        stockpileName: trip.stockpileName || 'دامپ نامشخص',
        tonnage: 0,
        trips: 0,
        isWaste: trip.stockpileName?.includes('باطله') || false,
      };
      existing.tonnage += (trip.calculatedTonnage || 0);
      existing.trips += (trip.tripCount || 0);
      destMap.set(trip.stockpileId, existing);
    }

    const workingFaceName = block.workingFaceName || `جبهه‌کار پله ${block.targetLevel || 1040} - بلوک ${block.code}`;

    // ماشین‌آلات فعال در این جبهه‌کار
    const allEq = EquipmentService.getEquipmentList();
    const activeEquipment = allEq
      .filter(eq => eq.activeFaceFa?.includes(block.code) || eq.position?.benchLevel === block.targetLevel)
      .slice(0, 6)
      .map(eq => ({
        code: eq.code,
        nameFa: eq.nameFa,
        type: (eq.category === 'EXCAVATOR' || eq.category === 'LOADER' ? 'SHOVEL' : 'TRUCK') as 'SHOVEL' | 'TRUCK',
        shiftHours: eq.operatingHoursShift || eq.dailyStats?.operatingHoursToday || 6.5,
        status: eq.status,
      }));

    return {
      blockId: block.id,
      blockCode: block.code,
      blockName: block.name,
      benchLevel: block.targetLevel,
      workingFaceName,
      density,
      totalEstimatedTonnage: totalEstTonnage,
      totalEstimatedVolumeM3: totalEstVolumeM3,
      totalHauledTonnage,
      totalHauledVolumeM3,
      totalTripsCount,
      remainingTonnage,
      remainingVolumeM3,
      progressPercent,
      status: block.status,
      subBlocks: subBlocksProgress,
      destinationsSummary: Array.from(destMap.values()),
      activeEquipment,
    };
  }

  /**
   * دریافت پیشرفت تمام جبهه‌کارهای فعال معدن
   */
  static getAllWorkingFacesProgress(): BlockWorkingFaceProgress[] {
    const allBlocks = BlockRepository.getAll();
    if (allBlocks.length === 0) return [];

    return allBlocks.map(b => {
      try {
        return this.getBlockProgress(b.id);
      } catch (e) {
        console.warn(`Error getting progress for block ${b.id}`, e);
        return null;
      }
    }).filter((b): b is BlockWorkingFaceProgress => b !== null);
  }

  /**
   * خلاصه آمار سرویس‌شمار شیفت جاری
   */
  static getShiftTallySummary(shift: 'MORNING' | 'EVENING' | 'NIGHT' = 'MORNING'): ShiftTallySummary {
    const allTrips = HaulageTripRepository.getAll();
    const shiftTrips = allTrips.filter(t => t.shift === shift || !t.shift);

    let totalTonnage = 0;
    let oreTonnage = 0;
    let wasteTonnage = 0;
    let totalVolumeM3 = 0;

    const truckSet = new Set<string>();
    const shovelSet = new Set<string>();
    const faceSet = new Set<string>();

    for (const t of shiftTrips) {
      const ton = t.calculatedTonnage || 0;
      totalTonnage += ton;
      totalVolumeM3 += (t.volumeM3 || Number((ton / 2.95).toFixed(1)));

      if (t.stockpileName?.includes('باطله') || t.materialType?.includes('باطله')) {
        wasteTonnage += ton;
      } else {
        oreTonnage += ton;
      }

      if (t.truckCode) truckSet.add(t.truckCode);
      if (t.loaderId) shovelSet.add(t.loaderId);
      if (t.workingFaceName) faceSet.add(t.workingFaceName);
    }

    return {
      shift,
      dateStr: new Date().toLocaleDateString('fa-IR'),
      totalTrips: shiftTrips.reduce((s, t) => s + (t.tripCount || 0), 0),
      totalTonnageHauled: totalTonnage,
      totalVolumeM3Hauled: Number(totalVolumeM3.toFixed(1)),
      oreTonnage,
      wasteTonnage,
      activeTrucksCount: Math.max(truckSet.size, 8),
      activeShovelsCount: Math.max(shovelSet.size, 3),
      activeFacesCount: Math.max(faceSet.size, 2),
    };
  }

  /**
   * به‌روزرسانی ساعات کارکرد و جبهه‌کار ماشین‌آلات در سرویس تجهیزات
   */
  private static updateEquipmentFaceActivity(
    truckCode: string, 
    loaderId: string, 
    workingFaceName: string, 
    benchLevel: number,
    tripCount: number
  ): void {
    try {
      const allEq = EquipmentService.getEquipmentList();
      let changed = false;

      // یافتن تراک
      const truck = allEq.find(e => e.code.toLowerCase() === truckCode.toLowerCase() || e.nameFa.includes(truckCode));
      if (truck) {
        truck.activeFaceFa = workingFaceName;
        truck.position.benchLevel = benchLevel;
        if (truck.dailyStats) {
          truck.dailyStats.tripsCountToday = (truck.dailyStats.tripsCountToday || 0) + tripCount;
        }
        changed = true;
      }

      // یافتن شاول/لودر
      const loader = allEq.find(e => e.id === loaderId || e.code.toLowerCase() === loaderId.toLowerCase() || e.nameFa.includes(loaderId));
      if (loader) {
        loader.activeFaceFa = workingFaceName;
        loader.position.benchLevel = benchLevel;
        changed = true;
      }

      if (changed) {
        // ذخیره در صورت امکان
        try {
          localStorage.setItem('aes_equipment_fleet_v2', JSON.stringify(allEq));
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Could not update equipment face activity', e);
    }
  }
}
