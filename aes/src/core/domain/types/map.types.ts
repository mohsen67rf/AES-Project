// src/core/domain/types/map.types.ts

// ============================================
// نوع‌های داده برای نقشه
// ============================================

export type MapTool = 
  // ===== فاز ۱: ابزارهای پایه =====
  | 'select'        // انتخاب
  | 'point'         // نقطه
  | 'line'          // خط
  | 'polygon'       // محدوده
  | 'rectangle'     // مستطیل
  | 'circle'        // دایره
  
  // ===== فاز ۱: اندازه‌گیری =====
  | 'measureDistance'  // فاصله
  | 'measureArea'      // مساحت
  | 'measureAngle'     // زاویه
  
  // ===== فاز ۲: ویرایش =====
  | 'edit'          // ویرایش
  | 'delete'        // حذف
  
  // ===== فاز ۲: نشان‌گذاری =====
  | 'pin'           // پین
  | 'label'         // برچسب
  | 'highlight'     // هایلایت
  
  // ===== فاز ۳: تبدیلات =====
  | 'offset'        // آفست
  | 'copy'          // کپی
  | 'rotate'        // چرخش
  
  // ===== حالت‌های خاص =====
  | 'none';         // بدون ابزار

export type MapFeatureType = 
  | 'Point'
  | 'LineString'
  | 'Polygon'
  | 'Circle'
  | 'Rectangle'
  | 'Text';

export interface MapFeature {
  id: string;
  type: MapFeatureType;
  geometry: {
    type: string;
    coordinates: any[];
  };
  properties: {
    name: string;
    description?: string;
    color: string;
    layer: string;
    createdAt: string;
    createdBy: string;
    style?: {
      strokeWidth: number;
      strokeColor: string;
      fillColor: string;
      opacity: number;
      fontSize?: number;
    };
  };
}

export interface MapDrawing {
  id: string;
  mineId: string;
  name: string;
  features: MapFeature[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isPublic: boolean;
}

export interface MapToolbarState {
  activeTool: MapTool;
  selectedFeatureId: string | null;
  isDrawing: boolean;
  isMeasuring: boolean;
}

export interface MapDrawingService {
  getDrawings(mineId: string): MapDrawing[];
  getDrawing(id: string): MapDrawing | null;
  saveDrawing(drawing: MapDrawing): MapDrawing;
  deleteDrawing(id: string): boolean;
  addFeature(drawingId: string, feature: MapFeature): MapFeature;
  updateFeature(drawingId: string, featureId: string, data: Partial<MapFeature>): MapFeature | null;
  deleteFeature(drawingId: string, featureId: string): boolean;
}