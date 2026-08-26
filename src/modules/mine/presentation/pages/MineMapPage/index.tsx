// src/modules/mine/presentation/pages/MineMapPage/index.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../../shared/context/ThemeContext';
import { Header } from '../../../../dashboard/presentation/components/Header/Header';
import { 
  BlockRepository, 
  PitRepository, 
  MineRepository 
} from '../../../../../core/infrastructure/repositories';
import { 
  ArrowRightIcon, 
  CubeIcon, 
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

export const MineMapPage: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [selectedPitId, setSelectedPitId] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [showDumps, setShowDumps] = useState<boolean>(true);
  const [showCrushers, setShowCrushers] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapMode, setMapMode] = useState<'2D_GRID' | 'TOPOGRAPHY' | 'SATELLITE'>('TOPOGRAPHY');

  const mines = MineRepository.getAll();
  const mine = mines[0] || { name: 'مجتمع معدنی سنگ‌آهن', code: 'MINE-01' };
  const pits = PitRepository.getAll();
  const blocks = BlockRepository.getAll();

  // ترازهای منحصر به‌فرد
  const benchLevels = useMemo(() => {
    const levels = Array.from(new Set(blocks.map(b => b.targetLevel).filter(Boolean)));
    return levels.sort((a, b) => b - a);
  }, [blocks]);

  // فیلتر بلوک‌ها
  const filteredBlocks = useMemo(() => {
    return blocks.filter(block => {
      const matchPit = selectedPitId === 'all' || block.pitId === selectedPitId;
      const matchLevel = selectedLevel === 'all' || block.targetLevel === selectedLevel;
      return matchPit && matchLevel;
    });
  }, [blocks, selectedPitId, selectedLevel]);

  const selectedBlock = useMemo(() => {
    return blocks.find(b => b.id === selectedBlockId || b.code === selectedBlockId) || null;
  }, [blocks, selectedBlockId]);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#0A1628] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* نوار بالایی و عنوان */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A] text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black flex items-center gap-2">
                <span>نقشه و مدل رقومی معدن</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30">
                  {mine.name}
                </span>
              </h1>
              <p className="text-xs text-[#8A9DB0]">مشاهده موقعیت پیت‌ها، پله‌ها، بلوک‌های استخراجی و مسیرهای دیسپاچینگ</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/blocks-management')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#C9A227]/20 text-[#C9A227] hover:bg-[#C9A227]/30 border border-[#C9A227]/40 flex items-center gap-1.5 transition-all"
            >
              <CubeIcon className="w-4 h-4" />
              <span>مدیریت بلوک‌ها</span>
            </button>
            <button
              onClick={() => navigate('/mining-lifecycle')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-white flex items-center gap-1.5 transition-all shadow-md shadow-[#00D4FF]/20"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>چرخه ساب‌بلوک‌ها</span>
            </button>
          </div>
        </div>

        {/* جعبه فیلترها و لایه‌ها */}
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
          isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* انتخاب پیت و تراز */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] text-[#8A9DB0] block mb-1">انتخاب پیت:</label>
              <select
                value={selectedPitId}
                onChange={(e) => setSelectedPitId(e.target.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-bold focus:outline-none ${
                  isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <option value="all">همه پیت‌ها ({pits.length || 3})</option>
                {pits.map(pit => (
                  <option key={pit.id} value={pit.id}>{pit.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#8A9DB0] block mb-1">تراز پله (Bench Level):</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className={`text-xs px-3 py-1.5 rounded-lg border font-bold focus:outline-none ${
                  isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <option value="all">همه ترازها</option>
                {benchLevels.map(lvl => (
                  <option key={lvl} value={lvl}>تراز {lvl} متر</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#8A9DB0] block mb-1">حالت نمایش:</label>
              <div className="flex items-center gap-1">
                {(['TOPOGRAPHY', '2D_GRID', 'SATELLITE'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setMapMode(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      mapMode === mode 
                        ? 'bg-[#00D4FF] text-slate-900' 
                        : isDark ? 'bg-[#0A1628] text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {mode === 'TOPOGRAPHY' ? 'توپوگرافی' : mode === '2D_GRID' ? 'شبکه سلولی' : 'ماهواره'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* سوئیچ لایه‌ها */}
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showRoads}
                onChange={(e) => setShowRoads(e.target.checked)}
                className="rounded text-[#00D4FF] focus:ring-0"
              />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>مسیرهای حمل</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showCrushers}
                onChange={(e) => setShowCrushers(e.target.checked)}
                className="rounded text-[#00D4FF] focus:ring-0"
              />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>سنگ‌شکن‌ها</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showDumps}
                onChange={(e) => setShowDumps(e.target.checked)}
                className="rounded text-[#00D4FF] focus:ring-0"
              />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>دامپ‌های باطله</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="rounded text-[#00D4FF] focus:ring-0"
              />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>کد بلوک‌ها</span>
            </label>
          </div>
        </div>

        {/* محیط بصری نقشه معدن و بوم تعاملی */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* بوم نقشه (3 ستون) */}
          <div className={`lg:col-span-3 rounded-2xl border overflow-hidden relative min-h-[520px] flex flex-col justify-between p-6 ${
            isDark ? 'bg-[#0E1A2E] border-[#2A3A5A]' : 'bg-slate-900 border-slate-800'
          }`}>
            {/* لایه پس‌زمینه توپوگرافی و منحنی‌های میزان */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.15) 0%, transparent 60%), radial-gradient(circle at 20% 30%, rgba(201, 162, 39, 0.15) 0%, transparent 50%), repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 40px, rgba(255,255,255,0.05) 41px, transparent 42px)`
            }} />

            {/* کنترل‌های زوم و راهنمای جهت شمال */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-[#0A1628]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2A3A5A]/50 text-xs">
                <span className="font-bold text-[#00D4FF]">شمال</span>
                <span className="text-[#8A9DB0]">▲ N (UTM Zone 39N)</span>
              </div>

              <div className="flex items-center gap-1 bg-[#0A1628]/80 backdrop-blur-md p-1 rounded-xl border border-[#2A3A5A]/50">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white font-black"
                >
                  +
                </button>
                <span className="text-[11px] px-2 text-[#8A9DB0]">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white font-black"
                >
                  -
                </button>
              </div>
            </div>

            {/* عناصر نقشه (شبکه بلوک‌ها و سایت‌ها) */}
            <div 
              className="relative z-10 my-auto py-10 transition-transform duration-300 flex flex-col items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* نشانگر خطوط خردایش و دپوها */}
              <div className="w-full flex items-center justify-between max-w-2xl mb-8">
                {showCrushers && (
                  <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2 shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <div>
                      <div className="font-black">خط ۱ و ۲ سنگ‌شکن اولیه</div>
                      <div className="text-[10px] text-cyan-400/80">ظرفیت: ۸۰۰ تن در ساعت</div>
                    </div>
                  </div>
                )}

                {showDumps && (
                  <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div>
                      <div className="font-black">دامپ باطله غربی (Dump #3)</div>
                      <div className="text-[10px] text-amber-400/80">تراز: ۱۲۴۰ متر</div>
                    </div>
                  </div>
                )}
              </div>

              {/* شبکه بلوک‌های استخراجی */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-2xl w-full p-4 rounded-2xl bg-[#0A1628]/60 border border-[#2A3A5A]/40 backdrop-blur-sm">
                {filteredBlocks.map((block) => {
                  const isSelected = selectedBlockId === block.id || selectedBlockId === block.code;
                  const isFinished = block.lifecycleStatus === 'COMPLETED';
                  const isDrilling = block.lifecycleStatus?.includes('DRILL');
                  const isSubBlocked = block.lifecycleStatus?.includes('SUB') || block.lifecycleStatus?.includes('CLASSIFIED');

                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-right select-none ${
                        isSelected 
                          ? 'ring-2 ring-[#00D4FF] bg-[#00D4FF]/20 border-[#00D4FF] scale-105 shadow-lg shadow-[#00D4FF]/20'
                          : isFinished
                          ? 'bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-400 text-emerald-300'
                          : isSubBlocked
                          ? 'bg-purple-950/30 border-purple-500/30 hover:border-purple-400 text-purple-300'
                          : isDrilling
                          ? 'bg-blue-950/30 border-blue-500/30 hover:border-blue-400 text-blue-300'
                          : 'bg-slate-900/60 border-slate-700/60 hover:border-[#C9A227] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8A9DB0] mb-1">
                        <span>{block.targetLevel ? `L-${block.targetLevel}` : 'T-01'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      </div>
                      <div className="font-black text-xs text-white truncate">{block.code}</div>
                      {showLabels && (
                        <div className="text-[9px] text-[#8A9DB0] mt-1 truncate">
                          {block.lifecycleStatus || 'DEFINED'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* مسیرهای حمل جاده‌ای شماتیک */}
              {showRoads && (
                <div className="w-full max-w-2xl mt-4 flex items-center justify-center gap-2 text-[11px] text-[#8A9DB0]">
                  <TruckIcon className="w-4 h-4 text-[#00D4FF]" />
                  <span>مسیر رمپ اصلی پیت به سنگ‌شکن (شیب متوسط: ۸.۵٪)</span>
                </div>
              )}
            </div>

            {/* راهنمای رنگ‌ها در پایین نقشه */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[#2A3A5A]/40 text-[11px] text-[#8A9DB0]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-500" /> تعریف شده
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> در حال حفاری
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> ساب‌بندی / طبقه‌بندی
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> استخراج شده / مصرف در خردایش
                </span>
              </div>

              <div>تعداد بلوک‌های این نما: <b className="text-white">{filteredBlocks.length}</b></div>
            </div>
          </div>

          {/* پنل اطلاعات بلوک انتخابی (1 ستون) */}
          <div className="space-y-4">
            {selectedBlock ? (
              <div className={`p-5 rounded-2xl border ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#00D4FF]/20 text-[#00D4FF]">
                    {selectedBlock.code}
                  </span>
                  <span className="text-xs text-[#8A9DB0]">تراز: {selectedBlock.targetLevel || 1205}m</span>
                </div>

                <h3 className="font-bold text-sm mb-2">{selectedBlock.name || `بلوک استخراجی ${selectedBlock.code}`}</h3>
                
                <div className="space-y-2 text-xs py-3 border-y border-[#2A3A5A]/30">
                  <div className="flex justify-between">
                    <span className="text-[#8A9DB0]">وضعیت چرخه:</span>
                    <span className="font-bold text-[#00D4FF]">{selectedBlock.lifecycleStatus || 'DEFINED'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A9DB0]">تعداد چال‌ها:</span>
                    <span className="font-bold">{selectedBlock.drillingParams?.totalHoles || 48} چال</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A9DB0]">عمق چال:</span>
                    <span className="font-bold">{selectedBlock.drillingParams?.holeDepth || 12} متر</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A9DB0]">بار سنگ و فاصله:</span>
                    <span className="font-bold">{selectedBlock.drillingParams?.burden || 3.5}m × {selectedBlock.drillingParams?.spacing || 4.2}m</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => navigate('/mining-lifecycle')}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-white flex items-center justify-center gap-1.5 shadow-md shadow-[#00D4FF]/20"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>مشاهده چرخه و ساب‌بلوک‌ها</span>
                  </button>

                  <button
                    onClick={() => navigate('/blocks-management')}
                    className={`w-full py-2 rounded-xl text-xs font-bold border transition-colors ${
                      isDark ? 'bg-[#0A1628] border-[#2A3A5A] text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    ویرایش در مدیریت بلوک‌ها
                  </button>
                </div>
              </div>
            ) : (
              <div className={`p-6 rounded-2xl border text-center ${
                isDark ? 'bg-[#13233C] border-[#2A3A5A] text-[#8A9DB0]' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <CubeIcon className="w-10 h-10 mx-auto mb-2 text-[#8A9DB0]/50" />
                <p className="text-xs font-bold">بلوکی را بر روی نقشه انتخاب کنید</p>
                <p className="text-[11px] mt-1 text-[#8A9DB0]/80">اطلاعات ژئومتری، پارامترهای حفاری و وضعیت ساب‌بلوک‌ها در این پنل نمایش داده می‌شود.</p>
              </div>
            )}

            {/* کارت راهنمای نقشه */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#13233C]/60 border-[#2A3A5A]' : 'bg-white border-slate-200'
            }`}>
              <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-[#C9A227]" />
                <span>نکات بهره‌برداری پیت</span>
              </h4>
              <ul className="text-[11px] text-[#8A9DB0] space-y-1.5 list-disc list-inside">
                <li>پایش پیوسته شیب پله‌ها و دیواره نهایی پیت</li>
                <li>تطابق عیار پودر چال با مدل بلوکی قبل از بارگیری</li>
                <li>تغذیه سنگ‌شکن بر اساس استاندارد Fe بالای ۵۲٪</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MineMapPage;
