// src/modules/workspace/domain/workspace.types.ts

export interface UnitKPIItem {
  id: string;
  titleFa: string;
  titleEn: string;
  value: string;
  unitFa?: string;
  unitEn?: string;
  changeFa: string;
  isPositive: boolean;
  statusText?: string;
  target?: string;
  progressPercent?: number;
  iconName: string;
  accentColor: string;
}

export interface UnitToolAction {
  id: string;
  titleFa: string;
  descriptionFa: string;
  categoryFa: string;
  iconName: string;
  actionType: 'NAVIGATE' | 'MODAL' | 'QUICK_LOG' | 'EXECUTE';
  targetUrl?: string;
  badge?: string;
  isPrimary?: boolean;
}

export interface UnitShiftNote {
  id: string;
  roleId: string;
  authorName: string;
  authorCode: string;
  title: string;
  content: string;
  category: 'OPERATIONAL' | 'SAFETY' | 'EQUIPMENT' | 'HANDOVER';
  timestamp: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
}

export interface UnitSpecializedData {
  roleId: string;
  departmentKey: string;
  shiftTitleFa: string;
  currentObjectiveFa: string;
  complianceRate: number;
  activeWorksite: string;
  kpis: UnitKPIItem[];
  tools: UnitToolAction[];
  liveChecklist: {
    id: string;
    labelFa: string;
    isDone: boolean;
    requiredRole: string;
  }[];
  quickStats: {
    labelFa: string;
    value: string;
    color: string;
  }[];
}
