// src/core/domain/types/task.types.ts

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TaskMapLocation {
  type: 'POINT' | 'POLYGON' | 'LINE' | 'BENCH_ZONE';
  bench: string; // e.g. "1040"
  blockCode?: string; // e.g. "1040 B 33"
  blockId?: string;
  zoneName?: string; // e.g. "زون غربی پله ۱۰۴۰"
  x: number; // percentage on map 0-100 or svg coord
  y: number; // percentage on map 0-100 or svg coord
  polygonPoints?: [number, number][]; // optional polygon vertices percentage [[x1, y1], [x2, y2], ...]
  linePoints?: [number, number][]; // optional polyline vertices percentage [[x1, y1], [x2, y2], ...]
  lengthM?: number; // length in meters for lines
  areaM2?: number; // area in square meters for polygons/zones
  eastingUTM?: number;
  northingUTM?: number;
  elevation?: number;
  notes?: string;
  comment?: string; // کامنت و یادداشت فنی متصل به عارضه ترسیم‌شده
  mapId?: string; // شناسه نقشه مرجع مبنا
  mapTitle?: string; // عنوان نقشه مرجع
  utmCoords?: [number, number][]; // آرایه مختصات واقعی UTM رأس‌ها
}

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
  mapLocation?: TaskMapLocation;
  createdAt: string;
  updatedAt: string;
  history: TaskActionLog[];
}
