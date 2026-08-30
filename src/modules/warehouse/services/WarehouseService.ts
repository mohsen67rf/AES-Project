// src/modules/warehouse/services/WarehouseService.ts

import { 
  WarehouseItem, 
  WarehouseTransaction, 
  BlockBlastCalculationInput, 
  BlockBlastCalculationResult,
  FuelTank,
  EquipmentRefuelingLog,
  MagazineSafetyStatus
} from '../domain/types/warehouse.types';

const STORAGE_ITEMS_KEY = 'aes_warehouse_inventory_v1';
const STORAGE_TRANSACTIONS_KEY = 'aes_warehouse_transactions_v1';
const STORAGE_TANKS_KEY = 'aes_warehouse_fuel_tanks_v1';
const STORAGE_REFUELING_KEY = 'aes_warehouse_refueling_logs_v1';
const STORAGE_SAFETY_KEY = 'aes_warehouse_safety_status_v1';

export class WarehouseService {
  // ============================================
  // اقلام اولیه پیش‌فرض انبار ناریه و سوخت
  // ============================================
  private static defaultItems: WarehouseItem[] = [
    {
      id: 'item-anfo-1',
      code: 'EXP-ANFO-01',
      nameFa: 'آنفو استاندارد صنعتی (ANFO)',
      nameEn: 'Standard Industrial ANFO',
      category: 'EXPLOSIVES',
      subCategory: 'ماده منفجره فله/کیسه‌ای',
      unit: 'کیلوگرم (kg)',
      currentStock: 48500,
      minSafetyStock: 15000,
      maxCapacity: 100000,
      unitCostToman: 52000,
      storageLocation: 'زاغه شماره ۱ (انبار مواد نیتراتی و آنفو)',
      batchNumber: 'ANF-1405-08-C',
      hazardClass: '1.1D',
      expiryDate: '1406/05/20',
      lastRestockedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      notes: 'ترکیب ۹۴.۳٪ نیترات آمونیوم متخلخل و ۵.۷٪ گازوئیل با کیفیت عالی'
    },
    {
      id: 'item-emulsion-bulk',
      code: 'EXP-EMUL-BULK',
      nameFa: 'امولسیون فله پمپ‌شونده (Bulk Emulsion Matrix)',
      nameEn: 'Bulk Pumpable Emulsion',
      category: 'EXPLOSIVES',
      subCategory: 'ماده منفجره ضدآب فله',
      unit: 'کیلوگرم (kg)',
      currentStock: 32000,
      minSafetyStock: 10000,
      maxCapacity: 60000,
      unitCostToman: 78000,
      storageLocation: 'مخازن عایق زاغه شماره ۱ (تانک‌های ماتریکس)',
      batchNumber: 'EMU-1405-09-B',
      hazardClass: '1.5D',
      expiryDate: '1406/02/15',
      lastRestockedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      notes: 'مناسب چال‌های آبدار کف پیت و زون‌های اشباع از آب با VOD بالای ۵۲۰۰ متر بر ثانیه'
    },
    {
      id: 'item-emulite-cartridge',
      code: 'EXP-EMU-CART',
      nameFa: 'کارتریج امولایت (Emulite Tube 50x500mm)',
      nameEn: 'Packaged Emulite Cartridge',
      category: 'EXPLOSIVES',
      subCategory: 'خرج فشنگی تقویتی',
      unit: 'کیلوگرم (kg)',
      currentStock: 6800,
      minSafetyStock: 2000,
      maxCapacity: 15000,
      unitCostToman: 95000,
      storageLocation: 'زاغه شماره ۲ (انبار کارتریج‌ها)',
      batchNumber: 'CRT-1405-04-A',
      hazardClass: '1.1D',
      expiryDate: '1406/08/10',
      lastRestockedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'item-booster-500',
      code: 'EXP-BST-500',
      nameFa: 'بوستر پنتولیت ۵۰۰ گرمی (Pentolite Booster 500g)',
      nameEn: 'Cast Pentolite Booster 500g',
      category: 'EXPLOSIVES',
      subCategory: 'چاشنی اولیه و پرایمر',
      unit: 'عدد',
      currentStock: 1450,
      minSafetyStock: 400,
      maxCapacity: 4000,
      unitCostToman: 240000,
      storageLocation: 'زاغه شماره ۲ (قفسه ضدالکتریسیته A3)',
      batchNumber: 'BST-500-1405-01',
      hazardClass: '1.1D',
      expiryDate: '1407/01/01',
      lastRestockedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      notes: 'ترکیب ۵۰/۵۰ TNT و PETN با سرعت انفجار ۷۵۰۰ m/s جهت اطمینان از انفجار کامل آنفو'
    },
    {
      id: 'item-booster-400',
      code: 'EXP-BST-400',
      nameFa: 'بوستر پنتولیت ۴۰۰ گرمی (Pentolite Booster 400g)',
      nameEn: 'Cast Pentolite Booster 400g',
      category: 'EXPLOSIVES',
      subCategory: 'چاشنی اولیه و پرایمر',
      unit: 'عدد',
      currentStock: 980,
      minSafetyStock: 300,
      maxCapacity: 3000,
      unitCostToman: 195000,
      storageLocation: 'زاغه شماره ۲ (قفسه ضدالکتریسیته A4)',
      batchNumber: 'BST-400-1405-02',
      hazardClass: '1.1D',
      expiryDate: '1407/01/01',
      lastRestockedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
      id: 'item-nonel-in-hole',
      code: 'EXP-NONEL-IN',
      nameFa: 'چاشنی نانل درون‌چالی ۵۰۰ میلی‌ثانیه (Nonel In-Hole 18m/500ms)',
      nameEn: 'Nonel In-Hole Detonator 500ms',
      category: 'EXPLOSIVES',
      subCategory: 'سیستم‌های انفجار نانل',
      unit: 'شاخه',
      currentStock: 2200,
      minSafetyStock: 600,
      maxCapacity: 5000,
      unitCostToman: 85000,
      storageLocation: 'زاغه شماره ۲ (باکس‌های ایمن چاشنی نانل B1)',
      batchNumber: 'NNL-IN-1405-07',
      hazardClass: '1.4B',
      expiryDate: '1407/06/01',
      lastRestockedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: 'item-nonel-surface-25',
      code: 'EXP-NONEL-SURF-25',
      nameFa: 'رابط سطحی نانل ۲۵ میلی‌ثانیه‌ای (Surface Connector 25ms)',
      nameEn: 'Nonel Surface Connector 25ms',
      category: 'EXPLOSIVES',
      subCategory: 'سیستم‌های انفجار نانل',
      unit: 'شاخه',
      currentStock: 1650,
      minSafetyStock: 400,
      maxCapacity: 4000,
      unitCostToman: 65000,
      storageLocation: 'زاغه شماره ۲ (باکس‌های رابط سطحی B2)',
      batchNumber: 'NNL-SF-25-1405',
      hazardClass: '1.4B',
      expiryDate: '1407/06/01',
      lastRestockedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: 'item-nonel-surface-17',
      code: 'EXP-NONEL-SURF-17',
      nameFa: 'رابط سطحی نانل ۱۷ میلی‌ثانیه‌ای (Surface Connector 17ms)',
      nameEn: 'Nonel Surface Connector 17ms',
      category: 'EXPLOSIVES',
      subCategory: 'سیستم‌های انفجار نانل',
      unit: 'شاخه',
      currentStock: 1100,
      minSafetyStock: 300,
      maxCapacity: 3000,
      unitCostToman: 65000,
      storageLocation: 'زاغه شماره ۲ (باکس‌های رابط سطحی B3)',
      batchNumber: 'NNL-SF-17-1405',
      hazardClass: '1.4B',
      expiryDate: '1407/06/01',
      lastRestockedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: 'item-detonating-cord',
      code: 'EXP-CORD-10G',
      nameFa: 'کورتکس / فیتیله انفجاری ۱۰ گرم بر متر (Detonating Cord 10g/m)',
      nameEn: 'Detonating Cord 10g/m',
      category: 'EXPLOSIVES',
      subCategory: 'فیتیله‌های انفجاری',
      unit: 'متر',
      currentStock: 4500,
      minSafetyStock: 1000,
      maxCapacity: 10000,
      unitCostToman: 28000,
      storageLocation: 'زاغه شماره ۲ (قفسه رول‌های کورتکس C1)',
      batchNumber: 'CRD-10G-1405',
      hazardClass: '1.1D',
      expiryDate: '1407/12/29',
      lastRestockedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    {
      id: 'item-electric-detonator',
      code: 'EXP-ELEC-DET',
      nameFa: 'چاشنی الکتریکی آنی و تاخیری (Electric Detonator)',
      nameEn: 'Electric Instant Detonator',
      category: 'EXPLOSIVES',
      subCategory: 'چاشنی الکتریکی',
      unit: 'عدد',
      currentStock: 450,
      minSafetyStock: 150,
      maxCapacity: 1500,
      unitCostToman: 92000,
      storageLocation: 'زاغه شماره ۲ (صندوقچه نسوز و ضدسیگنال D1)',
      batchNumber: 'ELC-DET-1405',
      hazardClass: '1.1B',
      expiryDate: '1407/04/01',
      lastRestockedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    // سوخت و روانکارها
    {
      id: 'item-diesel-fuel',
      code: 'FUEL-DIESEL-01',
      nameFa: 'گازوئیل صنعتی ماشین‌آلات سنگین (Diesel Fuel Euro 4)',
      nameEn: 'Heavy Fleet Diesel Fuel',
      category: 'FUEL_LUBRICANTS',
      subCategory: 'سوخت گازوئیل',
      unit: 'لیتر',
      currentStock: 64500,
      minSafetyStock: 25000,
      maxCapacity: 120000,
      unitCostToman: 3000, // سهمیه‌ای/صنعتی
      storageLocation: 'مجموعه مخازن سوخت مرکزی و تانکر پیت',
      hazardClass: 'Class 3',
      lastRestockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      notes: 'تأمین مستمر شاول‌ها، دامپ‌تراک‌ها و دریل‌های معدن با استاندارد یورو ۴'
    },
    {
      id: 'item-hydraulic-oil-68',
      code: 'LUB-HYD-68',
      nameFa: 'روغن هیدرولیک صنعتی بهران ۶۸ (Hydraulic Oil ISO VG 68)',
      nameEn: 'Hydraulic Oil ISO VG 68',
      category: 'FUEL_LUBRICANTS',
      subCategory: 'روغن‌های هیدرولیک',
      unit: 'لیتر',
      currentStock: 4200,
      minSafetyStock: 1500,
      maxCapacity: 10000,
      unitCostToman: 115000,
      storageLocation: 'انبار روانکارها - پالت بشکه‌های ۲۰۸ لیتری',
      lastRestockedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 'item-engine-oil-15w40',
      code: 'LUB-ENG-15W40',
      nameFa: 'روغن موتور دیزلی سنگین ۱۵W-40 CI-4 (Heavy Duty Engine Oil)',
      nameEn: 'Heavy Duty Engine Oil 15W-40',
      category: 'FUEL_LUBRICANTS',
      subCategory: 'روغن موتور',
      unit: 'لیتر',
      currentStock: 3100,
      minSafetyStock: 1200,
      maxCapacity: 8000,
      unitCostToman: 145000,
      storageLocation: 'انبار روانکارها - پالت بشکه‌های روغن موتور',
      lastRestockedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: 'item-grease-ep2',
      code: 'LUB-GRS-EP2',
      nameFa: 'گریس نسوز صنعتی لیتیوم کمپلکس EP2 (Lithium Complex Grease)',
      nameEn: 'Industrial Lithium Grease EP2',
      category: 'FUEL_LUBRICANTS',
      subCategory: 'گریس‌های صنعتی',
      unit: 'کیلوگرم (kg)',
      currentStock: 1850,
      minSafetyStock: 600,
      maxCapacity: 4000,
      unitCostToman: 180000,
      storageLocation: 'انبار روانکارها - چلیک‌های گریس نسوز',
      lastRestockedAt: new Date(Date.now() - 86400000 * 11).toISOString(),
    },
    // لوازم مصرفی حفاری
    {
      id: 'item-drill-bit-76',
      code: 'DRL-BIT-76MM',
      nameFa: 'سرمته دکمه‌ای کارباید ۷۶ میلی‌متری (Button Bit 76mm T38/T45)',
      nameEn: 'Tungsten Carbide Button Bit 76mm',
      category: 'DRILL_CONSUMABLES',
      subCategory: 'سرمته‌های حفاری',
      unit: 'عدد',
      currentStock: 42,
      minSafetyStock: 15,
      maxCapacity: 100,
      unitCostToman: 7500000,
      storageLocation: 'انبار قطعات فنی - قفسه ابزار حفاری D3',
      lastRestockedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'item-drill-bit-89',
      code: 'DRL-BIT-89MM',
      nameFa: 'سرمته دکمه‌ای کارباید ۸۹ میلی‌متری (Button Bit 89mm T45)',
      nameEn: 'Tungsten Carbide Button Bit 89mm',
      category: 'DRILL_CONSUMABLES',
      subCategory: 'سرمته‌های حفاری',
      unit: 'عدد',
      currentStock: 28,
      minSafetyStock: 10,
      maxCapacity: 80,
      unitCostToman: 9800000,
      storageLocation: 'انبار قطعات فنی - قفسه ابزار حفاری D4',
      lastRestockedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'item-drill-rod-t45',
      code: 'DRL-ROD-T45',
      nameFa: 'راد حفاری T45 به طول ۳.۶۶ متر (MF Drill Rod T45 3.66m)',
      nameEn: 'MF Drill Rod T45 3.66m',
      category: 'DRILL_CONSUMABLES',
      subCategory: 'راد و لوله‌های حفاری',
      unit: 'شاخه',
      currentStock: 35,
      minSafetyStock: 12,
      maxCapacity: 70,
      unitCostToman: 18500000,
      storageLocation: 'انبار فنی - راک لوله‌ها و رادهای حفاری',
      lastRestockedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    },
    {
      id: 'item-shank-adapter',
      code: 'DRL-SHK-ADPT',
      nameFa: 'شانک آداپتور دریل واگن سندیک (Shank Adapter Sandvik HL710)',
      nameEn: 'Shank Adapter HL710 T45',
      category: 'DRILL_CONSUMABLES',
      subCategory: 'شانک و کوپلینگ',
      unit: 'عدد',
      currentStock: 14,
      minSafetyStock: 5,
      maxCapacity: 30,
      unitCostToman: 24000000,
      storageLocation: 'انبار فنی - قفسه قطعات ویژه چکش هیدرولیک',
      lastRestockedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    }
  ];

  // مخازن سوخت معدن
  private static defaultFuelTanks: FuelTank[] = [
    {
      id: 'tank-main-1',
      nameFa: 'مخزن سوخت اصلی شماره ۱ (مرکزی)',
      tankCode: 'TK-DSL-01',
      fuelType: 'گازوئیل صنعتی Euro 4',
      capacityLiters: 50000,
      currentLevelLiters: 34200,
      minWarningLiters: 12000,
      dailyConsumptionLiters: 4800,
      location: 'محوطه پمپ بنزین مرکزی معدن (پشت بچینگ)',
      lastInspectionDate: '1405/03/01',
      temperatureCelsius: 22.4
    },
    {
      id: 'tank-main-2',
      nameFa: 'مخزن سوخت اصلی شماره ۲ (پشتیبان)',
      tankCode: 'TK-DSL-02',
      fuelType: 'گازوئیل صنعتی Euro 4',
      capacityLiters: 40000,
      currentLevelLiters: 23800,
      minWarningLiters: 10000,
      dailyConsumptionLiters: 2200,
      location: 'محوطه پمپ بنزین مرکزی معدن',
      lastInspectionDate: '1405/02/25',
      temperatureCelsius: 22.1
    },
    {
      id: 'tank-mobile-1',
      nameFa: 'تانکر سیار سوخت‌رسان پیت (Mobile Bowser)',
      tankCode: 'BOWSER-MB-01',
      fuelType: 'گازوئیل سوخت‌رسانی شاول‌ها',
      capacityLiters: 12000,
      currentLevelLiters: 6500,
      minWarningLiters: 2500,
      dailyConsumptionLiters: 5800,
      location: 'در حال تردد در پله‌های ۱۸۲۰ و ۱۸۰۸ پیت مرکزی',
      lastInspectionDate: '1405/03/05',
      temperatureCelsius: 24.8
    }
  ];

  // لاگ‌های سوخت‌گیری تجهیزات
  private static defaultRefuelingLogs: EquipmentRefuelingLog[] = [
    {
      id: 'refuel-01',
      equipmentCode: 'TRUCK-01 (کوماتسو HD785)',
      equipmentType: 'DUMP_TRUCK',
      litersFilled: 650,
      currentHourMeter: 4820,
      fuelTankId: 'tank-main-1',
      operatorName: 'علی رضایی (راننده)',
      driverName: 'مرتضی کریمی',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      shift: 'MORNING',
      consumptionPerOperatingHour: 54.2
    },
    {
      id: 'refuel-02',
      equipmentCode: 'SHOVEL-01 (هیتاچی EX1200)',
      equipmentType: 'SHOVEL',
      litersFilled: 1200,
      currentHourMeter: 6140,
      fuelTankId: 'tank-mobile-1',
      operatorName: 'احمد کاظمی (اپراتور شاول)',
      driverName: 'اصغر نوری (تانکربان)',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      shift: 'MORNING',
      consumptionPerOperatingHour: 88.5
    },
    {
      id: 'refuel-03',
      equipmentCode: 'DRILL-01 (دریل سندیک DI550)',
      equipmentType: 'DRILL_RIG',
      litersFilled: 450,
      currentHourMeter: 3290,
      fuelTankId: 'tank-mobile-1',
      operatorName: 'مهدی مهدوی (حفار)',
      driverName: 'اصغر نوری (تانکربان)',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      shift: 'NIGHT',
      consumptionPerOperatingHour: 38.0
    },
    {
      id: 'refuel-04',
      equipmentCode: 'TRUCK-04 (بنز مایلر)',
      equipmentType: 'WATER_TRUCK',
      litersFilled: 220,
      currentHourMeter: 5120,
      fuelTankId: 'tank-main-2',
      operatorName: 'جواد حسنی',
      driverName: 'جواد حسنی',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      shift: 'EVENING',
      consumptionPerOperatingHour: 22.4
    }
  ];

  // وضعیت ایمنی و سنسورهای زاغه‌ها
  private static defaultSafetyStatus: MagazineSafetyStatus[] = [
    {
      magazineId: 'mag-01',
      nameFa: 'زاغه شماره ۱ (انبار آنفو و ماتریکس امولسیون)',
      currentTemperatureC: 18.5,
      currentHumidityPct: 38,
      staticElectricitySafe: true,
      lightningProtectionCertified: true,
      fireExtinguishersInspected: true,
      intruderAlarmArmed: true,
      ventilationActive: true,
      lastSecurityCheck: 'امروز ساعت ۰۶:۰۰ (شیفت صبح)',
      officerInCharge: 'سرگرد احمدی (مسئول حفاظت و مواد ناریه)'
    },
    {
      magazineId: 'mag-02',
      nameFa: 'زاغه شماره ۲ (انبار بوسترها، چاشنی‌های نانل و الکتریکی)',
      currentTemperatureC: 16.8,
      currentHumidityPct: 34,
      staticElectricitySafe: true,
      lightningProtectionCertified: true,
      fireExtinguishersInspected: true,
      intruderAlarmArmed: true,
      ventilationActive: true,
      lastSecurityCheck: 'امروز ساعت ۰۶:۱۵ (شیفت صبح)',
      officerInCharge: 'سرگرد احمدی / ستوان موسوی'
    }
  ];

  // تراکنش‌های اولیه شارژ و مصرف مواد
  private static defaultTransactions: WarehouseTransaction[] = [
    {
      id: 'tx-001',
      trackingCode: 'TRX-140503-01',
      type: 'INTAKE',
      itemId: 'item-anfo-1',
      itemName: 'آنفو استاندارد صنعتی (ANFO)',
      category: 'EXPLOSIVES',
      quantity: 20000,
      unit: 'کیلوگرم (kg)',
      previousStock: 28500,
      newStock: 48500,
      contractorName: 'شرکت صنایع شیمیایی پارس نار',
      operatorName: 'انباردار ناریه (مهندس بیات)',
      authorizedBy: 'مهندس حسینی (مدیر کارفرما) و حراست ناریه',
      permitNumber: 'BARNAMEH-PARS-8842',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      unitCostToman: 52000,
      totalCostToman: 1040000000,
      notes: 'ورود محموله ۲۰ تنی آنفو با اسکورت رسمی حراست و مجوز اداره اسلحه و مهمات'
    },
    {
      id: 'tx-002',
      trackingCode: 'TRX-140503-02',
      type: 'CONSUMPTION_BLOCK',
      itemId: 'item-anfo-1',
      itemName: 'آنفو استاندارد صنعتی (ANFO)',
      category: 'EXPLOSIVES',
      quantity: 4200,
      unit: 'کیلوگرم (kg)',
      previousStock: 52700,
      newStock: 48500,
      targetBlockCode: '1040 B 32',
      targetBenchLevel: 1040,
      contractorName: 'پیمانکار استخراج و آتشباری (مهندس رضایی)',
      operatorName: 'تیم آتشباری معدن',
      authorizedBy: 'دکتر علوی (نظارت) و سرگرد احمدی (حراست)',
      permitNumber: 'BLAST-PERMIT-1405-32',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      unitCostToman: 52000,
      totalCostToman: 218400000,
      notes: 'خرج‌گذاری و آتشباری موفق ۴۸ چال بلوک ۱۰۴۰-۳۲ زون مگنتیت'
    },
    {
      id: 'tx-003',
      trackingCode: 'TRX-140503-03',
      type: 'CONSUMPTION_BLOCK',
      itemId: 'item-booster-500',
      itemName: 'بوستر پنتولیت ۵۰۰ گرمی',
      category: 'EXPLOSIVES',
      quantity: 48,
      unit: 'عدد',
      previousStock: 1498,
      newStock: 1450,
      targetBlockCode: '1040 B 32',
      targetBenchLevel: 1040,
      contractorName: 'پیمانکار استخراج و آتشباری',
      operatorName: 'تیم آتشباری معدن',
      authorizedBy: 'دکتر علوی (نظارت)',
      permitNumber: 'BLAST-PERMIT-1405-32',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      unitCostToman: 240000,
      totalCostToman: 11520000,
      notes: 'تخصیص ۱ عدد بوستر ۵۰۰ گرمی برای هر چال بلوک ۱۰۴۰-۳۲'
    },
    {
      id: 'tx-004',
      trackingCode: 'TRX-140503-04',
      type: 'CONSUMPTION_BLOCK',
      itemId: 'item-nonel-in-hole',
      itemName: 'چاشنی نانل درون‌چالی ۵۰۰ms',
      category: 'EXPLOSIVES',
      quantity: 48,
      unit: 'شاخه',
      previousStock: 2248,
      newStock: 2200,
      targetBlockCode: '1040 B 32',
      targetBenchLevel: 1040,
      contractorName: 'پیمانکار استخراج و آتشباری',
      operatorName: 'تیم آتشباری معدن',
      authorizedBy: 'دکتر علوی (نظارت)',
      permitNumber: 'BLAST-PERMIT-1405-32',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      unitCostToman: 85000,
      totalCostToman: 4080000,
      notes: 'چاشنی‌های درون‌چالی نانل با تاخیر ۵۰۰ میلی‌ثانیه برای کنترل ارتعاش'
    },
    {
      id: 'tx-005',
      trackingCode: 'TRX-140503-05',
      type: 'DISPATCH_FLEET',
      itemId: 'item-diesel-fuel',
      itemName: 'گازوئیل صنعتی ماشین‌آلات سنگین',
      category: 'FUEL_LUBRICANTS',
      quantity: 5800,
      unit: 'لیتر',
      previousStock: 70300,
      newStock: 64500,
      targetEquipmentId: 'ناوگان بارگیری و باربری پیت ۱',
      contractorName: 'پیمانکار حمل و استخراج',
      operatorName: 'مسئول جایگاه سوخت (کریمی)',
      authorizedBy: 'مهندس حسینی (کارفرما)',
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
      unitCostToman: 3000,
      totalCostToman: 17400000,
      notes: 'سوخت‌گیری شیفت صبح ناوگان تراک‌ها و شاول‌های پیت مرکزی'
    }
  ];

  // ============================================
  // دریافت لیست اقلام انبار
  // ============================================
  public static getItems(): WarehouseItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_ITEMS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading warehouse items from storage', e);
    }
    this.saveItems(this.defaultItems);
    return this.defaultItems;
  }

