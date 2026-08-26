// src/core/domain/constants/subblock.constants.ts

import { SubBlockStatus } from '../types/mine.types';

// ============================================
// وضعیت‌های ساب‌بلوک با دسته‌بندی فازها
// ============================================

export const SUB_BLOCK_PHASES = {
  DEFINITION: 'DEFINITION',
  SAMPLING: 'SAMPLING',
  LABORATORY: 'LABORATORY',
  CLASSIFICATION: 'CLASSIFICATION',
  DECISION: 'DECISION',
  EXECUTION: 'EXECUTION',
  PROCESSING: 'PROCESSING',
  FINAL: 'FINAL',
} as const;

export type SubBlockPhase = typeof SUB_BLOCK_PHASES[keyof typeof SUB_BLOCK_PHASES];

// ============================================
// نگاشت وضعیت به فاز
// ============================================

export const STATUS_TO_PHASE: Record<SubBlockStatus, SubBlockPhase> = {
  // فاز تعریف
  'DEFINED': 'DEFINITION',
  'SUB_BLOCKED': 'DEFINITION',
  
  // فاز نمونه‌برداری
  'SAMPLING_REQUESTED': 'SAMPLING',
  'SAMPLING_SCHEDULED': 'SAMPLING',
  'SAMPLING_IN_PROGRESS': 'SAMPLING',
  'SAMPLING_COMPLETED': 'SAMPLING',
  
  // فاز آزمایشگاه
  'LAB_SENT': 'LABORATORY',
  'LAB_IN_PROGRESS': 'LABORATORY',
  'LAB_COMPLETED': 'LABORATORY',
  
  // فاز طبقه‌بندی
  'CLASSIFICATION_PENDING': 'CLASSIFICATION',
  'CLASSIFICATION_DONE': 'CLASSIFICATION',
  
  // فاز تصمیم‌گیری
  'DESTINATION_PENDING': 'DECISION',
  'DESTINATION_APPROVED': 'DECISION',
  
  // فاز اجرا
  'LOADING_IN_PROGRESS': 'EXECUTION',
  'LOADING_COMPLETED': 'EXECUTION',
  'TRANSPORTING': 'EXECUTION',
  'DELIVERED': 'EXECUTION',
  
  // فاز فرآوری
  'PROCESSING': 'PROCESSING',
  'BENEFICIATION': 'PROCESSING',
  'SIZING': 'PROCESSING',
  
  // فاز نهایی
  'FINAL_PRODUCT': 'FINAL',
  'SOLD': 'FINAL',
  'COMPLETED': 'FINAL',
};

// ============================================
// برچسب‌های وضعیت‌ها
// ============================================

export const SUB_BLOCK_STATUS_LABELS: Record<SubBlockStatus, string> = {
  // فاز تعریف
  'DEFINED': 'تعریف شده',
  'SUB_BLOCKED': 'ساب‌بندی شده',
  
  // فاز نمونه‌برداری
  'SAMPLING_REQUESTED': 'درخواست نمونه',
  'SAMPLING_SCHEDULED': 'برنامه نمونه',
  'SAMPLING_IN_PROGRESS': 'در حال نمونه‌برداری',
  'SAMPLING_COMPLETED': 'نمونه‌برداری کامل',
  
  // فاز آزمایشگاه
  'LAB_SENT': 'ارسال به آزمایشگاه',
  'LAB_IN_PROGRESS': 'در حال آنالیز',
  'LAB_COMPLETED': 'نتیجه آزمایشگاه',
  
  // فاز طبقه‌بندی
  'CLASSIFICATION_PENDING': 'در انتظار طبقه‌بندی',
  'CLASSIFICATION_DONE': 'طبقه‌بندی شده',
  
  // فاز تصمیم‌گیری
  'DESTINATION_PENDING': 'در انتظار تصمیم',
  'DESTINATION_APPROVED': 'تصمیم تأیید شده',
  
  // فاز اجرا
  'LOADING_IN_PROGRESS': 'در حال بارگیری',
  'LOADING_COMPLETED': 'بارگیری کامل',
  'TRANSPORTING': 'در حال حمل',
  'DELIVERED': 'تحویل شده',
  
  // فاز فرآوری
  'PROCESSING': 'در حال فرآوری',
  'BENEFICIATION': 'پرعیار‌سازی',
  'SIZING': 'دانه‌بندی',
  
  // فاز نهایی
  'FINAL_PRODUCT': 'محصول نهایی',
  'SOLD': 'فروخته شده',
  'COMPLETED': 'تکمیل شده',
};

