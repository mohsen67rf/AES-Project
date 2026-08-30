// src/modules/mine/services/StockpileService.ts

import { 
  StockpileRepository, 
  HaulageTripRepository, 
  SubBlockRepository, 
  AuditLogRepository 
} from '../../../core/infrastructure/repositories';
import type { Stockpile, HaulageTrip } from '../../../core/domain/types/mine.types';

export class StockpileService {
  /**
   * دریافت تمام دپوها همراه با آخرین محاسبات دینامیک
   */
  static getAllStockpiles(): Stockpile[] {
    this.recalculateAllStockpiles();
    return StockpileRepository.getAll();
  }

  /**
   * دریافت دپو با شناسه
   */
  static getStockpileById(id: string): Stockpile | null {
    this.recalculateStockpile(id);
    return StockpileRepository.getById(id);
  }

  /**
   * ثبت سرویس‌های حمل ماشین‌آلات (برآورد تناژ با تعداد سرویس * میانگین تناژ ناوگان)
   * پشتیبانی از تراک‌های ۱۰۰ تنی، ۶۰ تنی، ۳۵ تنی و کامیون ۱۵ تنی
   */
  static recordHaulageTrip(params: {
    subBlockId: string;
    stockpileId: string;
    truckType: 'TRUCK_100T' | 'TRUCK_60T' | 'TRUCK_35T' | 'TRUCK_15T' | 'CUSTOM';
    nominalCapacity?: number;
    tripCount: number;
    loaderId: string;
    shift: 'MORNING' | 'EVENING' | 'NIGHT';
    recordedBy: string;
    notes?: string;
  }): HaulageTrip {
    const subBlock = SubBlockRepository.getById(params.subBlockId);
    const stockpile = StockpileRepository.getById(params.stockpileId);

    if (!subBlock) throw new Error('ساب‌بلوک یافت نشد');
    if (!stockpile) throw new Error('دپوی مورد نظر یافت نشد');

    // تعیین ظرفیت میانگین ناوگان حمل
    let capacity = params.nominalCapacity;
    if (!capacity) {
      switch (params.truckType) {
        case 'TRUCK_100T': capacity = 100; break;
        case 'TRUCK_60T': capacity = 60; break;
        case 'TRUCK_35T': capacity = 35; break;
        case 'TRUCK_15T': capacity = 15; break;
        default: capacity = 50;
      }
    }

    const calculatedTonnage = params.tripCount * capacity;

    const trip: HaulageTrip = {
      id: crypto.randomUUID(),
      subBlockId: subBlock.id,
      subBlockCode: subBlock.code,
      stockpileId: stockpile.id,
      stockpileName: stockpile.name,
      truckType: params.truckType,
      nominalCapacity: capacity,
      tripCount: params.tripCount,
      calculatedTonnage,
      loaderId: params.loaderId,
      shift: params.shift,
      recordedBy: params.recordedBy,
      timestamp: new Date().toISOString(),
      notes: params.notes || `تخلیه ${params.tripCount} سرویس ناوگان ${capacity} تنی از ساب‌بلوک ${subBlock.code}`,
    };

    HaulageTripRepository.save(trip);

    // به‌روزرسانی اطلاعات بارگیری ساب‌بلوک
    const currentTrucks = subBlock.loadingData?.truckCount || 0;
    const currentTonnage = subBlock.loadingData?.tonnage || 0;

    subBlock.loadingData = {
      truckCount: currentTrucks + params.tripCount,
      tonnage: currentTonnage + calculatedTonnage,
      loaderId: params.loaderId,
      dumpId: stockpile.code,
      loadingCompletedAt: new Date().toISOString(),
      operator: params.recordedBy,
    };
    SubBlockRepository.save(subBlock);

    // بازمحاسبه دینامیک دپو
    this.recalculateStockpile(stockpile.id);

    // ثبت در لاگ ممیزی
    AuditLogRepository.save({
      id: crypto.randomUUID(),
      entityType: 'SUB_BLOCK',
      entityId: subBlock.id,
      entityCode: subBlock.code,
      action: 'UPDATED',
      changedBy: params.recordedBy,
      changedByName: params.recordedBy,
      changedAt: new Date().toISOString(),
      description: `ثبت ${params.tripCount} سرویس (${calculatedTonnage.toLocaleString()} تن) حمل به دپوی ${stockpile.name}`,
      version: 1,
    });

    return trip;
  }

