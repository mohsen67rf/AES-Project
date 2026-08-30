// src/modules/mine/services/SurveyMapService.ts

import { 
  SurveyMapRepository, 
  SubBlockRepository 
} from '../../../core/infrastructure/repositories';
import type { 
  SurveyMap, 
  MapFeature, 
  MapLayer, 
  MapRevisionLog, 
  MapCategory, 
  MapFormat
} from '../../../core/domain/types/survey-map.types';
import type { StakeholderRole } from '../../../core/domain/types/mine.types';

export class SurveyMapService {
  /**
   * دریافت تمامی نقشه‌های موجود در سامانه
   */
  public static getAllMaps(): SurveyMap[] {
    this.ensureInitialized();
    return SurveyMapRepository.getAll();
  }

  /**
   * دریافت یک نقشه بر اساس شناسه
   */
  public static getMapById(id: string): SurveyMap | null {
    this.ensureInitialized();
    return SurveyMapRepository.getById(id) || null;
  }

  /**
   * ذخیره یا به‌روزرسانی نقشه
   */
  public static saveMap(map: SurveyMap, userRole: StakeholderRole, userName: string, changeNote?: string): SurveyMap {
    map.updatedAt = new Date().toISOString();
    
    if (changeNote) {
      const revisionLog: MapRevisionLog = {
        id: `rev-${Date.now()}`,
        revision: map.version,
        action: 'FEATURE_EDITED',
        description: changeNote,
        performedBy: userName,
        performedRole: userRole,
        timestamp: new Date().toISOString()
      };
      map.revisionHistory = [revisionLog, ...(map.revisionHistory || [])];
    }

    SurveyMapRepository.save(map);
    return map;
  }

  /**
   * ایجاد نقشه جدید از طریق ایمپورت فایل یا ترسیم
   */
  public static createNewMap(
    data: {
      title: string;
      category: MapCategory;
      format: MapFormat;
      benchLevel: number;
      surveyorUnit: string;
      surveyorName: string;
      coordinateSystem?: string;
      features?: MapFeature[];
      layers?: MapLayer[];
      rasterImageUrl?: string;
      description?: string;
    },
    userRole: StakeholderRole,
    userName: string
  ): SurveyMap {
    const defaultLayers: MapLayer[] = data.layers || [
      { id: 'layer-crest', mapId: '', name: 'لبه بالای پله (Crest Lines)', category: 'BENCH_CREST', color: '#00D4FF', strokeWidth: 3, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 0 },
      { id: 'layer-toe', mapId: '', name: 'پای پله و کف تراز (Toe Lines)', category: 'BENCH_TOE', color: '#38BDF8', strokeWidth: 2, strokeDash: 'dashed', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 0 },
      { id: 'layer-topography', mapId: '', name: 'منحنی‌های میزان و توپوگرافی', category: 'GENERAL', color: '#67E8F9', strokeWidth: 1.5, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 0.8, featureCount: 0 },
      { id: 'layer-subblocks', mapId: '', name: 'ساب‌بلوک‌های استخراجی (SA, SB, SC, SD)', category: 'SUB_BLOCK', color: '#10B981', strokeWidth: 2, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 0.85, featureCount: 0 },
      { id: 'layer-holes', mapId: '', name: 'شبکه چال‌پاشی و انفجار', category: 'BLAST_HOLE', color: '#F59E0B', strokeWidth: 1, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 0 },
      { id: 'layer-roads', mapId: '', name: 'رمپ‌ها و شبکه راه‌های حمل', category: 'HAUL_ROAD', color: '#60A5FA', strokeWidth: 3, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 0 },
      { id: 'layer-benchmarks', mapId: '', name: 'بنچ‌مارک‌ها و نقاط ژئودزی', category: 'SURVEY_BENCHMARK', color: '#EC4899', strokeWidth: 1.5, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 1, featureCount: 0 },
      { id: 'layer-hazards', mapId: '', name: 'حریم‌های ایمنی و درزه‌ها', category: 'HAZARD_CRACK', color: '#EF4444', strokeWidth: 2, strokeDash: 'dotted', showLabels: false, isVisible: true, isLocked: false, opacity: 0.7, featureCount: 0 },
      { id: 'layer-annotations', mapId: '', name: 'یادداشت‌ها و برچسب‌های مهندسی', category: 'ANNOTATION', color: '#FBBF24', strokeWidth: 1, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 1, featureCount: 0 },
    ];

    const mapId = `map-${Date.now()}`;
    const layers = defaultLayers.map(l => ({ ...l, mapId }));

    const initialRevision: MapRevisionLog = {
      id: `rev-${Date.now()}`,
      revision: 'Rev 1.0',
      action: 'IMPORT',
      description: `ورود اولیه نقشه توسط ${userName} (${userRole})`,
      performedBy: userName,
      performedRole: userRole,
      timestamp: new Date().toISOString()
    };

    let calculatedBounds = data.bounds;
    if (!calculatedBounds && data.features && data.features.length > 0) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      data.features.forEach(f => {
        f.coordinates?.forEach(([x, y]) => {
          if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        });
      });
      if (minX !== Infinity && maxX > minX && maxY > minY) {
        const dx = maxX - minX;
        const dy = maxY - minY;
        const padX = Math.max(dx * 0.05, 0.0001);
        const padY = Math.max(dy * 0.05, 0.0001);
        calculatedBounds = {
          minX: minX - padX,
          maxX: maxX + padX,
          minY: minY - padY,
          maxY: maxY + padY,
          minZ: data.benchLevel - 15,
          maxZ: data.benchLevel + 15
        };
      }
    }

