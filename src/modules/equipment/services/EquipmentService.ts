// src/modules/equipment/services/EquipmentService.ts

import { 
  EquipmentItem, 
  EquipmentPosition, 
  EquipmentStatus, 
  MineMapZone
} from '../domain/types/equipment.types';

const STORAGE_KEY = 'aes_equipment_fleet_v4';
const LAST_POSITION_AUDIT_KEY = 'aes_equipment_placement_audit_v4';

// جبهه کارهای استخراج و بارگیری جهت ثبت در فرم‌ها و سوابق فعالیت ماشین‌آلات
export const MINE_MAP_ZONES: MineMapZone[] = [
  {
    id: 'zone-pit-main',
    nameFa: 'جبهه کار پیت اصلی استخراج',
    nameEn: 'Main Extraction Pit Face',
    benchLevel: 1420,
    type: 'PIT',
    bounds: { xMin: 20, xMax: 60, yMin: 25, yMax: 65 },
    color: '#F59E0B'
  },
  {
    id: 'zone-bench-east',
    nameFa: 'جبهه کار پله شرقی باطله',
    nameEn: 'East Waste Bench Face',
    benchLevel: 1440,
    type: 'PIT',
    bounds: { xMin: 62, xMax: 88, yMin: 20, yMax: 50 },
    color: '#38BDF8'
  },
  {
    id: 'zone-bench-north',
    nameFa: 'جبهه کار پله شمالی',
    nameEn: 'North Mining Bench Face',
    benchLevel: 1460,
    type: 'PIT',
    bounds: { xMin: 30, xMax: 65, yMin: 5, yMax: 22 },
    color: '#10B981'
  },
  {
    id: 'zone-crusher',
    nameFa: 'هاپر سنگ‌شکن اولیه',
    nameEn: 'Primary Crusher Hopper',
    benchLevel: 1480,
    type: 'CRUSHER',
    bounds: { xMin: 5, xMax: 18, yMin: 70, yMax: 88 },
    color: '#EC4899'
  },
  {
    id: 'zone-dump-waste',
    nameFa: 'دامپ باطله شماره ۱',
    nameEn: 'Waste Dump #1',
    benchLevel: 1450,
    type: 'DUMP',
    bounds: { xMin: 72, xMax: 95, yMin: 65, yMax: 92 },
    color: '#64748B'
  },
  {
    id: 'zone-stockpile-ore',
    nameFa: 'دپوی ماده معدنی عیار متوسط',
    nameEn: 'Medium-Grade Ore Stockpile',
    benchLevel: 1470,
    type: 'STOCKPILE',
    bounds: { xMin: 22, xMax: 42, yMin: 72, yMax: 92 },
    color: '#EAB308'
  },
  {
    id: 'zone-workshop',
    nameFa: 'توقفگاه و تعمیرگاه مرکزی',
    nameEn: 'Central Workshop & Maintenance',
    benchLevel: 1500,
    type: 'WORKSHOP',
    bounds: { xMin: 45, xMax: 68, yMin: 72, yMax: 92 },
    color: '#8B5CF6'
  }
];

export const INITIAL_EQUIPMENT_FLEET: EquipmentItem[] = [];

export interface EquipmentPlacementAuditLog {
  equipmentCode: string;
  equipmentName: string;
  zoneName: string;
  coordinates: string;
  benchLevel: number;
  updatedBy: string;
  timestamp: string;
}

