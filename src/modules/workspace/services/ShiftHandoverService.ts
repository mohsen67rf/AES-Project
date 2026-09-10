// src/modules/workspace/services/ShiftHandoverService.ts

import { 
  ShiftHandoverRecord, 
  ShiftType, 
  EquipmentHandoverStatus, 
  ShiftSupervisorSignature 
} from '../../../core/domain/types/shift-handover.types';
import { TaskRepository } from '../../tasks/services/TaskService';
import { EquipmentService } from '../../equipment/services/EquipmentService';
import type { User } from '../../../core/domain/types/mine.types';

const STORAGE_KEY = 'aes_shift_handovers_v1';

// دیتای واقع‌گرایانه پیش‌فرض برای شیفت‌های اخیر مجتمع معدنی
const SEED_HANDOVERS: ShiftHandoverRecord[] = [
  {
    id: 'hnd-1405-03-d1',
    handoverCode: 'HND-1405-03-D1',
    mineId: 'mine-01',
    mineNameFa: 'مجتمع معدنی و سنگ‌آهن گل‌گهر (پیت شماره ۳)',
    departmentKey: 'ALL_MINE',
    departmentNameFa: 'عملیات یکپارچه معدن و پیت',
    shiftType: 'SHIFT_1_DAY',
    shiftTitleFa: 'شیفت ۱ (روز) - ساعت ۰۷:۰۰ الی ۱۹:۰۰',
    shiftDateJalali: '۱۴۰۵/۰۳/۱۸',
    shiftDateGregorian: new Date().toISOString(),
    status: 'READY_FOR_HANDOVER',
    totalExtractionTons: 14250,
    totalWasteTons: 18400,
    totalHaulTrips: 342,
    averageFeGradePercent: 54.8,
    activeBenches: [
      {
        id: 'ab-1',
        benchLevel: 1040,
        blockCode: '1040 B 33',
        faceCondition: 'ACTIVE_LOADING',
        faceConditionFa: 'بارگیری فعال کانسنگ مگنتیت',
        materialType: 'HIGH_GRADE_ORE',
        materialTypeFa: 'سنگ‌آهن پرعیار (Fe > 55%)',
        assignedExcavator: 'شاول کوماتسو PC-1250 (SHV-01)',
        haulTruckCount: 6,
        targetTonnage: 8000,
        achievedTonnage: 7850,
        destination: 'سنگ‌شکن اولیه ژیراتوری (Crusher 01)',
        notes: 'بارسنگ کف پله تسطیح شده است؛ نیازی به بولدوزر نیست. کیفیت دانه‌بندی خوراک مناسب است.'
      },
      {
        id: 'ab-2',
        benchLevel: 1025,
        blockCode: '1025 C 14',
        faceCondition: 'ACTIVE_LOADING',
        faceConditionFa: 'باربری باطله با شیفت پیوسته',
        materialType: 'WASTE',
        materialTypeFa: 'باطله سخت هورنفلس',
        assignedExcavator: 'بیل هیوندای R-520 (EXC-03)',
        haulTruckCount: 5,
        targetTonnage: 9000,
        achievedTonnage: 8900,
        destination: 'دپوی باطله غربی (West Dump)',
        notes: 'ترافیک سبک در رامپ دسترسی پله ۱۰۲۵؛ سرعت مجاز ۳۰ کیلومتر بر ساعت رعایت شود.'
      },
      {
        id: 'ab-3',
        benchLevel: 1055,
        blockCode: '1055 A 08',
        faceCondition: 'BLAST_READY',
        faceConditionFa: 'آماده بارگیری پس از انفجار دیروز',
        materialType: 'LOW_GRADE_ORE',
        materialTypeFa: 'سنگ‌آهن کم‌عیار اکسیدی',
        assignedExcavator: 'شاول لیبهر R-984 (SHV-02)',
        haulTruckCount: 4,
        targetTonnage: 6500,
        achievedTonnage: 6400,
        destination: 'دپوی کم‌عیار کارخانه فلوتاسیون',
        notes: 'آب‌پاشی جبهه‌کار انجام شد. بولدرهای احتمالی با پیکور خرد شود.'
      }
    ],
    equipmentStatuses: [
      {
        id: 'eqh-1',
        code: 'SHV-01',
        nameFa: 'شاول کوماتسو PC-1250 شماره ۱',
        category: 'SHOVEL',
        status: 'OPERATIONAL',
        statusFa: 'آماده‌به‌کار و در حال بارگیری',
        operatingHours: 10.8,
        fuelLevelPercent: 72,
        locationBench: 'پله ۱۰۴۰ (بلوک B-33)',
        issuesReported: 'سایش ملایم ناخن سمت راست باکت؛ بررسی در بازدید روزانه شیفت شب'
      },
      {
        id: 'eqh-2',
        code: 'TRK-104',
        nameFa: 'دامپتراک کوماتسو HD-785 (تراک ۱۰۴)',
        category: 'TRUCK',
        status: 'OPERATIONAL',
        statusFa: 'فعال در چرخه حمل',
        operatingHours: 11.2,
        fuelLevelPercent: 65,
        locationBench: 'رامپ میانی - پله ۱۰۴۰',
        issuesReported: 'فشار باد لاستیک عقب سمت چپ چک شد و در محدوده مجاز قرار دارد.'
      },
      {
        id: 'eqh-3',
        code: 'DRL-02',
        nameFa: 'دریل‌واگن اطلس‌کوپکو ROC D7',
        category: 'DRILL',
        status: 'OPERATIONAL',
        statusFa: 'در حال حفاری شبکه چال‌ها',
        operatingHours: 9.5,
        fuelLevelPercent: 54,
        locationBench: 'پله ۱۰۷۰ (بلوک B-19)',
        issuesReported: '۲۴ حلقه چال تا عمق ۱۲ متر حفر شد. برای شیفت بعد سرمته شماره ۳ نو ارسال شود.'
      },
      {
        id: 'eqh-4',
        code: 'TRK-107',
        nameFa: 'دامپتراک کاترپیلار 777D (تراک ۱۰۷)',
        category: 'TRUCK',
        status: 'STANDBY',
        statusFa: 'رزرو در تعمیرگاه مرکزی',
        operatingHours: 4.2,
        fuelLevelPercent: 88,
        locationBench: 'محوطه پارکینگ و تعمیرگاه',
        issuesReported: 'سرویس ۲۵۰ ساعته انجام شد؛ آماده تحویل و ورود به چرخه در شیفت شب.'
      }
    ],
    safetyLog: {
      hazardLevel: 'LOW',
      weatherCondition: 'هوای آفتابی و معتدل، سرعت باد ۱۲ کیلومتر بر ساعت، دید افقی کامل',
      roadCondition: 'رامپ اصلی غربی کاملاً آب‌پاشی و گریدرزنی شده است؛ بدون چاله یا لغزندگی',
      wallStabilityStatus: 'پین‌های نشست‌سنجی پله شمالی بدون جابه‌جایی، دیواره کاملاً پایدار',
      nearMissCount: 0,
      incidentsReported: 'فاقد هرگونه حادثه منجر به جراحت یا آسیب به ناوگان در شیفت ۱ روز.',
      nextShiftBlastNotice: {
        scheduledTime: 'ساعت ۰۶:۳۰ صبح فردا (پایان شیفت شب)',
        benchLevel: 1070,
        exclusionRadiusMeters: 500,
        safetyOfficerApproved: true
      }
    },
    pendingTasks: [
      {
        id: 'pnt-1',
        taskCode: 'TSK-100',
        title: 'نظارت بر چال‌زنی و نمونه‌گیری پودر بلوک 1040 B 33',
        targetDepartment: 'مهندسی استخراج و ژئولوژی',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        deadlineTime: 'امشب ساعت ۲۲:۰۰',
        notesForNextShift: 'کیسه‌های نمونه ردیف ۴ و ۵ به آزمایشگاه XRF تحویل داده شود.'
      },
      {
        id: 'pnt-2',
        taskCode: 'TSK-108',
        title: 'برداشت نقشه‌برداری کف پله ۱۰۴۰ بعد از اتمام دپوی اولیه',
        targetDepartment: 'نقشه‌برداری و GIS',
        priority: 'HIGH',
        status: 'PENDING',
        deadlineTime: 'ساعت ۰۴:۰۰ بامداد',
        notesForNextShift: 'سرپرست نقشه‌برداری شب با دوربین توتال یا اسکنر نقاط کنترل را برداشت نماید.'
      }
    ],
    goldenShiftDirective: 'اولویت مطلق شیفت شب: حفظ نرخ خروجی سنگ‌شکن اولیه در حد ۱,۱۰۰ تن بر ساعت و عدم قطع فیددهی باطله در پله ۱۰۲۵. تمام رانندگان ملزم به کنترل سرعت در تقاطع رامپ ۳ هستند.',
    outgoingSupervisor: {
      userId: 'user-mining-1',
      fullName: 'مهندس رضایی (سرپرست کارگاه استخراج)',
      userCode: 'AES-MINE-01',
      roleId: 'MiningContractor',
      departmentFa: 'پیمانکار استخراج و بهره‌برداری',
      signedAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
      digitalFingerprint: 'AES-SIG-SHA256-48C9E27A1B8F3D5',
      signatureNotes: 'تمامی جبهه‌کارها بازرسی و تناژ اعلامی با سیستم باسکول مطابقت داده شد.'
    },
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'hnd-1405-03-n0',
    handoverCode: 'HND-1405-03-N0',
    mineId: 'mine-01',
    mineNameFa: 'مجتمع معدنی و سنگ‌آهن گل‌گهر (پیت شماره ۳)',
    departmentKey: 'ALL_MINE',
    departmentNameFa: 'عملیات یکپارچه معدن و پیت',
    shiftType: 'SHIFT_2_NIGHT',
    shiftTitleFa: 'شیفت ۲ (شب) - ساعت ۱۹:۰۰ الی ۰۷:۰۰',
    shiftDateJalali: '۱۴۰۵/۰۳/۱۷',
    shiftDateGregorian: new Date(Date.now() - 86400000).toISOString(),
    status: 'HANDED_OVER',
    totalExtractionTons: 13800,
    totalWasteTons: 16500,
    totalHaulTrips: 318,
    averageFeGradePercent: 55.1,
    activeBenches: [
      {
        id: 'ab-prev-1',
        benchLevel: 1040,
        blockCode: '1040 B 33',
        faceCondition: 'ACTIVE_LOADING',
        faceConditionFa: 'بارگیری مستمر کانسنگ مگنتیت',
        materialType: 'HIGH_GRADE_ORE',
        materialTypeFa: 'سنگ‌آهن پرعیار',
        assignedExcavator: 'شاول PC-1250 شماره ۱',
        haulTruckCount: 6,
        targetTonnage: 7500,
        achievedTonnage: 7450,
        destination: 'سنگ‌شکن اولیه',
        notes: 'عملیات در شب با روشنایی پروژکتورهای دکل ۳ بدون وقفه انجام شد.'
      }
    ],
    equipmentStatuses: [
      {
        id: 'eqh-p1',
        code: 'SHV-01',
        nameFa: 'شاول کوماتسو PC-1250 شماره ۱',
        category: 'SHOVEL',
        status: 'OPERATIONAL',
        statusFa: 'عملیاتی',
        operatingHours: 11.5,
        fuelLevelPercent: 40,
        locationBench: 'پله ۱۰۴۰',
        issuesReported: 'سوخت‌گیری پای کار در ساعت ۰۴:۰۰ صبح انجام شد.'
      }
    ],
    safetyLog: {
      hazardLevel: 'LOW',
      weatherCondition: 'آسمان صاف، دمای شبانه ۱۸ درجه سانتی‌گراد، دید کامل با نورافکن‌های صحرایی',
      roadCondition: 'تثبیت و تسطیح‌شده با گریدر',
      wallStabilityStatus: 'پایدار',
      nearMissCount: 0,
      incidentsReported: 'شیفت بدون حادثه سپری شد.'
    },
    pendingTasks: [],
    goldenShiftDirective: 'حفظ پیوستگی خوراک ورودی به خطوط فرآوری و پایش سنسورهای گاز در اعماق پیت',
    outgoingSupervisor: {
      userId: 'user-night-1',
      fullName: 'مهندس اکبری (سرپرست شیفت شب)',
      userCode: 'AES-NIGHT-02',
      roleId: 'PitSupervisor',
      departmentFa: 'عملیات صحرایی پیت',
      signedAt: new Date(Date.now() - 3600000 * 13).toISOString(),
      digitalFingerprint: 'AES-SIG-SHA256-78D0B12F83E719A',
      signatureNotes: 'گزارش شیفت شب به صورت کامل به سرپرست شیفت روز تحویل گردید.'
    },
    incomingSupervisor: {
      userId: 'user-mining-1',
      fullName: 'مهندس رضایی (سرپرست کارگاه استخراج)',
      userCode: 'AES-MINE-01',
      roleId: 'MiningContractor',
      departmentFa: 'پیمانکار استخراج و بهره‌برداری',
      signedAt: new Date(Date.now() - 3600000 * 12.5).toISOString(),
      digitalFingerprint: 'AES-SIG-SHA256-11C2E98F45A390B',
      signatureNotes: 'کلیه ماشین‌آلات و پله ۱۰۴۰ بازدید و تحویل گرفته شد.'
    },
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12.5).toISOString()
  }
];