    const newMap: SurveyMap = {
      id: mapId,
      code: `MAP-${data.benchLevel}-${Math.floor(Math.random() * 900 + 100)}`,
      title: data.title,
      description: data.description || 'نقشه رسمی تولید شده توسط واحد نقشه‌برداری',
      category: data.category,
      format: data.format,
      surveyDate: new Date().toISOString().split('T')[0],
      surveyorUnit: data.surveyorUnit,
      surveyorName: data.surveyorName,
      benchLevel: data.benchLevel,
      pitId: 'pit-central',
      coordinateSystem: data.coordinateSystem || 'UTM Zone 39N (WGS84)',
      bounds: calculatedBounds || {
        minX: 584100,
        maxX: 585500,
        minY: 3512200,
        maxY: 3513600,
        minZ: data.benchLevel - 15,
        maxZ: data.benchLevel + 15
      },
      version: 'Rev 1.0',
      status: userRole === 'SUPERVISION' || userRole === 'CLIENT' ? 'APPROVED_OFFICIAL' : 'PENDING_REVIEW',
      layers,
      features: (data.features || []).map(f => ({ ...f, mapId })),
      rasterImageUrl: data.rasterImageUrl,
      revisionHistory: [initialRevision],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    SurveyMapRepository.save(newMap);
    return newMap;
  }

