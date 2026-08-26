import { LocalStorageRepository } from './LocalStorageRepository';
import type { 
  Block, SubBlock, Mine, Pit, DrillingPoint, 
  Sample, MaterialProfile, DestinationDecision, User,
  AuditLogEntry
} from '../../domain/types/mine.types';

// ============================================
// نمونه‌های Repository
// ============================================

// احراز هویت
export const UserRepository = new LocalStorageRepository<User>('aes_users');

// معدن
export const MineRepository = new LocalStorageRepository<Mine>('aes_mines');
export const PitRepository = new LocalStorageRepository<Pit>('aes_pits');

// بلوک و حفاری
export const BlockRepository = new LocalStorageRepository<Block>('aes_blocks');
export const SubBlockRepository = new LocalStorageRepository<SubBlock>('aes_subblocks');
export const DrillingPointRepository = new LocalStorageRepository<DrillingPoint>('aes_drilling_points');

// نمونه و آزمایشگاه
export const SampleRepository = new LocalStorageRepository<Sample>('aes_samples');
export const MaterialProfileRepository = new LocalStorageRepository<MaterialProfile>('aes_material_profiles');
export const DestinationDecisionRepository = new LocalStorageRepository<DestinationDecision>('aes_destination_decisions');

// تاریخچه
export const AuditLogRepository = new LocalStorageRepository<AuditLogEntry>('aes_audit_log');

// ============================================
// تابع مقداردهی اولیه
// ============================================

