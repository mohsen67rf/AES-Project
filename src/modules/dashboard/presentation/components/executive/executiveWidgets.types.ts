// src/modules/dashboard/presentation/components/executive/executiveWidgets.types.ts

export type ExecutiveWidgetCategory = 
  | 'ALL'
  | 'EXTRACTION'      // استخراج و لیتولوژی
  | 'PROCESSING'      // دپو، خردایش و عیار
  | 'FLEET_WASTE'     // باطله‌برداری و ناوگان
  | 'FINANCE_PLAN'    // مالی، بهای تمام‌شده و برنامه
  | 'SAFETY_ENV';     // ایمنی، پایداری دیواره و محیط‌زیست

export interface ExecutiveWidgetConfig {
  id: string;
  titleFa: string;
  titleEn: string;
  subtitleFa: string;
  category: ExecutiveWidgetCategory;
  defaultVisible: boolean;
  priority: number;
  badgeFa?: string;
  gridSpan: 'full' | 'half' | 'third';
}

export const EXECUTIVE_WIDGETS_CONFIG: ExecutiveWidgetConfig[] = [
  {
    id: 'stockpile_inventory',
    titleFa: 'موجودی و کیفیت دپوهای ماده معدنی',
    titleEn: 'Ore Stockpile Inventory & Blending',
    subtitleFa: 'پایش تناژ زنده، درصد پرشدگی، عیار وزنی آهن و بافر تغذیه کارخانه کنسانتره',
    category: 'PROCESSING',
    defaultVisible: true,
    priority: 1,
    badgeFa: 'حیاتی کارفرما',
    gridSpan: 'half',
  },
  {
    id: 'extraction_by_rock',
    titleFa: 'میزان استخراج به تفکیک جنس سنگ و لیتولوژی',
    titleEn: 'Extraction by Rock Type & Lithology',
    subtitleFa: 'تفکیک تناژ روزانه مگنتیت توده‌ای، هماتیت، اسکارن و باطله نسبت به برنامه مصوب',
    category: 'EXTRACTION',
    defaultVisible: true,
    priority: 2,
    badgeFa: 'زنده شیفت',
    gridSpan: 'half',
  },
  {
    id: 'stripping_ratio_trend',
    titleFa: 'نسبت باطله‌برداری دوره‌ای (Strip Ratio)',
    titleEn: 'Stripping Ratio (W:O) Trend & Variance',
    subtitleFa: 'پایش نسبت باطله به کانسنگ دوره‌ای، انحراف از طرح اقتصادی LOM و ریسک آزادسازی جبهه‌کار',
    category: 'FLEET_WASTE',
    defaultVisible: true,
    priority: 3,
    badgeFa: 'شاخص راهبردی',
    gridSpan: 'half',
  },
  {
    id: 'crusher_feed_grade',
    titleFa: 'پایش عیار خوراک سنگ‌شکن و بازیابی متالورژی',
    titleEn: 'Crusher Feed Grade & Plant Recovery',
    subtitleFa: 'عیار ساعتی Fe% ورودی سنگ‌شکن در مقایسه با تارگت قرارداد و کنترل عناصر مزاحم (P, S, SiO2)',
    category: 'PROCESSING',
    defaultVisible: true,
    priority: 4,
    badgeFa: 'کنترل کیفیت',
    gridSpan: 'half',
  },
  {
    id: 'fleet_oee_utilization',
    titleFa: 'راندمان، دسترس‌پذیری و زمان چرخه ناوگان',
    titleEn: 'Fleet OEE, Availability & Haul Cycles',
    subtitleFa: 'نرخ آمادگی شاول‌ها، دامپ‌تراک‌ها و دریل‌ها، میانگین زمان چرخه حمل و تن-کیلومتر شیفت',
    category: 'FLEET_WASTE',
    defaultVisible: true,
    priority: 5,
    badgeFa: 'عملیات و لجستیک',
    gridSpan: 'half',
  },
  {
    id: 'unit_cost_revenue',
    titleFa: 'بهای تمام‌شده هر تن استخراج و شاخص‌های مالی',
    titleEn: 'Unit Mining Cost (OPEX) & Revenue',
    subtitleFa: 'هزینه تمام‌شده بر تن کانسنگ و مترمکعب باطله، درآمد تخمینی فروش و انحراف از بودجه مصوب',
    category: 'FINANCE_PLAN',
    defaultVisible: true,
    priority: 6,
    badgeFa: 'مدیریت مالی',
    gridSpan: 'half',
  },
  {
    id: 'slope_stability_safety',
    titleFa: 'پایداری دیواره پیت، ژئوتکنیک و ایمنی (HSE)',
    titleEn: 'Pit Slope Stability & Safety Radar',
    subtitleFa: 'پایش نرخ جابجایی دیواره‌ها با منشورهای اپتیکی/رادار، سطح آب زیرزمینی و ساعات بدون حادثه',
    category: 'SAFETY_ENV',
    defaultVisible: true,
    priority: 7,
    badgeFa: 'ایمنی و پایداری',
    gridSpan: 'half',
  },
  {
    id: 'drill_blast_broken_ore',
    titleFa: 'بیلان مواد ناریه، خرج ویژه و کانسنگ آماده بارگیری',
    titleEn: 'Drill & Blast Inventory & Broken Ore Stock',
    subtitleFa: 'خرج ویژه مصرفی (kg/ton)، موجودی انبار مواد منفجره و تناژ خردشده آماده شاول در پله‌ها',
    category: 'EXTRACTION',
    defaultVisible: true,
    priority: 8,
    badgeFa: 'آتشباری و چال‌ها',
    gridSpan: 'half',
  },
  {
    id: 'mining_plan_compliance',
    titleFa: 'انطباق پیشرفت با طرح استخراج کوتاه‌مدت و بلندمدت',
    titleEn: 'Mining Plan Compliance & Bench Progress',
    subtitleFa: 'درصد تحقق برنامه زمان‌بندی ماهانه، پیشرفت پله‌ها و گانت تحقق اهداف قراردادی کارفرما',
    category: 'FINANCE_PLAN',
    defaultVisible: true,
    priority: 9,
    badgeFa: 'برنامه‌ریزی معدن',
    gridSpan: 'half',
  },
  {
    id: 'tailings_environmental',
    titleFa: 'پایش باطله‌گاه‌ها، زهکشی و الزامات زیست‌محیطی',
    titleEn: 'Waste Dumps Capacity & Environmental KPI',
    subtitleFa: 'ظرفیت باقیمانده دپوهای باطله ۱ و ۲، شاخص آب‌بندی و پاشش آب مهار غبار جاده‌های معدن',
    category: 'SAFETY_ENV',
    defaultVisible: false,
    priority: 10,
    badgeFa: 'محیط زیست',
    gridSpan: 'half',
  },
  {
    id: 'shift_workforce_productivity',
    titleFa: 'بهره‌وری نیروی انسانی و عملکرد شیفت‌های کاری',
    titleEn: 'Workforce Productivity & Shift Analysis',
    subtitleFa: 'تناژ استخراجی به ازای هر نفر-ساعت، حضور پرسنل عملیاتی و راندمان اپراتورهای تجهیزات سنگین',
    category: 'FINANCE_PLAN',
    defaultVisible: false,
    priority: 11,
    badgeFa: 'منابع انسانی',
    gridSpan: 'half',
  },
  {
    id: 'strategic_manager_alerts',
    titleFa: 'هشدارهای راهبردی و گلوگاه‌های تصمیم‌گیری کارفرما',
    titleEn: 'Executive Strategic Alerts & Bottlenecks',
    subtitleFa: 'شناسایی هوشمند افت عیار، کاهش بافر دپوها، انحراف باطله‌برداری و تأخیر در آزادسازی پله‌ها',
    category: 'ALL',
    defaultVisible: true,
    priority: 12,
    badgeFa: 'هوشمند AI',
    gridSpan: 'full',
  }
];