// ============================================
// رنگ‌های وضعیت‌ها
// ============================================

export const SUB_BLOCK_STATUS_COLORS: Record<SubBlockStatus, string> = {
  // فاز تعریف - طوسی
  'DEFINED': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  'SUB_BLOCKED': 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  
  // فاز نمونه‌برداری - زرد
  'SAMPLING_REQUESTED': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'SAMPLING_SCHEDULED': 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
  'SAMPLING_IN_PROGRESS': 'bg-yellow-500/30 text-yellow-400 border-yellow-500/40',
  'SAMPLING_COMPLETED': 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30',
  
  // فاز آزمایشگاه - بنفش
  'LAB_SENT': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'LAB_IN_PROGRESS': 'bg-purple-500/30 text-purple-400 border-purple-500/40',
  'LAB_COMPLETED': 'bg-purple-600/20 text-purple-300 border-purple-600/30',
  
  // فاز طبقه‌بندی - آبی
  'CLASSIFICATION_PENDING': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'CLASSIFICATION_DONE': 'bg-blue-600/20 text-blue-300 border-blue-600/30',
  
  // فاز تصمیم‌گیری - فیروزه‌ای
  'DESTINATION_PENDING': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'DESTINATION_APPROVED': 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30',
  
  // فاز اجرا - نارنجی
  'LOADING_IN_PROGRESS': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'LOADING_COMPLETED': 'bg-orange-600/20 text-orange-300 border-orange-600/30',
  'TRANSPORTING': 'bg-orange-500/30 text-orange-400 border-orange-500/40',
  'DELIVERED': 'bg-orange-600/30 text-orange-300 border-orange-600/40',
  
  // فاز فرآوری - صورتی
  'PROCESSING': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'BENEFICIATION': 'bg-pink-500/30 text-pink-400 border-pink-500/40',
  'SIZING': 'bg-pink-600/20 text-pink-300 border-pink-600/30',
  
  // فاز نهایی - سبز
  'FINAL_PRODUCT': 'bg-green-500/20 text-green-400 border-green-500/30',
  'SOLD': 'bg-green-600/20 text-green-300 border-green-600/30',
  'COMPLETED': 'bg-green-600/30 text-green-300 border-green-600/40',
};

// ============================================
// برچسب‌های فازها
// ============================================

export const PHASE_LABELS: Record<SubBlockPhase, string> = {
  [SUB_BLOCK_PHASES.DEFINITION]: '📋 تعریف',
  [SUB_BLOCK_PHASES.SAMPLING]: '🔬 نمونه‌برداری',
  [SUB_BLOCK_PHASES.LABORATORY]: '🧪 آزمایشگاه',
  [SUB_BLOCK_PHASES.CLASSIFICATION]: '📊 طبقه‌بندی',
  [SUB_BLOCK_PHASES.DECISION]: '🎯 تصمیم‌گیری',
  [SUB_BLOCK_PHASES.EXECUTION]: '🚛 اجرا',
  [SUB_BLOCK_PHASES.PROCESSING]: '🏭 فرآوری',
  [SUB_BLOCK_PHASES.FINAL]: '✅ نهایی',
};

// ============================================
// رنگ‌های فازها
// ============================================

export const PHASE_COLORS: Record<SubBlockPhase, string> = {
  [SUB_BLOCK_PHASES.DEFINITION]: '#6B7280',
  [SUB_BLOCK_PHASES.SAMPLING]: '#F59E0B',
  [SUB_BLOCK_PHASES.LABORATORY]: '#8B5CF6',
  [SUB_BLOCK_PHASES.CLASSIFICATION]: '#3B82F6',
  [SUB_BLOCK_PHASES.DECISION]: '#06B6D4',
  [SUB_BLOCK_PHASES.EXECUTION]: '#F97316',
  [SUB_BLOCK_PHASES.PROCESSING]: '#EC4899',
  [SUB_BLOCK_PHASES.FINAL]: '#22C55E',
};