export function initializeRepositories(): void {
  // ایجاد داده‌های پیش‌فرض معدن
  if (MineRepository.count() === 0) {
    const initialMine: Mine = {
      id: crypto.randomUUID(),
      name: 'معدن سنگ آهن مرکزی',
      code: 'MI-001',
      location: 'استان یزد، شهرستان بافق',
      status: 'فعال',
      createdAt: new Date().toISOString(),
    };
    MineRepository.save(initialMine);
    console.log('✅ داده‌های پیش‌فرض معدن ایجاد شد');
  }

  // ایجاد کاربر تستی
  if (UserRepository.count() === 0) {
    const adminUser: User = {
      id: crypto.randomUUID(),
      code: 'AES-1001',
      fullName: 'مدیر سیستم',
      email: 'admin@aes.com',
      password: '123456',
      role: 'Manager',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    UserRepository.save(adminUser);
    console.log('✅ کاربر تستی ایجاد شد');
  }

  // ایجاد داده‌های نمونه برای بلوک‌ها (اختیاری)
  if (BlockRepository.count() === 0) {
    const mine = MineRepository.getAll()[0];
    if (mine) {
      const sampleBlock: Block = {
        id: crypto.randomUUID(),
        code: '1040 B 60',
        name: 'بلوک ۱۰۴۰-۶۰',
        targetLevel: 1040,
        blockNumber: 60,
        drillingParams: {
          totalHoles: 36,
          holeDiameter: 76,
          avgDesignDepth: 12.5,
          pattern: 'شبکه ۳×۳',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[54.3, 31.5], [54.4, 31.5], [54.4, 31.6], [54.3, 31.6], [54.3, 31.5]]],
          drillingPoints: [],
        },
        status: 'APPROVED',
        statusHistory: [],
        createdBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      BlockRepository.save(sampleBlock);
      console.log('✅ بلوک نمونه ایجاد شد');

      // ایجاد ساب‌بلوک‌های غنی با مراحل مختلف چرخه
      if (SubBlockRepository.count() === 0) {
        const now = new Date();
        const baseSubBlocks: SubBlock[] = [
          {
            id: crypto.randomUUID(),
            blockId: sampleBlock.id,
            code: '1040 B 60 - SB-01',
            status: 'FINAL_PRODUCT',
            benchLevel: 1040,
            tonnage: 4200,
            estimatedTonnage: 4000,
            sampleId: 'SMP-01',
            sampleNumber: 'SMP-1040-60-01',
            sampler: 'مهندس حسینی',
            labResults: {
              fe: 61.2,
              feo: 21.4,
              sio2: 4.8,
              al2o3: 1.4,
              p: 0.045,
              s: 0.08,
              cao: 1.8,
              mgo: 1.1,
              moisture: 2.8,
              density: 3.1,
              labName: 'آزمایشگاه مرکزی مجتمع',
              batchNumber: 'BATCH-XRF-104',
              labTechnician: 'دکتر علوی',
              analyzedAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
              isVerified: true,
            },
            materialClass: 'High-Grade DSO (سنگ‌آهن پرعیار مستقیم)',
            rockType: 'مگنتیت - هماتیت متراکم',
            oreType: 'کانسنگ اصلی',
            gradeCategory: 'HIGH',
            economicClass: 'DSO Direct Shipping Ore',
            destination: 'CRUSHER_LINE_1',
            destinationReason: 'سنگ پرعیار با رطوبت و ناخالصی مطلوب - خوراک‌دهی مستقیم به خط ۱ خردایش',
            destinationApprovedBy: 'سرپرست بهره‌برداری',
            crusherFeedData: {
              crusherLine: 'CRUSHER_LINE_1',
              lineName: 'خط ۱ خردایش (سنگ‌شکن فکی اولیه)',
              feedTonnage: 4200,
              feedRateTph: 400,
              inputFeGrade: 61.2,
              productLumpTonnage: 2380,
              productLumpGrade: 62.5,
              productFinesTonnage: 1520,
              productFinesGrade: 61.8,
              tailingsTonnage: 300,
              recoveryPercentage: 94.2,
              processedAt: new Date(now.getTime() - 86400000).toISOString(),
              operator: 'مهندس رضایی',
            },
            statusHistory: [
              { status: 'DEFINED', changedAt: new Date(now.getTime() - 86400000 * 5).toISOString(), changedBy: 'سیستم', note: 'تعریف اولیه' },
              { status: 'SAMPLING_COMPLETED', changedAt: new Date(now.getTime() - 86400000 * 4).toISOString(), changedBy: 'مهندس حسینی', note: 'نمونه‌برداری پودری' },
              { status: 'LAB_COMPLETED', changedAt: new Date(now.getTime() - 86400000 * 3).toISOString(), changedBy: 'دکتر علوی', note: 'ثبت آنالیز عیار ۶۱.۲%' },
              { status: 'CLASSIFICATION_DONE', changedAt: new Date(now.getTime() - 86400000 * 2).toISOString(), changedBy: 'واحد زمین‌شناسی', note: 'طبقه‌بندی پرعیار DSO' },
              { status: 'DESTINATION_APPROVED', changedAt: new Date(now.getTime() - 86400000 * 1.5).toISOString(), changedBy: 'سرپرست بهره‌برداری', note: 'تخصیص به خط ۱ سنگ‌شکن' },
              { status: 'FINAL_PRODUCT', changedAt: new Date(now.getTime() - 86400000).toISOString(), changedBy: 'مهندس رضایی', note: 'مصرف در خط ۱ و استحصال کلوخه و نرمه' },
            ],
            createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            blockId: sampleBlock.id,
            code: '1040 B 60 - SB-02',
            status: 'DESTINATION_APPROVED',
            benchLevel: 1040,
            tonnage: 3800,
            estimatedTonnage: 3800,
            sampleId: 'SMP-02',
            sampleNumber: 'SMP-1040-60-02',
            sampler: 'مهندس حسینی',
            labResults: {
              fe: 52.8,
              feo: 16.5,
              sio2: 8.2,
              al2o3: 2.1,
              p: 0.082,
              s: 0.14,
              cao: 2.4,
              mgo: 1.8,
              moisture: 3.2,
              density: 2.85,
              labName: 'آزمایشگاه مرکزی مجتمع',
              batchNumber: 'BATCH-XRF-104',
              labTechnician: 'دکتر علوی',
              analyzedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
              isVerified: true,
            },
            materialClass: 'Medium-Grade Ore (سنگ‌آهن متوسط‌عیار)',
            rockType: 'مگنتیت نواری با رگچه‌های سیلیکاته',
            oreType: 'کانسنگ متوسط‌عیار',
            gradeCategory: 'MEDIUM',
            economicClass: 'Secondary Crusher Feed',
            destination: 'CRUSHER_LINE_2',
            destinationReason: 'عیار ۵۲.۸٪ - مناسب جهت خوراک خط ۲ خردایش ثانویه',
            destinationApprovedBy: 'سرپرست فرآوری',
            statusHistory: [
              { status: 'DEFINED', changedAt: new Date(now.getTime() - 86400000 * 4).toISOString(), changedBy: 'سیستم' },
              { status: 'SAMPLING_COMPLETED', changedAt: new Date(now.getTime() - 86400000 * 3).toISOString(), changedBy: 'مهندس حسینی' },
              { status: 'LAB_COMPLETED', changedAt: new Date(now.getTime() - 86400000 * 2).toISOString(), changedBy: 'دکتر علوی' },
              { status: 'CLASSIFICATION_DONE', changedAt: new Date(now.getTime() - 86400000 * 1).toISOString(), changedBy: 'واحد زمین‌شناسی' },
              { status: 'DESTINATION_APPROVED', changedAt: new Date().toISOString(), changedBy: 'سرپرست فرآوری', note: 'آماده بارگیری به خط ۲ سنگ‌شکن' },
            ],
            createdAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            blockId: sampleBlock.id,
            code: '1040 B 60 - SB-03',
            status: 'LAB_COMPLETED',
            benchLevel: 1040,
            tonnage: 4500,
            estimatedTonnage: 4500,
            sampleId: 'SMP-03',
            sampleNumber: 'SMP-1040-60-03',
            sampler: 'مهندس کاظمی',
            labResults: {
              fe: 57.5,
              feo: 19.8,
              sio2: 6.1,
              al2o3: 1.7,
              p: 0.065,
              s: 0.11,
              cao: 2.0,
              mgo: 1.3,
              moisture: 2.9,
              density: 2.95,
              labName: 'آزمایشگاه مرکزی مجتمع',
              batchNumber: 'BATCH-XRF-105',
              labTechnician: 'دکتر علوی',
              analyzedAt: new Date().toISOString(),
              isVerified: true,
            },
            statusHistory: [
              { status: 'DEFINED', changedAt: new Date(now.getTime() - 86400000 * 3).toISOString(), changedBy: 'سیستم' },
              { status: 'SAMPLING_COMPLETED', changedAt: new Date(now.getTime() - 86400000 * 2).toISOString(), changedBy: 'مهندس کاظمی' },
              { status: 'LAB_COMPLETED', changedAt: new Date().toISOString(), changedBy: 'دکتر علوی', note: 'آنالیز آزمایشگاه تکمیل شد' },
            ],
            createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            blockId: sampleBlock.id,
            code: '1040 B 60 - SB-04',
            status: 'SAMPLING_COMPLETED',
            benchLevel: 1040,
            tonnage: 3500,
            estimatedTonnage: 3500,
            sampleId: 'SMP-04',
            sampleNumber: 'SMP-1040-60-04',
            sampler: 'مهندس کاظمی',
            statusHistory: [
              { status: 'DEFINED', changedAt: new Date(now.getTime() - 86400000 * 2).toISOString(), changedBy: 'سیستم' },
              { status: 'SAMPLING_COMPLETED', changedAt: new Date().toISOString(), changedBy: 'مهندس کاظمی', note: 'ارسال نمونه به آزمایشگاه' },
            ],
            createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        SubBlockRepository.saveBatch(baseSubBlocks);
        console.log('✅ ساب‌بلوک‌های اولیه با چرخه عمر غنی ایجاد شدند');
      }
    }
  }
}