  public static saveItems(items: WarehouseItem[]): void {
    try {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Error saving warehouse items', e);
    }
  }

  // ============================================
  // دریافت لیست تراکنش‌ها (ورود، خروج، مصرف بلوک)
  // ============================================
  public static getTransactions(): WarehouseTransaction[] {
    try {
      const saved = localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading warehouse transactions', e);
    }
    this.saveTransactions(this.defaultTransactions);
    return this.defaultTransactions;
  }

  public static saveTransactions(txs: WarehouseTransaction[]): void {
    try {
      localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(txs));
    } catch (e) {
      console.warn('Error saving warehouse transactions', e);
    }
  }

  // ============================================
  // دریافت مخازن سوخت و لاگ‌های سوخت‌گیری
  // ============================================
  public static getFuelTanks(): FuelTank[] {
    try {
      const saved = localStorage.getItem(STORAGE_TANKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading fuel tanks', e);
    }
    this.saveFuelTanks(this.defaultFuelTanks);
    return this.defaultFuelTanks;
  }

  public static saveFuelTanks(tanks: FuelTank[]): void {
    try {
      localStorage.setItem(STORAGE_TANKS_KEY, JSON.stringify(tanks));
    } catch (e) {
      console.warn('Error saving fuel tanks', e);
    }
  }

  public static getRefuelingLogs(): EquipmentRefuelingLog[] {
    try {
      const saved = localStorage.getItem(STORAGE_REFUELING_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading refueling logs', e);
    }
    this.saveRefuelingLogs(this.defaultRefuelingLogs);
    return this.defaultRefuelingLogs;
  }

  public static saveRefuelingLogs(logs: EquipmentRefuelingLog[]): void {
    try {
      localStorage.setItem(STORAGE_REFUELING_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('Error saving refueling logs', e);
    }
  }

  public static getSafetyStatus(): MagazineSafetyStatus[] {
    try {
      const saved = localStorage.getItem(STORAGE_SAFETY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading safety status', e);
    }
    this.saveSafetyStatus(this.defaultSafetyStatus);
    return this.defaultSafetyStatus;
  }

  public static saveSafetyStatus(stats: MagazineSafetyStatus[]): void {
    try {
      localStorage.setItem(STORAGE_SAFETY_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Error saving safety status', e);
    }
  }

  // ============================================
  // شارژ انبار (ورود محموله جدید ناریه / سوخت / قطعات)
  // ============================================
  public static addIntakeTransaction(data: {
    itemId: string;
    quantity: number;
    contractorName: string;
    operatorName: string;
    authorizedBy: string;
    permitNumber?: string;
    notes?: string;
    batchNumber?: string;
  }): { success: boolean; transaction: WarehouseTransaction } {
    const items = this.getItems();
    const itemIndex = items.findIndex(i => i.id === data.itemId);
    if (itemIndex === -1) {
      throw new Error('کالای مورد نظر در انبار یافت نشد.');
    }

    const item = items[itemIndex];
    const prevStock = item.currentStock;
    const newStock = prevStock + Number(data.quantity);

    // به‌روزرسانی موجودی و تاریخچه کالا
    item.currentStock = newStock;
    item.lastRestockedAt = new Date().toISOString();
    if (data.batchNumber) item.batchNumber = data.batchNumber;
    items[itemIndex] = item;
    this.saveItems(items);

    // ثبت تراکنش در دفتر کل
    const newTx: WarehouseTransaction = {
      id: `tx-${Date.now()}`,
      trackingCode: `TRX-IN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'INTAKE',
      itemId: item.id,
      itemName: item.nameFa,
      category: item.category,
      quantity: Number(data.quantity),
      unit: item.unit,
      previousStock: prevStock,
      newStock: newStock,
      contractorName: data.contractorName,
      operatorName: data.operatorName,
      authorizedBy: data.authorizedBy,
      permitNumber: data.permitNumber || 'PERMIT-IN-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString(),
      unitCostToman: item.unitCostToman,
      totalCostToman: item.unitCostToman * Number(data.quantity),
      notes: data.notes || 'شارژ و ورود رسمی محموله به انبار'
    };

    const txs = [newTx, ...this.getTransactions()];
    this.saveTransactions(txs);

    return { success: true, transaction: newTx };
  }

  // ============================================
  // موتور محاسبات اتوماتیک ناریه برای بلوک معدنی
  // ============================================
  public static calculateBlockBlastMaterials(input: BlockBlastCalculationInput): BlockBlastCalculationResult {
    // 1. ابعاد و حجم بلوک
    const benchHeight = input.benchHeightMeters || 12.5;
    const subDrilling = input.subDrillingMeters || 1.0;
    const totalHoleDepth = benchHeight + subDrilling;

    const holeCount = input.holeCount || 48;
    const totalDrillingMeters = holeCount * totalHoleDepth;

    // حجم سنگ متاثر از آتشباری = مساحت شبکه × ارتفاع پله × تعداد چال‌ها
    const volumePerHoleM3 = input.burdenMeters * input.spacingMeters * benchHeight;
    const totalVolumeM3 = volumePerHoleM3 * holeCount;

    // دانسیته سنگ (مگنتیت: ۳.۱ - ۳.۳، باطله: ۲.۶ - ۲.۷۵)
    const density = input.rockDensityTonPerM3 || 3.15;
    const totalTonnage = totalVolumeM3 * density;

    // 2. طول ستون گل‌گذاری و طول ستون باروت
    const stemmingLength = input.stemmingLengthMeters || (input.burdenMeters * 0.85);
    const chargeLengthPerHole = Math.max(1.0, totalHoleDepth - stemmingLength);

    // 3. محاسبه بار ویژه بر اساس جنس سنگ و خرج ویژه انتخابی
    const powderFactorKgTon = input.targetPowderFactorKgTon || 0.38; // کیلوگرم بر تن
    const totalExplosiveKg = totalTonnage * powderFactorKgTon;
    const explosivePerHoleKg = totalExplosiveKg / holeCount;

    // تفکیک آنفو و امولسیون
    let totalAnfoKg = 0;
    let totalEmulsionKg = 0;

    if (input.explosiveType === 'ANFO') {
      totalAnfoKg = totalExplosiveKg;
    } else if (input.explosiveType === 'EMULSION_BULK' || input.explosiveType === 'EMULITE_CARTRIDGE') {
      totalEmulsionKg = totalExplosiveKg;
    } else {
      // حالت هیبریدی (Heavy ANFO: 70% Anfo, 30% Emulsion)
      totalAnfoKg = totalExplosiveKg * 0.70;
      totalEmulsionKg = totalExplosiveKg * 0.30;
    }

    // بوسترها: معمولا ۱ بوستر ۵۰۰ گرمی یا ۴۰۰ گرمی به ازای هر چال
    const boostersPerHole = input.boostersPerHole || 1;
    const totalBoostersCount = holeCount * boostersPerHole;

    // چاشنی‌های نانل درون‌چالی
    const totalInHoleDetonatorsCount = holeCount;

    // رابط‌های سطحی (معمولا به ازای هر چال یا ردیف، به طور متوسط ۱.۲ عدد به ازای هر چال برای بستن مدار)
    const totalSurfaceConnectorsCount = Math.ceil(holeCount * 1.15) + (input.surfaceConnectorsCount || 4);

    // فیتیله انفجاری / کورتکس (متراژ ترانک‌لاین سطحی و هدایت مدار)
    const totalDetonatingCordMeters = Math.ceil(holeCount * (input.spacingMeters + 1.5)) + 40;

    // بار ویژه حجمی (kg/m3)
    const calculatedPowderFactorKgM3 = totalExplosiveKg / totalVolumeM3;
    const calculatedPowderFactorKgTon = totalExplosiveKg / totalTonnage;

    // محاسبه قیمت تخمینی کل عملیات ناریه این بلوک
    const items = this.getItems();
    const anfoItem = items.find(i => i.code === 'EXP-ANFO-01');
    const emulsionItem = items.find(i => i.code === 'EXP-EMUL-BULK');
    const boosterItem = items.find(i => i.code === 'EXP-BST-500');
    const detonatorItem = items.find(i => i.code === 'EXP-NONEL-IN');
    const surfaceItem = items.find(i => i.code === 'EXP-NONEL-SURF-25');
    const cordItem = items.find(i => i.code === 'EXP-CORD-10G');

    const costAnfo = totalAnfoKg * (anfoItem?.unitCostToman || 52000);
    const costEmulsion = totalEmulsionKg * (emulsionItem?.unitCostToman || 78000);
    const costBoosters = totalBoostersCount * (boosterItem?.unitCostToman || 240000);
    const costDetonators = totalInHoleDetonatorsCount * (detonatorItem?.unitCostToman || 85000);
    const costSurface = totalSurfaceConnectorsCount * (surfaceItem?.unitCostToman || 65000);
    const costCord = totalDetonatingCordMeters * (cordItem?.unitCostToman || 28000);

    const estimatedTotalCostToman = costAnfo + costEmulsion + costBoosters + costDetonators + costSurface + costCord;
    const costPerTonRockToman = totalTonnage > 0 ? estimatedTotalCostToman / totalTonnage : 0;

    // بررسی موجودی انبار
    const missing: string[] = [];
    const hasEnoughAnfo = (anfoItem?.currentStock || 0) >= totalAnfoKg;
    if (!hasEnoughAnfo && totalAnfoKg > 0) missing.push(`کسری آنفو: ${Math.round(totalAnfoKg - (anfoItem?.currentStock || 0)).toLocaleString()} kg`);

    const hasEnoughEmulsion = (emulsionItem?.currentStock || 0) >= totalEmulsionKg;
    if (!hasEnoughEmulsion && totalEmulsionKg > 0) missing.push(`کسری امولسیون: ${Math.round(totalEmulsionKg - (emulsionItem?.currentStock || 0)).toLocaleString()} kg`);

    const hasEnoughBoosters = (boosterItem?.currentStock || 0) >= totalBoostersCount;
    if (!hasEnoughBoosters) missing.push(`کسری بوستر ۵۰۰g: ${totalBoostersCount - (boosterItem?.currentStock || 0)} عدد`);

    const hasEnoughDetonators = (detonatorItem?.currentStock || 0) >= totalInHoleDetonatorsCount;
    if (!hasEnoughDetonators) missing.push(`کسری چاشنی نانل: ${totalInHoleDetonatorsCount - (detonatorItem?.currentStock || 0)} شاخه`);

    return {
      totalVolumeM3: Math.round(totalVolumeM3),
      totalTonnage: Math.round(totalTonnage),
      totalDrillingMeters: Math.round(totalDrillingMeters),
      chargeLengthPerHoleMeters: Number(chargeLengthPerHole.toFixed(1)),
      explosivePerHoleKg: Number(explosivePerHoleKg.toFixed(1)),
      totalAnfoKg: Math.round(totalAnfoKg),
      totalEmulsionKg: Math.round(totalEmulsionKg),
      totalBoostersCount,
      totalInHoleDetonatorsCount,
      totalSurfaceConnectorsCount,
      totalDetonatingCordMeters,
      calculatedPowderFactorKgTon: Number(calculatedPowderFactorKgTon.toFixed(3)),
      calculatedPowderFactorKgM3: Number(calculatedPowderFactorKgM3.toFixed(3)),
      estimatedTotalCostToman: Math.round(estimatedTotalCostToman),
      costPerTonRockToman: Math.round(costPerTonRockToman),
      stockAvailability: {
        hasEnoughAnfo,
        hasEnoughEmulsion,
        hasEnoughBoosters,
        hasEnoughDetonators,
        missingItemsText: missing
      }
    };
  }

  // ============================================
  // ثبت حواله خروج و مصرف مواد ناریه برای بلوک (Dispatch to Block)
  // با کسر آنی از انبار و صدور صورتجلسه آتشباری
  // ============================================
  public static executeBlockBlastDispatch(
    calcInput: BlockBlastCalculationInput,
    calcResult: BlockBlastCalculationResult,
    officerDetails: {
      contractorName: string;
      blasterName: string;
      supervisionApprover: string;
      clientApprover: string;
      permitNumber?: string;
      notes?: string;
    }
  ): { success: boolean; transactionIds: string[]; permitNumber: string } {
    const items = this.getItems();
    const permitNumber = officerDetails.permitNumber || `BLAST-ACT-${calcInput.blockCode.replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const createdTxIds: string[] = [];
    const timestamp = new Date().toISOString();

    // 1. کسر آنفو در صورت نیاز
    if (calcResult.totalAnfoKg > 0) {
      const idx = items.findIndex(i => i.code === 'EXP-ANFO-01');
      if (idx !== -1) {
        const item = items[idx];
        const prev = item.currentStock;
        item.currentStock = Math.max(0, prev - calcResult.totalAnfoKg);
        items[idx] = item;

        const tx: WarehouseTransaction = {
          id: `tx-${Date.now()}-anfo`,
          trackingCode: `TRX-BLAST-${Math.floor(100000 + Math.random() * 900000)}`,
          type: 'CONSUMPTION_BLOCK',
          itemId: item.id,
          itemName: item.nameFa,
          category: 'EXPLOSIVES',
          quantity: calcResult.totalAnfoKg,
          unit: item.unit,
          previousStock: prev,
          newStock: item.currentStock,
          targetBlockCode: calcInput.blockCode,
          targetBenchLevel: calcInput.benchLevel,
          contractorName: officerDetails.contractorName,
          operatorName: officerDetails.blasterName,
          authorizedBy: officerDetails.supervisionApprover,
          permitNumber: permitNumber,
          timestamp,
          unitCostToman: item.unitCostToman,
          totalCostToman: item.unitCostToman * calcResult.totalAnfoKg,
          notes: `مصرف آنفو جهت آتشباری ${calcInput.holeCount} چال در بلوک ${calcInput.blockCode} پله ${calcInput.benchLevel}`
        };
        createdTxIds.push(tx.id);
        this.saveTransactions([tx, ...this.getTransactions()]);
      }
    }

    // 2. کسر امولسیون در صورت نیاز
    if (calcResult.totalEmulsionKg > 0) {
      const idx = items.findIndex(i => i.code === 'EXP-EMUL-BULK');
      if (idx !== -1) {
        const item = items[idx];
        const prev = item.currentStock;
        item.currentStock = Math.max(0, prev - calcResult.totalEmulsionKg);
        items[idx] = item;

        const tx: WarehouseTransaction = {
          id: `tx-${Date.now()}-emul`,
          trackingCode: `TRX-BLAST-${Math.floor(100000 + Math.random() * 900000)}`,
          type: 'CONSUMPTION_BLOCK',
          itemId: item.id,
          itemName: item.nameFa,
          category: 'EXPLOSIVES',
          quantity: calcResult.totalEmulsionKg,
          unit: item.unit,
          previousStock: prev,
          newStock: item.currentStock,
          targetBlockCode: calcInput.blockCode,
          targetBenchLevel: calcInput.benchLevel,
          contractorName: officerDetails.contractorName,
          operatorName: officerDetails.blasterName,
          authorizedBy: officerDetails.supervisionApprover,
          permitNumber: permitNumber,
          timestamp,
          unitCostToman: item.unitCostToman,
          totalCostToman: item.unitCostToman * calcResult.totalEmulsionKg,
          notes: `مصرف ماتریکس امولسیون در بلوک ${calcInput.blockCode}`
        };
        createdTxIds.push(tx.id);
        this.saveTransactions([tx, ...this.getTransactions()]);
      }
    }

    // 3. کسر بوسترها
    if (calcResult.totalBoostersCount > 0) {
      const idx = items.findIndex(i => i.code === 'EXP-BST-500');
      if (idx !== -1) {
        const item = items[idx];
        const prev = item.currentStock;
        item.currentStock = Math.max(0, prev - calcResult.totalBoostersCount);
        items[idx] = item;

        const tx: WarehouseTransaction = {
          id: `tx-${Date.now()}-bst`,
          trackingCode: `TRX-BLAST-${Math.floor(100000 + Math.random() * 900000)}`,
          type: 'CONSUMPTION_BLOCK',
          itemId: item.id,
          itemName: item.nameFa,
          category: 'EXPLOSIVES',
          quantity: calcResult.totalBoostersCount,
          unit: item.unit,
          previousStock: prev,
          newStock: item.currentStock,
          targetBlockCode: calcInput.blockCode,
          targetBenchLevel: calcInput.benchLevel,
          contractorName: officerDetails.contractorName,
          operatorName: officerDetails.blasterName,
          authorizedBy: officerDetails.supervisionApprover,
          permitNumber: permitNumber,
          timestamp,
          unitCostToman: item.unitCostToman,
          totalCostToman: item.unitCostToman * calcResult.totalBoostersCount,
          notes: `خرج‌گذاری بوستر ۵۰۰g در بلوک ${calcInput.blockCode}`
        };
        createdTxIds.push(tx.id);
        this.saveTransactions([tx, ...this.getTransactions()]);
      }
    }

    // 4. کسر چاشنی‌های نانل
    if (calcResult.totalInHoleDetonatorsCount > 0) {
      const idx = items.findIndex(i => i.code === 'EXP-NONEL-IN');
      if (idx !== -1) {
        const item = items[idx];
        const prev = item.currentStock;
        item.currentStock = Math.max(0, prev - calcResult.totalInHoleDetonatorsCount);
        items[idx] = item;

        const tx: WarehouseTransaction = {
          id: `tx-${Date.now()}-nnl`,
          trackingCode: `TRX-BLAST-${Math.floor(100000 + Math.random() * 900000)}`,
          type: 'CONSUMPTION_BLOCK',
          itemId: item.id,
          itemName: item.nameFa,
          category: 'EXPLOSIVES',
          quantity: calcResult.totalInHoleDetonatorsCount,
          unit: item.unit,
          previousStock: prev,
          newStock: item.currentStock,
          targetBlockCode: calcInput.blockCode,
          targetBenchLevel: calcInput.benchLevel,
          contractorName: officerDetails.contractorName,
          operatorName: officerDetails.blasterName,
          authorizedBy: officerDetails.supervisionApprover,
          permitNumber: permitNumber,
          timestamp,
          unitCostToman: item.unitCostToman,
          totalCostToman: item.unitCostToman * calcResult.totalInHoleDetonatorsCount,
          notes: `چاشنی نانل درون‌چالی بلوک ${calcInput.blockCode}`
        };
        createdTxIds.push(tx.id);
        this.saveTransactions([tx, ...this.getTransactions()]);
      }
    }

    // ذخیره تغییرات انبار
    this.saveItems(items);

    return {
      success: true,
      transactionIds: createdTxIds,
      permitNumber
    };
  }

  // ============================================
  // ثبت سوخت‌گیری تجهیزات با کسر خودکار از مخزن
  // ============================================
  public static addRefuelingLog(log: Omit<EquipmentRefuelingLog, 'id' | 'timestamp'>): { success: boolean } {
    const tanks = this.getFuelTanks();
    const tankIdx = tanks.findIndex(t => t.id === log.fuelTankId);
    if (tankIdx !== -1) {
      tanks[tankIdx].currentLevelLiters = Math.max(0, tanks[tankIdx].currentLevelLiters - log.litersFilled);
      this.saveFuelTanks(tanks);
    }

    // کسر از موجودی کل کالا در انبار
    const items = this.getItems();
    const fuelItemIdx = items.findIndex(i => i.code === 'FUEL-DIESEL-01');
    if (fuelItemIdx !== -1) {
      items[fuelItemIdx].currentStock = Math.max(0, items[fuelItemIdx].currentStock - log.litersFilled);
      this.saveItems(items);
    }

    const newLog: EquipmentRefuelingLog = {
      ...log,
      id: `refuel-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    const logs = [newLog, ...this.getRefuelingLogs()];
    this.saveRefuelingLogs(logs);

    return { success: true };
  }
}
