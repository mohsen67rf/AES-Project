// src/modules/equipment/services/EquipmentService.ts

import { 
  EquipmentItem, 
  EquipmentPosition, 
  EquipmentStatus, 
  MineMapZone,
  DailyWorkRecord
} from '../domain/types/equipment.types';

const STORAGE_KEY = 'aes_equipment_fleet_v2';
const LAST_POSITION_AUDIT_KEY = 'aes_equipment_placement_audit_v2';

export const MINE_MAP_ZONES: MineMapZone[] = [
  {
    id: 'pit-central-1220',
    nameFa: 'پیت مرکزی - پله ۱۲۲۰ (جبهه اصلی استخراج)',
    nameEn: 'Central Pit - Bench 1220 (Main Ore Face)',
    benchLevel: 1220,
    type: 'PIT',
    bounds: { xMin: 35, xMax: 65, yMin: 35, yMax: 65 },
    color: '#06B6D4'
  },
  {
    id: 'pit-north-1260',
    nameFa: 'پیت شمالی - پله ۱۲۶۰ (جبهه باطله‌برداری)',
    nameEn: 'North Pit - Bench 1260 (Overburden)',
    benchLevel: 1260,
    type: 'PIT',
    bounds: { xMin: 20, xMax: 50, yMin: 15, yMax: 35 },
    color: '#3B82F6'
  },
  {
    id: 'pit-deep-1180',
    nameFa: 'پیت عمیق - پله ۱۱۸۰ (سولفور بالا)',
    nameEn: 'Deep Pit - Bench 1180 (High Sulfur)',
    benchLevel: 1180,
    type: 'PIT',
    bounds: { xMin: 45, xMax: 70, yMin: 55, yMax: 75 },
    color: '#8B5CF6'
  },
  {
    id: 'dump-east',
    nameFa: 'دپوی باطله شرقی (Waste Dump East)',
    nameEn: 'East Waste Dump',
    benchLevel: 1300,
    type: 'DUMP',
    bounds: { xMin: 75, xMax: 95, yMin: 20, yMax: 50 },
    color: '#F59E0B'
  },
  {
    id: 'dump-west',
    nameFa: 'دپوی باطله غربی (Waste Dump West)',
    nameEn: 'West Waste Dump',
    benchLevel: 1280,
    type: 'DUMP',
    bounds: { xMin: 5, xMax: 25, yMin: 40, yMax: 70 },
    color: '#D97706'
  },
  {
    id: 'crusher-hopper',
    nameFa: 'قیف سنگ‌شکن فکی اولیه (Primary Crusher)',
    nameEn: 'Primary Jaw Crusher Hopper',
    benchLevel: 1290,
    type: 'CRUSHER',
    bounds: { xMin: 70, xMax: 90, yMin: 65, yMax: 85 },
    color: '#EF4444'
  },
  {
    id: 'stockpile-high-grade',
    nameFa: 'دپوی دپوکس سنگ‌آهن عیار بالا (High Grade ROM)',
    nameEn: 'High Grade ROM Stockpile',
    benchLevel: 1290,
    type: 'STOCKPILE',
    bounds: { xMin: 75, xMax: 92, yMin: 82, yMax: 95 },
    color: '#10B981'
  },
  {
    id: 'workshop-service',
    nameFa: 'تعمیرگاه مرکزی و تعویض روغن (Heavy Fleet Workshop)',
    nameEn: 'Central Heavy Fleet Workshop',
    benchLevel: 1310,
    type: 'WORKSHOP',
    bounds: { xMin: 8, xMax: 25, yMin: 75, yMax: 92 },
    color: '#6366F1'
  },
  {
    id: 'fuel-station',
    nameFa: 'جایگاه سوخت‌گیری گازوئیل (Diesel Fuel Station)',
    nameEn: 'Diesel Refueling Station',
    benchLevel: 1305,
    type: 'FUEL_STATION',
    bounds: { xMin: 22, xMax: 35, yMin: 78, yMax: 92 },
    color: '#EC4899'
  },
  {
    id: 'blast-block-b14',
    nameFa: 'محدوده آماده‌سازی آتشباری بلوک B-14',
    nameEn: 'Blasting Pattern Block B-14',
    benchLevel: 1240,
    type: 'BLAST_BLOCK',
    bounds: { xMin: 32, xMax: 48, yMin: 45, yMax: 58 },
    color: '#F97316'
  }
];