  /**
   * ثبت بارگیری و کسر از موجودی دپو جهت تغذیه خطوط سنگ‌شکن
   */
  static recordCrusherFeedOutflow(params: {
    stockpileId: string;
    tonnage: number;
    crusherLine: string;
    operator: string;
    notes?: string;
  }): Stockpile {
    const stockpile = StockpileRepository.getById(params.stockpileId);
    if (!stockpile) throw new Error('دپوی مورد نظر یافت نشد');

    if (stockpile.currentTonnage < params.tonnage) {
      console.warn(`هشدار: تناژ درخواستی (${params.tonnage}) بیشتر از موجودی دپو (${stockpile.currentTonnage}) است.`);
    }

    stockpile.totalOutflowTonnage = (stockpile.totalOutflowTonnage || 0) + params.tonnage;
    stockpile.currentTonnage = Math.max(0, (stockpile.initialTonnage + (stockpile.totalInflowTonnage || 0)) - stockpile.totalOutflowTonnage);
    stockpile.lastUpdated = new Date().toISOString();

    StockpileRepository.save(stockpile);

    AuditLogRepository.save({
      id: crypto.randomUUID(),
      entityType: 'DESTINATION_DECISION',
      entityId: stockpile.id,
      entityCode: stockpile.code,
      action: 'STATUS_CHANGED',
      changedBy: params.operator,
      changedByName: params.operator,
      changedAt: new Date().toISOString(),
      description: `برداشت ${params.tonnage.toLocaleString()} تن از دپوی ${stockpile.name} جهت تغذیه ${params.crusherLine}`,
      version: 1,
    });

    return stockpile;
  }

  /**
   * محاسبه دقیق و پویای موجودی و عیار متوسط وزنی دپو بر اساس ساب‌بلوک‌ها و سرویس‌های تخلیه‌شده
   */
  static recalculateStockpile(stockpileId: string): void {
    const stockpile = StockpileRepository.getById(stockpileId);
    if (!stockpile) return;

    const trips = HaulageTripRepository.findBy('stockpileId', stockpileId);
    const totalInflow = trips.reduce((sum, t) => sum + (t.calculatedTonnage || 0), 0);

    // محاسبه عیار میانگین وزنی
    let weightedFeSum = (stockpile.initialTonnage || 0) * (stockpile.weightedAvgFe || 55);
    let totalAssayedTonnage = stockpile.initialTonnage || 0;

    const subBlockIds = Array.from(new Set(trips.map(t => t.subBlockId)));

    for (const sbId of subBlockIds) {
      const sb = SubBlockRepository.getById(sbId);
      const sbTrips = trips.filter(t => t.subBlockId === sbId);
      const sbTonnage = sbTrips.reduce((sum, t) => sum + (t.calculatedTonnage || 0), 0);

      if (sb && sb.labResults?.fe) {
        weightedFeSum += sbTonnage * sb.labResults.fe;
        totalAssayedTonnage += sbTonnage;
      }
    }

    const calculatedAvgFe = totalAssayedTonnage > 0 ? (weightedFeSum / totalAssayedTonnage) : stockpile.weightedAvgFe;

    const initial = stockpile.initialTonnage || 0;
    const outflow = stockpile.totalOutflowTonnage || 0;
    const current = Math.max(0, initial + totalInflow - outflow);

    stockpile.totalInflowTonnage = totalInflow;
    stockpile.currentTonnage = current;
    stockpile.weightedAvgFe = Number(calculatedAvgFe.toFixed(2));
    stockpile.activeSubBlocksCount = subBlockIds.length;
    stockpile.lastUpdated = new Date().toISOString();

    StockpileRepository.save(stockpile);
  }

  /**
   * بازمحاسبه همه دپوها
   */
  static recalculateAllStockpiles(): void {
    const stockpiles = StockpileRepository.getAll();
    for (const st of stockpiles) {
      this.recalculateStockpile(st.id);
    }
  }

  /**
   * دریافت تمام لاگ‌های سرویس‌های حمل
   */
  static getAllHaulageTrips(): HaulageTrip[] {
    return HaulageTripRepository.getAll().sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
