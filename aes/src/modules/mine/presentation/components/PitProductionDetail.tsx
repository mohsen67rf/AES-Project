// src/modules/mine/presentation/components/PitProductionDetail.tsx

import { useState, useEffect } from 'react';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { Pit } from '../../../../core/domain/types/mine.types';
import { PitRepository } from '../../../../core/infrastructure/repositories';

// ============================================
// نوع‌های داده
// ============================================

export interface PitProductionData {
  pitId: string;
  pitName: string;
  pitCode: string;
  production: {
    ironOre: {
      planned: number;
      actual: number;
      dailyAverage: number;
    };
    wasteRock: {
      planned: number;
      actual: number;
      dailyAverage: number;
    };
    wasteAlluvial: {
      planned: number;
      actual: number;
      dailyAverage: number;
    };
  };
  monthlyProgress: {
    week: string;
    ironOre: number;
    wasteRock: number;
    wasteAlluvial: number;
  }[];
}

// ============================================
// تولید داده‌های فرضی برای یک پیت بر اساس نام و کد
// ============================================

const generateMockDataForPit = (pit: Pit): PitProductionData => {
  // استفاده از id پیت به عنوان seed برای تولید اعداد ثابت
  const seed = pit.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed * 100 + (min + max)) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  // تولید اعداد واقع‌گرایانه بر اساس نام پیت
  const baseIron = pit.name.includes('شمالی') ? 1800 : 
                   pit.name.includes('جنوبی') ? 1500 : 
                   pit.name.includes('شرقی') ? 1200 : 1000;
  
  const ironOrePlanned = random(baseIron - 200, baseIron + 200);
  const ironOreActual = random(Math.floor(ironOrePlanned * 0.4), Math.floor(ironOrePlanned * 0.85));
  
  const wasteRockPlanned = random(400, 1400);
  const wasteRockActual = random(Math.floor(wasteRockPlanned * 0.3), Math.floor(wasteRockPlanned * 0.7));
  
  const wasteAlluvialPlanned = random(200, 700);
  const wasteAlluvialActual = random(Math.floor(wasteAlluvialPlanned * 0.2), Math.floor(wasteAlluvialPlanned * 0.6));

  // داده‌های پیشرفت هفتگی (۴ هفته)
  const weeks = ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴'];
  const monthlyProgress = weeks.map((week, index) => {
    const progressFactor = (index + 1) / 4;
    return {
      week,
      ironOre: Math.min(Math.round((ironOreActual / ironOrePlanned) * 100 * (0.6 + progressFactor * 0.4)), 100),
      wasteRock: Math.min(Math.round((wasteRockActual / wasteRockPlanned) * 100 * (0.5 + progressFactor * 0.5)), 100),
      wasteAlluvial: Math.min(Math.round((wasteAlluvialActual / wasteAlluvialPlanned) * 100 * (0.4 + progressFactor * 0.6)), 100),
    };
  });

  return {
    pitId: pit.id,
    pitName: pit.name,
    pitCode: pit.code,
    production: {
      ironOre: {
        planned: ironOrePlanned,
        actual: ironOreActual,
        dailyAverage: Math.round(ironOreActual / 22),
      },
      wasteRock: {
        planned: wasteRockPlanned,
        actual: wasteRockActual,
        dailyAverage: Math.round(wasteRockActual / 22),
      },
      wasteAlluvial: {
        planned: wasteAlluvialPlanned,
        actual: wasteAlluvialActual,
        dailyAverage: Math.round(wasteAlluvialActual / 22),
      },
    },
    monthlyProgress,
  };
};

// ============================================
// محاسبه مجموع داده‌های چند پیت
// ============================================

