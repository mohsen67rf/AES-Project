import { LocalStorageRepository } from './LocalStorageRepository';
import type { 
  Block, SubBlock, Mine, Pit, DrillingPoint, 
  Sample, MaterialProfile, DestinationDecision, User,
  AuditLogEntry, MonthlyBand, DrillPatternDesign,
  Stockpile, HaulageTrip
} from '../../domain/types/mine.types';
import type { SurveyMap } from '../../domain/types/survey-map.types';

// ============================================
// نمونه‌های Repository
// ============================================

// احراز هویت
export const UserRepository = new LocalStorageRepository<User>('aes_users');

// نقشه‌ها و لایه‌های مهندسی و GIS
export const SurveyMapRepository = new LocalStorageRepository<SurveyMap>('aes_survey_maps');

// معدن
export const MineRepository = new LocalStorageRepository<Mine>('aes_mines');
export const PitRepository = new LocalStorageRepository<Pit>('aes_pits');

// باندهای استخراج ماهانه
export const MonthlyBandRepository = new LocalStorageRepository<MonthlyBand>('aes_monthly_bands');

// بلوک، طراحی شبکه حفاری و چال‌ها
export const BlockRepository = new LocalStorageRepository<Block>('aes_blocks');
export const DrillPatternDesignRepository = new LocalStorageRepository<DrillPatternDesign>('aes_drill_patterns');
export const SubBlockRepository = new LocalStorageRepository<SubBlock>('aes_subblocks');
export const DrillingPointRepository = new LocalStorageRepository<DrillingPoint>('aes_drilling_points');

// نمونه و آزمایشگاه
export const SampleRepository = new LocalStorageRepository<Sample>('aes_samples');
export const MaterialProfileRepository = new LocalStorageRepository<MaterialProfile>('aes_material_profiles');
export const DestinationDecisionRepository = new LocalStorageRepository<DestinationDecision>('aes_destination_decisions');

// دپوها و سرویس‌های حمل ماشین‌آلات
export const StockpileRepository = new LocalStorageRepository<Stockpile>('aes_stockpiles');
export const HaulageTripRepository = new LocalStorageRepository<HaulageTrip>('aes_haulage_trips');

// تاریخچه
export const AuditLogRepository = new LocalStorageRepository<AuditLogEntry>('aes_audit_log');

// ============================================
// تابع مقداردهی اولیه
// ============================================