export interface PresetProfile {
  id: string;
  nameFa: string;
  nameEn: string;
  descFa: string;
  widgetIds: string[];
  icon: string;
}

export const PRESET_PROFILES: PresetProfile[] = [
  {
    id: 'executive_all',
    nameFa: 'نمای جامع مدیر عامل و کارفرما',
    nameEn: 'Executive Overview (All Key KPIs)',
    descFa: 'نمایش تمامی شاخص‌های کلان تولید، کیفیت، باطله، مالی، ناوگان و پایداری',
    widgetIds: [
      'stockpile_inventory',
      'extraction_by_rock',
      'stripping_ratio_trend',
      'crusher_feed_grade',
      'fleet_oee_utilization',
      'unit_cost_revenue',
      'slope_stability_safety',
      'drill_blast_broken_ore',
      'mining_plan_compliance',
      'strategic_manager_alerts'
    ],
    icon: 'briefcase'
  },
  {
    id: 'quality_ore_focus',
    nameFa: 'تمرکز بر کیفیت، دپو و عیار کانسنگ',
    nameEn: 'Quality, Stockpiles & Grade Blending',
    descFa: 'ویژه‌ی تصمیم‌گیری در خصوص کنترل کیفیت، عیار خوراک سنگ‌شکن و موجودی دپوهای ماده معدنی',
    widgetIds: [
      'stockpile_inventory',
      'crusher_feed_grade',
      'extraction_by_rock',
      'strategic_manager_alerts'
    ],
    icon: 'sparkles'
  },
  {
    id: 'mining_stripping_fleet',
    nameFa: 'تمرکز بر استخراج، باطله‌برداری و ناوگان',
    nameEn: 'Mining, Stripping & Fleet Operations',
    descFa: 'ویژه‌ی مدیریت باطله‌برداری، نسبت W:O، راندمان ماشین‌آلات و آتشباری',
    widgetIds: [
      'stripping_ratio_trend',
      'extraction_by_rock',
      'fleet_oee_utilization',
      'drill_blast_broken_ore',
      'mining_plan_compliance'
    ],
    icon: 'truck'
  },
  {
    id: 'financial_cost_focus',
    nameFa: 'تحلیل مالی، بهای تمام‌شده و انطباق طرح',
    nameEn: 'Cost per Ton, Financials & Plan Progress',
    descFa: 'بررسی هزینه‌های تمام‌شده استخراج، درآمد فروش و درصد تحقق برنامه‌های زمان‌بندی',
    widgetIds: [
      'unit_cost_revenue',
      'mining_plan_compliance',
      'shift_workforce_productivity',
      'strategic_manager_alerts'
    ],
    icon: 'currency'
  },
  {
    id: 'safety_stability_env',
    nameFa: 'ایمنی، پایداری دیواره پیت و محیط‌زیست',
    nameEn: 'Pit Slope Stability, Safety & Environment',
    descFa: 'پایش جابجایی دیواره‌ها، ایمنی پیت، سدهای باطله و الزامات HSE',
    widgetIds: [
      'slope_stability_safety',
      'tailings_environmental',
      'strategic_manager_alerts'
    ],
    icon: 'shield'
  }
];
