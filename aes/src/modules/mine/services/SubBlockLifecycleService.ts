// src/modules/mine/services/SubBlockLifecycleService.ts

import { SubBlock, SubBlockStatus, SubBlockStatusHistory } from '../../../core/domain/types/mine.types';
import { SUB_BLOCK_STATUS_LABELS, STATUS_TRANSITIONS, isFinalStatus } from '../../../core/domain/constants/subblock.constants';
import { SubBlockRepository } from '../../../core/infrastructure/repositories';

export class SubBlockLifecycleService {
  
  // ============================================
  // انتقال به وضعیت جدید
  // ============================================

  static transitionStatus(
    subBlock: SubBlock,
    newStatus: SubBlockStatus,
    changedBy: string,
    note?: string
  ): SubBlock | null {
    // بررسی آیا انتقال مجاز است
    const allowedTransitions = STATUS_TRANSITIONS[subBlock.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      console.error(`❌ انتقال غیرمجاز: از ${subBlock.status} به ${newStatus}`);
      console.log(`📋 انتقال‌های مجاز: ${allowedTransitions.join(', ')}`);
      return null;
    }

    // ایجاد تاریخچه
    const historyEntry: SubBlockStatusHistory = {
      status: newStatus,
      changedAt: new Date().toISOString(),
      changedBy,
      note,
      duration: this.calculateDuration(subBlock),
    };

    // به‌روزرسانی ساب‌بلوک
    const updatedSubBlock: SubBlock = {
      ...subBlock,
      status: newStatus,
      statusHistory: [...(subBlock.statusHistory || []), historyEntry],
      updatedAt: new Date().toISOString(),
      version: (subBlock.version || 0) + 1,
    };

    // ذخیره در دیتابیس
    SubBlockRepository.save(updatedSubBlock);
    
    console.log(`✅ وضعیت ساب‌بلوک ${subBlock.code} از ${subBlock.status} به ${newStatus} تغییر کرد`);
    
    return updatedSubBlock;
  }

  // ============================================
  // محاسبه مدت زمان در هر وضعیت
  // ============================================

  private static calculateDuration(subBlock: SubBlock): number {
    if (!subBlock.statusHistory || subBlock.statusHistory.length === 0) {
      return 0;
    }
    
    const lastHistory = subBlock.statusHistory[subBlock.statusHistory.length - 1];
    if (!lastHistory) return 0;
    
    const startTime = new Date(lastHistory.changedAt).getTime();
    const endTime = new Date().getTime();
    
    return Math.floor((endTime - startTime) / 60000); // بازگشت به دقیقه
  }

  // ============================================
  // دریافت وضعیت فعلی و اطلاعات پیشرفت
  // ============================================

  static getProgress(subBlock: SubBlock): {
    currentPhase: string;
    phaseIndex: number;
    totalPhases: number;
    percentComplete: number;
    isComplete: boolean;
    nextStatuses: SubBlockStatus[];
  } {
    const allPhases = ['DEFINITION', 'SAMPLING', 'LABORATORY', 'CLASSIFICATION', 'DECISION', 'EXECUTION', 'PROCESSING', 'FINAL'];
    const currentPhase = this.getPhase(subBlock.status);
    const phaseIndex = allPhases.indexOf(currentPhase);
    const totalPhases = allPhases.length;
    
    return {
      currentPhase,
      phaseIndex: phaseIndex + 1,
      totalPhases,
      percentComplete: Math.round(((phaseIndex + 1) / totalPhases) * 100),
      isComplete: isFinalStatus(subBlock.status),
      nextStatuses: STATUS_TRANSITIONS[subBlock.status] || [],
    };
  }

  // ============================================
  // دریافت فاز وضعیت
  // ============================================

