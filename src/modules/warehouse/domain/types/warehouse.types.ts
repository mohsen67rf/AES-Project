// src/modules/warehouse/domain/types/warehouse.types.ts

export type WarehouseCategory = 
  | 'EXPLOSIVES'        // مواد ناریه (آنفو، امولسیون، بوستر، چاشنی، فیتیله)
  | 'FUEL_LUBRICANTS'   // سوخت، روغن‌های هیدرولیک و گریس‌ها
  | 'DRILL_CONSUMABLES' // لوازم مصرفی حفاری (سرمته، راد، شانک، کوپلینگ)
  | 'SAFETY_PPE';       // تجهیزات حفاظت فردی، گازسنج، اهم‌متر و صاعقه‌گیر

export type ExplosiveType = 
  | 'ANFO'
  | 'EMULSION_BULK'
  | 'EMULITE_CARTRIDGE'
  | 'BOOSTER_PENTOLITE'
  | 'NONEL_IN_HOLE'
  | 'NONEL_SURFACE'
  | 'DETONATING_CORD'
  | 'ELECTRIC_DETONATOR'
  | 'SAFETY_FUSE';

export type TransactionType = 'INTAKE' | 'CONSUMPTION_BLOCK' | 'DISPATCH_FLEET' | 'AUDIT_ADJUSTMENT' | 'RETURN';

export interface WarehouseItem {
  id: string;
  code: string;
  nameFa: string;
  nameEn: string;
  category: WarehouseCategory;
  subCategory?: string;
  unit: string;
  currentStock: number;
  minSafetyStock: number;
  maxCapacity: number;
  unitCostToman: number;
  storageLocation: string; // e.g. زاغه شماره ۱ (انبار مواد فله)، زاغه شماره ۲ (چاشنی‌ها)، مخزن سوخت اصلی
  batchNumber?: string;
  expiryDate?: string;
  hazardClass?: string; // e.g. 1.1D, 1.4S, Class 3 (Flammable Liquid)
  lastRestockedAt?: string;
  notes?: string;
}

export interface BlockBlastCalculationInput {
  blockId?: string;
  blockCode: string;
  benchLevel: number;
  rockType: string;
  rockDensityTonPerM3: number;
  lengthMeters: number;
  widthMeters: number;
  benchHeightMeters: number;
  holeDiameterMm: number;
  burdenMeters: number;
  spacingMeters: number;
  subDrillingMeters: number;
  stemmingLengthMeters: number;
  holeCount: number;
  explosiveType: ExplosiveType;
  targetPowderFactorKgTon: number; // e.g. 0.38 kg/ton
  boostersPerHole: number;
  detonatorDelayMs: number;
  surfaceConnectorsCount: number;
  detonatingCordMetersPerHole?: number;
}

export interface BlockBlastCalculationResult {
  totalVolumeM3: number;
  totalTonnage: number;
  totalDrillingMeters: number;
  chargeLengthPerHoleMeters: number;
  explosivePerHoleKg: number;
  totalAnfoKg: number;
  totalEmulsionKg: number;
  totalBoostersCount: number;
  totalInHoleDetonatorsCount: number;
  totalSurfaceConnectorsCount: number;
  totalDetonatingCordMeters: number;
  calculatedPowderFactorKgTon: number;
  calculatedPowderFactorKgM3: number;
  estimatedTotalCostToman: number;
  costPerTonRockToman: number;
  stockAvailability: {
    hasEnoughAnfo: boolean;
    hasEnoughEmulsion: boolean;
    hasEnoughBoosters: boolean;
    hasEnoughDetonators: boolean;
    missingItemsText?: string[];
  };
}

export interface WarehouseTransaction {
  id: string;
  trackingCode: string;
  type: TransactionType;
  itemId: string;
  itemName: string;
  category: WarehouseCategory;
  quantity: number;
  unit: string;
  previousStock: number;
  newStock: number;
  targetBlockCode?: string;
  targetBenchLevel?: number;
  targetEquipmentId?: string;
  contractorName: string;
  operatorName: string;
  authorizedBy: string; // ناظر یا مدیر مسئول
  permitNumber?: string; // شماره بارنامه یا شماره صورتجلسه آتشباری
  timestamp: string;
  unitCostToman?: number;
  totalCostToman?: number;
  notes?: string;
}

export interface FuelTank {
  id: string;
  nameFa: string;
  tankCode: string;
  fuelType: string;
  capacityLiters: number;
  currentLevelLiters: number;
  minWarningLiters: number;
  dailyConsumptionLiters: number;
  location: string;
  lastInspectionDate: string;
  temperatureCelsius: number;
}

export interface EquipmentRefuelingLog {
  id: string;
  equipmentCode: string;
  equipmentType: 'DUMP_TRUCK' | 'SHOVEL' | 'LOADER' | 'DRILL_RIG' | 'DOZER' | 'WATER_TRUCK' | 'SERVICE_CAR';
  litersFilled: number;
  currentHourMeter: number;
  fuelTankId: string;
  operatorName: string;
  driverName: string;
  timestamp: string;
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  consumptionPerOperatingHour?: number;
}

export interface MagazineSafetyStatus {
  magazineId: string;
  nameFa: string;
  currentTemperatureC: number;
  currentHumidityPct: number;
  staticElectricitySafe: boolean;
  lightningProtectionCertified: boolean;
  fireExtinguishersInspected: boolean;
  intruderAlarmArmed: boolean;
  ventilationActive: boolean;
  lastSecurityCheck: string;
  officerInCharge: string;
}