const aggregatePitData = (pitData: PitProductionData[]): PitProductionData | null => {
  if (pitData.length === 0) return null;

  const first = pitData[0];
  const result: PitProductionData = {
    pitId: 'all',
    pitName: 'همه پیت‌ها',
    pitCode: 'ALL',
    production: {
      ironOre: { planned: 0, actual: 0, dailyAverage: 0 },
      wasteRock: { planned: 0, actual: 0, dailyAverage: 0 },
      wasteAlluvial: { planned: 0, actual: 0, dailyAverage: 0 },
    },
    monthlyProgress: first.monthlyProgress.map((week, index) => ({
      week: week.week,
      ironOre: 0,
      wasteRock: 0,
      wasteAlluvial: 0,
    })),
  };

  pitData.forEach(pit => {
    result.production.ironOre.planned += pit.production.ironOre.planned;
    result.production.ironOre.actual += pit.production.ironOre.actual;
    result.production.ironOre.dailyAverage += pit.production.ironOre.dailyAverage;
    
    result.production.wasteRock.planned += pit.production.wasteRock.planned;
    result.production.wasteRock.actual += pit.production.wasteRock.actual;
    result.production.wasteRock.dailyAverage += pit.production.wasteRock.dailyAverage;
    
    result.production.wasteAlluvial.planned += pit.production.wasteAlluvial.planned;
    result.production.wasteAlluvial.actual += pit.production.wasteAlluvial.actual;
    result.production.wasteAlluvial.dailyAverage += pit.production.wasteAlluvial.dailyAverage;

    result.monthlyProgress.forEach((week, idx) => {
      week.ironOre += pit.monthlyProgress[idx].ironOre;
      week.wasteRock += pit.monthlyProgress[idx].wasteRock;
      week.wasteAlluvial += pit.monthlyProgress[idx].wasteAlluvial;
    });
  });

  // محاسبه میانگین پیشرفت‌ها
  result.monthlyProgress.forEach(week => {
    week.ironOre = Math.min(Math.round(week.ironOre / pitData.length), 100);
    week.wasteRock = Math.min(Math.round(week.wasteRock / pitData.length), 100);
    week.wasteAlluvial = Math.min(Math.round(week.wasteAlluvial / pitData.length), 100);
  });

  return result;
};

// ============================================
// کامپوننت نوار پیشرفت
// ============================================