  /**
   * اضافه کردن یک المان جدید (چندضلعی، خط، نقطه، یادداشت) به نقشه
   */
  public static addFeature(
    mapId: string,
    feature: Omit<MapFeature, 'id' | 'mapId' | 'createdAt'>,
    userRole: StakeholderRole,
    userName: string
  ): MapFeature | null {
    const map = this.getMapById(mapId);
    if (!map) return null;

    const featureId = `feat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newFeature: MapFeature = {
      ...feature,
      id: featureId,
      mapId,
      createdAt: new Date().toISOString(),
      createdBy: userName,
      createdRole: userRole
    };

    map.features.push(newFeature);

    // به‌روزرسانی شمارنده لایه
    const targetLayer = map.layers.find(l => l.id === feature.layerId);
    if (targetLayer) {
      targetLayer.featureCount = (targetLayer.featureCount || 0) + 1;
    }

    // ثبت لاگ ممیزی
    const revisionLog: MapRevisionLog = {
      id: `rev-${Date.now()}`,
      revision: map.version,
      action: 'FEATURE_ADDED',
      description: `افزودن المان '${newFeature.name}' (${newFeature.category}) توسط ${userName}`,
      performedBy: userName,
      performedRole: userRole,
      timestamp: new Date().toISOString(),
      featureId
    };
    map.revisionHistory = [revisionLog, ...map.revisionHistory];
    map.updatedAt = new Date().toISOString();

    // همگام‌سازی خودکار با پایگاه داده ساب‌بلوک‌ها در صورت تعریف ساب‌بلوک
    if (newFeature.category === 'SUB_BLOCK' && newFeature.properties.code) {
      this.syncSubBlockWithCore(newFeature, map.benchLevel, userName);
    }

    SurveyMapRepository.save(map);
    return newFeature;
  }

  /**
   * تغییر وضعیت مرئی بودن یک لایه
   */
  public static toggleLayerVisibility(mapId: string, layerId: string): boolean {
    const map = this.getMapById(mapId);
    if (!map) return false;

    map.layers = map.layers.map(l => {
      if (l.id === layerId) {
        return { ...l, isVisible: !l.isVisible };
      }
      return l;
    });

    map.updatedAt = new Date().toISOString();
    SurveyMapRepository.save(map);
    return true;
  }

  /**
   * تنظیم دسته‌جمعی وضعیت مرئی بودن لایه‌ها
   */
  public static setLayersVisibility(mapId: string, layerIds: string[], visible: boolean): boolean {
    const map = this.getMapById(mapId);
    if (!map) return false;

    const idSet = new Set(layerIds);
    map.layers = map.layers.map(l => {
      if (idSet.has(l.id)) {
        return { ...l, isVisible: visible };
      }
      return l;
    });

    map.updatedAt = new Date().toISOString();
    SurveyMapRepository.save(map);
    return true;
  }

  /**
   * تنظیم میزان شفافیت (Opacity) یک لایه
   */
  public static setLayerOpacity(mapId: string, layerId: string, opacity: number): boolean {
    const map = this.getMapById(mapId);
    if (!map) return false;

    map.layers = map.layers.map(l => {
      if (l.id === layerId) {
        return { ...l, opacity: Math.max(0.05, Math.min(1, opacity)) };
      }
      return l;
    });

    map.updatedAt = new Date().toISOString();
    SurveyMapRepository.save(map);
    return true;
  }

  /**
   * قفل یا باز کردن قفل ویرایش یک لایه
   */
  public static toggleLayerLock(mapId: string, layerId: string): boolean {
    const map = this.getMapById(mapId);
    if (!map) return false;

    map.layers = map.layers.map(l => {
      if (l.id === layerId) {
        return { ...l, isLocked: !l.isLocked };
      }
      return l;
    });

    map.updatedAt = new Date().toISOString();
    SurveyMapRepository.save(map);
    return true;
  }

  /**
   * تغییر وضعیت نمایش انتخابی برچسب‌های یک لایه
   */
  public static toggleLayerLabels(mapId: string, layerId: string, forceState?: boolean): boolean {
    const map = this.getMapById(mapId);
    if (!map) return false;

    map.layers = map.layers.map(l => {
      if (l.id === layerId) {
        const nextState = forceState !== undefined ? forceState : !(l.showLabels ?? (l.category === 'SUB_BLOCK' || l.category === 'ANNOTATION'));
        return { ...l, showLabels: nextState };
      }
      return l;
    });

    map.updatedAt = new Date().toISOString();
    SurveyMapRepository.save(map);
    return true;
  }

  /**
   * تغییر دسته‌جمعی وضعیت نمایش برچسب‌های لایه‌های انتخابی
   */
  public static setLayersLabelsVisibility(mapId: string, layerIds: string[], showLabels: boolean): boolean {
    const map = this.getMapById(mapId);
    if (!map) return false;

    const idSet = new Set(layerIds);
    map.layers = map.layers.map(l => {
      if (idSet.has(l.id)) {
        return { ...l, showLabels };
      }
      return l;
    });

    map.updatedAt = new Date().toISOString();
    SurveyMapRepository.save(map);
    return true;
  }

  /**
   * اعمال تغییرات استایل و رنگ به صورت تکی یا گروهی روی لایه‌ها و عوارض زیرمجموعه
   */
  public static updateLayersStyle(
    mapId: string,
    layerIds: string[],
    styleUpdates: {
      color?: string;
      strokeWidth?: number;
      strokeDash?: 'solid' | 'dashed' | 'dotted' | 'dashdot';
      opacity?: number;
      showLabels?: boolean;
    },
    applyToFeatures: boolean = true,
    userRole: StakeholderRole = 'SUPERVISION',
    userName: string = 'کاربر سامانه'
  ): boolean {
    const map = this.getMapById(mapId);
    if (!map) return false;

    const idSet = new Set(layerIds);
    const affectedLayerNames: string[] = [];

    // ۱. به‌روزرسانی مشخصات لایه‌ها
    map.layers = map.layers.map(l => {
      if (idSet.has(l.id)) {
        affectedLayerNames.push(l.name);
        return {
          ...l,
          color: styleUpdates.color ?? l.color,
          strokeWidth: styleUpdates.strokeWidth ?? l.strokeWidth,
          strokeDash: styleUpdates.strokeDash ?? l.strokeDash,
          opacity: styleUpdates.opacity !== undefined ? styleUpdates.opacity : l.opacity,
          showLabels: styleUpdates.showLabels !== undefined ? styleUpdates.showLabels : l.showLabels
        };
      }
      return l;
    });

    // ۲. اعمال استایل روی تمامی عوارض و خطوط متعلق به این لایه‌ها (مثل خطوط Crest، Toe، رمپ‌ها و ساب‌بلوک‌ها)
    if (applyToFeatures) {
      map.features = map.features.map(feat => {
        if (idSet.has(feat.layerId)) {
          const updatedStyle = { ...feat.style };
          if (styleUpdates.color) {
            updatedStyle.strokeColor = styleUpdates.color;
            if (feat.style.fillColor) {
              updatedStyle.fillColor = styleUpdates.color;
            }
          }
          if (styleUpdates.strokeWidth !== undefined) {
            updatedStyle.strokeWidth = styleUpdates.strokeWidth;
          }
          if (styleUpdates.strokeDash !== undefined) {
            updatedStyle.strokeDash = styleUpdates.strokeDash;
          }
          if (styleUpdates.opacity !== undefined && feat.type === 'POLYGON') {
            updatedStyle.fillOpacity = styleUpdates.opacity;
          }
          return { ...feat, style: updatedStyle };
        }
        return feat;
      });
    }

    // ثبت ممیزی لاگ
    const revisionLog: MapRevisionLog = {
      id: `rev-${Date.now()}`,
      revision: map.version,
      action: 'LAYER_MODIFIED',
      description: `تغییر استایل و ظاهر لایه‌های (${affectedLayerNames.join('، ')}) توسط ${userName}`,
      performedBy: userName,
      performedRole: userRole,
      timestamp: new Date().toISOString()
    };
    map.revisionHistory = [revisionLog, ...(map.revisionHistory || [])];
    map.updatedAt = new Date().toISOString();

    SurveyMapRepository.save(map);
    return true;
  }

  /**
   * ویرایش المان موجود در نقشه
   */
  public static updateFeature(
    mapId: string,
    featureId: string,
    updates: Partial<MapFeature>,
    userRole: StakeholderRole,
    userName: string
  ): MapFeature | null {
    const map = this.getMapById(mapId);
    if (!map) return null;

    const index = map.features.findIndex(f => f.id === featureId);
    if (index === -1) return null;

    const oldFeature = map.features[index];
    const updatedFeature: MapFeature = {
      ...oldFeature,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: userName
    };

    map.features[index] = updatedFeature;

    const revisionLog: MapRevisionLog = {
      id: `rev-${Date.now()}`,
      revision: map.version,
      action: 'FEATURE_EDITED',
      description: `ویرایش المان '${updatedFeature.name}' توسط ${userName}`,
      performedBy: userName,
      performedRole: userRole,
      timestamp: new Date().toISOString(),
      featureId
    };
    map.revisionHistory = [revisionLog, ...map.revisionHistory];
    map.updatedAt = new Date().toISOString();

    if (updatedFeature.category === 'SUB_BLOCK' && updatedFeature.properties.code) {
      this.syncSubBlockWithCore(updatedFeature, map.benchLevel, userName);
    }

    SurveyMapRepository.save(map);
    return updatedFeature;
  }

  /**
   * حذف یک المان از نقشه
   */
  public static deleteFeature(
    mapId: string,
    featureId: string,
    userRole: StakeholderRole,
    userName: string
  ): boolean {
    const map = this.getMapById(mapId);
    if (!map) return false;

    const feature = map.features.find(f => f.id === featureId);
    if (!feature) return false;

    map.features = map.features.filter(f => f.id !== featureId);

    const revisionLog: MapRevisionLog = {
      id: `rev-${Date.now()}`,
      revision: map.version,
      action: 'FEATURE_DELETED',
      description: `حذف المان '${feature.name}' (${feature.category}) توسط ${userName}`,
      performedBy: userName,
      performedRole: userRole,
      timestamp: new Date().toISOString(),
      featureId
    };
    map.revisionHistory = [revisionLog, ...map.revisionHistory];
    map.updatedAt = new Date().toISOString();

    SurveyMapRepository.save(map);
    return true;
  }

  /**
   * تصویب رسمی و انتشار نسخه جدید نقشه توسط کارفرما / سرپرست نظارت
   */
  public static approveAndPublishMap(
    mapId: string,
    newVersionLabel: string,
    approverName: string,
    approverRole: StakeholderRole,
    approvalNotes: string
  ): SurveyMap | null {
    const map = this.getMapById(mapId);
    if (!map) return null;

    map.status = 'APPROVED_OFFICIAL';
    map.version = newVersionLabel || `Rev ${parseFloat(map.version.replace('Rev ', '') || '1.0') + 0.1}`;
    map.approvedBy = approverName;
    map.approvedDate = new Date().toISOString();
    map.updatedAt = new Date().toISOString();

    const revisionLog: MapRevisionLog = {
      id: `rev-${Date.now()}`,
      revision: map.version,
      action: 'APPROVED_OFFICIAL',
      description: `تصویب و ابلاغ رسمی نسخه ${map.version}: ${approvalNotes}`,
      performedBy: approverName,
      performedRole: approverRole,
      timestamp: new Date().toISOString()
    };
    map.revisionHistory = [revisionLog, ...map.revisionHistory];

    SurveyMapRepository.save(map);
    return map;
  }

  /**
   * همگام‌سازی ساب‌بلوک ترسیم‌شده روی نقشه با ریپازیتوری ساب‌بلوک‌های اصلی
   */
  private static syncSubBlockWithCore(feature: MapFeature, benchLevel: number, userName: string) {
    try {
      const code = feature.properties.code || feature.name;
      const existing = SubBlockRepository.getAll().find(sb => sb.code === code);
      if (existing) {
        existing.tonnage = feature.properties.tonnage || existing.tonnage;
        if (feature.properties.feGrade !== undefined) {
          existing.labResults = {
            ...(existing.labResults || { analyzedAt: new Date().toISOString(), approvedBy: userName }),
            fe: feature.properties.feGrade,
            sio2: feature.properties.sio2Grade,
            feo: feature.properties.feoGrade,
          };
        }
        SubBlockRepository.save(existing);
      }
    } catch (e) {
      console.warn('SubBlock sync skipped:', e);
    }
  }

  /**
   * محاسبه مساحت چندضلعی به متر مربع
   */
  public static calculateArea(coords: number[][]): { areaM2: number; areaHectares: number } {
    if (coords.length < 3) return { areaM2: 0, areaHectares: 0 };
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i][0] * coords[j][1];
      area -= coords[j][0] * coords[i][1];
    }
    const absArea = Math.abs(area) / 2;
    return {
      areaM2: Math.round(absArea),
      areaHectares: parseFloat((absArea / 10000).toFixed(3))
    };
  }

  /**
   * محاسبه طول مسیر / خط به متر
   */
  public static calculateLength(coords: number[][]): number {
    if (coords.length < 2) return 0;
    let length = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const dx = coords[i + 1][0] - coords[i][0];
      const dy = coords[i + 1][1] - coords[i][1];
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.round(length);
  }

  /**
   * تبدیل رشته GeoJSON به نقشه و لایه‌ها
   */
  public static parseGeoJSON(
    geoJsonString: string,
    title: string,
    benchLevel: number,
    surveyorUnit: string,
    surveyorName: string,
    userRole: StakeholderRole
  ): SurveyMap {
    const geoData = JSON.parse(geoJsonString);
    const features: MapFeature[] = [];

    interface GeoJsonRawFeature {
      geometry?: {
        type?: string;
        coordinates?: (number[] | number[][]);
      };
      properties?: Record<string, string | number | undefined>;
    }

    const rawFeatures: GeoJsonRawFeature[] = geoData.features || (geoData.type === 'Feature' ? [geoData] : []);

    rawFeatures.forEach((f: GeoJsonRawFeature, idx: number) => {
      const geom = f.geometry || (f.type ? f : {});
      const props = f.properties || {};
      const gType = geom.type || 'Polygon';

      const createFeatureItem = (coords: number[][], type: MapFeature['type'], subIdx: number = 0) => {
        if (!coords || coords.length === 0) return;
        const rawLayer = props.layer || props.Layer || (type === 'POLYGON' ? 'SUB_BLOCKS' : type === 'POLYLINE' ? 'HAUL_ROADS' : 'SURVEY_POINTS');
        const defaultColor = type === 'POLYGON' ? '#10B981' : type === 'POLYLINE' ? '#38BDF8' : '#F59E0B';

        features.push({
          id: `feat-imp-${idx}-${subIdx}-${Date.now()}`,
          mapId: '',
          layerId: type === 'POLYGON' ? 'layer-subblocks' : type === 'POLYLINE' ? 'layer-roads' : 'layer-holes',
          name: (props.name || props.code || props.id || `عارضه ${idx + 1}${subIdx > 0 ? `-${subIdx + 1}` : ''}`) as string,
          type,
          category: (props.category as MapFeature['category']) || (type === 'POLYGON' ? 'SUB_BLOCK' : type === 'POLYLINE' ? 'HAUL_ROAD' : 'BLAST_HOLE'),
          coordinates: coords,
          elevation: Number(props.elevation || props.z || benchLevel),
          properties: {
            code: (props.code || props.name || `FEAT-${idx + 1}`) as string,
            tonnage: Number(props.tonnage || 4000),
            feGrade: Number(props.feGrade || props.fe || 58.5),
            rockType: (props.rockType as string) || 'مگنتیت پرعیار',
            notes: (props.notes as string) || `ایمپورت شده از لایه ${rawLayer}`
          },
          style: {
            strokeColor: (props.strokeColor || props.stroke || defaultColor) as string,
            fillColor: (props.fillColor || props.fill || `${defaultColor}25`) as string,
            strokeWidth: 1.2,
            fillOpacity: type === 'POLYGON' ? 0.18 : 1,
            pointRadius: 3.5
          },
          createdBy: surveyorName,
          createdRole: userRole,
          createdAt: new Date().toISOString()
        });
      };

      if (gType === 'Polygon') {
        const ring = (geom.coordinates as number[][][])?.[0] || [];
        const coords = ring.map((pt: number[]) => [Number(pt[0]), Number(pt[1])]);
        createFeatureItem(coords, 'POLYGON');
      } else if (gType === 'MultiPolygon') {
        const polygons = (geom.coordinates as number[][][][]) || [];
        polygons.forEach((poly, pIdx) => {
          const ring = poly[0] || [];
          const coords = ring.map((pt: number[]) => [Number(pt[0]), Number(pt[1])]);
          createFeatureItem(coords, 'POLYGON', pIdx);
        });
      } else if (gType === 'LineString') {
        const line = (geom.coordinates as number[][]) || [];
        const coords = line.map((pt: number[]) => [Number(pt[0]), Number(pt[1])]);
        createFeatureItem(coords, 'POLYLINE');
      } else if (gType === 'MultiLineString') {
        const lines = (geom.coordinates as number[][][]) || [];
        lines.forEach((line, lIdx) => {
          const coords = line.map((pt: number[]) => [Number(pt[0]), Number(pt[1])]);
          createFeatureItem(coords, 'POLYLINE', lIdx);
        });
      } else if (gType === 'Point') {
        const pt = (geom.coordinates as number[]) || [0, 0];
        const coords = [[Number(pt[0]), Number(pt[1])]];
        createFeatureItem(coords, 'POINT');
      } else if (gType === 'MultiPoint') {
        const points = (geom.coordinates as number[][]) || [];
        points.forEach((pt, ptIdx) => {
          const coords = [[Number(pt[0]), Number(pt[1])]];
          createFeatureItem(coords, 'POINT', ptIdx);
        });
      }
    });

    return this.createNewMap(
      {
        title: title || 'نقشه وارد شده از GeoJSON',
        category: 'BENCH_PLAN',
        format: 'GEOJSON',
        benchLevel,
        surveyorUnit,
        surveyorName,
        features,
        description: `شامل ${features.length} المان ژئودزی و مهندسی`
      },
      userRole,
      surveyorName
    );
  }

  /**
   * بارگذاری نقشه‌های استاندارد و پیش‌فرض معدن در صورت خالی بودن ریپازیتوری
   */
  private static ensureInitialized() {
    if (SurveyMapRepository.count() > 0) return;

    // ۱. نقشه پلان استخراجی و تفکیک ساب‌بلوک‌های تراز ۱۰۴۰
    const map1Features: MapFeature[] = [
      // ساب‌بلوک SA
      {
        id: 'feat-sb-1040-sa',
        mapId: 'map-default-1040',
        layerId: 'layer-subblocks',
        name: 'ساب‌بلوک 1040 B 32 – SA',
        type: 'POLYGON',
        category: 'SUB_BLOCK',
        coordinates: [
          [584400, 3512800],
          [584480, 3512800],
          [584480, 3512880],
          [584400, 3512880]
        ],
        elevation: 1040,
        properties: {
          code: '1040 B 32 – SA',
          tonnage: 4200,
          feGrade: 61.4,
          feoGrade: 22.1,
          sio2Grade: 5.2,
          rockType: 'مگنتیت پرعیار (High-Grade Magnetite)',
          destination: 'سنگ‌شکن خط ۱',
          status: 'CLASSIFIED_HIGH'
        },
        style: {
          strokeColor: '#10B981',
          fillColor: '#10B981',
          fillOpacity: 0.35,
          strokeWidth: 2
        },
        createdBy: 'واحد نقشه‌برداری نظارت',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },
      // ساب‌بلوک SB
      {
        id: 'feat-sb-1040-sb',
        mapId: 'map-default-1040',
        layerId: 'layer-subblocks',
        name: 'ساب‌بلوک 1040 B 32 – SB',
        type: 'POLYGON',
        category: 'SUB_BLOCK',
        coordinates: [
          [584480, 3512800],
          [584560, 3512800],
          [584560, 3512880],
          [584480, 3512880]
        ],
        elevation: 1040,
        properties: {
          code: '1040 B 32 – SB',
          tonnage: 3950,
          feGrade: 58.7,
          feoGrade: 19.8,
          sio2Grade: 6.8,
          rockType: 'مگنتیت-هماتیتی',
          destination: 'دپوی همگن‌سازی پرعیار',
          status: 'CLASSIFIED_HIGH'
        },
        style: {
          strokeColor: '#059669',
          fillColor: '#059669',
          fillOpacity: 0.35,
          strokeWidth: 2
        },
        createdBy: 'واحد نقشه‌برداری نظارت',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },
      // ساب‌بلوک SC
      {
        id: 'feat-sb-1040-sc',
        mapId: 'map-default-1040',
        layerId: 'layer-subblocks',
        name: 'ساب‌بلوک 1040 B 32 – SC',
        type: 'POLYGON',
        category: 'SUB_BLOCK',
        coordinates: [
          [584400, 3512880],
          [584480, 3512880],
          [584480, 3512960],
          [584400, 3512960]
        ],
        elevation: 1040,
        properties: {
          code: '1040 B 32 – SC',
          tonnage: 4100,
          feGrade: 51.2,
          feoGrade: 15.4,
          sio2Grade: 12.1,
          rockType: 'کانسنگ متوسط‌عیار',
          destination: 'دپوی متوسط‌عیار پیت',
          status: 'CLASSIFIED_MEDIUM'
        },
        style: {
          strokeColor: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.35,
          strokeWidth: 2
        },
        createdBy: 'دفتر فنی پیمانکار استخراج',
        createdRole: 'MINING_CONTRACTOR',
        createdAt: new Date().toISOString()
      },
      // ساب‌بلوک SD (باطله/اسکارن)
      {
        id: 'feat-sb-1040-sd',
        mapId: 'map-default-1040',
        layerId: 'layer-subblocks',
        name: 'ساب‌بلوک 1040 B 32 – SD (اسکارن باطله)',
        type: 'POLYGON',
        category: 'SUB_BLOCK',
        coordinates: [
          [584480, 3512880],
          [584560, 3512880],
          [584560, 3512960],
          [584480, 3512960]
        ],
        elevation: 1040,
        properties: {
          code: '1040 B 32 – SD',
          tonnage: 3750,
          feGrade: 27.8,
          feoGrade: 6.2,
          sio2Grade: 28.5,
          rockType: 'اسکارن پیریتی و باطله',
          destination: 'دامپ باطله غربی',
          status: 'CLASSIFIED_WASTE'
        },
        style: {
          strokeColor: '#EAB308',
          fillColor: '#EAB308',
          fillOpacity: 0.35,
          strokeWidth: 2
        },
        createdBy: 'دفتر فنی پیمانکار استخراج',
        createdRole: 'MINING_CONTRACTOR',
        createdAt: new Date().toISOString()
      },
      // لبه بالای پله (Crest)
      {
        id: 'feat-crest-1040',
        mapId: 'map-default-1040',
        layerId: 'layer-crest',
        name: 'لبه بالای پله (Crest Level 1055m)',
        type: 'POLYLINE',
        category: 'BENCH_CREST',
        coordinates: [
          [584320, 3512750],
          [584400, 3512770],
          [584600, 3512770],
          [584680, 3512850],
          [584680, 3513020]
        ],
        elevation: 1055,
        properties: {
          lengthM: 480,
          notes: 'خط شکست بالایی پله معدن'
        },
        style: {
          strokeColor: '#00D4FF',
          strokeWidth: 3,
          strokeDash: 'solid'
        },
        createdBy: 'واحد نقشه‌برداری نظارت',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },
      // پای پله (Toe)
      {
        id: 'feat-toe-1040',
        mapId: 'map-default-1040',
        layerId: 'layer-toe',
        name: 'پای پله (Toe Level 1040m)',
        type: 'POLYLINE',
        category: 'BENCH_TOE',
        coordinates: [
          [584350, 3512790],
          [584420, 3512795],
          [584580, 3512795],
          [584640, 3512870],
          [584640, 3512990]
        ],
        elevation: 1040,
        properties: {
          lengthM: 420,
          notes: 'پای پله کف تراز ۱۰۴۰'
        },
        style: {
          strokeColor: '#38BDF8',
          strokeWidth: 2,
          strokeDash: 'dashed'
        },
        createdBy: 'واحد نقشه‌برداری نظارت',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },
      // محور رمپ حمل باربری
      {
        id: 'feat-road-ramp',
        mapId: 'map-default-1040',
        layerId: 'layer-roads',
        name: 'محور رمپ اصلی خروج پیت به سنگ‌شکن',
        type: 'POLYLINE',
        category: 'HAUL_ROAD',
        coordinates: [
          [584350, 3512850],
          [584250, 3512920],
          [584180, 3513100],
          [584120, 3513350]
        ],
        elevation: 1040,
        properties: {
          lengthM: 620,
          notes: 'عرض جاده ۲۴ متر - شیب مجاز ۸٪'
        },
        style: {
          strokeColor: '#F59E0B',
          strokeWidth: 4
        },
        createdBy: 'دفتر فنی پیمانکار استخراج',
        createdRole: 'MINING_CONTRACTOR',
        createdAt: new Date().toISOString()
      },
      // بنچ‌مارک ژئودزی
      {
        id: 'feat-bm-1040',
        mapId: 'map-default-1040',
        layerId: 'layer-benchmarks',
        name: 'بنچ‌مارک ژئودزی GPS-BM-44',
        type: 'POINT',
        category: 'SURVEY_BENCHMARK',
        coordinates: [[584340, 3512740]],
        elevation: 1055.24,
        properties: {
          code: 'GPS-BM-44',
          xUTM: 584340.12,
          yUTM: 3512740.85,
          zElev: 1055.24,
          notes: 'میله بتنی ثابت نقشه‌برداری'
        },
        style: {
          strokeColor: '#EC4899',
          fillColor: '#EC4899',
          pointRadius: 6,
          pointIcon: 'flag'
        },
        createdBy: 'واحد نقشه‌برداری نظارت',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },
      // درزه و هشدار ژئوتکنیکی
      {
        id: 'feat-crack-zone',
        mapId: 'map-default-1040',
        layerId: 'layer-hazards',
        name: 'زون درزه‌داری شدید و حریم پایش دیواره',
        type: 'CIRCLE_ZONE',
        category: 'HAZARD_CRACK',
        coordinates: [[584660, 3513050]],
        elevation: 1055,
        properties: {
          hazardLevel: 'HIGH',
          radiusM: 45,
          notes: 'نیاز به مانیتورینگ روزانه با پریزم'
        },
        style: {
          strokeColor: '#EF4444',
          fillColor: '#EF4444',
          fillOpacity: 0.3,
          strokeWidth: 2
        },
        createdBy: 'واحد نظارت ژئوتکنیک',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      }
    ];

    const defaultMap1: SurveyMap = {
      id: 'map-default-1040',
      code: 'MAP-1040-OFFICIAL',
      title: 'پلان تفکیک ساب‌بلوک‌ها و عوارض تراز ۱۰۴۰ پیت مرکزی',
      description: 'نقشه رسمی نقشه‌برداری فتوگرامتری با تفکیک ساب‌های SA, SB, SC, SD و خطوط شکست پله',
      category: 'BENCH_PLAN',
      format: 'DXF_JSON',
      surveyDate: '1403/06/15',
      surveyorUnit: 'واحد نقشه‌برداری و ژئودزی مهندسین مشاور نظارت',
      surveyorName: 'مهندس حسینی و تیم پهپاد',
      benchLevel: 1040,
      pitId: 'pit-central',
      coordinateSystem: 'UTM Zone 39N (WGS84)',
      bounds: {
        minX: 584100,
        maxX: 584750,
        minY: 3512700,
        maxY: 3513400,
        minZ: 1030,
        maxZ: 1070
      },
      version: 'Rev 1.2',
      status: 'APPROVED_OFFICIAL',
      layers: [
        { id: 'layer-crest', mapId: 'map-default-1040', name: 'لبه بالای پله (Crest Lines)', category: 'BENCH_CREST', color: '#00D4FF', strokeWidth: 3, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 1 },
        { id: 'layer-toe', mapId: 'map-default-1040', name: 'پای پله و کف تراز (Toe Lines)', category: 'BENCH_TOE', color: '#38BDF8', strokeWidth: 2, strokeDash: 'dashed', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 1 },
        { id: 'layer-topography', mapId: 'map-default-1040', name: 'منحنی‌های میزان و توپوگرافی پیت', category: 'GENERAL', color: '#67E8F9', strokeWidth: 1.5, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 0.8, featureCount: 0 },
        { id: 'layer-subblocks', mapId: 'map-default-1040', name: 'ساب‌بلوک‌های استخراجی (SA, SB, SC, SD)', category: 'SUB_BLOCK', color: '#10B981', strokeWidth: 2, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 0.85, featureCount: 4 },
        { id: 'layer-holes', mapId: 'map-default-1040', name: 'شبکه چال‌پاشی و انفجار', category: 'BLAST_HOLE', color: '#F59E0B', strokeWidth: 1, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 0 },
        { id: 'layer-roads', mapId: 'map-default-1040', name: 'رمپ‌ها و شبکه راه‌های حمل', category: 'HAUL_ROAD', color: '#60A5FA', strokeWidth: 3, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 1 },
        { id: 'layer-benchmarks', mapId: 'map-default-1040', name: 'بنچ‌مارک‌ها و نقاط ژئودزی', category: 'SURVEY_BENCHMARK', color: '#EC4899', strokeWidth: 1.5, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 1, featureCount: 1 },
        { id: 'layer-hazards', mapId: 'map-default-1040', name: 'حریم‌های ایمنی و درزه‌ها', category: 'HAZARD_CRACK', color: '#EF4444', strokeWidth: 2, strokeDash: 'dotted', showLabels: false, isVisible: true, isLocked: false, opacity: 0.7, featureCount: 1 },
        { id: 'layer-annotations', mapId: 'map-default-1040', name: 'یادداشت‌ها و برچسب‌های مهندسی', category: 'ANNOTATION', color: '#FBBF24', strokeWidth: 1, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 1, featureCount: 0 },
      ],
      features: map1Features,
      approvedBy: 'مدیریت کارفرما (مهندس حسینی)',
      approvedDate: '1403/06/18',
      revisionHistory: [
        {
          id: 'rev-1',
          revision: 'Rev 1.0',
          action: 'IMPORT',
          description: 'بارگذاری فایل اولیه DXF خروجی Civil3D توسط واحد نقشه‌برداری',
          performedBy: 'مهندس مرادی (نقشه‌بردار نظارت)',
          performedRole: 'SUPERVISION',
          timestamp: '2026-08-10T08:30:00Z'
        },
        {
          id: 'rev-2',
          revision: 'Rev 1.1',
          action: 'FEATURE_ADDED',
          description: 'ترسیم و تفکیک هندسی ساب‌بلوک‌های SA, SB, SC, SD بر اساس نتایج پودر چال',
          performedBy: 'مهندس رضایی (دفتر فنی استخراج)',
          performedRole: 'MINING_CONTRACTOR',
          timestamp: '2026-08-12T14:15:00Z'
        },
        {
          id: 'rev-3',
          revision: 'Rev 1.2',
          action: 'APPROVED_OFFICIAL',
          description: 'تأیید نهایی مرزهای استخراجی و ابلاغ جهت بارگیری به مقاصد مصوب',
          performedBy: 'مهندس حسینی (کارفرما)',
          performedRole: 'CLIENT',
          timestamp: '2026-08-15T11:00:00Z'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // ۲. نقشه الگوی چال‌پاشی و شبکه انفجار بلوک B-32
    const blastHoles: MapFeature[] = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const x = 584410 + col * 18;
        const y = 3512810 + row * 14;
        blastHoles.push({
          id: `hole-b32-${row * 8 + col + 1}`,
          mapId: 'map-default-blast-32',
          layerId: 'layer-holes',
          name: `چال ${row * 8 + col + 1}`,
          type: 'POINT',
          category: 'BLAST_HOLE',
          coordinates: [[x, y]],
          elevation: 1040,
          properties: {
            code: `BH-${row * 8 + col + 1}`,
            depthM: 12.5,
            holeDiameterMm: 165,
            subDrillM: 1.5,
            burdenM: 3.5,
            spacingM: 4.5,
            status: col < 4 ? 'DRILLED' : 'PLANNED'
          },
          style: {
            strokeColor: col < 4 ? '#10B981' : '#F59E0B',
            fillColor: col < 4 ? '#10B981' : '#F59E0B',
            pointRadius: 4
          },
          createdBy: 'سرپرست آتشباری استخراج',
          createdRole: 'MINING_CONTRACTOR',
          createdAt: new Date().toISOString()
        });
      }
    }

    const defaultMap2: SurveyMap = {
      id: 'map-default-blast-32',
      code: 'MAP-BLAST-B32',
      title: 'نقشه شبکه چال‌پاشی و مرز آتشباری بلوک B-32 (۴۸ چال)',
      description: 'الگوی مشبک ۶ ردیف در ۸ ستون با بار سنگ ۳.۵ متر و فاصله ۴.۵ متر - قطر ۱۶۵ میلیمتر',
      category: 'BLAST_PATTERN',
      format: 'GEOJSON',
      surveyDate: '1403/06/20',
      surveyorUnit: 'دفتر فنی و آتشباری پیمانکار استخراج',
      surveyorName: 'مهندس رضایی',
      benchLevel: 1040,
      pitId: 'pit-central',
      coordinateSystem: 'UTM Zone 39N (WGS84)',
      bounds: {
        minX: 584390,
        maxX: 584570,
        minY: 3512790,
        maxY: 3512910,
        minZ: 1027,
        maxZ: 1040
      },
      version: 'Rev 1.0',
      status: 'APPROVED_OFFICIAL',
      layers: [
        { id: 'layer-holes', mapId: 'map-default-blast-32', name: 'چال‌های حفاری شده و طراحی', category: 'BLAST_HOLE', color: '#F59E0B', isVisible: true, isLocked: false, opacity: 1, featureCount: 48 },
        { id: 'layer-subblocks', mapId: 'map-default-blast-32', name: 'مرز بلوک آتشباری', category: 'BLAST_BOUNDARY', color: '#EF4444', isVisible: true, isLocked: false, opacity: 0.5, featureCount: 1 }
      ],
      features: [
        {
          id: 'feat-blast-boundary',
          mapId: 'map-default-blast-32',
          layerId: 'layer-subblocks',
          name: 'مرز بلوک انفجار B-32',
          type: 'POLYGON',
          category: 'BLAST_BOUNDARY',
          coordinates: [
            [584400, 3512800],
            [584560, 3512800],
            [584560, 3512900],
            [584400, 3512900]
          ],
          elevation: 1040,
          properties: {
            volumeM3: 19200,
            tonnage: 52000,
            explosiveKg: 8400
          },
          style: {
            strokeColor: '#EF4444',
            fillColor: '#EF4444',
            fillOpacity: 0.15,
            strokeWidth: 2,
            strokeDash: 'dashed'
          },
          createdBy: 'مهندس رضایی',
          createdRole: 'MINING_CONTRACTOR',
          createdAt: new Date().toISOString()
        },
        ...blastHoles
      ],
      approvedBy: 'دکتر علوی (سرپرست نظارت)',
      approvedDate: '1403/06/21',
      revisionHistory: [
        {
          id: 'rev-blast-1',
          revision: 'Rev 1.0',
          action: 'APPROVED_OFFICIAL',
          description: 'تصویب پروانه حفاری و شبکه چال‌پاشی توسط نظارت',
          performedBy: 'دکتر علوی (نظارت)',
          performedRole: 'SUPERVISION',
          timestamp: '2026-08-20T09:00:00Z'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    SurveyMapRepository.save(defaultMap1);
    SurveyMapRepository.save(defaultMap2);
    console.log('✅ نقشه‌های استاندارد مهندسی معدن مقداردهی اولیه شدند');
  }
}