  static getPhase(status: SubBlockStatus): string {
    const phaseMap: Record<SubBlockStatus, string> = {
      'DEFINED': 'DEFINITION',
      'SUB_BLOCKED': 'DEFINITION',
      'SAMPLING_REQUESTED': 'SAMPLING',
      'SAMPLING_SCHEDULED': 'SAMPLING',
      'SAMPLING_IN_PROGRESS': 'SAMPLING',
      'SAMPLING_COMPLETED': 'SAMPLING',
      'LAB_SENT': 'LABORATORY',
      'LAB_IN_PROGRESS': 'LABORATORY',
      'LAB_COMPLETED': 'LABORATORY',
      'CLASSIFICATION_PENDING': 'CLASSIFICATION',
      'CLASSIFICATION_DONE': 'CLASSIFICATION',
      'DESTINATION_PENDING': 'DECISION',
      'DESTINATION_APPROVED': 'DECISION',
      'LOADING_IN_PROGRESS': 'EXECUTION',
      'LOADING_COMPLETED': 'EXECUTION',
      'TRANSPORTING': 'EXECUTION',
      'DELIVERED': 'EXECUTION',
      'PROCESSING': 'PROCESSING',
      'BENEFICIATION': 'PROCESSING',
      'SIZING': 'PROCESSING',
      'FINAL_PRODUCT': 'FINAL',
      'SOLD': 'FINAL',
      'COMPLETED': 'FINAL',
    };
    return phaseMap[status] || 'DEFINITION';
  }

  // ============================================
  // دریافت برچسب وضعیت
  // ============================================

  static getStatusLabel(status: SubBlockStatus): string {
    return SUB_BLOCK_STATUS_LABELS[status] || status;
  }

  // ============================================
  // دریافت تاریخچه‌ی کامل
  // ============================================

  static getFullHistory(subBlock: SubBlock): SubBlockStatusHistory[] {
    return subBlock.statusHistory || [];
  }

  // ============================================
  // بررسی آیا وضعیت قابل تغییر است
  // ============================================

  static canTransition(subBlock: SubBlock, newStatus: SubBlockStatus): boolean {
    if (isFinalStatus(subBlock.status)) {
      return false;
    }
    const allowedTransitions = STATUS_TRANSITIONS[subBlock.status] || [];
    return allowedTransitions.includes(newStatus);
  }

  // ============================================
  // دریافت زمان سپری شده در وضعیت فعلی
  // ============================================

  static getTimeInCurrentStatus(subBlock: SubBlock): number {
    if (!subBlock.statusHistory || subBlock.statusHistory.length === 0) {
      return 0;
    }
    
    const lastHistory = subBlock.statusHistory[subBlock.statusHistory.length - 1];
    if (!lastHistory) return 0;
    
    const startTime = new Date(lastHistory.changedAt).getTime();
    const endTime = new Date().getTime();
    
    return Math.floor((endTime - startTime) / 60000); // دقیقه
  }

  // ============================================
  // دریافت رنگ وضعیت
  // ============================================

  static getStatusColor(status: SubBlockStatus): string {
    const colorMap: Record<SubBlockStatus, string> = {
      'DEFINED': '#6B7280',
      'SUB_BLOCKED': '#6B7280',
      'SAMPLING_REQUESTED': '#F59E0B',
      'SAMPLING_SCHEDULED': '#F59E0B',
      'SAMPLING_IN_PROGRESS': '#F59E0B',
      'SAMPLING_COMPLETED': '#F59E0B',
      'LAB_SENT': '#8B5CF6',
      'LAB_IN_PROGRESS': '#8B5CF6',
      'LAB_COMPLETED': '#8B5CF6',
      'CLASSIFICATION_PENDING': '#3B82F6',
      'CLASSIFICATION_DONE': '#3B82F6',
      'DESTINATION_PENDING': '#06B6D4',
      'DESTINATION_APPROVED': '#06B6D4',
      'LOADING_IN_PROGRESS': '#F97316',
      'LOADING_COMPLETED': '#F97316',
      'TRANSPORTING': '#F97316',
      'DELIVERED': '#F97316',
      'PROCESSING': '#EC4899',
      'BENEFICIATION': '#EC4899',
      'SIZING': '#EC4899',
      'FINAL_PRODUCT': '#22C55E',
      'SOLD': '#22C55E',
      'COMPLETED': '#22C55E',
    };
    return colorMap[status] || '#6B7280';
  }
}