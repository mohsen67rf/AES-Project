// src/modules/alert/services/AlertService.ts

import { Alert, AlertSeverity, AlertCategory, AlertFilter } from '../../../core/domain/types/alert.types';
import { SubBlock } from '../../../core/domain/types/mine.types';
import { SubBlockLifecycleService } from '../../mine/services/SubBlockLifecycleService';
import { SubBlockRepository } from '../../../core/infrastructure/repositories';

const ALERTS_KEY = 'aes_alerts';

export class AlertService {
  
  static createAlert(
    title: string,
    description: string,
    severity: AlertSeverity,
    category: AlertCategory,
    entityType: Alert['entityType'],
    entityId: string,
    entityCode: string,
    source: string,
    metadata?: Record<string, any>
  ): Alert {
    const alert: Alert = {
      id: crypto.randomUUID(),
      title,
      description,
      severity,
      category,
      entityType,
      entityId,
      entityCode,
      createdAt: new Date().toISOString(),
      source,
      metadata,
    };

    const alerts = this.getAllAlerts();
    alerts.push(alert);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));

    console.log(`🔔 هشدار جدید: ${title} (${severity})`);
    return alert;
  }

  static getAllAlerts(): Alert[] {
    try {
      const data = localStorage.getItem(ALERTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static getUnreadAlerts(): Alert[] {
    return this.getAllAlerts().filter(a => !a.readAt);
  }

  static getUnresolvedAlerts(): Alert[] {
    return this.getAllAlerts().filter(a => !a.resolvedAt);
  }

  static filterAlerts(filter: AlertFilter): Alert[] {
    let alerts = this.getAllAlerts();

    if (filter.severity?.length) {
      alerts = alerts.filter(a => filter.severity!.includes(a.severity));
    }
    if (filter.category?.length) {
      alerts = alerts.filter(a => filter.category!.includes(a.category));
    }
    if (filter.entityType?.length) {
      alerts = alerts.filter(a => filter.entityType!.includes(a.entityType));
    }
    if (filter.startDate) {
      alerts = alerts.filter(a => a.createdAt >= filter.startDate!);
    }
    if (filter.endDate) {
      alerts = alerts.filter(a => a.createdAt <= filter.endDate!);
    }
    if (filter.read !== undefined) {
      alerts = alerts.filter(a => filter.read ? !!a.readAt : !a.readAt);
    }
    if (filter.resolved !== undefined) {
      alerts = alerts.filter(a => filter.resolved ? !!a.resolvedAt : !a.resolvedAt);
    }

    return alerts;
  }

  static markAsRead(alertId: string): void {
    const alerts = this.getAllAlerts();
    const index = alerts.findIndex(a => a.id === alertId);
    if (index !== -1 && !alerts[index].readAt) {
      alerts[index].readAt = new Date().toISOString();
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    }
  }

  static markAsResolved(alertId: string, resolvedBy: string, note?: string): void {
    const alerts = this.getAllAlerts();
    const index = alerts.findIndex(a => a.id === alertId);
    if (index !== -1 && !alerts[index].resolvedAt) {
      alerts[index].resolvedAt = new Date().toISOString();
      alerts[index].resolvedBy = resolvedBy;
      alerts[index].resolutionNote = note;
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    }
  }

  static deleteAlert(alertId: string): void {
    const alerts = this.getAllAlerts().filter(a => a.id !== alertId);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }

  static checkAndGenerateAlerts(): Alert[] {
    const newAlerts: Alert[] = [];
    const subBlocks = SubBlockRepository.getAll();

    subBlocks.forEach((sb: SubBlock) => {
      const timeInStatus = SubBlockLifecycleService.getTimeInCurrentStatus(sb);
      const statusLabel = SubBlockLifecycleService.getStatusLabel(sb.status);
      
      if (timeInStatus > 4320) {
        const alert = this.createAlert(
          `⏳ تاخیر در ${statusLabel}`,
          `ساب‌بلوک ${sb.code} بیش از 3 روز در وضعیت "${statusLabel}" باقی مانده است.`,
          'WARNING',
          'DELAY',
          'SUB_BLOCK',
          sb.id,
          sb.code,
          'سیستم بررسی خودکار',
          { timeInStatus, status: sb.status, threshold: 4320 }
        );
        newAlerts.push(alert);
      }

      if (sb.labResults?.assay !== undefined && sb.labResults.assay < 10) {
        const alert = this.createAlert(
          `📉 عیار پایین در ${sb.code}`,
          `عیار ساب‌بلوک ${sb.code} برابر ${sb.labResults.assay}% است که کمتر از حد استاندارد (۱۰%) است.`,
          'WARNING',
          'QUALITY',
          'SUB_BLOCK',
          sb.id,
          sb.code,
          'سیستم بررسی خودکار',
          { assay: sb.labResults.assay, threshold: 10 }
        );
        newAlerts.push(alert);
      }

      if (sb.status === 'CLASSIFICATION_DONE' && !sb.destination) {
        const alert = this.createAlert(
          `❓ بدون تصمیم مقصد`,
          `ساب‌بلوک ${sb.code} طبقه‌بندی شده اما هنوز مقصدی برای آن تعیین نشده است.`,
          'WARNING',
          'PROCESS',
          'SUB_BLOCK',
          sb.id,
          sb.code,
          'سیستم بررسی خودکار'
        );
        newAlerts.push(alert);
      }
    });

    return newAlerts;
  }

  static getAlertStats(): {
    total: number;
    unread: number;
    unresolved: number;
    critical: number;
    warning: number;
    info: number;
    success: number;
    byCategory: Record<AlertCategory, number>;
  } {
    const alerts = this.getAllAlerts();
    const unresolved = alerts.filter(a => !a.resolvedAt);
    const unread = alerts.filter(a => !a.readAt);

    const byCategory: Record<AlertCategory, number> = {
      DELAY: 0,
      QUALITY: 0,
      SAFETY: 0,
      EQUIPMENT: 0,
      PROCESS: 0,
      SUPPLY: 0,
      MAINTENANCE: 0,
      PRODUCTION: 0,
    };

    alerts.forEach((a: Alert) => {
      byCategory[a.category] = (byCategory[a.category] || 0) + 1;
    });

    return {
      total: alerts.length,
      unread: unread.length,
      unresolved: unresolved.length,
      critical: alerts.filter((a: Alert) => a.severity === 'CRITICAL').length,
      warning: alerts.filter((a: Alert) => a.severity === 'WARNING').length,
      info: alerts.filter((a: Alert) => a.severity === 'INFO').length,
      success: alerts.filter((a: Alert) => a.severity === 'SUCCESS').length,
      byCategory,
    };
  }
}

export default AlertService;