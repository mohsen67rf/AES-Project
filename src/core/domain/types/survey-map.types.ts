// src/core/domain/types/survey-map.types.ts

export type MapCategory = 
  | 'TOPOGRAPHY'             // نقشه توپوگرافی و منحنی میزان ادواری
  | 'BENCH_PLAN'              // پلان و تراز استخراجی پله
  | 'BLAST_PATTERN'          // نقشه الگوی چال‌پاشی و آتشباری
  | 'ORTHOMOSAIC_DRONE'      // تصویر ارتوفتوی هوایی پهپاد
  | 'GEOLOGY_BLOCK_MODEL'    // مدل بلوکی و زون‌بندی زمین‌شناسی
  | 'HAUL_ROAD_NETWORK'      // شبکه راه‌ها، رمپ‌ها و دامپ‌ها
  | 'HAZARD_SAFETY_ZONE';    // حریم‌های ایمنی، درزه‌ها و گسل‌ها

export type MapFormat = 
  | 'GEOJSON'
  | 'DXF_JSON'
  | 'KML'
  | 'CSV_POINTS'
  | 'RASTER_IMAGE'
  | 'VECTOR_CAD';

export type MapFeatureType = 
  | 'POLYGON'
  | 'POLYLINE'
  | 'POINT'
  | 'TEXT_ANNOTATION'
  | 'CIRCLE_ZONE';

export type OperationalUnitType = 
  | 'ALL'
  | 'SURVEY'        // واحد نقشه‌برداری و ژئودزی (مرجع اصلی بارگذاری نقشه)
  | 'MINING'        // واحد استخراج و طراحی معدن
  | 'DRILLING'      // واحد حفاری و آتشباری
  | 'GEOLOGY'       // واحد زمین‌شناسی و مدلسازی کانسار
  | 'FLEET'         // واحد بارگیری، ترابری و دیسپاچینگ ماشین‌آلات
  | 'STOCKPILE'     // واحد دپوها و سنگ‌شکن
  | 'SAFETY'        // واحد ایمنی، HSE و ژئوتکنیک
  | 'FIELD_TASKS';  // واحد تسک‌ها و دستورکارهای میدانی

export type FeatureCategory = 
  | 'SUB_BLOCK'              // ساب‌بلوک استخراجی (SA, SB, SC, SD)
  | 'MINING_BLOCK'           // بلوک کامل معدنی
  | 'BLAST_BOUNDARY'         // مرز آتشباری
  | 'BLAST_HOLE'             // سرچال و گمانه حفاری
  | 'DRILLING_BAND'          // باند حفاری و مرز چال‌پاشی (واحد حفاری)
  | 'BLAST_DANGER_ZONE'      // حریم ایمنی پرتاب سنگ و موج انفجار
  | 'GEOLOGY_ROCK_BAND'      // باند و زون جنس سنگ و لیتولوژی (واحد زمین‌شناسی)
  | 'GEOLOGY_FAULT'          // موقعیت گسل و درزه ساختاری معدن (واحد زمین‌شناسی)
  | 'BENCH_CREST'            // لبه بالای پله (Crest)
  | 'BENCH_TOE'              // پای پله (Toe)
  | 'SURVEY_BENCHMARK'       // بنچ‌مارک و نقاط مبنای ژئودزی
  | 'HAUL_ROAD'              // محور جاده باربری و رمپ
  | 'STOCKPILE_BOUNDARY'     // محدوده دپو کانسنگ
  | 'CRUSHER_FACILITY'       // تاسیسات سنگ‌شکن
  | 'FLEET_EQUIPMENT'        // موقعیت استقرار شاول، لودر، تراک و دریل
  | 'HAZARD_CRACK'           // درزه، ترک و زون ناپایدار
  | 'TASK_ACTION_PIN'        // پین تسک و دستورکار میدانی روی نقشه
  | 'ANNOTATION';            // یادداشت متنی مهندسی

