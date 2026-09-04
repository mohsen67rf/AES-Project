// src/core/domain/types/alert.types.ts

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';

export type AlertDepartment = 
  | 'ALL'
  | 'MANAGEMENT'
  | 'MINING'
  | 'GEOLOGY'
  | 'SURVEY'
  | 'DISPATCH'
  | 'PIT_OPS'
  | 'LAB'
  | 'WAREHOUSE'
  | 'HSE';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  department: AlertDepartment;
  targetRole?: string; // Role id e.g. 'MiningEngineer', 'DispatchSupervisor'
  sourceModule: 'MINE' | 'BLOCK' | 'EQUIPMENT' | 'WAREHOUSE' | 'LAB' | 'HSE' | 'SYSTEM';
  entityId?: string;
  actionUrl?: string;
  actionLabelFa?: string;
  createdAt: string;
  readAt?: string;
  readBy?: string[];
  resolvedAt?: string;
}