export const INITIAL_EQUIPMENT_FLEET: EquipmentItem[] = [
  // بیل مکانیکی و شاول
  {
    id: 'eq-ex-101',
    code: 'EX-101',
    nameFa: 'بیل مکانیکی کوماتسو PC1250-8R (شاول اصلی)',
    nameEn: 'Komatsu PC1250-8R Hydraulic Excavator',
    model: 'PC1250-8R',
    brand: 'Komatsu',
    category: 'EXCAVATOR',
    emoji: '🏗️',
    capacityTonOrM3: '6.7 m³ (باکت سنگین)',
    status: 'ACTIVE',
    currentActivityFa: 'بارگیری سنگ‌آهن پرعیار در پله ۱۲۲۰ بلوک B-14',
    operatorName: 'قاسم رستمی',
    operatorPhone: '0912-3456781',
    currentShift: 'MORNING',
    totalEngineHours: 14850,
    position: {
      x: 48,
      y: 44,
      benchLevel: 1220,
      zoneId: 'pit-central-1220',
      zoneNameFa: 'پیت مرکزی - پله ۱۲۲۰ (جبهه اصلی استخراج)',
      headingDeg: 120,
      updatedAt: '1405/06/08 07:15',
      updatedBy: 'سرپرست دیسپاچینگ'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.8,
      idleHoursToday: 0.6,
      fuelConsumedLitersToday: 380,
      tripsCountToday: 0,
      efficiencyPct: 92
    },
    telemetry: {
      engineRpm: 1820,
      engineTempC: 84,
      oilPressureBar: 4.8,
      fuelLevelPct: 78,
      speedKmh: 0,
      hydraulicPressureBar: 340
    },
    contractor: 'شرکت معدنی تدبیرگران استخراج',
    lastServiceDate: '1405/05/20',
    nextServiceHours: 150,
    notes: 'پمپ هیدرولیک اصلی در بازرسی فنی اخیر تأیید شده است.'
  },
  {
    id: 'eq-ex-102',
    code: 'EX-102',
    nameFa: 'بیل مکانیکی هیتاچی EX1900-6',
    nameEn: 'Hitachi EX1900-6 Mining Shovel',
    model: 'EX1900-6',
    brand: 'Hitachi',
    category: 'EXCAVATOR',
    emoji: '🏗️',
    capacityTonOrM3: '11.0 m³ (شاول غول‌پیکر)',
    status: 'ACTIVE',
    currentActivityFa: 'باطله‌برداری جبهه شمالی پیت و بارگیری تراک‌های ۱۰۰ تن',
    operatorName: 'سعید مرادی',
    operatorPhone: '0913-9876541',
    currentShift: 'MORNING',
    totalEngineHours: 18920,
    position: {
      x: 32,
      y: 24,
      benchLevel: 1260,
      zoneId: 'pit-north-1260',
      zoneNameFa: 'پیت شمالی - پله ۱۲۶۰ (جبهه باطله‌برداری)',
      headingDeg: 80,
      updatedAt: '1405/06/08 06:45',
      updatedBy: 'سرپرست استخراج'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 7.1,
      idleHoursToday: 0.4,
      fuelConsumedLitersToday: 510,
      efficiencyPct: 95
    },
    telemetry: {
      engineRpm: 1780,
      engineTempC: 86,
      oilPressureBar: 5.1,
      fuelLevelPct: 62,
      speedKmh: 0,
      hydraulicPressureBar: 350
    },
    contractor: 'امانی کارفرما',
    lastServiceDate: '1405/05/12',
    nextServiceHours: 80
  },
  {
    id: 'eq-ex-103',
    code: 'EX-103',
    nameFa: 'بیل مکانیکی کاترپیلار CAT 390F L',
    nameEn: 'Caterpillar 390F L Excavator',
    model: '390F L',
    brand: 'Caterpillar',
    category: 'EXCAVATOR',
    emoji: '🏗️',
    capacityTonOrM3: '5.2 m³',
    status: 'STANDBY',
    currentActivityFa: 'آماده‌به‌کار در مجاورت بلوک حفاری جهت بارگیری شیفت بعد',
    operatorName: 'حسین افشار',
    operatorPhone: '0912-8877665',
    currentShift: 'MORNING',
    totalEngineHours: 9450,
    position: {
      x: 58,
      y: 62,
      benchLevel: 1180,
      zoneId: 'pit-deep-1180',
      zoneNameFa: 'پیت عمیق - پله ۱۱۸۰ (سولفور بالا)',
      headingDeg: 210,
      updatedAt: '1405/06/08 08:30',
      updatedBy: 'دیسپاچر پیت'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 4.2,
      idleHoursToday: 2.8,
      fuelConsumedLitersToday: 190,
      efficiencyPct: 72
    },
    telemetry: {
      engineRpm: 900,
      engineTempC: 76,
      oilPressureBar: 3.9,
      fuelLevelPct: 85,
      speedKmh: 0,
      hydraulicPressureBar: 280
    },
    contractor: 'شرکت معدنی تدبیرگران استخراج',
    lastServiceDate: '1405/06/01',
    nextServiceHours: 210
  },

  // لودرهای چرخ لاستیکی سنگین
  {
    id: 'eq-ld-201',
    code: 'LD-201',
    nameFa: 'لودر چرخ‌لاستیکی کاترپیلار CAT 992K',
    nameEn: 'Caterpillar 992K Wheel Loader',
    model: '992K',
    brand: 'Caterpillar',
    category: 'LOADER',
    emoji: '🚜',
    capacityTonOrM3: '12.3 m³ (۲۱ تن)',
    status: 'ACTIVE',
    currentActivityFa: 'تغذیه هاپر سنگ‌شکن فکی اولیه از دپوی سنگ‌آهن',
    operatorName: 'محمدرضا کاظمی',
    operatorPhone: '0912-1112233',
    currentShift: 'MORNING',
    totalEngineHours: 16400,
    position: {
      x: 78,
      y: 74,
      benchLevel: 1290,
      zoneId: 'crusher-hopper',
      zoneNameFa: 'قیف سنگ‌شکن فکی اولیه (Primary Crusher)',
      headingDeg: 340,
      updatedAt: '1405/06/08 06:30',
      updatedBy: 'مسئول سنگ‌شکن'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.9,
      idleHoursToday: 0.5,
      fuelConsumedLitersToday: 410,
      tripsCountToday: 48,
      efficiencyPct: 94
    },
    telemetry: {
      engineRpm: 1850,
      engineTempC: 87,
      oilPressureBar: 4.6,
      fuelLevelPct: 58,
      speedKmh: 12,
      hydraulicPressureBar: 310
    },
    contractor: 'امانی کارفرما',
    lastServiceDate: '1405/05/18',
    nextServiceHours: 110
  },
  {
    id: 'eq-ld-202',
    code: 'LD-202',
    nameFa: 'لودر سنگین کوماتسو WA600-6',
    nameEn: 'Komatsu WA600-6 Wheel Loader',
    model: 'WA600-6',
    brand: 'Komatsu',
    category: 'LOADER',
    emoji: '🚜',
    capacityTonOrM3: '6.4 m³ (۱۲ تن)',
    status: 'ACTIVE',
    currentActivityFa: 'بارگیری کامیون‌های دپوی باطله و تفکیک باطله‌های ریزدانه',
    operatorName: 'اصغر نوری',
    operatorPhone: '0913-3334455',
    currentShift: 'MORNING',
    totalEngineHours: 11200,
    position: {
      x: 82,
      y: 35,
      benchLevel: 1300,
      zoneId: 'dump-east',
      zoneNameFa: 'دپوی باطله شرقی (Waste Dump East)',
      headingDeg: 190,
      updatedAt: '1405/06/08 07:00',
      updatedBy: 'سرپرست دپوی باطله'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.2,
      idleHoursToday: 0.9,
      fuelConsumedLitersToday: 290,
      tripsCountToday: 32,
      efficiencyPct: 88
    },
    telemetry: {
      engineRpm: 1700,
      engineTempC: 83,
      oilPressureBar: 4.4,
      fuelLevelPct: 69,
      speedKmh: 9,
      hydraulicPressureBar: 295
    },
    contractor: 'شرکت معدنی تدبیرگران استخراج',
    lastServiceDate: '1405/05/25',
    nextServiceHours: 190
  },

  // دستگاه‌های حفاری و دریل واگن ناریه
  {
    id: 'eq-dr-301',
    code: 'DR-301',
    nameFa: 'دستگاه حفاری روتاری اطلس کپکو Pit Viper 271',
    nameEn: 'Atlas Copco Pit Viper 271 Rotary Drill',
    model: 'Pit Viper 271',
    brand: 'Atlas Copco / Epiroc',
    category: 'DRILL_RIG',
    emoji: '🔩',
    capacityTonOrM3: 'قطر چال 251 میلی‌متر (10 اینچ)',
    status: 'ACTIVE',
    currentActivityFa: 'حفاری چال‌های انفجاری الگوی شبکه در بلوک ناریه B-14',
    operatorName: 'مهندس بهمن خدادادی',
    operatorPhone: '0912-7778899',
    currentShift: 'MORNING',
    totalEngineHours: 8750,
    position: {
      x: 40,
      y: 52,
      benchLevel: 1240,
      zoneId: 'blast-block-b14',
      zoneNameFa: 'محدوده آماده‌سازی آتشباری بلوک B-14',
      headingDeg: 45,
      updatedAt: '1405/06/08 06:15',
      updatedBy: 'مهندس آتشباری'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.7,
      idleHoursToday: 0.8,
      fuelConsumedLitersToday: 360,
      drilledMetersToday: 184,
      efficiencyPct: 91
    },
    telemetry: {
      engineRpm: 1900,
      engineTempC: 88,
      oilPressureBar: 5.2,
      fuelLevelPct: 71,
      speedKmh: 0,
      hydraulicPressureBar: 360
    },
    contractor: 'امانی کارفرما',
    lastServiceDate: '1405/05/28',
    nextServiceHours: 130,
    notes: 'سرمته روتاری با کارکرد ۴۵۰ متر در وضعیت بهینه قرار دارد.'
  },
  {
    id: 'eq-dr-302',
    code: 'DR-302',
    nameFa: 'دریل واگن هیدرولیک سندویک Sandvik DP1500i',
    nameEn: 'Sandvik DP1500i Top Hammer Drill Rig',
    model: 'DP1500i',
    brand: 'Sandvik',
    category: 'DRILL_RIG',
    emoji: '🔩',
    capacityTonOrM3: 'قطر چال 127 میلی‌متر',
    status: 'ACTIVE',
    currentActivityFa: 'حفاری چال‌های پاشنه‌کوب و پیش‌شکافی در پله ۱۲۶۰',
    operatorName: 'فرهاد طاهری',
    operatorPhone: '0913-2224466',
    currentShift: 'MORNING',
    totalEngineHours: 6400,
    position: {
      x: 28,
      y: 28,
      benchLevel: 1260,
      zoneId: 'pit-north-1260',
      zoneNameFa: 'پیت شمالی - پله ۱۲۶۰ (جبهه باطله‌برداری)',
      headingDeg: 135,
      updatedAt: '1405/06/08 07:30',
      updatedBy: 'سرپرست حفاری'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.1,
      idleHoursToday: 1.1,
      fuelConsumedLitersToday: 240,
      drilledMetersToday: 210,
      efficiencyPct: 87
    },
    telemetry: {
      engineRpm: 1800,
      engineTempC: 84,
      oilPressureBar: 4.7,
      fuelLevelPct: 82,
      speedKmh: 0,
      hydraulicPressureBar: 330
    },
    contractor: 'شرکت حفاران پویا معدن',
    lastServiceDate: '1405/05/15',
    nextServiceHours: 95
  },

  // بولدوزرهای سنگین شنی‌دار
  {
    id: 'eq-dz-401',
    code: 'DZ-401',
    nameFa: 'بولدوزر فوق سنگین کوماتسو D375A-6 (تیغه ریپر دار)',
    nameEn: 'Komatsu D375A-6 Heavy Crawler Dozer',
    model: 'D375A-6',
    brand: 'Komatsu',
    category: 'BULLDOZER',
    emoji: '🚧',
    capacityTonOrM3: 'تیغه 22 m³ (ریپر تک ساق)',
    status: 'ACTIVE',
    currentActivityFa: 'ریپرزنی و تسطیح جبهه باطله و پاکسازی پاشنه پله ۱۲۲۰',
    operatorName: 'اکبر شاه‌حسینی',
    operatorPhone: '0912-6655443',
    currentShift: 'MORNING',
    totalEngineHours: 13800,
    position: {
      x: 54,
      y: 40,
      benchLevel: 1220,
      zoneId: 'pit-central-1220',
      zoneNameFa: 'پیت مرکزی - پله ۱۲۲۰ (جبهه اصلی استخراج)',
      headingDeg: 270,
      updatedAt: '1405/06/08 06:40',
      updatedBy: 'سرپرست پیت'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.5,
      idleHoursToday: 0.7,
      fuelConsumedLitersToday: 420,
      efficiencyPct: 90
    },
    telemetry: {
      engineRpm: 1750,
      engineTempC: 86,
      oilPressureBar: 4.8,
      fuelLevelPct: 65,
      speedKmh: 4,
      hydraulicPressureBar: 320
    },
    contractor: 'امانی کارفرما',
    lastServiceDate: '1405/05/19',
    nextServiceHours: 140
  },
  {
    id: 'eq-dz-402',
    code: 'DZ-402',
    nameFa: 'بولدوزر سنگین کاترپیلار CAT D9T',
    nameEn: 'Caterpillar D9T Crawler Dozer',
    model: 'D9T',
    brand: 'Caterpillar',
    category: 'BULLDOZER',
    emoji: '🚧',
    capacityTonOrM3: 'تیغه 16.4 m³',
    status: 'ACTIVE',
    currentActivityFa: 'پخش و تسطیح دپوی باطله شرقی و ایجاد لبه‌های ایمنی (Berm)',
    operatorName: 'یوسف اسدی',
    operatorPhone: '0913-8899001',
    currentShift: 'MORNING',
    totalEngineHours: 12100,
    position: {
      x: 88,
      y: 42,
      benchLevel: 1300,
      zoneId: 'dump-east',
      zoneNameFa: 'دپوی باطله شرقی (Waste Dump East)',
      headingDeg: 160,
      updatedAt: '1405/06/08 07:10',
      updatedBy: 'مسئول دپو'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.8,
      idleHoursToday: 0.5,
      fuelConsumedLitersToday: 390,
      efficiencyPct: 93
    },
    telemetry: {
      engineRpm: 1800,
      engineTempC: 85,
      oilPressureBar: 4.5,
      fuelLevelPct: 70,
      speedKmh: 5,
      hydraulicPressureBar: 310
    },
    contractor: 'شرکت معدنی تدبیرگران استخراج',
    lastServiceDate: '1405/05/22',
    nextServiceHours: 160
  },

  // چکش‌های هیدرولیکی (پیکور سنگین)
  {
    id: 'eq-hb-501',
    code: 'HB-501',
    nameFa: 'چکش هیدرولیکی کوماتسو PC800 با پیکور سنگین Furukawa F70',
    nameEn: 'Komatsu PC800 with Furukawa F70 Hydraulic Breaker',
    model: 'PC800 + Furukawa F70',
    brand: 'Komatsu / Furukawa',
    category: 'HYDRAULIC_BREAKER',
    emoji: '🔨',
    capacityTonOrM3: 'انرژی ضربه 15,000 ژول (خردایش قلوه‌سنگ)',
    status: 'ACTIVE',
    currentActivityFa: 'خردایش ثانویه قلوه‌سنگ‌های بزرگ در نزدیکی قیف سنگ‌شکن',
    operatorName: 'رسول اکبری',
    operatorPhone: '0912-4455667',
    currentShift: 'MORNING',
    totalEngineHours: 9800,
    position: {
      x: 74,
      y: 68,
      benchLevel: 1290,
      zoneId: 'crusher-hopper',
      zoneNameFa: 'قیف سنگ‌شکن فکی اولیه (Primary Crusher)',
      headingDeg: 60,
      updatedAt: '1405/06/08 07:45',
      updatedBy: 'مسئول سنگ‌شکن'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 5.8,
      idleHoursToday: 1.4,
      fuelConsumedLitersToday: 260,
      efficiencyPct: 84
    },
    telemetry: {
      engineRpm: 1650,
      engineTempC: 82,
      oilPressureBar: 4.6,
      fuelLevelPct: 75,
      speedKmh: 0,
      hydraulicPressureBar: 355
    },
    contractor: 'امانی کارفرما',
    lastServiceDate: '1405/05/30',
    nextServiceHours: 70,
    notes: 'قلم پیکور دیروز تعویض و گریس‌کاری خودکار کالیبره شد.'
  },

  // تراک‌های ۱۰۰ تن سنگین
  {
    id: 'eq-dt-100-01',
    code: 'DT-100-01',
    nameFa: 'دامپتراک ۱۰۰ تن کوماتسو HD785-7 (شماره ۱)',
    nameEn: 'Komatsu HD785-7 Mining Dump Truck (100T)',
    model: 'HD785-7',
    brand: 'Komatsu',
    category: 'DUMP_TRUCK_100T',
    emoji: '🚛',
    capacityTonOrM3: '91 تن (60 m³)',
    status: 'HAULING',
    currentActivityFa: 'حمل سنگ‌آهن عیار بالا از شاول EX-101 به دپوی سنگ‌شکن',
    operatorName: 'مجید رضایی',
    operatorPhone: '0912-1001001',
    currentShift: 'MORNING',
    totalEngineHours: 19400,
    position: {
      x: 62,
      y: 56,
      benchLevel: 1250,
      zoneId: 'pit-central-1220',
      zoneNameFa: 'رمپ شیب‌دار پیت مرکزی به سنگ‌شکن',
      headingDeg: 55,
      updatedAt: '1405/06/08 08:10',
      updatedBy: 'سیستم موقعیت‌یاب خودکار'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 7.2,
      idleHoursToday: 0.3,
      fuelConsumedLitersToday: 540,
      tripsCountToday: 18,
      efficiencyPct: 96
    },
    telemetry: {
      engineRpm: 1950,
      engineTempC: 87,
      oilPressureBar: 5.0,
      fuelLevelPct: 61,
      speedKmh: 24,
      payloadTons: 94.5
    },
    contractor: 'شرکت معدنی تدبیرگران استخراج',
    lastServiceDate: '1405/05/14',
    nextServiceHours: 120
  },
  {
    id: 'eq-dt-100-02',
    code: 'DT-100-02',
    nameFa: 'دامپتراک ۱۰۰ تن کوماتسو HD785-7 (شماره ۲)',
    nameEn: 'Komatsu HD785-7 Mining Dump Truck (100T)',
    model: 'HD785-7',
    brand: 'Komatsu',
    category: 'DUMP_TRUCK_100T',
    emoji: '🚛',
    capacityTonOrM3: '91 تن (60 m³)',
    status: 'ACTIVE',
    currentActivityFa: 'بارگیری در زیر شاول EX-102 (باطله‌برداری پیت شمالی)',
    operatorName: 'بهزاد حسنی',
    operatorPhone: '0912-1001002',
    currentShift: 'MORNING',
    totalEngineHours: 17800,
    position: {
      x: 35,
      y: 22,
      benchLevel: 1260,
      zoneId: 'pit-north-1260',
      zoneNameFa: 'پیت شمالی - پله ۱۲۶۰ (جبهه باطله‌برداری)',
      headingDeg: 90,
      updatedAt: '1405/06/08 08:12',
      updatedBy: 'سیستم دیسپاچینگ'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.9,
      idleHoursToday: 0.4,
      fuelConsumedLitersToday: 490,
      tripsCountToday: 15,
      efficiencyPct: 94
    },
    telemetry: {
      engineRpm: 1200,
      engineTempC: 84,
      oilPressureBar: 4.8,
      fuelLevelPct: 68,
      speedKmh: 0,
      payloadTons: 42.0
    },
    contractor: 'امانی کارفرما',
    lastServiceDate: '1405/05/21',
    nextServiceHours: 170
  },
  {
    id: 'eq-dt-100-03',
    code: 'DT-100-03',
    nameFa: 'دامپتراک ۱۰۰ تن کاترپیلار CAT 777G',
    nameEn: 'Caterpillar 777G Mining Truck (100T)',
    model: '777G',
    brand: 'Caterpillar',
    category: 'DUMP_TRUCK_100T',
    emoji: '🚛',
    capacityTonOrM3: '98 تن (64 m³)',
    status: 'HAULING',
    currentActivityFa: 'تخلیه باطله در دپوی شرقی تراز ۱۳۰۰',
    operatorName: 'مرتضی پناهی',
    operatorPhone: '0912-1001003',
    currentShift: 'MORNING',
    totalEngineHours: 14200,
    position: {
      x: 84,
      y: 26,
      benchLevel: 1300,
      zoneId: 'dump-east',
      zoneNameFa: 'دپوی باطله شرقی (Waste Dump East)',
      headingDeg: 240,
      updatedAt: '1405/06/08 08:15',
      updatedBy: 'موقعیت‌یاب دپو'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 7.0,
      idleHoursToday: 0.3,
      fuelConsumedLitersToday: 520,
      tripsCountToday: 17,
      efficiencyPct: 95
    },
    telemetry: {
      engineRpm: 1700,
      engineTempC: 85,
      oilPressureBar: 4.9,
      fuelLevelPct: 55,
      speedKmh: 8,
      payloadTons: 97.2
    },
    contractor: 'شرکت معدنی تدبیرگران استخراج',
    lastServiceDate: '1405/05/29',
    nextServiceHours: 230
  },

  // تراک‌های ۶۰ تن متوسط
  {
    id: 'eq-dt-60-01',
    code: 'DT-60-01',
    nameFa: 'دامپتراک ۶۰ تن ترکس Terex TR60 (شماره ۱)',
    nameEn: 'Terex TR60 Rigid Dump Truck (60T)',
    model: 'TR60',
    brand: 'Terex',
    category: 'DUMP_TRUCK_60T',
    emoji: '🚚',
    capacityTonOrM3: '55 تن (35 m³)',
    status: 'HAULING',
    currentActivityFa: 'تردد در جاده دسترسی پیت غربی با بار سنگ‌آهن متوسط عیار',
    operatorName: 'محسن کریمی',
    operatorPhone: '0913-6006001',
    currentShift: 'MORNING',
    totalEngineHours: 15300,
    position: {
      x: 30,
      y: 60,
      benchLevel: 1240,
      zoneId: 'pit-central-1220',
      zoneNameFa: 'رمپ جاده غربی تراز ۱۲۴۰',
      headingDeg: 310,
      updatedAt: '1405/06/08 08:05',
      updatedBy: 'سیستم دیسپاچینگ'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.6,
      idleHoursToday: 0.6,
      fuelConsumedLitersToday: 370,
      tripsCountToday: 14,
      efficiencyPct: 91
    },
    telemetry: {
      engineRpm: 1850,
      engineTempC: 83,
      oilPressureBar: 4.7,
      fuelLevelPct: 64,
      speedKmh: 28,
      payloadTons: 56.0
    },
    contractor: 'امانی کارفرما',
    lastServiceDate: '1405/05/17',
    nextServiceHours: 105
  },
  {
    id: 'eq-dt-60-02',
    code: 'DT-60-02',
    nameFa: 'دامپتراک ۶۰ تن کاترپیلار CAT 773E',
    nameEn: 'Caterpillar 773E Dump Truck (60T)',
    model: '773E',
    brand: 'Caterpillar',
    category: 'DUMP_TRUCK_60T',
    emoji: '🚚',
    capacityTonOrM3: '55 تن (35.2 m³)',
    status: 'REFUELING',
    currentActivityFa: 'سوخت‌گیری در جایگاه سوخت مرکزی گازوئیل',
    operatorName: 'داریوش شفیعی',
    operatorPhone: '0913-6006002',
    currentShift: 'MORNING',
    totalEngineHours: 13900,
    position: {
      x: 28,
      y: 85,
      benchLevel: 1305,
      zoneId: 'fuel-station',
      zoneNameFa: 'جایگاه سوخت‌گیری گازوئیل (Diesel Fuel Station)',
      headingDeg: 180,
      updatedAt: '1405/06/08 08:20',
      updatedBy: 'تانکربان شیفت'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 5.9,
      idleHoursToday: 1.2,
      fuelConsumedLitersToday: 340,
      tripsCountToday: 12,
      efficiencyPct: 83
    },
    telemetry: {
      engineRpm: 750,
      engineTempC: 78,
      oilPressureBar: 3.8,
      fuelLevelPct: 98,
      speedKmh: 0,
      payloadTons: 0
    },
    contractor: 'شرکت معدنی تدبیرگران استخراج',
    lastServiceDate: '1405/05/23',
    nextServiceHours: 180
  },

  // تراک‌های ۳۵ تن جاده‌ای و معدنی
  {
    id: 'eq-dt-35-01',
    code: 'DT-35-01',
    nameFa: 'کامیون کمپرسی ۳۵ تن بنز مایلر ۲۶۲۸ جفت',
    nameEn: 'Mercedes-Benz 2628 Myler 35T Tipper',
    model: '2628 Myler',
    brand: 'Mercedes-Benz',
    category: 'DUMP_TRUCK_35T',
    emoji: '🛻',
    capacityTonOrM3: '26 تن (18 m³)',
    status: 'ACTIVE',
    currentActivityFa: 'انتقال سنگ‌آهن دانه‌بندی شده از دپوی خروجی به دپوی کارخانه',
    operatorName: 'عباس زارعی',
    operatorPhone: '0912-3503501',
    currentShift: 'MORNING',
    totalEngineHours: 21500,
    position: {
      x: 85,
      y: 88,
      benchLevel: 1290,
      zoneId: 'stockpile-high-grade',
      zoneNameFa: 'دپوی دپوکس سنگ‌آهن عیار بالا (High Grade ROM)',
      headingDeg: 20,
      updatedAt: '1405/06/08 07:50',
      updatedBy: 'سرپرست انبار'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.4,
      idleHoursToday: 0.8,
      fuelConsumedLitersToday: 210,
      tripsCountToday: 22,
      efficiencyPct: 89
    },
    telemetry: {
      engineRpm: 1600,
      engineTempC: 81,
      oilPressureBar: 4.2,
      fuelLevelPct: 74,
      speedKmh: 18,
      payloadTons: 25.4
    },
    contractor: 'پیمانکار حمل و نقل کویر',
    lastServiceDate: '1405/05/27',
    nextServiceHours: 90
  },
  {
    id: 'eq-dt-35-02',
    code: 'DT-35-02',
    nameFa: 'کامیون کمپرسی ۳۵ تن ولوو FMX 460',
    nameEn: 'Volvo FMX 460 35T Heavy Tipper',
    model: 'FMX 460',
    brand: 'Volvo',
    category: 'DUMP_TRUCK_35T',
    emoji: '🛻',
    capacityTonOrM3: '28 تن (20 m³)',
    status: 'HAULING',
    currentActivityFa: 'حمل مصالح زیرسازی جاده به رمپ پیت عمیق',
    operatorName: 'جواد علیزاده',
    operatorPhone: '0912-3503502',
    currentShift: 'MORNING',
    totalEngineHours: 11400,
    position: {
      x: 52,
      y: 68,
      benchLevel: 1190,
      zoneId: 'pit-deep-1180',
      zoneNameFa: 'مسیر دسترسی پیت عمیق تراز ۱۱۹۰',
      headingDeg: 140,
      updatedAt: '1405/06/08 08:00',
      updatedBy: 'ناظر راهسازی'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.7,
      idleHoursToday: 0.5,
      fuelConsumedLitersToday: 230,
      tripsCountToday: 20,
      efficiencyPct: 93
    },
    telemetry: {
      engineRpm: 1720,
      engineTempC: 82,
      oilPressureBar: 4.5,
      fuelLevelPct: 80,
      speedKmh: 32,
      payloadTons: 27.8
    },
    contractor: 'پیمانکار حمل و نقل کویر',
    lastServiceDate: '1405/05/16',
    nextServiceHours: 145
  },

  // گریدر تسطیح جاده‌های معدنی
  {
    id: 'eq-gr-701',
    code: 'GR-701',
    nameFa: 'گریدر سنگین کاترپیلار CAT 16M (تسطیح رمپ و جاده‌های باربری)',
    nameEn: 'Caterpillar 16M Motor Grader',
    model: '16M',
    brand: 'Caterpillar',
    category: 'MOTOR_GRADER',
    emoji: '🚜',
    capacityTonOrM3: 'تیغه 4.9 متری',
    status: 'ACTIVE',
    currentActivityFa: 'شیب‌بندی، رفع دست‌انداز و نگهداری رمپ اصلی تردد دامپتراک‌ها',
    operatorName: 'منصور بهرامی',
    operatorPhone: '0912-7007001',
    currentShift: 'MORNING',
    totalEngineHours: 10600,
    position: {
      x: 50,
      y: 35,
      benchLevel: 1250,
      zoneId: 'pit-central-1220',
      zoneNameFa: 'رمپ اصلی تردد پیت مرکزی',
      headingDeg: 215,
      updatedAt: '1405/06/08 07:25',
      updatedBy: 'سرپرست راهسازی معدن'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.5,
      idleHoursToday: 0.7,
      fuelConsumedLitersToday: 310,
      efficiencyPct: 90
    },
    telemetry: {
      engineRpm: 1700,
      engineTempC: 84,
      oilPressureBar: 4.6,
      fuelLevelPct: 73,
      speedKmh: 7,
      hydraulicPressureBar: 290
    },
    contractor: 'امانی کارفرما',
    lastServiceDate: '1405/05/11',
    nextServiceHours: 85
  },

  // تانکر آب‌پاش فرونشانی گرد و غبار
  {
    id: 'eq-wt-801',
    code: 'WT-801',
    nameFa: 'تانکر آب‌پاش بنز ۲۶۳۱ با پمپ هیدرولیک فشار قوی (۲۵ هزار لیتر)',
    nameEn: 'Mercedes-Benz 2631 Dust Suppression Water Truck',
    model: '2631 Water 25k',
    brand: 'Mercedes-Benz',
    category: 'WATER_TRUCK',
    emoji: '💧',
    capacityTonOrM3: '25,000 لیتر آب',
    status: 'ACTIVE',
    currentActivityFa: 'آب‌پاشی مستمر جاده‌های باربری جهت تثبیت دید رانندگان و ایمنی',
    operatorName: 'حامد شجاعی',
    operatorPhone: '0912-8008001',
    currentShift: 'MORNING',
    totalEngineHours: 14700,
    position: {
      x: 44,
      y: 30,
      benchLevel: 1255,
      zoneId: 'pit-north-1260',
      zoneNameFa: 'جاده ارتباطی پیت شمالی به رمپ مرکزی',
      headingDeg: 175,
      updatedAt: '1405/06/08 08:00',
      updatedBy: 'ناظر ایمنی و بهداشت (HSE)'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.3,
      idleHoursToday: 0.9,
      fuelConsumedLitersToday: 195,
      tripsCountToday: 8,
      efficiencyPct: 87
    },
    telemetry: {
      engineRpm: 1550,
      engineTempC: 80,
      oilPressureBar: 4.1,
      fuelLevelPct: 84,
      speedKmh: 14
    },
    contractor: 'امانی کارفرما (واحد HSE)',
    lastServiceDate: '1405/05/26',
    nextServiceHours: 160
  },

  // غلطک راهسازی
  {
    id: 'eq-cp-851',
    code: 'CP-851',
    nameFa: 'غلطک خودکشش ویبره هَم Hamm 3411',
    nameEn: 'Hamm 3411 Soil & Road Compactor',
    model: '3411',
    brand: 'Hamm',
    category: 'COMPACTOR',
    emoji: '🛞',
    capacityTonOrM3: 'وزن عملیاتی ۱۲ تن',
    status: 'STANDBY',
    currentActivityFa: 'آماده تراکم‌سازی روکش شن‌ریزی رمپ جدید پیت غربی',
    operatorName: 'پرویز صادقی',
    operatorPhone: '0913-8518511',
    currentShift: 'MORNING',
    totalEngineHours: 7200,
    position: {
      x: 18,
      y: 55,
      benchLevel: 1260,
      zoneId: 'dump-west',
      zoneNameFa: 'بستر رمپ جدید پیت غربی',
      headingDeg: 90,
      updatedAt: '1405/06/08 07:35',
      updatedBy: 'سرپرست راهسازی'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 3.8,
      idleHoursToday: 3.2,
      fuelConsumedLitersToday: 110,
      efficiencyPct: 68
    },
    telemetry: {
      engineRpm: 800,
      engineTempC: 74,
      oilPressureBar: 3.9,
      fuelLevelPct: 89,
      speedKmh: 0
    },
    contractor: 'شرکت معدنی تدبیرگران استخراج',
    lastServiceDate: '1405/05/18',
    nextServiceHours: 195
  },

  // خودرو سوخت‌رسان سیار
  {
    id: 'eq-ft-901',
    code: 'FT-901',
    nameFa: 'کامیون سوخت‌رسان سیار ایسوزو با دیسپنسر دیجیتال (۱۲ هزار لیتر)',
    nameEn: 'Isuzu Mobile Fuel & Lube Service Truck',
    model: 'FVZ 1400 Fuel',
    brand: 'Isuzu',
    category: 'SERVICE_FUEL_TRUCK',
    emoji: '⛽',
    capacityTonOrM3: '12,000 لیتر گازوئیل + مخازن روغن هیدرولیک',
    status: 'ACTIVE',
    currentActivityFa: 'سوخت‌رسانی سیار به شاول‌ها و دریل‌های مستقر در کف پیت',
    operatorName: 'مرتضی کریمی (تانکربان)',
    operatorPhone: '0912-9019011',
    currentShift: 'MORNING',
    totalEngineHours: 10200,
    position: {
      x: 44,
      y: 48,
      benchLevel: 1220,
      zoneId: 'pit-central-1220',
      zoneNameFa: 'پیت مرکزی در مجاورت شاول EX-101',
      headingDeg: 300,
      updatedAt: '1405/06/08 08:05',
      updatedBy: 'مسئول توزیع سوخت'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 6.1,
      idleHoursToday: 1.1,
      fuelConsumedLitersToday: 140,
      tripsCountToday: 6,
      efficiencyPct: 85
    },
    telemetry: {
      engineRpm: 1400,
      engineTempC: 80,
      oilPressureBar: 4.2,
      fuelLevelPct: 88,
      speedKmh: 10
    },
    contractor: 'امانی کارفرما (واحد انبار و لجستیک سوخت)',
    lastServiceDate: '1405/05/20',
    nextServiceHours: 115
  },

  // دیزل ژنراتور اضطراری
  {
    id: 'eq-gn-951',
    code: 'GN-951',
    nameFa: 'دیزل ژنراتور پرتابل کامینز Cummins 500kVA',
    nameEn: 'Cummins 500kVA Portable Diesel Generator',
    model: 'QSX15-G8',
    brand: 'Cummins',
    category: 'DIESEL_GENERATOR',
    emoji: '⚡',
    capacityTonOrM3: 'توان 500 kVA (برق روشنایی شبانه پیت)',
    status: 'STANDBY',
    currentActivityFa: 'آماده‌به‌کار جهت تأمین روشنایی برج‌های نوری و پمپ‌های تخلیه آب',
    operatorName: 'مهرداد ایمانی (تکنسین برق)',
    operatorPhone: '0912-9519511',
    currentShift: 'MORNING',
    totalEngineHours: 5100,
    position: {
      x: 60,
      y: 72,
      benchLevel: 1180,
      zoneId: 'pit-deep-1180',
      zoneNameFa: 'پیت عمیق پله ۱۱۸۰',
      headingDeg: 0,
      updatedAt: '1405/06/08 06:00',
      updatedBy: 'سرپرست تأسیسات'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 0.5,
      idleHoursToday: 0.0,
      fuelConsumedLitersToday: 35,
      efficiencyPct: 100
    },
    telemetry: {
      engineRpm: 0,
      engineTempC: 25,
      oilPressureBar: 0,
      fuelLevelPct: 95,
      speedKmh: 0
    },
    contractor: 'امانی کارفرما',
    lastServiceDate: '1405/05/10',
    nextServiceHours: 240
  },

  // پمپ آب تخلیه کف پیت
  {
    id: 'eq-wp-961',
    code: 'WP-961',
    nameFa: 'الکتروپمپ لجن‌کش صنعتی فلایگت Flygt 75kW (پمپاز کف‌پیت)',
    nameEn: 'Flygt 75kW Submersible Slurry Dewatering Pump',
    model: 'Flygt 3301',
    brand: 'Xylem / Flygt',
    category: 'PIT_WATER_PUMP',
    emoji: '🌊',
    capacityTonOrM3: 'دبی 350 m³/h',
    status: 'ACTIVE',
    currentActivityFa: 'پمپاژ آب‌های زیرزمینی و بارندگی از گودال کف پیت به حوضچه تبخیر',
    operatorName: 'سیستم اتوماسیون هوشمند',
    operatorPhone: '0912-9619611',
    currentShift: 'MORNING',
    totalEngineHours: 8900,
    position: {
      x: 64,
      y: 76,
      benchLevel: 1175,
      zoneId: 'pit-deep-1180',
      zoneNameFa: 'گودال کف پیت عمیق (سامپ مرکزی)',
      headingDeg: 0,
      updatedAt: '1405/06/08 06:00',
      updatedBy: 'اتوماسیون ایستگاه پمپاژ'
    },
    dailyStats: {
      shiftStartTime: '06:00',
      operatingHoursToday: 7.2,
      idleHoursToday: 0.0,
      fuelConsumedLitersToday: 0,
      efficiencyPct: 98
    },
    telemetry: {
      engineRpm: 1480,
      engineTempC: 58,
      oilPressureBar: 0,
      fuelLevelPct: 100,
      speedKmh: 0
    },
    contractor: 'امانی کارفرما',
    lastServiceDate: '1405/05/05',
    nextServiceHours: 320
  }
];

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

    const removed = list.splice(index, 1);
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
