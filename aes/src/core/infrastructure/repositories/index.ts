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
    }
  }
}