export function initializeRepositories(): void {
  // ایجاد داده‌های پیش‌فرض معدن
  if (MineRepository.count() === 0) {
    const initialMine: Mine = {
      id: 'mine-001',
      name: 'معدن سنگ آهن مرکزی (چادرملو - بافق)',
      code: 'MI-001',
      location: 'استان یزد، شهرستان بافق',
      status: 'فعال',
      createdAt: new Date().toISOString(),
    };
    MineRepository.save(initialMine);
    console.log('✅ داده‌های پیش‌فرض معدن ایجاد شد');
  }

  // ایجاد کاربران ۴ رکن اصلی پروژه
  if (UserRepository.count() < 4) {
    const defaultUsers: User[] = [
      {
        id: 'user-client-1',
        code: 'AES-CLIENT-01',
        fullName: 'مهندس حسینی (مدیریت کارفرما)',
        email: 'client@aes.com',
        password: '123',
        role: 'Client',
        department: 'واحد کارفرما - مدیریت توسعه و بهره‌برداری',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-supervision-1',
        code: 'AES-SUP-01',
        fullName: 'دکتر علوی (سرپرست نظارت و طراحی)',
        email: 'supervision@aes.com',
        password: '123',
        role: 'Supervision',
        department: 'واحد نظارت - طراحی، برنامه‌ریزی و ژئولوژی',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-mining-1',
        code: 'AES-MINE-01',
        fullName: 'مهندس رضایی (سرپرست کارگاه استخراج)',
        email: 'mining@aes.com',
        password: '123',
        role: 'MiningContractor',
        department: 'پیمانکار استخراج - دفتر فنی و حفاری آتشباری',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-crush-1',
        code: 'AES-CRUSH-01',
        fullName: 'مهندس کاظمی (مسئول خردایش و دپوها)',
        email: 'crushing@aes.com',
        password: '123',
        role: 'CrushingContractor',
        department: 'پیمانکار خردایش - فیددهی و دپوسازی',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
    UserRepository.saveBatch(defaultUsers);
    console.log('✅ کاربران ۴ رکن اصلی پروژه ثبت شدند');
  }

  // ایجاد باندهای طراحی ماهانه نظارت (مرحله ۱ و ۲)
  if (MonthlyBandRepository.count() === 0) {
    const initialBands: MonthlyBand[] = [
      {
        id: 'band-1405-03-01',
        mineId: 'mine-001',
        code: 'BAND-1405-03-B32',
        title: 'باند استخراجی پله ۱۰۴۰ - زون شرقی (پیت ۱)',
        month: 'خرداد ۱۴۰۵',
        year: 1405,
        benchLevel: 1040,
        volumeM3: 45000,
        tonnageOre: 85000,
        tonnageWaste: 35000,
        primaryRockType: 'مگنتیت پرعیار و باطله اسکارت',
        estimatedFe: 58.5,
        status: 'APPROVED_BY_CLIENT',
        supervisionEngineer: 'دکتر علوی (نظارت)',
        clientApprover: 'مهندس حسینی (کارفرما)',
        approvalDate: new Date(Date.now() - 86400000 * 10).toISOString(),
        notes: 'باند اولویت اول استخراج ماهانه با تأیید مشترک کارفرما، نظارت و پیمانکار استخراج',
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'band-1405-03-02',
        mineId: 'mine-001',
        code: 'BAND-1405-03-B40',
        title: 'باند استخراجی پله ۱۰۲۰ - زون مرکزی',
        month: 'خرداد ۱۴۰۵',
        year: 1405,
        benchLevel: 1020,
        volumeM3: 32000,
        tonnageOre: 62000,
        tonnageWaste: 22000,
        primaryRockType: 'مگنتیت - هماتیت متراکم',
        estimatedFe: 54.2,
        status: 'SUBMITTED_BY_SUPERVISION',
        supervisionEngineer: 'دکتر علوی (نظارت)',
        notes: 'در انتظار تأیید نهایی توسط مدیریت کارفرما',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    MonthlyBandRepository.saveBatch(initialBands);
    console.log('✅ باندهای طراحی ماهانه ایجاد شد');
  }

  // ایجاد دپوها و تعریف عیار اولیه و تناژ
  if (StockpileRepository.count() === 0) {
    const initialStockpiles: Stockpile[] = [
      {
        id: 'stk-high-1',
        mineId: 'mine-001',
        code: 'STK-HIGH-01',
        name: 'دپوی سنگ‌آهن پرعیار (High-Grade DSO)',
        type: 'HIGH_GRADE',
        initialTonnage: 25000,
        currentTonnage: 34500,
        capacityTonnage: 80000,
        weightedAvgFe: 61.4,
        weightedAvgSiO2: 4.6,
        weightedAvgP: 0.05,
        weightedAvgS: 0.08,
        activeSubBlocksCount: 3,
        totalInflowTonnage: 15500,
        totalOutflowTonnage: 6000,
        coordinates: { x: 38, y: 42 },
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'stk-med-1',
        mineId: 'mine-001',
        code: 'STK-MED-01',
        name: 'دپوی سنگ‌آهن متوسط‌عیار (Medium-Grade Feed)',
        type: 'MEDIUM_GRADE',
        initialTonnage: 40000,
        currentTonnage: 48200,
        capacityTonnage: 100000,
        weightedAvgFe: 52.8,
        weightedAvgSiO2: 7.9,
        weightedAvgP: 0.08,
        weightedAvgS: 0.12,
        activeSubBlocksCount: 2,
        totalInflowTonnage: 12200,
        totalOutflowTonnage: 4000,
        coordinates: { x: 55, y: 50 },
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'stk-low-1',
        mineId: 'mine-001',
        code: 'STK-LOW-01',
        name: 'دپوی سنگ‌آهن کم‌عیار و همگن‌سازی (Low-Grade Blend)',
        type: 'LOW_GRADE',
        initialTonnage: 60000,
        currentTonnage: 67800,
        capacityTonnage: 150000,
        weightedAvgFe: 41.5,
        weightedAvgSiO2: 12.4,
        weightedAvgP: 0.11,
        weightedAvgS: 0.18,
        activeSubBlocksCount: 1,
        totalInflowTonnage: 7800,
        totalOutflowTonnage: 0,
        coordinates: { x: 68, y: 65 },
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'stk-waste-1',
        mineId: 'mine-001',
        code: 'DUMP-WASTE-01',
        name: 'دامپ باطله سنگی شمالی (North Waste Dump)',
        type: 'WASTE_ROCK',
        initialTonnage: 180000,
        currentTonnage: 204500,
        capacityTonnage: 500000,
        weightedAvgFe: 14.2,
        activeSubBlocksCount: 4,
        totalInflowTonnage: 24500,
        totalOutflowTonnage: 0,
        coordinates: { x: 82, y: 25 },
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'stk-crusher-bin-1',
        mineId: 'mine-001',
        code: 'BIN-CRUSHER-01',
        name: 'بین ورودی سنگ‌شکن فکی اولیه (Crusher Primary Bin)',
        type: 'HIGH_GRADE',
        initialTonnage: 3000,
        currentTonnage: 4200,
        capacityTonnage: 10000,
        weightedAvgFe: 60.8,
        activeSubBlocksCount: 2,
        totalInflowTonnage: 9200,
        totalOutflowTonnage: 8000,
        coordinates: { x: 25, y: 70 },
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString(),
      },
    ];
    StockpileRepository.saveBatch(initialStockpiles);
    console.log('✅ دپوها و موجودی‌های دینامیک ایجاد شد');
  }

  // ایجاد بلوک دقیق مطابق مثال مطرح شده در پرامپت: 1040 B 32
  if (BlockRepository.count() === 0) {
    const sampleBlock: Block = {
      id: 'block-1040-b32',
      code: '1040 B 32',
      name: 'بلوک استخراجی ۱۰۴۰-۳۲ (پله ۱۰۴۰)',
      targetLevel: 1040,
      blockNumber: 32,
      drillingParams: {
        totalHoles: 48,
        holeDiameter: 76,
        avgDesignDepth: 12.5,
        pattern: 'شبکه مربعی ۳×۳.۵ متر',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[54.31, 31.52], [54.36, 31.52], [54.36, 31.57], [54.31, 31.57], [54.31, 31.52]]],
        drillingPoints: [],
      },
      status: 'APPROVED',
      statusHistory: [
        { status: 'DEFINED', changedBy: 'مهندس رضایی (پیمانکار)', changedAt: new Date(Date.now() - 86400000 * 6).toISOString() },
        { status: 'APPROVED', changedBy: 'دکتر علوی (نظارت)', changedAt: new Date(Date.now() - 86400000 * 5).toISOString(), reason: 'تأیید شبکه حفاری و صدور مجوز' },
        { status: 'DRILLED', changedBy: 'واحد حفاری', changedAt: new Date(Date.now() - 86400000 * 4).toISOString() },
        { status: 'SAMPLING_COMPLETED', changedBy: 'مهندس حسینی', changedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      ],
      createdBy: 'user-mining-1',
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    BlockRepository.save(sampleBlock);

    // ایجاد الگوی حفاری
    const drillPattern: DrillPatternDesign = {
      id: 'dp-1040-32',
      blockId: sampleBlock.id,
      bandId: 'band-1405-03-01',
      code: 'DP-1040-B32-V2',
      blockCode: '1040 B 32',
      designerContractor: 'دفتر فنی پیمانکار استخراج (مهندس رضایی)',
      holeDiameterMm: 76,
      burdenMeters: 3.0,
      spacingMeters: 3.5,
      subDrillingMeters: 1.0,
      holeCount: 48,
      avgDepthMeters: 12.5,
      totalMetersDesign: 600,
      explosiveType: 'آنفو (ANFO) + بوستر ۵۰۰ گرمی Emulite',
      powderFactorKgPerM3: 0.65,
      status: 'PERMIT_ISSUED',
      supervisionReviewer: 'دکتر علوی (دفتر فنی نظارت)',
      supervisionNotes: 'الگوی چال‌زنی و بار سنگ با توجه به کاتینگ‌های زون مگنتیتی بررسی و مجوز حفاری صادر گردید.',
      permitNumber: 'PERMIT-DRL-1405/03/32',
      permitIssuedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    DrillPatternDesignRepository.save(drillPattern);

    // ایجاد ۴ ساب‌بلوک دقیقاً منطبق بر مثال پرامپت:
    // 1040 B 32 – SA
    // 1040 B 32 – SB
    // 1040 B 32 – SC
    // 1040 B 32 – SD
    const now = new Date();
    const subBlocks: SubBlock[] = [
      {
        id: 'sb-1040-32-sa',
        blockId: sampleBlock.id,
        code: '1040 B 32 – SA',
        sequence: 1,
        status: 'FINAL_PRODUCT',
        benchLevel: 1040,
        tonnage: 4800,
        estimatedTonnage: 4500,
        sampleId: 'SMP-1040-32-SA',
        sampleNumber: 'SMP-1040-32-SA',
        sampleType: 'POWDER_BLASTHOLE',
        sampler: 'مهندس حسینی (نظارت)',
        sampleDate: new Date(now.getTime() - 86400000 * 4).toISOString(),
        labResults: {
          fe: 62.4,
          feo: 22.1,
          sio2: 3.9,
          al2o3: 1.2,
          p: 0.038,
          s: 0.06,
          cao: 1.5,
          mgo: 0.9,
          moisture: 2.4,
          density: 3.15,
          assay: 62.4,
          labName: 'آزمایشگاه مرکزی مجتمع (XRF)',
          batchNumber: 'XRF-1405-32-A',
          labTechnician: 'دکتر علوی',
          analyzedAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
          isVerified: true,
        },
        materialClass: 'سنگ‌آهن مگنتیت پرعیار ممتاز (High-Grade DSO)',
        rockType: 'مگنتیت خالص متراکم',
        oreType: 'کانسنگ مگنتیتی',
        gradeCategory: 'HIGH',
        economicClass: 'DSO مستقیم',
        destination: 'CRUSHER_LINE_1',
        destinationReason: 'عیار ۶۲.۴٪ با ناخالصی فسفر و گوگرد بسیار پایین - تخصیص مستقیم به خط ۱ خردایش',
        destinationApprovedBy: 'مهندس حسینی (کارفرما) و دکتر علوی (نظارت)',
        destinationApprovedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
        loadingData: {
          truckCount: 48,
          tonnage: 4800,
          loaderId: 'شاول هیتاچی EX-1200 #01',
          operator: 'احمد کاظمی',
        },
        crusherFeedData: {
          crusherLine: 'CRUSHER_LINE_1',
          lineName: 'خط ۱ سنگ‌شکن فکی اولیه',
          feedDate: new Date(now.getTime() - 86400000).toISOString(),
          feedTonnage: 4800,
          feedRateTph: 420,
          inputFeGrade: 62.4,
          productLumpTonnage: 2750,
          productLumpGrade: 63.1,
          productFinesTonnage: 1720,
          productFinesGrade: 62.8,
          tailingsTonnage: 330,
          recoveryPercentage: 95.5,
          operator: 'مهندس کاظمی',
          shift: 'MORNING',
        },
        statusHistory: [
          { status: 'DEFINED', changedAt: new Date(now.getTime() - 86400000 * 5).toISOString(), changedBy: 'پیمانکار استخراج', note: 'ساب‌بندی بر اساس کاتینگ حفاری' },
          { status: 'SAMPLING_COMPLETED', changedAt: new Date(now.getTime() - 86400000 * 4).toISOString(), changedBy: 'مهندس حسینی', note: 'نمونه‌گیری از چال‌های ساب SA' },
          { status: 'LAB_COMPLETED', changedAt: new Date(now.getTime() - 86400000 * 3).toISOString(), changedBy: 'آزمایشگاه XRF', note: 'ثبت نتایج عیار Fe: 62.4%' },
          { status: 'CLASSIFICATION_DONE', changedAt: new Date(now.getTime() - 86400000 * 2.5).toISOString(), changedBy: 'زمین‌شناس نظارت', note: 'طبقه‌بندی پرعیار ممتاز' },
          { status: 'DESTINATION_APPROVED', changedAt: new Date(now.getTime() - 86400000 * 2).toISOString(), changedBy: 'کارفرما و نظارت', note: 'تأیید تخلیه در بین فید سنگ‌شکن ۱' },
          { status: 'FINAL_PRODUCT', changedAt: new Date(now.getTime() - 86400000).toISOString(), changedBy: 'پیمانکار خردایش', note: 'اتمام خردایش و تولید سنگ‌آهن دانه‌بندی شده' },
        ],
        createdBy: 'user-mining-1',
        createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sb-1040-32-sb',
        blockId: sampleBlock.id,
        code: '1040 B 32 – SB',
        sequence: 2,
        status: 'DESTINATION_APPROVED',
        benchLevel: 1040,
        tonnage: 4200,
        estimatedTonnage: 4000,
        sampleId: 'SMP-1040-32-SB',
        sampleNumber: 'SMP-1040-32-SB',
        sampleType: 'POWDER_BLASTHOLE',
        sampler: 'مهندس حسینی (نظارت)',
        sampleDate: new Date(now.getTime() - 86400000 * 4).toISOString(),
        labResults: {
          fe: 58.8,
          feo: 19.4,
          sio2: 5.2,
          al2o3: 1.5,
          p: 0.052,
          s: 0.09,
          cao: 1.8,
          mgo: 1.1,
          moisture: 2.8,
          density: 3.05,
          assay: 58.8,
          labName: 'آزمایشگاه مرکزی مجتمع (XRF)',
          batchNumber: 'XRF-1405-32-B',
          labTechnician: 'دکتر علوی',
          analyzedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
          isVerified: true,
        },
        materialClass: 'سنگ‌آهن پرعیار دپوسازی (High-Grade Stockpile)',
        rockType: 'مگنتیت - هماتیت متراکم',
        oreType: 'کانسنگ اصلی',
        gradeCategory: 'HIGH',
        economicClass: 'High-Grade Storage',
        destination: 'HIGH_GRADE_STOCKPILE',
        destinationReason: 'عیار ۵۸.۸٪ - تخلیه در دپوی پرعیار STK-HIGH-01 جهت بلندیگ بهینه',
        destinationApprovedBy: 'دکتر علوی (نظارت)',
        destinationApprovedAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
        loadingData: {
          truckCount: 42,
          tonnage: 4200,
          loaderId: 'لودر کوماتسو WA-600 #02',
          operator: 'حسین رحیمی',
        },
        statusHistory: [
          { status: 'DEFINED', changedAt: new Date(now.getTime() - 86400000 * 5).toISOString(), changedBy: 'پیمانکار استخراج' },
          { status: 'SAMPLING_COMPLETED', changedAt: new Date(now.getTime() - 86400000 * 4).toISOString(), changedBy: 'مهندس حسینی' },
          { status: 'LAB_COMPLETED', changedAt: new Date(now.getTime() - 86400000 * 2).toISOString(), changedBy: 'آزمایشگاه XRF', note: 'عیار Fe: 58.8%' },
          { status: 'CLASSIFICATION_DONE', changedAt: new Date(now.getTime() - 86400000 * 1.5).toISOString(), changedBy: 'زمین‌شناس نظارت' },
          { status: 'DESTINATION_APPROVED', changedAt: new Date(now.getTime() - 86400000 * 1).toISOString(), changedBy: 'نظارت', note: 'تأیید تخلیه در دپوی پرعیار ۱' },
        ],
        createdBy: 'user-mining-1',
        createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sb-1040-32-sc',
        blockId: sampleBlock.id,
        code: '1040 B 32 – SC',
        sequence: 3,
        status: 'LAB_COMPLETED',
        benchLevel: 1040,
        tonnage: 5200,
        estimatedTonnage: 5000,
        sampleId: 'SMP-1040-32-SC',
        sampleNumber: 'SMP-1040-32-SC',
        sampleType: 'POWDER_BLASTHOLE',
        sampler: 'مهندس اکبری (پیمانکار)',
        sampleDate: new Date(now.getTime() - 86400000 * 3).toISOString(),
        labResults: {
          fe: 51.6,
          feo: 15.8,
          sio2: 8.9,
          al2o3: 2.3,
          p: 0.088,
          s: 0.14,
          cao: 2.7,
          mgo: 1.9,
          moisture: 3.1,
          density: 2.85,
          assay: 51.6,
          labName: 'آزمایشگاه مرکزی مجتمع (XRF)',
          batchNumber: 'XRF-1405-32-C',
          labTechnician: 'دکتر علوی',
          analyzedAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
          isVerified: true,
        },
        materialClass: 'سنگ‌آهن متوسط‌عیار نیازمند فرآوری',
        rockType: 'مگنتیت سیلیکاته با رگچه‌های پیریت',
        oreType: 'کانسنگ متوسط‌عیار',
        gradeCategory: 'MEDIUM',
        statusHistory: [
          { status: 'DEFINED', changedAt: new Date(now.getTime() - 86400000 * 5).toISOString(), changedBy: 'پیمانکار استخراج' },
          { status: 'SAMPLING_COMPLETED', changedAt: new Date(now.getTime() - 86400000 * 3).toISOString(), changedBy: 'مهندس اکبری' },
          { status: 'LAB_COMPLETED', changedAt: new Date(now.getTime() - 86400000 * 1).toISOString(), changedBy: 'آزمایشگاه XRF', note: 'عیار Fe: 51.6% - در انتظار طبقه‌بندی زمین‌شناسی' },
        ],
        createdBy: 'user-mining-1',
        createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sb-1040-32-sd',
        blockId: sampleBlock.id,
        code: '1040 B 32 – SD',
        sequence: 4,
        status: 'SAMPLING_COMPLETED',
        benchLevel: 1040,
        tonnage: 3600,
        estimatedTonnage: 3600,
        sampleId: 'SMP-1040-32-SD',
        sampleNumber: 'SMP-1040-32-SD',
        sampleType: 'POWDER_BLASTHOLE',
        sampler: 'مهندس اکبری (پیمانکار)',
        sampleDate: new Date().toISOString(),
        statusHistory: [
          { status: 'DEFINED', changedAt: new Date(now.getTime() - 86400000 * 5).toISOString(), changedBy: 'پیمانکار استخراج' },
          { status: 'SAMPLING_COMPLETED', changedAt: new Date().toISOString(), changedBy: 'مهندس اکبری', note: 'نمونه‌گیری پودری انجام و تحویل آزمایشگاه گردید' },
        ],
        createdBy: 'user-mining-1',
        createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    SubBlockRepository.saveBatch(subBlocks);
    console.log('✅ ۴ ساب‌بلوک استاندارد 1040 B 32 (SA, SB, SC, SD) ایجاد شدند');

    // ثبت سرویس‌های حمل ماشین‌آلات (مرحله ۱۰: تعداد سرویس * میانگین تناژ ماشین‌آلات)
    if (HaulageTripRepository.count() === 0) {
      const sampleTrips: HaulageTrip[] = [
        {
          id: 'trip-001',
          subBlockId: 'sb-1040-32-sa',
          subBlockCode: '1040 B 32 – SA',
          stockpileId: 'stk-crusher-bin-1',
          stockpileName: 'بین ورودی سنگ‌شکن فکی اولیه',
          truckType: 'TRUCK_100T',
          nominalCapacity: 100,
          tripCount: 32,
          calculatedTonnage: 3200,
          loaderId: 'شاول هیتاچی EX-1200 #01',
          shift: 'MORNING',
          recordedBy: 'پیمانکار استخراج (دیسپاچینگ)',
          timestamp: new Date(now.getTime() - 86400000 * 1.5).toISOString(),
          notes: 'تخلیه ۳۲ سرویس تراک ۱۰۰ تنی کوماتسو HD785',
        },
        {
          id: 'trip-002',
          subBlockId: 'sb-1040-32-sa',
          subBlockCode: '1040 B 32 – SA',
          stockpileId: 'stk-crusher-bin-1',
          stockpileName: 'بین ورودی سنگ‌شکن فکی اولیه',
          truckType: 'TRUCK_60T',
          nominalCapacity: 60,
          tripCount: 26,
          calculatedTonnage: 1560,
          loaderId: 'شاول هیتاچی EX-1200 #01',
          shift: 'EVENING',
          recordedBy: 'پیمانکار استخراج (دیسپاچینگ)',
          timestamp: new Date(now.getTime() - 86400000).toISOString(),
          notes: 'تخلیه ۲۶ سرویس تراک ۶۰ تنی کاترپیلار 773D',
        },
        {
          id: 'trip-003',
          subBlockId: 'sb-1040-32-sb',
          subBlockCode: '1040 B 32 – SB',
          stockpileId: 'stk-high-1',
          stockpileName: 'دپوی سنگ‌آهن پرعیار (High-Grade DSO)',
          truckType: 'TRUCK_100T',
          nominalCapacity: 100,
          tripCount: 42,
          calculatedTonnage: 4200,
          loaderId: 'لودر کوماتسو WA-600 #02',
          shift: 'MORNING',
          recordedBy: 'پیمانکار استخراج (دیسپاچینگ)',
          timestamp: new Date(now.getTime() - 86400000 * 0.8).toISOString(),
          notes: 'تخلیه ۴۲ سرویس در دپوی پرعیار ۱',
        },
      ];
      HaulageTripRepository.saveBatch(sampleTrips);
      console.log('✅ رکوردهای سرویس‌شمار ماشین‌آلات حمل ایجاد شد');
    }
  }
}
