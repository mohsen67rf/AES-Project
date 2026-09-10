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
  MapFormat,
  OperationalUnitType
} from '../../../core/domain/types/survey-map.types';
import type { StakeholderRole } from '../../../core/domain/types/mine.types';

export interface IntegratedDecisionPreset {
  id: string;
  name: string;
  shortTitle: string;
  description: string;
  targetUnits: OperationalUnitType[];
  targetCategories: FeatureCategory[];
  icon: string;
  color: string;
  decisionContext: string;
}

export const INTEGRATED_DECISION_PRESETS: IntegratedDecisionPreset[] = [
  {
    id: 'PRESET_EXTRACTION',
    name: 'تلفیق عملیات استخراج و بارگیری کانسنگ',
    shortTitle: 'استخراج و بارگیری',
    description: 'تلفیق لایه‌های ساب‌بلوک، باندهای عیار زمین‌شناسی، مسیرهای رمپ و موقعیت ناوگان بارگیری جهت تصمیم‌گیری ارسال به مقاصد مصوب',
    targetUnits: ['SURVEY', 'MINING', 'GEOLOGY', 'FLEET'],
    targetCategories: ['SUB_BLOCK', 'GEOLOGY_ROCK_BAND', 'HAUL_ROAD', 'FLEET_EQUIPMENT', 'BENCH_CREST', 'BENCH_TOE'],
    icon: 'CubeIcon',
    color: '#10B981',
    decisionContext: 'هدایت شاول‌ها، پیشگیری از رقت و حمل دقیق به سنگ‌شکن یا دپوهای عیاری'
  },
  {
    id: 'PRESET_DRILLING_BLASTING',
    name: 'تلفیق عملیات حفاری، آتشباری و ایمنی HSE',
    shortTitle: 'حفاری و آتشباری',
    description: 'تلفیق باندهای حفاری، شبکه سرچال‌ها، گسل‌های زمین‌شناسی و حریم ایمنی انفجار جهت اجرای الگوی آتشباری و تخلیه ایمن',
    targetUnits: ['SURVEY', 'DRILLING', 'GEOLOGY', 'SAFETY'],
    targetCategories: ['DRILLING_BAND', 'BLAST_HOLE', 'BLAST_BOUNDARY', 'GEOLOGY_FAULT', 'BLAST_DANGER_ZONE', 'HAZARD_CRACK'],
    icon: 'FireIcon',
    color: '#F59E0B',
    decisionContext: 'کنترل پرتاب سنگ، جلوگیری از هدررفت انرژی در گسل و ایمن‌سازی پیت'
  },
  {
    id: 'PRESET_GRADE_CONTROL',
    name: 'تلفیق ژئولوژی، عیارسنجی و کنترل کیفیت',
    shortTitle: 'کنترل عیار و ژئولوژی',
    description: 'تلفیق مدل لیتولوژی، باندهای سنگ، کانتورهای عیاری آهن و ساب‌بلوک‌های تفکیکی جهت مدیریت عیار ورودی سنگ‌شکن',
    targetUnits: ['GEOLOGY', 'MINING', 'STOCKPILE'],
    targetCategories: ['GEOLOGY_ROCK_BAND', 'SUB_BLOCK', 'STOCKPILE_BOUNDARY', 'CRUSHER_FACILITY'],
    icon: 'SparklesIcon',
    color: '#8B5CF6',
    decisionContext: 'تفکیک سنگ‌آهن پرعیار، متوسط‌عیار، کم‌عیار و باطله'
  },
  {
    id: 'PRESET_SURVEY_REALITY',
    name: 'انطباق نقشه برداشت نقشه‌برداری با طراحی معدن',
    shortTitle: 'نقشه‌برداری و طراحی',
    description: 'بررسی انطباق دقیق خطوط لبه و پای پله برداشت‌شده با محدوده طراحی بلوک‌ها جهت محاسبه احجام و اضافه‌برداشت',
    targetUnits: ['SURVEY', 'MINING'],
    targetCategories: ['BENCH_CREST', 'BENCH_TOE', 'SURVEY_BENCHMARK', 'MINING_BLOCK', 'HAUL_ROAD'],
    icon: 'MapPinIcon',
    color: '#00D4FF',
    decisionContext: 'محاسبه احجام عملیات خاکی، تطابق با طرح و کنترل پیشروی جبهه‌کار'
  },
  {
    id: 'PRESET_STABILITY_SAFETY',
    name: 'پایش پایداری شیب، ژئوتکنیک و ریسک‌های HSE',
    shortTitle: 'پایداری و ایمنی',
    description: 'تلفیق شیب دیواره، شکستگی‌ها و گسل‌ها، درزه‌ها، پریس‌های پایش جابجایی و پناهگاه‌ها',
    targetUnits: ['SURVEY', 'GEOLOGY', 'SAFETY'],
    targetCategories: ['BENCH_CREST', 'BENCH_TOE', 'GEOLOGY_FAULT', 'HAZARD_CRACK'],
    icon: 'ShieldExclamationIcon',
    color: '#EF4444',
    decisionContext: 'تشخیص زودهنگام لغزش دیواره پیت و حفاظت از جان پرسنل و ماشین‌آلات'
  },
  {
    id: 'PRESET_ALL_INTEGRATED',
    name: 'نمایش جامع تمامی لایه‌های سازمانی (دید ۳۶۰ درجه معدن)',
    shortTitle: 'نقشه جامع تلفیقی',
    description: 'فعال‌سازی همزمان تمام لایه‌های نقشه‌برداری، زمین‌شناسی، حفاری، استخراج، ترابری و ایمنی برای تحلیل کلان',
    targetUnits: ['ALL'],
    targetCategories: [],
    icon: 'Square2StackIcon',
    color: '#6366F1',
    decisionContext: 'تصمیم‌گیری استراتژیک در جلسات هماهنگی روزانه و هفتگی پیت'
  },
  {
    id: 'PRESET_SURVEY_BASE_ONLY',
    name: 'فقط نقشه پایه برداشت نقشه‌برداری',
    shortTitle: 'نقشه پایه نقشه‌برداری',
    description: 'خاموش کردن سایر لایه‌ها و نمایش خالص خطوط توپوگرافی، لبه و پای پله و بنچ‌مارک‌های نقشه‌برداری',
    targetUnits: ['SURVEY'],
    targetCategories: ['BENCH_CREST', 'BENCH_TOE', 'SURVEY_BENCHMARK'],
    icon: 'ViewfinderCircleIcon',
    color: '#38BDF8',
    decisionContext: 'بررسی هندسه محض تراز پله بدون تداخل اطلاعاتی'
  }
];

export class SurveyMapService {
  public static readonly MASTER_MAP_STORAGE_KEY = 'aes_active_master_map_id';
  public static readonly MASTER_MAP_EVENT = 'aes_master_map_updated';

  /**
   * دریافت شناسه آخرین نقشه مرجع فعال در سامانه (تعیین‌شده توسط واحد نقشه‌برداری)
   */
  public static getActiveMasterMapId(): string {
    this.ensureInitialized();
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem(this.MASTER_MAP_STORAGE_KEY);
      if (storedId) {
        const found = SurveyMapRepository.getById(storedId);
        if (found) return found.id;
      }
    }

    // جستجوی نقشه دارای فلگ مرجع
    const all = SurveyMapRepository.getAll();
    const explicitMaster = all.find(m => m.isMasterMap);
    if (explicitMaster) return explicitMaster.id;

    // آخرین نقشه مصوب رسمی
    const approved = all.find(m => m.status === 'APPROVED_OFFICIAL');
    if (approved) return approved.id;