function ProgressBar({ 
  value, 
  max, 
  color, 
  label, 
  isDark 
}: { 
  value: number; 
  max: number; 
  color: string; 
  label: string;
  isDark: boolean;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const isComplete = percentage >= 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}>{label}</span>
        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {value.toLocaleString()} / {max.toLocaleString()} تن
          <span className={`mr-2 text-[10px] ${isComplete ? 'text-green-400' : isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
            ({Math.round(percentage)}%)
          </span>
        </span>
      </div>
      <div className="relative w-full h-2 rounded-full overflow-hidden bg-gray-700/20">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${percentage}%`,
            background: isComplete 
              ? `linear-gradient(90deg, ${color}, #22C55E)` 
              : `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: isComplete ? '0 0 10px rgba(34, 197, 94, 0.3)' : 'none',
          }}
        />
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-end pr-1">
            <span className="text-[8px] font-bold text-white">✅</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// کامپوننت نمودار پیشرفت هفتگی
// ============================================

function WeeklyProgressChart({ 
  data, 
  isDark 
}: { 
  data: PitProductionData['monthlyProgress']; 
  isDark: boolean;
}) {
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.ironOre, d.wasteRock, d.wasteAlluvial)),
    100
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px]">
        <span className={isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}>پیشرفت تجمعی ماهانه (%)</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#C9A227]" />
            <span className={isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}>سنگ آهن</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
            <span className={isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}>باطله سنگی</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4ECDC4]" />
            <span className={isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}>باطله آبرفتی</span>
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between h-32 gap-4">
        {data.map((week, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-1 w-full h-24">
              <div 
                className="flex-1 rounded-t transition-all duration-700 hover:opacity-80"
                style={{ 
                  height: `${(week.ironOre / maxValue) * 100}%`,
                  background: `linear-gradient(180deg, #C9A227, #A07A15)`,
                  minHeight: '4px',
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-[8px] font-bold text-white opacity-0 hover:opacity-100 transition-opacity">
                    {week.ironOre}%
                  </span>
                </div>
              </div>
              <div 
                className="flex-1 rounded-t transition-all duration-700 hover:opacity-80"
                style={{ 
                  height: `${(week.wasteRock / maxValue) * 100}%`,
                  background: `linear-gradient(180deg, #FF6B6B, #CC4444)`,
                  minHeight: '4px',
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-[8px] font-bold text-white opacity-0 hover:opacity-100 transition-opacity">
                    {week.wasteRock}%
                  </span>
                </div>
              </div>
              <div 
                className="flex-1 rounded-t transition-all duration-700 hover:opacity-80"
                style={{ 
                  height: `${(week.wasteAlluvial / maxValue) * 100}%`,
                  background: `linear-gradient(180deg, #4ECDC4, #2EA89E)`,
                  minHeight: '4px',
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-[8px] font-bold text-white opacity-0 hover:opacity-100 transition-opacity">
                    {week.wasteAlluvial}%
                  </span>
                </div>
              </div>
            </div>
            <span className={`text-[9px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
              {week.week}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// کامپوننت اصلی تولید پیت (با Props اصلاح شده)
// ============================================

interface PitProductionDetailProps {
  mineId?: string;  // ✅ اضافه شد
  pitId?: string;
}

export function PitProductionDetail({ mineId, pitId }: PitProductionDetailProps) {
  const { isDark } = useTheme();
  const [selectedPitId, setSelectedPitId] = useState<string>(pitId || 'all');
  const [pitDataList, setPitDataList] = useState<PitProductionData[]>([]);
  const [allPits, setAllPits] = useState<Pit[]>([]);

  // ============================================
  // بارگذاری پیت‌ها و تولید داده‌ها
  // ============================================

  useEffect(() => {
    let pits: Pit[] = [];
    
    if (mineId) {
      pits = PitRepository.findBy('mineId', mineId);
    } else {
      pits = PitRepository.getAll();
    }

    setAllPits(pits);

    // تولید داده‌های فرضی برای هر پیت
    const data = pits.map(pit => generateMockDataForPit(pit));
    setPitDataList(data);

    // اگر pitId مشخص شده و وجود دارد، آن را انتخاب کن
    if (pitId && pits.some(p => p.id === pitId)) {
      setSelectedPitId(pitId);
    }
  }, [mineId, pitId]);

  // ============================================
  // دریافت داده‌های نمایشی
  // ============================================

  const getDisplayData = (): PitProductionData | null => {
    if (selectedPitId === 'all') {
      return aggregatePitData(pitDataList);
    }
    return pitDataList.find(p => p.pitId === selectedPitId) || null;
  };

  const displayData = getDisplayData();

  // ============================================
  // وضعیت بارگذاری
  // ============================================

  if (pitDataList.length === 0) {
    return (
      <div className={`text-center py-8 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
        <p className="text-sm">هیچ پیتی برای نمایش وجود ندارد</p>
        <p className="text-xs mt-1">لطفاً ابتدا یک پیت ایجاد کنید</p>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className={`text-center py-8 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>
        داده‌ای برای نمایش وجود ندارد
      </div>
    );
  }

  const { production, monthlyProgress } = displayData;

  return (
    <div className="space-y-6">
      {/* ===== انتخاب پیت ===== */}
      <div className="flex items-center gap-3">
        <select
          value={selectedPitId}
          onChange={(e) => setSelectedPitId(e.target.value)}
          className={`px-4 py-2 rounded-xl border text-sm focus:outline-none ${
            isDark 
              ? 'bg-[#0A1628] border-[#AACCDD]/10 text-white focus:border-[#00D4FF]/50' 
              : 'bg-gray-100 border-gray-200 text-gray-800 focus:border-[#C9A227]/50'
          }`}
        >
          <option value="all">همه پیت‌ها</option>
          {allPits.map(pit => (
            <option key={pit.id} value={pit.id}>
              {pit.name} ({pit.code})
            </option>
          ))}
        </select>
        {selectedPitId !== 'all' && (
          <span className={`text-xs ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
            {allPits.find(p => p.id === selectedPitId)?.code}
          </span>
        )}
        <span className={`text-xs ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
          {pitDataList.length} پیت
        </span>
      </div>

      {/* ===== کارت‌های تولید به تفکیک جنس ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* سنگ آهن */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0A1628] border border-[#C9A227]/20' : 'bg-gray-50 border border-[#C9A227]/20'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-6 rounded-full bg-[#C9A227]" />
            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              سنگ آهن
            </h4>
            <span className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
              (میانگین روزانه: {production.ironOre.dailyAverage.toLocaleString()} تن)
            </span>
          </div>
          <ProgressBar 
            value={production.ironOre.actual}
            max={production.ironOre.planned}
            color="#C9A227"
            label="تولید واقعی"
            isDark={isDark}
          />
        </div>

        {/* باطله سنگی */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0A1628] border border-[#FF6B6B]/20' : 'bg-gray-50 border border-[#FF6B6B]/20'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-6 rounded-full bg-[#FF6B6B]" />
            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              باطله سنگی
            </h4>
            <span className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
              (میانگین روزانه: {production.wasteRock.dailyAverage.toLocaleString()} تن)
            </span>
          </div>
          <ProgressBar 
            value={production.wasteRock.actual}
            max={production.wasteRock.planned}
            color="#FF6B6B"
            label="تولید واقعی"
            isDark={isDark}
          />
        </div>

        {/* باطله آبرفتی */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0A1628] border border-[#4ECDC4]/20' : 'bg-gray-50 border border-[#4ECDC4]/20'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-6 rounded-full bg-[#4ECDC4]" />
            <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              باطله آبرفتی
            </h4>
            <span className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>
              (میانگین روزانه: {production.wasteAlluvial.dailyAverage.toLocaleString()} تن)
            </span>
          </div>
          <ProgressBar 
            value={production.wasteAlluvial.actual}
            max={production.wasteAlluvial.planned}
            color="#4ECDC4"
            label="تولید واقعی"
            isDark={isDark}
          />
        </div>
      </div>

      {/* ===== خلاصه تولید ===== */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0A1628] border border-[#AACCDD]/10' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>کل تولید</p>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {(production.ironOre.actual + production.wasteRock.actual + production.wasteAlluvial.actual).toLocaleString()} تن
            </p>
          </div>
          <div>
            <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>برنامه ماهانه</p>
            <p className={`text-lg font-bold ${isDark ? 'text-[#C9A227]' : 'text-[#C9A227]'}`}>
              {(production.ironOre.planned + production.wasteRock.planned + production.wasteAlluvial.planned).toLocaleString()} تن
            </p>
          </div>
          <div>
            <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>پیشرفت کل</p>
            <p className={`text-lg font-bold ${isDark ? 'text-[#00D4FF]' : 'text-[#1A2A3A]'}`}>
              {Math.round(
                ((production.ironOre.actual + production.wasteRock.actual + production.wasteAlluvial.actual) /
                (production.ironOre.planned + production.wasteRock.planned + production.wasteAlluvial.planned)) * 100
              )}%
            </p>
          </div>
          <div>
            <p className={`text-[10px] ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>میانگین روزانه</p>
            <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {(production.ironOre.dailyAverage + production.wasteRock.dailyAverage + production.wasteAlluvial.dailyAverage).toLocaleString()} تن
            </p>
          </div>
        </div>
      </div>

      {/* ===== نمودار پیشرفت تجمعی هفتگی ===== */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0A1628] border border-[#AACCDD]/10' : 'bg-gray-50 border border-gray-200'}`}>
        <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
          📈 پیشرفت تجمعی ماهانه به تفکیک جنس سنگ
        </h4>
        <WeeklyProgressChart data={monthlyProgress} isDark={isDark} />
        
        {/* جدول جزئیات پیشرفت */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-[#AACCDD]/10' : 'border-gray-200'}`}>
                <th className={`px-3 py-2 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>هفته</th>
                <th className={`px-3 py-2 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>سنگ آهن</th>
                <th className={`px-3 py-2 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>باطله سنگی</th>
                <th className={`px-3 py-2 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>باطله آبرفتی</th>
                <th className={`px-3 py-2 ${isDark ? 'text-[#4A6A8A]' : 'text-gray-400'}`}>میانگین</th>
              </tr>
            </thead>
            <tbody>
              {monthlyProgress.map((week, index) => (
                <tr key={index} className={`border-b ${isDark ? 'border-[#AACCDD]/5' : 'border-gray-100'}`}>
                  <td className={`px-3 py-2 ${isDark ? 'text-[#8A9DB0]' : 'text-gray-500'}`}>{week.week}</td>
                  <td className={`px-3 py-2 font-medium text-[#C9A227]`}>{week.ironOre}%</td>
                  <td className={`px-3 py-2 font-medium text-[#FF6B6B]`}>{week.wasteRock}%</td>
                  <td className={`px-3 py-2 font-medium text-[#4ECDC4]`}>{week.wasteAlluvial}%</td>
                  <td className={`px-3 py-2 font-medium ${isDark ? 'text-[#00D4FF]' : 'text-[#1A2A3A]'}`}>
                    {Math.round((week.ironOre + week.wasteRock + week.wasteAlluvial) / 3)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}