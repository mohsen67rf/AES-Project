// src/modules/tasks/presentation/components/taskMapConstants.ts

export interface MineMapBench {
  level: string;
  nameFa: string;
  elevation: number;
  color: string;
  yMin: number;
  yMax: number;
}

export interface MineMapBlock {
  id: string;
  code: string;
  bench: string;
  type: 'ORE_HIGH' | 'ORE_MED' | 'ORE_LOW' | 'WASTE';
  gradeText: string;
  polygon: [number, number][]; // percentage [x, y]
  center: [number, number];
  areaM2: number;
  eastingUTM: number;
  northingUTM: number;
}

export const BENCHES: MineMapBench[] = [
  { level: '1060', nameFa: 'پله ۱۰۶۰ (تراز بالادست پیت)', elevation: 1060, color: '#F59E0B', yMin: 10, yMax: 28 },
  { level: '1050', nameFa: 'پله ۱۰۵۰ (پله میانی استخراج)', elevation: 1050, color: '#3B82F6', yMin: 28, yMax: 46 },
  { level: '1040', nameFa: 'پله ۱۰۴۰ (جبهه‌کار فعال اصلی)', elevation: 1040, color: '#00D2FF', yMin: 46, yMax: 66 },
  { level: '1030', nameFa: 'پله ۱۰۳۰ (کف پیت و زهکشی)', elevation: 1030, color: '#10B981', yMin: 66, yMax: 84 },
];

export const MINE_MAP_BLOCKS: MineMapBlock[] = [
  {
    id: 'block-1040-b33',
    code: '1040 B 33',
    bench: '1040',
    type: 'ORE_HIGH',
    gradeText: 'مگنتیت پرعیار Fe 61.8%',
    polygon: [[52, 48], [66, 48], [64, 60], [50, 60]],
    center: [58, 54],
    areaM2: 1850,
    eastingUTM: 642450,
    northingUTM: 3584320,
  },
  {
    id: 'block-1040-b32',
    code: '1040 B 32',
    bench: '1040',
    type: 'ORE_HIGH',
    gradeText: 'مگنتیت پرعیار Fe 62.4%',
    polygon: [[36, 48], [50, 48], [48, 60], [34, 60]],
    center: [42, 54],
    areaM2: 1900,
    eastingUTM: 642320,
    northingUTM: 3584280,
  },
  {
    id: 'block-1040-b12',
    code: '1040 B 12',
    bench: '1040',
    type: 'ORE_MED',
    gradeText: 'متوسط‌عیار Fe 52.0%',
    polygon: [[20, 50], [32, 50], [30, 61], [18, 61]],
    center: [25, 55.5],
    areaM2: 1550,
    eastingUTM: 642100,
    northingUTM: 3584210,
  },
  {
    id: 'block-1050-b15',
    code: '1050 B 15',
    bench: '1050',
    type: 'ORE_MED',
    gradeText: 'مگنتیت Fe 54.1%',
    polygon: [[38, 32], [52, 32], [50, 43], [36, 43]],
    center: [44, 37.5],
    areaM2: 1750,
    eastingUTM: 642380,
    northingUTM: 3584420,
  },
  {
    id: 'block-1060-w08',
    code: '1060 W 08',
    bench: '1060',
    type: 'WASTE',
    gradeText: 'باطله رگه‌ای Fe 14.5%',
    polygon: [[45, 14], [60, 14], [58, 25], [43, 25]],
    center: [51, 19.5],
    areaM2: 2100,
    eastingUTM: 642400,
    northingUTM: 3584550,
  },
];