    return all.length > 0 ? all[0].id : '';
  }

  /**
   * دریافت شئ کامل آخرین نقشه مرجع فعال و هماهنگ در کل سامانه
   */
  public static getActiveMasterMap(): SurveyMap | null {
    const id = this.getActiveMasterMapId();
    if (!id) return null;
    return this.getMapById(id);
  }

  /**
   * تعیین و انتشار یک نقشه به عنوان نقشه مرجع رسمی و سراسری سامانه توسط واحد نقشه‌برداری
   */
  public static setActiveMasterMap(
    mapId: string, 
    userRole: string = 'SUPERVISION', 
    userName: string = 'مهندس مرادی (واحد نقشه‌برداری)'
  ): SurveyMap | null {
    this.ensureInitialized();
    const all = SurveyMapRepository.getAll();
    const targetMap = all.find(m => m.id === mapId);
    if (!targetMap) return null;

    const now = new Date().toISOString();

    // به‌روزرسانی تمام نقشه‌ها: تنها یک نقشه مرجع فعال در لحظه وجود دارد
    all.forEach(m => {
      if (m.id === mapId) {
        m.isMasterMap = true;
        m.status = 'APPROVED_OFFICIAL';
        m.masterApprovedAt = now;
        m.masterApprovedBy = userName;
        m.updatedAt = now;

        const revLog: MapRevisionLog = {
          id: `rev-master-${Date.now()}`,
          revision: m.version,
          action: 'APPROVED_OFFICIAL',
          description: `انتشار به عنوان آخرین نقشه مرجع رسمی و فعال کل سامانه توسط ${userName} (${userRole})`,
          performedBy: userName,
          performedRole: userRole,
          timestamp: now
        };
        m.revisionHistory = [revLog, ...(m.revisionHistory || [])];
        SurveyMapRepository.save(m);
      } else if (m.isMasterMap) {
        m.isMasterMap = false;
        m.updatedAt = now;
        SurveyMapRepository.save(m);
      }
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.MASTER_MAP_STORAGE_KEY, mapId);
      // ارسال رویداد هماهنگ‌سازی بلادرنگ به تمام ماژول‌ها و تب‌های سامانه
      window.dispatchEvent(new CustomEvent(this.MASTER_MAP_EVENT, {
        detail: { mapId, map: targetMap, publishedBy: userName, timestamp: now }
      }));
    }

    return targetMap;
  }

  /**
   * ثبت شنونده تغییرات آخرین نقشه مرجع برای هماهنگی بلادرنگ اجزای سامانه
   */
  public static subscribeToMasterMapUpdates(callback: (map: SurveyMap) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ map: SurveyMap }>;
      if (customEvent.detail?.map) {
        callback(customEvent.detail.map);
      } else {
        const active = this.getActiveMasterMap();
        if (active) callback(active);
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === this.MASTER_MAP_STORAGE_KEY || e.key === 'aes_survey_maps') {
        const active = this.getActiveMasterMap();
        if (active) callback(active);
      }
    };

    window.addEventListener(this.MASTER_MAP_EVENT, handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(this.MASTER_MAP_EVENT, handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }

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

    // اگر این نقشه، نقشه مرجع سامانه است، رویداد هماهنگی ارسال شود
    if (map.isMasterMap || map.id === this.getActiveMasterMapId()) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(this.MASTER_MAP_EVENT, {
          detail: { mapId: map.id, map }
        }));
      }
    }

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
      // ۱. واحد نقشه‌برداری و ژئودزی (مرجع پایه بارگذاری)
      { id: 'layer-crest', mapId: '', name: 'لبه بالای پله (Crest Lines)', category: 'BENCH_CREST', unit: 'SURVEY', color: '#00D4FF', strokeWidth: 3, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 0, description: 'لبه بالای پله استخراجی برداشت‌شده توسط واحد نقشه‌برداری' },
      { id: 'layer-toe', mapId: '', name: 'پای پله و کف تراز (Toe Lines)', category: 'BENCH_TOE', unit: 'SURVEY', color: '#38BDF8', strokeWidth: 2, strokeDash: 'dashed', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 0, description: 'پای پله و خطوط شکست کف پیت' },
      { id: 'layer-topography', mapId: '', name: 'منحنی‌های میزان و کانتورهای توپوگرافی', category: 'GENERAL', unit: 'SURVEY', color: '#67E8F9', strokeWidth: 1.5, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 0.8, featureCount: 0, description: 'منحنی‌های کانتور و ترازهای ارتفاعی پیت' },
      { id: 'layer-benchmarks', mapId: '', name: 'بنچ‌مارک‌ها و نقاط مبنای ژئودزی GPS', category: 'SURVEY_BENCHMARK', unit: 'SURVEY', color: '#EC4899', strokeWidth: 1.5, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 1, featureCount: 0, description: 'ایستگاه‌های توتال استیشن و بنچ‌مارک‌های ژئودتیک' },

      // ۲. واحد استخراج و طراحی معدن
      { id: 'layer-subblocks', mapId: '', name: 'ساب‌بلوک‌های استخراجی (SA, SB, SC, SD)', category: 'SUB_BLOCK', unit: 'MINING', color: '#10B981', strokeWidth: 2, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 0.85, featureCount: 0, description: 'تفکیک ساب‌بلوک‌ها بر اساس عیار و مقصد حمل' },
      { id: 'layer-roads', mapId: '', name: 'رمپ‌ها و شبکه راه‌های حمل و نقل', category: 'HAUL_ROAD', unit: 'MINING', color: '#60A5FA', strokeWidth: 3, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 0, description: 'محور شبکه ترابری پیت و رمپ‌های دسترسی' },

      // ۳. واحد حفاری و آتشباری
      { id: 'layer-drilling-bands', mapId: '', name: 'باندهای حفاری پله (واحد حفاری)', category: 'DRILLING_BAND', unit: 'DRILLING', color: '#F97316', strokeWidth: 2.5, strokeDash: 'dashed', showLabels: true, isVisible: true, isLocked: false, opacity: 0.9, featureCount: 0, description: 'محدوده و باندهای طراحی‌شده توسط واحد حفاری' },
      { id: 'layer-holes', mapId: '', name: 'شبکه و موقعیت سرچال‌های آتشباری', category: 'BLAST_HOLE', unit: 'DRILLING', color: '#F59E0B', strokeWidth: 1, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 0, description: 'شبکه چال‌پاشی و موقعیت گمانه‌های انفجاری' },
      { id: 'layer-blast-danger', mapId: '', name: 'حریم ایمنی و زون خطر آتشباری', category: 'BLAST_DANGER_ZONE', unit: 'DRILLING', color: '#EF4444', strokeWidth: 2, strokeDash: 'dashed', showLabels: true, isVisible: true, isLocked: false, opacity: 0.35, featureCount: 0, description: 'محدوده تخلیه شعاع خطر پرتاب سنگ و موج انفجار' },

      // ۴. واحد زمین‌شناسی و مدلسازی کانسار
      { id: 'layer-geology-rock', mapId: '', name: 'باندهای جنس سنگ و لیتولوژی کانسنگ', category: 'GEOLOGY_ROCK_BAND', unit: 'GEOLOGY', color: '#8B5CF6', strokeWidth: 2, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 0.75, featureCount: 0, description: 'تفکیک باندهای لیتولوژی (مگنتیت، هماتیت، باطله)' },
      { id: 'layer-geology-faults', mapId: '', name: 'گسل‌ها و درزه‌های ساختاری زمین‌شناسی', category: 'GEOLOGY_FAULT', unit: 'GEOLOGY', color: '#DC2626', strokeWidth: 3, strokeDash: 'dashdot', showLabels: true, isVisible: true, isLocked: false, opacity: 0.95, featureCount: 0, description: 'گسل‌های اصلی و صفحات لغزش دیواره معدن' },

      // ۵. واحد بارگیری، ترابری و دیسپاچینگ ماشین‌آلات
      { id: 'layer-fleet', mapId: '', name: 'موقعیت و ناوگان ماشین‌آلات پیت (شاول، لودر، تراک)', category: 'FLEET_EQUIPMENT', unit: 'FLEET', color: '#06B6D4', strokeWidth: 2, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 0.9, featureCount: 0, description: 'موقعیت زنده و زون فعالیت شاول‌ها، لودرها و دامپتراک‌ها' },

      // ۶. واحد انبار، دپوها و سنگ‌شکن
      { id: 'layer-stockpiles', mapId: '', name: 'محدوده دپوهای سنگ‌آهن، باطله و ورودی سنگ‌شکن', category: 'STOCKPILE_BOUNDARY', unit: 'STOCKPILE', color: '#D97706', strokeWidth: 2, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 0.8, featureCount: 0, description: 'دپوهای خردایش، باطله و بونکر سنگ‌شکن اولیه' },

      // ۷. واحد ایمنی، HSE و ژئوتکنیک
      { id: 'layer-hazards', mapId: '', name: 'حریم‌های ایمنی، ترک‌های کششی دیواره و زون خطر', category: 'HAZARD_CRACK', unit: 'SAFETY', color: '#E11D48', strokeWidth: 2, strokeDash: 'dotted', showLabels: false, isVisible: true, isLocked: false, opacity: 0.75, featureCount: 0, description: 'ترک‌های کششی، زون ناپایدار پله و مسیرهای امداد پیت' },

      // ۸. واحد تسک‌ها و دستورکارهای میدانی
      { id: 'layer-tasks', mapId: '', name: 'پین‌ها و دستورکارهای میدانی واحدهای عملیاتی', category: 'TASK_ACTION_PIN', unit: 'FIELD_TASKS', color: '#A855F7', strokeWidth: 1.5, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 0.9, featureCount: 0, description: 'موقعیت وظایف و مأموریت‌های ابلاغ‌شده روی پله‌ها' },

      { id: 'layer-annotations', mapId: '', name: 'یادداشت‌ها و توضیحات مهندسی', category: 'ANNOTATION', unit: 'ALL', color: '#FBBF24', strokeWidth: 1, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 1, featureCount: 0, description: 'یادداشت‌های متنی مهندسی روی نقشه' },
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
      isMasterMap: userRole === 'SUPERVISION' || userRole === 'CLIENT',
      masterApprovedAt: (userRole === 'SUPERVISION' || userRole === 'CLIENT') ? new Date().toISOString() : undefined,
      masterApprovedBy: (userRole === 'SUPERVISION' || userRole === 'CLIENT') ? userName : undefined,
      layers,
      features: (data.features || []).map(f => ({ ...f, mapId })),
      rasterImageUrl: data.rasterImageUrl,
      revisionHistory: [initialRevision],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    SurveyMapRepository.save(newMap);

    // در صورتی که نقشه‌ای توسط نظارت/نقشه‌برداری وارد شود، بلافاصله به عنوان نقشه فعال و مرجع کل سامانه منتشر می‌گردد
    if (newMap.isMasterMap) {
      this.setActiveMasterMap(newMap.id, userRole, userName);
    }

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
    const map = this.getMapById(mapId) || this.getAllMaps()[0];
    if (!map) return null;

    const featureId = `feat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newFeature: MapFeature = {
      ...feature,
      id: featureId,
      mapId: map.id,
      createdAt: new Date().toISOString(),
      createdBy: userName,
      createdRole: userRole
    };

    if (!map.features) map.features = [];
    map.features.push(newFeature);

    // به‌روزرسانی یا ایجاد خودکار لایه و فعال‌سازی قطعی نمایش آن
    if (!map.layers) map.layers = [];
    const targetLayer = map.layers.find(l => l.id === feature.layerId);
    if (targetLayer) {
      targetLayer.featureCount = (targetLayer.featureCount || 0) + 1;
      targetLayer.isVisible = true; // اطمینان از مرئی بودن لایه جهت نمایش بی‌درنگ عارضه ترسیم‌شده
    } else if (feature.layerId) {
      map.layers.push({
        id: feature.layerId,
        mapId: map.id,
        name: feature.name || 'لایه مهندسی',
        category: (feature.category as any) || 'SUB_BLOCK',
        unit: (feature.unit as any) || 'MINING',
        color: feature.style?.strokeColor || '#10B981',
        strokeWidth: 2,
        strokeDash: 'solid',
        showLabels: true,
        isVisible: true,
        isLocked: false,
        opacity: 0.85,
        featureCount: 1,
        description: 'لایه مهندسی معدن'
      });
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
   * روشن یا خاموش کردن یکپارچه تمام لایه‌های مربوط به یک واحد سازمانی
   * (مانند واحد حفاری، زمین‌شناسی، نقشه‌برداری، استخراج، ایمنی)
   */
  public static setUnitLayersVisibility(mapId: string, unit: OperationalUnitType, visible: boolean): boolean {
    const map = this.getMapById(mapId);
    if (!map) return false;

    if (unit === 'ALL') {
      map.layers = map.layers.map(l => ({ ...l, isVisible: visible }));
    } else {
      map.layers = map.layers.map(l => {
        if (l.unit === unit) {
          return { ...l, isVisible: visible };
        }
        return l;
      });
    }

    map.updatedAt = new Date().toISOString();
    SurveyMapRepository.save(map);
    return true;
  }

  /**
   * اعمال سناریوی تلفیق هوشمند لایه‌ها برای اتخاذ تصمیمات مناسب در سطح واحدهای مختلف معدن
   */
  public static applyDecisionPreset(mapId: string, presetId: string): boolean {
    const map = this.getMapById(mapId);
    if (!map) return false;

    // سناریوی خاموشی کامل
    if (presetId === 'ALL_OFF') {
      map.layers = map.layers.map(l => ({ ...l, isVisible: false }));
      map.updatedAt = new Date().toISOString();
      SurveyMapRepository.save(map);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(this.MASTER_MAP_EVENT, {
          detail: { mapId: map.id, map, presetId }
        }));
      }
      return true;
    }

    // نگاشت شناسه‌های معادل سناریوهای تصمیم‌گیری
    let normalizedPresetId = presetId;
    if (presetId === 'MINING_DISPATCH') normalizedPresetId = 'PRESET_EXTRACTION';
    else if (presetId === 'BLAST_SAFETY' || presetId === 'DRILL_BLAST_SAFETY') normalizedPresetId = 'PRESET_DRILLING_BLASTING';
    else if (presetId === 'GRADE_GEOLOGY' || presetId === 'GRADE_CONTROL_GEOLOGY') normalizedPresetId = 'PRESET_GRADE_CONTROL';
    else if (presetId === 'SURVEY_MASTER' || presetId === 'SURVEY_BASE_ONLY') normalizedPresetId = 'PRESET_SURVEY_BASE_ONLY';
    else if (presetId === 'FULL_INTEGRATION' || presetId === 'ALL_ON') normalizedPresetId = 'PRESET_ALL_INTEGRATED';

    const preset = INTEGRATED_DECISION_PRESETS.find(p => p.id === normalizedPresetId || p.id === presetId);
    if (!preset) {
      if (presetId === 'FULL_INTEGRATION' || presetId === 'ALL_ON') {
        map.layers = map.layers.map(l => ({ ...l, isVisible: true }));
        map.updatedAt = new Date().toISOString();
        SurveyMapRepository.save(map);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(this.MASTER_MAP_EVENT, {
            detail: { mapId: map.id, map, presetId }
          }));
        }
        return true;
      }
      return false;
    }

    if (preset.id === 'PRESET_ALL_INTEGRATED') {
      map.layers = map.layers.map(l => ({ ...l, isVisible: true }));
    } else {
      map.layers = map.layers.map(l => {
        const unitMatch = l.unit ? preset.targetUnits.includes(l.unit) : false;
        const catMatch = preset.targetCategories.includes(l.category);
        const shouldBeVisible = unitMatch || catMatch;
        return { ...l, isVisible: shouldBeVisible };
      });
    }

    map.updatedAt = new Date().toISOString();
    SurveyMapRepository.save(map);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(this.MASTER_MAP_EVENT, {
        detail: { mapId: map.id, map, presetId }
      }));
    }
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
    // نقشه مصوب بلافاصله به عنوان آخرین نقشه رسمی و فعال کل سامانه ابلاغ و همگام‌سازی می‌شود
    this.setActiveMasterMap(map.id, approverRole, approverName);
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

  private static isInitialized = false;

  /**
   * بارگذاری نقشه‌های استاندارد و پیش‌فرض معدن در صورت خالی بودن ریپازیتوری
   * و همچنین ارتقای خودکار نقشه‌های ذخیره‌شده قبلی به لایه‌ها و عوارض واحدهای عملیاتی
   */
  private static ensureInitialized() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    const existingMap1 = SurveyMapRepository.getById('map-default-1040');
    const existingMap2 = SurveyMapRepository.getById('map-default-blast-32');

    if (existingMap1 && existingMap2) {
      const hasDrillLayer = existingMap1.layers?.some(l => l.id === 'layer-drilling-bands');
      const hasGeoLayer = existingMap1.layers?.some(l => l.id === 'layer-geology-rock');
      const hasFaultLayer = existingMap1.layers?.some(l => l.id === 'layer-geology-faults');
      if (hasDrillLayer && hasGeoLayer && hasFaultLayer) {
        return;
      }
    } else if (SurveyMapRepository.count() > 0 && existingMap1) {
      const hasDrillLayer = existingMap1.layers?.some(l => l.id === 'layer-drilling-bands');
      const hasGeoLayer = existingMap1.layers?.some(l => l.id === 'layer-geology-rock');
      if (hasDrillLayer && hasGeoLayer) {
        return;
      }
    }

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
        unit: 'SAFETY',
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
      },
      // --- عوارض واحد حفاری و آتشباری ---
      // ۱. باند حفاری پله ۱۰۴۰
      {
        id: 'feat-drill-band-1040',
        mapId: 'map-default-1040',
        layerId: 'layer-drilling-bands',
        name: 'باند حفاری DB-1040-East (۳۲ چال پودری)',
        type: 'POLYGON',
        category: 'DRILLING_BAND',
        coordinates: [
          [584420, 3512820],
          [584540, 3512820],
          [584540, 3512870],
          [584420, 3512870]
        ],
        elevation: 1040,
        unit: 'DRILLING',
        properties: {
          code: 'DB-1040-East',
          unit: 'DRILLING',
          plannedHoles: 32,
          drilledHoles: 24,
          benchLevel: 1040,
          burdenM: 3.5,
          spacingM: 4.5,
          targetRock: 'مگنتیت پرعیار',
          drillingRig: 'دریل واگن سندویک DX800',
          operator: 'تیم حفاری و آتشباری',
          notes: 'باند طراحی و پیاده‌شده توسط واحد حفاری'
        },
        style: {
          strokeColor: '#F97316',
          fillColor: '#F97316',
          fillOpacity: 0.18,
          strokeWidth: 2.5,
          strokeDash: 'dashed'
        },
        createdBy: 'سرپرست واحد حفاری و آتشباری',
        createdRole: 'MINING_CONTRACTOR',
        createdAt: new Date().toISOString()
      },
      // ۲. شبکه چال‌های حفر شده در باند حفاری
      ...Array.from({ length: 16 }, (_, idx) => {
        const row = Math.floor(idx / 8);
        const col = idx % 8;
        return {
          id: `feat-hole-1040-${idx + 1}`,
          mapId: 'map-default-1040',
          layerId: 'layer-holes',
          name: `چال حفاری BH-${idx + 1}`,
          type: 'POINT' as const,
          category: 'BLAST_HOLE' as const,
          coordinates: [[584432 + col * 13.5, 3512832 + row * 24]],
          elevation: 1040,
          unit: 'DRILLING' as const,
          properties: {
            code: `BH-${idx + 1}`,
            unit: 'DRILLING',
            depthM: 12.5,
            subDrillM: 1.5,
            diameterMm: 165,
            status: idx < 11 ? 'DRILLED' : 'PLANNED',
            drillDate: idx < 11 ? '1403/06/18' : undefined,
            notes: idx < 11 ? 'حفاری شده و آماده خرج‌گذاری' : 'در انتظار دریل'
          },
          style: {
            strokeColor: idx < 11 ? '#10B981' : '#F59E0B',
            fillColor: idx < 11 ? '#10B981' : '#F59E0B',
            pointRadius: 4.5
          },
          createdBy: 'اپراتور دستگاه دریل',
          createdRole: 'MINING_CONTRACTOR',
          createdAt: new Date().toISOString()
        };
      }),

      // --- عوارض واحد زمین‌شناسی و مدلسازی کانسار ---
      // ۱. باند جنس سنگ مگنتیت پرعیار
      {
        id: 'feat-rock-magnetite',
        mapId: 'map-default-1040',
        layerId: 'layer-geology-rock',
        name: 'باند زمین‌شناسی: کانسنگ مگنتیت پرعیار (Fe > 60%)',
        type: 'POLYGON',
        category: 'GEOLOGY_ROCK_BAND',
        coordinates: [
          [584390, 3512790],
          [584500, 3512790],
          [584490, 3512910],
          [584390, 3512900]
        ],
        elevation: 1040,
        unit: 'GEOLOGY',
        properties: {
          code: 'GEO-LITH-MAG',
          unit: 'GEOLOGY',
          rockType: 'مگنتیت توده‌ای پرعیار',
          feGrade: 62.8,
          feoGrade: 23.4,
          sio2Grade: 4.8,
          density: 4.6,
          geologicalUnit: 'افق میانی کانسار مرکزی',
          notes: 'مدل‌سازی شده توسط واحد زمین‌شناسی بر اساس لاگ پودر چال و گمانه‌های اکتشافی'
        },
        style: {
          strokeColor: '#8B5CF6',
          fillColor: '#8B5CF6',
          fillOpacity: 0.22,
          strokeWidth: 2,
          strokeDash: 'solid'
        },
        createdBy: 'کارشناس ارشد واحد زمین‌شناسی',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },
      // ۲. باند کانسنگ هماتیتی اکسیدی
      {
        id: 'feat-rock-hematite',
        mapId: 'map-default-1040',
        layerId: 'layer-geology-rock',
        name: 'باند زمین‌شناسی: کانسنگ هماتیتی اکسیدی (Fe ~ 52%)',
        type: 'POLYGON',
        category: 'GEOLOGY_ROCK_BAND',
        coordinates: [
          [584500, 3512790],
          [584580, 3512790],
          [584570, 3512910],
          [584490, 3512910]
        ],
        elevation: 1040,
        unit: 'GEOLOGY',
        properties: {
          code: 'GEO-LITH-HEM',
          unit: 'GEOLOGY',
          rockType: 'هماتیت اکسیدی رگچه‌ای',
          feGrade: 52.3,
          feoGrade: 14.8,
          sio2Grade: 11.2,
          density: 4.1,
          notes: 'زون اکسیداسیون سطحی پله'
        },
        style: {
          strokeColor: '#D97706',
          fillColor: '#D97706',
          fillOpacity: 0.22,
          strokeWidth: 2,
          strokeDash: 'solid'
        },
        createdBy: 'کارشناس ارشد واحد زمین‌شناسی',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },
      // ۳. باند اسکارن گارنت-پیریت باطله
      {
        id: 'feat-rock-skarn',
        mapId: 'map-default-1040',
        layerId: 'layer-geology-rock',
        name: 'باند زمین‌شناسی: اسکارن باطله و آکتینولیت (Fe < 30%)',
        type: 'POLYGON',
        category: 'GEOLOGY_ROCK_BAND',
        coordinates: [
          [584390, 3512900],
          [584570, 3512910],
          [584580, 3512980],
          [584390, 3512970]
        ],
        elevation: 1040,
        unit: 'GEOLOGY',
        properties: {
          code: 'GEO-LITH-SKARN',
          unit: 'GEOLOGY',
          rockType: 'اسکارن گارنت-پیریت باطله',
          feGrade: 24.1,
          sGrade: 1.8,
          density: 3.2,
          destination: 'دامپ باطله غربی',
          notes: 'زون کنتاکت اسکارنی باطله'
        },
        style: {
          strokeColor: '#6B7280',
          fillColor: '#6B7280',
          fillOpacity: 0.22,
          strokeWidth: 2,
          strokeDash: 'solid'
        },
        createdBy: 'واحد زمین‌شناسی و مدلسازی کانسار',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },
      // ۴. گسل اصلی شمال‌شرقی پیت
      {
        id: 'feat-fault-main-ne',
        mapId: 'map-default-1040',
        layerId: 'layer-geology-faults',
        name: 'گسل اصلی شمال‌شرقی پیت (NE Major Fault F-01)',
        type: 'POLYLINE',
        category: 'GEOLOGY_FAULT',
        coordinates: [
          [584360, 3512760],
          [584440, 3512860],
          [584530, 3512950],
          [584620, 3513070]
        ],
        elevation: 1040,
        unit: 'GEOLOGY',
        properties: {
          code: 'FAULT-F01',
          unit: 'GEOLOGY',
          dip: 72,
          dipDirection: 'شمال‌غرب (۳۱۵°)',
          zoneWidthM: 3.5,
          activity: 'غیرفعال تکتونیکی',
          riskLevel: 'عامل ناپایداری موضعی در شیب پله',
          notes: 'گسل اصلی پیت ترسیم‌شده توسط واحد زمین‌شناسی با شواهد برجا در دیواره'
        },
        style: {
          strokeColor: '#DC2626',
          strokeWidth: 3.5,
          strokeDash: 'dashdot'
        },
        createdBy: 'واحد زمین‌شناسی و تکتونیک',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },
      // ۵. انشعاب گسل فرعی ساختاری
      {
        id: 'feat-fault-branch-f02',
        mapId: 'map-default-1040',
        layerId: 'layer-geology-faults',
        name: 'انشعاب گسل فرعی ساختاری (Branch Fault F-02)',
        type: 'POLYLINE',
        category: 'GEOLOGY_FAULT',
        coordinates: [
          [584440, 3512860],
          [584490, 3512830],
          [584550, 3512810]
        ],
        elevation: 1040,
        unit: 'GEOLOGY',
        properties: {
          code: 'FAULT-F02',
          unit: 'GEOLOGY',
          dip: 65,
          dipDirection: 'جنوب‌غرب (۲۱۰°)',
          notes: 'شکستگی تنشی منشعب از گسل اصلی F-01'
        },
        style: {
          strokeColor: '#B91C1C',
          strokeWidth: 2.2,
          strokeDash: 'dashed'
        },
        createdBy: 'واحد زمین‌شناسی و تکتونیک',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },

      // --- عوارض واحد حفاری و آتشباری: زون خطر انفجار ---
      {
        id: 'feat-blast-danger-1040',
        mapId: 'map-default-1040',
        layerId: 'layer-blast-danger',
        name: 'حریم خطر و تخلیه عملیات آتشباری پله ۱۰۴۰ (شعاع ۳۵۰ متر)',
        type: 'POLYGON',
        category: 'BLAST_DANGER_ZONE',
        coordinates: [
          [584340, 3512720],
          [584620, 3512720],
          [584620, 3513000],
          [584340, 3513000]
        ],
        elevation: 1040,
        unit: 'DRILLING',
        properties: {
          code: 'BDZ-1040',
          unit: 'DRILLING',
          safetyRadiusM: 350,
          hazardLevel: 'HIGH',
          status: 'EVACUATION_REQUIRED',
          notes: 'حریم تخلیه پرتاب سنگ و موج فشار انفجار جهت ایمنی ماشین‌آلات و پرسنل'
        },
        style: {
          strokeColor: '#EF4444',
          fillColor: '#EF4444',
          fillOpacity: 0.12,
          strokeWidth: 2,
          strokeDash: 'dashed'
        },
        createdBy: 'مسئول ایمنی و آتشباری',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },

      // --- عوارض واحد بارگیری، ترابری و ناوگان ماشین‌آلات ---
      {
        id: 'feat-fleet-shv-01',
        mapId: 'map-default-1040',
        layerId: 'layer-fleet',
        name: 'شاول بارگیری هیدرولیکی SHV-01 (Hitachi EX1200)',
        type: 'POINT',
        category: 'FLEET_EQUIPMENT',
        coordinates: [[584440, 3512830]],
        elevation: 1040,
        unit: 'FLEET',
        properties: {
          code: 'SHV-01',
          unit: 'FLEET',
          equipmentType: 'SHOVEL',
          model: 'Hitachi EX1200',
          status: 'OPERATIONAL',
          operator: 'حسین کریمی',
          capacityTon: 45,
          activeTarget: 'ساب‌بلوک SA-1040 (سنگ‌آهن پرعیار)',
          notes: 'مستقر در جبهه‌کار اصلی بارگیری'
        },
        style: {
          strokeColor: '#06B6D4',
          fillColor: '#0891B2',
          pointRadius: 6
        },
        createdBy: 'دیسپاچینگ و مدیریت ناوگان',
        createdRole: 'MINING_CONTRACTOR',
        createdAt: new Date().toISOString()
      },
      {
        id: 'feat-fleet-trk-04',
        mapId: 'map-default-1040',
        layerId: 'layer-fleet',
        name: 'دامپتراک ۱۰۰ تنی TRK-04 (Komatsu HD785)',
        type: 'POINT',
        category: 'FLEET_EQUIPMENT',
        coordinates: [[584460, 3512825]],
        elevation: 1040,
        unit: 'FLEET',
        properties: {
          code: 'TRK-04',
          unit: 'FLEET',
          equipmentType: 'TRUCK',
          model: 'Komatsu HD785-7',
          status: 'LOADING',
          operator: 'رضا مرادی',
          payloadTon: 91,
          destination: 'سنگ‌شکن اولیه (Crusher-01)',
          notes: 'در حال بارگیری توسط شاول SHV-01'
        },
        style: {
          strokeColor: '#3B82F6',
          fillColor: '#2563EB',
          pointRadius: 5
        },
        createdBy: 'دیسپاچینگ و مدیریت ناوگان',
        createdRole: 'MINING_CONTRACTOR',
        createdAt: new Date().toISOString()
      },
      {
        id: 'feat-fleet-drl-02',
        mapId: 'map-default-1040',
        layerId: 'layer-fleet',
        name: 'دستگاه دریل هیدرولیکی DRL-02 (Sandvik Pantera)',
        type: 'POINT',
        category: 'FLEET_EQUIPMENT',
        coordinates: [[584470, 3512880]],
        elevation: 1040,
        unit: 'FLEET',
        properties: {
          code: 'DRL-02',
          unit: 'FLEET',
          equipmentType: 'DRILL',
          model: 'Sandvik Pantera DP1500i',
          status: 'DRILLING',
          operator: 'علی احمدی',
          holeDiameterMm: 165,
          activeTarget: 'باند حفاری پله ۱۰۴۰',
          notes: 'در حال حفر چال‌های ردیف ۴'
        },
        style: {
          strokeColor: '#F59E0B',
          fillColor: '#D97706',
          pointRadius: 5.5
        },
        createdBy: 'واحد حفاری و نگهداری ماشین‌آلات',
        createdRole: 'MINING_CONTRACTOR',
        createdAt: new Date().toISOString()
      },

      // --- عوارض واحد انبار، دپوها و سنگ‌شکن ---
      {
        id: 'feat-stockpile-dso',
        mapId: 'map-default-1040',
        layerId: 'layer-stockpiles',
        name: 'محدوده دپوی کانسنگ دانه بندی مستقیم (DSO Stockpile)',
        type: 'POLYGON',
        category: 'STOCKPILE_BOUNDARY',
        coordinates: [
          [584610, 3512730],
          [584710, 3512730],
          [584710, 3512820],
          [584610, 3512820]
        ],
        elevation: 1040,
        unit: 'STOCKPILE',
        properties: {
          code: 'STK-DSO-01',
          unit: 'STOCKPILE',
          capacityTon: 85000,
          currentTonnage: 42000,
          avgFeGrade: 62.4,
          destination: 'خوراک کارخانه کنسانتره',
          notes: 'محل تخلیه محموله‌های پرعیار ساب‌بلوک SA'
        },
        style: {
          strokeColor: '#D97706',
          fillColor: '#F59E0B',
          fillOpacity: 0.22,
          strokeWidth: 2,
          strokeDash: 'solid'
        },
        createdBy: 'واحد فرآوری و کنترل دپو',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },
      {
        id: 'feat-crusher-facility',
        mapId: 'map-default-1040',
        layerId: 'layer-stockpiles',
        name: 'تاسیسات و بونکر ورودی سنگ‌شکن اولیه (Primary Crusher)',
        type: 'POLYGON',
        category: 'CRUSHER_FACILITY',
        coordinates: [
          [584700, 3512850],
          [584760, 3512850],
          [584760, 3512910],
          [584700, 3512910]
        ],
        elevation: 1040,
        unit: 'STOCKPILE',
        properties: {
          code: 'CRUSHER-01',
          unit: 'STOCKPILE',
          type: 'Gyratory Crusher 54x75',
          capacityTph: 1200,
          status: 'ACTIVE_FEEDING',
          notes: 'دریافت بار مستقیم از دامپتراک‌های تراز ۱۰۴۰'
        },
        style: {
          strokeColor: '#B45309',
          fillColor: '#D97706',
          fillOpacity: 0.35,
          strokeWidth: 2.5
        },
        createdBy: 'واحد بهره‌برداری و کارخانه خردایش',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },

      // --- عوارض واحد تسک‌ها و دستورکارهای میدانی ---
      {
        id: 'feat-task-pin-01',
        mapId: 'map-default-1040',
        layerId: 'layer-tasks',
        name: 'دستورکار شماره ۲۱۰: بارگیری و حمل ساب SA به سنگ‌شکن',
        type: 'POINT',
        category: 'TASK_ACTION_PIN',
        coordinates: [[584420, 3512850]],
        elevation: 1040,
        unit: 'FIELD_TASKS',
        properties: {
          code: 'TSK-MIN-210',
          unit: 'FIELD_TASKS',
          taskTitle: 'بارگیری فوری ساب SA با رعایت سقف عیار فسفر',
          assignedRole: 'MINING_CONTRACTOR',
          assigneeName: 'سرپرست شیفت استخراج',
          priority: 'URGENT',
          status: 'IN_PROGRESS',
          progressPct: 65,
          notes: 'تأییدیه کنترل کیفی آزمایشگاه برای Fe 62.8% دریافت شد'
        },
        style: {
          strokeColor: '#A855F7',
          fillColor: '#9333EA',
          pointRadius: 6
        },
        createdBy: 'دستگاه نظارت مقیم معدن',
        createdRole: 'SUPERVISION',
        createdAt: new Date().toISOString()
      },
      {
        id: 'feat-task-pin-02',
        mapId: 'map-default-1040',
        layerId: 'layer-tasks',
        name: 'دستورکار شماره ۲۱۴: برداشت دقیق مقطع پله توسط واحد نقشه‌برداری',
        type: 'POINT',
        category: 'TASK_ACTION_PIN',
        coordinates: [[584490, 3512890]],
        elevation: 1040,
        unit: 'FIELD_TASKS',
        properties: {
          code: 'TSK-SURV-214',
          unit: 'FIELD_TASKS',
          taskTitle: 'برداشت خط لبه و پای پله ۱۰۴۰ بعد از آتشباری نهایی',
          assignedRole: 'SUPERVISION',
          assigneeName: 'مهندس مرادی (واحد نقشه‌برداری)',
          priority: 'HIGH',
          status: 'PENDING_ACTION',
          progressPct: 20,
          notes: 'به‌روزرسانی نقشه با پهپاد فتوگرامتری برای محاسبه حجم احجام استخراجی'
        },
        style: {
          strokeColor: '#00D4FF',
          fillColor: '#0284C7',
          pointRadius: 6
        },
        createdBy: 'مدیریت طرح و برنامه معدن',
        createdRole: 'CLIENT',
        createdAt: new Date().toISOString()
      }
    ];

    const defaultMap1: SurveyMap = {
      id: 'map-default-1040',
      code: 'MAP-1040-OFFICIAL',
      title: 'پلان تفکیک ساب‌بلوک‌ها و عوارض تراز ۱۰۴۰ پیت مرکزی',
      description: 'نقشه رسمی نقشه‌برداری فتوگرامتری با تفکیک ساب‌های SA, SB, SC, SD و لایه‌های حفاری و زمین‌شناسی',
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
      isMasterMap: true,
      masterApprovedAt: '2026-08-20T10:00:00Z',
      masterApprovedBy: 'واحد نقشه‌برداری و ژئودزی نظارت',
      layers: [
        // ۱. لایه‌های واحد نقشه‌برداری
        { id: 'layer-crest', mapId: 'map-default-1040', name: 'لبه بالای پله (Crest Lines)', category: 'BENCH_CREST', unit: 'SURVEY', color: '#00D4FF', strokeWidth: 3, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 1, description: 'لبه بالای پله' },
        { id: 'layer-toe', mapId: 'map-default-1040', name: 'پای پله و کف تراز (Toe Lines)', category: 'BENCH_TOE', unit: 'SURVEY', color: '#38BDF8', strokeWidth: 2, strokeDash: 'dashed', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 1, description: 'پای پله و کف تراز' },
        { id: 'layer-topography', mapId: 'map-default-1040', name: 'منحنی‌های میزان و توپوگرافی پیت', category: 'GENERAL', unit: 'SURVEY', color: '#67E8F9', strokeWidth: 1.5, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 0.8, featureCount: 0, description: 'توپوگرافی و تراز' },
        { id: 'layer-benchmarks', mapId: 'map-default-1040', name: 'بنچ‌مارک‌ها و نقاط ژئودزی', category: 'SURVEY_BENCHMARK', unit: 'SURVEY', color: '#EC4899', strokeWidth: 1.5, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 1, featureCount: 1, description: 'نقاط مبنای GPS' },

        // ۲. لایه‌های واحد استخراج و دفتر فنی
        { id: 'layer-subblocks', mapId: 'map-default-1040', name: 'ساب‌بلوک‌های استخراجی (SA, SB, SC, SD)', category: 'SUB_BLOCK', unit: 'MINING', color: '#10B981', strokeWidth: 2, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 0.85, featureCount: 4, description: 'ساب‌بلوک‌های تفکیکی استخراجی' },
        { id: 'layer-roads', mapId: 'map-default-1040', name: 'رمپ‌ها و شبکه راه‌های حمل', category: 'HAUL_ROAD', unit: 'MINING', color: '#60A5FA', strokeWidth: 3, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 1, description: 'رمپ اصلی خروج پیت' },

        // ۳. لایه‌های واحد حفاری و آتشباری
        { id: 'layer-drilling-bands', mapId: 'map-default-1040', name: 'باندهای حفاری پله (واحد حفاری)', category: 'DRILLING_BAND', unit: 'DRILLING', color: '#F97316', strokeWidth: 2.5, strokeDash: 'dashed', showLabels: true, isVisible: true, isLocked: false, opacity: 0.9, featureCount: 1, description: 'باندها و محدوده‌های حفاری تعریف‌شده توسط واحد حفاری' },
        { id: 'layer-holes', mapId: 'map-default-1040', name: 'موقعیت چال‌های حفاری و انفجار (واحد حفاری)', category: 'BLAST_HOLE', unit: 'DRILLING', color: '#F59E0B', strokeWidth: 1, strokeDash: 'solid', showLabels: false, isVisible: true, isLocked: false, opacity: 1, featureCount: 16, description: 'موقعیت سرچال‌های حفر شده و طراحی‌شده' },
        { id: 'layer-blast-danger', mapId: 'map-default-1040', name: 'حریم ایمنی و زون خطر آتشباری', category: 'BLAST_DANGER_ZONE', unit: 'DRILLING', color: '#EF4444', strokeWidth: 2, strokeDash: 'dashed', showLabels: true, isVisible: true, isLocked: false, opacity: 0.35, featureCount: 1, description: 'شعاع خطر پرتاب سنگ و موج انفجار' },

        // ۴. لایه‌های واحد زمین‌شناسی و مدلسازی کانسار
        { id: 'layer-geology-rock', mapId: 'map-default-1040', name: 'باندهای جنس سنگ و کانسنگ (واحد زمین‌شناسی)', category: 'GEOLOGY_ROCK_BAND', unit: 'GEOLOGY', color: '#8B5CF6', strokeWidth: 2, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 0.8, featureCount: 3, description: 'تفکیک باندهای لیتولوژی: مگنتیت، هماتیت و اسکارن' },
        { id: 'layer-geology-faults', mapId: 'map-default-1040', name: 'موقعیت گسل‌ها و درزه‌های ساختاری (واحد زمین‌شناسی)', category: 'GEOLOGY_FAULT', unit: 'GEOLOGY', color: '#DC2626', strokeWidth: 3, strokeDash: 'dashdot', showLabels: true, isVisible: true, isLocked: false, opacity: 0.95, featureCount: 2, description: 'گسل‌های اصلی و شکستگی‌های تکتونیکی معدن' },

        // ۵. لایه ناوگان ماشین‌آلات و دیسپاچینگ
        { id: 'layer-fleet', mapId: 'map-default-1040', name: 'ناوگان ماشین‌آلات و تجهیزات پیت', category: 'FLEET_EQUIPMENT', unit: 'FLEET', color: '#06B6D4', strokeWidth: 2, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 0.9, featureCount: 3, description: 'شاول، دامپتراک و دستگاه دریل' },

        // ۶. لایه انبار و دپوها
        { id: 'layer-stockpiles', mapId: 'map-default-1040', name: 'دپوها و تاسیسات سنگ‌شکن', category: 'STOCKPILE_BOUNDARY', unit: 'STOCKPILE', color: '#D97706', strokeWidth: 2, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 0.85, featureCount: 2, description: 'دپوی کانسنگ DSO و بونکر سنگ‌شکن' },

        // ۷. لایه‌های واحد ایمنی و ژئوتکنیک
        { id: 'layer-hazards', mapId: 'map-default-1040', name: 'حریم‌های ایمنی و درزه‌ها (واحد ژئوتکنیک)', category: 'HAZARD_CRACK', unit: 'SAFETY', color: '#EF4444', strokeWidth: 2, strokeDash: 'dotted', showLabels: false, isVisible: true, isLocked: false, opacity: 0.7, featureCount: 1, description: 'حریم‌های پایش دیواره' },

        // ۸. لایه تسک‌ها و دستورکارهای میدانی
        { id: 'layer-tasks', mapId: 'map-default-1040', name: 'پین‌های دستورکارهای میدانی', category: 'TASK_ACTION_PIN', unit: 'FIELD_TASKS', color: '#A855F7', strokeWidth: 1.5, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 0.9, featureCount: 2, description: 'دستورکارهای میدانی جاری روی پله' },

        { id: 'layer-annotations', mapId: 'map-default-1040', name: 'یادداشت‌ها و برچسب‌های مهندسی', category: 'ANNOTATION', unit: 'ALL', color: '#FBBF24', strokeWidth: 1, strokeDash: 'solid', showLabels: true, isVisible: true, isLocked: false, opacity: 1, featureCount: 0, description: 'یادداشت‌های متنی روی نقشه' },
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

    if (!existingMap1) {
      SurveyMapRepository.save(defaultMap1);
    } else {
      // ادغام ایمن لایه‌ها و عوارض جدید بدون دستکاری و حذف داده‌های کاربر
      let map1Changed = false;
      defaultMap1.layers.forEach(defLayer => {
        if (!existingMap1.layers.some(l => l.id === defLayer.id)) {
          existingMap1.layers.push(defLayer);
          map1Changed = true;
        }
      });
      // افزودن عوارض نمونه جدید در صورت عدم وجود
      defaultMap1.features.forEach(defFeat => {
        if (!existingMap1.features.some(f => f.id === defFeat.id)) {
          existingMap1.features.push(defFeat);
          map1Changed = true;
        }
      });
      if (existingMap1.isMasterMap === undefined) {
        existingMap1.isMasterMap = true;
        existingMap1.masterApprovedAt = '2026-08-20T10:00:00Z';
        existingMap1.masterApprovedBy = 'واحد نقشه‌برداری و ژئودزی نظارت';
        map1Changed = true;
      }
      if (map1Changed) {
        SurveyMapRepository.save(existingMap1);
      }
    }

    if (!existingMap2) {
      SurveyMapRepository.save(defaultMap2);
    } else {
      let map2Changed = false;
      defaultMap2.layers.forEach(defLayer => {
        if (!existingMap2.layers.some(l => l.id === defLayer.id)) {
          existingMap2.layers.push(defLayer);
          map2Changed = true;
        }
      });
      if (map2Changed) {
        SurveyMapRepository.save(existingMap2);
      }
    }

    // بررسی اطمینان از تنظیم حداقل یک نقشه به عنوان مرجع سیستم
    if (typeof window !== 'undefined') {
      const activeMaster = localStorage.getItem(this.MASTER_MAP_STORAGE_KEY);
      if (!activeMaster) {
        localStorage.setItem(this.MASTER_MAP_STORAGE_KEY, defaultMap1.id);
      }
    }

    console.log('✅ وضعیت نقشه‌های استاندارد و لایه‌های مهندسی معدن تأیید گردید');
  }

  /**
   * تعاریف ساختاریافته واحدهای عملیاتی معدن برای کنترل لایه‌های تلفیقی
   */
  public static getOperationalUnitsDefinition(): Array<{
    id: OperationalUnitType;
    titleFa: string;
    titleEn: string;
    description: string;
    color: string;
    badgeBg: string;
    icon: string;
    isBaseReference?: boolean;
  }> {
    return [
      {
        id: 'SURVEY',
        titleFa: 'واحد نقشه‌برداری و ژئودزی (مرجع)',
        titleEn: 'Surveying & Geodesy Unit',
        description: 'مرجع پایه بارگذاری نقشه‌ها، توپوگرافی، لبه بالای پله (Crest)، پای پله (Toe) و بنچ‌مارک‌های GPS',
        color: '#00D4FF',
        badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        icon: 'Compass',
        isBaseReference: true
      },
      {
        id: 'MINING',
        titleFa: 'واحد استخراج و طراحی معدن',
        titleEn: 'Mine Planning & Engineering',
        description: 'طراحی ساب‌بلوک‌های استخراجی (SA, SB, SC, SD)، احجام، رمپ‌ها و خطوط جاده‌های حمل پیت',
        color: '#10B981',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: 'Pickaxe'
      },
      {
        id: 'DRILLING',
        titleFa: 'واحد حفاری و آتشباری',
        titleEn: 'Drilling & Blasting Unit',
        description: 'باندهای حفاری پله، شبکه چال‌پاشی، وضعیت حفاری چال‌ها و زون حریم خطر انفجار',
        color: '#F97316',
        badgeBg: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
        icon: 'Flame'
      },
      {
        id: 'GEOLOGY',
        titleFa: 'واحد زمین‌شناسی و مدلسازی کانسار',
        titleEn: 'Geology & Mineral Modeling',
        description: 'باندهای جنس سنگ (مگنتیت، هماتیت، اسکارن)، گسل‌های تکتونیکی، عیار Fe% و خواص لیتولوژی',
        color: '#8B5CF6',
        badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        icon: 'Layers'
      },
      {
        id: 'FLEET',
        titleFa: 'واحد بارگیری، ترابری و دیسپاچینگ',
        titleEn: 'Fleet & Dispatching Unit',
        description: 'موقعیت زنده و زون فعالیت شاول‌ها، لودرها، دریل‌ها و ناوگان دامپتراک‌های باربری',
        color: '#06B6D4',
        badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        icon: 'Truck'
      },
      {
        id: 'STOCKPILE',
        titleFa: 'واحد دپوها، انبار و سنگ‌شکن',
        titleEn: 'Stockpiles & Processing Unit',
        description: 'محدوده دپوهای مستقیم DSO، دپوی باطله، بونکر دریافت سنگ‌شکن اولیه و ذخایر دپو',
        color: '#D97706',
        badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: 'Boxes'
      },
      {
        id: 'SAFETY',
        titleFa: 'واحد ایمنی، HSE و ژئوتکنیک',
        titleEn: 'Geotechnical & Safety (HSE)',
        description: 'پایش پایداری دیواره، ترک‌های کششی، زون‌های خطر، مسیرهای فرار و الزامات ایمنی پیت',
        color: '#EF4444',
        badgeBg: 'bg-red-500/15 text-red-300 border-red-500/30',
        icon: 'ShieldAlert'
      },
      {
        id: 'FIELD_TASKS',
        titleFa: 'واحد تسک‌ها و دستورکارهای میدانی',
        titleEn: 'Field Operations & Tasks',
        description: 'موقعیت مأموریت‌های ابلاغ‌شده شیفت، دستورکارهای میدانی و پین‌های بازرسی',
        color: '#A855F7',
        badgeBg: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
        icon: 'CheckSquare'
      }
    ];
  }

  /**
   * سناریوهای پیش‌فرض پشتیبانی از تصمیم‌گیری (Decision-Support Multi-Unit Presets)
   */
  public static getMultiUnitDecisionPresets(): Array<{
    id: string;
    titleFa: string;
    descriptionFa: string;
    activeUnits: OperationalUnitType[];
    icon: string;
  }> {
    return [
      {
        id: 'FULL_INTEGRATION',
        titleFa: 'تلفیق جامع تمامی واحدها (دید ۳۶۰ درجه مدیریتی)',
        descriptionFa: 'نمایش همزمان لایه‌های کلیه واحدهای معدن جهت تحلیل چندبعدی و نظارت یکپارچه',
        activeUnits: ['SURVEY', 'MINING', 'DRILLING', 'GEOLOGY', 'FLEET', 'STOCKPILE', 'SAFETY', 'FIELD_TASKS', 'ALL'],
        icon: 'Globe'
      },
      {
        id: 'MINING_DISPATCH',
        titleFa: 'تصمیم‌گیری استخراج، بارگیری و ترابری',
        titleEn: 'Mining & Fleet Dispatching',
        descriptionFa: 'تلفیق نقشه مرجع با ساب‌بلوک‌ها، ناوگان ماشین‌آلات، راه‌های حمل و مقاصد دپو/سنگ‌شکن',
        activeUnits: ['SURVEY', 'MINING', 'FLEET', 'STOCKPILE', 'ALL'],
        icon: 'Truck'
      },
      {
        id: 'DRILL_BLAST_SAFETY',
        titleFa: 'تصمیم‌گیری عملیات آتشباری و ایمنی دیواره',
        titleEn: 'Blasting & Safety Hazard Decision',
        descriptionFa: 'تلفیق باندهای حفاری، شبکه چال‌ها، شعاع خطر انفجار و پایش ژئوتکنیک دیواره',
        activeUnits: ['SURVEY', 'DRILLING', 'SAFETY', 'FIELD_TASKS', 'ALL'],
        icon: 'Flame'
      },
      {
        id: 'GRADE_CONTROL_GEOLOGY',
        titleFa: 'کنترل عیار، زمین‌شناسی و تفکیک سنگ',
        titleEn: 'Grade Control & Ore Blending',
        descriptionFa: 'تلفیق ساب‌بلوک‌ها با باندهای لیتولوژی کانسنگ، گسل‌ها و عیار پودر چال',
        activeUnits: ['SURVEY', 'MINING', 'GEOLOGY', 'STOCKPILE', 'ALL'],
        icon: 'Layers'
      },
      {
        id: 'SURVEY_BASE_ONLY',
        titleFa: 'نقشه مرجع واحد نقشه‌برداری (پایه لبه و پای پله)',
        titleEn: 'Surveying Reference Base Only',
        descriptionFa: 'تمرکز بر خطوط Crest، Toe، توپوگرافی و نقاط مبنای ژئودزی برداشت‌شده',
        activeUnits: ['SURVEY', 'ALL'],
        icon: 'Compass'
      }
    ];
  }
}
