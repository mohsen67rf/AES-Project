// src/modules/mine/services/SurveyPermissionService.ts

import type { StakeholderRole } from '../../../core/domain/types/mine.types';
import type { StakeholderMapPermissions } from '../../../core/domain/types/survey-map.types';

export class SurveyPermissionService {
  private static readonly PERMISSION_MATRIX: Record<StakeholderRole, StakeholderMapPermissions> = {
    SUPERVISION: {
      role: 'SUPERVISION',
      title: 'واحد نظارت و نقشه‌برداری معدن',
      canUploadMap: true,
      canEditFeatures: true,
      canCreateSubBlocksOnMap: true,
      canDrawBlastPattern: true,
      canAddAnnotations: true,
      canApproveOfficialMap: true,
      canDeleteMap: true,
      canExportData: true,
      canMeasureAndInspect: true,
      description: 'امکان ورود نقشه‌های ژئودزی، DXF، پهپاد، ویرایش خطوط تراز و تأیید هندسی نقشه‌ها'
    },
    MINING_CONTRACTOR: {
      role: 'MINING_CONTRACTOR',
      title: 'پیمانکار استخراج و دفتر فنی',
      canUploadMap: true,
      canEditFeatures: true,
      canCreateSubBlocksOnMap: true,
      canDrawBlastPattern: true,
      canAddAnnotations: true,
      canApproveOfficialMap: false,
      canDeleteMap: false,
      canExportData: true,
      canMeasureAndInspect: true,
      description: 'امکان ترسیم و تفکیک هندسی ساب‌بلوک‌ها (SA, SB, SC, SD)، طراحی شبکه چال‌پاشی و یادداشت‌های عملیاتی'
    },
    CLIENT: {
      role: 'CLIENT',
      title: 'واحد کارفرما و مدیریت کلان',
      canUploadMap: true,
      canEditFeatures: false,
      canCreateSubBlocksOnMap: false,
      canDrawBlastPattern: false,
      canAddAnnotations: true,
      canApproveOfficialMap: true,
      canDeleteMap: true,
      canExportData: true,
      canMeasureAndInspect: true,
      description: 'تصویب و انتشار نسخه رسمی نقشه‌ها، افزودن ابلاغیه‌های مدیریتی و نظارت بر تغییرات'
    },
    CRUSHING_CONTRACTOR: {
      role: 'CRUSHING_CONTRACTOR',
      title: 'پیمانکار خردایش و دیسپاچینگ',
      canUploadMap: false,
      canEditFeatures: false,
      canCreateSubBlocksOnMap: false,
      canDrawBlastPattern: false,
      canAddAnnotations: false,
      canApproveOfficialMap: false,
      canDeleteMap: false,
      canExportData: true,
      canMeasureAndInspect: true,
      description: 'فقط مشاهده (Read-Only)، اندازه‌گیری فواصل حمل تا سنگ‌شکن‌ها و بررسی موقعیت دپوها'
    },
    ALL: {
      role: 'ALL',
      title: 'دسترسی کامل مدیریت سیستم (SuperAdmin)',
      canUploadMap: true,
      canEditFeatures: true,
      canCreateSubBlocksOnMap: true,
      canDrawBlastPattern: true,
      canAddAnnotations: true,
      canApproveOfficialMap: true,
      canDeleteMap: true,
      canExportData: true,
      canMeasureAndInspect: true,
      description: 'دسترسی نامحدود به تمامی قابلیت‌های مهندسی، بارگذاری و ویرایش نقشه‌های معدن'
    }
  };

  /**
   * دریافت ماتریس مجوزها برای یک نقش خاص
   */
  public static getPermissions(role: StakeholderRole): StakeholderMapPermissions {
    return this.PERMISSION_MATRIX[role] || this.PERMISSION_MATRIX.ALL;
  }

  /**
   * بررسی امکان بارگذاری نقشه جدید
   */
  public static canUpload(role: StakeholderRole): boolean {
    return this.getPermissions(role).canUploadMap;
  }

  /**
   * بررسی امکان ویرایش المان‌های روی نقشه
   */
  public static canEdit(role: StakeholderRole): boolean {
    return this.getPermissions(role).canEditFeatures;
  }

  /**
   * بررسی امکان ترسیم ساب‌بلوک
   */
  public static canCreateSubBlocks(role: StakeholderRole): boolean {
    return this.getPermissions(role).canCreateSubBlocksOnMap;
  }

  /**
   * بررسی امکان تصویب و انتشار رسمی نقشه
   */
  public static canApprove(role: StakeholderRole): boolean {
    return this.getPermissions(role).canApproveOfficialMap;
  }

  /**
   * دریافت کل ماتریس برای نمایش در مودال دسترسی‌ها
   */
  public static getAllPermissions(): StakeholderMapPermissions[] {
    return [
      this.PERMISSION_MATRIX.SUPERVISION,
      this.PERMISSION_MATRIX.MINING_CONTRACTOR,
      this.PERMISSION_MATRIX.CLIENT,
      this.PERMISSION_MATRIX.CRUSHING_CONTRACTOR,
    ];
  }
}
