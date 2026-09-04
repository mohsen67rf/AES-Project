// src/core/domain/types/task.types.ts

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TaskActionLog {
  id: string;
  action: 'CREATED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'NOTE_ADDED' | 'REFERRED' | 'COMPLETED';
  byUserId: string;
  byUserName: string;
  byUserRole: string;
  timestamp: string;
  comment?: string;
}

export interface UnitTask {
  id: string;
  code: string; // e.g. TSK-104
  title: string;
  description: string;
  department: string;
  assignedRole: string; // Role id e.g. 'MiningEngineer'
  assignedUserId?: string;
  assignedUserName?: string;
  createdByUserId: string;
  createdByUserName: string;
  createdByUserRole: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  relatedModule?: 'BLOCKS' | 'EQUIPMENT' | 'GIS' | 'LAB' | 'WAREHOUSE' | 'HSE' | 'GENERAL';
  relatedEntityId?: string;
  relatedEntityCode?: string;
  actionUrl?: string;
  completionNotes?: string;
  createdAt: string;
  updatedAt: string;
  history: TaskActionLog[];
}