// ============================================
// وضعیت‌های قابل انتقال از هر وضعیت
// ============================================

export const STATUS_TRANSITIONS: Partial<Record<SubBlockStatus, SubBlockStatus[]>> = {
  // فاز تعریف
  'DEFINED': ['SUB_BLOCKED', 'SAMPLING_REQUESTED'],
  'SUB_BLOCKED': ['SAMPLING_REQUESTED', 'SAMPLING_COMPLETED'],
  
  // فاز نمونه‌برداری
  'SAMPLING_REQUESTED': ['SAMPLING_SCHEDULED', 'SAMPLING_IN_PROGRESS', 'SAMPLING_COMPLETED', 'DEFINED'],
  'SAMPLING_SCHEDULED': ['SAMPLING_IN_PROGRESS', 'SAMPLING_COMPLETED', 'SAMPLING_REQUESTED'],
  'SAMPLING_IN_PROGRESS': ['SAMPLING_COMPLETED', 'SAMPLING_SCHEDULED'],
  'SAMPLING_COMPLETED': ['LAB_SENT', 'LAB_IN_PROGRESS', 'LAB_COMPLETED'],
  
  // فاز آزمایشگاه
  'LAB_SENT': ['LAB_IN_PROGRESS', 'LAB_COMPLETED'],
  'LAB_IN_PROGRESS': ['LAB_COMPLETED'],
  'LAB_COMPLETED': ['CLASSIFICATION_PENDING', 'CLASSIFICATION_DONE'],
  
  // فاز طبقه‌بندی
  'CLASSIFICATION_PENDING': ['CLASSIFICATION_DONE'],
  'CLASSIFICATION_DONE': ['DESTINATION_PENDING', 'DESTINATION_APPROVED'],
  
  // فاز تصمیم‌گیری
  'DESTINATION_PENDING': ['DESTINATION_APPROVED'],
  'DESTINATION_APPROVED': ['LOADING_IN_PROGRESS', 'DELIVERED', 'PROCESSING', 'FINAL_PRODUCT'],
  
  // فاز اجرا
  'LOADING_IN_PROGRESS': ['LOADING_COMPLETED', 'TRANSPORTING', 'DELIVERED'],
  'LOADING_COMPLETED': ['TRANSPORTING', 'DELIVERED'],
  'TRANSPORTING': ['DELIVERED', 'PROCESSING'],
  'DELIVERED': ['PROCESSING', 'BENEFICIATION', 'SIZING', 'FINAL_PRODUCT'],
  
  // فاز فرآوری و خطوط خردایش
  'PROCESSING': ['BENEFICIATION', 'SIZING', 'FINAL_PRODUCT', 'COMPLETED'],
  'BENEFICIATION': ['SIZING', 'FINAL_PRODUCT'],
  'SIZING': ['FINAL_PRODUCT', 'COMPLETED'],
  
  // فاز نهایی
  'FINAL_PRODUCT': ['SOLD', 'COMPLETED'],
  'SOLD': ['COMPLETED'],
};

// ============================================
// بررسی آیا وضعیت نهایی است
// ============================================

export const isFinalStatus = (status: SubBlockStatus): boolean => {
  return status === 'COMPLETED' || status === 'SOLD' || status === 'FINAL_PRODUCT';
};

// ============================================
// دریافت فاز یک وضعیت
// ============================================

export const getPhase = (status: SubBlockStatus): SubBlockPhase => {
  return STATUS_TO_PHASE[status] || SUB_BLOCK_PHASES.DEFINITION;
};

// ============================================
// دریافت وضعیت‌های یک فاز
// ============================================

export const getStatusesByPhase = (phase: SubBlockPhase): SubBlockStatus[] => {
  return Object.entries(STATUS_TO_PHASE)
    .filter(([_, p]) => p === phase)
    .map(([status]) => status as SubBlockStatus);
};