export interface FeatureStyle {
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
  strokeDash?: string;      // 'solid' | 'dashed' | 'dotted'
  fillOpacity?: number;      // 0 to 1
  pointRadius?: number;
  pointIcon?: string;
  fontSize?: number;
  textColor?: string;
}

export interface MapFeature {
  id: string;
  mapId: string;
  layerId: string;
  name: string;
  type: MapFeatureType;
  category: FeatureCategory;
  coordinates: number[][];   // [[x1, y1], [x2, y2], ...] or [[x, y]] for Point
  elevation?: number;        // تراز Z بر حسب متر
  properties: {
    code?: string;
    subBlockId?: string;
    blockId?: string;
    feGrade?: number;
    feoGrade?: number;
    sio2Grade?: number;
    tonnage?: number;
    volumeM3?: number;
    areaM2?: number;
    lengthM?: number;
    rockType?: string;
    depthM?: number;
    holeDiameterMm?: number;
    status?: string;
    destination?: string;
    notes?: string;
    hazardLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    unit?: OperationalUnitType;
    [key: string]: any;
  };
  unit?: OperationalUnitType;
  style: FeatureStyle;
  createdBy: string;
  createdRole: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface MapLayer {
  id: string;
  mapId: string;
  name: string;
  category: FeatureCategory | 'GENERAL';
  unit?: OperationalUnitType;   // واحد عملیاتی صاحب لایه (حفاری، زمین‌شناسی، نقشه‌برداری، استخراج، ایمنی)
  color: string;
  strokeWidth?: number;
  strokeDash?: 'solid' | 'dashed' | 'dotted' | 'dashdot';
  showLabels?: boolean;     // کنترل انتخابی نمایش برچسب‌ها برای این لایه
  isVisible: boolean;
  isLocked: boolean;
  opacity: number;          // 0 to 1
  featureCount: number;
  description?: string;
}

export interface MapRevisionLog {
  id: string;
  revision: string;
  action: 'IMPORT' | 'FEATURE_ADDED' | 'FEATURE_EDITED' | 'FEATURE_DELETED' | 'LAYER_MODIFIED' | 'APPROVED_OFFICIAL' | 'RESTORED';
  description: string;
  performedBy: string;
  performedRole: string;
  timestamp: string;
  featureId?: string;
}

export interface SurveyMap {
  id: string;
  code: string;
  title: string;
  description?: string;
  category: MapCategory;
  format: MapFormat;
  surveyDate: string;
  surveyorUnit: string;      // e.g. "واحد نقشه‌برداری و فتوگرامتری نظارت"
  surveyorName: string;      // e.g. "مهندس مرادی"
  benchLevel: number;        // e.g. 1040
  pitId: string;
  coordinateSystem: string;  // e.g. "UTM Zone 39N (WGS84)"
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ?: number;
    maxZ?: number;
  };
  version: string;           // e.g. "Rev 1.0", "Rev 1.1"
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED_OFFICIAL' | 'SUPERSEDED';
  isMasterMap?: boolean;     // آیا این نقشه مرجع رسمی فعال کل سامانه است؟
  masterApprovedAt?: string; // زمان انتشار به عنوان نقشه فعال سامانه
  masterApprovedBy?: string; // مسئول واحد نقشه‌برداری منتشرکننده
  layers: MapLayer[];
  features: MapFeature[];
  rasterImageUrl?: string;   // For Drone Orthomosaics or Scanned survey overlays
  approvedBy?: string;
  approvedDate?: string;
  revisionHistory: MapRevisionLog[];
  createdAt: string;
  updatedAt: string;
}

export interface StakeholderMapPermissions {
  role: string;
  title: string;
  canUploadMap: boolean;
  canEditFeatures: boolean;
  canCreateSubBlocksOnMap: boolean;
  canDrawBlastPattern: boolean;
  canAddAnnotations: boolean;
  canApproveOfficialMap: boolean;
  canDeleteMap: boolean;
  canExportData: boolean;
  canMeasureAndInspect: boolean;
  description: string;
}
