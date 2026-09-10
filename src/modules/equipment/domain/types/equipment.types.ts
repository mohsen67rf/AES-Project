// src/modules/equipment/domain/types/equipment.types.ts

export type EquipmentCategory =
  | 'EXCAVATOR'          // بیل مکانیکی و شاول هیدرولیکی
  | 'LOADER'             // لودر چرخ‌لاستیکی سنگین
  | 'DRILL_RIG'          // دستگاه حفاری و دریل واگن ناریه
  | 'BULLDOZER'          // بولدوزر سنگین شنی‌دار
  | 'HYDRAULIC_BREAKER'  // چکش هیدرولیکی (پیکور)
  | 'DUMP_TRUCK_100T'    // دامپتراک ۱۰۰ تن سنگین
  | 'DUMP_TRUCK_60T'     // دامپتراک ۶۰ تن متوسط
  | 'DUMP_TRUCK_35T'     // تراک ۳۵ تن / جاده‌ای
  | 'MOTOR_GRADER'       // گریدر تسطیح جاده‌های معدنی
  | 'WATER_TRUCK'        // تانکر آب‌پاش فرونشانی گردوغبار
  | 'COMPACTOR'          // غلطک راهسازی معدن
  | 'SERVICE_FUEL_TRUCK' // خودروی سوخت‌رسان و سرویس
  | 'DIESEL_GENERATOR'   // دیزل ژنراتور سیار
  | 'PIT_WATER_PUMP';    // پمپ تخلیه آب پیت

export type EquipmentStatus = 
  | 'ACTIVE'      // در حال کار / فعال
  | 'HAULING'     // در حال حمل بار یا تردد در مسیر
  | 'STANDBY'     // آماده‌به‌کار / منتظر تراک یا بارگیری
  | 'REFUELING'   // در حال سوخت‌گیری / سرویس روانکاری
  | 'MAINTENANCE' // در حال تعمیر / متوقف فنی
  | 'OFF';        // خاموش / پایان شیفت

export interface EquipmentPosition {
  x: number;             // درصد موقعیت افقی در نقشه (0 تا 100)
  y: number;             // درصد موقعیت عمودی در نقشه (0 تا 100)
  benchLevel: number;    // تراز پله (متر نسبت به سطح دریا e.g. 1220)
  zoneId: string;        // شناسه زون یا بخش (e.g. pit-central, pit-north, dump-east, crusher, workshop)
  zoneNameFa: string;    // نام فارسی بخش (e.g. پله ۱۲۲۰ پیت مرکزی)
  headingDeg?: number;   // زاویه چرخش جهت ماشین (0 تا 360 درجه)
  updatedAt: string;     // زمان آخرین جانمایی
  updatedBy: string;     // کاربر جانمایی‌کننده
}

export interface EquipmentTelemetry {
  engineRpm: number;
  engineTempC: number;
  oilPressureBar: number;
  fuelLevelPct: number;
  speedKmh: number;
  payloadTons?: number;
  hydraulicPressureBar?: number;
}

export interface DailyWorkRecord {
  shiftStartTime: string;     // ساعت شروع شیفت e.g. "06:00"
  operatingHoursToday: number;// ساعت کارکرد واقعی از ابتدای روز تا لحظه جاری
  idleHoursToday: number;     // زمان درجا کارکردن یا توقف آماده‌به‌کار
  fuelConsumedLitersToday: number; // سوخت مصرف‌شده از ابتدای روز
  tripsCountToday?: number;   // تعداد سرویس حمل (برای تراک‌ها)
  drilledMetersToday?: number;// متراژ حفاری امروز (برای دریل‌ها)
  efficiencyPct: number;      // راندمان شیفت (درصد)
}

export interface WorkingFaceOperation {
  faceName: string;            // نام جبهه‌کار مثلا «جبهه‌کار پله ۱۰۴۰ - بلوک 1040 B 32»
  benchLevel: number;         // تراز پله جبهه‌کار
  blockCode?: string;         // کد بلوک
  operatingHours: number;     // ساعت فعالیت در این جبهه‌کار
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  date: string;               // تاریخ فعالیت
  notes?: string;
}

export interface EquipmentItem {
  id: string;
  code: string;               // کد منحصر به فرد ماشین (e.g. EX-101, DT-100-01, DR-301)
  nameFa: string;             // نام فارسی (e.g. بیل مکانیکی کوماتسو PC1250-8R)
  nameEn: string;             // نام انگلیسی (e.g. Komatsu PC1250-8R Excavator)
  model: string;              // مدل تجاری (e.g. PC1250-8R)
  brand: string;              // برند سازنده (e.g. Komatsu, Caterpillar, Atlas Copco)
  category: EquipmentCategory;
  emoji: string;              // ایموجی اختصاصی و حرفه‌ای
  capacityTonOrM3?: string;   // ظرفیت باکت یا بار (e.g. 100 Ton, 6.7 m³)
  status: EquipmentStatus;
  currentActivityFa: string;  // شرح فعالیت فعلی (e.g. در حال بارگیری پله ۱۲۲۰ بلوک B-14)
  activeFaceFa?: string;       // جبهه‌کار فعال فعلی
  operatingHoursShift?: number;// ساعت کارکرد در شیفت جاری
  workingFacesHistory?: WorkingFaceOperation[]; // سابقه فعالیت در جبهه‌کارهای مختلف با ساعات کارکرد
  operatorName: string;       // نام راننده / اپراتور
  operatorPhone?: string;     // شماره تماس اپراتور
  currentShift: 'MORNING' | 'EVENING' | 'NIGHT';
  totalEngineHours: number;   // ساعت کارکرد کل کنتور موتور
  position: EquipmentPosition;
  dailyStats: DailyWorkRecord;
  telemetry?: EquipmentTelemetry;
  contractor: string;         // شرکت پیمانکار / امانی (e.g. شرکت معدنی تدبیرگران / امانی کارفرما)
  lastServiceDate: string;    // تاریخ آخرین سرویس دوره‌ای
  nextServiceHours: number;   // ساعت کارکرد تا سرویس بعدی
  notes?: string;
}

export interface MineMapZone {
  id: string;
  nameFa: string;
  nameEn: string;
  benchLevel: number;
  type: 'PIT' | 'DUMP' | 'CRUSHER' | 'STOCKPILE' | 'WORKSHOP' | 'FUEL_STATION' | 'BLAST_BLOCK';
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  color: string;
}
