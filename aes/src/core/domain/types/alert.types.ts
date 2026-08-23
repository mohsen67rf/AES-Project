// src/core/domain/types/alert.types.ts

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
export type AlertCategory = 
  | 'DELAY'
  | 'QUALITY'
  | 'SAFETY'
  | 'EQUIPMENT'
  | 'PROCESS'
  | 'SUPPLY'
  | 'MAINTENANCE'
  | 'PRODUCTION';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  entityType: 'BLOCK' | 'SUB_BLOCK' | 'PIT' | 'MINE' | 'EQUIPMENT' | 'PROCESS';
  entityId: string;
  entityCode: string;
  createdAt: string;
  readAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  assignedTo?: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface AlertFilter {
  severity?: AlertSeverity[];
  category?: AlertCategory[];
  entityType?: Alert['entityType'][];
  startDate?: string;
  endDate?: string;
  read?: boolean;
  resolved?: boolean;
}