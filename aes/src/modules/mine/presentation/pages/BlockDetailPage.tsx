// src/modules/mine/presentation/pages/BlockDetailPage.tsx

import { useState, useEffect } from 'react';
import { 
  ArrowPathIcon, 
  ChevronRightIcon,
  DocumentPlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../shared/context/ThemeContext';
import { DrillingMap } from '../components/DrillingMap';
import { DailyDrillingForm } from '../components/DailyDrillingForm';
import { Block, DrillingPoint, SubBlock } from '../types';

// ============================================
// سرویس‌های دیتابیس محلی
// ============================================

const BLOCKS_KEY = 'aes_blocks';
const SUBBLOCKS_KEY = 'aes_subblocks';
const DRILLING_POINTS_KEY = 'aes_drilling_points';

function getBlockById(id: string): Block | null {
  try {
    const data = localStorage.getItem(BLOCKS_KEY);
    const blocks: Block[] = data ? JSON.parse(data) : [];
    return blocks.find(b => b.id === id) || null;
  } catch {
    return null;
  }
}

function getDrillingPoints(blockId: string): DrillingPoint[] {
  try {
    const data = localStorage.getItem(DRILLING_POINTS_KEY);
    const points: DrillingPoint[] = data ? JSON.parse(data) : [];
    return points.filter(p => p.blockId === blockId);
  } catch {
    return [];
  }
}

function getSubBlocks(blockId: string): SubBlock[] {
  try {
    const data = localStorage.getItem(SUBBLOCKS_KEY);
    const subBlocks: SubBlock[] = data ? JSON.parse(data) : [];
    return subBlocks.filter(sb => sb.blockId === blockId);
  } catch {
    return [];
  }
}

function saveDrillingPoints(points: DrillingPoint[]): void {
  localStorage.setItem(DRILLING_POINTS_KEY, JSON.stringify(points));
}

// ============================================
// کامپوننت اصلی
// ============================================

interface BlockDetailPageProps {
  blockId: string;
  onBack?: () => void;
}

export function BlockDetailPage({ blockId, onBack }: BlockDetailPageProps) {
  const { isDark } = useTheme();
  const [block, setBlock] = useState<Block | null>(null);
  const [drillingPoints, setDrillingPoints] = useState<DrillingPoint[]>([]);
  const [subBlocks, setSubBlocks] = useState<SubBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrillingForm, setShowDrillingForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'drilling' | 'subblocks'>('info');

  const loadData = () => {
    const blockData = getBlockById(blockId);
    setBlock(blockData);
    if (blockData) {
      setDrillingPoints(getDrillingPoints(blockData.id));
      setSubBlocks(getSubBlocks(blockData.id));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [blockId]);

  // ===== به‌روزرسانی عمق یک چال =====
  const handleDepthUpdate = (pointId: string, newDepth: number) => {
    const updatedPoints = drillingPoints.map(p => {
      if (p.id === pointId) {
        const today = new Date().toISOString().split('T')[0];
        const newProgress = {
          date: today,
          depth: newDepth,
          shift: 'MORNING' as const,
          operator: 'سیستم',
          meterage: newDepth - (p.finalDepth || 0),
        };
        
        return {
          ...p,
          finalDepth: newDepth,
          status: newDepth >= p.designDepth ? 'COMPLETED' : 'DRILLING',
          dailyProgress: [...(p.dailyProgress || []), newProgress],
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    setDrillingPoints(updatedPoints);
    saveDrillingPoints(updatedPoints);
  };

  // ===== ثبت پیشرفت روزانه =====
  const handleDailyProgress = () => {
    setShowDrillingForm(false);
    loadData();
  };

  const mapPoints = drillingPoints.map(p => ({
    ...p,
    location: { x: p.location.x, y: p.location.y }
  }));

  const totalPoints = drillingPoints.length;
  const completedPoints = drillingPoints.filter(p => p.status === 'COMPLETED').length;
  const collapsedPoints = drillingPoints.filter(p => p.status === 'COLLAPSED').length;
  const progressPercent = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;
  const totalMeterage = drillingPoints.reduce((sum, p) => sum + (p.finalDepth || 0), 0);

  const bgPrimary = isDark ? 'bg-[#0A1628]' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-[#8A9DB0]' : 'text-gray-500';
  const borderColor = isDark ? 'border-[#AACCDD]/10' : 'border-gray-200';

  if (loading) {
    return <div className={`flex items-center justify-center h-64 ${textSecondary}`}>در حال بارگذاری...</div>;
  }

  if (!block) {
    return <div className={`flex items-center justify-center h-64 text-red-400`}>بلوک مورد نظر یافت نشد!</div>;
  }

  return (
    <div className={`${bgPrimary} min-h-screen p-6 transition-colors duration-300`}>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* ===== هدر ===== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack} 
                className={`p-2 rounded-xl transition-colors ${
                  isDark 
                    ? 'bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD]' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>بلوک {block.code}</h2>
              <p className={`text-sm ${textSecondary}`}>
                تراز: {block.targetLevel} | شماره: {block.blockNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
              block.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              block.status === 'DRILLING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              block.status === 'DRILLED' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              'bg-gray-500/20 text-gray-400 border-gray-500/30'
            }`}>
              {block.status}
            </span>
            <button 
              onClick={loadData} 
              className={`p-2 rounded-xl transition-colors ${
                isDark 
                  ? 'bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD]' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===== تب‌ها ===== */}
        <div className={`flex gap-2 border-b ${borderColor} pb-2`}>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              activeTab === 'info'
                ? isDark ? 'bg-[#AACCDD]/20 text-[#AACCDD]' : 'bg-gray-200 text-gray-800'
                : isDark ? 'text-[#8A9DB0] hover:text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            📋 اطلاعات بلوک
          </button>
          <button
            onClick={() => setActiveTab('drilling')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              activeTab === 'drilling'
                ? isDark ? 'bg-[#AACCDD]/20 text-[#AACCDD]' : 'bg-gray-200 text-gray-800'
                : isDark ? 'text-[#8A9DB0] hover:text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            🔨 حفاری
          </button>
          <button
            onClick={() => setActiveTab('subblocks')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              activeTab === 'subblocks'
                ? isDark ? 'bg-[#AACCDD]/20 text-[#AACCDD]' : 'bg-gray-200 text-gray-800'
                : isDark ? 'text-[#8A9DB0] hover:text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            📦 SubBlock‌ها ({subBlocks.length})
          </button>
        </div>

        {/* ===== تب اطلاعات ===== */}
        {activeTab === 'info' && (
          <div className={`p-4 rounded-xl border ${borderColor} ${isDark ? 'bg-[#13203A]/40' : 'bg-white/60'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${textSecondary}`}>کد بلوک</p>
                <p className={`text-lg font-mono font-bold ${textPrimary}`}>{block.code}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary}`}>تراز هدف</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{block.targetLevel}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary}`}>شماره بلوک</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{block.blockNumber}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary}`}>تعداد چال‌ها</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{block.drillingParams?.totalHoles || 0}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary}`}>میانگین عمق طراحی</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{block.drillingParams?.avgDesignDepth || 0} متر</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary}`}>قطر حفاری</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{block.drillingParams?.holeDiameter || 0} mm</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== تب حفاری ===== */}
        {activeTab === 'drilling' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border ${borderColor} ${isDark ? 'bg-[#13203A]/40' : 'bg-white/60'}`}>
                <p className={`text-sm ${textSecondary}`}>پیشرفت حفاری</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{progressPercent.toFixed(1)}%</p>
                <p className={`text-xs ${textSecondary}`}>{completedPoints} از {totalPoints} چال</p>
              </div>
              <div className={`p-4 rounded-xl border ${borderColor} ${isDark ? 'bg-[#13203A]/40' : 'bg-white/60'}`}>
                <p className={`text-sm ${textSecondary}`}>مجموع متراژ</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{totalMeterage.toFixed(1)}</p>
                <p className={`text-xs ${textSecondary}`}>متر حفاری</p>
              </div>
              <div className={`p-4 rounded-xl border ${borderColor} ${isDark ? 'bg-[#13203A]/40' : 'bg-white/60'}`}>
                <p className={`text-sm ${textSecondary}`}>چال‌های ریزشی</p>
                <p className={`text-2xl font-bold text-red-400`}>{collapsedPoints}</p>
                <p className={`text-xs ${textSecondary}`}>نیاز به بررسی</p>
              </div>
              <div className={`p-4 rounded-xl border ${borderColor} ${isDark ? 'bg-[#13203A]/40' : 'bg-white/60'}`}>
                <p className={`text-sm ${textSecondary}`}>چال‌های تکمیل‌شده</p>
                <p className={`text-2xl font-bold text-green-400`}>{completedPoints}</p>
                <p className={`text-xs ${textSecondary}`}>از {totalPoints} چال</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowDrillingForm(true)}
                className="px-5 py-2.5 bg-[#AACCDD]/10 hover:bg-[#AACCDD]/20 text-[#AACCDD] rounded-xl transition-colors flex items-center gap-2 border border-[#AACCDD]/20"
              >
                <DocumentPlusIcon className="w-5 h-5" />
                ثبت پیشرفت روزانه
              </button>
            </div>

            <div className={`rounded-xl border ${borderColor} p-4 ${isDark ? 'bg-[#13203A]/40' : 'bg-white/60'}`}>
              <h3 className={`font-semibold mb-3 ${textPrimary}`}>نقشه نقاط حفاری</h3>
              <DrillingMap
                points={mapPoints}
                onPointClick={() => {}}
                onDepthUpdate={handleDepthUpdate}
              />
            </div>

            <div className={`rounded-xl border ${borderColor} p-4 ${isDark ? 'bg-[#13203A]/40' : 'bg-white/60'}`}>
              <h3 className={`font-semibold mb-3 ${textPrimary}`}>لیست چال‌ها</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className={`border-b ${borderColor}`}>
                      <th className={`px-3 py-2 text-xs ${textSecondary}`}>شماره</th>
                      <th className={`px-3 py-2 text-xs ${textSecondary}`}>عمق طراحی</th>
                      <th className={`px-3 py-2 text-xs ${textSecondary}`}>عمق فعلی</th>
                      <th className={`px-3 py-2 text-xs ${textSecondary}`}>وضعیت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drillingPoints.map((point) => (
                      <tr key={point.id} className={`border-b ${borderColor} last:border-0`}>
                        <td className={`px-3 py-2 text-sm ${textPrimary}`}>{point.number}</td>
                        <td className={`px-3 py-2 text-sm ${textPrimary}`}>{point.designDepth} m</td>
                        <td className={`px-3 py-2 text-sm ${textPrimary}`}>{point.finalDepth || '-'} m</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            point.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                            point.status === 'DRILLING' ? 'bg-yellow-500/20 text-yellow-400' :
                            point.status === 'COLLAPSED' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {point.status === 'PLANNED' ? 'برنامه‌ریزی' :
                             point.status === 'DRILLING' ? 'در حال حفاری' :
                             point.status === 'COMPLETED' ? 'تکمیل' :
                             point.status === 'COLLAPSED' ? 'ریزش' : point.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== تب SubBlock‌ها ===== */}
        {activeTab === 'subblocks' && (
          <div className={`rounded-xl border ${borderColor} p-4 ${isDark ? 'bg-[#13203A]/40' : 'bg-white/60'}`}>
            {subBlocks.length === 0 ? (
              <div className="text-center py-8">
                <p className={textSecondary}>هیچ SubBlockی برای این بلوک تعریف نشده است.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className={`border-b ${borderColor}`}>
                      <th className={`px-3 py-2 text-xs ${textSecondary}`}>کد</th>
                      <th className={`px-3 py-2 text-xs ${textSecondary}`}>وضعیت</th>
                      <th className={`px-3 py-2 text-xs ${textSecondary}`}>عیار (%)</th>
                      <th className={`px-3 py-2 text-xs ${textSecondary}`}>مقصد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subBlocks.map((sb) => (
                      <tr key={sb.id} className={`border-b ${borderColor} last:border-0`}>
                        <td className={`px-3 py-2 text-sm ${textPrimary}`}>{sb.code}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sb.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                            sb.status === 'DESTINATION_ASSIGNED' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {sb.status}
                          </span>
                        </td>
                        <td className={`px-3 py-2 text-sm ${textPrimary}`}>
                          {sb.labResults?.fe ? `${sb.labResults.fe}%` : '-'}
                        </td>
                        <td className={`px-3 py-2 text-sm ${textPrimary}`}>
                          {sb.destination || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== مودال ثبت پیشرفت روزانه ===== */}
      {showDrillingForm && (
        <DailyDrillingForm
          blockId={block.id}
          onSuccess={handleDailyProgress}
          onClose={() => setShowDrillingForm(false)}
        />
      )}
    </div>
  );
}