export class EquipmentService {
  /**
   * دریافت لیست کلیه تجهیزات ناوگان
   */
  public static getEquipmentList(): EquipmentItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load equipment list from localStorage', e);
    }
    // مقداردهی اولیه
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EQUIPMENT_FLEET));
    return INITIAL_EQUIPMENT_FLEET;
  }

  /**
   * ذخیره کلیه تجهیزات
   */
  public static saveEquipmentList(items: EquipmentItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save equipment items', e);
    }
  }

  /**
   * به‌روزرسانی مکان و جانمایی یک دستگاه روی نقشه
   */
  public static updatePosition(
    equipmentId: string, 
    newPos: Partial<EquipmentPosition>, 
    updatedByUser = 'اپراتور دیسپاچینگ'
  ): EquipmentItem | null {
    const list = this.getEquipmentList();
    const index = list.findIndex(e => e.id === equipmentId || e.code === equipmentId);
    if (index === -1) return null;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateStr = `1405/06/08 ${timeStr}`;

    // تعیین زون بر اساس مختصات جدید اگر زون تعیین نشده باشد
    let zoneId = newPos.zoneId || list[index].position.zoneId;
    let zoneNameFa = newPos.zoneNameFa || list[index].position.zoneNameFa;
    let benchLevel = newPos.benchLevel ?? list[index].position.benchLevel;

    if (newPos.x !== undefined && newPos.y !== undefined) {
      const matchedZone = MINE_MAP_ZONES.find(z => 
        z.bounds &&
        newPos.x! >= z.bounds.xMin && 
        newPos.x! <= z.bounds.xMax && 
        newPos.y! >= z.bounds.yMin && 
        newPos.y! <= z.bounds.yMax
      );
      if (matchedZone) {
        zoneId = matchedZone.id;
        zoneNameFa = matchedZone.nameFa;
        benchLevel = matchedZone.benchLevel;
      }
    }

    const updatedItem: EquipmentItem = {
      ...list[index],
      position: {
        ...list[index].position,
        ...newPos,
        zoneId,
        zoneNameFa,
        benchLevel,
        updatedAt: dateStr,
        updatedBy: updatedByUser
      }
    };

    list[index] = updatedItem;
    this.saveEquipmentList(list);
    this.recordPlacementAudit(updatedItem, updatedByUser);

    return updatedItem;
  }

  /**
   * به‌روزرسانی وضعیت کاری و مشخصات اپراتور یک دستگاه
   */
  public static updateStatus(
    equipmentId: string,
    status: EquipmentStatus,
    activityFa?: string,
    operatorName?: string
  ): EquipmentItem | null {
    const list = this.getEquipmentList();
    const index = list.findIndex(e => e.id === equipmentId);
    if (index === -1) return null;

    const updatedItem: EquipmentItem = {
      ...list[index],
      status,
      currentActivityFa: activityFa ?? list[index].currentActivityFa,
      operatorName: operatorName ?? list[index].operatorName
    };

    list[index] = updatedItem;
    this.saveEquipmentList(list);
    return updatedItem;
  }

  /**
   * بازنشانی تمام جانمایی‌ها به حالت پیش‌فرض کارخانه/سامانه
   */
  public static resetPositionsToDefault(): EquipmentItem[] {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EQUIPMENT_FLEET));
    return INITIAL_EQUIPMENT_FLEET;
  }

  /**
   * دریافت یک دستگاه بر اساس شناسه یا کد منحصر به فرد
   */
  public static getByCodeOrId(codeOrId: string): EquipmentItem | undefined {
    const list = this.getEquipmentList();
    return list.find(e => e.id === codeOrId || e.code.toUpperCase() === codeOrId.toUpperCase());
  }

  /**
   * ثبت لاگ جابجایی در سوابق ممیزی
   */
  private static recordPlacementAudit(item: EquipmentItem, user: string): void {
    try {
      const logs = JSON.parse(localStorage.getItem(LAST_POSITION_AUDIT_KEY) || '[]');
      logs.unshift({
        equipmentCode: item.code,
        equipmentName: item.nameFa,
        zoneName: item.position.zoneNameFa,
        coordinates: `X:${item.position.x.toFixed(1)}%, Y:${item.position.y.toFixed(1)}%`,
        benchLevel: item.position.benchLevel,
        updatedBy: user,
        timestamp: new Date().toLocaleTimeString('fa-IR')
      });
      // نگه داشتن حداکثر ۵۰ لاگ اخیر
      localStorage.setItem(LAST_POSITION_AUDIT_KEY, JSON.stringify(logs.slice(0, 50)));
    } catch (e) {
      console.warn('Audit placement log write failed', e);
    }
  }

  /**
   * دریافت لاگ‌های جابجایی اخیر
   */
  public static getPlacementAuditLogs(): Array<{
    equipmentCode: string;
    equipmentName: string;
    zoneName: string;
    coordinates: string;
    benchLevel: number;
    updatedBy: string;
    timestamp: string;
  }> {
    try {
      return JSON.parse(localStorage.getItem(LAST_POSITION_AUDIT_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * افزودن یک ماشین‌آلات جدید به ناوگان
   */
  public static addEquipmentItem(itemData: Partial<EquipmentItem> & { code: string; nameFa: string; category: EquipmentCategory }): EquipmentItem {
    const list = this.getEquipmentList();
    const newId = `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const newItem: EquipmentItem = {
      id: newId,
      code: itemData.code.trim().toUpperCase(),
      nameFa: itemData.nameFa.trim(),
      nameEn: itemData.nameEn || itemData.nameFa,
      model: itemData.model || 'Standard Mining Edition',
      brand: itemData.brand || 'Komatsu',
      category: itemData.category,
      emoji: itemData.emoji || '🚜',
      capacityTonOrM3: itemData.capacityTonOrM3 || '45 Ton',
      status: itemData.status || 'ACTIVE',
      currentActivityFa: itemData.currentActivityFa || 'آماده‌به‌کار در محوطه معدن',
      operatorName: itemData.operatorName || 'اپراتور شیفت جاری',
      operatorPhone: itemData.operatorPhone || '۰۹۱۲۳۴۵۶۷۸۹',
      currentShift: itemData.currentShift || 'MORNING',
      totalEngineHours: itemData.totalEngineHours || 1200,
      position: itemData.position || {
        x: 50 + (Math.random() * 20 - 10),
        y: 50 + (Math.random() * 20 - 10),
        benchLevel: itemData.position?.benchLevel || 1220,
        zoneId: itemData.position?.zoneId || 'pit-central',
        zoneNameFa: itemData.position?.zoneNameFa || 'پله ۱۲۲۰ پیت مرکزی',
        updatedAt: `1405/06/08 ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
        updatedBy: 'کاربر سیستم'
      },
      dailyStats: itemData.dailyStats || {
        shiftStartTime: '06:00',
        operatingHoursToday: 0.5,
        idleHoursToday: 0.1,
        fuelConsumedLitersToday: 40,
        tripsCountToday: itemData.category.includes('TRUCK') ? 2 : undefined,
        drilledMetersToday: itemData.category === 'DRILL_RIG' ? 15 : undefined,
        efficiencyPct: 90
      },
      telemetry: itemData.telemetry || {
        engineRpm: 1750,
        engineTempC: 84,
        oilPressureBar: 4.8,
        fuelLevelPct: 88,
        speedKmh: 0,
        payloadTons: itemData.category.includes('TRUCK') ? 85 : undefined,
        hydraulicPressureBar: 280
      },
      contractor: itemData.contractor || 'امانی کارفرما',
      lastServiceDate: itemData.lastServiceDate || '1405/05/10',
      nextServiceHours: itemData.nextServiceHours || 250,
      notes: itemData.notes || 'دستگاه تازه افزوده شده به ناوگان عملیاتی'
    };

    list.unshift(newItem);
    this.saveEquipmentList(list);
    this.recordPlacementAudit(newItem, 'ثبت اولیه در سیستم');
    return newItem;
  }

  /**
   * حذف یک ماشین‌آلات از ناوگان
   */
  public static deleteEquipmentItem(id: string): boolean {
    const list = this.getEquipmentList();
    const index = list.findIndex(e => e.id === id || e.code === id);
    if (index === -1) return false;

    list.splice(index, 1);
    this.saveEquipmentList(list);
    return true;
  }

  /**
   * ویرایش مشخصات کامل یک دستگاه
   */
  public static updateEquipmentItem(id: string, updates: Partial<EquipmentItem>): EquipmentItem | null {
    const list = this.getEquipmentList();
    const index = list.findIndex(e => e.id === id || e.code === id);
    if (index === -1) return null;

    const updated: EquipmentItem = {
      ...list[index],
      ...updates,
      id: list[index].id // جلوگیری از تغییر ID
    };

    list[index] = updated;
    this.saveEquipmentList(list);
    return updated;
  }

  /**
   * محاسبه شاخص‌های کلی ناوگان
   */
  public static getFleetSummary() {
    const list = this.getEquipmentList();
    const totalCount = list.length;
    const activeCount = list.filter(e => e.status === 'ACTIVE' || e.status === 'HAULING').length;
    const standbyCount = list.filter(e => e.status === 'STANDBY' || e.status === 'REFUELING').length;
    const maintenanceCount = list.filter(e => e.status === 'MAINTENANCE').length;
    const offCount = list.filter(e => e.status === 'OFF').length;

    const totalOperatingHoursToday = list.reduce((acc, e) => acc + e.dailyStats.operatingHoursToday, 0);
    const totalFuelToday = list.reduce((acc, e) => acc + e.dailyStats.fuelConsumedLitersToday, 0);
    const avgEfficiency = Math.round(list.reduce((acc, e) => acc + e.dailyStats.efficiencyPct, 0) / (totalCount || 1));
    const availabilityRatePct = Math.round(((activeCount + standbyCount) / (totalCount || 1)) * 100);

    return {
      totalCount,
      activeCount,
      standbyCount,
      maintenanceCount,
      offCount,
      totalOperatingHoursToday: Number(totalOperatingHoursToday.toFixed(1)),
      totalFuelToday,
      avgEfficiency,
      availabilityRatePct
    };
  }
}