export class ShiftHandoverService {
  private static init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HANDOVERS));
    }
  }

  public static getAll(): ShiftHandoverRecord[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : SEED_HANDOVERS;
    } catch (e) {
      console.warn('Error reading shift handovers from storage', e);
      return SEED_HANDOVERS;
    }
  }

  public static getById(id: string): ShiftHandoverRecord | null {
    const all = this.getAll();
    return all.find(item => item.id === id) || null;
  }

  public static getCurrentActiveHandover(): ShiftHandoverRecord {
    const all = this.getAll();
    // Return latest or ready for handover
    const ready = all.find(h => h.status === 'READY_FOR_HANDOVER' || h.status === 'IN_PROGRESS');
    return ready || all[0];
  }

  public static saveHandover(record: ShiftHandoverRecord): void {
    this.init();
    const all = this.getAll();
    const index = all.findIndex(h => h.id === record.id);
    if (index >= 0) {
      all[index] = { ...record, updatedAt: new Date().toISOString() };
    } else {
      all.unshift({ ...record, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('shiftHandoverUpdated', { detail: { record } }));
  }

  /**
   * امضای رسمی شیفت توسط سرپرست ورودی (Acknowledge & Dual Sign-off)
   */
  public static acknowledgeIncomingHandover(
    handoverId: string, 
    incomingUser: User, 
    notes: string = 'تمامی جبهه‌کارها و ماشین‌آلات بازدید و تحویل گرفته شد.'
  ): ShiftHandoverRecord | null {
    const record = this.getById(handoverId);
    if (!record) return null;

    const signature: ShiftSupervisorSignature = {
      userId: incomingUser.id,
      fullName: incomingUser.fullName,
      userCode: incomingUser.code || 'AES-USER',
      roleId: incomingUser.role,
      departmentFa: incomingUser.department || 'عملیات معدن',
      signedAt: new Date().toISOString(),
      digitalFingerprint: `AES-SIG-VERIFIED-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`,
      signatureNotes: notes
    };

    record.incomingSupervisor = signature;
    record.status = 'HANDED_OVER';
    this.saveHandover(record);
    return record;
  }

  /**
   * ایجاد و پیش‌پر کردن خودکار پیش‌نویس تحویل شیفت بدون کارهای تکراری (Zero Redundant Work)
   */
  public static generateAutoDraft(
    departmentKey: string = 'ALL_MINE',
    departmentNameFa: string = 'عملیات یکپارچه معدن',
    currentUser?: User | null
  ): ShiftHandoverRecord {
    const now = new Date();
    const hours = now.getHours();
    const isDay = hours >= 7 && hours < 19;
    const shiftType: ShiftType = isDay ? 'SHIFT_1_DAY' : 'SHIFT_2_NIGHT';
    const shiftTitleFa = isDay ? 'شیفت ۱ (روز) - ساعت ۰۷:۰۰ الی ۱۹:۰۰' : 'شیفت ۲ (شب) - ساعت ۱۹:۰۰ الی ۰۷:۰۰';

    // جمع‌آوری خودکار تسک‌های باز از TaskRepository
    const allTasks = TaskRepository.getAll();
    const openTasks = allTasks
      .filter(t => t.status === 'IN_PROGRESS' || t.status === 'PENDING')
      .slice(0, 4)
      .map(t => ({
        id: `h-task-${t.id}`,
        taskCode: t.code,
        title: t.title,
        targetDepartment: t.department,
        priority: (t.priority === 'URGENT' ? 'URGENT' : t.priority === 'HIGH' ? 'HIGH' : 'NORMAL') as any,
        status: t.status as any,
        deadlineTime: t.dueDate ? new Date(t.dueDate).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : 'پایان شیفت',
        notesForNextShift: t.description ? t.description.slice(0, 85) + '...' : 'پیگیری مستمر در شیفت بعد'
      }));

    // جمع‌آوری خودکار تجهیزات از EquipmentService
    const fleet = EquipmentService.getAll();
    const equipmentStatuses: EquipmentHandoverStatus[] = fleet.slice(0, 6).map(eq => ({
      id: `eq-hnd-${eq.id}`,
      code: eq.code,
      nameFa: eq.nameFa || eq.name,
      category: (eq.category === 'DUMP_TRUCK' ? 'TRUCK' : eq.category === 'SHOVEL' ? 'SHOVEL' : eq.category === 'DRILL' ? 'DRILL' : 'DOZER') as any,
      status: (eq.status === 'ACTIVE' ? 'OPERATIONAL' : eq.status === 'BREAKDOWN' ? 'BREAKDOWN' : 'STANDBY') as any,
      statusFa: eq.status === 'ACTIVE' ? 'عملیاتی و فعال' : eq.status === 'BREAKDOWN' ? 'توقف و نیازمند تعمیر' : 'آماده‌به‌کار',
      operatingHours: eq.operatingHours || 10.5,
      fuelLevelPercent: eq.fuelLevelPercent || 70,
      locationBench: eq.currentBench ? `پله ${eq.currentBench}` : 'پیت اصلی',
      issuesReported: eq.status === 'BREAKDOWN' ? 'نیازمند بررسی تیم مکانیک' : 'عملکرد عادی'
    }));

    const dateJalali = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);

    const newDraft: ShiftHandoverRecord = {
      id: `hnd-${Date.now()}`,
      handoverCode: `HND-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${isDay ? 'D' : 'N'}-${Math.floor(Math.random() * 89 + 10)}`,
      mineId: 'mine-01',
      mineNameFa: 'مجتمع معدنی سنگ‌آهن مرکزی (پیت شماره ۳)',
      departmentKey,
      departmentNameFa,
      shiftType,
      shiftTitleFa,
      shiftDateJalali: dateJalali,
      shiftDateGregorian: now.toISOString(),
      status: 'IN_PROGRESS',
      totalExtractionTons: 14600,
      totalWasteTons: 17200,
      totalHaulTrips: 335,
      averageFeGradePercent: 55.3,
      activeBenches: [
        {
          id: `ab-draft-1`,
          benchLevel: 1040,
          blockCode: '1040 B 33',
          faceCondition: 'ACTIVE_LOADING',
          faceConditionFa: 'بارگیری کانسنگ مگنتیت',
          materialType: 'HIGH_GRADE_ORE',
          materialTypeFa: 'سنگ‌آهن پرعیار',
          assignedExcavator: 'شاول PC-1250 (SHV-01)',
          haulTruckCount: 6,
          targetTonnage: 8000,
          achievedTonnage: 7900,
          destination: 'سنگ‌شکن ژیراتوری',
          notes: 'دانه‌بندی عالی و پیشروی منظم به سمت جبهه شرقی'
        },
        {
          id: `ab-draft-2`,
          benchLevel: 1025,
          blockCode: '1025 C 14',
          faceCondition: 'ACTIVE_LOADING',
          faceConditionFa: 'حمل باطله سخت',
          materialType: 'WASTE',
          materialTypeFa: 'باطله برونزون',
          assignedExcavator: 'بیل مکانیکی R-520',
          haulTruckCount: 5,
          targetTonnage: 8500,
          achievedTonnage: 8350,
          destination: 'دپوی باطله غربی',
          notes: 'ترافیک روان در مسیر دسترسی'
        }
      ],
      equipmentStatuses: equipmentStatuses.length > 0 ? equipmentStatuses : [
        {
          id: 'eq-df-1',
          code: 'SHV-01',
          nameFa: 'شاول کوماتسو PC-1250',
          category: 'SHOVEL',
          status: 'OPERATIONAL',
          statusFa: 'عملیاتی',
          operatingHours: 11.2,
          fuelLevelPercent: 75,
          locationBench: 'پله ۱۰۴۰',
          issuesReported: 'سرویس منظم انجام شد.'
        }
      ],
      safetyLog: {
        hazardLevel: 'LOW',
        weatherCondition: 'هوای آرام، دید کامل، بدون گرد و غبار مزاحم',
        roadCondition: 'آب‌پاشی مستمر و تسطیح‌شده',
        wallStabilityStatus: 'پایش آنلاین دیواره پایدار',
        nearMissCount: 0,
        incidentsReported: 'شیفت کاملاً ایمن و بدون حادثه'
      },
      pendingTasks: openTasks,
      goldenShiftDirective: 'تداوم بارگیری از بلوک ۱۰۴۰ B 33 و رعایت دقیق حریم ایمنی دپوی باطله',
      outgoingSupervisor: {
        userId: currentUser?.id || 'AES-USER-01',
        fullName: currentUser?.fullName || 'سرپرست شیفت جاری',
        userCode: currentUser?.code || 'AES-SUP',
        roleId: currentUser?.role || 'PitSupervisor',
        departmentFa: currentUser?.department || departmentNameFa,
        signedAt: new Date().toISOString(),
        digitalFingerprint: `AES-SIG-TOKEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        signatureNotes: 'گزارش شیفت پس از بررسی میدانی نهایی شد.'
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    return newDraft;
  }
}
