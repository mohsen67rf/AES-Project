// src/modules/workspace/services/ShiftHandoverService.ts

import { 
  ShiftHandoverRecord, 
  ShiftType, 
  ActiveEquipmentPlacement
} from '../../../core/domain/types/shift-handover.types';
import { EquipmentService } from '../../equipment/services/EquipmentService';
import type { User } from '../../../core/domain/types/mine.types';

const STORAGE_KEY = 'aes_shift_handovers_tripartite_v2';

// دیتای واقع‌گرایانه پیش‌فرض برای پروتکل هوشمند تحویل و تحول سه‌گانه
const SEED_HANDOVERS: ShiftHandoverRecord[] = [
  {
    id: 'hnd-1405-03-d1',
    handoverCode: 'HND-1405-03-D1',
    mineId: 'mine-01',
    mineNameFa: 'مجتمع معدنی و سنگ‌آهن مرکزی (پیت شماره ۳)',
    departmentKey: 'ALL_MINE',
    departmentNameFa: 'ستاد هماهنگی عملیات پیت و استخراج',
    shiftType: 'SHIFT_1_DAY',
    shiftTitleFa: 'شیفت ۱ (روز) - ۰۷:۰۰ الی ۱۹:۰۰',
    shiftDateJalali: '۱۴۰۵/۰۳/۱۸',
    shiftDateGregorian: new Date().toISOString(),
    status: 'READY_FOR_HANDOVER',

    // جلسه هماهنگی حضوری اول شیفت در معدن
    meetingLocation: 'اتاق دیسپچینگ و مانیتورینگ مرکزی پیت ۳',
    meetingTime: '۰۶:۴۵ صبح',
    meetingNotes: 'جلسه هماهنگی اول شیفت با حضور نمایندگان کارفرما، دستگاه نظارت مهندسین مشاور و مدیران کارگاه پیمانکار برگزار شد. تمرکز اصلی بر تامین خوراک پرعیار سنگ‌شکن، اتمام حفاری بلوک ۱۰۴۰-B-12 و خردایش ثانویه سنگ‌های بزرگ پای شاول با پیکور هیدرولیکی مصوب گردید.',
    tripartiteReps: [
      {
        role: 'CLIENT',
        roleTitleFa: 'نماینده کارفرما (ناظر عالیه مجتمع)',
        organizationName: 'شرکت معدنی و صنعتی کارفرما',
        personName: 'مهندس محمودی',
        personnelCode: 'EMP-9021',
        presentInMeeting: true,
        notes: 'تاکید بر عدم افت عیار خوراک ارسالی به سنگ‌شکن به زیر ۵۴.۵ درصد'
      },
      {
        role: 'SUPERVISION',
        roleTitleFa: 'دستگاه نظارت (مهندسین مشاور مقیم)',
        organizationName: 'مهندسین مشاور مهندسی معدن فراکاوش',
        personName: 'مهندس حسینی',
        personnelCode: 'SUP-4410',
        presentInMeeting: true,
        notes: 'کنترل دقیق زاویه شیب چال‌های ردیف پشت در پله ۱۰۴۰ به دلیل رخداد درزه ژئوتکنیکی'
      },
      {
        role: 'CONTRACTOR',
        roleTitleFa: 'پیمانکار استخراج و باربری (مدیر کارگاه)',
        organizationName: 'شرکت پیمانکاری کوهساران البرز',
        personName: 'مهندس اکبری',
        personnelCode: 'CTR-8832',
        presentInMeeting: true,
        notes: 'تخصیص شاول کوماتسو PC-1250 و ۶ دستگاه دامپتراک به بلوک کانسنگ و فعال‌سازی پیکور'
      }
    ],

    // ۱. اولویت‌بندی حفاری بلوک‌ها
    drillingPriorities: [
      {
        id: 'dp-1',
        priorityOrder: 1,
        blockCode: '1040-B-12',
        benchLevel: 1040,
        rockTypeFa: 'مگنتیت پرعیار توده‌ای (سخت و متراکم)',
        patternGrid: '۳.۵ × ۴.۰ متر (عمق ۱۲ متر)',
        targetHoleCount: 42,
        targetDrillMeters: 504,
        assignedDrillRig: 'دریل‌واگن هیدرولیک DRL-01 (Tamrock)',
        specialInstructions: 'آتشباری در شیفت بعد؛ چال‌ها سریعاً پاکسازی و کیسه‌گذاری شوند.',
        achievedDrillMeters: 492,
        achievedHoleCount: 41,
        fulfillmentPercent: 97.6,
        deviationReason: 'یک چال به دلیل برخورد با زون درزه‌ای ریزش جزئی داشت که دوباره تمیزکاری شد.',
        verifiedByTripartite: true
      },
      {
        id: 'dp-2',
        priorityOrder: 2,
        blockCode: '1055-B-18',
        benchLevel: 1055,
        rockTypeFa: 'باطله متراکم آمفیبولیت و هورنفلس',
        patternGrid: '۴.۰ × ۴.۵ متر (عمق ۱۵ متر)',
        targetHoleCount: 30,
        targetDrillMeters: 450,
        assignedDrillRig: 'دریل هیدرولیک DRL-02 (Atlas Copco ROC D7)',
        specialInstructions: 'جهت باز کردن مسیر پیشروی رمپ شمال‌غربی باطله‌برداری',
        achievedDrillMeters: 410,
        achievedHoleCount: 27,
        fulfillmentPercent: 91.1,
        deviationReason: 'تعویض نیم ساعته سرمته سایش‌یافته شماره ۲',
        verifiedByTripartite: true
      }
    ],

    // ۲. اولویت‌بندی بارگیری و استخراج بلوک‌ها
    loadingPriorities: [
      {
        id: 'lp-1',
        priorityOrder: 1,
        blockCode: '1025-O-04',
        benchLevel: 1025,
        materialType: 'HIGH_GRADE_ORE',
        materialTypeFa: 'سنگ‌آهن پرعیار مگنتیتی (Fe > 55%)',
        targetTonnage: 8500,
        assignedLoadingUnit: 'شاول کوماتسو PC-1250 (SHV-01)',
        allocatedTruckCount: 7,
        destination: 'سنگ‌شکن ژیراتوری اولیه (Crusher #1)',
        specialInstructions: 'بارگیری یکنواخت؛ جلوگیری از ورود قلوه‌سنگ‌های بیش از ۸۰ سانتی‌متر',
        achievedTonnage: 8350,
        achievedTripsCount: 167,
        fulfillmentPercent: 98.2,
        deviationReason: 'توقف ۲۰ دقیقه‌ای به دلیل تعویض شیفت اپراتور سنگ‌شکن',
        verifiedByTripartite: true
      },
      {
        id: 'lp-2',
        priorityOrder: 2,
        blockCode: '1040-W-09',
        benchLevel: 1040,
        materialType: 'WASTE',
        materialTypeFa: 'باطله هورنفلس و شیل سخت',
        targetTonnage: 9000,
        assignedLoadingUnit: 'لودر کاترپیلار 988 (LDR-01)',
        allocatedTruckCount: 6,
        destination: 'دپوی باطله غربی (West Dump)',
        specialInstructions: 'رعایت سرعت مطمئنه در رمپ شیب‌دار دسترسی به باطله‌دان',
        achievedTonnage: 8650,
        achievedTripsCount: 173,
        fulfillmentPercent: 96.1,
        deviationReason: 'آب‌پاشی مضاعف رمپ به درخواست واحد ایمنی',
        verifiedByTripartite: true
      }
    ],

    // ۳. ثبت ماشین‌آلات فعال روی نقشه (شاول، لودر، دریل، پیکور و...)
    activePlacements: [
      {
        id: 'ap-1',
        code: 'SHV-01',
        category: 'SHOVEL',
        categoryFa: 'شاول بارگیری هیدرولیک',
        nameFa: 'شاول کوماتسو PC-1250 شماره ۱',
        currentBench: 'پله ۱۰۲۵ (جبهه‌کار شرقی)',
        assignedZoneBlock: 'بلوک کانسنگ 1025-O-04',
        shiftMission: 'بارگیری مستمر کانسنگ پرعیار به سمت سنگ‌شکن',
        operatorName: 'قاسم نوروزی',
        status: 'ACTIVE',
        statusFa: 'عملیاتی و فعال',
        operatingHoursAchieved: 11.2,
        endShiftCondition: 'سالم و آماده ادامه کار در شیفت شب',
        notes: 'باکت و ناخن‌ها در وضعیت مطلوب بازرسی شدند.'
      },
      {
        id: 'ap-2',
        code: 'PCK-01',
        category: 'HYDRAULIC_BREAKER',
        categoryFa: 'پیکور سنگین خردایش ثانویه',
        nameFa: 'پیکور هیدرولیکی سوسان روی کوماتسو PC-400',
        currentBench: 'پله ۱۰۲۵ (پای جبهه‌کار سنگ‌شکن)',
        assignedZoneBlock: 'محوطه آماده‌سازی کانسنگ ۱۰۲۵',
        shiftMission: 'خردایش بولدرهای بزرگ قبل از بارگیری به تراک',
        operatorName: 'علیرضا صادقی',
        status: 'ACTIVE',
        statusFa: 'عملیاتی و فعال',
        operatingHoursAchieved: 8.5,
        endShiftCondition: 'روغن‌کاری قلم انجام شد؛ آماده شیفت بعد',
        notes: 'خردایش بیش از ۷۰ قطعه بولدر با موفقیت به اتمام رسید.'
      },
      {
        id: 'ap-3',
        code: 'DRL-01',
        category: 'DRILL',
        categoryFa: 'دریل‌واگن هیدرولیک',
        nameFa: 'دریل تامراک پانترای دیپ‌هول',
        currentBench: 'پله ۱۰۴۰ (شمالی)',
        assignedZoneBlock: 'بلوک حفاری 1040-B-12',
        shiftMission: 'حفاری چال‌های انفجاری تا تراز ۱۰۲۸',
        operatorName: 'اصغر کریمی',
        status: 'ACTIVE',
        statusFa: 'عملیاتی و فعال',
        operatingHoursAchieved: 10.4,
        endShiftCondition: 'کمپرسور هوا و دکل بررسی شد؛ بدون نقص',
        notes: '۴۱ چال کامل شد؛ نیاز به شارژ گازوئیل برای شیفت شب.'
      },
      {
        id: 'ap-4',
        code: 'BLD-03',
        category: 'DOZER',
        categoryFa: 'بولدوزر سنگین تیغه‌زنی',
        nameFa: 'بولدوزر کوماتسو D155A',
        currentBench: 'دپوی باطله غربی',
        assignedZoneBlock: 'لبه ترانشه تخلیه باطله',
        shiftMission: 'پوشش لبه ترانشه، ریگلاژ کف و ایجاد ایمنی دپو',
        operatorName: 'مرتضی اکبری',
        status: 'ACTIVE',
        statusFa: 'عملیاتی و فعال',
        operatingHoursAchieved: 9.8,
        endShiftCondition: 'سالم',
        notes: 'برم ایمنی دپوی باطله به ارتفاع ۲ متر احداث شد.'
      },
      {
        id: 'ap-5',
        code: 'TRK-104',
        category: 'TRUCK',
        categoryFa: 'دامپتراک معدنی',
        nameFa: 'دامپتراک کوماتسو HD-785 (شماره ۱۰۴)',
        currentBench: 'رمپ اصلی ۱۰۲۵ به سنگ‌شکن',
        assignedZoneBlock: 'چرخه حمل کانسنگ پرعیار',
        shiftMission: 'حمل کانسنگ به سنگ‌شکن اولیه',
        operatorName: 'حسین مرادی',
        status: 'ACTIVE',
        statusFa: 'فعال در چرخه حمل',
        operatingHoursAchieved: 11.0,
        endShiftCondition: 'سالم',
        notes: 'فشار لاستیک‌ها چک و تایید شد.'
      }
    ],

    // ۴. توافق بر سر بلوک‌های در نوبت انفجار آتی
    upcomingBlasts: [
      {
        id: 'ub-1',
        blockCode: '1040-B-12',
        benchLevel: 1040,
        drillPatternStatus: 'CHARGING_IN_PROGRESS',
        drillPatternStatusFa: 'چال‌زنی تکمیل، در حال خرج‌گذاری مواد ناریه',
        plannedBlastTime: 'فردا ساعت ۱۱:۳۰ ظهر',
        explosiveType: 'آنفو صنعتی + تقویت‌کننده پنتولیت و نانل',
        estimatedOreTonnage: 32000,
        safetyRadiusMeters: 550,
        supervisionClearance: true,
        clientClearance: true,
        contractorReady: true,
        statusNote: 'نقشه آتشباری توسط دستگاه نظارت تایید شد؛ جاده دسترسی شمال پیت در ساعت انفجار مسدود می‌شود.',
        blastConducted: false,
        actualConductedTime: 'برنامه‌ریزی‌شده برای شیفت روز فردا'
      },
      {
        id: 'ub-2',
        blockCode: '1055-B-18',
        benchLevel: 1055,
        drillPatternStatus: 'DRILLING_COMPLETED',
        drillPatternStatusFa: 'حفاری رو به اتمام، منتظر تحویل انبار ناریه',
        plannedBlastTime: 'پس‌فردا ساعت ۰۶:۳۰ صبح',
        explosiveType: 'امولشن ضدآب (واترجت)',
        estimatedOreTonnage: 28000,
        safetyRadiusMeters: 500,
        supervisionClearance: true,
        clientClearance: true,
        contractorReady: true,
        statusNote: 'چال‌های آب‌دار شناسایی شده و خرج‌گذاری با پرایمر ضدآب انجام خواهد شد.'
      }
    ],

    // ۵. برنامه ادامه روز/شیفت
    intraShiftSchedule: [
      {
        id: 'iss-1',
        timeSlot: '۰۷:۰۰ الی ۰۹:۰۰',
        actionTitle: 'استقرار شاول PC-1250، بارگیری پیوسته کانسنگ و پر کردن سیلو سنگ‌شکن',
        targetLocation: 'پله ۱۰۲۵ جبهه‌کار شرقی',
        responsibleParty: 'پیمانکار - سرپرست باربری',
        status: 'EXECUTED',
        notes: 'خوراک‌دهی پایدار انجام و سیلوی سنگ‌شکن در تراز ۷۵٪ تثبیت شد.'
      },
      {
        id: 'iss-2',
        timeSlot: '۰۹:۰۰ الی ۱۱:۳۰',
        actionTitle: 'ورود پیکور هیدرولیکی PCK-01 جهت خردایش ثانویه سنگ‌های سرگردان و ایمن‌سازی پاشنه',
        targetLocation: 'پاشنه پله ۱۰۲۵',
        responsibleParty: 'پیمانکار - اپراتور پیکور',
        status: 'EXECUTED',
        notes: 'تمام بولدرهای مسدودکننده باکت شاول خرد شدند.'
      },
      {
        id: 'iss-3',
        timeSlot: '۱۱:۳۰ الی ۱۳:۳۰',
        actionTitle: 'آب‌پاشی فشار قوی رمپ‌های باربری غربی و گریدرزنی شیب راه',
        targetLocation: 'رمپ اصلی معدن',
        responsibleParty: 'واحد ایمنی و پیمانکار راهداری',
        status: 'EXECUTED',
        notes: 'گرد و غبار کنترل شد و دید افقی رانندگان به ۱۰۰٪ رسید.'
      },
      {
        id: 'iss-4',
        timeSlot: '۱۳:۳۰ الی ۱۶:۰۰',
        actionTitle: 'اتمام حفاری چال‌های پایانی بلوک ۱۰۴۰ و برداشت ژئودتیک سرپرست نقشه‌برداری',
        targetLocation: 'پله ۱۰۴۰ شمالی',
        responsibleParty: 'مهندسی استخراج و نقشه‌برداری',
        status: 'EXECUTED',
        notes: 'نقاط مختصات دقیق چال‌ها برداشت و تحویل دفتر فنی گردید.'
      },
      {
        id: 'iss-5',
        timeSlot: '۱۶:۰۰ الی ۱۹:۰۰',
        actionTitle: 'سوخت‌گیری ماشین‌آلات پای کار، ارزیابی تحقق برنامه و جلسه تحویل به شیفت شب',
        targetLocation: 'پیت و اتاق عملیات',
        responsibleParty: 'ارکان سه‌گانه پروژه',
        status: 'EXECUTED',
        notes: 'تمامی ارکان در جلسه حاضر شده و گزارش نهایی را امضا کردند.'
      }
    ],

    // ۶. الزامات اجرایی و ایمنی در طول شیفت
    operationalMandates: [
      {
        id: 'om-1',
        category: 'SAFETY_HSE',
        categoryFa: 'ایمنی، بهداشت و محیط زیست (HSE)',
        directiveText: 'کنترل سخت‌گیرانه سرعت دامپتراک‌ها در رمپ غربی (حداکثر ۳۰ کیلومتر بر ساعت) و اجبار به رعایت فاصله طولی ۵۰ متر.',
        issuedByRole: 'SAFETY_OFFICER',
        issuedByName: 'مهندس رستمی (افسر ارشد ایمنی)',
        priority: 'MANDATORY',
        complianceStatus: 'COMPLIED',
        complianceNotes: 'گشت ایمنی دو بار سرعت‌سنجی انجام داد؛ تخلفی ثبت نشد.'
      },
      {
        id: 'om-2',
        category: 'GRADE_CONTROL',
        categoryFa: 'کنترل عیار و ژئومتالورژی',
        directiveText: 'عدم بارگیری از حاشیه ترانشه جنوب‌شرقی بلوک 1025-O-04 به دلیل نفوذ رگه پیریتی باطله که باعث افت عیار کانسنگ می‌شود.',
        issuedByRole: 'SUPERVISION',
        issuedByName: 'مهندس حسینی (ناظر مقیم مشاور)',
        priority: 'CRITICAL',
        complianceStatus: 'COMPLIED',
        complianceNotes: 'نوار مرزی زرد رنگ کشیده شد و تفکیک باطله به طور کامل صورت گرفت.'
      },
      {
        id: 'om-3',
        category: 'GEOTECHNICAL',
        categoryFa: 'پایش ژئوتکنیک و پایداری دیواره',
        directiveText: 'پایش مستمر پین‌های ژئوتکنیکی ترانشه شمالی بعد از هر سیکل باربری جهت اطمینان از عدم ایجاد ترک کششی.',
        issuedByRole: 'CLIENT',
        issuedByName: 'مهندس محمودی (نماینده کارفرما)',
        priority: 'HIGH',
        complianceStatus: 'COMPLIED',
        complianceNotes: 'نشست‌سنجی نشان‌دهنده پایداری کامل است.'
      }
    ],

    // شاخص‌های کلان تولیدی
    totalExtractionTons: 17000,
    totalWasteTons: 17650,
    totalHaulTrips: 340,
    averageFeGradePercent: 55.4,

    // رصد و ارزیابی کمی و کیفی پایان شیفت
    overallFulfillmentPercent: 96.8,
    drillingFulfillmentPercent: 94.3,
    loadingFulfillmentPercent: 97.2,
    blastingFulfillmentPercent: 100,
    mandatesCompliancePercent: 100,
    endShiftReviewSummary: 'شیفت با راندمان بسیار بالا و بدون حادثه به پایان رسید. برنامه تامین خوراک سنگ‌شکن با تحقق ۹۸.۲ درصدی و با عیار مطلوب ۵۵.۴٪ ایفا شد. شبکه حفاری بلوک ۱۰۴۰ با موفقیت برای عملیات آتشباری فردا مهیا شد. تمامی ماشین‌آلات کلیدی از جمله شاول و پیکور بدون توقف فنی به شیفت شب تحویل داده شدند.',

    // امضاهای سه‌گانه ارکان پروژه و ابلاغ به سرپرستان و مدیران
    tripartiteSignatures: {
      clientSignature: {
        signed: true,
        name: 'مهندس محمودی',
        organization: 'شرکت کارفرما (ناظر عالیه معدن)',
        signedAt: new Date(Date.now() - 3600000 * 0.4).toISOString(),
        digitalFingerprint: 'AES-SIG-CLIENT-SHA256-48C9E27A1B8F3D5',
        comment: 'تناژ و عیار کانسنگ تحویلی به سنگ‌شکن مورد تایید است. اولویت آتشباری فردا بدون تغییر ابلاغ می‌گردد.'
      },
      supervisionSignature: {
        signed: true,
        name: 'مهندس حسینی',
        organization: 'دستگاه نظارت مهندسین مشاور فراکاوش',
        signedAt: new Date(Date.now() - 3600000 * 0.3).toISOString(),
        digitalFingerprint: 'AES-SIG-SUPERVISION-SHA256-78D0B12F83E719A',
        comment: 'حفاری چال‌ها و رعایت حریم ژئوتکنیکی بررسی شد و منطبق با نقشه مصوب است.'
      },
      contractorSignature: {
        signed: true,
        name: 'مهندس اکبری',
        organization: 'پیمانکار استخراج و باربری کوهساران',
        signedAt: new Date(Date.now() - 3600000 * 0.2).toISOString(),
        digitalFingerprint: 'AES-SIG-CONTRACTOR-SHA256-11C2E98F45A390B',
        comment: 'ناوگان باربری و جبهه‌کارها در بهترین شرایط تحویل سرپرست شیفت شب شد.'
      },
      incomingSupervisorAck: {
        acknowledged: false,
        name: 'مهندس رضایی (سرپرست شیفت شب ورودی)',
        shiftCode: 'SHIFT-NIGHT-02',
        notes: 'در انتظار تحویل حضوری در اتاق عملیات'
      },
      notifiedManagers: [
        {
          id: 'mgr-1',
          name: 'مهندس کمالی (مدیر کل مجتمع معدنی)',
          roleTitle: 'مدیر ارشد مجتمع',
          notifiedAt: new Date(Date.now() - 3600000 * 0.1).toISOString(),
          viewed: true,
          viewedAt: new Date().toISOString(),
          feedbackNote: 'دست مریزاد به ارکان پروژه بابت تحقق ۹۷ درصدی برنامه و ایمنی کامل.'
        },
        {
          id: 'mgr-2',
          name: 'دکتر افشار (سرپرست کل مهندسی و برنامه‌ریزی)',
          roleTitle: 'سرپرست مهندسی معدن',
          notifiedAt: new Date(Date.now() - 3600000 * 0.1).toISOString(),
          viewed: true,
          viewedAt: new Date().toISOString(),
          feedbackNote: 'کنترل عیار ۵۵.۴٪ عالی است؛ مدل ژئومتالورژی با دیتای واقعی کالیبره شد.'
        },
        {
          id: 'mgr-3',
          name: 'مهندس نوری (سرپرست ایمنی و بهداشت کل HSE)',
          roleTitle: 'سرپرست عالیه HSE',
          notifiedAt: new Date(Date.now() - 3600000 * 0.1).toISOString(),
          viewed: false
        }
      ]
    },

    // سازگاری با کدهای موجود
    goldenShiftDirective: 'اولویت اول شیفت: تامین خوراک پرعیار سنگ‌شکن با عیار بالای ۵۴.۵٪ و آماده‌سازی نهایی چال‌های بلوک ۱۰۴۰ جهت آتشباری ایمن.',
    activeBenches: [
      {
        id: 'ab-1',
        benchLevel: 1025,
        blockCode: '1025-O-04',
        faceCondition: 'ACTIVE_LOADING',
        faceConditionFa: 'بارگیری فعال کانسنگ مگنتیت',
        materialType: 'HIGH_GRADE_ORE',
        materialTypeFa: 'سنگ‌آهن پرعیار (Fe > 55%)',
        assignedExcavator: 'شاول کوماتسو PC-1250 (SHV-01)',
        haulTruckCount: 7,
        targetTonnage: 8500,
        achievedTonnage: 8350,
        destination: 'سنگ‌شکن اولیه ژیراتوری',
        notes: 'بارسنگ کف پله تسطیح شده و پیکور بولدرها را خرد کرده است.'
      },
      {
        id: 'ab-2',
        benchLevel: 1040,
        blockCode: '1040-W-09',
        faceCondition: 'ACTIVE_LOADING',
        faceConditionFa: 'باربری باطله با شیفت پیوسته',
        materialType: 'WASTE',
        materialTypeFa: 'باطله سخت هورنفلس',
        assignedExcavator: 'لودر کاترپیلار 988 (LDR-01)',
        haulTruckCount: 6,
        targetTonnage: 9000,
        achievedTonnage: 8650,
        destination: 'دپوی باطله غربی',
        notes: 'ترافیک سبک و روان در رمپ دسترسی پله ۱۰۴۰'
      }
    ],
    equipmentStatuses: [
      {
        id: 'eqh-1',
        code: 'SHV-01',
        nameFa: 'شاول کوماتسو PC-1250',
        category: 'SHOVEL',
        status: 'OPERATIONAL',
        statusFa: 'آماده‌به‌کار و فعال',
        operatingHours: 11.2,
        fuelLevelPercent: 68,
        locationBench: 'پله ۱۰۲۵',
        issuesReported: 'سالم؛ نیاز به سوخت‌گیری در ابتدای شیفت شب'
      },
      {
        id: 'eqh-2',
        code: 'DRL-01',
        categoryFa: 'دریل‌واگن تامراک',
        nameFa: 'دریل تامراک پانترای هیدرولیک',
        category: 'DRILL',
        status: 'OPERATIONAL',
        statusFa: 'فعال در حفاری',
        operatingHours: 10.4,
        fuelLevelPercent: 55,
        locationBench: 'پله ۱۰۴۰',
        issuesReported: 'سرمته در وضعیت استاندارد است.'
      }
    ],
    safetyLog: {
      hazardLevel: 'LOW',
      weatherCondition: 'آفتابی و معتدل، سرعت باد ۱۰ کیلومتر بر ساعت، دید افقی کامل',
      roadCondition: 'رمپ اصلی کاملاً آب‌پاشی و تسطیح شده است',
      wallStabilityStatus: 'پین‌های نشست‌سنجی پله بدون جابه‌جایی و کاملاً پایدار',
      nearMissCount: 0,
      incidentsReported: 'فاقد هرگونه حادثه در طول شیفت',
      nextShiftBlastNotice: {
        scheduledTime: 'فردا ساعت ۱۱:۳۰ ظهر',
        benchLevel: 1040,
        exclusionRadiusMeters: 550,
        safetyOfficerApproved: true
      }
    },
    pendingTasks: [
      {
        id: 'pnt-1',
        taskCode: 'TSK-201',
        title: 'تحویل بارسنگ و نمونه‌برداری پودر چال‌های بلوک 1040-B-12',
        targetDepartment: 'مهندسی استخراج و زمین‌شناسی',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        deadlineTime: 'امشب ساعت ۲۲:۰۰',
        notesForNextShift: 'نتایج آزمایشگاه سریعاً وارد بانک داده ژئومتالورژی شود.'
      }
    ],
    outgoingSupervisor: {
      userId: 'user-contractor-1',
      fullName: 'مهندس اکبری (مدیر کارگاه پیمانکار)',
      userCode: 'CTR-8832',
      roleId: 'MiningContractor',
      departmentFa: 'پیمانکار استخراج و بهره‌برداری',
      signedAt: new Date(Date.now() - 3600000 * 0.2).toISOString(),
      digitalFingerprint: 'AES-SIG-CONTRACTOR-SHA256-11C2E98F45A390B',
      signatureNotes: 'تمامی جبهه‌کارها بازرسی و تناژ با باسکول دیجیتال مطابقت دارد.'
    },
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'hnd-1405-03-n0',
    handoverCode: 'HND-1405-03-N0',
    mineId: 'mine-01',
    mineNameFa: 'مجتمع معدنی و سنگ‌آهن مرکزی (پیت شماره ۳)',
    departmentKey: 'ALL_MINE',
    departmentNameFa: 'ستاد هماهنگی عملیات پیت و استخراج',
    shiftType: 'SHIFT_2_NIGHT',
    shiftTitleFa: 'شیفت ۲ (شب) - ۱۹:۰۰ الی ۰۷:۰۰',
    shiftDateJalali: '۱۴۰۵/۰۳/۱۷',
    shiftDateGregorian: new Date(Date.now() - 86400000).toISOString(),
    status: 'HANDED_OVER',

    meetingLocation: 'دفتر فنی کارگاه معدن',
    meetingTime: '۱۸:۴۵ عصر',
    meetingNotes: 'جلسه هماهنگی شیفت شب با حضور نمایندگان سه‌گانه برگزار شد. ایمنی در شب و نورپردازی پله‌ها در صدر الزامات قرار گرفت.',
    tripartiteReps: [
      {
        role: 'CLIENT',
        roleTitleFa: 'نماینده کارفرما',
        organizationName: 'شرکت معدنی کارفرما',
        personName: 'مهندس ناصری',
        personnelCode: 'EMP-7711',
        presentInMeeting: true
      },
      {
        role: 'SUPERVISION',
        roleTitleFa: 'دستگاه نظارت مشاور',
        organizationName: 'مهندسین مشاور فراکاوش',
        personName: 'مهندس ابراهیمی',
        personnelCode: 'SUP-3209',
        presentInMeeting: true
      },
      {
        role: 'CONTRACTOR',
        roleTitleFa: 'پیمانکار استخراج',
        organizationName: 'شرکت پیمانکاری کوهساران',
        personName: 'مهندس کریمی',
        personnelCode: 'CTR-6612',
        presentInMeeting: true
      }
    ],

    drillingPriorities: [
      {
        id: 'dp-prev-1',
        priorityOrder: 1,
        blockCode: '1040-B-11',
        benchLevel: 1040,
        rockTypeFa: 'مگنتیت باطله‌دار',
        patternGrid: '۳.۵ × ۴ متر',
        targetHoleCount: 35,
        targetDrillMeters: 420,
        assignedDrillRig: 'دریل DRL-01',
        achievedDrillMeters: 420,
        achievedHoleCount: 35,
        fulfillmentPercent: 100,
        verifiedByTripartite: true
      }
    ],
    loadingPriorities: [
      {
        id: 'lp-prev-1',
        priorityOrder: 1,
        blockCode: '1025-O-03',
        benchLevel: 1025,
        materialType: 'HIGH_GRADE_ORE',
        materialTypeFa: 'سنگ‌آهن پرعیار',
        targetTonnage: 7500,
        assignedLoadingUnit: 'شاول کوماتسو PC-1250',
        allocatedTruckCount: 6,
        destination: 'سنگ‌شکن ژیراتوری',
        achievedTonnage: 7420,
        achievedTripsCount: 148,
        fulfillmentPercent: 98.9,
        verifiedByTripartite: true
      }
    ],
    activePlacements: [
      {
        id: 'ap-p1',
        code: 'SHV-01',
        category: 'SHOVEL',
        categoryFa: 'شاول هیدرولیک',
        nameFa: 'شاول PC-1250',
        currentBench: 'پله ۱۰۲۵',
        assignedZoneBlock: 'بلوک 1025-O-03',
        shiftMission: 'بارگیری شبانه',
        operatorName: 'رحیم خدادادی',
        status: 'ACTIVE',
        statusFa: 'عملیاتی',
        operatingHoursAchieved: 11.5
      }
    ],
    upcomingBlasts: [],
    intraShiftSchedule: [
      {
        id: 'iss-p1',
        timeSlot: '۱۹:۰۰ الی ۲۳:۰۰',
        actionTitle: 'شارژ سیلو و باربری مستمر شبانه',
        targetLocation: 'پله ۱۰۲۵',
        responsibleParty: 'پیمانکار',
        status: 'EXECUTED'
      }
    ],
    operationalMandates: [
      {
        id: 'om-p1',
        category: 'SAFETY_HSE',
        categoryFa: 'ایمنی شبانه',
        directiveText: 'روشنایی کامل مسیرهای باربری با برج‌های نور پرتابل',
        issuedByRole: 'SUPERVISION',
        issuedByName: 'مهندس ابراهیمی',
        priority: 'MANDATORY',
        complianceStatus: 'COMPLIED'
      }
    ],

    totalExtractionTons: 14500,
    totalWasteTons: 16200,
    totalHaulTrips: 310,
    averageFeGradePercent: 55.1,
    overallFulfillmentPercent: 98.2,
    drillingFulfillmentPercent: 100,
    loadingFulfillmentPercent: 98.9,
    blastingFulfillmentPercent: 100,
    mandatesCompliancePercent: 100,
    endShiftReviewSummary: 'شیفت شب با انطباق کامل با دستورالعمل‌های هماهنگ‌شده ارکان سه‌گانه و تحویل کامل به شیفت روز به اتمام رسید.',

    tripartiteSignatures: {
      clientSignature: {
        signed: true,
        name: 'مهندس ناصری',
        organization: 'شرکت کارفرما',
        signedAt: new Date(Date.now() - 3600000 * 12.5).toISOString(),
        digitalFingerprint: 'AES-SIG-CLIENT-SHA256-PREV1',
        comment: 'تایید می‌شود.'
      },
      supervisionSignature: {
        signed: true,
        name: 'مهندس ابراهیمی',
        organization: 'دستگاه نظارت مشاور',
        signedAt: new Date(Date.now() - 3600000 * 12.4).toISOString(),
        digitalFingerprint: 'AES-SIG-SUPERVISION-SHA256-PREV2',
        comment: 'پایش بدون انحراف.'
      },
      contractorSignature: {
        signed: true,
        name: 'مهندس کریمی',
        organization: 'پیمانکار استخراج',
        signedAt: new Date(Date.now() - 3600000 * 12.3).toISOString(),
        digitalFingerprint: 'AES-SIG-CONTRACTOR-SHA256-PREV3',
        comment: 'تحویل داده شد.'
      },
      incomingSupervisorAck: {
        acknowledged: true,
        name: 'مهندس اکبری (سرپرست شیفت روز ورودی)',
        shiftCode: 'SHIFT-DAY-01',
        acknowledgedAt: new Date(Date.now() - 3600000 * 12.1).toISOString(),
        notes: 'تمامی پله‌ها و ناوگان بازدید و تحویل گرفته شد.'
      },
      notifiedManagers: [
        {
          id: 'mgr-arch-1',
          name: 'مهندس کمالی (مدیر کل مجتمع)',
          roleTitle: 'مدیر ارشد',
          notifiedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          viewed: true,
          viewedAt: new Date(Date.now() - 3600000 * 11).toISOString(),
          feedbackNote: 'گزارش شیفت شب رویت و آرشیو شد.'
        }
      ]
    },

    goldenShiftDirective: 'حفظ روشنایی دکل‌ها و ایمنی تردد در شیفت شب',
    activeBenches: [],
    equipmentStatuses: [],
    safetyLog: {
      hazardLevel: 'LOW',
      weatherCondition: 'آسمان صاف',
      roadCondition: 'تسطیح‌شده',
      wallStabilityStatus: 'پایدار',
      nearMissCount: 0,
      incidentsReported: 'بدون حادثه'
    },
    pendingTasks: [],
    outgoingSupervisor: {
      userId: 'user-contractor-night',
      fullName: 'مهندس کریمی',
      userCode: 'CTR-6612',
      roleId: 'MiningContractor',
      departmentFa: 'پیمانکار',
      signedAt: new Date(Date.now() - 3600000 * 12.3).toISOString(),
      digitalFingerprint: 'AES-SIG-PREV'
    },
    incomingSupervisor: {
      userId: 'user-contractor-1',
      fullName: 'مهندس اکبری',
      userCode: 'CTR-8832',
      roleId: 'MiningContractor',
      departmentFa: 'پیمانکار',
      signedAt: new Date(Date.now() - 3600000 * 12.1).toISOString(),
      digitalFingerprint: 'AES-ACK-PREV'
    },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
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
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return SEED_HANDOVERS;
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
    const ready = all.find(h => h.status === 'READY_FOR_HANDOVER' || h.status === 'IN_PROGRESS' || h.status === 'PLANNING_MEETING');
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
   * امضای دیجیتال توسط یکی از ارکان سه‌گانه پروژه (کارفرما، دستگاه نظارت، یا پیمانکار)
   */
  public static signAsTripartite(
    handoverId: string,
    party: 'CLIENT' | 'SUPERVISION' | 'CONTRACTOR',
    signerName: string,
    organization: string,
    comment?: string
  ): ShiftHandoverRecord | null {
    const record = this.getById(handoverId);
    if (!record) return null;

    const fp = `AES-SIG-${party}-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`;
    const nowIso = new Date().toISOString();

    if (!record.tripartiteSignatures) {
      record.tripartiteSignatures = {
        clientSignature: { signed: false, name: '', organization: '', digitalFingerprint: '' },
        supervisionSignature: { signed: false, name: '', organization: '', digitalFingerprint: '' },
        contractorSignature: { signed: false, name: '', organization: '', digitalFingerprint: '' },
        notifiedManagers: []
      };
    }

    if (party === 'CLIENT') {
      record.tripartiteSignatures.clientSignature = {
        signed: true,
        name: signerName,
        organization,
        signedAt: nowIso,
        digitalFingerprint: fp,
        comment: comment || 'تایید نماینده کارفرما ثبت شد.'
      };
    } else if (party === 'SUPERVISION') {
      record.tripartiteSignatures.supervisionSignature = {
        signed: true,
        name: signerName,
        organization,
        signedAt: nowIso,
        digitalFingerprint: fp,
        comment: comment || 'تایید دستگاه نظارت (مهندسین مشاور) ثبت شد.'
      };
    } else if (party === 'CONTRACTOR') {
      record.tripartiteSignatures.contractorSignature = {
        signed: true,
        name: signerName,
        organization,
        signedAt: nowIso,
        digitalFingerprint: fp,
        comment: comment || 'تایید سرپرست پیمانکار استخراج ثبت شد.'
      };
    }

    // اگر هر ۳ رکن امضا کرده باشند، وضعیت به تحویل شده ارتقا می‌یابد
    const sigs = record.tripartiteSignatures;
    if (sigs.clientSignature.signed && sigs.supervisionSignature.signed && sigs.contractorSignature.signed) {
      record.status = 'HANDED_OVER';
    }

    this.saveHandover(record);
    return record;
  }

  /**
   * تایید و تحویل گرفتن توسط سرپرست شیفت ورودی (Incoming Supervisor Ack)
   */
  public static acknowledgeIncomingSupervisor(
    handoverId: string,
    supervisorName: string,
    shiftCode: string,
    notes?: string
  ): ShiftHandoverRecord | null {
    const record = this.getById(handoverId);
    if (!record) return null;

    if (!record.tripartiteSignatures) {
      record.tripartiteSignatures = {
        clientSignature: { signed: false, name: '', organization: '', digitalFingerprint: '' },
        supervisionSignature: { signed: false, name: '', organization: '', digitalFingerprint: '' },
        contractorSignature: { signed: false, name: '', organization: '', digitalFingerprint: '' },
        notifiedManagers: []
      };
    }

    record.tripartiteSignatures.incomingSupervisorAck = {
      acknowledged: true,
      name: supervisorName,
      shiftCode,
      acknowledgedAt: new Date().toISOString(),
      notes: notes || 'جبهه‌کارها، ماشین‌آلات فعال و بلوک‌های انفجاری بازدید و تحویل گرفته شد.'
    };

    this.saveHandover(record);
    return record;
  }

  /**
   * ابلاغ به سمع و نظر مدیران و سرپرستان مربوطه
   */
  public static notifyManager(
    handoverId: string,
    managerName: string,
    roleTitle: string,
    feedbackNote?: string
  ): ShiftHandoverRecord | null {
    const record = this.getById(handoverId);
    if (!record) return null;

    if (!record.tripartiteSignatures) {
      record.tripartiteSignatures = {
        clientSignature: { signed: false, name: '', organization: '', digitalFingerprint: '' },
        supervisionSignature: { signed: false, name: '', organization: '', digitalFingerprint: '' },
        contractorSignature: { signed: false, name: '', organization: '', digitalFingerprint: '' },
        notifiedManagers: []
      };
    }

    const existingIdx = record.tripartiteSignatures.notifiedManagers.findIndex(m => m.name === managerName);
    if (existingIdx >= 0) {
      record.tripartiteSignatures.notifiedManagers[existingIdx].viewed = true;
      record.tripartiteSignatures.notifiedManagers[existingIdx].viewedAt = new Date().toISOString();
      if (feedbackNote) {
        record.tripartiteSignatures.notifiedManagers[existingIdx].feedbackNote = feedbackNote;
      }
    } else {
      record.tripartiteSignatures.notifiedManagers.push({
        id: `mgr-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        name: managerName,
        roleTitle,
        notifiedAt: new Date().toISOString(),
        viewed: true,
        viewedAt: new Date().toISOString(),
        feedbackNote
      });
    }

    this.saveHandover(record);
    return record;
  }

  /**
   * ایجاد پیش‌نویس صورت‌جلسه هماهنگی اول شیفت (Pre-Shift Tripartite Draft)
   */
  public static generateAutoDraft(
    departmentKey: string = 'ALL_MINE',
    departmentNameFa: string = 'ستاد هماهنگی عملیات پیت',
    currentUser?: User | null
  ): ShiftHandoverRecord {
    const now = new Date();
    const hours = now.getHours();
    const isDay = hours >= 7 && hours < 19;
    const shiftType: ShiftType = isDay ? 'SHIFT_1_DAY' : 'SHIFT_2_NIGHT';
    const shiftTitleFa = isDay ? 'شیفت ۱ (روز) - ساعت ۰۷:۰۰ الی ۱۹:۰۰' : 'شیفت ۲ (شب) - ساعت ۱۹:۰۰ الی ۰۷:۰۰';

    const dateJalali = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);

    const fleet = EquipmentService.getAll();
    const activePlacements: ActiveEquipmentPlacement[] = fleet.slice(0, 6).map((eq, idx) => {
      const cat: ActiveEquipmentPlacement['category'] = 
        eq.category === 'SHOVEL' ? 'SHOVEL' : 
        eq.category === 'DRILL' ? 'DRILL' : 
        eq.category === 'DUMP_TRUCK' ? 'TRUCK' : 'DOZER';
      
      const catFa: string = 
        cat === 'SHOVEL' ? 'شاول هیدرولیک' : 
        cat === 'DRILL' ? 'دریل حفاری' : 
        cat === 'TRUCK' ? 'دامپتراک باربری' : 'بولدوزر تسطیح';

      return {
        id: `ap-auto-${eq.id || idx}`,
        code: eq.code,
        category: cat,
        categoryFa: catFa,
        nameFa: eq.nameFa || eq.name,
        currentBench: eq.currentBench ? `پله ${eq.currentBench}` : 'پیت مرکزی',
        assignedZoneBlock: `بلوک هدف ${1040 - idx * 15}`,
        shiftMission: `ماموریت عملیاتی محوله در شیفت ${isDay ? 'روز' : 'شب'}`,
        operatorName: 'اپراتور شیفت',
        status: 'ACTIVE',
        statusFa: 'عملیاتی',
        operatingHoursAchieved: 0
      };
    });

    // افزودن یک پیکور در صورت نبود در ناوگان
    if (!activePlacements.some(p => p.category === 'HYDRAULIC_BREAKER')) {
      activePlacements.splice(1, 0, {
        id: 'ap-auto-pck-1',
        code: 'PCK-01',
        category: 'HYDRAULIC_BREAKER',
        categoryFa: 'پیکور سنگین خردایش ثانویه',
        nameFa: 'پیکور هیدرولیکی سوسان روی بیل PC-400',
        currentBench: 'پله ۱۰۲۵',
        assignedZoneBlock: 'جبهه‌کار سنگ‌شکن اولیه',
        shiftMission: 'خردایش بولدرها و قطعات سنگین کانسنگ پای شاول',
        operatorName: 'اپراتور پیکور',
        status: 'ACTIVE',
        statusFa: 'عملیاتی',
        operatingHoursAchieved: 0
      });
    }

    const newDraft: ShiftHandoverRecord = {
      id: `hnd-${Date.now()}`,
      handoverCode: `HND-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${isDay ? 'D' : 'N'}-${Math.floor(Math.random() * 89 + 10)}`,
      mineId: 'mine-01',
      mineNameFa: 'مجتمع معدنی و سنگ‌آهن مرکزی (پیت شماره ۳)',
      departmentKey,
      departmentNameFa,
      shiftType,
      shiftTitleFa,
      shiftDateJalali: dateJalali,
      shiftDateGregorian: now.toISOString(),
      status: 'PLANNING_MEETING',

      meetingLocation: 'اتاق دیسپچینگ و مانیتورینگ مرکزی پیت ۳',
      meetingTime: isDay ? '۰۶:۴۵ صبح' : '۱۸:۴۵ عصر',
      meetingNotes: 'جلسه هماهنگی حضوری ارکان سه‌گانه پروژه در حال برگزاری است و دستورکارهای اولویت‌دار ثبت می‌شوند.',
      tripartiteReps: [
        {
          role: 'CLIENT',
          roleTitleFa: 'نماینده کارفرما (ناظر عالیه مجتمع)',
          organizationName: 'شرکت معدنی و صنعتی کارفرما',
          personName: 'مهندس محمودی',
          personnelCode: 'EMP-9021',
          presentInMeeting: true,
          notes: 'تاکید بر کنترل دقیق نرخ خوراک‌دهی سنگ‌شکن'
        },
        {
          role: 'SUPERVISION',
          roleTitleFa: 'دستگاه نظارت (مهندسین مشاور مقیم)',
          organizationName: 'مهندسین مشاور مهندسی معدن فراکاوش',
          personName: 'مهندس حسینی',
          personnelCode: 'SUP-4410',
          presentInMeeting: true,
          notes: 'رعایت پاشنه پله و عدم خروج از حدود مرز استخراج'
        },
        {
          role: 'CONTRACTOR',
          roleTitleFa: 'پیمانکار استخراج و باربری (مدیر کارگاه)',
          organizationName: 'شرکت پیمانکاری کوهساران البرز',
          personName: currentUser?.fullName || 'مهندس اکبری',
          personnelCode: currentUser?.code || 'CTR-8832',
          presentInMeeting: true,
          notes: 'تخصیص ناوگان باربری طبق برنامه زمان‌بندی'
        }
      ],

      drillingPriorities: [
        {
          id: `dp-auto-1`,
          priorityOrder: 1,
          blockCode: '1040-B-12',
          benchLevel: 1040,
          rockTypeFa: 'مگنتیت پرعیار توده‌ای',
          patternGrid: '۳.۵ × ۴.۰ متر',
          targetHoleCount: 40,
          targetDrillMeters: 480,
          assignedDrillRig: 'دریل‌واگن هیدرولیک DRL-01',
          specialInstructions: 'اتمام سریع چال‌ها برای خرج‌گذاری شیفت بعد',
          achievedDrillMeters: 0,
          achievedHoleCount: 0,
          fulfillmentPercent: 0
        },
        {
          id: `dp-auto-2`,
          priorityOrder: 2,
          blockCode: '1055-B-18',
          benchLevel: 1055,
          rockTypeFa: 'باطله متراکم هورنفلس',
          patternGrid: '۴.۰ × ۴.۵ متر',
          targetHoleCount: 25,
          targetDrillMeters: 375,
          assignedDrillRig: 'دریل هیدرولیک DRL-02',
          specialInstructions: 'پیشروی خط رمپ شمال‌غربی',
          achievedDrillMeters: 0,
          achievedHoleCount: 0,
          fulfillmentPercent: 0
        }
      ],

      loadingPriorities: [
        {
          id: `lp-auto-1`,
          priorityOrder: 1,
          blockCode: '1025-O-04',
          benchLevel: 1025,
          materialType: 'HIGH_GRADE_ORE',
          materialTypeFa: 'سنگ‌آهن پرعیار (Fe > 55%)',
          targetTonnage: 8000,
          assignedLoadingUnit: 'شاول کوماتسو PC-1250 (SHV-01)',
          allocatedTruckCount: 6,
          destination: 'سنگ‌شکن اولیه ژیراتوری',
          specialInstructions: 'جداسازی سنگ‌های بزرگ پای کار با پیکور',
          achievedTonnage: 0,
          achievedTripsCount: 0,
          fulfillmentPercent: 0
        },
        {
          id: `lp-auto-2`,
          priorityOrder: 2,
          blockCode: '1040-W-09',
          benchLevel: 1040,
          materialType: 'WASTE',
          materialTypeFa: 'باطله سخت',
          targetTonnage: 8500,
          assignedLoadingUnit: 'لودر کاترپیلار 988 (LDR-01)',
          allocatedTruckCount: 5,
          destination: 'دپوی باطله غربی',
          specialInstructions: 'کنترل سرعت مطمئنه در رمپ',
          achievedTonnage: 0,
          achievedTripsCount: 0,
          fulfillmentPercent: 0
        }
      ],

      activePlacements,

      upcomingBlasts: [
        {
          id: `ub-auto-1`,
          blockCode: '1040-B-12',
          benchLevel: 1040,
          drillPatternStatus: 'CHARGING_IN_PROGRESS',
          drillPatternStatusFa: 'در حال آماده‌سازی و خرج‌گذاری',
          plannedBlastTime: 'شیفت آینده - ساعت ۱۱:۳۰',
          explosiveType: 'آنفو + تقویت‌کننده پنتولیت',
          estimatedOreTonnage: 30000,
          safetyRadiusMeters: 550,
          supervisionClearance: true,
          clientClearance: true,
          contractorReady: true,
          statusNote: 'نقشه آتشباری مورد توافق هر ۳ رکن قرار گرفت.'
        }
      ],

      intraShiftSchedule: [
        {
          id: `iss-auto-1`,
          timeSlot: isDay ? '۰۷:۰۰ الی ۰۹:۰۰' : '۱۹:۰۰ الی ۲۱:۰۰',
          actionTitle: 'استقرار شاول و آغاز بارگیری بلوک پرعیار به سمت سنگ‌شکن',
          targetLocation: 'پله ۱۰۲۵',
          responsibleParty: 'سرپرست باربری پیمانکار',
          status: 'PLANNED'
        },
        {
          id: `iss-auto-2`,
          timeSlot: isDay ? '۰۹:۰۰ الی ۱۱:۳۰' : '۲۱:۰۰ الی ۲۳:۳۰',
          actionTitle: 'خردایش بولدرها با پیکور هیدرولیکی و آب‌پاشی رمپ‌های اصلی',
          targetLocation: 'پله ۱۰۲۵ و رمپ غربی',
          responsibleParty: 'اپراتور پیکور و واحد آب‌پاشی',
          status: 'PLANNED'
        },
        {
          id: `iss-auto-3`,
          timeSlot: isDay ? '۱۱:۳۰ الی ۱۵:۰۰' : '۲۳:۳۰ الی ۰۳:۰۰',
          actionTitle: 'تداوم بارگیری کانسنگ و باطله‌برداری و اتمام چال‌های حفاری',
          targetLocation: 'پله‌های ۱۰۲۵ و ۱۰۴۰',
          responsibleParty: 'تیم حفاری و باربری',
          status: 'PLANNED'
        },
        {
          id: `iss-auto-4`,
          timeSlot: isDay ? '۱۵:۰۰ الی ۱۹:۰۰' : '۰۳:۰۰ الی ۰۷:۰۰',
          actionTitle: 'ارزیابی تحقق اهداف، رصد شاخص‌ها و جلسه حضوری تحویل به شیفت بعد با امضای سه‌گانه',
          targetLocation: 'اتاق عملیات معدن',
          responsibleParty: 'نمایندگان کارفرما، نظارت و پیمانکار',
          status: 'PLANNED'
        }
      ],

      operationalMandates: [
        {
          id: `om-auto-1`,
          category: 'SAFETY_HSE',
          categoryFa: 'ایمنی و بهداشت HSE',
          directiveText: 'رعایت حداکثر سرعت ۳۰ کیلومتر بر ساعت در کلیه رمپ‌ها و توقف بارگیری هنگام آب‌پاشی مستقیم.',
          issuedByRole: 'SAFETY_OFFICER',
          issuedByName: 'افسر ارشد ایمنی',
          priority: 'MANDATORY',
          complianceStatus: 'COMPLIED'
        },
        {
          id: `om-auto-2`,
          category: 'GRADE_CONTROL',
          categoryFa: 'کنترل عیار زمین‌شناسی',
          directiveText: 'عدم ورود به ترانشه آلوده به باطله و حفظ عیار کانسنگ بالای ۵۴.۵ درصد.',
          issuedByRole: 'SUPERVISION',
          issuedByName: 'ناظر مقیم مشاور',
          priority: 'CRITICAL',
          complianceStatus: 'COMPLIED'
        }
      ],

      totalExtractionTons: 16500,
      totalWasteTons: 17000,
      totalHaulTrips: 330,
      averageFeGradePercent: 55.2,

      overallFulfillmentPercent: 0,
      drillingFulfillmentPercent: 0,
      loadingFulfillmentPercent: 0,
      blastingFulfillmentPercent: 0,
      mandatesCompliancePercent: 0,
      endShiftReviewSummary: 'شیفت در مرحله جلسه هماهنگی حضوری قرار دارد. رصد تحقق آیتم‌ها در پایان شیفت انجام خواهد شد.',

      tripartiteSignatures: {
        clientSignature: {
          signed: false,
          name: 'مهندس محمودی',
          organization: 'شرکت کارفرما',
          digitalFingerprint: ''
        },
        supervisionSignature: {
          signed: false,
          name: 'مهندس حسینی',
          organization: 'دستگاه نظارت مشاور',
          digitalFingerprint: ''
        },
        contractorSignature: {
          signed: false,
          name: currentUser?.fullName || 'مهندس اکبری',
          organization: 'پیمانکار استخراج',
          digitalFingerprint: ''
        },
        notifiedManagers: [
          {
            id: `mgr-init-1-${Date.now()}`,
            name: 'مهندس کمالی (مدیر کل مجتمع معدنی)',
            roleTitle: 'مدیر ارشد مجتمع',
            notifiedAt: now.toISOString(),
            viewed: false
          },
          {
            id: `mgr-init-2-${Date.now()}`,
            name: 'دکتر افشار (سرپرست کل مهندسی و برنامه‌ریزی)',
            roleTitle: 'سرپرست مهندسی معدن',
            notifiedAt: now.toISOString(),
            viewed: false
          }
        ]
      },

      goldenShiftDirective: 'تامین یکنواخت خوراک پرعیار سنگ‌شکن اولیه و ایمن‌سازی کامل شبکه چال‌های انفجاری پله ۱۰۴۰',
      activeBenches: [],
      equipmentStatuses: [],
      safetyLog: {
        hazardLevel: 'LOW',
        weatherCondition: 'هوای آرام و مساعد',
        roadCondition: 'رمپ‌ها تسطیح‌شده',
        wallStabilityStatus: 'پایدار',
        nearMissCount: 0,
        incidentsReported: 'بدون حادثه'
      },
      pendingTasks: [],
      outgoingSupervisor: {
        userId: currentUser?.id || 'AES-USER-01',
        fullName: currentUser?.fullName || 'مهندس اکبری',
        userCode: currentUser?.code || 'CTR-8832',
        roleId: 'MiningContractor',
        departmentFa: departmentNameFa,
        signedAt: now.toISOString(),
        digitalFingerprint: `AES-SIG-START-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    return newDraft;
  }
}
